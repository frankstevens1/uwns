import { View, StyleSheet, Text, Pressable } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.native";
import { evaluatePassword, generatePassword } from "../../../utils/auth/password";
import type { SignUpFormProps } from "./SignUpForm.types";
import type { AuthMethod } from "../LoginForm/LoginForm.types";
import { useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";
import * as React from "react";

export function SignUpForm({
  auth,
  notify,
  navigate,
  routes,
  emailRedirectTo,
  authMethods = "both",
  authMethod = "password",
}: SignUpFormProps) {
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

  const afterSignUp = routes?.afterSignUp ?? "/auth/welcome";
  const afterOtpVerify = routes?.afterOtpVerify ?? "/";
  const login = routes?.login ?? "/auth/login";
  const isOtp = method === "otp" && canUseOtp;

  const evalRes = evaluatePassword(password);

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
      shouldCreateUser: true,
    });
    if (error) {
      notify?.error?.(error.message);
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

    notify?.success?.("Account created.", { description: `${email}` });
    navigate?.(afterOtpVerify);
    return true;
  };

  const onSubmit = async () => {
    if (!isOtp && !evalRes.ok) {
      notify?.error?.("Password is too weak.", { description: "Please meet all requirements." });
      return;
    }

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
      subtitle={isOtp ? "Sign up with an emailed magic link or code." : "Sign up with email and a strong password."}
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
          <>
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
          </>
        )}

        <Button
          onPress={onSubmit}
          loading={isLoading}
          disabled={isLoading || !email || (isOtp ? otpSent && !token : !password || !evalRes.ok)}
        >
          {isLoading ? "Creating…" : isOtp ? (otpSent ? "Verify code" : "Email me a link") : "Create account"}
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
  // hint, gen, and footer colors will be injected inline using theme tokens
});
