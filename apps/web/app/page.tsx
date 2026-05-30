"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@repo/ui";
import { useAuth } from "@repo/providers";

export default function Home() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const onSignOut = async () => {
    if (loading) return;
    try {
      await signOut();
    } catch {
      // Handle error
    }
  };

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Unified Web Native Stack (UWNS)</h1>
        <p className="text-(--ui-muted-fg)">
          A Turbo monorepo for building Next.js and Expo apps with shared
          providers, reusable UI, and platform-specific app structure.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {loading ? (
          <Button disabled>Loading…</Button>
        ) : user ? (
          <>
            <Button variant="ghost" onPress={() => router.push("/app")}>
              Continue to app
            </Button>
            <Button variant="primary" onPress={onSignOut}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" onPress={() => router.push("/login")}>
              Sign in
            </Button>
            <Button variant="ghost" onPress={() => router.push("/sign-up")}>
              Create account
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card padding="none">
          <CardHeader>
            <div className="text-sm font-medium">Shared brain</div>
            <div className="mt-1 text-sm text-(--ui-muted-fg)">
              Same providers & types as native.
            </div>
          </CardHeader>
          <CardBody padding="sm">
            <div className="text-sm text-(--ui-muted-fg)">
              Auth state, types and shared logic live in packages.
            </div>
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader>
            <div className="text-sm font-medium">Web-first UX</div>
            <div className="mt-1 text-sm text-(--ui-muted-fg)">
              App Router, layouts, fast iteration.
            </div>
          </CardHeader>
          <CardBody padding="sm">
            <div className="text-sm text-(--ui-muted-fg)">
              Server components where it makes sense, client where it needs interactivity.
            </div>
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader>
            <div className="text-sm font-medium">Same family</div>
            <div className="mt-1 text-sm text-(--ui-muted-fg)">
              Consistent tokens, spacing, tone.
            </div>
          </CardHeader>
          <CardBody padding="sm">
            <div className="text-sm text-(--ui-muted-fg)">
              A single UI package exports platform-specific implementations.
            </div>
          </CardBody>
        </Card>
      </div>

      <Card padding="none" variant="subtle">
        <CardHeader divider={false}>
          <div className="text-sm font-medium">Boilerplate orientation</div>
        </CardHeader>
        <CardBody padding="sm">
          <div className="text-sm text-(--ui-muted-fg) space-y-2">
            <p>
              Start by replacing the{" "}
              <code className="rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) px-1 py-px font-mono text-[0.92em] text-(--ui-fg)">
                /
              </code>{" "}
              with your landing page content and{" "}
              <code className="rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) px-1 py-px font-mono text-[0.92em] text-(--ui-fg)">
                /app
              </code>{" "}
              with your product’s core flows.
            </p>
            <p>
              Keep shared app providers in{" "}
              <code className="rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) px-1 py-px font-mono text-[0.92em] text-(--ui-fg)">@repo/providers</code>,
              reusable UI in{" "}
              <code className="rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) px-1 py-px font-mono text-[0.92em] text-(--ui-fg)">@repo/ui</code>,
              and route definitions inside each app.
            </p>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
