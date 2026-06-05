import * as React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActions, useNotifications } from "@repo/providers";
import { Tip, useThemeTokens } from "@repo/ui";
import { useAppTopBarScroll } from "../../components/AppTopBar";
import { NotificationGroups } from "../../components/Notifications/NotificationGroups";
import { ActionsSection } from "../../components/Settings/ActionsSection";
import { getTabScreenTopPadding } from "../../constants/layout";

export default function SettingsTab() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { onScroll, setScrollOffset } = useAppTopBarScroll();
  const { trackAction } = useActions();
  const { notifications, preferences, loading, error, updatePreference } =
    useNotifications();
  const scrollOffsetRef = React.useRef(0);
  const trackedSettingsViewedRef = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      setScrollOffset(scrollOffsetRef.current);
    }, [setScrollOffset]),
  );

  React.useEffect(() => {
    if (trackedSettingsViewedRef.current) return;

    trackedSettingsViewedRef.current = true;
    void trackAction({
      actionName: "settings_viewed",
      uniqueKey: "native:settings_viewed",
      metadata: {
        source: "navigation",
        screen: "settings",
        trigger: "first_tab_visit",
      },
    });
  }, [trackAction]);

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
      onScroll={(event) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        onScroll(event);
      }}
      scrollEventThrottle={16}
      contentContainerStyle={[
        styles.screen,
        {
          paddingTop: getTabScreenTopPadding(insets.top),
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.color.fg }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>
          Manage notification delivery preferences and action context.
        </Text>
      </View>

      <Tip>
        Push delivery uses Expo native push tokens. Email delivery is recorded
        by the backend dev-log adapter until a production sender is configured.
      </Tip>

      <NotificationGroups
        notifications={notifications}
        preferences={preferences}
        loading={loading}
        error={error}
        onChange={updatePreference}
      />

      <ActionsSection />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 16,
    rowGap: 20,
  },
  header: {
    rowGap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
});
