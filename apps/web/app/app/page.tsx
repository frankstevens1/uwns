"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Braces, Play, RefreshCw, Square } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  CodeBlock,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  Tip,
} from "@repo/ui";
import { useActivity } from "@repo/providers";
import type { ActivityEvent, ActivityMetadata } from "@repo/lib";

type PendingActivityEvent = {
  eventName: string;
  metadata: ActivityMetadata;
  uniqueKey?: string;
  occurredAt: string;
};

type ActivityStopwatchProps = {
  onEventTracked: () => void | Promise<void>;
};

let homeVisitTracked = false;

function timestamp() {
  return new Date().toISOString();
}

function formatStopwatch(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function makeHomeViewedEvent(): PendingActivityEvent {
  const occurredAt = timestamp();
  return {
    eventName: "home_viewed",
    uniqueKey: "web:home_viewed",
    occurredAt,
    metadata: {
      source: "home",
      screen: "app_home",
      trigger: "first_page_visit",
      timestamp: occurredAt,
    },
  };
}

function makeTimerStartedEvent(runId: string): PendingActivityEvent {
  const occurredAt = timestamp();
  return {
    eventName: "timer_started",
    occurredAt,
    metadata: {
      source: "home_demo",
      controlId: "timer-toggle",
      runId,
      state: "running",
      timestamp: occurredAt,
    },
  };
}

function makeTimerStoppedEvent(runId: string, durationMs: number): PendingActivityEvent {
  const occurredAt = timestamp();
  return {
    eventName: "timer_stopped",
    occurredAt,
    metadata: {
      source: "home_demo",
      controlId: "timer-toggle",
      runId,
      state: "stopped",
      durationMs,
      durationSeconds: Math.round(durationMs / 1000),
      timestamp: occurredAt,
    },
  };
}

const activityStopwatchExample = `function ActivityStopwatch({ onEventTracked }: ActivityStopwatchProps) {
  const { trackEvent } = useActivity();
  const [running, setRunning] = React.useState(false);
  const startedAt = React.useRef<number | null>(null);
  const runId = React.useRef<string | null>(null);

  async function send(event: PendingActivityEvent) {
    await trackEvent({
      eventName: event.eventName,
      metadata: event.metadata,
      uniqueKey: event.uniqueKey,
      occurredAt: event.occurredAt,
    });

    await onEventTracked();
  }

  async function startTimer() {
    const nextRunId = \`timer-\${Date.now()}\`;
    runId.current = nextRunId;
    startedAt.current = Date.now();
    setRunning(true);
    await send(makeTimerStartedEvent(nextRunId));
  }

  async function stopTimer() {
    if (!startedAt.current) return;

    const durationMs = Date.now() - startedAt.current;
    const event = makeTimerStoppedEvent(runId.current ?? "timer-demo", durationMs);

    await send(event);
    setRunning(false);
  }

  return (
    <button onClick={running ? stopTimer : startTimer}>
      {running ? "Stop" : "Start"}
    </button>
  );
}`;

function ActivityStopwatch({ onEventTracked }: ActivityStopwatchProps) {
  const { trackEvent } = useActivity();
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const startedAt = React.useRef<number | null>(null);
  const runId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!timerRunning || !startedAt.current) return;

    const interval = window.setInterval(() => {
      if (!startedAt.current) return;
      setElapsedMs(Date.now() - startedAt.current);
    }, 250);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const trackTimerEvent = React.useCallback(
    async (event: PendingActivityEvent) => {
      await trackEvent({
        eventName: event.eventName,
        metadata: event.metadata,
        uniqueKey: event.uniqueKey,
        occurredAt: event.occurredAt,
      });

      await onEventTracked();
    },
    [onEventTracked, trackEvent],
  );

  const onTimerPress = async () => {
    if (busy) return;

    setBusy(true);
    try {
      if (!timerRunning) {
        const nextRunId = `timer-${Date.now()}`;
        runId.current = nextRunId;
        startedAt.current = Date.now();
        setElapsedMs(0);
        setTimerRunning(true);
        await trackTimerEvent(makeTimerStartedEvent(nextRunId));
        return;
      }

      const durationMs = startedAt.current ? Date.now() - startedAt.current : 0;
      const currentRunId = runId.current ?? `timer-${Date.now()}`;
      startedAt.current = null;
      runId.current = null;
      setTimerRunning(false);
      setElapsedMs(durationMs);
      await trackTimerEvent(makeTimerStoppedEvent(currentRunId, durationMs));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full h-fit max-w-64 rounded-lg border border-(--ui-border) bg-(--ui-subtle-bg) p-3 shadow-inner">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-medium text-(--ui-muted-fg)">Stopwatch</div>
          <div className="rounded-md border border-(--ui-border) bg-(--ui-bg) px-2 py-1 text-xs text-(--ui-muted-fg)">
            {timerRunning ? "Running" : "Idle"}
          </div>
        </div>
        <div className="rounded-md border border-(--ui-border) bg-(--ui-bg) px-3 py-3 text-center font-mono text-3xl font-semibold tabular-nums text-(--ui-fg)">
          {formatStopwatch(elapsedMs)}
        </div>
        <button
          type="button"
          onClick={onTimerPress}
          disabled={busy}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-(--ui-border) bg-(--ui-bg) text-sm font-medium text-(--ui-fg) disabled:opacity-60"
        >
          {timerRunning ? <Square size={15} /> : <Play size={15} />}
          {busy ? "Saving..." : timerRunning ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}

export default function AppHome() {
  const { resolvedTheme } = useTheme();
  const { listRecentEvents, trackEvent } = useActivity();
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<ActivityEvent | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const codeBlockTheme = resolvedTheme === "dark" ? "dark" : "light";

  const refreshEvents = React.useCallback(async () => {
    setRefreshing(true);
    try {
      setEvents(await listRecentEvents(10));
    } finally {
      setRefreshing(false);
    }
  }, [listRecentEvents]);

  const trackPageEvent = React.useCallback(
    async (event: PendingActivityEvent) => {
      await trackEvent({
        eventName: event.eventName,
        metadata: event.metadata,
        uniqueKey: event.uniqueKey,
        occurredAt: event.occurredAt,
      });
    },
    [trackEvent],
  );

  React.useEffect(() => {
    void (async () => {
      if (!homeVisitTracked) {
        homeVisitTracked = true;
        await trackPageEvent(makeHomeViewedEvent());
      }
      await refreshEvents();
    })();
  }, [refreshEvents, trackPageEvent]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Home</h2>
        <p className="max-w-2xl text-sm text-(--ui-muted-fg)">
          The <Code>/app</Code> route is the starting point for building
          product-specific authenticated flows.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 grid lg:flex flex-col grid-cols-2 gap-6 lg:gap-0">
          <ActivityStopwatch onEventTracked={refreshEvents} />

          <Card padding="none" elevation="sm" variant="subtle">
            <CardHeader divider={false}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-mono">Recent events</div>
                <Button
                  variant="primary"
                  size="sm"
                  aria-label="Refresh events"
                  disabled={refreshing}
                  onPress={() => void refreshEvents()}
                >
                  <RefreshCw
                    size={12}
                    className={refreshing ? "animate-spin" : undefined}
                  />
                  <p>Refresh</p>
                </Button>
              </div>
            </CardHeader>
            <CardBody padding="none">
              {events.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-(--ui-muted-fg)">
                  Start and stop the timer to create events.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {events.map((event, index) => (
                        <tr
                          key={`${event.id}-${index}`}
                          className="border-b border-(--ui-border) last:border-b-0"
                        >
                          <td className="px-3 py-2">
                            <div className="font-mono text-xs text-(--ui-muted-fg)">
                              {event.event_name}
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-(--ui-muted-fg)">
                            {event.platform}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`View metadata for ${event.event_name}`}
                              onPress={() => setSelectedEvent(event)}
                            >
                              <Braces size={12} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <CodeBlock
            code={activityStopwatchExample}
            filename="ActivityStopwatch.web.tsx"
            language="tsx"
            showLineNumbers={false}
            theme={codeBlockTheme}
          />
        </div>
      </div>

      <DialogRoot
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />

          <DialogContent
            position="center"
            className="max-h-[min(80vh,32rem)] w-[92vw] max-w-2xl overflow-y-auto rounded-lg border border-(--ui-border) bg-(--ui-panel) p-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>Event metadata</DialogTitle>

                <DialogDescription>
                  {selectedEvent
                    ? selectedEvent.event_name
                    : "No event selected"}
                </DialogDescription>
              </div>
            </div>

            {selectedEvent ? (
              <CodeBlock
                code={JSON.stringify(selectedEvent.metadata, null, 2)}
                filename="metadata.json"
                language="json"
                showLineNumbers={false}
                theme={codeBlockTheme}
                className="mt-4"
              />
            ) : null}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </section>
  );
}
