"use client";

import * as React from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  SettingsRow,
  Tip,
} from "@repo/ui";
import { useActivity, useNotifications } from "@repo/providers";
import type { Notification, NotificationPreference } from "@repo/lib";

const groupLabels: Record<string, string> = {
  auth: "Authentication",
  account: "Account",
};

export default function NotificationsPage() {
  const { trackEvent } = useActivity();
  const {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    updatePreference,
  } = useNotifications();
  const hasManualUnread = notifications.some(canManuallyMarkRead);

  React.useEffect(() => {
    void trackEvent({
      eventName: "notifications_viewed",
      uniqueKey: "web:notifications_viewed",
      metadata: {
        source: "account",
        screen: "notifications_page",
        trigger: "first_page_visit",
      },
    });
  }, [trackEvent]);

  return (
    <section className="space-y-6 pb-14">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Notifications</h2>
        <p className="max-w-2xl text-sm text-(--ui-muted-fg)">
          Review notification history and manage delivery preferences across
          in-app, email, and native push channels.
        </p>
      </header>

      <Tip>
        Notification delivery is decided by app code and user preferences
        together. A notification can request email or push, but the service only
        sends that channel when the matching group is enabled.
      </Tip>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="none" elevation="sm" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bell size={16} />
                All notifications
                {unreadCount > 0 ? (
                  <span className="text-xs text-(--ui-muted-fg)">
                    {unreadCount} unread
                  </span>
                ) : null}
              </div>
              {hasManualUnread ? (
                <Button variant="outline" onPress={markAllAsRead}>
                  <span className="inline-flex items-center gap-2">
                    <CheckCheck size={16} />
                    Mark all read
                  </span>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <p className="text-sm text-(--ui-muted-fg)">Loading notifications...</p>
            ) : error ? (
              <p className="text-sm text-(--ui-muted-fg)">
                Notifications are unavailable: {error}
              </p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-(--ui-muted-fg)">
                No notifications have been created yet. Sign in again to trigger
                the demo login flow.
              </p>
            ) : (
              <div className="divide-y divide-(--ui-border)">
                {notifications.map((notification) => {
                  const autoReadOnly = notification.metadata.autoReadOnly === true;

                  return (
                    <article
                      key={notification.id}
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={[
                            "mt-2 h-2 w-2 shrink-0 rounded-full",
                            notification.read_at
                              ? "bg-(--ui-border)"
                              : "bg-(--ui-fg)",
                          ].join(" ")}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="text-sm font-medium">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-(--ui-muted-fg)">
                              {formatNotificationTime(notification.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-(--ui-muted-fg)">
                            {notification.body}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-(--ui-muted-fg)">
                            <span>
                              {groupLabels[notification.group_key] ??
                                notification.group_key}
                            </span>
                            {notification.platform ? (
                              <span>{notification.platform}</span>
                            ) : null}
                            {autoReadOnly ? <span>Auto-read on login</span> : null}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onPress={() => markAsRead(notification.id)}
                          disabled={Boolean(notification.read_at) || autoReadOnly}
                        >
                          {autoReadOnly ? "Complete login" : "Mark read"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card padding="none" elevation="sm">
          <CardHeader>
            <div className="text-sm font-medium">Delivery settings</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {preferences.map((preference) => (
                <PreferenceRow
                  key={preference.group_key}
                  preference={preference}
                  onChange={updatePreference}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

function canManuallyMarkRead(notification: Notification) {
  return (
    !notification.read_at &&
    notification.metadata.autoReadOnly !== true &&
    notification.type !== "login_platform_prompt"
  );
}

function PreferenceRow({
  preference,
  onChange,
}: {
  preference: NotificationPreference;
  onChange: (
    groupKey: string,
    patch: Partial<
      Pick<
        NotificationPreference,
        "in_app_enabled" | "email_enabled" | "push_enabled"
      >
    >,
  ) => Promise<NotificationPreference | null>;
}) {
  return (
    <SettingsRow
      label={groupLabels[preference.group_key] ?? preference.group_key}
      description="Controls delivery for this notification group."
      actions={
        <>
          <Checkbox
            label="In-app"
            checked={preference.in_app_enabled}
            onChange={(checked) =>
              void onChange(preference.group_key, { in_app_enabled: checked })
            }
          />
          <Checkbox
            label="Email"
            checked={preference.email_enabled}
            onChange={(checked) =>
              void onChange(preference.group_key, { email_enabled: checked })
            }
          />
          <Checkbox
            label="Push"
            checked={preference.push_enabled}
            onChange={(checked) =>
              void onChange(preference.group_key, { push_enabled: checked })
            }
          />
        </>
      }
    />
  );
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
