import type * as React from "react";
import type { ActivityEvent } from "@repo/lib";
import { getKeyedBadgeColors } from "@repo/ui";
import { activityPlatformConfigs, fallbackPlatformConfig } from "./constants";
import type { ActivityPlatformConfig } from "./types";

export function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatEventName(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getActivityPlatformConfig(
  platformKey: string,
): ActivityPlatformConfig {
  const config = activityPlatformConfigs[platformKey];

  if (config) {
    return config;
  }

  return {
    ...fallbackPlatformConfig,
    label: platformKey,
  };
}

export function getActivitiesForPlatform(
  activities: ActivityEvent[],
  platformKey: string | null,
) {
  if (!platformKey) {
    return activities;
  }

  return activities.filter((activity) => activity.platform === platformKey);
}

export function getMetadataSummary(metadata: ActivityEvent["metadata"]) {
  const entries = Object.entries(metadata).filter(([, value]) => {
    return value !== null && value !== undefined && value !== "";
  });

  if (entries.length === 0) {
    return "No metadata recorded for this activity.";
  }

  return entries
    .slice(0, 4)
    .map(
      ([key, value]) =>
        `${formatMetadataKey(key)}: ${formatMetadataValue(value)}`,
    )
    .join(" - ");
}

export function getMetadataValue(
  metadata: ActivityEvent["metadata"],
  key: string,
) {
  const value = metadata[key];
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return null;
}

export function formatMetadataKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function formatMetadataValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return JSON.stringify(value);
}

export function formatMetadataJson(metadata: ActivityEvent["metadata"]) {
  return JSON.stringify(metadata, null, 2);
}

export function getPlatformBadgeStyle(groupKey: string): React.CSSProperties {
  return getKeyedBadgeColors(groupKey);
}
