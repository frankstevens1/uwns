import type {
  NotificationPreference,
  NotificationPreferenceChannels,
} from "@repo/lib";

export type {
  NotificationGroupConfig,
  NotificationPreferenceChannels,
} from "@repo/lib";

export type NotificationPreferenceChannel = keyof NotificationPreferenceChannels;

export type PreferencePatch = Partial<NotificationPreferenceChannels>;

export type PreferenceChangeHandler = (
  groupKey: string,
  patch: PreferencePatch,
) => Promise<NotificationPreference | null>;

export type NotificationGroupCounts = {
  unread: number;
  total: number;
};

export type NotificationChannelStatusCounts = {
  active: number;
  inactive: number;
};

export type NotificationChannelStatusCountsByChannel = Record<
  NotificationPreferenceChannel,
  NotificationChannelStatusCounts
>;

export type GeneratorReadMode = "manual" | "action";
