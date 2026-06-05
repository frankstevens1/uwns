import type { ActionPlatformConfig } from "./types";

export const totalsAccordionValue = "__totals__";

export const platformsTriggerClassName =
  "inline-flex min-h-7 py-1.5 px-2 w-full cursor-pointer shrink-0 items-center justify-between gap-3 rounded-md border border-transparent bg-transparent px-1 text-(--ui-muted-fg) transition-colors hover:text-(--ui-fg) data-[state=open]:border-(--ui-border) data-[state=open]:bg-(--ui-bg) data-[state=open]:text-(--ui-fg)";

export const actionPlatformConfigs: Record<string, ActionPlatformConfig> = {
  web: {
    label: "Web",
    description:
      "Actions recorded by the web app, including settings, account, and navigation.",
  },
  native: {
    label: "Native",
    description:
      "Actions recorded by the native app, including mobile account and tab navigation.",
  },
};

export const fallbackPlatformConfig: ActionPlatformConfig = {
  label: "Unknown",
  description: "Actions recorded by this platform.",
};
