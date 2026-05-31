"use client";

import * as React from "react";
import { Code, CodeBlock, Tip } from "@repo/ui";
import { useActivity } from "@repo/providers";
import { useTheme } from "next-themes";
import { SignedInIdentity } from "./SignedInIdentity";

const signedInIdentityExample = `"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ReadOnlyInput,
} from "@repo/ui";
import { useActivity, useAuth } from "@repo/providers";

export function SignedInIdentity() {
  const { user, loading, signOut } = useAuth();
  const { trackEvent } = useActivity();
  const [busy, setBusy] = React.useState(false);

  const handleSignOut = async () => {
    if (busy) return;

    setBusy(true);
    try {
      await trackEvent({
        eventName: "signed_out",
        metadata: { trigger: "account_card" },
      });
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <div className="text-sm font-medium">Signed-in identity</div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <ReadOnlyInput
            label="Email"
            value={user?.email}
            loading={loading}
            size="md"
          />
          <ReadOnlyInput
            label="User ID"
            value={user?.id}
            loading={loading}
            size="md"
          />
        </div>
      </CardBody>
      <CardFooter>
        <Button
          onPress={handleSignOut}
          disabled={loading || !user || busy}
          variant="primary"
        >
          {busy ? "Signing out..." : "Sign out"}
        </Button>
      </CardFooter>
    </Card>
  );
}`;

export default function AccountPage() {
  const { resolvedTheme } = useTheme();
  const { trackEvent } = useActivity();

  React.useEffect(() => {
    void trackEvent({
      eventName: "account_viewed",
      uniqueKey: "web:account_viewed",
      metadata: {
        source: "account",
        screen: "account_page",
        trigger: "first_page_visit",
      },
    });
  }, [trackEvent]);

  return (
    <section className="space-y-6 pb-14">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Account</h2>
        <p className="max-w-2xl text-sm text-(--ui-muted-fg)">
          A minimal user-specific route showing authenticated data from Supabase.
        </p>
      </header>

      <div className="lg:grid space-y-6 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SignedInIdentity />
          <Tip>
            Use <Code>@repo/providers</Code> for auth state and compose it with
            shared <Code>@repo/ui</Code> primitives to build matching web and
            native components from the same building blocks.
          </Tip>
        </div>
        <div className="lg:col-span-2">
          <CodeBlock
            code={signedInIdentityExample}
            filename="SignedInIdentity.web.tsx"
            language="tsx"
            showLineNumbers={false}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
          />
        </div>
      </div>
    </section>
  );
}
