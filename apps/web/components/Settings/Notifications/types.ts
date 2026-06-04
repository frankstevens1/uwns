import type { NotificationPreference } from "@repo/lib";

export type NotificationPreferenceChannels = Pick<
  NotificationPreference,
  "in_app_enabled" | "email_enabled" | "push_enabled"
>;

export type NotificationPreferenceChannel = keyof NotificationPreferenceChannels;

export type NotificationGroupConfig = {
  label: string;
  description: string;
  defaults: NotificationPreferenceChannels;
};

export type PreferencePatch = Partial<NotificationPreferenceChannels>;

export type PreferenceChangeHandler = (
  groupKey: string,
  patch: PreferencePatch,
) => Promise<NotificationPreference | null>;

export type NotificationGroupCounts = {
  unread: number;
  total: number;
};

export type NotificationChannelActivityCounts = {
  active: number;
  inactive: number;
};

export type NotificationChannelActivityCountsByChannel = Record<
  NotificationPreferenceChannel,
  NotificationChannelActivityCounts
>;

export type GeneratorReadMode = "manual" | "event";
