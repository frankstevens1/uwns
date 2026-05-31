import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useActivity } from "@repo/providers";
import type { ActivityEvent, ActivityMetadata } from "@repo/lib";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  CodeBlock,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  Tip,
  useThemeTokens,
} from "@repo/ui";

type PendingActivityEvent = {
  eventName: string;
  metadata: ActivityMetadata;
  uniqueKey?: string;
  occurredAt: string;
};

type ActivityStopwatchProps = {
  onEventTracked: () => void | Promise<void>;
};

type TimerView = "component" | "code";

const SECTION_GAP = 24;
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
    uniqueKey: "native:home_viewed",
    occurredAt,
    metadata: {
      source: "home",
      screen: "home_tab",
      trigger: "first_tab_visit",
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
    <Pressable onPress={running ? stopTimer : startTimer}>
      <Text>{running ? "Stop" : "Start"}</Text>
    </Pressable>
  );
}`;

function ActivityStopwatch({ onEventTracked }: ActivityStopwatchProps) {
  const tokens = useThemeTokens();
  const { trackEvent } = useActivity();
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const startedAt = React.useRef<number | null>(null);
  const runId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!timerRunning || !startedAt.current) return;

    const interval = globalThis.setInterval(() => {
      if (!startedAt.current) return;
      setElapsedMs(Date.now() - startedAt.current);
    }, 250);

    return () => globalThis.clearInterval(interval);
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
    <View style={styles.stopwatchContainer}>
      <View
        style={[
          styles.timerPanel,
          {
            backgroundColor: tokens.color.subtleBg,
            borderColor: tokens.color.border,
          },
        ]}
      >
        <View style={styles.stopwatchHeader}>
          <Text style={[styles.timerLabel, { color: tokens.color.mutedFg }]}>
            Stopwatch
          </Text>
          <Text
            style={[
              styles.status,
              {
                backgroundColor: tokens.color.bg,
                borderColor: tokens.color.border,
                color: tokens.color.mutedFg,
              },
            ]}
          >
            {timerRunning ? "Running" : "Idle"}
          </Text>
        </View>
        <Text
          style={[
            styles.timerValue,
            {
              backgroundColor: tokens.color.bg,
              borderColor: tokens.color.border,
              color: tokens.color.fg,
            },
          ]}
        >
          {formatStopwatch(elapsedMs)}
        </Text>
        <Pressable
          onPress={onTimerPress}
          disabled={busy}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.stopwatchButton,
            {
              backgroundColor: tokens.color.bg,
              borderColor: tokens.color.border,
            },
            pressed && { backgroundColor: tokens.color.subtleBg },
            busy && styles.stopwatchButtonDisabled,
          ]}
        >
          <MaterialIcons
            name={timerRunning ? "stop" : "play-arrow"}
            size={16}
            color={tokens.color.fg}
          />
          <Text style={[styles.stopwatchButtonText, { color: tokens.color.fg }]}>
            {busy ? "Saving..." : timerRunning ? "Stop" : "Start"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeTab() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { listRecentEvents, trackEvent } = useActivity();
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<ActivityEvent | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [timerView, setTimerView] = React.useState<TimerView>("component");
  const showTimerComponent = timerView === "component";

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
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
      contentContainerStyle={[
        styles.screen,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.color.fg }]}>
          Home
        </Text>
        <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>
          This tab is the starting point for building product-specific
          authenticated flows.
        </Text>
      </View>

      <Tip>
        The stopwatch is intentionally local UI. The service pattern is the
        reusable part: call <Code>trackEvent</Code> through
        <Code>ActivityProvider</Code> with an event name and JSON metadata.
      </Tip>

      <View
        style={[
          styles.segmented,
          {
            borderColor: tokens.color.border,
          },
        ]}
      >
        <Pressable
          onPress={() => setTimerView("component")}
          accessibilityRole="button"
          accessibilityState={{ selected: showTimerComponent }}
          style={[
            styles.segment,
            showTimerComponent && {
              backgroundColor: tokens.color.subtleBg,
              borderColor: tokens.color.border,
            },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: showTimerComponent
                  ? tokens.color.fg
                  : tokens.color.mutedFg,
              },
            ]}
          >
            Component
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTimerView("code")}
          accessibilityRole="button"
          accessibilityState={{ selected: !showTimerComponent }}
          style={[
            styles.segment,
            !showTimerComponent && {
              backgroundColor: tokens.color.subtleBg,
              borderColor: tokens.color.border,
            },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: !showTimerComponent
                  ? tokens.color.fg
                  : tokens.color.mutedFg,
              },
            ]}
          >
            Code
          </Text>
        </Pressable>
      </View>

      {showTimerComponent ? (
        <ActivityStopwatch onEventTracked={refreshEvents} />
      ) : (
        <CodeBlock
          code={activityStopwatchExample}
          filename="ActivityStopwatch.native.tsx"
          language="tsx"
          showLineNumbers={false}
        />
      )}

      <Card padding="none" elevation="sm" variant="subtle">
        <CardHeader divider={false}>
          <View style={styles.eventsHeader}>
            <Text style={[styles.eventsTitle, { color: tokens.color.fg }]}>
              Recent events
            </Text>
            <Button
              variant="primary"
              size="sm"
              accessibilityLabel="Refresh events"
              disabled={refreshing}
              onPress={() => void refreshEvents()}
            >
              {refreshing ? (
                <ActivityIndicator color={tokens.color.mutedFg} size="small" />
              ) : (
                <MaterialIcons
                  name="refresh"
                  size={12}
                  color={tokens.color.primaryFg}
                />
              )}
              <Text
                style={[
                  styles.refreshButtonText,
                  {
                    color: refreshing
                      ? tokens.color.mutedFg
                      : tokens.color.primaryFg,
                  },
                ]}
              >
                Refresh
              </Text>
            </Button>
          </View>
        </CardHeader>
        <CardBody padding="none">
          {events.length === 0 ? (
            <Text style={[styles.emptyText, { color: tokens.color.mutedFg }]}>
              Start and stop the timer to create events.
            </Text>
          ) : (
            <View style={styles.table}>
              {events.map((event, index) => (
                <View
                  key={`${event.id}-${index}`}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: tokens.color.border },
                    index === events.length - 1 && styles.tableRowLast,
                  ]}
                >
                  <View style={styles.eventCell}>
                    <Text
                      style={[styles.eventText, { color: tokens.color.mutedFg }]}
                    >
                      {event.event_name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.platformCell,
                      styles.eventText,
                      { color: tokens.color.mutedFg },
                    ]}
                  >
                    {event.platform}
                  </Text>
                  <View style={styles.metaCell}>
                    <Button
                      variant="ghost"
                      size="sm"
                      accessibilityLabel={`View metadata for ${event.event_name}`}
                      onPress={() => setSelectedEvent(event)}
                    >
                      <MaterialIcons
                        name="data-object"
                        size={12}
                        color={tokens.color.fg}
                      />
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          )}
        </CardBody>
      </Card>

      <DialogRoot
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Event metadata</DialogTitle>
            <DialogDescription>
              {selectedEvent ? selectedEvent.event_name : "No event selected"}
            </DialogDescription>
            {selectedEvent ? (
              <CodeBlock
                code={JSON.stringify(selectedEvent.metadata, null, 2)}
                filename="metadata.json"
                language="json"
                showLineNumbers={false}
                style={styles.dialogCode}
              />
            ) : null}
            <DialogFooter>
              <Button variant="ghost" onPress={() => setSelectedEvent(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: SECTION_GAP,
    paddingHorizontal: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  eventsHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  eventsTitle: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: "600",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  segmented: {
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    padding: 3,
  },
  segment: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "500",
  },
  stopwatchContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
    width: 224,
  },
  stopwatchHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timerLabel: {
    fontSize: 11,
  },
  timerValue: {
    borderRadius: 6,
    borderWidth: 1,
    fontFamily: "monospace",
    fontSize: 34,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    overflow: "hidden",
    paddingVertical: 10,
    textAlign: "center",
  },
  status: {
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stopwatchButton: {
    alignItems: "center",
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 34,
  },
  stopwatchButtonDisabled: {
    opacity: 0.6,
  },
  stopwatchButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 32,
    textAlign: "center",
  },
  table: {
    width: "100%",
  },
  tableRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  eventCell: {
    flex: 1,
  },
  platformCell: {
    width: 68,
  },
  metaCell: {
    alignItems: "flex-end",
    width: 42,
  },
  eventText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  dialogCode: {
    marginTop: 14,
  },
});
