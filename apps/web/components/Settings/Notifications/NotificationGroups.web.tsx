"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
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
} from "@repo/ui";
import type { Notification, NotificationPreference } from "@repo/lib";
import {
  notificationChannels,
  notificationGroupTriggerClassName,
  totalsAccordionValue,
} from "./constants";
import type {
  NotificationChannelStatusCounts,
  NotificationChannelStatusCountsByChannel,
  NotificationGroupConfig,
  NotificationGroupCounts,
  NotificationPreferenceChannel,
  NotificationPreferenceChannels,
  PreferenceChangeHandler,
} from "./types";
import {
  applyChannelToAllGroups,
  getGlobalChannelStatusCounts,
  getGlobalChannelValues,
  getGroupBadgeStyle,
  getGroupNotificationCounts,
  getNotificationGroupConfig,
  getPreferenceChannelValues,
  getTotalGroupNotificationCounts,
  resetGroupToDefaults,
  updatePreferenceChannel,
} from "./utils";

export function NotificationGroups({
  notifications,
  onSelectedGroupKeyChange,
  preferences,
  onChange,
}: {
  notifications: Notification[];
  onSelectedGroupKeyChange?: (groupKey: string | null) => void;
  preferences: NotificationPreference[];
  onChange: PreferenceChangeHandler;
}) {
  const [openGroupKey, setOpenGroupKey] = React.useState<string | null>(null);

  const updateOpenGroupKey = React.useCallback(
    (nextOpenGroupKey: string | null) => {
      setOpenGroupKey(nextOpenGroupKey);
      onSelectedGroupKeyChange?.(
        nextOpenGroupKey && nextOpenGroupKey !== totalsAccordionValue
          ? nextOpenGroupKey
          : null,
      );
    },
    [onSelectedGroupKeyChange],
  );

  React.useEffect(() => {
    if (!openGroupKey) return;
    if (openGroupKey === totalsAccordionValue) {
      if (preferences.length < 5) {
        updateOpenGroupKey(null);
      }
      return;
    }
    if (
      preferences.some((preference) => preference.group_key === openGroupKey)
    ) {
      return;
    }
    updateOpenGroupKey(null);
  }, [openGroupKey, preferences, updateOpenGroupKey]);

  const totalNotificationCounts = getTotalGroupNotificationCounts(
    notifications,
    preferences,
  );
  const showTotalsRow = preferences.length >= 5;

  return (
    <Card padding="none" elevation="sm" variant="subtle">
      <CardHeader>
        <div className="text-sm font-medium">Notification groups</div>
        <p className="text-xs leading-5 text-(--ui-muted-fg)">
          Apply delivery settings for each group.
        </p>
      </CardHeader>
      <CardBody padding="none">
        {preferences.length === 0 ? (
          <p className="px-4 py-5 text-sm text-(--ui-muted-fg)">
            No notification groups yet.
          </p>
        ) : (
          <AccordionRoot
            className="divide-y divide-(--ui-border)"
            value={openGroupKey}
            onValueChange={updateOpenGroupKey}
          >
            {showTotalsRow ? (
              <NotificationGroupsTotalsRow
                notificationCounts={totalNotificationCounts}
                open={openGroupKey === totalsAccordionValue}
                preferences={preferences}
                onChange={onChange}
              />
            ) : null}
            {preferences.map((preference) => (
              <NotificationGroupRow
                key={preference.group_key}
                config={getNotificationGroupConfig(preference.group_key)}
                notificationCounts={getGroupNotificationCounts(
                  notifications,
                  preference.group_key,
                )}
                open={openGroupKey === preference.group_key}
                preference={preference}
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
  const channelValues = getGlobalChannelValues(preferences);
  const channelStatusCounts = getGlobalChannelStatusCounts(preferences);
  const groupStyle = getGroupBadgeStyle(totalsAccordionValue);

  return (
    <AccordionItem value={totalsAccordionValue} className="px-3 py-3">
      <AccordionTrigger
        aria-label="Toggle all notification group delivery settings"
        className={notificationGroupTriggerClassName}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className="inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4"
            style={groupStyle}
          >
            All
          </span>
          <span className="inline-flex items-center rounded-full border border-(--ui-border) bg-(--ui-bg) px-2 py-0.5 text-[10px] font-medium leading-4 text-(--ui-muted-fg)">
            {preferences.length} {preferences.length === 1 ? "group" : "groups"}
          </span>
          <NotificationCountBadge counts={notificationCounts} />
        </div>

        <ChevronDown
          aria-hidden="true"
          className={["shrink-0 transition-transform", open ? "rotate-180" : ""]
            .filter(Boolean)
            .join(" ")}
          size={15}
        />
      </AccordionTrigger>

      <AccordionContent
        className="space-y-3 px-1 pt-3"
        style={{ paddingTop: "12px" }}
      >
        <p className="text-xs leading-5 text-(--ui-muted-fg)">
          Apply delivery settings across all groups.
        </p>
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
  onChange,
}: {
  config: NotificationGroupConfig;
  notificationCounts: NotificationGroupCounts;
  open: boolean;
  preference: NotificationPreference;
  onChange: PreferenceChangeHandler;
}) {
  const { trackAction } = useActions();
  const groupStyle = getGroupBadgeStyle(preference.group_key);

  return (
    <AccordionItem value={preference.group_key} className="px-3 py-3">
      <AccordionTrigger
        aria-label={`Toggle ${config.label} delivery settings`}
        className={notificationGroupTriggerClassName}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className="inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4"
            style={groupStyle}
          >
            <span className="truncate">{config.label}</span>
          </span>
          <NotificationCountBadge counts={notificationCounts} />
        </div>

        <ChevronDown
          aria-hidden="true"
          className={["shrink-0 transition-transform", open ? "rotate-180" : ""]
            .filter(Boolean)
            .join(" ")}
          size={15}
        />
      </AccordionTrigger>

      <AccordionContent
        className="space-y-3 px-1 pt-3"
        style={{ paddingTop: "12px" }}
      >
        <p className="text-xs leading-5 text-(--ui-muted-fg)">
          {config.description}
        </p>
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
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              void (async () => {
                const updated = await resetGroupToDefaults(
                  preference.group_key,
                  onChange,
                );
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
          >
            Reset default
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function NotificationCountBadge({
  counts,
}: {
  counts: NotificationGroupCounts;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-(--ui-border) bg-(--ui-bg) px-2 py-0.5 text-[10px] font-medium leading-4 text-(--ui-muted-fg)">
      {counts.unread}/{counts.total} unread
    </span>
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
    <div className="grid gap-2">
      {notificationChannels.map((channel) => (
        <ChannelToggle
          key={channel.key}
          statusCounts={channelStatusCounts?.[channel.key]}
          checked={values[channel.key]}
          label={channel.label}
          onChange={(checked) => onChange(channel.key, checked)}
        />
      ))}
    </div>
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
  return (
    <div className="relative flex items-center justify-between gap-2 rounded-md bg-(--ui-bg) px-2 py-1.5">
      <Checkbox
        checked={checked}
        className="w-full flex-row-reverse justify-between"
        label={label}
        onChange={onChange}
      />
      {statusCounts ? (
        <span
          aria-label={`${statusCounts.active} active, ${statusCounts.inactive} inactive`}
          className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 rounded-full border border-(--ui-border) bg-(--ui-subtle-bg) px-1.5 py-0.5 text-[10px] font-medium leading-none text-(--ui-muted-fg)"
        >
          {statusCounts.active}/
          {statusCounts.active + statusCounts.inactive}
        </span>
      ) : null}
    </div>
  );
}
