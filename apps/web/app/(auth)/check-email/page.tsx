"use client";

import * as React from "react";
import { getMailboxUrl, PasswordResetCheckEmailForm, Welcome } from "@repo/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebAuthWiring } from "@/lib/webAuthProps";

function CheckEmailContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { auth, notify, navigate } = useWebAuthWiring();
  const email = sp.get("email") ?? undefined;
  const type = sp.get("type");
  const mailboxUrl = email ? getMailboxUrl(email) : undefined;
  const redirectTo =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}/update-password`;

  if (type === "recovery") {
    return (
      <PasswordResetCheckEmailForm
        auth={auth}
        email={email}
        notify={notify}
        navigate={navigate}
        redirectTo={redirectTo}
        routes={{
          login: "/login",
          updatePassword: "/update-password",
        }}
        onOpenMailbox={
          mailboxUrl
            ? () => {
                window.open(mailboxUrl, "_blank", "noopener,noreferrer");
              }
            : undefined
        }
      />
    );
  }

  return (
    <Welcome
      email={email}
      title="Check your email"
      description="We’ve sent you a link to continue."
      onOpenMailbox={
        mailboxUrl
          ? () => {
              window.open(mailboxUrl, "_blank", "noopener,noreferrer");
            }
          : undefined
      }
      onContinue={() => router.push("/login")}
    />
  );
}

export default function CheckEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <CheckEmailContent />
    </React.Suspense>
  );
}
