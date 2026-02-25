import { View, StyleSheet, Text } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.native";
import { evaluatePassword, generatePassword } from "../../../utils/auth/password";
import type { SignUpFormProps } from "./SignUpForm.types";
import { useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";

export function SignUpForm({ auth, notify, navigate, routes, emailRedirectTo }: SignUpFormProps) {
  const { email, setEmail, password, setPassword, isLoading, setIsLoading } =
    useAuthFormState();

  const afterSignUp = routes?.afterSignUp ?? "/auth/welcome";
  const login = routes?.login ?? "/auth/login";

  const evalRes = evaluatePassword(password);

  const onSubmit = async () => {
    if (!evalRes.ok) {
      notify?.error?.("Password is too weak.", { description: "Please meet all requirements." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await auth.signUp({ email, password, emailRedirectTo });
      if (error) {
        notify?.error?.(error.message);
        return;
      }
      notify?.success?.("Check your email.", { description: "We sent a confirmation link." });
      navigate?.(afterSignUp);
    } finally {
      setIsLoading(false);
    }
  };

  const tokens = useThemeTokens();
  return (
    <AuthCard
      title="Create account"
      subtitle="Sign up with email and a strong password."
      footer={
        <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
          Already have an account?{" "}
          <Link href={login} onPress={() => navigate?.(login)} style={{ fontWeight: "600", textDecorationLine: "underline" }}>
            Sign in
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

        <PasswordField value={password} onChangeText={setPassword} disabled={isLoading} />

        <View style={styles.row}>
          <Text style={{ fontSize: 12, color: tokens.color.mutedFg }}>Password requirements</Text>
          <Text
            style={{ fontSize: 12, fontWeight: "700", textDecorationLine: "underline", color: tokens.color.fg }}
            onPress={isLoading ? undefined : () => setPassword(generatePassword())}
          >
            Generate
          </Text>
        </View>

        <PasswordRequirementsList password={password} />

        <Button onPress={onSubmit} loading={isLoading} disabled={isLoading || !email || !password || !evalRes.ok}>
          {isLoading ? "Creating…" : "Create account"}
        </Button>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  // hint, gen, and footer colors will be injected inline using theme tokens
});
