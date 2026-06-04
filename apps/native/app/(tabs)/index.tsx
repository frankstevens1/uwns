import * as React from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useActivity } from "@repo/providers";
import type { ActivityEvent, ActivityMetadata } from "@repo/lib";
import { useAppTopBarScroll } from "../../components/AppTopBar";
import { getTabScreenTopPadding } from "../../constants/layout";
import {
  abbreviatedCodeSnippet,
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
  Stopwatch,
  type StopwatchStartEvent,
  type StopwatchStopEvent,
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

export default function HomeTab() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { onScroll, setScrollOffset } = useAppTopBarScroll();
  const { listRecentEvents, trackEvent } = useActivity();
  const scrollOffsetRef = React.useRef(0);
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] =
    React.useState<ActivityEvent | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [timerView, setTimerView] = React.useState<TimerView>("component");
  const showTimerComponent = timerView === "component";

  const refreshEvents = React.useCallback(async () => {
    setRefreshing(true);
    try {
      setEvents(await listRecentEvents(10));
    } catch {
      setEvents([]);
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

  useFocusEffect(
    React.useCallback(() => {
      setScrollOffset(scrollOffsetRef.current);
    }, [setScrollOffset]),
  );

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
      onScroll={(event) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        onScroll(event);
      }}
      scrollEventThrottle={16}
      contentContainerStyle={[
        styles.screen,
        {
          paddingTop: getTabScreenTopPadding(insets.top),
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.color.fg }]}>Home</Text>
        <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>
          This tab is the starting point for building product-specific
          authenticated flows.
        </Text>
      </View>

      <Tip>
        The stopwatch is shared <Code>@repo/ui</Code>. The app-specific part is
        calling <Code>trackEvent</Code> through <Code>ActivityProvider</Code>.
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
          snippets={[
            {
              id: "track-event",
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
            {
              id: "track-event-web",
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
          ]}
          showLineNumbers={false}
        />
      )}

      <Card padding="none" elevation="sm" variant="subtle">
        <CardHeader>
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
                      style={[
                        styles.eventText,
                        { color: tokens.color.mutedFg },
                      ]}
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
                      variant="outline"
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
    </Animated.ScrollView>
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
