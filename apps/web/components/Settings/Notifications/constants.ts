import type {
  GeneratorReadMode,
  NotificationGroupConfig,
  NotificationPreferenceChannel,
} from "./types";

export const totalsAccordionValue = "__totals__";

export const notificationChannels = [
  { key: "in_app_enabled", label: "In-app" },
  { key: "email_enabled", label: "Email" },
  { key: "push_enabled", label: "Push" },
] as const satisfies ReadonlyArray<{
  key: NotificationPreferenceChannel;
  label: string;
}>;

export const notificationGroupConfigs: Record<string, NotificationGroupConfig> =
  {
    auth: {
      label: "Authentication",
      description:
        "Security and sign-in activity, including login prompts and authentication checks.",
      defaults: {
        in_app_enabled: true,
        email_enabled: true,
        push_enabled: true,
      },
    },
    account: {
      label: "Account",
      description:
        "Account activity such as profile, membership, and workspace updates.",
      defaults: {
        in_app_enabled: true,
        email_enabled: true,
        push_enabled: true,
      },
    },
    system: {
      label: "System",
      description: "Platform updates, maintenance notices, and service messages.",
      defaults: {
        in_app_enabled: true,
        email_enabled: false,
        push_enabled: false,
      },
    },
  };

export const fallbackNotificationGroupConfig = {
  description: "Controls delivery for notifications in this group.",
  defaults: {
    in_app_enabled: true,
    email_enabled: false,
    push_enabled: false,
  },
} satisfies Omit<NotificationGroupConfig, "label">;

export const notificationGroupTriggerClassName =
  "inline-flex min-h-7 py-1.5 px-2 w-full cursor-pointer shrink-0 items-center justify-between gap-3 rounded-md border border-transparent bg-transparent px-1 text-(--ui-muted-fg) transition-colors hover:text-(--ui-fg) data-[state=open]:border-(--ui-border) data-[state=open]:bg-(--ui-bg) data-[state=open]:text-(--ui-fg)";

export const demoKeyPattern = /^[a-z][a-z0-9_.:-]*$/;

export const demoNotificationDefaults = {
  title: "Demo delivery check",
  body: "Create a notification, then verify how it appears in web and native.",
  groupKey: "account",
  href: "/app/account",
  readMode: "manual",
  eventName: "account_viewed",
} as const satisfies {
  title: string;
  body: string;
  groupKey: string;
  href: string;
  readMode: GeneratorReadMode;
  eventName: string;
};

export const demoReadModeOptions = [
  { label: "Manual", value: "manual" },
  { label: "Event tracked", value: "event" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: GeneratorReadMode;
}>;
