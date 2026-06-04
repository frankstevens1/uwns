import type { ActivityPlatformConfig } from "./types";

export const totalsAccordionValue = "__totals__";

export const platformsTriggerClassName =
  "inline-flex min-h-7 py-1.5 px-2 w-full cursor-pointer shrink-0 items-center justify-between gap-3 rounded-md border border-transparent bg-transparent px-1 text-(--ui-muted-fg) transition-colors hover:text-(--ui-fg) data-[state=open]:border-(--ui-border) data-[state=open]:bg-(--ui-bg) data-[state=open]:text-(--ui-fg)";

export const activityPlatformConfigs: Record<string, ActivityPlatformConfig> = {
  web: {
    label: "Web",
    description:
      "Events recorded by the web app, including settings, account, and navigation activity.",
  },
  native: {
    label: "Native",
    description:
      "Events recorded by the native app, including mobile account and tab activity.",
  },
};

export const fallbackPlatformConfig: ActivityPlatformConfig = {
  label: "Unknown",
  description: "Events recorded by this platform.",
};
