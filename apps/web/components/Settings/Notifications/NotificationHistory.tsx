"use client";

import * as React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useActions } from "@repo/providers";
import { Button } from "@repo/ui";
import type { Notification, ResolvedNotificationTarget } from "@repo/lib";
import { resolveNotificationTarget } from "@repo/lib";
import {
  canManuallyMarkRead,
  formatNotificationTime,
  getUnreadNotificationLabel,
} from "@/lib/notifications";
import {
  getGroupBadgeStyle,
  getNotificationGroupConfig,
} from "./utils";

export interface NotificationHistoryProps {
  error: string | null;
  loading: boolean;
  notifications: Notification[];
  onGoTo: (target: ResolvedNotificationTarget) => void;
  onMarkAllAsRead: () => Promise<void>;
  onMarkAsRead: (id: string) => Promise<Notification | null>;
}

export function NotificationHistoryHeader({
  notifications,
  onMarkAllAsRead,
}: {
  notifications: Notification[];
  onMarkAllAsRead: () => Promise<void>;
}) {
  const { trackAction } = useActions();
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read_at,
  );
  const hasManualUnread = notifications.some(canManuallyMarkRead);

  return (
    <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Bell size={16} />
          Notification history
        </div>
        <p className="text-xs leading-5 text-(--ui-muted-fg)">
          Unread items stay on top. Read items remain available below for
          context.
        </p>
      </div>
      {hasManualUnread ? (
        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            void trackAction({
              actionName: "notifications_mark_all_read_clicked",
              metadata: {
                source: "settings",
                screen: "notifications",
                trigger: "button",
                unreadCount: unreadNotifications.length,
              },
            });
            void onMarkAllAsRead();
          }}
        >
          <span className="inline-flex items-center gap-2">
            <CheckCheck size={14} />
            Mark all read
          </span>
        </Button>
      ) : null}
    </div>
  );
}

export function NotificationHistory(props: NotificationHistoryProps) {
  return (
    <section className="space-y-5">
      <NotificationHistoryHeader
        notifications={props.notifications}
        onMarkAllAsRead={props.onMarkAllAsRead}
      />
      <NotificationHistoryContent {...props} />
    </section>
  );
}

export function NotificationHistoryContent({
  error,
  loading,
  notifications,
  onGoTo,
  onMarkAsRead,
}: NotificationHistoryProps) {
  const { trackAction } = useActions();
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read_at,
  );
  const readNotifications = notifications.filter(
    (notification) => notification.read_at,
  );

  return (
    <>
      {loading ? (
        <NotificationStateMessage message="Loading notifications..." />
      ) : error ? (
        <NotificationStateMessage
          message={`Notifications are unavailable: ${error}`}
        />
      ) : notifications.length === 0 ? (
        <NotificationStateMessage message="No notifications." />
      ) : (
        <div>
          <NotificationSection
            count={unreadNotifications.length}
            description="Actionable notifications that still need attention."
            emptyMessage="You're all caught up."
            stickyIndex={0}
            title="Unread"
          >
            {unreadNotifications.map((notification) => {
              const resolvedTarget = resolveNotificationTarget(
                notification.target,
                "web",
              );

              return (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onGoTo={
                    resolvedTarget
                      ? () => {
                          void trackAction({
                            actionName: "notification_opened",
                            metadata: {
                              source: "settings",
                              screen: "notifications",
                              trigger: "button",
                              groupKey: notification.group_key,
                              notificationType: notification.type,
                              hasTarget: true,
                            },
                          });
                          onGoTo(resolvedTarget);
                        }
                      : undefined
                  }
                  onMarkAsRead={
                    canManuallyMarkRead(notification)
                      ? async () => {
                          const updated = await onMarkAsRead(notification.id);
                          if (!updated) return;

                          void trackAction({
                            actionName: "notification_marked_read",
                            metadata: {
                              source: "settings",
                              screen: "notifications",
                              trigger: "button",
                              groupKey: notification.group_key,
                              notificationType: notification.type,
                            },
                          });
                        }
                      : undefined
                  }
                />
              );
            })}
          </NotificationSection>

          <NotificationSection
            count={readNotifications.length}
            description="Previously handled notifications."
            emptyMessage="No read notifications yet."
            stickyIndex={1}
            title="Read"
          >
            {readNotifications.map((notification) => {
              const resolvedTarget = resolveNotificationTarget(
                notification.target,
                "web",
              );

              return (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onGoTo={
                    resolvedTarget
                      ? () => {
                          void trackAction({
                            actionName: "notification_opened",
                            metadata: {
                              source: "settings",
                              screen: "notifications",
                              trigger: "button",
                              groupKey: notification.group_key,
                              notificationType: notification.type,
                              hasTarget: true,
                            },
                          });
                          onGoTo(resolvedTarget);
                        }
                      : undefined
                  }
                />
              );
            })}
          </NotificationSection>
        </div>
      )}
    </>
  );
}

function NotificationStateMessage({ message }: { message: string }) {
  return (
    <div className="mt-2 px-4 py-4 text-xs font-light italic text-(--ui-muted-fg)">
      {message}
    </div>
  );
}

function NotificationSection({
  title,
  count,
  description,
  emptyMessage,
  stickyIndex,
  children,
  first,
}: {
  title: string;
  count: number;
  description: string;
  emptyMessage: string;
  stickyIndex: number;
  children: React.ReactNode;
  first?: boolean;
}) {
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const scrollToSectionTop = React.useCallback(() => {
    const header = headerRef.current;
    const list = listRef.current;
    const scrollContainer = header?.closest(
      "[data-settings-history-scroll]",
    );

    if (
      !header ||
      !list ||
      !(scrollContainer instanceof HTMLElement) ||
      scrollContainer.scrollHeight <= scrollContainer.clientHeight
    ) {
      list?.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }

    const stackedHeaderHeight = header.offsetHeight * (stickyIndex + 1);
    scrollContainer.scrollTo({
      top: Math.max(0, list.offsetTop - stackedHeaderHeight),
      behavior: "smooth",
    });
  }, [stickyIndex]);

  return (
    <>
      {stickyIndex > 0 ? <div aria-hidden className="h-6" /> : null}
      <div
        ref={headerRef}
        className="relative flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-(--ui-bg) py-2 lg:sticky lg:z-20"
        style={{
          top: `calc(var(--settings-history-sticky-row) * ${stickyIndex})`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-full hidden h-3 lg:block"
          style={{
            background:
              "linear-gradient(to bottom, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />
        <div className="flex items-baseline gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-(--ui-muted-fg)">
            <button
              type="button"
              className="cursor-pointer rounded-sm text-left uppercase tracking-wide transition hover:text-(--ui-fg) focus:outline-none focus:ring-2 focus:ring-(--ui-border)"
              onClick={scrollToSectionTop}
            >
              {title}
            </button>
          </h3>
          <span className="rounded-full border border-(--ui-border) px-1.5 py-0.5 text-[10px] leading-none text-(--ui-muted-fg)">
            {count}
          </span>
        </div>
        <p className="text-xs text-(--ui-muted-fg)">{description}</p>
        <div className="border-b border-(--ui-border) absolute left-0 right-0 top-full -mt-px hidden lg:block" />
      </div>

      {count === 0 ? (
        <div
          ref={listRef}
          className="mt-2 px-4 py-4 text-xs font-light italic text-(--ui-muted-fg)"
        >
          {emptyMessage}
        </div>
      ) : (
        <div ref={listRef} className="mt-2 divide-y divide-(--ui-border)">
          {children}
        </div>
      )}
    </>
  );
}

function NotificationRow({
  notification,
  onMarkAsRead,
  onGoTo,
}: {
  notification: Notification;
  onMarkAsRead?: () => void;
  onGoTo?: () => void;
}) {
  const unreadLabel = getUnreadNotificationLabel(notification);
  const groupStyle = getGroupBadgeStyle(notification.group_key);
  const groupLabel = getNotificationGroupConfig(notification.group_key).label;
  const isUnread = !notification.read_at;

  return (
    <article className="py-3">
      <div className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-3">
        <span
          aria-hidden="true"
          className={[
            "mt-1.5 h-2 w-2 rounded-full",
            isUnread ? "bg-(--ui-fg)" : "bg-(--ui-border)",
          ].join(" ")}
        />

        <div className="min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h4
              className={[
                "min-w-0 truncate text-sm font-medium",
                isUnread ? "text-(--ui-fg)" : "text-(--ui-muted-fg)",
              ].join(" ")}
            >
              {notification.title}
            </h4>
            <span className="shrink-0 text-[11px] text-(--ui-muted-fg)">
              {formatNotificationTime(notification.created_at)}
            </span>
          </div>

          <p className="line-clamp-2 text-[13px] leading-5 text-(--ui-muted-fg)">
            {notification.body}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4"
                style={groupStyle}
              >
                {groupLabel}
              </span>
              {unreadLabel ? (
                <span className="text-[11px] text-(--ui-muted-fg)">
                  {unreadLabel}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onMarkAsRead ? (
                <Button variant="outline" size="sm" onPress={onMarkAsRead}>
                  Mark read
                </Button>
              ) : null}
              {onGoTo ? (
                <Button variant="primary" size="sm" onPress={onGoTo}>
                  Go to target
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
