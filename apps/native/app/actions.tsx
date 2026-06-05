import * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Action } from "@repo/lib";
import { useActions, useAuth } from "@repo/providers";
import {
  Button,
  CodeBlock,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  getKeyedBadgeColors,
  useThemeTokens,
  type BadgeColorStyle,
} from "@repo/ui";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomHeaderFade } from "../components/BottomHeaderFade";

const BOTTOM_HEADER_HEIGHT = 72;

export default function ActionsScreen() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const { actions, error, loading, trackAction } = useActions();
  const trackedActionsViewedRef = React.useRef(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  React.useEffect(() => {
    if (authLoading || !user || trackedActionsViewedRef.current) return;

    trackedActionsViewedRef.current = true;
    void trackAction({
      actionName: "actions_viewed",
      uniqueKey: "native:actions_viewed",
      metadata: {
        source: "navigation",
        screen: "actions",
        trigger: "first_screen_visit",
      },
    });
  }, [authLoading, trackAction, user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: tokens.color.bg }}
        contentContainerStyle={[
          styles.screen,
          {
            paddingTop: insets.bottom,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View
          style={[
            styles.summary,
            {
              backgroundColor: tokens.color.subtleBg,
              borderColor: tokens.color.border,
              borderRadius: tokens.radius.md,
            },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: tokens.color.mutedFg }]}>
            Live actions
          </Text>
          <Text style={[styles.summaryValue, { color: tokens.color.fg }]}>
            {actions.length}
          </Text>
        </View>

        {loading ? (
          <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
            Loading action...
          </Text>
        ) : error ? (
          <Text style={[styles.stateText, { color: tokens.color.dangerFg }]}>
            {error}
          </Text>
        ) : actions.length === 0 ? (
          <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
            No actions yet.
          </Text>
        ) : (
          <View style={styles.list}>
            {actions.map((action) => (
              <ActionListItem key={action.id} action={action} />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomHeaderFade
        backgroundColor={tokens.color.bg}
        bottomOffset={BOTTOM_HEADER_HEIGHT}
      />

      <View
        style={[
          styles.headerShell,
          {
            backgroundColor: tokens.color.bg,
          },
        ]}
      >
        <View
          style={[styles.header, { paddingHorizontal: 20, paddingBottom: 0 }]}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Ionicons name="chevron-back" color={tokens.color.fg} size={22} />
          </Pressable>
          <Text style={[styles.title, { color: tokens.color.fg }]}>
            Actions
          </Text>
        </View>
      </View>
    </View>
  );
}

function ActionListItem({ action }: { action: Action }) {
  const tokens = useThemeTokens();
  const platformColors = getKeyedBadgeColors(action.platform);
  const [metadataOpen, setMetadataOpen] = React.useState(false);
  const actionTime = formatActionTime(action.occurred_at);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View metadata for ${formatActionName(action.action_name)}`}
        onPress={() => setMetadataOpen(true)}
        style={({ pressed }) => [
          styles.item,
          {
            backgroundColor: tokens.color.subtleBg,
            borderColor: tokens.color.border,
            borderRadius: tokens.radius.md,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <View style={styles.itemHeader}>
          <Text
            numberOfLines={1}
            style={[styles.actionName, { color: tokens.color.fg }]}
          >
            {formatActionName(action.action_name)}
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={[styles.metadata, { color: tokens.color.mutedFg }]}
        >
          {action.unique_key ?? "No unique key"}
        </Text>

        <View style={styles.metaRow}>
          <PlatformBadge colors={platformColors}>
            {getPlatformLabel(action.platform)}
          </PlatformBadge>
          <Text
            numberOfLines={1}
            style={[styles.uniqueKey, { color: tokens.color.mutedFg }]}
          >
            {actionTime}
          </Text>
        </View>
      </Pressable>

      <DialogRoot open={metadataOpen} onOpenChange={setMetadataOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Action metadata</DialogTitle>
            <DialogDescription>
              {`${formatActionName(action.action_name)} - ${actionTime}`}
            </DialogDescription>
            <CodeBlock
              code={formatMetadataJson(action.metadata)}
              filename="metadata.json"
              language="json"
              showLineNumbers={false}
              style={styles.dialogCode}
            />
            <DialogFooter>
              <Button variant="outline" onPress={() => setMetadataOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </>
  );
}

function formatMetadataJson(metadata: Action["metadata"]) {
  return JSON.stringify(metadata, null, 2);
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
        styles.platformBadge,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.platformText, { color: colors.color }]}
      >
        {children}
      </Text>
    </View>
  );
}

function formatActionTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatActionName(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPlatformLabel(value: string) {
  if (value === "web") return "Web";
  if (value === "native") return "Native";
  return value;
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 16,
    rowGap: 18,
  },
  headerShell: {
    height: BOTTOM_HEADER_HEIGHT,
    justifyContent: "flex-start",
    zIndex: 2,
  },
  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
  },
  summary: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  list: {
    rowGap: 10,
  },
  item: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    rowGap: 8,
  },
  itemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  actionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 0,
  },
  metadata: {
    fontSize: 12,
    lineHeight: 18,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
  platformBadge: {
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  platformText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  uniqueKey: {
    flexShrink: 1,
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
    minWidth: 0,
  },
  dialogCode: {
    marginTop: 14,
  },
});
