export type StopwatchStartEvent = {
  runId: string;
  startedAt: string;
};

export type StopwatchStopEvent = StopwatchStartEvent & {
  stoppedAt: string;
  durationMs: number;
  durationSeconds: number;
};

export type StopwatchProps = {
  label?: string;
  idleLabel?: string;
  runningLabel?: string;
  startLabel?: string;
  stopLabel?: string;
  savingLabel?: string;
  onStart?: (event: StopwatchStartEvent) => void | Promise<void>;
  onStop?: (event: StopwatchStopEvent) => void | Promise<void>;
  className?: string;
  style?: any;
};
