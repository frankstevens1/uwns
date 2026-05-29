import { View, StyleSheet, Text } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import type { ForgotPasswordFormProps } from "./ForgotPasswordForm.types";
import { useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";

export function ForgotPasswordForm({ auth, notify, navigate, routes, redirectTo }: ForgotPasswordFormProps) {
  const { email, setEmail, isLoading, setIsLoading } = useAuthFormState();

  const afterRequest = routes?.afterRequest ?? "/auth/welcome";
  const login = routes?.login ?? "/auth/login";

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await auth.resetPasswordForEmail({ email, redirectTo });
      if (error) {
        notify?.error?.(error.message);
        return;
      }
      notify?.success?.("Email sent.", { description: "Check your inbox for the reset link." });
      navigate?.(afterRequest);
    } finally {
      setIsLoading(false);
    }
  };

  const tokens = useThemeTokens();
  return (
    <AuthCard
      title="Reset password"
      subtitle="We’ll send a password reset link to your email."
      footer={
        <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
          <Link href={login} onPress={() => navigate?.(login)}>
            ← Back to <Text style={{ fontWeight: "bold" }}>sign in</Text>
          </Link>
        </Text>
      }
    >
      <View style={styles.form}>
        <View style={styles.field}>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            disabled={isLoading}
            autoCapitalize="none"
          />
        </View>

        <Button onPress={onSubmit} loading={isLoading} disabled={isLoading || !email}>
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: { gap: 6 },
  // footer color will be injected inline using theme tokens
});
