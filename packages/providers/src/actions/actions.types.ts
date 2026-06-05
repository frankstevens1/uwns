import type { Action, ActionMetadata } from "@repo/lib";

export type TrackActionArgs = {
  actionName: string;
  metadata?: ActionMetadata;
  uniqueKey?: string;
  occurredAt?: string;
};

export type ActionContextValue = {
  actions: Action[];
  loading: boolean;
  error: string | null;
  trackAction: (args: TrackActionArgs) => Promise<void>;
  listRecentActions: (limit?: number) => Promise<Action[]>;
  refreshActions: (limit?: number) => Promise<Action[]>;
};
