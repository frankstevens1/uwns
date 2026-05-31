"use client";

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
}
