"use client";

import { SignUpForm, normalizeAuthMethodParam } from "@repo/ui";
import { useSearchParams } from "next/navigation";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function SignUpPage() {
  const { auth, notify, navigate } = useWebAuthWiring("sign-up");
  const searchParams = useSearchParams();
  const authMethod = normalizeAuthMethodParam(searchParams.get("authMethod"));
  const emailRedirectTo =
    typeof window === "undefined" ? undefined : `${window.location.origin}/app`;

  return (
    <SignUpForm
      auth={auth}
      authMethod={authMethod}
      notify={notify}
      navigate={navigate}
      emailRedirectTo={emailRedirectTo}
      routes={{
        afterSignUp: "/check-email",
        afterOtpVerify: "/app",
        login: "/login",
      }}
    />
  );
}
