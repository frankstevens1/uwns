import type { AuthFocusField } from "../LoginForm/LoginForm.types";

export type ForgotPasswordFormProps = {
  auth: {
    resetPasswordForEmail: (args: { email: string; redirectTo?: string }) => Promise<{ error?: { message: string } | null }>;
  };

  notify?: {
    success?: (title: string, opts?: { description?: string }) => void;
    error?: (title: string, opts?: { description?: string }) => void;
  };

  navigate?: (path: string) => void;

  routes?: {
    afterRequest?: string; // default "/auth/welcome"
    login?: string;        // default "/auth/login"
  };

  /**
   * Focuses the email field on mount when present.
   */
  initialFocus?: AuthFocusField;

  /**
   * Web: `${window.location.origin}/auth/update-password`
   * Native: deep link to update password screen
   */
  redirectTo?: string;
};
