import { View, StyleSheet, Text, Pressable, type TextInput } from "react-native";
import { AuthCard } from "../AuthCard/AuthCard.native";
import { Button } from "../../../primitives/Button/Button.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import { Link } from "../../../primitives/Link/Link.native";
import { PasswordField } from "../PasswordField/PasswordField.native";
import { OtpCodeInput } from "../OtpCodeInput/OtpCodeInput.native";
import type { AuthFocusField, AuthMethod, LoginFormProps } from "./LoginForm.types";
import { buttonTokens, inputTokens, useThemeTokens } from "../../../theme";
import { useAuthFormState } from "../useAuthFormState";
import { appendAuthFocusParam, appendAuthMethodParam } from "../authFocus";
import * as React from "react";

const OTP_LENGTH = 6;

export function LoginForm({
  auth,
  navigate,
  notify,
  routes,
  authMethods = "both",
  authMethod = "password",
  initialFocus,
  emailRedirectTo,
}: LoginFormProps) {
  const { email, setEmail, password, setPassword, isLoading, setIsLoading } =
    useAuthFormState();
  const emailInputRef = React.useRef<TextInput | null>(null);
  const passwordInputRef = React.useRef<TextInput | null>(null);
  const activeFocusRef = React.useRef<AuthFocusField | null>(null);
  const capturedFocusRef = React.useRef<AuthFocusField | null>(null);
  const pendingMethodFocusRef = React.useRef<AuthFocusField | null>(null);
  const restoredInitialFocusRef = React.useRef<AuthFocusField | null>(null);
  const hasOtpClient = Boolean(auth.sendEmailOtp && auth.verifyEmailOtp);
  const canUseOtp = authMethods !== "password" && hasOtpClient;
  const canUsePassword = authMethods !== "otp" || !canUseOtp;
  const canChooseMethod = canUsePassword && canUseOtp;
  const initialMethod = !canUsePassword || (authMethod === "otp" && canUseOtp) ? "otp" : "password";
  const [method, setMethod] = React.useState<AuthMethod>(initialMethod);
  const [otpSent, setOtpSent] = React.useState(false);
  const [token, setToken] = React.useState("");
  const [verifyingToken, setVerifyingToken] = React.useState<string | null>(null);

  const forgotPassword = routes?.forgotPassword ?? "/auth/forgot-password";
  const signUp = routes?.signUp ?? "/auth/sign-up";
  const isOtp = method === "otp" && canUseOtp;
  const signUpHref = method === "otp" ? appendAuthMethodParam(signUp, method) : signUp;

  const focusAvailableField = (field: AuthFocusField) => {
    if (field === "password" && !isOtp && !otpSent) {
      passwordInputRef.current?.focus();
      return;
    }

    if (!otpSent) {
      emailInputRef.current?.focus();
    }
  };

  const selectMethod = (nextMethod: AuthMethod) => {
    pendingMethodFocusRef.current ??= activeFocusRef.current;
    setMethod(nextMethod);
    setOtpSent(false);
    setToken("");
  };

  const resetOtpToSignIn = () => {
    pendingMethodFocusRef.current = null;
    setOtpSent(false);
    setToken("");
    setVerifyingToken(null);
  };

  const captureMethodFocusHint = () => {
    pendingMethodFocusRef.current = activeFocusRef.current;
  };

  const onFieldFocus = (field: AuthFocusField) => {
    activeFocusRef.current = field;
  };

  const onFieldBlur = (field: AuthFocusField) => {
    if (activeFocusRef.current === field) {
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
    focusAvailableField(initialFocus);
  }, [initialFocus]);

  React.useLayoutEffect(() => {
    const pendingFocus = pendingMethodFocusRef.current;
    if (!pendingFocus) return;

    pendingMethodFocusRef.current = null;
    focusAvailableField(pendingFocus);
  }, [method, otpSent]);

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
      notify?.error?.(error.message, {
        description: "Check the email address and try again.",
      });
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

    notify?.success?.("Welcome back!", {
      description: `${email}`,
    });
    navigate?.("/");
    return true;
  };

  React.useEffect(() => {
    if (!isOtp || !otpSent || token.length !== OTP_LENGTH || isLoading || verifyingToken === token) {
      return;
    }

    void verifyOtp();
  }, [isOtp, otpSent, token, isLoading, verifyingToken]);

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
  const footer = otpSent ? (
    <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
      <Link onPress={resetOtpToSignIn}>
        ← Back to <Text style={{ fontWeight: "bold" }}>sign in</Text>
      </Link>
    </Text>
  ) : (
    <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
      Don&apos;t have an account?{" "}
      <Link
        href={signUpHref}
        onPressIn={captureFocusHint}
        onPress={() => navigateWithFocus(signUpHref)}
        style={{ fontWeight: "600" }}
      >
        Sign up
      </Link>
    </Text>
  );

  return (
    <AuthCard
      title="Sign in"
      subtitle={isOtp ? "Use an emailed magic link or code to continue." : "Use your email + password to continue."}
      footer={footer}
    >
      <View style={styles.form}>
        {canChooseMethod ? (
          <View style={[styles.segment, { borderColor: tokens.color.border }]}>
            <Pressable
              accessibilityRole="button"
              onPressIn={captureMethodFocusHint}
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
              onPressIn={captureMethodFocusHint}
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
              ref={emailInputRef}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChangeText={onEmailChange}
              disabled={isLoading}
              autoComplete="username"
              autoCapitalize="none"
              textContentType="username"
              onFocus={() => onFieldFocus("email")}
              onBlur={() => onFieldBlur("email")}
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
          <View style={styles.field}>
            <PasswordField
              ref={passwordInputRef}
              value={password}
              onChangeText={setPassword}
              disabled={isLoading}
              autoComplete="current-password"
              onFocus={() => onFieldFocus("password")}
              onBlur={() => onFieldBlur("password")}
              labelAccessory={
                <Link
                  href={forgotPassword}
                  onPressIn={captureFocusHint}
                  onPress={() => navigateWithFocus(forgotPassword)}
                  size="sm"
                  tone="muted"
                >
                  Forgot?
                </Link>
              }
            />
          </View>
        )}

        {!otpSent ? (
          <Button
            onPress={onSubmit}
            loading={isLoading}
            disabled={isLoading || !email || (isOtp ? false : !password)}
          >
            {isLoading ? "Signing in…" : isOtp ? "Email me a link" : "Submit"}
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
  // footer color will be injected inline using theme tokens
});
