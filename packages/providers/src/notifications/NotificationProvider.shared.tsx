"use client";

import * as React from "react";
import {
  createUwnsApiClient,
  type CreateNotificationInput,
  type Notification,
  type NotificationPreference,
  type NotificationPreferencePatch,
} from "@repo/lib";
import type { AuthContextValue } from "../auth/auth.types";
import type { NotificationContextValue } from "./notifications.types";

type PushRegistration = {
  register: () => Promise<{ token: string; deviceId?: string } | null>;
};

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    "http://127.0.0.1:8000"
  );
}

function sortNotifications(items: Notification[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function upsertNotification(items: Notification[], next: Notification) {
  if (!next.in_app_visible) {
    return items.filter((item) => item.id !== next.id);
  }
  return sortNotifications([
    next,
    ...items.filter((item) => item.id !== next.id),
  ]);
}

function upsertPreference(
  items: NotificationPreference[],
  next: NotificationPreference,
) {
  return [
    next,
    ...items.filter((item) => item.group_key !== next.group_key),
  ].sort((a, b) => a.group_key.localeCompare(b.group_key));
}

function getAutoReadEventName(notification: Notification) {
  const value = notification.metadata.autoReadEventName;
  return typeof value === "string" ? value : null;
}

export function createNotificationsProvider(
  useAuth: () => AuthContextValue,
  pushRegistration?: PushRegistration,
) {
  const NotificationsContext =
    React.createContext<NotificationContextValue | null>(null);

  function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const { session, supabase, user } = useAuth();
    const warnedRef = React.useRef(false);
    const loadedRef = React.useRef(false);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [preferences, setPreferences] = React.useState<NotificationPreference[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const client = React.useMemo(
      () =>
        createUwnsApiClient({
          baseUrl: getApiBaseUrl(),
          getAccessToken: async () => {
            if (session?.access_token) return session.access_token;

            const { data, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw new Error(sessionError.message);
            return data.session?.access_token ?? null;
          },
        }),
      [session?.access_token, supabase],
    );

    const refreshNotifications = React.useCallback(async (options?: { silent?: boolean; allowMissingUser?: boolean }) => {
      if (!user && !options?.allowMissingUser) {
        setNotifications([]);
        setPreferences([]);
        loadedRef.current = false;
        setLoading(false);
        return;
      }

      if (!loadedRef.current && !options?.silent) setLoading(true);
      setError(null);
      try {
        const [nextNotifications, nextPreferences] = await Promise.all([
          client.listNotifications({ limit: 50 }),
          client.listNotificationPreferences(),
        ]);
        setNotifications(sortNotifications(nextNotifications));
        setPreferences(nextPreferences);
        loadedRef.current = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        if (!warnedRef.current) {
          warnedRef.current = true;
          console.info("[NotificationsProvider] refresh skipped:", message);
        }
      } finally {
        setLoading(false);
      }
    }, [client, user]);

    React.useEffect(() => {
      void refreshNotifications();
    }, [refreshNotifications]);

    React.useEffect(() => {
      if (!user) return;

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: { eventType: string; new: unknown; old: unknown }) => {
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id?: string };
              if (oldRow.id) {
                setNotifications((items) =>
                  items.filter((item) => item.id !== oldRow.id),
                );
              }
              return;
            }
            setNotifications((items) =>
              upsertNotification(items, payload.new as Notification),
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notification_preferences",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: { eventType: string; new: unknown }) => {
            if (payload.eventType === "DELETE") return;
            setPreferences((items) =>
              upsertPreference(items, payload.new as NotificationPreference),
            );
          },
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    }, [supabase, user]);

    React.useEffect(() => {
      if (!user || !pushRegistration) return;

      pushRegistration
        .register()
        .then((result) => {
          if (!result) return;
          return client.registerPushToken(result);
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : String(err);
          console.info("[NotificationsProvider] push registration skipped:", message);
        });
    }, [client, pushRegistration, user]);

    const createNotification = React.useCallback(
      async (input: CreateNotificationInput) => {
        try {
          const created = await client.createNotification(input);
          setNotifications((items) => upsertNotification(items, created));
          return created;
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          return null;
        }
      },
      [client],
    );

    const markAsRead = React.useCallback(
      async (id: string) => {
        try {
          const updated = await client.markNotificationRead(id);
          setNotifications((items) => upsertNotification(items, updated));
          return updated;
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          return null;
        }
      },
      [client],
    );

    const markAllAsRead = React.useCallback(async () => {
      try {
        const updated = await client.markAllNotificationsRead();
        setNotifications((items) =>
          sortNotifications(
            items.map((item) => updated.find((next) => next.id === item.id) ?? item),
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }, [client]);

    const applyActivityNotificationUpdate = React.useCallback(
      async ({
        eventName,
        platform,
      }: {
        eventName: string;
        platform: "web" | "native";
      }) => {
        const uniqueKey =
          eventName === "account_viewed"
            ? "demo:view_account"
            : eventName === "logged_in"
              ? `demo:login:${platform}`
              : null;

        const now = new Date().toISOString();
        setNotifications((items) =>
          items.map((item) =>
            !item.read_at &&
            ((uniqueKey !== null && item.unique_key === uniqueKey) ||
              getAutoReadEventName(item) === eventName)
              ? { ...item, read_at: now, updated_at: now }
              : item,
          ),
        );

        if (eventName === "logged_in" || eventName === "signed_up") {
          await refreshNotifications({ silent: true, allowMissingUser: true });
        }
      },
      [refreshNotifications],
    );

    const updatePreference = React.useCallback(
      async (groupKey: string, patch: NotificationPreferencePatch) => {
        try {
          const updated = await client.updateNotificationPreference(groupKey, patch);
          setPreferences((items) => upsertPreference(items, updated));
          return updated;
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          return null;
        }
      },
      [client],
    );

    const unreadCount = notifications.filter((item) => !item.read_at).length;
    const value = React.useMemo<NotificationContextValue>(
      () => ({
        notifications,
        preferences,
        unreadCount,
        loading,
        error,
        refreshNotifications,
        applyActivityNotificationUpdate,
        createNotification,
        markAsRead,
        markAllAsRead,
        updatePreference,
      }),
      [
        applyActivityNotificationUpdate,
        createNotification,
        error,
        loading,
        markAllAsRead,
        markAsRead,
        notifications,
        preferences,
        refreshNotifications,
        unreadCount,
        updatePreference,
      ],
    );

    return (
      <NotificationsContext.Provider value={value}>
        {children}
      </NotificationsContext.Provider>
    );
  }

  function useNotifications() {
    const ctx = React.useContext(NotificationsContext);
    if (!ctx) {
      throw new Error(
        "useNotifications must be used within <NotificationsProvider>",
      );
    }
    return ctx;
  }

  return { NotificationsProvider, useNotifications };
}
