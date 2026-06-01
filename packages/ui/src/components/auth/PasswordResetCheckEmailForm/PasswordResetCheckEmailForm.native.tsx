import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import { OtpCodeInput } from "../OtpCodeInput/OtpCodeInput.native";
import { useThemeTokens } from "../../../theme";
import type { PasswordResetCheckEmailFormProps } from "./PasswordResetCheckEmailForm.types";

const OTP_LENGTH = 6;

export function PasswordResetCheckEmailForm({
  auth,
  email: initialEmail,
  redirectTo,
  onOpenMailbox,
  notify,
  navigate,
  routes,
}: PasswordResetCheckEmailFormProps) {
  const tokens = useThemeTokens();
  const [email, setEmail] = React.useState(initialEmail ?? "");
  const [token, setToken] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [verifyingToken, setVerifyingToken] = React.useState<string | null>(
    null,
  );

  const login = routes?.login ?? "/auth/login";
  const updatePassword = routes?.updatePassword ?? "/auth/update-password";
  const canVerify = Boolean(email && token.length === OTP_LENGTH);

  const verifyCode = React.useCallback(async () => {
    const currentToken = token.trim();
    if (!email || currentToken.length !== OTP_LENGTH) return false;

    setVerifyingToken(currentToken);
    setIsLoading(true);
    try {
      const { error } = await auth.verifyPasswordResetOtp({
        email,
        token: currentToken,
      });
      if (error) {
        notify?.error?.(error.message, {
          description: "Check the code and try again.",
        });
        return false;
      }

      notify?.success?.("Code verified.", {
        description: "Choose a new password to finish resetting your account.",
      });
      navigate?.(updatePassword);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [auth, email, navigate, notify, token, updatePassword]);

  React.useEffect(() => {
    if (!canVerify || isLoading || verifyingToken === token) return;
    void verifyCode();
  }, [canVerify, isLoading, token, verifyingToken, verifyCode]);

  const resendCode = async () => {
    if (!auth.resetPasswordForEmail || !email) return;

    setIsLoading(true);
    try {
      const { error } = await auth.resetPasswordForEmail({ email, redirectTo });
      if (error) {
        notify?.error?.(error.message, {
          description: "Check the email address and try again.",
        });
        return;
      }

      setToken("");
      setVerifyingToken(null);
      notify?.success?.("Email sent.", {
        description: "Use the reset link or enter the new code here.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Check your email"
      subtitle="Use the reset link or enter the code we emailed you."
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
            disabled={isLoading || Boolean(initialEmail)}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Label>Code</Label>
            {auth.resetPasswordForEmail ? (
              <Link
                onPress={resendCode}
                disabled={isLoading || !email}
                size="sm"
                tone="muted"
              >
                Resend
              </Link>
            ) : null}
          </View>
          <OtpCodeInput
            value={token}
            onChangeText={setToken}
            disabled={isLoading}
          />
        </View>

        {onOpenMailbox ? (
          <Button
            variant="outline"
            onPress={onOpenMailbox}
            disabled={isLoading}
          >
            Open mailbox
          </Button>
        ) : null}
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: { gap: 6 },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
});
