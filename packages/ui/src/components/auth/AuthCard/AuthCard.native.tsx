import { Text, View, StyleSheet } from "react-native";
import type { AuthCardProps } from "./AuthCard.types";
import { Card } from "../../../components/Card/Card.native";
import { CardHeader } from "../../../components/Card/CardHeader.native";
import { CardBody } from "../../../components/Card/CardBody.native";
import { CardFooter } from "../../../components/Card/CardFooter.native";
import { useThemeTokens } from "../../../theme";

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  const tokens = useThemeTokens();
  return (
    <View style={{ width: "100%", maxWidth: 420 }}>
      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={{ marginTop: 6, fontSize: 12, color: tokens.color.mutedFg }}>{subtitle}</Text> : null}
        </CardHeader>

        <CardBody>{children}</CardBody>

        {footer ? <CardFooter>{footer}</CardFooter> : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "700" },
  // subtitle color will be injected inline using theme tokens
});
