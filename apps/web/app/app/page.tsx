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
import { useActions } from "@repo/providers";
import type { Action, ActionMetadata } from "@repo/lib";

type PendingAction = {
  actionName: string;
  metadata: ActionMetadata;
  uniqueKey?: string;
  occurredAt: string;
};

type ActionStopwatchProps = {
  onActionTracked: () => void | Promise<void>;
};

let homeVisitTracked = false;

function timestamp() {
  return new Date().toISOString();
}

function makeHomeViewedAction(): PendingAction {
  const occurredAt = timestamp();
  return {
    actionName: "home_viewed",
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

export default function AppHome() {
  const { resolvedTheme } = useTheme();
  const { listRecentActions, trackAction } = useActions();
  const [actions, setActions] = React.useState<Action[]>([]);
  const [selectedAction, setSelectedAction] =
    React.useState<Action | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const codeBlockTheme = resolvedTheme === "dark" ? "dark" : "light";

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
            <ActionStopwatch onActionTracked={refreshActions} />

            <Tip>
              The stopwatch is shared <Code>@repo/ui</Code>. The app-specific
              part is calling <Code>trackAction</Code> through{" "}
              <Code>ActionProvider</Code>.
            </Tip>
          </div>

          <Card padding="none" elevation="sm" variant="subtle">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-mono">Recent actions</div>
                <Button
                  variant="primary"
                  size="sm"
                  aria-label="Refresh actions"
                  disabled={refreshing}
                  onPress={() => void refreshActions()}
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
              {actions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-(--ui-muted-fg)">
                  Start and stop the timer to create actions.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {actions.map((action, index) => (
                        <tr
                          key={`${action.id}-${index}`}
                          className="border-b border-(--ui-border) last:border-b-0"
                        >
                          <td className="px-3 py-2">
                            <div className="font-mono text-xs text-(--ui-muted-fg)">
                              {action.action_name}
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-(--ui-muted-fg)">
                            {action.platform}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`View metadata for ${action.action_name}`}
                              onPress={() => setSelectedAction(action)}
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
                id: "track-action",
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
              {
                id: "track-action-native",
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
            ]}
            showLineNumbers={false}
            theme={codeBlockTheme}
          />
        </div>
      </div>

      <DialogRoot
        open={selectedAction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />

          <DialogContent position="center" className="max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>Action metadata</DialogTitle>

                <DialogDescription>
                  {selectedAction
                    ? selectedAction.action_name
                    : "No action selected"}
                </DialogDescription>
              </div>
            </div>

            {selectedAction ? (
              <CodeBlock
                code={JSON.stringify(selectedAction.metadata, null, 2)}
                filename="metadata.json"
                language="json"
                showLineNumbers={false}
                theme={codeBlockTheme}
                className="mt-4"
              />
            ) : null}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </section>
  );
}
