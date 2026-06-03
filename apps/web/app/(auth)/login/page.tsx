"use client";

import { LoginForm, normalizeAuthMethodParam } from "@repo/ui";
import { useSearchParams } from "next/navigation";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function LoginPage() {
  const { auth, notify, navigate } = useWebAuthWiring();
  const searchParams = useSearchParams();
  const authMethod = normalizeAuthMethodParam(searchParams.get("authMethod"));
  const emailRedirectTo =
    typeof window === "undefined" ? undefined : `${window.location.origin}/app`;

  return (
    <LoginForm
      auth={auth}
      authMethod={authMethod}
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
