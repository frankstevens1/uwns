import * as React from "react";
import { Play, Square } from "lucide-react";
import type {
  StopwatchProps,
  StopwatchStartEvent,
  StopwatchStopEvent,
} from "./Stopwatch.types";
import { Button } from "../../primitives/Button/Button.web";

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
  className = "",
  style,
}: StopwatchProps) {
  const [running, setRunning] = React.useState(false);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const startedAtMs = React.useRef<number | null>(null);
  const startedAtIso = React.useRef<string | null>(null);
  const runId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!running || !startedAtMs.current) return;

    const interval = window.setInterval(() => {
      if (!startedAtMs.current) return;
      setElapsedMs(Date.now() - startedAtMs.current);
    }, 250);

    return () => window.clearInterval(interval);
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
    <div className={`flex justify-center ${className}`} style={style}>
      <div className="h-fit w-full max-w-64 rounded-lg border border-(--ui-border) bg-(--ui-subtle-bg) p-3 shadow-inner">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-medium text-(--ui-muted-fg)">
            {label}
          </div>
          <div className="rounded-md border border-(--ui-border) bg-(--ui-bg) px-2 py-1 text-xs text-(--ui-muted-fg)">
            {running ? runningLabel : idleLabel}
          </div>
        </div>
        <div className="rounded-md border border-(--ui-border) bg-(--ui-bg) px-3 py-3 text-center font-mono text-3xl font-semibold tabular-nums text-(--ui-fg)">
          {formatDuration(elapsedMs)}
        </div>
        <Button
          variant="outline"
          className="mt-3 w-full"
          disabled={busy}
          onPress={() => void onToggle()}
        >
          {running ? <Square size={15} /> : <Play size={15} />}
          {busy ? savingLabel : running ? stopLabel : startLabel}
        </Button>
      </div>
    </div>
  );
}
