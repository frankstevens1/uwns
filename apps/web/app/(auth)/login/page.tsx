"use client";

import { LoginForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function LoginPage() {
  const { auth, notify, navigate } = useWebAuthWiring();
  const emailRedirectTo =
    typeof window === "undefined" ? undefined : `${window.location.origin}/app`;

  return (
    <LoginForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      emailRedirectTo={emailRedirectTo}
      routes={{
        forgotPassword: "/forgot-password",
        signUp: "/sign-up",
      }}
    />
  );
}
