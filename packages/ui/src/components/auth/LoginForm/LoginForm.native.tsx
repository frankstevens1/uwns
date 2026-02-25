import { View, StyleSheet, Text } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import type { LoginFormProps } from "./LoginForm.types";
import { useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";

export function LoginForm({ auth, navigate, notify, routes }: LoginFormProps) {
  const { email, setEmail, password, setPassword, isLoading, setIsLoading } =
    useAuthFormState();

  const forgotPassword = routes?.forgotPassword ?? "/auth/forgot-password";
  const signUp = routes?.signUp ?? "/auth/sign-up";

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await auth.signInWithPassword({ email, password });
      if (error) {
        notify?.error?.(error.message, {
          description: "We don't recognize this email or password.",
        });
        return;
      }

      notify?.success?.("Welcome back!", {
        description: `${email}`,
      });

      const next = "/";
      navigate?.(next);
    } finally {
      setIsLoading(false);
    }
  };

  const tokens = useThemeTokens();
  return (
    <AuthCard
      title="Sign in"
      subtitle="Use your email + password to continue."
      footer={
        <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
          Don&apos;t have an account?{" "}
          <Link href={signUp} onPress={() => navigate?.(signUp)} style={{ fontWeight: "600", textDecorationLine: "underline" }}>
            Sign up
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

        <View style={styles.field}>
          <PasswordField value={password} onChangeText={setPassword} disabled={isLoading} />
          <View style={styles.row}>
            <Link href={forgotPassword} onPress={() => navigate?.(forgotPassword)} style={{ fontSize: 13 }}>
              Forgot?
            </Link>
          </View>
        </View>

        <Button onPress={onSubmit} loading={isLoading} disabled={isLoading || !email || !password}>
          {isLoading ? "Signing in…" : "Submit"}
        </Button>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  // footer color will be injected inline using theme tokens
});
