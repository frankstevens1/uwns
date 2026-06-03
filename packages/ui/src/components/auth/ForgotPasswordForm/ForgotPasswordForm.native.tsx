import { View, StyleSheet, Text, type TextInput } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import type { ForgotPasswordFormProps } from "./ForgotPasswordForm.types";
import { useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";
import type { AuthFocusField } from "../LoginForm/LoginForm.types";
import { appendAuthFocusParam } from "../authFocus";
import * as React from "react";

function withEmailParam(path: string, email: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}email=${encodeURIComponent(email)}`;
}

export function ForgotPasswordForm({
  auth,
  notify,
  navigate,
  routes,
  redirectTo,
  initialFocus,
}: ForgotPasswordFormProps) {
  const { email, setEmail, isLoading, setIsLoading } = useAuthFormState();
  const emailInputRef = React.useRef<TextInput | null>(null);
  const activeFocusRef = React.useRef<AuthFocusField | null>(null);
  const capturedFocusRef = React.useRef<AuthFocusField | null>(null);
  const restoredInitialFocusRef = React.useRef<AuthFocusField | null>(null);

  const afterRequest = routes?.afterRequest ?? "/auth/welcome";
  const login = routes?.login ?? "/auth/login";

  const onFieldFocus = () => {
    activeFocusRef.current = "email";
  };

  const onFieldBlur = () => {
    if (activeFocusRef.current === "email") {
      activeFocusRef.current = null;
    }
  };

  const captureFocusHint = () => {
    capturedFocusRef.current = activeFocusRef.current;
  };

  const navigateWithFocus = (href: string) => {
    navigate?.(appendAuthFocusParam(href, capturedFocusRef.current));
    capturedFocusRef.current = null;
  };

  React.useLayoutEffect(() => {
    if (!initialFocus || restoredInitialFocusRef.current === initialFocus) return;

    restoredInitialFocusRef.current = initialFocus;
    emailInputRef.current?.focus();
  }, [initialFocus]);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await auth.resetPasswordForEmail({ email, redirectTo });
      if (error) {
        notify?.error?.(error.message);
        return;
      }
      notify?.success?.("Email sent.", {
        description: "Use the reset link or enter the code from the email.",
      });
      navigate?.(withEmailParam(afterRequest, email));
    } finally {
      setIsLoading(false);
    }
  };

  const tokens = useThemeTokens();
  return (
    <AuthCard
      title="Reset password"
      subtitle="We’ll send a password reset link and code to your email."
      footer={
        <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
          <Link
            href={login}
            onPressIn={captureFocusHint}
            onPress={() => navigateWithFocus(login)}
          >
            ← Back to <Text style={{ fontWeight: "bold" }}>sign in</Text>
          </Link>
        </Text>
      }
    >
      <View style={styles.form}>
        <View style={styles.field}>
          <Label>Email</Label>
          <Input
            ref={emailInputRef}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            disabled={isLoading}
            autoComplete="username"
            autoCapitalize="none"
            textContentType="username"
            onFocus={onFieldFocus}
            onBlur={onFieldBlur}
          />
        </View>

        <Button
          onPress={onSubmit}
          loading={isLoading}
          disabled={isLoading || !email}
        >
          {isLoading ? "Sending…" : "Send reset email"}
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
