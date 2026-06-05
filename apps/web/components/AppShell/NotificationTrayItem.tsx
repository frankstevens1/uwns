"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { Notification } from "@repo/lib";
import { resolveNotificationTarget } from "@repo/lib";
import { useActions } from "@repo/providers";
import {
  canManuallyMarkRead,
  getUnreadNotificationLabel,
} from "../../lib/notifications";

export default function NotificationTrayItem({
  notification,
  onOpen,
  onMarkAsRead,
}: {
  notification: Notification;
  onOpen: () => void;
  onMarkAsRead: () => void | Promise<Notification | null>;
}) {
  const { trackAction } = useActions();
  const unreadLabel = getUnreadNotificationLabel(notification);
  const detailText = unreadLabel;
  const canMarkRead = canManuallyMarkRead(notification);
  const resolvedTarget = resolveNotificationTarget(notification.target, "web");

  const handleOpen = () => {
    void trackAction({
      actionName: "notification_opened",
      metadata: {
        source: "header_tray",
        groupKey: notification.group_key,
        notificationType: notification.type,
        hasTarget: Boolean(resolvedTarget),
      },
    });
    onOpen();
  };

  const handleMarkAsRead = async () => {
    const updated = await onMarkAsRead();
    if (!updated) return;

    void trackAction({
      actionName: "notification_marked_read",
      metadata: {
        source: "header_tray",
        groupKey: notification.group_key,
        notificationType: notification.type,
      },
    });
  };

  return (
    <article className="px-2 py-1.5">
      <div className="border-b border-(--ui-border) py-2 last:border-b-0">
        <div className="flex items-start gap-2">
          <span
            aria-hidden="true"
            className={[
              "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
              notification.read_at ? "bg-(--ui-border)" : "bg-(--ui-fg)",
            ].join(" ")}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                {resolvedTarget ? (
                  resolvedTarget.type === "external_url" ? (
                    <a
                      href={resolvedTarget.href}
                      onClick={handleOpen}
                      className="block cursor-pointer truncate text-xs font-medium leading-4 text-(--ui-fg) transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-border)"
                    >
                      {notification.title}
                    </a>
                  ) : (
                    <Link
                      href={resolvedTarget.href}
                      onClick={handleOpen}
                      className="block cursor-pointer truncate text-xs font-medium leading-4 text-(--ui-fg) transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-border)"
                    >
                      {notification.title}
                    </Link>
                  )
                ) : (
                  <div className="truncate text-xs font-medium leading-4 text-(--ui-fg)">
                    {notification.title}
                  </div>
                )}
                {detailText ? (
                  <div className="mt-0.5 text-[10px] leading-4 text-(--ui-muted-fg)">
                    {detailText}
                  </div>
                ) : null}
              </div>

              {canMarkRead ? (
                <button
                  type="button"
                  aria-label={`Mark ${notification.title} read`}
                  onClick={() => {
                    void handleMarkAsRead();
                  }}
                  className={[
                    "inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full",
                    "text-(--ui-muted-fg) transition",
                    "hover:text-(--ui-fg)",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-border)",
                  ].join(" ")}
                >
                  <Check size={13} />
                </button>
              ) : null}
            </div>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--ui-muted-fg)">
              {notification.body}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
