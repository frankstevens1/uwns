"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ResolvedNotificationTarget } from "@repo/lib";
import { useActions, useNotifications } from "@repo/providers";
import {
  getNotificationsForGroup,
  NotificationDemo,
  NotificationGroups,
  NotificationHistoryContent,
  NotificationHistoryHeader,
} from "@/components/Settings/Notifications";
import { SettingsTwoColumnLayout } from "./SettingsTwoColumnLayout";

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
    <SettingsTwoColumnLayout
      left={
        <>
          <NotificationGroups
            notifications={notifications}
            onSelectedGroupKeyChange={setSelectedNotificationGroupKey}
            preferences={preferences}
            onChange={updatePreference}
          />
          <NotificationDemo
            preferences={preferences}
            onCreate={createNotification}
          />
        </>
      }
      rightHeader={
        <NotificationHistoryHeader
          notifications={historyNotifications}
          onMarkAllAsRead={markAllAsRead}
        />
      }
      rightContent={
        <NotificationHistoryContent
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
      }
    />
  );
}
