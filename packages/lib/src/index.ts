import type {
  NotificationPlatform,
  NotificationTarget,
} from "./notifications";

export * from "./notifications";
export * from "./docs";

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export type ActionPlatform = NotificationPlatform;

export type ActionMetadata = Record<string, unknown>;

export type TrackActionInput = {
  actionName: string;
  platform: ActionPlatform;
  metadata?: ActionMetadata;
  uniqueKey?: string;
  occurredAt?: string;
};

export type Action = {
  id: string;
  user_id: string;
  action_name: string;
  platform: ActionPlatform;
  metadata: ActionMetadata;
  unique_key: string | null;
  occurred_at: string;
  created_at: string;
};

export type ListActionsInput = {
  limit?: number;
};

export type NotificationChannels = {
  inApp?: boolean;
  email?: boolean;
  push?: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  group_key: string;
  type: string;
  title: string;
  body: string;
  platform: NotificationPlatform | null;
  target: NotificationTarget | null;
  in_app_visible: boolean;
  metadata: Record<string, unknown>;
  unique_key: string | null;
  source_action_id: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateNotificationInput = {
  groupKey: string;
  type?: string;
  title: string;
  body: string;
  platform?: NotificationPlatform;
  target?: NotificationTarget;
  metadata?: Record<string, unknown>;
  uniqueKey?: string;
  sourceActionId?: string;
  channels?: NotificationChannels;
};

export type ListNotificationsInput = {
  limit?: number;
};

export type NotificationPreference = {
  id: string;
  user_id: string;
  group_key: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type NotificationPreferencePatch = Partial<
  Pick<
    NotificationPreference,
    "in_app_enabled" | "email_enabled" | "push_enabled"
  >
>;

export type RegisterPushTokenInput = {
  token: string;
  deviceId?: string;
};

export type UwnsApiClientConfig = {
  baseUrl: string;
  getAccessToken: () => string | null | Promise<string | null>;
};

export class UwnsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "UwnsApiError";
  }
}

export function createUwnsApiClient(config: UwnsApiClientConfig) {
  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const accessToken = await config.getAccessToken();
    if (!accessToken) {
      throw new UwnsApiError("Missing Supabase access token", 401);
    }

    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const message = await readErrorMessage(response);
      throw new UwnsApiError(message, response.status);
    }

    return response.json() as Promise<T>;
  };

  return {
    trackAction: (input: TrackActionInput) =>
      request<Action>("/v1/actions", {
        method: "POST",
        body: JSON.stringify({
          action_name: input.actionName,
          platform: input.platform,
          metadata: input.metadata ?? {},
          unique_key: input.uniqueKey,
          occurred_at: input.occurredAt ?? new Date().toISOString(),
        }),
      }),
    listActions: (input: ListActionsInput = {}) => {
      const params = new URLSearchParams();
      params.set("limit", String(input.limit ?? 5));
      return request<Action[]>(`/v1/actions?${params.toString()}`);
    },
    createNotification: (input: CreateNotificationInput) =>
      request<Notification>("/v1/notifications", {
        method: "POST",
        body: JSON.stringify({
          group_key: input.groupKey,
          type: input.type ?? "info",
          title: input.title,
          body: input.body,
          platform: input.platform,
          target: input.target,
          metadata: input.metadata ?? {},
          unique_key: input.uniqueKey,
          source_action_id: input.sourceActionId,
          channels: input.channels
            ? {
                in_app: input.channels.inApp,
                email: input.channels.email,
                push: input.channels.push,
              }
            : undefined,
        }),
      }),
    listNotifications: (input: ListNotificationsInput = {}) => {
      const params = new URLSearchParams();
      params.set("limit", String(input.limit ?? 25));
      return request<Notification[]>(`/v1/notifications?${params.toString()}`);
    },
    markNotificationRead: (id: string) =>
      request<Notification>(`/v1/notifications/${id}/read`, {
        method: "POST",
      }),
    markAllNotificationsRead: () =>
      request<Notification[]>("/v1/notifications/read-all", {
        method: "POST",
      }),
    listNotificationPreferences: () =>
      request<NotificationPreference[]>("/v1/notifications/preferences"),
    updateNotificationPreference: (
      groupKey: string,
      patch: NotificationPreferencePatch,
    ) =>
      request<NotificationPreference>(
        `/v1/notifications/preferences/${encodeURIComponent(groupKey)}`,
        {
          method: "PATCH",
          body: JSON.stringify(patch),
        },
      ),
    registerPushToken: (input: RegisterPushTokenInput) =>
      request<Record<string, unknown>>("/v1/notifications/push-tokens", {
        method: "POST",
        body: JSON.stringify({
          token: input.token,
          device_id: input.deviceId,
        }),
      }),
    unregisterPushToken: (token: string) => {
      const params = new URLSearchParams({ token });
      return request<{ ok: boolean }>(
        `/v1/notifications/push-tokens?${params.toString()}`,
        { method: "DELETE" },
      );
    },
  };
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { detail?: unknown; message?: unknown };
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
  } catch {
    // fall through to status text
  }

  return response.statusText || "API request failed";
}
