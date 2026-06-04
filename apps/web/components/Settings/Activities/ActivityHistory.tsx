"use client";

import * as React from "react";
import {
  Activity,
  Braces,
  CalendarClock,
  Fingerprint,
  Monitor,
} from "lucide-react";
import type { ActivityEvent } from "@repo/lib";
import {
  Button,
  CodeBlock,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@repo/ui";
import {
  formatEventName,
  formatActivityTime,
  getActivityPlatformConfig,
  getMetadataSummary,
  getMetadataValue,
  getPlatformBadgeStyle,
  formatMetadataJson,
} from "@/components/Settings/Activities/utils";

const ACTIVITY_LIMIT = 100;

export interface ActivityHistoryProps {
  error: string | null;
  loading: boolean;
  events: ActivityEvent[];
}

export default function ActivityHistory({
  error,
  loading,
  events,
}: ActivityHistoryProps) {
  const [selectedEvent, setSelectedEvent] =
    React.useState<ActivityEvent | null>(null);

  const handleViewMetadata = React.useCallback((event: ActivityEvent) => {
    setSelectedEvent(event);
  }, []);

  const sections = React.useMemo(() => {
    const platformGroups: Record<string, ActivityEvent[]> = {};
    for (const event of events) {
      const platform = event.platform;
      if (!platformGroups[platform]) {
        platformGroups[platform] = [];
      }
      platformGroups[platform].push(event);
    }
    return Object.entries(platformGroups)
      .map(([platform, events]) => ({
        platform,
        events,
      }))
      .sort((left, right) =>
        getActivityPlatformConfig(left.platform).label.localeCompare(
          getActivityPlatformConfig(right.platform).label,
        ),
      );
  }, [events]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-(--ui-border) pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Activity size={16} />
            Activity history
            <span className="inline-flex items-center rounded-full border border-(--ui-border) bg-(--ui-bg) px-2 py-0.5 text-[10px] font-medium leading-4 text-(--ui-muted-fg)">
              {`${events.length} event${events.length === 1 ? "" : "s"}`}
            </span>
          </div>
          <p className="text-xs leading-5 text-(--ui-muted-fg)">
            Showing the latest {ACTIVITY_LIMIT} tracked events grouped by
            platform.
          </p>
        </div>
      </div>

      {loading ? (
        <ActivityStateMessage message="Loading activity..." />
      ) : error ? (
        <ActivityStateMessage message={`Activity is unavailable: ${error}`} />
      ) : events.length === 0 ? (
        <ActivityStateMessage message="No activity events yet. Use the demo trigger to create one." />
      ) : (
        <div className="space-y-6">
          {sections.map(({ platform, events }) => {
            const config = getActivityPlatformConfig(platform);

            return (
              <ActivitySection
                key={platform}
                title={config.label}
                count={events.length}
                description={config.description}
                emptyMessage={`No ${config.label.toLowerCase()} events yet.`}
              >
                {events.map((event) => (
                  <ActivityRow
                    key={event.id}
                    event={event}
                    onViewMetadata={() => handleViewMetadata(event)}
                  />
                ))}
              </ActivitySection>
            );
          })}
        </div>
      )}

      <DialogRoot
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />

          <DialogContent position="center" className="max-w-2xl">
            <DialogTitle>Activity metadata</DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? `${formatEventName(selectedEvent.event_name)} - ${formatActivityTime(
                    selectedEvent.occurred_at,
                  )}`
                : "No activity event selected"}
            </DialogDescription>

            {selectedEvent ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-2 text-xs text-(--ui-muted-fg) sm:grid-cols-2">
                  <MetadataFact
                    label="Platform"
                    value={selectedEvent.platform}
                  />
                  <MetadataFact
                    label="Unique key"
                    value={selectedEvent.unique_key ?? "None"}
                  />
                  <MetadataFact
                    label="Occurred"
                    value={formatActivityTime(selectedEvent.occurred_at)}
                  />
                  <MetadataFact
                    label="Created"
                    value={formatActivityTime(selectedEvent.created_at)}
                  />
                </div>
                <CodeBlock
                  code={formatMetadataJson(selectedEvent.metadata)}
                  filename="metadata.json"
                  language="json"
                  showLineNumbers={false}
                />
              </div>
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

function ActivitySection({
  title,
  count,
  description,
  emptyMessage,
  children,
}: {
  title: string;
  count: number;
  description: string;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-(--ui-muted-fg)">
            {title}
          </h3>
          <span className="rounded-full border border-(--ui-border) px-1.5 py-0.5 text-[10px] leading-none text-(--ui-muted-fg)">
            {count}
          </span>
        </div>
        <p className="text-xs text-(--ui-muted-fg)">{description}</p>
      </div>

      {count === 0 ? (
        <div className="border-y border-(--ui-border) py-4 text-sm text-(--ui-muted-fg)">
          {emptyMessage}
        </div>
      ) : (
        <div className="border-t border-(--ui-border) divide-y divide-(--ui-border)">
          {children}
        </div>
      )}
    </section>
  );
}

function ActivityRow({
  event,
  onViewMetadata,
}: {
  event: ActivityEvent;
  onViewMetadata: () => void;
}) {
  const platformConfig = getActivityPlatformConfig(event.platform);
  const platformStyle = getPlatformBadgeStyle(event.platform);
  const metadataSummary = getMetadataSummary(event.metadata);
  const source = getMetadataValue(event.metadata, "source");
  const trigger = getMetadataValue(event.metadata, "trigger");

  return (
    <article className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="min-w-0 space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-(--ui-fg)">
            {formatEventName(event.event_name)}
          </span>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4"
            style={platformStyle}
          >
            {platformConfig.label}
          </span>
          {source ? (
            <span className="rounded-full border border-(--ui-border) bg-(--ui-bg) px-2 py-0.5 text-[10px] font-medium leading-4 text-(--ui-muted-fg)">
              {source}
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-xs leading-5 text-(--ui-muted-fg)">
          {metadataSummary}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-(--ui-muted-fg)">
          <ActivityDetail icon={CalendarClock}>
            {formatActivityTime(event.occurred_at)}
          </ActivityDetail>
          <ActivityDetail icon={Monitor}>{platformConfig.label}</ActivityDetail>
          {event.unique_key ? (
            <ActivityDetail icon={Fingerprint}>
              <span className="max-w-64 truncate">{event.unique_key}</span>
            </ActivityDetail>
          ) : null}
          {trigger ? <span>Trigger: {trigger}</span> : null}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        aria-label={`View metadata for ${event.event_name}`}
        onPress={onViewMetadata}
        className="justify-self-start sm:justify-self-end"
      >
        <Braces size={12} />
        Metadata
      </Button>
    </article>
  );
}

function ActivityDetail({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <Icon size={12} className="shrink-0" />
      {children}
    </span>
  );
}

function MetadataFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-[11px] text-(--ui-fg)">
        {value}
      </div>
    </div>
  );
}

function ActivityStateMessage({ message }: { message: string }) {
  return (
    <div className="border-y border-(--ui-border) py-8 text-center text-sm text-(--ui-muted-fg)">
      {message}
    </div>
  );
}
