export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export type ActivityPlatform = "web" | "native";

export type ActivityMetadata = Record<string, unknown>;

export type TrackEventInput = {
  eventName: string;
  platform: ActivityPlatform;
  metadata?: ActivityMetadata;
  uniqueKey?: string;
  occurredAt?: string;
};

export type ActivityEvent = {
  id: string;
  user_id: string;
  event_name: string;
  platform: ActivityPlatform;
  metadata: ActivityMetadata;
  unique_key: string | null;
  occurred_at: string;
  created_at: string;
};

export type ListActivityEventsInput = {
  limit?: number;
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
    trackEvent: (input: TrackEventInput) =>
      request<ActivityEvent>("/v1/events", {
        method: "POST",
        body: JSON.stringify({
          event_name: input.eventName,
          platform: input.platform,
          metadata: input.metadata ?? {},
          unique_key: input.uniqueKey,
          occurred_at: input.occurredAt ?? new Date().toISOString(),
        }),
      }),
    listActivityEvents: (input: ListActivityEventsInput = {}) => {
      const params = new URLSearchParams();
      params.set("limit", String(input.limit ?? 5));
      return request<ActivityEvent[]>(`/v1/events?${params.toString()}`);
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
