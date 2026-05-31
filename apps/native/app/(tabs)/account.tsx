import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActivity, useAuth } from "@repo/providers";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Code,
  CodeBlock,
  ReadOnlyInput,
  Tip,
  useThemeTokens,
} from "@repo/ui";

const signedInIdentityExample = `import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useActivity, useAuth } from "@repo/providers";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ReadOnlyInput,
  useThemeTokens,
} from "@repo/ui";

export function SignedInIdentity() {
  const { user, loading, signOut } = useAuth();
  const { trackEvent } = useActivity();
  const tokens = useThemeTokens();
  const [busy, setBusy] = React.useState(false);

  const handleSignOut = async () => {
    if (busy) return;

    setBusy(true);
    try {
      await trackEvent({
        eventName: "signed_out",
        metadata: { trigger: "account_card" },
      });
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>
          Signed-in identity
        </Text>
      </CardHeader>
      <CardBody>
        <View style={styles.fields}>
          <ReadOnlyInput
            label="Email"
            value={user?.email}
            loading={loading}
            size="md"
          />
          <ReadOnlyInput
            label="User ID"
            value={user?.id}
            loading={loading}
            size="md"
          />
        </View>
      </CardBody>
      <CardFooter>
        <Button
          onPress={handleSignOut}
          disabled={loading || !user || busy}
          variant="primary"
        >
          {busy ? "Signing out..." : "Sign out"}
        </Button>
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 14, fontWeight: "600" },
  fields: { gap: 12 },
});`;

const SECTION_GAP = 24;

function SignedInIdentity() {
  const { user, loading, signOut } = useAuth();
  const { trackEvent } = useActivity();
  const tokens = useThemeTokens();
  const [busy, setBusy] = React.useState(false);

  const handleSignOut = async () => {
    if (busy) return;

    setBusy(true);
    try {
      await trackEvent({
        eventName: "signed_out",
        metadata: { trigger: "account_card" },
      });
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>
          Signed-in identity
        </Text>
      </CardHeader>
      <CardBody>
        <View style={styles.fields}>
          <ReadOnlyInput
            label="Email"
            value={user?.email}
            loading={loading}
            size="md"
          />
          <ReadOnlyInput
            label="User ID"
            value={user?.id}
            loading={loading}
            size="md"
          />
        </View>
      </CardBody>
      <CardFooter>
        <Button
          onPress={handleSignOut}
          disabled={loading || !user || busy}
          variant="primary"
        >
          {busy ? "Signing out..." : "Sign out"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AccountTab() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { trackEvent } = useActivity();
  const [view, setView] = React.useState<"component" | "code">("component");
  const showComponent = view === "component";

  React.useEffect(() => {
    void trackEvent({
      eventName: "account_viewed",
      uniqueKey: "native:account_viewed",
      metadata: {
        source: "account",
        screen: "account_tab",
        trigger: "first_tab_visit",
      },
    });
  }, [trackEvent]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
      contentContainerStyle={[
        styles.screen,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.color.fg }]}>Account</Text>
        <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>
          A minimal user-specific route showing authenticated data from Supabase.
        </Text>
      </View>

      <Tip>
        Use <Code>@repo/providers</Code> for auth state and compose it with
        shared <Code>@repo/ui</Code> primitives to build matching web and native
        components from the same building blocks.
      </Tip>

      <View
        style={[
          styles.segmented,
          {
            borderColor: tokens.color.border,
          },
        ]}
      >
        <Pressable
          onPress={() => setView("component")}
          accessibilityRole="button"
          accessibilityState={{ selected: showComponent }}
          style={[
            styles.segment,
            showComponent && {
              backgroundColor: tokens.color.subtleBg,
              borderColor: tokens.color.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: showComponent ? tokens.color.fg : tokens.color.mutedFg },
            ]}
          >
            Component
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setView("code")}
          accessibilityRole="button"
          accessibilityState={{ selected: !showComponent }}
          style={[
            styles.segment,
            !showComponent && {
              backgroundColor: tokens.color.subtleBg,
              borderColor: tokens.color.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: !showComponent ? tokens.color.fg : tokens.color.mutedFg },
            ]}
          >
            Code
          </Text>
        </Pressable>
      </View>

      {showComponent ? (
        <SignedInIdentity />
      ) : (
        <CodeBlock
          code={signedInIdentityExample}
          filename="SignedInIdentity.native.tsx"
          showLineNumbers={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: SECTION_GAP,
    paddingHorizontal: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  fields: {
    gap: 12,
  },
  segmented: {
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    padding: 3,
  },
  segment: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
