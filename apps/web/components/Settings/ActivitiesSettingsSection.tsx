"use client";

import * as React from "react";

import type { ActivityEvent } from "@repo/lib";
import { useActivity } from "@repo/providers";
import ActivityHistory from "./Activities/ActivityHistory";
import { ActivityDemo } from "./Activities/demo/ActivityDemo";
import { ActivityPlatforms } from "./Activities/ActivityPlatforms.web";
import { getActivitiesForPlatform } from "./Activities/utils";

const ACTIVITY_LIMIT = 100;

export function ActivitiesSettingsSection() {
  const { listRecentEvents, trackEvent } = useActivity();
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPlatformKey, setSelectedPlatformKey] = React.useState<
    string | null
  >(null);
  const historyEvents = React.useMemo(
    () => getActivitiesForPlatform(events, selectedPlatformKey),
    [events, selectedPlatformKey],
  );

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

  const triggerDemoActivity = React.useCallback(async () => {
    await trackEvent({
      eventName: "demo_activity_triggered",
      uniqueKey: makeDemoActivityUniqueKey(),
      metadata: {
        source: "settings",
        screen: "settings_activities",
        trigger: "demo_button",
      },
    });
    await refreshEvents();
  }, [refreshEvents, trackEvent]);

  React.useEffect(() => {
    void (async () => {
      await trackEvent({
        eventName: "activities_viewed",
        uniqueKey: "web:settings:activities_viewed",
        metadata: {
          source: "settings",
          screen: "settings_activities",
          trigger: "first_page_visit",
        },
      });
      await refreshEvents();
    })();
  }, [refreshEvents, trackEvent]);

  return (
    <section className="space-y-6">
      <ActivityDemo onTrigger={triggerDemoActivity} />
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <ActivityPlatforms
          activities={events}
          onSelectedPlatformKeyChange={setSelectedPlatformKey}
        />
        <ActivityHistory
          error={error}
          loading={loading}
          events={historyEvents}
        />
      </div>
    </section>
  );
}

function makeDemoActivityUniqueKey() {
  const suffix = `${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  return `web:settings:activities:demo:${suffix}`;
}
