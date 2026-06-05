import notificationDestinationsJson from "./notification-destinations.json";
import notificationGroupConfigsJson from "./notification-groups.json";

export type NotificationPlatform = "web" | "native";

export type NotificationPreferenceChannels = {
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
};

export type NotificationGroupConfig = {
  label: string;
  description: string;
  defaults: NotificationPreferenceChannels;
};

export const notificationGroupConfigs = notificationGroupConfigsJson as Record<
  string,
  NotificationGroupConfig
>;

export const fallbackNotificationGroupConfig = {
  description: "Controls delivery for notifications in this group.",
  defaults: {
    in_app_enabled: true,
    email_enabled: false,
    push_enabled: false,
  },
} satisfies Omit<NotificationGroupConfig, "label">;

export function getNotificationGroupConfig(
  groupKey: string,
): NotificationGroupConfig {
  return notificationGroupConfigs[groupKey] ?? {
    label: groupKey,
    ...fallbackNotificationGroupConfig,
  };
}

export type NotificationTargetType = "app_destination" | "external_url";

export type AppDestinationTarget = {
  type: "app_destination";
  target: string;
};

export type ExternalUrlTarget = {
  type: "external_url";
  target: string;
};

export type NotificationTarget = AppDestinationTarget | ExternalUrlTarget;

export type NotificationDestination = {
  id: string;
  label: string;
  paths: Partial<Record<NotificationPlatform, string>>;
};

export const notificationDestinations =
  notificationDestinationsJson as NotificationDestination[];

export function getNotificationDestination(destinationId: string) {
  return notificationDestinations.find((destination) => destination.id === destinationId);
}

export function getNotificationDestinationPath(
  destinationId: string,
  platform: NotificationPlatform,
) {
  return getNotificationDestination(destinationId)?.paths[platform] ?? null;
}

export type ResolvedNotificationTarget =
  | {
      type: "app_destination";
      target: string;
      href: string;
      destination: NotificationDestination;
    }
  | {
      type: "external_url";
      target: string;
      href: string;
    };

export function resolveNotificationTarget(
  target: NotificationTarget | null | undefined,
  platform: NotificationPlatform,
): ResolvedNotificationTarget | null {
  if (!target) return null;

  if (target.type === "external_url") {
    return {
      type: target.type,
      target: target.target,
      href: target.target,
    };
  }

  const destination = getNotificationDestination(target.target);
  const href = destination?.paths[platform] ?? null;
  if (!destination || !href) return null;

  return {
    type: target.type,
    target: target.target,
    href,
    destination,
  };
}

export function isAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
