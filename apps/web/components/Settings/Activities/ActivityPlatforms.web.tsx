"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Card,
  CardBody,
  CardHeader,
} from "@repo/ui";
import { platformsTriggerClassName, totalsAccordionValue } from "./constants";
import type { ActivityPlatformConfig } from "./types";
import { getActivityPlatformConfig, getPlatformBadgeStyle } from "./utils";
import type { ActivityEvent } from "@repo/lib";

type ActivityPlatformSummary = {
  platform: string;
  count: number;
};

export function ActivityPlatforms({
  activities,
  onSelectedPlatformKeyChange,
}: {
  activities: ActivityEvent[];
  onSelectedPlatformKeyChange?: (platformKey: string | null) => void;
}) {
  const [openPlatformKey, setOpenPlatformKey] = React.useState<string | null>(
    null,
  );

  const updateOpenPlatformKey = React.useCallback(
    (nextOpenPlatformKey: string | null) => {
      setOpenPlatformKey(nextOpenPlatformKey);
      onSelectedPlatformKeyChange?.(
        nextOpenPlatformKey && nextOpenPlatformKey !== totalsAccordionValue
          ? nextOpenPlatformKey
          : null,
      );
    },
    [onSelectedPlatformKeyChange],
  );

  React.useEffect(() => {
    if (!openPlatformKey) return;
    if (openPlatformKey === totalsAccordionValue) {
      const platformCount = new Set(
        activities.map((activity) => activity.platform),
      ).size;
      if (platformCount < 5) {
        updateOpenPlatformKey(null);
      }
      return;
    }
    if (activities.some((activity) => activity.platform === openPlatformKey)) {
      return;
    }
    updateOpenPlatformKey(null);
  }, [openPlatformKey, activities, updateOpenPlatformKey]);

  const platformSummaries = React.useMemo(
    () => getActivityPlatformSummaries(activities),
    [activities],
  );
  const showTotalsRow = platformSummaries.length >= 5;

  return (
    <Card padding="none" elevation="sm" variant="subtle">
      <CardHeader>
        <div className="text-sm font-medium">Activity platforms</div>
      </CardHeader>
      <CardBody padding="none">
        {activities.length === 0 ? (
          <p className="px-4 py-5 text-sm text-(--ui-muted-fg)">
            No activity platforms yet.
          </p>
        ) : (
          <AccordionRoot
            className="divide-y divide-(--ui-border)"
            value={openPlatformKey}
            onValueChange={updateOpenPlatformKey}
          >
            {showTotalsRow ? (
              <ActivityPlatformsTotalsRow
                activityCount={activities.length}
                open={openPlatformKey === totalsAccordionValue}
                platformCount={platformSummaries.length}
              />
            ) : null}
            {platformSummaries.map((platform) => (
              <ActivityPlatformRow
                key={platform.platform}
                activityCount={platform.count}
                config={getActivityPlatformConfig(platform.platform)}
                open={openPlatformKey === platform.platform}
                platform={platform.platform}
              />
            ))}
          </AccordionRoot>
        )}
      </CardBody>
    </Card>
  );
}

function ActivityPlatformsTotalsRow({
  activityCount,
  open,
  platformCount,
}: {
  activityCount: number;
  open: boolean;
  platformCount: number;
}) {
  const platformStyle = getPlatformBadgeStyle(totalsAccordionValue);

  return (
    <AccordionItem value={totalsAccordionValue} className="px-3 py-3">
      <AccordionTrigger
        aria-label="Toggle all activity platform details"
        className={platformsTriggerClassName}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className="inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4"
            style={platformStyle}
          >
            All
          </span>
          <span className="inline-flex items-center rounded-full border border-(--ui-border) bg-(--ui-bg) px-2 py-0.5 text-[10px] font-medium leading-4 text-(--ui-muted-fg)">
            {platformCount} {platformCount === 1 ? "platform" : "platforms"}
          </span>
          <ActivityCountBadge count={activityCount} />
        </div>

        <ChevronDown
          aria-hidden="true"
          className={["shrink-0 transition-transform", open ? "rotate-180" : ""]
            .filter(Boolean)
            .join(" ")}
          size={15}
        />
      </AccordionTrigger>

      <AccordionContent
        className="space-y-3 px-1 pt-3"
        style={{ paddingTop: "12px" }}
      >
        <p className="text-xs leading-5 text-(--ui-muted-fg)">
          Review tracked activity across every platform represented in the
          current history.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

function ActivityPlatformRow({
  activityCount,
  config,
  open,
  platform,
}: {
  activityCount: number;
  config: ActivityPlatformConfig;
  open: boolean;
  platform: string;
}) {
  const platformStyle = getPlatformBadgeStyle(platform);

  return (
    <AccordionItem value={platform} className="px-3 py-3">
      <AccordionTrigger
        aria-label={`Toggle ${config.label} activity details`}
        className={platformsTriggerClassName}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className="inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4"
            style={platformStyle}
          >
            <span className="truncate">{config.label}</span>
          </span>
          <ActivityCountBadge count={activityCount} />
        </div>

        <ChevronDown
          aria-hidden="true"
          className={["shrink-0 transition-transform", open ? "rotate-180" : ""]
            .filter(Boolean)
            .join(" ")}
          size={15}
        />
      </AccordionTrigger>

      <AccordionContent
        className="space-y-3 px-1 pt-3"
        style={{ paddingTop: "12px" }}
      >
        <p className="text-xs leading-5 text-(--ui-muted-fg)">
          {config.description}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

function ActivityCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center rounded-full border border-(--ui-border) bg-(--ui-bg) px-2 py-0.5 text-[10px] font-medium leading-4 text-(--ui-muted-fg)">
      {count} {count === 1 ? "event" : "events"}
    </span>
  );
}

function getActivityPlatformSummaries(
  activities: ActivityEvent[],
): ActivityPlatformSummary[] {
  const countsByPlatform = new Map<string, number>();

  for (const activity of activities) {
    countsByPlatform.set(
      activity.platform,
      (countsByPlatform.get(activity.platform) ?? 0) + 1,
    );
  }

  return [...countsByPlatform.entries()]
    .map(([platform, count]) => ({ platform, count }))
    .sort((left, right) =>
      getActivityPlatformConfig(left.platform).label.localeCompare(
        getActivityPlatformConfig(right.platform).label,
      ),
    );
}
