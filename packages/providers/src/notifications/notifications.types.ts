import type {
  CreateNotificationInput,
  Notification,
  NotificationPreference,
  NotificationPreferencePatch,
} from "@repo/lib";

export type NotificationContextValue = {
  notifications: Notification[];
  preferences: NotificationPreference[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  applyActivityNotificationUpdate: (args: {
    eventName: string;
    platform: "web" | "native";
  }) => Promise<void>;
  createNotification: (input: CreateNotificationInput) => Promise<Notification | null>;
  markAsRead: (id: string) => Promise<Notification | null>;
  markAllAsRead: () => Promise<void>;
  updatePreference: (
    groupKey: string,
    patch: NotificationPreferencePatch,
  ) => Promise<NotificationPreference | null>;
};
