import * as React from "react";
import type { ActivityEvent } from "@repo/lib";
import { useActivity } from "@repo/providers";
import { ActivityPlatforms } from "./ActivityPlatforms.native";

const ACTIVITY_LIMIT = 100;

export function ActivitiesSection() {
  const { listRecentEvents } = useActivity();
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refreshEvents = React.useCallback(async () => {
    setError(null);
    try {
      setEvents(await listRecentEvents(ACTIVITY_LIMIT));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [listRecentEvents]);

  React.useEffect(() => {
    void refreshEvents();
  }, [refreshEvents]);

  return (
    <ActivityPlatforms activities={events} error={error} loading={loading} />
  );
}
