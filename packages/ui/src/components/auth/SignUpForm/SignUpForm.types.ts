export type SignUpFormProps = {
  auth: {
    signUp: (args: { email: string; password: string; emailRedirectTo?: string }) => Promise<{ error?: { message: string } | null }>;
  };

  notify?: {
    success?: (title: string, opts?: { description?: string }) => void;
    error?: (title: string, opts?: { description?: string }) => void;
  };

  navigate?: (path: string) => void;

  routes?: {
    afterSignUp?: string; // default "/auth/welcome"
    login?: string;       // default "/auth/login"
  };

  /**
   * Web can pass window.origin-based redirect here.
   * Native can pass a deep-link base.
   */
  emailRedirectTo?: string;
};
