export type PasswordResetCheckEmailFormProps = {
  auth: {
    verifyPasswordResetOtp: (args: {
      email: string;
      token: string;
    }) => Promise<{ error?: { message: string } | null }>;
    resetPasswordForEmail?: (args: {
      email: string;
      redirectTo?: string;
    }) => Promise<{ error?: { message: string } | null }>;
  };

  email?: string;
  redirectTo?: string;
  onOpenMailbox?: () => void | Promise<void>;

  notify?: {
    success?: (title: string, opts?: { description?: string }) => void;
    error?: (title: string, opts?: { description?: string }) => void;
  };

  navigate?: (path: string) => void;

  routes?: {
    login?: string;
    updatePassword?: string;
  };
};
