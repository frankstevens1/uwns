import * as React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type {
  StopwatchProps,
  StopwatchStartEvent,
  StopwatchStopEvent,
} from "./Stopwatch.types";
import { Button } from "../../primitives/Button/Button.native";
import { useThemeTokens } from "../../theme";

function timestamp() {
  return new Date().toISOString();
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function Stopwatch({
  label = "Stopwatch",
  idleLabel = "Idle",
  runningLabel = "Running",
  startLabel = "Start",
  stopLabel = "Stop",
  savingLabel = "Saving...",
  onStart,
  onStop,
  style,
}: StopwatchProps) {
  const tokens = useThemeTokens();
  const [running, setRunning] = React.useState(false);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const startedAtMs = React.useRef<number | null>(null);
  const startedAtIso = React.useRef<string | null>(null);
  const runId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!running || !startedAtMs.current) return;

    const interval = globalThis.setInterval(() => {
      if (!startedAtMs.current) return;
      setElapsedMs(Date.now() - startedAtMs.current);
    }, 250);

    return () => globalThis.clearInterval(interval);
  }, [running]);

  const start = async () => {
    const nextStartedAt = timestamp();
    const nextRunId = `timer-${Date.now()}`;

    startedAtMs.current = Date.now();
    startedAtIso.current = nextStartedAt;
    runId.current = nextRunId;
    setElapsedMs(0);
    setRunning(true);

    const event: StopwatchStartEvent = {
      runId: nextRunId,
      startedAt: nextStartedAt,
    };

    await onStart?.(event);
  };

  const stop = async () => {
    const stoppedAt = timestamp();
    const durationMs = startedAtMs.current
      ? Date.now() - startedAtMs.current
      : 0;
    const event: StopwatchStopEvent = {
      runId: runId.current ?? `timer-${Date.now()}`,
      startedAt: startedAtIso.current ?? stoppedAt,
      stoppedAt,
      durationMs,
      durationSeconds: Math.round(durationMs / 1000),
    };

    startedAtMs.current = null;
    startedAtIso.current = null;
    runId.current = null;
    setRunning(false);
    setElapsedMs(durationMs);

    await onStop?.(event);
  };

  const onToggle = async () => {
    if (busy) return;

    setBusy(true);
    try {
      if (running) {
        await stop();
      } else {
        await start();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: tokens.color.subtleBg,
            borderColor: tokens.color.border,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.label, { color: tokens.color.mutedFg }]}>
            {label}
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
            {running ? runningLabel : idleLabel}
          </Text>
        </View>
        <Text
          style={[
            styles.value,
            {
              backgroundColor: tokens.color.bg,
              borderColor: tokens.color.border,
              color: tokens.color.fg,
            },
          ]}
        >
          {formatDuration(elapsedMs)}
        </Text>
        <Button
          variant="outline"
          disabled={busy}
          onPress={() => void onToggle()}
          style={styles.button}
        >
          <MaterialIcons
            name={running ? "stop" : "play-arrow"}
            size={16}
            color={tokens.color.fg}
          />
          <Text style={[styles.buttonText, { color: tokens.color.fg }]}>
            {busy ? savingLabel : running ? stopLabel : startLabel}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
    width: 224,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
  },
  status: {
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  value: {
    borderRadius: 6,
    borderWidth: 1,
    fontFamily: "monospace",
    fontSize: 34,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
    overflow: "hidden",
    paddingVertical: 10,
    textAlign: "center",
  },
  button: {
    width: "100%",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
