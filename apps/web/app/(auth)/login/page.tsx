"use client";

import * as React from "react";
import { LoginForm, normalizeAuthMethodParam } from "@repo/ui";
import { useAuth } from "@repo/providers";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildLoginEmailRedirectTo,
  sanitizeLoginRedirect,
} from "@/lib/authRedirect";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function LoginPage() {
  const { auth, notify, navigate } = useWebAuthWiring();
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authMethod = normalizeAuthMethodParam(searchParams.get("authMethod"));
  const redirectTo = sanitizeLoginRedirect(searchParams.get("redirectTo"));
  const emailRedirectTo =
    typeof window === "undefined"
      ? undefined
      : buildLoginEmailRedirectTo(
          window.location.origin,
          redirectTo,
          authMethod,
        );

  React.useEffect(() => {
    if (loading || !user) return;
    router.replace(redirectTo);
  }, [loading, redirectTo, router, user]);

  return (
    <LoginForm
      auth={auth}
      authMethod={authMethod}
      notify={notify}
      navigate={navigate}
      redirectTo={redirectTo}
      emailRedirectTo={emailRedirectTo}
      routes={{
        forgotPassword: "/forgot-password",
        signUp: "/sign-up",
      }}
    />
  );
}
