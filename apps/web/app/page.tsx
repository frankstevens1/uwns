"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@repo/ui";
import { useAuth } from "@repo/providers";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">df</h1>
        <p className="max-w-prose text-neutral-600">
          Native + Web, one product family. Next.js + Expo share state and UI semantics
          through a single monorepo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {loading ? (
          <Button disabled>Loading…</Button>
        ) : user ? (
          <>
            <Button variant="primary" onPress={() => router.push("/app")}>
              Continue to app
            </Button>
            <Button variant="ghost" onPress={() => router.push("/app")}>
              Dashboard
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

        <Button variant="ghost" onPress={() => router.push("/pricing")}>
          Pricing
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card padding="none">
          <CardHeader>
            <div className="text-sm font-medium">Shared brain</div>
            <div className="mt-1 text-sm text-neutral-600">
              Same providers & types as native.
            </div>
          </CardHeader>
          <CardBody padding="sm">
            <div className="text-sm text-neutral-700">
              Auth state, types and shared logic live in packages.
            </div>
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader>
            <div className="text-sm font-medium">Web-first UX</div>
            <div className="mt-1 text-sm text-neutral-600">
              App Router, layouts, fast iteration.
            </div>
          </CardHeader>
          <CardBody padding="sm">
            <div className="text-sm text-neutral-700">
              Server components where it makes sense, client where it needs interactivity.
            </div>
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader>
            <div className="text-sm font-medium">Same family</div>
            <div className="mt-1 text-sm text-neutral-600">
              Consistent tokens, spacing, tone.
            </div>
          </CardHeader>
          <CardBody padding="sm">
            <div className="text-sm text-neutral-700">
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
          <div className="text-sm text-neutral-700 space-y-2">
            <p>
              Start by replacing the home + dashboard screens with your product’s core flows.
            </p>
            <p>
              Keep auth in <span className="font-medium">@repo/providers</span> and UI in{" "}
              <span className="font-medium">@repo/ui</span>, and keep platform routing in the apps.
            </p>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
