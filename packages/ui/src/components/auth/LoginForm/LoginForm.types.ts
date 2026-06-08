import type { AuthFocusField } from "../authFocus";

export type { AuthFocusField } from "../authFocus";

export type AuthMethod = "password" | "otp";
export type AuthMethodMode = AuthMethod | "both";

type AuthResult = Promise<{ error?: { message: string } | null }>;

export type LoginFormProps = {
  auth: {
    signInWithPassword: (args: {
      email: string;
      password: string;
    }) => AuthResult;
    sendEmailOtp?: (args: {
      email: string;
      emailRedirectTo?: string;
      shouldCreateUser?: boolean;
    }) => AuthResult;
    verifyEmailOtp?: (args: { email: string; token: string }) => AuthResult;
  };

  navigate?: (path: string) => void;

  /**
   * Destination after a successful password or OTP login.
   */
  redirectTo?: string;

  notify?: {
    success?: (title: string, opts?: { description?: string }) => void;
    error?: (title: string, opts?: { description?: string }) => void;
  };

  routes?: {
    forgotPassword?: string; // default "/auth/forgot-password"
    signUp?: string; // default "/auth/sign-up"
  };

  /**
   * Controls which auth methods are available. OTP is available only when the
   * auth client provides sendEmailOtp + verifyEmailOtp.
   */
  authMethods?: AuthMethodMode;

  /**
   * Selects the initially active method when authMethods is "both".
   */
  authMethod?: AuthMethod;

  /**
   * Focuses the matching input on mount when present.
   */
  initialFocus?: AuthFocusField;

  /**
   * Web can pass window.origin-based redirect here.
   * Native can pass a deep-link target.
   */
  emailRedirectTo?: string;
};
