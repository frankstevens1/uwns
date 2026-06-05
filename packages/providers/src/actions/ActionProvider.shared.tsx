"use client";

import * as React from "react";
import {
  createUwnsApiClient,
  type Action,
  type ActionPlatform,
} from "@repo/lib";
import type { AuthContextValue } from "../auth/auth.types";
import type { ActionContextValue, TrackActionArgs } from "./actions.types";
import type { NotificationContextValue } from "../notifications/notifications.types";

const DEFAULT_ACTION_LIMIT = 100;

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    "http://127.0.0.1:8000"
  );
}

function sortActions(items: Action[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );
}

function upsertAction(items: Action[], next: Action, limit: number) {
  return sortActions([next, ...items.filter((item) => item.id !== next.id)]).slice(
    0,
    limit,
  );
}

export function createActionsProvider(
  useAuth: () => AuthContextValue,
  platform: ActionPlatform,
  useNotifications?: () => NotificationContextValue,
) {
  const ActionsContext = React.createContext<ActionContextValue | null>(null);

  function ActionProvider({ children }: { children: React.ReactNode }) {
    const { session, supabase, user } = useAuth();
    const notifications = useNotifications?.();
    const applyNotificationUpdateRef = React.useRef<
      NotificationContextValue["applyActionNotificationUpdate"] | undefined
    >(undefined);
    const trackWarnedRef = React.useRef(false);
    const listWarnedRef = React.useRef(false);
    const limitRef = React.useRef(DEFAULT_ACTION_LIMIT);
    const [actions, setActions] = React.useState<Action[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      applyNotificationUpdateRef.current =
        notifications?.applyActionNotificationUpdate;
    }, [notifications?.applyActionNotificationUpdate]);

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

    const loadActions = React.useCallback(
      async (
        limit = DEFAULT_ACTION_LIMIT,
        options?: { silent?: boolean },
      ) => {
        limitRef.current = limit;
        if (!user) {
          setActions([]);
          setLoading(false);
          setError(null);
          return [];
        }

        if (!options?.silent) setLoading(true);
        setError(null);
        try {
          const nextActions = await client.listActions({ limit });
          setActions(sortActions(nextActions));
          return nextActions;
        } catch (error) {
          if (!listWarnedRef.current) {
            listWarnedRef.current = true;
            const message = error instanceof Error ? error.message : String(error);
            console.info("[ActionProvider] listRecentActions failed:", message);
          }
          const message = error instanceof Error ? error.message : String(error);
          setError(message);
          throw error;
        } finally {
          if (!options?.silent) setLoading(false);
        }
      },
      [client, user],
    );

    const refreshActions = React.useCallback(
      (limit = DEFAULT_ACTION_LIMIT) => loadActions(limit),
      [loadActions],
    );

    React.useEffect(() => {
      void refreshActions().catch(() => undefined);
    }, [refreshActions]);

    React.useEffect(() => {
      if (!user) return;

      const channel = supabase
        .channel(`actions:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "actions",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: { eventType: string; new: unknown; old: unknown }) => {
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id?: string };
              if (oldRow.id) {
                setActions((items) =>
                  items.filter((item) => item.id !== oldRow.id),
                );
              }
              return;
            }
            setActions((items) =>
              upsertAction(items, payload.new as Action, limitRef.current),
            );
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            void loadActions(limitRef.current, { silent: true }).catch(
              () => undefined,
            );
          }
        });

      return () => {
        void supabase.removeChannel(channel);
      };
    }, [loadActions, supabase, user]);

    const trackAction = React.useCallback(
      async ({ actionName, metadata, uniqueKey, occurredAt }: TrackActionArgs) => {
        try {
          const created = await client.trackAction({
            actionName,
            platform,
            metadata,
            uniqueKey,
            occurredAt,
          });
          setActions((items) =>
            upsertAction(items, created, limitRef.current),
          );
          await applyNotificationUpdateRef.current?.({ actionName, platform });
        } catch (error) {
          if (trackWarnedRef.current) return;
          trackWarnedRef.current = true;
          const message = error instanceof Error ? error.message : String(error);
          console.info("[ActionProvider] trackAction skipped:", message);
        }
      },
      [client, platform],
    );

    const listRecentActions = refreshActions;

    const value = React.useMemo<ActionContextValue>(
      () => ({
        actions,
        loading,
        error,
        trackAction,
        listRecentActions,
        refreshActions,
      }),
      [
        actions,
        error,
        listRecentActions,
        loading,
        refreshActions,
        trackAction,
      ],
    );

    return (
      <ActionsContext.Provider value={value}>
        {children}
      </ActionsContext.Provider>
    );
  }

  function useActions() {
    const ctx = React.useContext(ActionsContext);
    if (!ctx) throw new Error("useActions must be used within <ActionProvider>");
    return ctx;
  }

  return { ActionProvider, useActions };
}
