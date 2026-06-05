import type * as React from "react";
import type { Notification, NotificationPreference } from "@repo/lib";
import { getKeyedBadgeColors } from "@repo/ui";
import {
  fallbackNotificationGroupConfig,
  notificationGroupConfigs,
} from "./constants";
import type {
  NotificationChannelStatusCountsByChannel,
  NotificationGroupConfig,
  NotificationPreferenceChannel,
  NotificationPreferenceChannels,
  PreferenceChangeHandler,
  PreferencePatch,
} from "./types";

export function getNotificationGroupConfig(
  groupKey: string,
): NotificationGroupConfig {
  const config = notificationGroupConfigs[groupKey];

  if (config) {
    return config;
  }

  return {
    label: groupKey,
    ...fallbackNotificationGroupConfig,
  };
}

export function getNotificationsForGroup(
  notifications: Notification[],
  groupKey: string | null,
) {
  if (!groupKey) {
    return notifications;
  }

  return notifications.filter(
    (notification) => notification.group_key === groupKey,
  );
}

export function getPreferenceChannelValues(
  preference: NotificationPreference,
): NotificationPreferenceChannels {
  return {
    in_app_enabled: preference.in_app_enabled,
    email_enabled: preference.email_enabled,
    push_enabled: preference.push_enabled,
  };
}

export function getGlobalChannelValues(
  preferences: NotificationPreference[],
): NotificationPreferenceChannels {
  return {
    in_app_enabled: preferences.every(
      (preference) => preference.in_app_enabled,
    ),
    email_enabled: preferences.every((preference) => preference.email_enabled),
    push_enabled: preferences.every((preference) => preference.push_enabled),
  };
}

export function getGlobalChannelStatusCounts(
  preferences: NotificationPreference[],
): NotificationChannelStatusCountsByChannel {
  return {
    in_app_enabled: getChannelStatusCounts(preferences, "in_app_enabled"),
    email_enabled: getChannelStatusCounts(preferences, "email_enabled"),
    push_enabled: getChannelStatusCounts(preferences, "push_enabled"),
  };
}

function getChannelStatusCounts(
  preferences: NotificationPreference[],
  channel: NotificationPreferenceChannel,
) {
  const active = preferences.filter((preference) => preference[channel]).length;

  return {
    active,
    inactive: preferences.length - active,
  };
}

export function updatePreferenceChannel(
  groupKey: string,
  channel: NotificationPreferenceChannel,
  checked: boolean,
  onChange: PreferenceChangeHandler,
) {
  return onChange(groupKey, getPreferenceChannelPatch(channel, checked));
}

export function applyChannelToAllGroups(
  preferences: NotificationPreference[],
  channel: NotificationPreferenceChannel,
  checked: boolean,
  onChange: PreferenceChangeHandler,
) {
  return Promise.all(
    preferences.map((preference) =>
      updatePreferenceChannel(preference.group_key, channel, checked, onChange),
    ),
  ).then(() => undefined);
}

export function resetGroupToDefaults(
  groupKey: string,
  onChange: PreferenceChangeHandler,
) {
  const config = getNotificationGroupConfig(groupKey);
  return onChange(groupKey, { ...config.defaults });
}

export function resetAllGroupsToDefaults(
  preferences: NotificationPreference[],
  onChange: PreferenceChangeHandler,
) {
  return Promise.all(
    preferences.map((preference) =>
      resetGroupToDefaults(preference.group_key, onChange),
    ),
  ).then(() => undefined);
}

function getPreferenceChannelPatch(
  channel: NotificationPreferenceChannel,
  checked: boolean,
): PreferencePatch {
  switch (channel) {
    case "in_app_enabled":
      return { in_app_enabled: checked };
    case "email_enabled":
      return { email_enabled: checked };
    case "push_enabled":
      return { push_enabled: checked };
  }
}

export function getGroupBadgeStyle(groupKey: string): React.CSSProperties {
  return getKeyedBadgeColors(groupKey);
}

export function getTotalGroupNotificationCounts(
  notifications: Notification[],
  preferences: NotificationPreference[],
) {
  const groupKeys = new Set(
    preferences.map((preference) => preference.group_key),
  );
  const groupNotifications = notifications.filter((notification) =>
    groupKeys.has(notification.group_key),
  );

  return {
    total: groupNotifications.length,
    unread: groupNotifications.filter((notification) => !notification.read_at)
      .length,
  };
}

export function getGroupNotificationCounts(
  notifications: Notification[],
  groupKey: string,
) {
  const groupNotifications = notifications.filter(
    (notification) => notification.group_key === groupKey,
  );

  return {
    total: groupNotifications.length,
    unread: groupNotifications.filter((notification) => !notification.read_at)
      .length,
  };
}
