import * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActions, useAuth, useNotifications } from "@repo/providers";
import { resolveNotificationTarget } from "@repo/lib";
import { useThemeTokens } from "@repo/ui";
import {
  NotificationListItem,
  canManuallyMarkRead,
} from "../components/Notifications/NotificationListItem";
import { BottomHeaderFade } from "../components/BottomHeaderFade";

const BOTTOM_HEADER_HEIGHT = 72;

export default function NotificationsScreen() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const { trackAction } = useActions();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const trackedNotificationsViewedRef = React.useRef(false);
  const unreadNotifications = React.useMemo(
    () => notifications.filter((notification) => !notification.read_at),
    [notifications],
  );
  const readNotifications = React.useMemo(
    () => notifications.filter((notification) => notification.read_at),
    [notifications],
  );
  const hasManualUnread = React.useMemo(
    () => unreadNotifications.some(canManuallyMarkRead),
    [unreadNotifications],
  );

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  React.useEffect(() => {
    if (authLoading || !user || trackedNotificationsViewedRef.current) return;

    trackedNotificationsViewedRef.current = true;
    void trackAction({
      actionName: "notifications_viewed",
      uniqueKey: "native:notifications_viewed",
      metadata: {
        source: "navigation",
        screen: "notifications",
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
          <CountPill label="Unread" value={unreadCount} />
          <View
            style={[
              styles.summaryDivider,
              { backgroundColor: tokens.color.border },
            ]}
          />
          <CountPill label="Read" value={readNotifications.length} />
        </View>

        {hasManualUnread ? (
          <Pressable
            onPress={() => {
              void trackAction({
                actionName: "notifications_mark_all_read_clicked",
                metadata: {
                  source: "native_notifications_screen",
                  screen: "notifications",
                  trigger: "button",
                  unreadCount: unreadNotifications.length,
                },
              });
              void markAllAsRead();
            }}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications read"
            style={({ pressed }) => [
              styles.markAllButton,
              {
                backgroundColor: tokens.color.subtleBg,
                borderColor: tokens.color.border,
                borderRadius: tokens.radius.md,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons name="checkmark-done" color={tokens.color.fg} size={16} />
            <Text style={[styles.markAllText, { color: tokens.color.fg }]}>
              Mark all read
            </Text>
          </Pressable>
        ) : null}

        {loading ? (
          <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
            Loading notifications...
          </Text>
        ) : error ? (
          <Text style={[styles.stateText, { color: tokens.color.dangerFg }]}>
            {error}
          </Text>
        ) : notifications.length === 0 ? (
          <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
            {"You're all caught up."}
          </Text>
        ) : (
          <View style={styles.sections}>
            <NotificationSection
              count={unreadNotifications.length}
              emptyMessage="You're all caught up."
              title="Unread"
            >
              {unreadNotifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  trackingSource="native_notifications_screen"
                  onPress={() => {
                    if (canManuallyMarkRead(notification)) {
                      void markAsRead(notification.id);
                    }
                    const resolvedTarget = resolveNotificationTarget(
                      notification.target,
                      "native",
                    );
                    if (!resolvedTarget) return;

                    if (resolvedTarget.type === "external_url") {
                      void Linking.openURL(resolvedTarget.href);
                      return;
                    }
                    router.navigate(resolvedTarget.href as Href);
                  }}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </NotificationSection>

            <NotificationSection
              count={readNotifications.length}
              emptyMessage="No read notifications yet."
              title="Read"
            >
              {readNotifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  trackingSource="native_notifications_screen"
                  onPress={() => {
                    const resolvedTarget = resolveNotificationTarget(
                      notification.target,
                      "native",
                    );
                    if (!resolvedTarget) return;

                    if (resolvedTarget.type === "external_url") {
                      void Linking.openURL(resolvedTarget.href);
                      return;
                    }
                    router.navigate(resolvedTarget.href as Href);
                  }}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </NotificationSection>
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
            Notifications
          </Text>
        </View>
      </View>
    </View>
  );
}

function CountPill({ label, value }: { label: string; value: number }) {
  const tokens = useThemeTokens();

  return (
    <View style={styles.countPill}>
      <Text style={[styles.countValue, { color: tokens.color.fg }]}>
        {value}
      </Text>
      <Text style={[styles.countLabel, { color: tokens.color.mutedFg }]}>
        {label}
      </Text>
    </View>
  );
}

function NotificationSection({
  children,
  count,
  emptyMessage,
  title,
}: {
  children: React.ReactNode;
  count: number;
  emptyMessage: string;
  title: string;
}) {
  const tokens = useThemeTokens();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: tokens.color.mutedFg }]}>
            {title}
          </Text>
          <View
            style={[
              styles.sectionCount,
              {
                borderColor: tokens.color.border,
                borderRadius: tokens.radius.sm,
              },
            ]}
          >
            <Text
              style={[styles.sectionCountText, { color: tokens.color.mutedFg }]}
            >
              {count}
            </Text>
          </View>
        </View>
      </View>

      {count === 0 ? (
        <Text
          style={[
            styles.emptySection,
            {
              borderColor: tokens.color.border,
              color: tokens.color.mutedFg,
            },
          ]}
        >
          {emptyMessage}
        </Text>
      ) : (
        <View style={styles.list}>{children}</View>
      )}
    </View>
  );
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
    alignItems: "stretch",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 72,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
  },
  countPill: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    rowGap: 2,
  },
  countValue: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  markAllButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  sections: {
    rowGap: 20,
  },
  section: {
    rowGap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  sectionCount: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  emptySection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 14,
  },
  list: {
    rowGap: 10,
  },
});
