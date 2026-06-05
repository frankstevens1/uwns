import * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Action } from "@repo/lib";
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

type ActionPlatformsProps = {
  actions: Action[];
  loading: boolean;
  error: string | null;
};

type ActionPlatformConfig = {
  label: string;
  description: string;
};

type ActionPlatformSummary = {
  platform: string;
  count: number;
};

const actionPlatformConfigs: Record<string, ActionPlatformConfig> = {
  web: {
    label: "Web",
    description:
      "Actions recorded by the web app, including settings, account, and navigation.",
  },
  native: {
    label: "Native",
    description:
      "Actions recorded by the native app, including mobile account and tab navigation.",
  },
};

const fallbackActionPlatformConfig: Omit<ActionPlatformConfig, "label"> = {
  description: "Actions recorded by this platform.",
};

export function ActionPlatforms({
  actions,
  loading,
  error,
}: ActionPlatformsProps) {
  const tokens = useThemeTokens();
  const [openPlatformKey, setOpenPlatformKey] = React.useState<string | null>(
    null,
  );
  const platformSummaries = React.useMemo(
    () => getActionPlatformSummaries(actions),
    [actions],
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
    if (actions.some((action) => action.platform === openPlatformKey)) {
      return;
    }
    setOpenPlatformKey(null);
  }, [openPlatformKey, actions, showTotalsRow]);

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>
            Actions
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.navigate("/actions")}
          >
            View
          </Button>
        </View>
      </CardHeader>
      <CardBody padding="none">
        {loading ? (
          <StateText>Loading action...</StateText>
        ) : error ? (
          <StateText>Action is unavailable.</StateText>
        ) : platformSummaries.length === 0 ? (
          <StateText>No action platforms are available yet.</StateText>
        ) : (
          <AccordionRoot
            value={openPlatformKey}
            onValueChange={setOpenPlatformKey}
          >
            {showTotalsRow ? (
              <ActionPlatformsTotalsRow
                actionCount={actions.length}
                open={openPlatformKey === totalsAccordionValue}
                platformCount={platformSummaries.length}
              />
            ) : null}
            {platformSummaries.map((platform, index) => (
              <ActionPlatformRow
                key={platform.platform}
                actionCount={platform.count}
                config={getActionPlatformConfig(platform.platform)}
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

function ActionPlatformsTotalsRow({
  actionCount,
  open,
  platformCount,
}: {
  actionCount: number;
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
        aria-label="Toggle all action platform details"
        style={styles.trigger}
      >
        <View style={styles.triggerContent}>
          <PlatformBadge colors={platformColors}>All</PlatformBadge>
          <Pill>
            {platformCount} {platformCount === 1 ? "platform" : "platforms"}
          </Pill>
          <ActionCountBadge count={actionCount} />
        </View>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color={tokens.color.mutedFg}
          size={16}
        />
      </AccordionTrigger>

      <AccordionContent style={styles.content}>
        <Text style={[styles.description, { color: tokens.color.mutedFg }]}>
          Review tracked actions across every platform represented in the
          current history.
        </Text>
      </AccordionContent>
    </AccordionItem>
  );
}

function ActionPlatformRow({
  actionCount,
  config,
  last,
  open,
  platform,
}: {
  actionCount: number;
  config: ActionPlatformConfig;
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
        aria-label={`Toggle ${config.label} action details`}
        style={styles.trigger}
      >
        <View style={styles.triggerContent}>
          <PlatformBadge colors={platformColors}>{config.label}</PlatformBadge>
          <ActionCountBadge count={actionCount} />
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

function ActionCountBadge({ count }: { count: number }) {
  return (
    <Pill>
      {count} {count === 1 ? "action" : "actions"}
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

function getActionPlatformConfig(
  platformKey: string,
): ActionPlatformConfig {
  const config = actionPlatformConfigs[platformKey];

  if (config) {
    return config;
  }

  return {
    label: platformKey,
    ...fallbackActionPlatformConfig,
  };
}

function getActionPlatformSummaries(
  actions: Action[],
): ActionPlatformSummary[] {
  const countsByPlatform = new Map<string, number>();

  for (const action of actions) {
    countsByPlatform.set(
      action.platform,
      (countsByPlatform.get(action.platform) ?? 0) + 1,
    );
  }

  return [...countsByPlatform.entries()]
    .map(([platform, count]) => ({ platform, count }))
    .sort((left, right) =>
      getActionPlatformConfig(left.platform).label.localeCompare(
        getActionPlatformConfig(right.platform).label,
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
