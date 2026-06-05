import type {
  GeneratorReadMode,
  NotificationPreferenceChannel,
} from "./types";
export {
  fallbackNotificationGroupConfig,
  notificationGroupConfigs,
} from "@repo/lib";

export const totalsAccordionValue = "__totals__";

export const notificationChannels = [
  { key: "in_app_enabled", label: "In-app" },
  { key: "email_enabled", label: "Email" },
  { key: "push_enabled", label: "Push" },
] as const satisfies ReadonlyArray<{
  key: NotificationPreferenceChannel;
  label: string;
}>;

export const notificationGroupTriggerClassName =
  "inline-flex min-h-7 py-1.5 px-2 w-full cursor-pointer shrink-0 items-center justify-between gap-3 rounded-md border border-transparent bg-transparent px-1 text-(--ui-muted-fg) transition-colors hover:text-(--ui-fg) data-[state=open]:border-(--ui-border) data-[state=open]:bg-(--ui-bg) data-[state=open]:text-(--ui-fg)";

export const demoKeyPattern = /^[a-z][a-z0-9_.:-]*$/;

export const demoNotificationDefaults = {
  title: "Demo delivery check",
  body: "Create a notification, then verify how it appears in web and native.",
  groupKey: "account",
  targetType: "app_destination",
  destinationId: "account",
  externalUrl: "",
  readMode: "manual",
  actionName: "account_viewed",
} as const satisfies {
  title: string;
  body: string;
  groupKey: string;
  targetType: "app_destination" | "external_url";
  destinationId: string;
  externalUrl: string;
  readMode: GeneratorReadMode;
  actionName: string;
};

export const demoReadModeOptions = [
  { label: "Manual", value: "manual" },
  { label: "Action tracked", value: "action" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: GeneratorReadMode;
}>;
