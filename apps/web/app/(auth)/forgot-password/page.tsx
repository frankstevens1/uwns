"use client";

import { ForgotPasswordForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function ForgotPasswordPage() {
  const { auth, notify, navigate } = useWebAuthWiring();
  const redirectTo =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}/update-password`;

  return (
    <ForgotPasswordForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      redirectTo={redirectTo}
      routes={{
        afterRequest: "/check-email?type=recovery",
        login: "/login",
      }}
    />
  );
}
