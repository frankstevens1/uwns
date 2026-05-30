import { View, Text, StyleSheet } from "react-native";
import type { WelcomeProps } from "./Welcome.types";
import { Card } from "../../../components/Card/Card.native";
import { CardHeader } from "../../../components/Card/CardHeader.native";
import { CardBody } from "../../../components/Card/CardBody.native";
import { CardFooter } from "../../../components/Card/CardFooter.native";
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
  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <Text style={styles.title}>{title}</Text>
        <Text style={{ marginTop: 6, fontSize: 12, color: tokens.color.mutedFg }}>{description}</Text>
      </CardHeader>

      <CardBody>
        {email && (
          <Text style={{ fontSize: 12, color: tokens.color.fg }}>
            Sent to <Text style={{ fontWeight: "600" }}>{email}</Text>
          </Text>
        )}
      </CardBody>

      <CardFooter>
        <View style={styles.actions}>
          {onOpenMailbox && (
            <Button onPress={onOpenMailbox}>Open mailbox</Button>
          )}

          {onContinue && (
            <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
              <Link onPress={onContinue}>
              ← Back to <Text style={{ fontWeight: "bold" }}>sign in</Text>
              </Link>
            </Text>
          )}
        </View>
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  actions: {
    gap: 10,
  },
});
