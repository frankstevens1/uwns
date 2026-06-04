import * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ActivityEvent } from "@repo/lib";
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Button,
  Card,
  CardBody,
  CardHeader,
  getKeyedBadgeColors,
  useThemeTokens,
  type BadgeColorStyle,
} from "@repo/ui";
import { StyleSheet, Text, View } from "react-native";

const totalsAccordionValue = "__totals__";

type ActivityPlatformsProps = {
  activities: ActivityEvent[];
  loading: boolean;
  error: string | null;
};

type ActivityPlatformConfig = {
  label: string;
  description: string;
};

type ActivityPlatformSummary = {
  platform: string;
  count: number;
};

const activityPlatformConfigs: Record<string, ActivityPlatformConfig> = {
  web: {
    label: "Web",
    description:
      "Events recorded by the web app, including settings, account, and navigation activity.",
  },
  native: {
    label: "Native",
    description:
      "Events recorded by the native app, including mobile account and tab activity.",
  },
};

const fallbackActivityPlatformConfig: Omit<ActivityPlatformConfig, "label"> = {
  description: "Events recorded by this platform.",
};

export function ActivityPlatforms({
  activities,
  loading,
  error,
}: ActivityPlatformsProps) {
  const tokens = useThemeTokens();
  const [openPlatformKey, setOpenPlatformKey] = React.useState<string | null>(
    null,
  );
  const platformSummaries = React.useMemo(
    () => getActivityPlatformSummaries(activities),
    [activities],
  );
  const showTotalsRow = platformSummaries.length >= 5;

  React.useEffect(() => {
    if (!openPlatformKey) return;
    if (openPlatformKey === totalsAccordionValue) {
      if (!showTotalsRow) {
        setOpenPlatformKey(null);
      }
      return;
    }
    if (activities.some((activity) => activity.platform === openPlatformKey)) {
      return;
    }
    setOpenPlatformKey(null);
  }, [openPlatformKey, activities, showTotalsRow]);

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>
            Activities
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.navigate("/activities")}
          >
            View
          </Button>
        </View>
      </CardHeader>
      <CardBody padding="none">
        {loading ? (
          <StateText>Loading activity...</StateText>
        ) : error ? (
          <StateText>Activity is unavailable.</StateText>
        ) : platformSummaries.length === 0 ? (
          <StateText>No activity platforms are available yet.</StateText>
        ) : (
          <AccordionRoot
            value={openPlatformKey}
            onValueChange={setOpenPlatformKey}
          >
            {showTotalsRow ? (
              <ActivityPlatformsTotalsRow
                activityCount={activities.length}
                open={openPlatformKey === totalsAccordionValue}
                platformCount={platformSummaries.length}
              />
            ) : null}
            {platformSummaries.map((platform, index) => (
              <ActivityPlatformRow
                key={platform.platform}
                activityCount={platform.count}
                config={getActivityPlatformConfig(platform.platform)}
                last={index === platformSummaries.length - 1}
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
  const tokens = useThemeTokens();
  const platformColors = getKeyedBadgeColors(totalsAccordionValue);

  return (
    <AccordionItem
      value={totalsAccordionValue}
      style={[styles.accordionItem, { borderBottomColor: tokens.color.border }]}
    >
      <AccordionTrigger
        aria-label="Toggle all activity platform details"
        style={styles.trigger}
      >
        <View style={styles.triggerContent}>
          <PlatformBadge colors={platformColors}>All</PlatformBadge>
          <Pill>
            {platformCount} {platformCount === 1 ? "platform" : "platforms"}
          </Pill>
          <ActivityCountBadge count={activityCount} />
        </View>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color={tokens.color.mutedFg}
          size={16}
        />
      </AccordionTrigger>

      <AccordionContent style={styles.content}>
        <Text style={[styles.description, { color: tokens.color.mutedFg }]}>
          Review tracked activity across every platform represented in the
          current history.
        </Text>
      </AccordionContent>
    </AccordionItem>
  );
}

function ActivityPlatformRow({
  activityCount,
  config,
  last,
  open,
  platform,
}: {
  activityCount: number;
  config: ActivityPlatformConfig;
  last: boolean;
  open: boolean;
  platform: string;
}) {
  const tokens = useThemeTokens();
  const platformColors = getKeyedBadgeColors(platform);

  return (
    <AccordionItem
      value={platform}
      style={[
        styles.accordionItem,
        { borderBottomColor: last ? "transparent" : tokens.color.border },
      ]}
    >
      <AccordionTrigger
        aria-label={`Toggle ${config.label} activity details`}
        style={styles.trigger}
      >
        <View style={styles.triggerContent}>
          <PlatformBadge colors={platformColors}>{config.label}</PlatformBadge>
          <ActivityCountBadge count={activityCount} />
        </View>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color={tokens.color.mutedFg}
          size={16}
        />
      </AccordionTrigger>

      <AccordionContent style={styles.content}>
        <Text style={[styles.description, { color: tokens.color.mutedFg }]}>
          {config.description}
        </Text>
      </AccordionContent>
    </AccordionItem>
  );
}

function ActivityCountBadge({ count }: { count: number }) {
  return (
    <Pill>
      {count} {count === 1 ? "event" : "events"}
    </Pill>
  );
}

function PlatformBadge({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: BadgeColorStyle;
}) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderRadius: 999,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.pillText, { color: colors.color }]}
      >
        {children}
      </Text>
    </View>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  const tokens = useThemeTokens();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: tokens.color.bg,
          borderColor: tokens.color.border,
          borderRadius: 999,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.pillText, { color: tokens.color.mutedFg }]}
      >
        {children}
      </Text>
    </View>
  );
}

function StateText({ children }: { children: string }) {
  const tokens = useThemeTokens();

  return (
    <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
      {children}
    </Text>
  );
}

function getActivityPlatformConfig(
  platformKey: string,
): ActivityPlatformConfig {
  const config = activityPlatformConfigs[platformKey];

  if (config) {
    return config;
  }

  return {
    label: platformKey,
    ...fallbackActivityPlatformConfig,
  };
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

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 0,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  accordionItem: {
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  trigger: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    minHeight: 36,
  },
  triggerContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minWidth: 0,
  },
  content: {
    paddingHorizontal: 2,
    paddingTop: 12,
    rowGap: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  pill: {
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
});
