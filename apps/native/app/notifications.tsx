import * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useNotifications } from "@repo/providers";
import { useThemeTokens } from "@repo/ui";
import {
  NotificationListItem,
  canManuallyMarkRead,
  getNativeNotificationHref,
} from "../components/Notifications/NotificationListItem";
import { BottomHeaderFade } from "../components/BottomHeaderFade";

const BOTTOM_HEADER_HEIGHT = 72;

export default function NotificationsScreen() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const { notifications, loading, error, markAsRead } = useNotifications();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

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
          <View style={styles.list}>
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onPress={() => {
                  if (canManuallyMarkRead(notification)) {
                    void markAsRead(notification.id);
                  }
                  const href = getNativeNotificationHref(notification);
                  if (href) {
                    router.navigate(href as Href);
                  }
                }}
                onMarkAsRead={() => void markAsRead(notification.id)}
              />
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
            Notifications
          </Text>
        </View>
      </View>
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
  list: {
    rowGap: 10,
  },
});
