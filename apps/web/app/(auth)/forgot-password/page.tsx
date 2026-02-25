"use client";

import { ForgotPasswordForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function ForgotPasswordPage() {
  const { auth, notify, navigate } = useWebAuthWiring();

  return (
    <ForgotPasswordForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        afterRequest: "/check-email",
        login: "/login",
      }}
    />
  );
}
