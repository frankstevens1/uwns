"use client";

import { SignUpForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function SignUpPage() {
  const { auth, notify, navigate } = useWebAuthWiring();
  const emailRedirectTo =
    typeof window === "undefined" ? undefined : `${window.location.origin}/app`;

  return (
    <SignUpForm
      auth={auth}
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
