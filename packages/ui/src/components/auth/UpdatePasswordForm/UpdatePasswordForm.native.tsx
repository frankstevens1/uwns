import { View, StyleSheet, Text } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Link } from "../../../primitives/Link/Link.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.native";
import {
  evaluatePassword,
  generatePassword,
} from "../../../utils/auth/password";
import { useThemeTokens } from "../../../theme";
import type { UpdatePasswordFormProps } from "./UpdatePasswordForm.types";
import { useAuthFormState } from "../useAuthFormState";

export function UpdatePasswordForm({
  auth,
  notify,
  navigate,
  routes,
}: UpdatePasswordFormProps) {
  const { password, setPassword, isLoading, setIsLoading } = useAuthFormState();

  const afterUpdate = routes?.afterUpdate ?? "/auth/login";
  const evalRes = evaluatePassword(password);
  const tokens = useThemeTokens();

  const onSubmit = async () => {
    if (!evalRes.ok) {
      notify?.error?.("Password is too weak.", {
        description: "Please meet all requirements.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await auth.updateUserPassword({ password });
      if (error) {
        notify?.error?.(error.message);
        return;
      }
      notify?.success?.("Password updated.", {
        description: "You can now sign in.",
      });
      navigate?.(afterUpdate);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Update password" subtitle="Choose a strong new password.">
      <View style={styles.form}>
        <PasswordField
          value={password}
          onChangeText={setPassword}
          disabled={isLoading}
          autoComplete="new-password"
        />

        <View style={styles.row}>
          <Text style={{ fontSize: 12, color: tokens.color.mutedFg }}>
            Password requirements
          </Text>
          <Link
            onPress={() => setPassword(generatePassword())}
            disabled={isLoading}
            size="sm"
            tone="muted"
          >
            Generate
          </Link>
        </View>

        <PasswordRequirementsList password={password} />

        <Button
          onPress={onSubmit}
          loading={isLoading}
          disabled={isLoading || !password || !evalRes.ok}
        >
          {isLoading ? "Updating…" : "Update password"}
        </Button>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
