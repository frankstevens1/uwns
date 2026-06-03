import type { AuthFocusField, AuthMethod, AuthMethodMode } from "../LoginForm/LoginForm.types";

type AuthResult = Promise<{ error?: { message: string } | null }>;

export type SignUpFormProps = {
  auth: {
    signUp: (args: { email: string; password: string; emailRedirectTo?: string }) => AuthResult;
    sendEmailOtp?: (args: {
      email: string;
      emailRedirectTo?: string;
      shouldCreateUser?: boolean;
    }) => AuthResult;
    verifyEmailOtp?: (args: { email: string; token: string }) => AuthResult;
  };

  notify?: {
    success?: (title: string, opts?: { description?: string }) => void;
    error?: (title: string, opts?: { description?: string }) => void;
  };

  navigate?: (path: string) => void;

  routes?: {
    afterSignUp?: string; // default "/auth/welcome"
    afterOtpVerify?: string; // default "/"
    login?: string;       // default "/auth/login"
  };

  /**
   * Web can pass window.origin-based redirect here.
   * Native can pass a deep-link base.
   */
  emailRedirectTo?: string;

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
};
