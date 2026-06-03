import { View, Text, StyleSheet } from "react-native";
import type { WelcomeProps } from "./Welcome.types";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Link } from "../../../primitives/Link/Link.native";
import { useThemeTokens } from "../../../theme";

export function Welcome({
  email,
  title = "Check your email",
  description = "We’ve sent you a link to continue.",
  onOpenMailbox,
  onContinue,
}: WelcomeProps) {
  const tokens = useThemeTokens();
  const footer = onContinue ? (
    <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
      <Link onPress={onContinue}>
        ← Back to <Text style={{ fontWeight: "bold" }}>sign in</Text>
      </Link>
    </Text>
  ) : undefined;

  return (
    <AuthCard title={title} subtitle={description} footer={footer}>
      <View style={styles.form}>
        {email && (
          <Text style={{ fontSize: 13, color: tokens.color.fg }}>
            Sent to <Text style={{ fontWeight: "600" }}>{email}</Text>
          </Text>
        )}

        {onOpenMailbox && (
          <Button variant="outline" onPress={onOpenMailbox}>
            Open mailbox
          </Button>
        )}
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
});
