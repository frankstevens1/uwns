"use client";

import type { AuthContextValue } from "@repo/providers";

export type UiAuthClient = {
  signInWithPassword: (args: {
    email: string;
    password: string;
  }) => Promise<{ error?: { message: string } | null }>;

  signUp: (args: {
    email: string;
    password: string;
    emailRedirectTo?: string;
  }) => Promise<{ error?: { message: string } | null }>;

  resetPasswordForEmail: (args: {
    email: string;
    redirectTo?: string;
  }) => Promise<{ error?: { message: string } | null }>;

  updateUserPassword: (args: {
    password: string;
  }) => Promise<{ error?: { message: string } | null }>;

  signOut?: () => Promise<{ error?: { message: string } | null }>;
};

function toMsg(e: unknown) {
  return e instanceof Error ? e.message : "An error occurred";
}

export function toUiAuthClient(auth: AuthContextValue): UiAuthClient {
  return {
    signInWithPassword: async ({ email, password }) => {
      try {
        // provider: signInWithPassword({ email, password })
        await auth.signInWithPassword({ email, password });
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },

    signUp: async ({ email, password /* emailRedirectTo ignored */ }) => {
      try {
        // ✅ provider: signUpWithPassword({ email, password })
        await auth.signUpWithPassword({ email, password });
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },

    resetPasswordForEmail: async ({ email /* redirectTo ignored */ }) => {
      try {
        // ✅ provider: resetPasswordForEmail(email: string)
        await auth.resetPasswordForEmail(email);
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },

    updateUserPassword: async ({ password }) => {
      try {
        // ✅ provider: updatePassword(password: string)
        await auth.updatePassword(password);
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },

    signOut: async () => {
      try {
        await auth.signOut?.();
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },
  };
}
