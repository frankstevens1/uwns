"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@repo/ui";
import { useAuth } from "@repo/providers";

export default function AppHome() {
  const router = useRouter();
  const { user, session, loading, signOut } = useAuth();
  const [busy, setBusy] = React.useState(false);

  const status = loading ? "Loading…" : user ? "Signed in" : "Signed out";

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
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-neutral-600">
          Authenticated area using shared providers + shared UI semantics.
        </p>
      </header>

      <Card padding="none" elevation="sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Session</div>
              <div className="mt-1 text-sm text-neutral-600">
                Current auth state from{" "}
                <span className="font-medium">@repo/providers</span>.
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              Status:{" "}
              <span
                className={
                  loading
                    ? "text-neutral-500"
                    : user
                      ? "text-emerald-600"
                      : "text-neutral-500"
                }
              >
                {status}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-sm">
              <div className="text-neutral-500">Email</div>
              <div className="mt-1 font-medium text-neutral-800">
                {user?.email ?? (loading ? "…" : "—")}
              </div>
            </div>

            <div className="text-sm">
              <div className="text-neutral-500">User ID</div>
              <div className="mt-1 font-medium text-neutral-800 truncate">
                {user?.id ?? (loading ? "…" : "—")}
              </div>
            </div>

            <div className="text-sm">
              <div className="text-neutral-500">Session</div>
              <div className="mt-1 font-medium text-neutral-800">
                {session ? "Active" : loading ? "…" : "None"}
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onPress={() => router.push("/")}>
              Back home
            </Button>

            <Button
              onPress={onSignOut}
              disabled={loading || !user || busy}
              variant="primary"
            >
              {busy ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card padding="none" variant="subtle">
        <CardHeader divider={false}>
          <div className="text-sm font-medium">What this page demonstrates</div>
        </CardHeader>
        <CardBody padding="sm">
          <ul className="list-inside list-disc space-y-1 text-sm text-neutral-700">
            <li>Shared providers across web + native</li>
            <li>Shared UI primitives with platform implementations</li>
            <li>
              Cross-platform event prop:{" "}
              <span className="font-medium">onPress</span>
            </li>
            <li>Route gating (unauthenticated users go to /login)</li>
          </ul>
        </CardBody>
      </Card>
    </section>
  );
}
