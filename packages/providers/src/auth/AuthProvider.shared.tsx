"use client";

import * as React from "react";
import type { EmailOtpType, Session } from "@supabase/supabase-js";
import type { AuthContextValue } from "./auth.types";

type AuthUrlEvents = {
  getInitialUrl: () => Promise<string | null>;
  subscribe: (handler: (url: string) => void) => { remove: () => void };
};

function getAuthUrlParams(url: string) {
  const params = new URLSearchParams();
  const query = url.split("?")[1]?.split("#")[0];
  const hash = url.split("#")[1];

  for (const part of [query, hash]) {
    if (!part) continue;
    new URLSearchParams(part).forEach((value, key) => params.set(key, value));
  }

  return params;
}

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return (
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"
  );
}

async function applyAuthUrl(supabase: any, url: string) {
  const params = getAuthUrlParams(url);
  const tokenHash = params.get("token_hash");
  const otpType = params.get("type");
  if (tokenHash && isEmailOtpType(otpType)) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) throw new Error(error.message);
    return data.session ?? null;
  }

  const code = params.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    return data.session ?? null;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error(error.message);
    return data.session ?? null;
  }

  return undefined;
}

function normalizeAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message === "Load failed" ||
    message === "Network request failed" ||
    message === "Failed to fetch"
  ) {
    return "Could not reach Supabase Auth. Check that Supabase is running and the app Supabase URL matches supabase/config.toml.";
  }
  return message;
}

function isInvalidRefreshTokenError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Invalid Refresh Token") ||
    message.includes("Refresh Token Not Found")
  );
}

async function clearLocalAuthSession(supabase: any) {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error && !isInvalidRefreshTokenError(error)) {
    throw new Error(error.message);
  }
}

export function createAuthProvider(
  createSupabaseClient: () => any,
  authUrlEvents?: AuthUrlEvents,
) {
  const AuthContext = React.createContext<AuthContextValue | null>(null);

  function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = React.useMemo(() => createSupabaseClient(), []);

    const [loading, setLoading] = React.useState(true);
    const [session, setSession] = React.useState<Session | null>(null);

    const user = session?.user ?? null;

    React.useEffect(() => {
      let mounted = true;

      supabase.auth
        .getSession()
        .then(({ data, error }: any) => {
          if (!mounted) return;
          if (error) {
            if (isInvalidRefreshTokenError(error)) {
              clearLocalAuthSession(supabase).catch((err) => {
                console.warn(
                  "[AuthProvider] stale session cleanup error:",
                  err instanceof Error ? err.message : String(err),
                );
              });
            } else {
              console.warn("[AuthProvider] getSession error:", error.message);
            }
          }
          setSession(data.session ?? null);
          setLoading(false);
        })
        .catch((err: any) => {
          if (!mounted) return;
          if (isInvalidRefreshTokenError(err)) {
            clearLocalAuthSession(supabase).catch((cleanupErr) => {
              console.warn(
                "[AuthProvider] stale session cleanup error:",
                cleanupErr instanceof Error
                  ? cleanupErr.message
                  : String(cleanupErr),
              );
            });
          } else {
            console.warn("[AuthProvider] getSession exception:", String(err));
          }
          setLoading(false);
        });

      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event: any, nextSession: any) => {
          if (!mounted) return;
          setSession(nextSession);
        },
      );

      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    }, [supabase]);

    React.useEffect(() => {
      if (authUrlEvents) return;
      if (typeof window === "undefined") return;

      const url = window.location.href;
      if (!url.includes("code=") && !url.includes("token_hash=")) return;

      applyAuthUrl(supabase, url)
        .then((nextSession) => {
          if (nextSession !== undefined) setSession(nextSession);
        })
        .catch((err: any) => {
          console.warn(
            "[AuthProvider] auth URL error:",
            err instanceof Error ? err.message : String(err),
          );
        });
    }, [supabase]);

    React.useEffect(() => {
      if (!authUrlEvents) return;

      let mounted = true;

      const handleUrl = (url: string) => {
        applyAuthUrl(supabase, url)
          .then((nextSession) => {
            if (mounted && nextSession !== undefined) setSession(nextSession);
          })
          .catch((err: any) => {
            if (!mounted) return;
            console.warn(
              "[AuthProvider] auth URL error:",
              err instanceof Error ? err.message : String(err),
            );
          });
      };

      authUrlEvents
        .getInitialUrl()
        .then((url) => {
          if (mounted && url) handleUrl(url);
        })
        .catch((err: any) => {
          if (!mounted) return;
          console.warn("[AuthProvider] initial URL error:", String(err));
        });

      const subscription = authUrlEvents.subscribe(handleUrl);

      return () => {
        mounted = false;
        subscription.remove();
      };
    }, [supabase]);

    const value = React.useMemo<AuthContextValue>(
      () => ({
        supabase,
        session,
        user,
        loading,

        async signInWithPassword({ email, password }) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw new Error(error.message);
          setSession(data.session ?? null);
        },

        async signUpWithPassword({ email, password }) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw new Error(error.message);
          if (data.session) setSession(data.session);
        },

        async sendEmailOtp({ email, emailRedirectTo, shouldCreateUser }) {
          try {
            const options: {
              emailRedirectTo?: string;
              shouldCreateUser?: boolean;
            } = {};
            if (emailRedirectTo) options.emailRedirectTo = emailRedirectTo;
            if (typeof shouldCreateUser === "boolean") {
              options.shouldCreateUser = shouldCreateUser;
            }

            const { error } = await supabase.auth.signInWithOtp({
              email,
              options,
            });
            if (error) throw new Error(error.message);
          } catch (error) {
            throw new Error(normalizeAuthError(error));
          }
        },

        async verifyEmailOtp({ email, token }) {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
          });
          if (error) throw new Error(error.message);
          setSession(data.session ?? null);
        },

        async verifyPasswordResetOtp({ email, token }) {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "recovery",
          });
          if (error) throw new Error(error.message);
          setSession(data.session ?? null);
        },

        async signOut() {
          const { error } = await supabase.auth.signOut();
          if (!error) {
            setSession(null);
            return;
          }
          if (isInvalidRefreshTokenError(error)) {
            await clearLocalAuthSession(supabase);
            setSession(null);
            return;
          }
          throw new Error(error.message);
        },

        async resetPasswordForEmail(email, redirectTo) {
          const options = redirectTo ? { redirectTo } : undefined;
          const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            options,
          );
          if (error) throw new Error(error.message);
        },

        async updatePassword(newPassword) {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) throw new Error(error.message);
        },
      }),
      [supabase, session, user, loading],
    );

    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  }

  function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
  }

  return { AuthProvider, useAuth };
}
