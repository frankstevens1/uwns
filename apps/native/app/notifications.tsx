import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useNotifications } from "@repo/providers";
import type { Notification } from "@repo/lib";
import { useThemeTokens } from "@repo/ui";

export default function NotificationsScreen() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const { notifications, loading, error, markAsRead } = useNotifications();

  React.useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user]);

  if (authLoading || !user) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
      contentContainerStyle={[
        styles.screen,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name="chevron-back" color={tokens.color.fg} size={22} />
        </Pressable>
        <Text style={[styles.title, { color: tokens.color.fg }]}>
          Notifications
        </Text>
      </View>

      {loading ? (
        <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
          Loading notifications...
        </Text>
      ) : error ? (
        <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
          Notifications are unavailable.
        </Text>
      ) : notifications.length === 0 ? (
        <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
          No notifications yet.
        </Text>
      ) : (
        <View style={styles.list}>
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => {
                if (canManuallyMarkRead(notification)) {
                  void markAsRead(notification.id);
                }
                const href = getNativeNotificationHref(notification);
                if (href) router.navigate(href as any);
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: tokens.color.subtleBg,
                  borderColor: tokens.color.border,
                  borderRadius: tokens.radius.md,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: notification.read_at
                      ? tokens.color.border
                      : tokens.color.fg,
                  },
                ]}
              />
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: tokens.color.fg }]}>
                  {notification.title}
                </Text>
                <Text
                  style={[styles.itemBody, { color: tokens.color.mutedFg }]}
                >
                  {notification.body}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function canManuallyMarkRead(notification: Notification) {
  return (
    !notification.read_at &&
    notification.metadata.autoReadOnly !== true &&
    notification.type !== "login_platform_prompt"
  );
}

function getNativeNotificationHref(notification: Notification) {
  const nativeHref = notification.metadata.nativeHref;
  if (typeof nativeHref === "string") return nativeHref;
  if (notification.href === "/app/account") return "/account";
  return notification.href;
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 16,
    rowGap: 18,
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
  list: {
    rowGap: 10,
  },
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 6,
  },
  itemText: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
});
