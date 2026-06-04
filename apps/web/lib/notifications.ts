import type { Notification } from "@repo/lib";

export function canManuallyMarkRead(notification: Notification) {
  return (
    !notification.read_at &&
    notification.metadata.autoReadOnly !== true &&
    notification.type !== "login_platform_prompt"
  );
}

export function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getUnreadNotificationLabel(notification: Notification) {
  if (!notification.read_at && !canManuallyMarkRead(notification)) {
    return "Complete action to mark read";
  }

  return null;
}
