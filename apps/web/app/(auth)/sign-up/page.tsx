"use client";

import { SignUpForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function SignUpPage() {
  const { auth, notify, navigate } = useWebAuthWiring();

  return (
    <SignUpForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        afterSignUp: "/check-email",
        login: "/login",
      }}
    />
  );
}
