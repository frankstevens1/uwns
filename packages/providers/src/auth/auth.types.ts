import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

export type AuthUser = User;

export type AuthContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;

  signInWithPassword: (args: { email: string; password: string }) => Promise<void>;
  signUpWithPassword: (args: { email: string; password: string }) => Promise<void>;
  sendEmailOtp: (args: {
    email: string;
    emailRedirectTo?: string;
    shouldCreateUser?: boolean;
  }) => Promise<void>;
  verifyEmailOtp: (args: { email: string; token: string }) => Promise<void>;
  signOut: () => Promise<void>;

  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};
