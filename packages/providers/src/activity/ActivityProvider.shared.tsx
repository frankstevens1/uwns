"use client";

import * as React from "react";
import { createUwnsApiClient, type ActivityPlatform } from "@repo/lib";
import type { AuthContextValue } from "../auth/auth.types";
import type { ActivityContextValue, TrackEventArgs } from "./activity.types";
import type { NotificationContextValue } from "../notifications/notifications.types";

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    "http://127.0.0.1:8000"
  );
}

export function createActivityProvider(
  useAuth: () => AuthContextValue,
  platform: ActivityPlatform,
  useNotifications?: () => NotificationContextValue,
) {
  const ActivityContext = React.createContext<ActivityContextValue | null>(null);

  function ActivityProvider({ children }: { children: React.ReactNode }) {
    const { session, supabase } = useAuth();
    const notifications = useNotifications?.();
    const applyNotificationUpdateRef = React.useRef<
      NotificationContextValue["applyActivityNotificationUpdate"] | undefined
    >(undefined);
    const warnedRef = React.useRef(false);

    React.useEffect(() => {
      applyNotificationUpdateRef.current =
        notifications?.applyActivityNotificationUpdate;
    }, [notifications?.applyActivityNotificationUpdate]);

    const client = React.useMemo(
      () =>
        createUwnsApiClient({
          baseUrl: getApiBaseUrl(),
          getAccessToken: async () => {
            if (session?.access_token) return session.access_token;

            const { data, error } = await supabase.auth.getSession();
            if (error) throw new Error(error.message);
            return data.session?.access_token ?? null;
          },
        }),
      [session?.access_token, supabase],
    );

    const trackEvent = React.useCallback(
      async ({ eventName, metadata, uniqueKey, occurredAt }: TrackEventArgs) => {
        try {
          await client.trackEvent({
            eventName,
            platform,
            metadata,
            uniqueKey,
            occurredAt,
          });
          await applyNotificationUpdateRef.current?.({ eventName, platform });
        } catch (error) {
          if (warnedRef.current) return;
          warnedRef.current = true;
          const message = error instanceof Error ? error.message : String(error);
          console.info("[ActivityProvider] trackEvent skipped:", message);
        }
      },
      [client, platform],
    );

    const listRecentEvents = React.useCallback(
      async (limit = 10) => {
        try {
          return await client.listActivityEvents({ limit });
        } catch (error) {
          if (!warnedRef.current) {
            warnedRef.current = true;
            const message = error instanceof Error ? error.message : String(error);
            console.info("[ActivityProvider] listRecentEvents skipped:", message);
          }
          return [];
        }
      },
      [client],
    );

    const value = React.useMemo<ActivityContextValue>(
      () => ({ listRecentEvents, trackEvent }),
      [listRecentEvents, trackEvent],
    );

    return (
      <ActivityContext.Provider value={value}>
        {children}
      </ActivityContext.Provider>
    );
  }

  function useActivity() {
    const ctx = React.useContext(ActivityContext);
    if (!ctx) throw new Error("useActivity must be used within <ActivityProvider>");
    return ctx;
  }

  return { ActivityProvider, useActivity };
}
