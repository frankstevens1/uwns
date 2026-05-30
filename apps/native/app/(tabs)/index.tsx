import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Tip,
  useThemeTokens,
} from "@repo/ui";

const homeCards = [
  {
    title: "Product flows",
    subtitle: "Your app logic starts here.",
    body: "Replace this tab with your authenticated product home. Keep navigation, layout, and native-only glue in the Expo app.",
    icon: "route",
  },
  {
    title: "Shared providers",
    subtitle: "Reuse real app state.",
    body: "Move auth, account context, feature flags, and other cross-platform state into shared providers when both apps need it.",
    icon: "widgets",
  },
  {
    title: "Account pattern",
    subtitle: "Concrete auth example.",
    body: "The account tab shows provider state composed with shared UI primitives in a small, inspectable component.",
    icon: "account-circle",
  },
];

const SECTION_GAP = 24;

export default function HomeTab() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();

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
        <Text style={[styles.title, { color: tokens.color.fg }]}>
          Home
        </Text>
        <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>
          This protected tab is the first place to build product-specific flows.
          The demo keeps the screen simple so the app structure, provider
          boundary, and shared UI patterns are easy to see.
        </Text>
      </View>

      <Tip>
        Compose app state from <Code>@repo/providers</Code> with shared building
        blocks from <Code>@repo/ui</Code>. Keep the contract shared, but let each
        platform choose the layout and interaction details that feel native.
      </Tip>

      <View style={styles.cards}>
        {homeCards.map((item) => (
          <Card key={item.title} padding="none" elevation="sm">
            <CardHeader divider={false}>
              <View style={styles.cardHeading}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: tokens.color.subtleBg,
                      borderColor: tokens.color.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={17}
                    color={tokens.color.fg}
                  />
                </View>
                <View style={styles.cardHeadingText}>
                  <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      { color: tokens.color.mutedFg },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </View>
            </CardHeader>
            <CardBody
              padding="sm"
              style={styles.cardBody}
            >
              <Text style={[styles.cardBodyText, { color: tokens.color.mutedFg }]}>
                {item.body}
              </Text>
            </CardBody>
          </Card>
        ))}
      </View>

      <Card padding="none" variant="subtle">
        <CardBody padding="sm">
          <View style={styles.accountCta}>
            <Text style={[styles.ctaText, { color: tokens.color.mutedFg }]}>
              The account tab shows the same provider and UI pattern applied to
              a concrete authenticated component.
            </Text>
            <Button variant="primary" onPress={() => router.push("/account")}>
              Account demo
            </Button>
          </View>
        </CardBody>
      </Card>
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
  cards: {
    gap: SECTION_GAP,
    marginHorizontal: 8,
  },
  cardHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  cardHeadingText: {
    flex: 1,
  },
  iconBox: {
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "300",
    lineHeight: 16,
    marginTop: 2,
  },
  cardBody: {
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  cardBodyText: {
    fontSize: 13,
    fontWeight: "300",
    lineHeight: 19,
  },
  accountCta: {
    gap: 12,
  },
  ctaText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
