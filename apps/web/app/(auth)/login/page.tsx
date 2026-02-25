"use client";

import { LoginForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function LoginPage() {
  const { auth, notify, navigate } = useWebAuthWiring();

  return (
    <LoginForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        forgotPassword: "/forgot-password",
        signUp: "/sign-up",
      }}
    />
  );
}
