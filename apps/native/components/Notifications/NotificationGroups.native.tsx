import * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type {
  Notification,
  NotificationGroupConfig,
  NotificationPreference,
  NotificationPreferenceChannels,
} from "@repo/lib";
import {
  getNotificationGroupConfig,
} from "@repo/lib";
import { useActions } from "@repo/providers";
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  getKeyedBadgeColors,
  useThemeTokens,
  type BadgeColorStyle,
} from "@repo/ui";
import { StyleSheet, Text, View } from "react-native";

const totalsAccordionValue = "__totals__";

const notificationChannels = [
  { key: "in_app_enabled", label: "In-app" },
  { key: "email_enabled", label: "Email" },
  { key: "push_enabled", label: "Push" },
] as const satisfies readonly {
  key: NotificationPreferenceChannel;
  label: string;
}[];

type NotificationGroupsProps = {
  notifications: Notification[];
  preferences: NotificationPreference[];
  loading: boolean;
  error: string | null;
  onChange: PreferenceChangeHandler;
};

type NotificationPreferenceChannel = keyof NotificationPreferenceChannels;

type PreferencePatch = Partial<NotificationPreferenceChannels>;

type PreferenceChangeHandler = (
  groupKey: string,
  patch: PreferencePatch,
) => Promise<NotificationPreference | null>;

type NotificationGroupCounts = {
  unread: number;
  total: number;
};

type NotificationChannelStatusCounts = {
  active: number;
  total: number;
};

type NotificationChannelStatusCountsByChannel = Record<
  NotificationPreferenceChannel,
  NotificationChannelStatusCounts
>;

export function NotificationGroups({
  notifications,
  preferences,
  loading,
  error,
  onChange,
}: NotificationGroupsProps) {
  const tokens = useThemeTokens();
  const [openGroupKey, setOpenGroupKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!openGroupKey) return;
    if (openGroupKey === totalsAccordionValue) {
      if (preferences.length < 5) {
        setOpenGroupKey(null);
      }
      return;
    }
    if (
      preferences.some((preference) => preference.group_key === openGroupKey)
    ) {
      return;
    }
    setOpenGroupKey(null);
  }, [openGroupKey, preferences]);

  const totalNotificationCounts = getTotalGroupNotificationCounts(
    notifications,
    preferences,
  );
  const showTotalsRow = preferences.length >= 5;

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>
            Notifications
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.navigate("/notifications")}
          >
            View
          </Button>
        </View>
      </CardHeader>
      <CardBody padding="none">
        {loading ? (
          <StateText>Loading preferences...</StateText>
        ) : error ? (
          <StateText>Notification preferences are unavailable.</StateText>
        ) : preferences.length === 0 ? (
          <StateText>No notification groups are available yet.</StateText>
        ) : (
          <AccordionRoot value={openGroupKey} onValueChange={setOpenGroupKey}>
            {showTotalsRow ? (
              <NotificationGroupsTotalsRow
                notificationCounts={totalNotificationCounts}
                open={openGroupKey === totalsAccordionValue}
                preferences={preferences}
                onChange={onChange}
              />
            ) : null}
            {preferences.map((preference, index) => (
              <NotificationGroupRow
                key={preference.group_key}
                config={getNotificationGroupConfig(preference.group_key)}
                notificationCounts={getGroupNotificationCounts(
                  notifications,
                  preference.group_key,
                )}
                open={openGroupKey === preference.group_key}
                preference={preference}
                last={index === preferences.length - 1}
                onChange={onChange}
              />
            ))}
          </AccordionRoot>
        )}
      </CardBody>
    </Card>
  );
}

function NotificationGroupsTotalsRow({
  notificationCounts,
  open,
  preferences,
  onChange,
}: {
  notificationCounts: NotificationGroupCounts;
  open: boolean;
  preferences: NotificationPreference[];
  onChange: PreferenceChangeHandler;
}) {
  const { trackAction } = useActions();
  const tokens = useThemeTokens();
  const channelValues = getGlobalChannelValues(preferences);
  const channelStatusCounts = getGlobalChannelStatusCounts(preferences);
  const groupColors = getKeyedBadgeColors(totalsAccordionValue);

  return (
    <AccordionItem
      value={totalsAccordionValue}
      style={[styles.accordionItem, { borderBottomColor: tokens.color.border }]}
    >
      <AccordionTrigger
        aria-label="Toggle all notification group delivery settings"
        style={styles.trigger}
      >
        <View style={styles.triggerContent}>
          <GroupBadge colors={groupColors}>All</GroupBadge>
          <Pill>
            {preferences.length} {preferences.length === 1 ? "group" : "groups"}
          </Pill>
          <NotificationCountBadge counts={notificationCounts} />
        </View>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color={tokens.color.mutedFg}
          size={16}
        />
      </AccordionTrigger>

      <AccordionContent style={styles.content}>
        <Text style={[styles.description, { color: tokens.color.mutedFg }]}>
          Apply delivery settings across all groups.
        </Text>
        <DeliveryChannelControls
          channelStatusCounts={channelStatusCounts}
          values={channelValues}
          onChange={(channel, checked) => {
            void (async () => {
              await applyChannelToAllGroups(
                preferences,
                channel,
                checked,
                onChange,
              );

              void trackAction({
                actionName: "notification_preferences_bulk_clicked",
                metadata: {
                  source: "settings",
                  screen: "notifications",
                  trigger: "apply_all",
                  channel,
                  enabled: checked,
                  groupCount: preferences.length,
                },
              });
            })();
          }}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function NotificationGroupRow({
  config,
  notificationCounts,
  open,
  preference,
  last,
  onChange,
}: {
  config: NotificationGroupConfig;
  notificationCounts: NotificationGroupCounts;
  open: boolean;
  preference: NotificationPreference;
  last: boolean;
  onChange: PreferenceChangeHandler;
}) {
  const { trackAction } = useActions();
  const tokens = useThemeTokens();
  const groupColors = getKeyedBadgeColors(preference.group_key);

  return (
    <AccordionItem
      value={preference.group_key}
      style={[
        styles.accordionItem,
        { borderBottomColor: last ? "transparent" : tokens.color.border },
      ]}
    >
      <AccordionTrigger
        aria-label={`Toggle ${config.label} delivery settings`}
        style={styles.trigger}
      >
        <View style={styles.triggerContent}>
          <GroupBadge colors={groupColors}>{config.label}</GroupBadge>
          <NotificationCountBadge counts={notificationCounts} />
        </View>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color={tokens.color.mutedFg}
          size={16}
        />
      </AccordionTrigger>

      <AccordionContent style={styles.content}>
        <Text style={[styles.description, { color: tokens.color.mutedFg }]}>
          {config.description}
        </Text>
        <DeliveryChannelControls
          values={getPreferenceChannelValues(preference)}
          onChange={(channel, checked) => {
            void (async () => {
              const updated = await updatePreferenceChannel(
                preference.group_key,
                channel,
                checked,
                onChange,
              );
              if (!updated) return;

              void trackAction({
                actionName: "notification_preference_changed",
                metadata: {
                  source: "settings",
                  screen: "notifications",
                  trigger: "toggle",
                  groupKey: preference.group_key,
                  channel,
                  enabled: checked,
                },
              });
            })();
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            void (async () => {
              const updated = await onChange(preference.group_key, {
                ...getNotificationGroupConfig(preference.group_key).defaults,
              });
              if (!updated) return;

              void trackAction({
                actionName: "notification_preferences_reset",
                metadata: {
                  source: "settings",
                  screen: "notifications",
                  trigger: "button",
                  groupKey: preference.group_key,
                },
              });
            })();
          }}
          style={styles.resetButton}
        >
          Reset default
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}

function DeliveryChannelControls({
  channelStatusCounts,
  values,
  onChange,
}: {
  channelStatusCounts?: NotificationChannelStatusCountsByChannel;
  values: NotificationPreferenceChannels;
  onChange: (channel: NotificationPreferenceChannel, checked: boolean) => void;
}) {
  return (
    <View style={styles.channelList}>
      {notificationChannels.map((channel) => (
        <ChannelToggle
          key={channel.key}
          statusCounts={channelStatusCounts?.[channel.key]}
          checked={values[channel.key]}
          label={channel.label}
          onChange={(checked) => onChange(channel.key, checked)}
        />
      ))}
    </View>
  );
}

function ChannelToggle({
  statusCounts,
  checked,
  label,
  onChange,
}: {
  statusCounts?: NotificationChannelStatusCounts;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  const tokens = useThemeTokens();

  return (
    <View
      style={[
        styles.channelRow,
        {
          backgroundColor: tokens.color.bg,
          borderColor: tokens.color.border,
          borderRadius: tokens.radius.md,
        },
      ]}
    >
      <Checkbox
        checked={checked}
        label={label}
        onChange={onChange}
        style={styles.channelCheckbox}
      />
      {statusCounts ? (
        <Text
          accessibilityLabel={`${statusCounts.active} active, ${statusCounts.total} total`}
          style={[
            styles.channelCount,
            {
              backgroundColor: tokens.color.subtleBg,
              borderColor: tokens.color.border,
              borderRadius: tokens.radius.sm,
              color: tokens.color.mutedFg,
            },
          ]}
        >
          {statusCounts.active}/{statusCounts.total}
        </Text>
      ) : null}
    </View>
  );
}

function NotificationCountBadge({
  counts,
}: {
  counts: NotificationGroupCounts;
}) {
  return (
    <Pill>
      {counts.unread}/{counts.total} unread
    </Pill>
  );
}

function GroupBadge({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: BadgeColorStyle;
}) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderRadius: 999,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.pillText, { color: colors.color }]}
      >
        {children}
      </Text>
    </View>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  const tokens = useThemeTokens();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: tokens.color.bg,
          borderColor: tokens.color.border,
          borderRadius: 999,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.pillText, { color: tokens.color.mutedFg }]}
      >
        {children}
      </Text>
    </View>
  );
}

function StateText({ children }: { children: string }) {
  const tokens = useThemeTokens();

  return (
    <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
      {children}
    </Text>
  );
}

function getPreferenceChannelValues(
  preference: NotificationPreference,
): NotificationPreferenceChannels {
  return {
    in_app_enabled: preference.in_app_enabled,
    email_enabled: preference.email_enabled,
    push_enabled: preference.push_enabled,
  };
}

function getGlobalChannelValues(
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

function getGlobalChannelStatusCounts(
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
): NotificationChannelStatusCounts {
  const active = preferences.filter((preference) => preference[channel]).length;

  return {
    active,
    total: preferences.length,
  };
}

function updatePreferenceChannel(
  groupKey: string,
  channel: NotificationPreferenceChannel,
  checked: boolean,
  onChange: PreferenceChangeHandler,
) {
  return onChange(groupKey, getPreferenceChannelPatch(channel, checked));
}

function applyChannelToAllGroups(
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

function getTotalGroupNotificationCounts(
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

function getGroupNotificationCounts(
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

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 0,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  accordionItem: {
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  trigger: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    minHeight: 36,
  },
  triggerContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minWidth: 0,
  },
  content: {
    paddingHorizontal: 2,
    paddingTop: 12,
    rowGap: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  channelList: {
    rowGap: 8,
  },
  channelRow: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  channelCheckbox: {
    flex: 1,
  },
  channelCount: {
    borderWidth: 1,
    fontSize: 11,
    fontWeight: "700",
    minWidth: 42,
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 3,
    textAlign: "center",
  },
  pill: {
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  resetButton: {
    alignSelf: "flex-end",
  },
});
