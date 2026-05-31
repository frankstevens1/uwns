"use client";

import { Blocks, DatabaseZap, Palette } from "lucide-react";
import { Card, CardBody, CardHeader, Code } from "@repo/ui";

const featureCards = [
  {
    title: "Shared app foundation",
    subtitle: "Providers across surfaces.",
    body: "Use shared providers for auth, account context, feature flags, and other app state that should behave the same on web and native.",
    icon: Blocks,
  },
  {
    title: "Supabase ready",
    subtitle: "Auth already wired.",
    body: "Supabase-backed sign in, sign up, session state, and platform-specific client setup are kept behind a clear shared boundary.",
    icon: DatabaseZap,
  },
  {
    title: "Shared UI, native fit",
    subtitle: "One contract, tuned per platform.",
    body: "Build with shared primitives and tokens while leaving room for platform-specific layout, interaction, data patterns, and security flows.",
    icon: Palette,
  },
];

export default function Home() {

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Unified Web Native Stack (UWNS)</h1>
        <p className="text-(--ui-muted-fg)">
          A Turbo monorepo for building Next.js and Expo apps with shared
          providers, reusable UI, and platform-specific app structure.
        </p>
      </div>

      <div className="mx-2 grid gap-6 sm:mx-4 sm:grid-cols-3">
        {featureCards.map(({ title, subtitle, body, icon: Icon }) => (
          <Card key={title} padding="none" elevation="sm">
            <CardHeader divider={false}>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) text-(--ui-fg)">
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{title}</div>
                  <div className="mt-0.5 text-xs font-light leading-4 text-(--ui-muted-fg)">
                    {subtitle}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody
              padding="sm"
              style={{ paddingBottom: 18, paddingLeft: 18, paddingRight: 18, paddingTop: 14 }}
            >
              <div className="text-sm font-light leading-5 text-(--ui-muted-fg)">
                {body}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card padding="none" variant="subtle">
        <CardHeader divider={false}>
          <div className="text-sm font-medium">Boilerplate orientation</div>
        </CardHeader>
        <CardBody padding="sm">
          <div className="text-sm text-(--ui-muted-fg) space-y-2">
            <p>
              Start by replacing the{" "}
              <Code>/</Code> with your landing page content and{" "}
              <Code>/app/**</Code>{" "}
              with your product’s core flows.
            </p>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
