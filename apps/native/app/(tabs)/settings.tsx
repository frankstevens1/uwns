import * as React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotifications } from "@repo/providers";
import {
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  SettingsRow,
  Tip,
  useThemeTokens,
} from "@repo/ui";
import type { NotificationPreference } from "@repo/lib";
import { useAppTopBarScroll } from "../../components/AppTopBar";
import { getTabScreenTopPadding } from "../../constants/layout";

const groupLabels: Record<string, string> = {
  auth: "Authentication",
  account: "Account",
};

export default function SettingsTab() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { onScroll, setScrollOffset } = useAppTopBarScroll();
  const { preferences, loading, error, updatePreference } = useNotifications();
  const scrollOffsetRef = React.useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      setScrollOffset(scrollOffsetRef.current);
    }, [setScrollOffset]),
  );

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
          Manage notification delivery preferences for the demo app.
        </Text>
      </View>

      <Tip>
        Push delivery uses Expo native push tokens. Email delivery is recorded by
        the backend dev-log adapter until a production sender is configured.
      </Tip>

      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>
            Notifications
          </Text>
        </CardHeader>
        <CardBody>
          <View style={styles.preferenceList}>
            {loading ? (
              <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
                Loading preferences...
              </Text>
            ) : error ? (
              <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
                Notification preferences are unavailable.
              </Text>
            ) : preferences.length === 0 ? (
              <Text style={[styles.stateText, { color: tokens.color.mutedFg }]}>
                No notification groups are available yet.
              </Text>
            ) : (
              preferences.map((preference) => (
                <PreferenceRow
                  key={preference.group_key}
                  preference={preference}
                  onChange={updatePreference}
                />
              ))
            )}
          </View>
        </CardBody>
      </Card>
    </Animated.ScrollView>
  );
}

function PreferenceRow({
  preference,
  onChange,
}: {
  preference: NotificationPreference;
  onChange: (
    groupKey: string,
    patch: Partial<
      Pick<
        NotificationPreference,
        "in_app_enabled" | "email_enabled" | "push_enabled"
      >
    >,
  ) => Promise<NotificationPreference | null>;
}) {
  return (
    <SettingsRow
      label={groupLabels[preference.group_key] ?? preference.group_key}
      description="Controls in-app, email, and native push delivery."
      actions={
        <>
          <Checkbox
            label="In-app"
            checked={preference.in_app_enabled}
            onChange={(checked) =>
              void onChange(preference.group_key, { in_app_enabled: checked })
            }
          />
          <Checkbox
            label="Email"
            checked={preference.email_enabled}
            onChange={(checked) =>
              void onChange(preference.group_key, { email_enabled: checked })
            }
          />
          <Checkbox
            label="Push"
            checked={preference.push_enabled}
            onChange={(checked) =>
              void onChange(preference.group_key, { push_enabled: checked })
            }
          />
        </>
      }
    />
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  preferenceList: {
    rowGap: 12,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
