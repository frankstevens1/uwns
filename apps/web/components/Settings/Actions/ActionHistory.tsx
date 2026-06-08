"use client";

import * as React from "react";
import {
  Activity,
  Braces,
  CalendarClock,
  Fingerprint,
  Monitor,
} from "lucide-react";
import type { Action } from "@repo/lib";
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
  formatActionName,
  formatActionTime,
  getActionPlatformConfig,
  getMetadataSummary,
  getMetadataValue,
  getPlatformBadgeStyle,
  formatMetadataJson,
} from "@/components/Settings/Actions/utils";

const ACTION_LIMIT = 100;

export interface ActionHistoryProps {
  error: string | null;
  loading: boolean;
  actions: Action[];
}

export function ActionHistoryHeader({ actionCount }: { actionCount: number }) {
  return (
    <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity size={16} />
          Action history
          <span className="inline-flex items-center rounded-full border border-(--ui-border) bg-(--ui-bg) px-2 py-0.5 text-[10px] font-medium leading-4 text-(--ui-muted-fg)">
            {`${actionCount} action${actionCount === 1 ? "" : "s"}`}
          </span>
        </div>
        <p className="text-xs leading-5 text-(--ui-muted-fg)">
          Showing the latest {ACTION_LIMIT} tracked actions grouped by platform.
        </p>
      </div>
    </div>
  );
}

export default function ActionHistory(props: ActionHistoryProps) {
  return (
    <section className="space-y-5">
      <ActionHistoryHeader actionCount={props.actions.length} />
      <ActionHistoryContent {...props} />
    </section>
  );
}

export function ActionHistoryContent({
  error,
  loading,
  actions,
}: ActionHistoryProps) {
  const [selectedAction, setSelectedAction] =
    React.useState<Action | null>(null);

  const handleViewMetadata = React.useCallback((action: Action) => {
    setSelectedAction(action);
  }, []);

  const sections = React.useMemo(() => {
    const platformGroups: Record<string, Action[]> = {};
    for (const action of actions) {
      const platform = action.platform;
      if (!platformGroups[platform]) {
        platformGroups[platform] = [];
      }
      platformGroups[platform].push(action);
    }
    return Object.entries(platformGroups)
      .map(([platform, actions]) => ({
        platform,
        actions,
      }))
      .sort((left, right) =>
        getActionPlatformConfig(left.platform).label.localeCompare(
          getActionPlatformConfig(right.platform).label,
        ),
      );
  }, [actions]);

  return (
    <>
      {loading ? (
        <ActionStateMessage message="Loading actions..." />
      ) : error ? (
        <ActionStateMessage message={`Actions are unavailable: ${error}`} />
      ) : actions.length === 0 ? (
        <ActionStateMessage message="No actions yet. Use the demo trigger to create one." />
      ) : (
        <div>
          {sections.map(({ platform, actions }, index) => {
            const config = getActionPlatformConfig(platform);

            return (
              <ActionSection
                key={platform}
                title={config.label}
                count={actions.length}
                description={config.description}
                emptyMessage={`No ${config.label.toLowerCase()} actions yet.`}
                stickyIndex={index}
              >
                {actions.map((action) => (
                  <ActionRow
                    key={action.id}
                    action={action}
                    onViewMetadata={() => handleViewMetadata(action)}
                  />
                ))}
              </ActionSection>
            );
          })}
        </div>
      )}

      <DialogRoot
        open={selectedAction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />

          <DialogContent position="center" className="max-w-2xl">
            <DialogTitle>Action metadata</DialogTitle>
            <DialogDescription>
              {selectedAction
                ? `${formatActionName(selectedAction.action_name)} - ${formatActionTime(
                    selectedAction.occurred_at,
                  )}`
                : "No action selected"}
            </DialogDescription>

            {selectedAction ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-2 text-xs text-(--ui-muted-fg) sm:grid-cols-2">
                  <MetadataFact
                    label="Platform"
                    value={selectedAction.platform}
                  />
                  <MetadataFact
                    label="Unique key"
                    value={selectedAction.unique_key ?? "None"}
                  />
                  <MetadataFact
                    label="Occurred"
                    value={formatActionTime(selectedAction.occurred_at)}
                  />
                  <MetadataFact
                    label="Created"
                    value={formatActionTime(selectedAction.created_at)}
                  />
                </div>
                <CodeBlock
                  code={formatMetadataJson(selectedAction.metadata)}
                  filename="metadata.json"
                  language="json"
                  showLineNumbers={false}
                />
              </div>
            ) : null}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </>
  );
}

function ActionSection({
  title,
  count,
  description,
  emptyMessage,
  stickyIndex,
  children,
}: {
  title: string;
  count: number;
  description: string;
  emptyMessage: string;
  stickyIndex: number;
  children: React.ReactNode;
}) {
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const scrollToSectionTop = React.useCallback(() => {
    const header = headerRef.current;
    const list = listRef.current;
    const scrollContainer = header?.closest(
      "[data-settings-history-scroll]",
    );

    if (
      !header ||
      !list ||
      !(scrollContainer instanceof HTMLElement) ||
      scrollContainer.scrollHeight <= scrollContainer.clientHeight
    ) {
      list?.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }

    const stackedHeaderHeight = header.offsetHeight * (stickyIndex + 1);
    scrollContainer.scrollTo({
      top: Math.max(0, list.offsetTop - stackedHeaderHeight),
      behavior: "smooth",
    });
  }, [stickyIndex]);

  return (
    <>
      {stickyIndex > 0 ? <div aria-hidden className="h-6" /> : null}
      <div
        ref={headerRef}
        className="relative flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-(--ui-bg) py-2 lg:sticky lg:z-20"
        style={{
          top: `calc(var(--settings-history-sticky-row) * ${stickyIndex})`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-full hidden h-3 lg:block"
          style={{
            background:
              "linear-gradient(to bottom, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />
        <div className="flex items-baseline gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-(--ui-muted-fg)">
            <button
              type="button"
              className="cursor-pointer rounded-sm text-left uppercase tracking-wide transition hover:text-(--ui-fg) focus:outline-none focus:ring-2 focus:ring-(--ui-border)"
              onClick={scrollToSectionTop}
            >
              {title}
            </button>
          </h3>
          <span className="rounded-full border border-(--ui-border) px-1.5 py-0.5 text-[10px] leading-none text-(--ui-muted-fg)">
            {count}
          </span>
        </div>
        <p className="text-xs text-(--ui-muted-fg)">{description}</p>
        <div className="border-b border-(--ui-border) absolute left-0 right-0 top-full -mt-px hidden lg:block" />
      </div>

      {count === 0 ? (
        <div
          ref={listRef}
          className="mt-2 border-y border-(--ui-border) py-4 text-sm text-(--ui-muted-fg)"
        >
          {emptyMessage}
        </div>
      ) : (
        <div ref={listRef} className="mt-2 divide-y divide-(--ui-border)">
          {children}
        </div>
      )}
    </>
  );
}

function ActionRow({
  action,
  onViewMetadata,
}: {
  action: Action;
  onViewMetadata: () => void;
}) {
  const platformConfig = getActionPlatformConfig(action.platform);
  const platformStyle = getPlatformBadgeStyle(action.platform);
  const metadataSummary = getMetadataSummary(action.metadata);
  const source = getMetadataValue(action.metadata, "source");
  const trigger = getMetadataValue(action.metadata, "trigger");

  return (
    <article className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="min-w-0 space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-(--ui-fg)">
            {formatActionName(action.action_name)}
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
          <ActionDetail icon={CalendarClock}>
            {formatActionTime(action.occurred_at)}
          </ActionDetail>
          <ActionDetail icon={Monitor}>{platformConfig.label}</ActionDetail>
          {action.unique_key ? (
            <ActionDetail icon={Fingerprint}>
              <span className="max-w-64 truncate">{action.unique_key}</span>
            </ActionDetail>
          ) : null}
          {trigger ? <span>Trigger: {trigger}</span> : null}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        aria-label={`View metadata for ${action.action_name}`}
        onPress={onViewMetadata}
        className="justify-self-start sm:justify-self-end"
      >
        <Braces size={12} />
        Metadata
      </Button>
    </article>
  );
}

function ActionDetail({
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

function ActionStateMessage({ message }: { message: string }) {
  return (
    <div className="border-y border-(--ui-border) py-8 text-center text-sm text-(--ui-muted-fg)">
      {message}
    </div>
  );
}
