import type * as React from "react";
import type { Action } from "@repo/lib";
import { getKeyedBadgeColors } from "@repo/ui";
import { actionPlatformConfigs, fallbackPlatformConfig } from "./constants";
import type { ActionPlatformConfig } from "./types";

export function formatActionTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatActionName(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getActionPlatformConfig(
  platformKey: string,
): ActionPlatformConfig {
  const config = actionPlatformConfigs[platformKey];

  if (config) {
    return config;
  }

  return {
    ...fallbackPlatformConfig,
    label: platformKey,
  };
}

export function getActionsForPlatform(
  actions: Action[],
  platformKey: string | null,
) {
  if (!platformKey) {
    return actions;
  }

  return actions.filter((action) => action.platform === platformKey);
}

export function getMetadataSummary(metadata: Action["metadata"]) {
  const entries = Object.entries(metadata).filter(([, value]) => {
    return value !== null && value !== undefined && value !== "";
  });

  if (entries.length === 0) {
    return "No metadata recorded for this action.";
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
  metadata: Action["metadata"],
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

export function formatMetadataJson(metadata: Action["metadata"]) {
  return JSON.stringify(metadata, null, 2);
}

export function getPlatformBadgeStyle(groupKey: string): React.CSSProperties {
  return getKeyedBadgeColors(groupKey);
}
