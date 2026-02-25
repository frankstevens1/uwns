export type UpdatePasswordFormProps = {
  auth: {
    updateUserPassword: (args: { password: string }) => Promise<{ error?: { message: string } | null }>;
  };

  notify?: {
    success?: (title: string, opts?: { description?: string }) => void;
    error?: (title: string, opts?: { description?: string }) => void;
  };

  navigate?: (path: string) => void;

  routes?: {
    afterUpdate?: string; // default "/auth/login"
  };
};
