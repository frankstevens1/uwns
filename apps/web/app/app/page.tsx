"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Braces, RefreshCw } from "lucide-react";
import {
  abbreviatedCodeSnippet,
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
  Stopwatch,
  type StopwatchStartEvent,
  type StopwatchStopEvent,
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

const activityStopwatchWebExample = abbreviatedCodeSnippet([
  `"use client";

import {
  Stopwatch,
  type StopwatchStartEvent,
  type StopwatchStopEvent,
} from "@repo/ui";
import { useActivity } from "@repo/providers";`,
  `export function ActivityStopwatch({ onEventTracked }: ActivityStopwatchProps) {
  const { trackEvent } = useActivity();

  async function handleStart({ runId, startedAt }: StopwatchStartEvent) {
    await trackEvent({
      eventName: "timer_started",
      occurredAt: startedAt,
      metadata: { source: "home_demo", runId, state: "running" },
    });
    await onEventTracked();
  }

  async function handleStop(event: StopwatchStopEvent) {
    await trackEvent({
      eventName: "timer_stopped",
      occurredAt: event.stoppedAt,
      metadata: {
        source: "home_demo",
        runId: event.runId,
        state: "stopped",
        durationSeconds: event.durationSeconds,
      },
    });
    await onEventTracked();
  }

  return <Stopwatch onStart={handleStart} onStop={handleStop} />;
}`,
]);

const activityStopwatchNativeExample = abbreviatedCodeSnippet([
  `import {
  Stopwatch,
  type StopwatchStartEvent,
  type StopwatchStopEvent,
} from "@repo/ui";
import { useActivity } from "@repo/providers";`,
  `export function ActivityStopwatch({ onEventTracked }: ActivityStopwatchProps) {
  const { trackEvent } = useActivity();

  async function handleStart({ runId, startedAt }: StopwatchStartEvent) {
    await trackEvent({
      eventName: "timer_started",
      occurredAt: startedAt,
      metadata: { source: "home_demo", runId, state: "running" },
    });
    await onEventTracked();
  }

  async function handleStop(event: StopwatchStopEvent) {
    await trackEvent({
      eventName: "timer_stopped",
      occurredAt: event.stoppedAt,
      metadata: {
        source: "home_demo",
        runId: event.runId,
        state: "stopped",
        durationSeconds: event.durationSeconds,
      },
    });
    await onEventTracked();
  }

  return <Stopwatch onStart={handleStart} onStop={handleStop} />;
}`,
]);

const webLayoutExample = abbreviatedCodeSnippet([
  `import { ActivityProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Shell } from "@/components/Shell";`,
  `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ActivityProvider>
          <Shell>{children}</Shell>
        </ActivityProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}`,
]);

const nativeLayoutExample = abbreviatedCodeSnippet([
  `import { Stack } from "expo-router";
import { ActivityProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider, darkTokens, lightTokens } from "@repo/ui";
import { useColorScheme } from "react-native";`,
  `export default function RootLayout() {
  const scheme = useColorScheme();
  const tokens = scheme === "dark" ? darkTokens : lightTokens;

  return (
    <AuthProvider>
      <ActivityProvider>
        <ThemeProvider tokens={tokens}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </ActivityProvider>
    </AuthProvider>
  );
}`,
]);

function ActivityStopwatch({ onEventTracked }: ActivityStopwatchProps) {
  const { trackEvent } = useActivity();

  const handleStart = React.useCallback(
    async ({ runId, startedAt }: StopwatchStartEvent) => {
      await trackEvent({
        eventName: "timer_started",
        occurredAt: startedAt,
        metadata: {
          source: "home_demo",
          controlId: "timer-toggle",
          runId,
          state: "running",
          timestamp: startedAt,
        },
      });

      await onEventTracked();
    },
    [onEventTracked, trackEvent],
  );

  const handleStop = React.useCallback(
    async (event: StopwatchStopEvent) => {
      await trackEvent({
        eventName: "timer_stopped",
        occurredAt: event.stoppedAt,
        metadata: {
          source: "home_demo",
          controlId: "timer-toggle",
          runId: event.runId,
          state: "stopped",
          durationMs: event.durationMs,
          durationSeconds: event.durationSeconds,
          timestamp: event.stoppedAt,
        },
      });

      await onEventTracked();
    },
    [onEventTracked, trackEvent],
  );

  return <Stopwatch onStart={handleStart} onStop={handleStop} />;
}

export default function AppHome() {
  const { resolvedTheme } = useTheme();
  const { listRecentEvents, trackEvent } = useActivity();
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] =
    React.useState<ActivityEvent | null>(null);
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
        <div className="grid grid-cols-2 gap-6 lg:flex lg:flex-col">
          <div className="space-y-6">
            <ActivityStopwatch onEventTracked={refreshEvents} />

            <Tip>
              The stopwatch is shared <Code>@repo/ui</Code>. The app-specific part
              is calling <Code>trackEvent</Code> through <Code>ActivityProvider</Code>.
            </Tip>
          </div>

          <Card padding="none" elevation="sm" variant="subtle">
            <CardHeader>
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
                              variant="outline"
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
            snippets={[
              {
                id: "track-event",
                label: "ActivityStopwatch.web.tsx",
                group: "web",
                filename: "ActivityStopwatch.web.tsx",
                language: "tsx",
                code: activityStopwatchWebExample,
              },
              {
                id: "web-layout",
                label: "layout.tsx",
                group: "web",
                filename: "apps/web/app/layout.tsx",
                language: "tsx",
                code: webLayoutExample,
              },
              {
                id: "track-event-native",
                label: "ActivityStopwatch.native.tsx",
                group: "native",
                filename: "ActivityStopwatch.native.tsx",
                language: "tsx",
                code: activityStopwatchNativeExample,
              },
              {
                id: "native-layout",
                label: "_layout.tsx",
                group: "native",
                filename: "apps/native/app/_layout.tsx",
                language: "tsx",
                code: nativeLayoutExample,
              },
            ]}
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
