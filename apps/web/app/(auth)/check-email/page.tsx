"use client";

import * as React from "react";
import { Welcome } from "@repo/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { getMailboxUrl } from "@repo/ui";

function CheckEmailContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get("email") ?? undefined;

  return (
    <Welcome
      email={email}
      title="Check your email"
      description="We’ve sent you a link to continue."
      onOpenMailbox={
        email ? () => window.open(getMailboxUrl(email), "_blank", "noopener,noreferrer") : undefined
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
