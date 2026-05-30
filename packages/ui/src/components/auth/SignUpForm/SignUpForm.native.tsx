import { View, StyleSheet, Text, Pressable } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.native";
import { OtpCodeInput } from "../OtpCodeInput/OtpCodeInput.native";
import { evaluatePassword, generatePassword } from "../../../utils/auth/password";
import type { SignUpFormProps } from "./SignUpForm.types";
import type { AuthMethod } from "../LoginForm/LoginForm.types";
import { buttonTokens, inputTokens, useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";
import * as React from "react";

const OTP_LENGTH = 6;

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
  const [verifyingToken, setVerifyingToken] = React.useState<string | null>(null);

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
    setToken("");
    setVerifyingToken(null);
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

    const currentToken = token.trim();
    setVerifyingToken(currentToken);
    setIsLoading(true);
    const { error } = await auth.verifyEmailOtp({ email, token: currentToken });
    if (error) {
      notify?.error?.(error.message, {
        description: "Check the code and try again.",
      });
      setIsLoading(false);
      return false;
    }

    notify?.success?.("Account created.", { description: `${email}` });
    navigate?.(afterOtpVerify);
    return true;
  };

  React.useEffect(() => {
    if (!isOtp || !otpSent || token.length !== OTP_LENGTH || isLoading || verifyingToken === token) {
      return;
    }

    void verifyOtp();
  }, [isOtp, otpSent, token, isLoading, verifyingToken]);

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
      footer={isOtp ? null : 
        <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
          Already have an account?{" "}
          <Link href={login} onPress={() => navigate?.(login)} style={{ fontWeight: "600" }}>
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
              style={[
                styles.segmentButton,
                {
                  backgroundColor: method === "password" ? tokens.color.subtleBg : "transparent",
                  borderColor: method === "password" ? tokens.color.border : "transparent",
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: tokens.color.fg }]}>Password</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => selectMethod("otp")}
              style={[
                styles.segmentButton,
                {
                  backgroundColor: method === "otp" ? tokens.color.subtleBg : "transparent",
                  borderColor: method === "otp" ? tokens.color.border : "transparent",
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: tokens.color.fg }]}>Magic link</Text>
            </Pressable>
          </View>
        ) : null}

        {otpSent ? (
          <View style={styles.field}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.color.mutedFg }}>Email</Text>
            <View style={[styles.lockedEmail, { borderColor: tokens.color.border, backgroundColor: tokens.color.bg }]}>
              <Text style={{ fontSize: inputTokens.base.fontSize, color: tokens.color.fg }}>{email}</Text>
            </View>
          </View>
        ) : (
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
        )}

        {isOtp ? (
          otpSent ? (
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Label>Code</Label>
                <Link
                  onPress={onResendOtp}
                  disabled={isLoading || !email}
                  size="sm"
                  tone="muted"
                >
                  Resend
                </Link>
              </View>
              <OtpCodeInput
                value={token}
                onChangeText={setToken}
                disabled={isLoading}
              />
            </View>
          ) : null
        ) : (
          <>
            <PasswordField value={password} onChangeText={setPassword} disabled={isLoading} />

            <View style={styles.row}>
              <Text style={{ fontSize: 12, color: tokens.color.mutedFg }}>Password requirements</Text>
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
          </>
        )}

        {!otpSent ? (
          <Button
            onPress={onSubmit}
            loading={isLoading}
            disabled={isLoading || !email || (isOtp ? false : !password || !evalRes.ok)}
          >
            {isLoading ? "Creating…" : isOtp ? "Email me a link" : "Create account"}
          </Button>
        ) : null}
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: { gap: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lockedEmail: {
    minHeight: inputTokens.base.height.md,
    borderWidth: inputTokens.base.borderWidth,
    borderRadius: inputTokens.base.radius,
    paddingHorizontal: inputTokens.base.paddingX,
    justifyContent: "center",
  },
  segment: {
    flexDirection: "row",
    gap: 2,
    borderWidth: buttonTokens.base.borderWidth,
    borderRadius: buttonTokens.base.radius,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    height: buttonTokens.size.sm.height,
    borderWidth: 1,
    borderRadius: buttonTokens.base.radius,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: { fontSize: buttonTokens.size.sm.fontSize, fontWeight: buttonTokens.base.fontWeight as any },
  // hint, gen, and footer colors will be injected inline using theme tokens
});
