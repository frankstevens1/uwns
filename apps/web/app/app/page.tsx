"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@repo/ui";

const overviewItems = [
  { label: "Active workspaces", value: "3", detail: "Shared app contexts ready" },
  { label: "Unread updates", value: "12", detail: "Product and system notices" },
  { label: "Reusable surfaces", value: "8", detail: "UI patterns wired across apps" },
];

const feedItems = [
  {
    title: "Provider boundary updated",
    body: "Shared providers stay in @repo/providers while route definitions remain inside each app.",
  },
  {
    title: "UI tokens aligned",
    body: "Web and native surfaces now read from the same theme contract for light and dark mode.",
  },
  {
    title: "Account route available",
    body: "User-specific identity and session details now live on a dedicated account page.",
  },
];

const activityItems = [
  "Magic link and OTP flows are enabled for auth forms.",
  "Native tab navigation is token themed.",
  "The web header uses a stable user avatar seeded from the account id.",
];

export default function AppHome() {
  const router = useRouter();

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">App overview</h2>
          <p className="max-w-2xl text-sm text-(--ui-muted-fg)">
            A global authenticated landing page for product-wide summaries,
            updates, and activity across the app.
          </p>
        </div>

        <Button variant="ghost" onPress={() => router.push("/app/account")}>
          Account
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {overviewItems.map((item) => (
          <Card key={item.label} padding="none" elevation="sm">
            <CardHeader divider={false}>
              <div className="text-sm text-(--ui-muted-fg)">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {item.value}
              </div>
              <div className="mt-1 text-sm text-(--ui-muted-fg)">{item.detail}</div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
        <Card padding="none">
          <CardHeader>
            <div className="text-sm font-medium">News feed</div>
            <div className="mt-1 text-sm text-(--ui-muted-fg)">
              Product-level updates that are not tied to a single user account.
            </div>
          </CardHeader>
          <CardBody padding="sm">
            <div className="space-y-4">
              {feedItems.map((item) => (
                <article key={item.title} className="space-y-1">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="text-sm text-(--ui-muted-fg)">{item.body}</p>
                </article>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card padding="none" variant="subtle">
          <CardHeader divider={false}>
            <div className="text-sm font-medium">Recent activity</div>
          </CardHeader>
          <CardBody padding="sm">
            <ul className="list-inside list-disc space-y-2 text-sm text-(--ui-muted-fg)">
              {activityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
