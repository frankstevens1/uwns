"use client";

import { useRouter } from "next/navigation";
import { Blocks, Route, UserRound } from "lucide-react";
import { Button, Card, CardBody, CardHeader, Code, Tip } from "@repo/ui";

const homeCards = [
  {
    title: "Product flows",
    subtitle: "Your app logic starts here.",
    body: "Replace this route with your authenticated product home. Keep routing, layouts, and platform glue close to the app.",
    icon: Route,
  },
  {
    title: "Shared providers",
    subtitle: "Reuse real app state.",
    body: "Move auth, account context, feature flags, and other cross-platform state into shared providers when both apps need it.",
    icon: Blocks,
  },
  {
    title: "Account pattern",
    subtitle: "Concrete auth example.",
    body: "The account page shows provider state composed with shared UI primitives in a small, inspectable component.",
    icon: UserRound,
  },
];

export default function AppHome() {
  const router = useRouter();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Home</h2>
        <p className="max-w-2xl text-sm text-(--ui-muted-fg)">
          This authenticated route is the first place to build product-specific
          flows. The demo keeps the page simple so the app structure, provider
          boundary, and shared UI patterns are easy to see.
        </p>
      </header>

      <Tip>
        Compose app state from <Code>@repo/providers</Code> with shared building
        blocks from <Code>@repo/ui</Code>. Keep the contract shared, but let each
        platform choose the layout and interaction details that feel native.
      </Tip>

      <div className="mx-2 grid gap-6 md:grid-cols-3">
        {homeCards.map(({ title, subtitle, body, icon: Icon }) => (
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
        <CardBody padding="sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-(--ui-muted-fg)">
              The account page shows the same provider and UI pattern applied to
              a concrete authenticated component.
            </p>
            <Button variant="primary" onPress={() => router.push("/app/account")}>
              Account demo
            </Button>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
