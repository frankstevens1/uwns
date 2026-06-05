import * as React from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useActions } from "@repo/providers";
import type { Action, ActionMetadata } from "@repo/lib";
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
  ToggleGroup,
  ToggleGroupItem,
  type StopwatchStartEvent,
  type StopwatchStopEvent,
  Tip,
  useThemeTokens,
} from "@repo/ui";

type PendingAction = {
  actionName: string;
  metadata: ActionMetadata;
  uniqueKey?: string;
  occurredAt: string;
};

type ActionStopwatchProps = {
  onActionTracked: () => void | Promise<void>;
};

type TimerView = "component" | "code";

const SECTION_GAP = 24;
let homeVisitTracked = false;

function timestamp() {
  return new Date().toISOString();
}

function makeHomeViewedAction(): PendingAction {
  const occurredAt = timestamp();
  return {
    actionName: "home_viewed",
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

const actionStopwatchNativeExample = abbreviatedCodeSnippet([
  `import {
  Stopwatch,
  type StopwatchStartEvent,
  type StopwatchStopEvent,
} from "@repo/ui";
import { useActions } from "@repo/providers";`,
  `export function ActionStopwatch({ onActionTracked }: ActionStopwatchProps) {
  const { trackAction } = useActions();

  async function handleStart({ runId, startedAt }: StopwatchStartEvent) {
    await trackAction({
      actionName: "timer_started",
      occurredAt: startedAt,
      metadata: { source: "home_demo", runId, state: "running" },
    });
    await onActionTracked();
  }

  async function handleStop(event: StopwatchStopEvent) {
    await trackAction({
      actionName: "timer_stopped",
      occurredAt: event.stoppedAt,
      metadata: {
        source: "home_demo",
        runId: event.runId,
        state: "stopped",
        durationSeconds: event.durationSeconds,
      },
    });
    await onActionTracked();
  }

  return <Stopwatch onStart={handleStart} onStop={handleStop} />;
}`,
]);

const actionStopwatchWebExample = abbreviatedCodeSnippet([
  `"use client";

import {
  Stopwatch,
  type StopwatchStartEvent,
  type StopwatchStopEvent,
} from "@repo/ui";
import { useActions } from "@repo/providers";`,
  `export function ActionStopwatch({ onActionTracked }: ActionStopwatchProps) {
  const { trackAction } = useActions();

  async function handleStart({ runId, startedAt }: StopwatchStartEvent) {
    await trackAction({
      actionName: "timer_started",
      occurredAt: startedAt,
      metadata: { source: "home_demo", runId, state: "running" },
    });
    await onActionTracked();
  }

  async function handleStop(event: StopwatchStopEvent) {
    await trackAction({
      actionName: "timer_stopped",
      occurredAt: event.stoppedAt,
      metadata: {
        source: "home_demo",
        runId: event.runId,
        state: "stopped",
        durationSeconds: event.durationSeconds,
      },
    });
    await onActionTracked();
  }

  return <Stopwatch onStart={handleStart} onStop={handleStop} />;
}`,
]);

const nativeLayoutExample = abbreviatedCodeSnippet([
  `import { Stack } from "expo-router";
import { ActionProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider, darkTokens, lightTokens } from "@repo/ui";
import { useColorScheme } from "react-native";`,
  `export default function RootLayout() {
  const scheme = useColorScheme();
  const tokens = scheme === "dark" ? darkTokens : lightTokens;

  return (
    <AuthProvider>
      <ActionProvider>
        <ThemeProvider tokens={tokens}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </ActionProvider>
    </AuthProvider>
  );
}`,
]);

const webLayoutExample = abbreviatedCodeSnippet([
  `import { ActionProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Shell } from "@/components/Shell";`,
  `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ActionProvider>
          <Shell>{children}</Shell>
        </ActionProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}`,
]);

function ActionStopwatch({ onActionTracked }: ActionStopwatchProps) {
  const { trackAction } = useActions();

  const handleStart = React.useCallback(
    async ({ runId, startedAt }: StopwatchStartEvent) => {
      await trackAction({
        actionName: "timer_started",
        occurredAt: startedAt,
        metadata: {
          source: "home_demo",
          controlId: "timer-toggle",
          runId,
          state: "running",
          timestamp: startedAt,
        },
      });

      await onActionTracked();
    },
    [onActionTracked, trackAction],
  );

  const handleStop = React.useCallback(
    async (event: StopwatchStopEvent) => {
      await trackAction({
        actionName: "timer_stopped",
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

      await onActionTracked();
    },
    [onActionTracked, trackAction],
  );

  return <Stopwatch onStart={handleStart} onStop={handleStop} />;
}

export default function HomeTab() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { onScroll, setScrollOffset } = useAppTopBarScroll();
  const { listRecentActions, trackAction } = useActions();
  const scrollOffsetRef = React.useRef(0);
  const [actions, setActions] = React.useState<Action[]>([]);
  const [selectedAction, setSelectedAction] =
    React.useState<Action | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [timerView, setTimerView] = React.useState<TimerView>("component");
  const showTimerComponent = timerView === "component";

  const refreshActions = React.useCallback(async () => {
    setRefreshing(true);
    try {
      setActions(await listRecentActions(10));
    } catch {
      setActions([]);
    } finally {
      setRefreshing(false);
    }
  }, [listRecentActions]);

  const trackPageAction = React.useCallback(
    async (action: PendingAction) => {
      await trackAction({
        actionName: action.actionName,
        metadata: action.metadata,
        uniqueKey: action.uniqueKey,
        occurredAt: action.occurredAt,
      });
    },
    [trackAction],
  );

  React.useEffect(() => {
    void (async () => {
      if (!homeVisitTracked) {
        homeVisitTracked = true;
        await trackPageAction(makeHomeViewedAction());
      }
      await refreshActions();
    })();
  }, [refreshActions, trackPageAction]);

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
        calling <Code>trackAction</Code> through <Code>ActionProvider</Code>.
      </Tip>

      <ToggleGroup
        value={showTimerComponent ? "component" : "code"}
        onValueChange={(next) => {
          setTimerView(next === "component" ? "component" : "code");
        }}
        ariaLabel="Timer view"
      >
        <ToggleGroupItem value="component">Component</ToggleGroupItem>
        <ToggleGroupItem value="code">Code</ToggleGroupItem>
      </ToggleGroup>

      {showTimerComponent ? (
        <ActionStopwatch onActionTracked={refreshActions} />
      ) : (
        <CodeBlock
          snippets={[
            {
              id: "track-action",
              label: "ActionStopwatch.native.tsx",
              group: "native",
              filename: "ActionStopwatch.native.tsx",
              language: "tsx",
              code: actionStopwatchNativeExample,
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
              id: "track-action-web",
              label: "ActionStopwatch.web.tsx",
              group: "web",
              filename: "ActionStopwatch.web.tsx",
              language: "tsx",
              code: actionStopwatchWebExample,
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
          <View style={styles.actionsHeader}>
            <Text style={[styles.actionsTitle, { color: tokens.color.fg }]}>
              Recent actions
            </Text>
            <Button
              variant="primary"
              size="sm"
              accessibilityLabel="Refresh actions"
              disabled={refreshing}
              onPress={() => void refreshActions()}
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
          {actions.length === 0 ? (
            <Text style={[styles.emptyText, { color: tokens.color.mutedFg }]}>
              Start and stop the timer to create actions.
            </Text>
          ) : (
            <View style={styles.table}>
              {actions.map((action, index) => (
                <View
                  key={`${action.id}-${index}`}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: tokens.color.border },
                    index === actions.length - 1 && styles.tableRowLast,
                  ]}
                >
                  <View style={styles.actionCell}>
                    <Text
                      style={[
                        styles.actionText,
                        { color: tokens.color.mutedFg },
                      ]}
                    >
                      {action.action_name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.platformCell,
                      styles.actionText,
                      { color: tokens.color.mutedFg },
                    ]}
                  >
                    {action.platform}
                  </Text>
                  <View style={styles.metaCell}>
                    <Button
                      variant="outline"
                      size="sm"
                      accessibilityLabel={`View metadata for ${action.action_name}`}
                      onPress={() => setSelectedAction(action)}
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
        open={selectedAction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Action metadata</DialogTitle>
            <DialogDescription>
              {selectedAction ? selectedAction.action_name : "No action selected"}
            </DialogDescription>
            {selectedAction ? (
              <CodeBlock
                code={JSON.stringify(selectedAction.metadata, null, 2)}
                filename="metadata.json"
                language="json"
                showLineNumbers={false}
                style={styles.dialogCode}
              />
            ) : null}
            <DialogFooter>
              <Button variant="outline" onPress={() => setSelectedAction(null)}>
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
  actionsHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  actionsTitle: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: "600",
    includeFontPadding: false,
    textAlignVertical: "center",
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
  actionCell: {
    flex: 1,
  },
  platformCell: {
    width: 68,
  },
  metaCell: {
    alignItems: "flex-end",
    width: 42,
  },
  actionText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  dialogCode: {
    marginTop: 14,
  },
});
