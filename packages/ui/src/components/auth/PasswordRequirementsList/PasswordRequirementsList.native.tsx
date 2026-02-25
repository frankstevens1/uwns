import { View, Text } from "react-native";
import type { PasswordRequirementsListProps } from "./PasswordRequirementsList.types";
import { evaluatePassword } from "../../../utils/auth/password";
import { useThemeTokens } from "../../../theme";
import { MaterialIcons } from "@expo/vector-icons";

export function PasswordRequirementsList({ password }: PasswordRequirementsListProps) {
  const { results } = evaluatePassword(password);
  const tokens = useThemeTokens();

  return (
    <View style={{ marginTop: 8, gap: 4 }}>
      {results.map((r) => (
        <View key={r.id} style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons
            name="check-circle"
            size={16}
            color={r.ok ? tokens.color.successFg : tokens.color.mutedFg}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: 13,
              color: r.ok ? tokens.color.successFg : tokens.color.mutedFg,
            }}
          >
            {r.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
