"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@repo/ui";
import { useAuth } from "@repo/providers";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    if (!value || value === "-" || value === "...") return;

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-1 text-sm">
      <div className="text-(--ui-muted-fg)">{label}</div>
      <div className="flex h-[34px] items-center gap-2 rounded-md border border-(--ui-border) bg-(--ui-bg) pl-3 pr-1">
        <div className="min-w-0 flex-1 truncate font-medium text-(--ui-fg)">
          {value}
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!value || value === "-" || value === "..."}
          className="h-7 shrink-0 rounded px-2 text-xs font-semibold text-(--ui-muted-fg) hover:text-(--ui-fg) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, session, loading, signOut } = useAuth();
  const [busy, setBusy] = React.useState(false);

  const onSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Account</h2>
        <p className="max-w-2xl text-sm text-(--ui-muted-fg)">
          A user-specific page for identity, session state, and account actions.
        </p>
      </header>

      <Card padding="none" elevation="sm">
        <CardHeader>
          <div className="text-sm font-medium">Signed-in identity</div>
          <div className="mt-1 text-sm text-(--ui-muted-fg)">
            Current auth state from <span className="font-medium">@repo/providers</span>.
          </div>
        </CardHeader>

        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <CopyField label="Email" value={user?.email ?? (loading ? "..." : "-")} />
            <CopyField label="User ID" value={user?.id ?? (loading ? "..." : "-")} />
            <CopyField
              label="Session"
              value={session ? "Active" : loading ? "..." : "None"}
            />
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onPress={() => router.push("/app")}>
              Back to app
            </Button>

            <Button
              onPress={onSignOut}
              disabled={loading || !user || busy}
              variant="primary"
            >
              {busy ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card padding="none" variant="subtle">
        <CardHeader divider={false}>
          <div className="text-sm font-medium">What this page demonstrates</div>
        </CardHeader>
        <CardBody padding="sm">
          <ul className="list-inside list-disc space-y-1 text-sm text-(--ui-muted-fg)">
            <li>User-specific account data lives under /app/account.</li>
            <li>Shared providers expose auth state without app-local Supabase code.</li>
            <li>Shared UI primitives keep the account surface consistent across themes.</li>
          </ul>
        </CardBody>
      </Card>
    </section>
  );
}
