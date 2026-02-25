import { View, StyleSheet } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.native";
import { evaluatePassword } from "../../../utils/auth/password";
import type { UpdatePasswordFormProps } from "./UpdatePasswordForm.types";
import { useAuthFormState } from "../useAuthFormState";

export function UpdatePasswordForm({ auth, notify, navigate, routes }: UpdatePasswordFormProps) {
  const { password, setPassword, isLoading, setIsLoading } =
    useAuthFormState();

  const afterUpdate = routes?.afterUpdate ?? "/auth/login";
  const evalRes = evaluatePassword(password);

  const onSubmit = async () => {
    if (!evalRes.ok) {
      notify?.error?.("Password is too weak.", { description: "Please meet all requirements." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await auth.updateUserPassword({ password });
      if (error) {
        notify?.error?.(error.message);
        return;
      }
      notify?.success?.("Password updated.", { description: "You can now sign in." });
      navigate?.(afterUpdate);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Update password" subtitle="Choose a strong new password.">
      <View style={styles.form}>
        <PasswordField value={password} onChangeText={setPassword} disabled={isLoading} />
        <PasswordRequirementsList password={password} />

        <Button onPress={onSubmit} loading={isLoading} disabled={isLoading || !password || !evalRes.ok}>
          {isLoading ? "Updating…" : "Update password"}
        </Button>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
});
