"use client";

import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import type { AuthContextValue } from "./auth.types";

export function createAuthProvider(createSupabaseClient: () => any) {
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
