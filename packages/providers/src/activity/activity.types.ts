import type { ActivityEvent, ActivityMetadata } from "@repo/lib";

export type TrackEventArgs = {
  eventName: string;
  metadata?: ActivityMetadata;
  uniqueKey?: string;
  occurredAt?: string;
};

export type ActivityContextValue = {
  trackEvent: (args: TrackEventArgs) => Promise<void>;
  listRecentEvents: (limit?: number) => Promise<ActivityEvent[]>;
};
