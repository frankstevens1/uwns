"use client";

import type { AuthContextValue, TrackEventArgs } from "@repo/providers";

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

  sendEmailOtp: (args: {
    email: string;
    emailRedirectTo?: string;
    shouldCreateUser?: boolean;
  }) => Promise<{ error?: { message: string } | null }>;

  verifyEmailOtp: (args: {
    email: string;
    token: string;
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

type AuthTrackingOptions = {
  flow: "login" | "sign-up";
  trackEvent: (args: TrackEventArgs) => Promise<void>;
};

export function toUiAuthClient(
  auth: AuthContextValue,
  tracking?: AuthTrackingOptions,
): UiAuthClient {
  return {
    signInWithPassword: async ({ email, password }) => {
      try {
        // provider: signInWithPassword({ email, password })
        await auth.signInWithPassword({ email, password });
        await tracking?.trackEvent({
          eventName: "logged_in",
          metadata: { authMethod: "password" },
        });
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },

    signUp: async ({ email, password /* emailRedirectTo ignored */ }) => {
      try {
        // ✅ provider: signUpWithPassword({ email, password })
        await auth.signUpWithPassword({ email, password });
        await tracking?.trackEvent({
          eventName: "signed_up",
          metadata: { authMethod: "password" },
        });
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },

    sendEmailOtp: async ({ email, emailRedirectTo, shouldCreateUser }) => {
      try {
        await auth.sendEmailOtp({ email, emailRedirectTo, shouldCreateUser });
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },

    verifyEmailOtp: async ({ email, token }) => {
      try {
        await auth.verifyEmailOtp({ email, token });
        await tracking?.trackEvent({
          eventName: tracking.flow === "sign-up" ? "signed_up" : "logged_in",
          metadata: { authMethod: "otp" },
        });
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
        await tracking?.trackEvent({
          eventName: "signed_out",
          metadata: { trigger: "auth_client" },
        });
        await auth.signOut?.();
        return { error: null };
      } catch (e) {
        return { error: { message: toMsg(e) } };
      }
    },
  };
}
