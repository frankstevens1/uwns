import { View, StyleSheet, Text, Pressable } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import type { AuthMethod, LoginFormProps } from "./LoginForm.types";
import { useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";
import * as React from "react";

export function LoginForm({
  auth,
  navigate,
  notify,
  routes,
  authMethods = "both",
  authMethod = "password",
  emailRedirectTo,
}: LoginFormProps) {
  const { email, setEmail, password, setPassword, isLoading, setIsLoading } =
    useAuthFormState();
  const hasOtpClient = Boolean(auth.sendEmailOtp && auth.verifyEmailOtp);
  const canUseOtp = authMethods !== "password" && hasOtpClient;
  const canUsePassword = authMethods !== "otp" || !canUseOtp;
  const canChooseMethod = canUsePassword && canUseOtp;
  const initialMethod = !canUsePassword || (authMethod === "otp" && canUseOtp) ? "otp" : "password";
  const [method, setMethod] = React.useState<AuthMethod>(initialMethod);
  const [otpSent, setOtpSent] = React.useState(false);
  const [token, setToken] = React.useState("");

  const forgotPassword = routes?.forgotPassword ?? "/auth/forgot-password";
  const signUp = routes?.signUp ?? "/auth/sign-up";
  const isOtp = method === "otp" && canUseOtp;

  const selectMethod = (nextMethod: AuthMethod) => {
    setMethod(nextMethod);
    setOtpSent(false);
    setToken("");
  };

  const onEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);
    if (!otpSent) return;
    setOtpSent(false);
    setToken("");
  };

  const sendOtp = async () => {
    if (!auth.sendEmailOtp) return;

    const { error } = await auth.sendEmailOtp({
      email,
      emailRedirectTo,
      shouldCreateUser: false,
    });
    if (error) {
      notify?.error?.(error.message, {
        description: "Use an existing account email or sign up first.",
      });
      return false;
    }

    setOtpSent(true);
    notify?.success?.("Check your email.", {
      description: "Use the magic link or enter the code here.",
    });
    return true;
  };

  const onResendOtp = async () => {
    setIsLoading(true);
    try {
      await sendOtp();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!auth.verifyEmailOtp) return;

    const { error } = await auth.verifyEmailOtp({ email, token: token.trim() });
    if (error) {
      notify?.error?.(error.message, {
        description: "Check the code and try again.",
      });
      return false;
    }

    notify?.success?.("Welcome back!", {
      description: `${email}`,
    });
    navigate?.("/");
    return true;
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      if (isOtp) {
        if (otpSent) {
          await verifyOtp();
        } else {
          await sendOtp();
        }
        return;
      }

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
      subtitle={isOtp ? "Use an emailed magic link or code to continue." : "Use your email + password to continue."}
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
        {canChooseMethod ? (
          <View style={[styles.segment, { borderColor: tokens.color.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => selectMethod("password")}
              style={[styles.segmentButton, { backgroundColor: method === "password" ? tokens.color.subtleBg : "transparent" }]}
            >
              <Text style={[styles.segmentText, { color: tokens.color.fg }]}>Password</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => selectMethod("otp")}
              style={[styles.segmentButton, { backgroundColor: method === "otp" ? tokens.color.subtleBg : "transparent" }]}
            >
              <Text style={[styles.segmentText, { color: tokens.color.fg }]}>Magic link</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.field}>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={onEmailChange}
            disabled={isLoading}
            autoCapitalize="none"
          />
        </View>

        {isOtp ? (
          otpSent ? (
            <View style={styles.field}>
              <Label>Code</Label>
              <Input
                type="text"
                placeholder="123456"
                value={token}
                onChangeText={setToken}
                disabled={isLoading}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
              />
              <Text
                style={{ fontSize: 12, fontWeight: "700", textDecorationLine: "underline", color: tokens.color.fg }}
                onPress={isLoading || !email ? undefined : onResendOtp}
              >
                Resend code
              </Text>
            </View>
          ) : null
        ) : (
          <View style={styles.field}>
            <PasswordField value={password} onChangeText={setPassword} disabled={isLoading} />
            <View style={styles.row}>
              <Link href={forgotPassword} onPress={() => navigate?.(forgotPassword)} style={{ fontSize: 13 }}>
                Forgot?
              </Link>
            </View>
          </View>
        )}

        <Button
          onPress={onSubmit}
          loading={isLoading}
          disabled={isLoading || !email || (isOtp ? otpSent && !token : !password)}
        >
          {isLoading ? "Signing in…" : isOtp ? (otpSent ? "Verify code" : "Email me a link") : "Submit"}
        </Button>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  segment: { flexDirection: "row", gap: 2, borderWidth: 1, borderRadius: 5, padding: 2 },
  segmentButton: { flex: 1, height: 28, borderRadius: 3, alignItems: "center", justifyContent: "center" },
  segmentText: { fontSize: 12, fontWeight: "700" },
  // footer color will be injected inline using theme tokens
});
