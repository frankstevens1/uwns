"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ResolvedNotificationTarget } from "@repo/lib";
import { useActions, useNotifications } from "@repo/providers";
import {
  getNotificationsForGroup,
  NotificationDemo,
  NotificationGroups,
  NotificationHistory,
} from "@/components/Settings/Notifications";

export function NotificationSettingsSection() {
  const { trackAction } = useActions();
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
    void trackAction({
      actionName: "notifications_viewed",
      uniqueKey: "web:settings:notifications_viewed",
      metadata: {
        source: "settings",
        screen: "settings_notifications",
        trigger: "first_page_visit",
      },
    });
  }, [trackAction]);

  return (
    <section className="space-y-6">
      <NotificationDemo
        preferences={preferences}
        onCreate={createNotification}
      />

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
          onGoTo={(target: ResolvedNotificationTarget) => {
            if (target.type === "external_url") {
              window.location.assign(target.href);
              return;
            }

            router.push(target.href);
          }}
          onMarkAllAsRead={markAllAsRead}
          onMarkAsRead={markAsRead}
        />
      </div>
    </section>
  );
}
