"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useActivity, useNotifications } from "@repo/providers";
import {
  getNotificationsForGroup,
  NotificationDemo,
  NotificationGroups,
  NotificationHistory,
} from "@/components/Settings/Notifications";

export function NotificationSettingsSection() {
  const { trackEvent } = useActivity();
  const router = useRouter();
  const {
    notifications,
    preferences,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    createNotification,
    updatePreference,
  } = useNotifications();
  const [selectedNotificationGroupKey, setSelectedNotificationGroupKey] =
    React.useState<string | null>(null);
  const historyNotifications = React.useMemo(
    () => getNotificationsForGroup(notifications, selectedNotificationGroupKey),
    [notifications, selectedNotificationGroupKey],
  );

  React.useEffect(() => {
    void trackEvent({
      eventName: "notifications_viewed",
      uniqueKey: "web:settings:notifications_viewed",
      metadata: {
        source: "settings",
        screen: "settings_notifications",
        trigger: "first_page_visit",
      },
    });
  }, [trackEvent]);

  return (
    <section className="space-y-6">

      <NotificationDemo onCreate={createNotification} />

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <NotificationGroups
          notifications={notifications}
          onSelectedGroupKeyChange={setSelectedNotificationGroupKey}
          preferences={preferences}
          onChange={updatePreference}
        />

        <NotificationHistory
          error={error}
          loading={loading}
          notifications={historyNotifications}
          onGoTo={(href) => router.push(href)}
          onMarkAllAsRead={markAllAsRead}
          onMarkAsRead={markAsRead}
        />
      </div>
    </section>
  );
}
