"use client";

import * as React from "react";
import type { Session } from "@supabase/supabase-js";
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

async function applyAuthUrl(supabase: any, url: string) {
  const params = getAuthUrlParams(url);
  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    return;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error(error.message);
  }
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

export function createAuthProvider(
  createSupabaseClient: () => any,
  authUrlEvents?: AuthUrlEvents
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
          if (error) console.warn("[AuthProvider] getSession error:", error.message);
          setSession(data.session ?? null);
          setLoading(false);
        })
        .catch((err: any) => {
          if (!mounted) return;
          console.warn("[AuthProvider] getSession exception:", String(err));
          setLoading(false);
        });

      const { data: sub } = supabase.auth.onAuthStateChange((_event: any, nextSession: any) => {
        if (!mounted) return;
        setSession(nextSession);
      });

      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    }, [supabase]);

    React.useEffect(() => {
      if (!authUrlEvents) return;

      let mounted = true;

      const handleUrl = (url: string) => {
        applyAuthUrl(supabase, url).catch((err: any) => {
          if (!mounted) return;
          console.warn("[AuthProvider] auth URL error:", err instanceof Error ? err.message : String(err));
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
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw new Error(error.message);
        },

        async signUpWithPassword({ email, password }) {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) throw new Error(error.message);
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
          const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
          });
          if (error) throw new Error(error.message);
        },

        async signOut() {
          const { error } = await supabase.auth.signOut();
          if (error) throw new Error(error.message);
        },

        async resetPasswordForEmail(email) {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw new Error(error.message);
        },

        async updatePassword(newPassword) {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw new Error(error.message);
        }
      }),
      [supabase, session, user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
  }

  return { AuthProvider, useAuth };
}
