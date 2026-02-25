export type LoginFormProps = {

  auth: {
    signInWithPassword: (args: { email: string; password: string }) => Promise<{ error?: { message: string } | null }>;
  };

  navigate?: (path: string) => void;

  notify?: {
    success?: (title: string, opts?: { description?: string }) => void;
    error?: (title: string, opts?: { description?: string }) => void;
  };

  routes?: {
    forgotPassword?: string;          // default "/auth/forgot-password"
    signUp?: string;                  // default "/auth/sign-up"
  };
};
