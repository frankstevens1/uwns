import * as React from "react";
import {
  AuthCard,
  Button,
  Input,
  Label,
  Link,
  OtpCodeInput,
  PasswordField,
  PasswordRequirementsList,
  evaluatePassword,
  generatePassword,
  inputTokens,
  ToggleGroup,
  ToggleGroupItem,
  type AuthFocusField,
  normalizeAuthMethodParam,
  useThemeTokens,
} from "@repo/ui";
import * as Linking from "expo-linking";
import {
  StyleSheet,
  Text,
  View,
  type TextInput,
} from "react-native";
import { normalizeAuthFocusParam } from "@/lib/authFocus";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";

export type AuthFlowMode = "login" | "sign-up" | "forgot-password";

type AuthMethod = "password" | "otp";

type AuthFlowProps = {
  initialMode: AuthFlowMode;
  initialFocus?: AuthFocusField;
  initialMethod?: AuthMethod;
};

const OTP_LENGTH = 6;

const AUTH_MODE_BY_PATH: Record<string, AuthFlowMode> = {
  "/login": "login",
  "/(auth)/login": "login",
  "/sign-up": "sign-up",
  "/(auth)/sign-up": "sign-up",
  "/forgot-password": "forgot-password",
  "/(auth)/forgot-password": "forgot-password",
};

function withEmailParam(path: string, email: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}email=${encodeURIComponent(email)}`;
}

function getAuthTarget(href: string) {
  try {
    const url = new URL(href, "uwns://native");
    const mode = AUTH_MODE_BY_PATH[url.pathname];
    if (!mode) return null;

    return {
      mode,
      focus: normalizeAuthFocusParam(
        url.searchParams.get("focus") ?? undefined,
      ),
      method: normalizeAuthMethodParam(
        url.searchParams.get("authMethod") ?? undefined,
      ),
    };
  } catch {
    return null;
  }
}

function withFocusParam(href: string, focus?: AuthFocusField | null) {
  if (!focus) return href;

  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}focus=${encodeURIComponent(focus)}`;
}

export function AuthFlow({ initialMode, initialFocus, initialMethod }: AuthFlowProps) {
  const [mode, setMode] = React.useState<AuthFlowMode>(initialMode);
  const [method, setMethod] = React.useState<AuthMethod>(initialMethod ?? "password");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [token, setToken] = React.useState("");
  const [verifyingToken, setVerifyingToken] = React.useState<string | null>(
    null,
  );
  const emailInputRef = React.useRef<TextInput | null>(null);
  const passwordInputRef = React.useRef<TextInput | null>(null);
  const activeFocusRef = React.useRef<AuthFocusField | null>(null);
  const capturedFocusRef = React.useRef<AuthFocusField | null>(null);
  const pendingFocusRef = React.useRef<AuthFocusField | null>(null);
  const restoredInitialFocusRef = React.useRef<AuthFocusField | null>(null);

  const { auth, notify, navigate: navigateRoute } = useNativeAuthWiring(
    mode === "sign-up" ? "sign-up" : "login",
  );
  const tokens = useThemeTokens();
  const emailRedirectTo = Linking.createURL("/");
  const resetRedirectTo = Linking.createURL("/update-password");
  const canChooseMethod = mode !== "forgot-password";
  const isOtp = mode !== "forgot-password" && method === "otp";
  const passwordEval = evaluatePassword(password);

  const focusAvailableField = (field: AuthFocusField) => {
    if (field === "password" && mode !== "forgot-password" && !isOtp) {
      passwordInputRef.current?.focus();
      return;
    }

    emailInputRef.current?.focus();
  };

  const resetOtp = () => {
    setOtpSent(false);
    setToken("");
    setVerifyingToken(null);
  };

  const setAuthMode = (
    nextMode: AuthFlowMode,
    focus?: AuthFocusField | null,
    nextMethod?: AuthMethod | null,
  ) => {
    pendingFocusRef.current = focus ?? activeFocusRef.current;
    resetOtp();
    setMode(nextMode);
    if (nextMethod) {
      setMethod(nextMethod);
    }
  };

  const selectMethod = (nextMethod: AuthMethod) => {
    pendingFocusRef.current = activeFocusRef.current;
    resetOtp();
    setMethod(nextMethod);
  };

  const resetOtpToSignIn = () => {
    pendingFocusRef.current = null;
    capturedFocusRef.current = null;
    resetOtp();
    setMode("login");
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

  const navigate = React.useCallback(
    (href: string) => {
      const target = getAuthTarget(href);

      if (target) {
        setAuthMode(target.mode, target.focus, target.method);
        return;
      }

      navigateRoute(href);
    },
    [navigateRoute],
  );

  const navigateAuth = (href: string) => {
    navigate(withFocusParam(href, capturedFocusRef.current));
    capturedFocusRef.current = null;
  };

  React.useEffect(() => {
    pendingFocusRef.current = initialFocus ?? activeFocusRef.current;
    setMode(initialMode);
    setMethod(initialMethod ?? "password");
    resetOtp();
  }, [initialFocus, initialMode, initialMethod]);

  React.useLayoutEffect(() => {
    if (!initialFocus || restoredInitialFocusRef.current === initialFocus) return;

    restoredInitialFocusRef.current = initialFocus;
    focusAvailableField(initialFocus);
  }, [initialFocus]);

  React.useLayoutEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus) return;

    pendingFocusRef.current = null;
    focusAvailableField(pendingFocus);
  }, [mode, method, otpSent]);

  const onEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);
    if (!otpSent) return;
    resetOtp();
  };

  const sendOtp = async () => {
    const { error } = await auth.sendEmailOtp({
      email,
      emailRedirectTo,
      shouldCreateUser: true,
    });

    if (error) {
      notify?.error?.(error.message, {
        description:
          mode === "login"
            ? "Check the email address and try again."
            : undefined,
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

  const verifyOtp = async () => {
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

    notify?.success?.(mode === "sign-up" ? "Account created." : "Welcome back!", {
      description: `${email}`,
    });
    navigateRoute("/");
    return true;
  };

  React.useEffect(() => {
    if (!isOtp || !otpSent || token.length !== OTP_LENGTH || isLoading || verifyingToken === token) {
      return;
    }

    void verifyOtp();
  }, [isOtp, otpSent, token, isLoading, verifyingToken]);

  const onSubmit = async () => {
    if (mode === "forgot-password") {
      setIsLoading(true);
      try {
        const { error } = await auth.resetPasswordForEmail({
          email,
          redirectTo: resetRedirectTo,
        });
        if (error) {
          notify?.error?.(error.message);
          return;
        }
        notify?.success?.("Email sent.", {
          description: "Use the reset link or enter the code from the email.",
        });
        navigateRoute(withEmailParam("/(auth)/check-email?type=recovery", email));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isOtp) {
      setIsLoading(true);
      try {
        if (otpSent) {
          await verifyOtp();
        } else {
          await sendOtp();
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === "sign-up" && !passwordEval.ok) {
      notify?.error?.("Password is too weak.", {
        description: "Please meet all requirements.",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "sign-up") {
        const { error } = await auth.signUp({
          email,
          password,
          emailRedirectTo,
        });
        if (error) {
          notify?.error?.(error.message);
          return;
        }
        notify?.success?.("Check your email.", {
          description: "We sent a confirmation link.",
        });
        navigateRoute(withEmailParam("/(auth)/check-email", email));
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
      navigateRoute("/");
    } finally {
      setIsLoading(false);
    }
  };

  const title =
    mode === "forgot-password"
      ? "Reset password"
      : mode === "sign-up"
        ? "Create account"
        : "Sign in";
  const subtitle =
    mode === "forgot-password"
      ? "We’ll send a password reset link and code to your email."
      : isOtp
        ? mode === "sign-up"
          ? "Sign up with an emailed magic link or code."
          : "Use an emailed magic link or code to continue."
        : mode === "sign-up"
          ? "Sign up with email and a strong password."
          : "Use your email + password to continue.";
  const submitLabel =
    mode === "forgot-password"
      ? isLoading
        ? "Sending…"
        : "Send reset email"
      : mode === "sign-up"
        ? isLoading
          ? "Creating…"
          : isOtp
            ? "Email me a link"
            : "Create account"
        : isLoading
          ? "Signing in…"
          : isOtp
            ? "Email me a link"
            : "Submit";
  const submitDisabled =
    isLoading ||
    !email ||
    (mode === "forgot-password"
      ? false
      : isOtp
        ? false
        : !password || (mode === "sign-up" && !passwordEval.ok));

  const footer =
    mode === "forgot-password" ? (
      <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
        <Link
          href="/(auth)/login"
          onPressIn={captureFocusHint}
          onPress={() => navigateAuth("/(auth)/login")}
        >
          ← Back to <Text style={{ fontWeight: "bold" }}>sign in</Text>
        </Link>
      </Text>
    ) : otpSent ? (
      <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
        <Link href="/(auth)/login" onPress={resetOtpToSignIn}>
          ← Back to <Text style={{ fontWeight: "bold" }}>sign in</Text>
        </Link>
      </Text>
    ) : mode === "sign-up" ? (
      <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
        Already have an account?{" "}
        <Link
          href="/(auth)/login"
          onPressIn={captureFocusHint}
          onPress={() => navigateAuth("/(auth)/login")}
          style={{ fontWeight: "600" }}
        >
          Sign in
        </Link>
      </Text>
    ) : (
      <Text style={{ fontSize: 13, color: tokens.color.mutedFg }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/(auth)/sign-up"
          onPressIn={captureFocusHint}
          onPress={() => navigateAuth("/(auth)/sign-up")}
          style={{ fontWeight: "600" }}
        >
          Sign up
        </Link>
      </Text>
    );

  return (
    <AuthCard title={title} subtitle={subtitle} footer={footer}>
      <View style={styles.form}>
        {canChooseMethod && !otpSent ? (
          <ToggleGroup
            key="method"
            value={method}
            onValueChange={(next) => {
              pendingFocusRef.current = activeFocusRef.current;
              selectMethod(next as AuthMethod);
            }}
            ariaLabel="Authentication method"
          >
            <ToggleGroupItem value="password">Password</ToggleGroupItem>
            <ToggleGroupItem value="otp">Magic link</ToggleGroupItem>
          </ToggleGroup>
        ) : null}

        {otpSent ? (
          <View key="locked-email" style={styles.field}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.color.mutedFg }}>Email</Text>
            <View style={[styles.lockedEmail, { borderColor: tokens.color.border, backgroundColor: tokens.color.bg }]}>
              <Text style={{ fontSize: inputTokens.base.fontSize, color: tokens.color.fg }}>{email}</Text>
            </View>
          </View>
        ) : (
          <View key="email" style={styles.field}>
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

        {mode !== "forgot-password" && isOtp && otpSent ? (
          <View key="otp" style={styles.field}>
            <View style={styles.labelRow}>
              <Label>Code</Label>
              <Link
                onPress={async () => {
                  setIsLoading(true);
                  try {
                    await sendOtp();
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading || !email}
                size="sm"
                tone="muted"
              >
                Resend
              </Link>
            </View>
            <OtpCodeInput value={token} onChangeText={setToken} disabled={isLoading} />
          </View>
        ) : null}

        {mode !== "forgot-password" && !isOtp ? (
          <View key="password" style={styles.field}>
            <PasswordField
              ref={passwordInputRef}
              value={password}
              onChangeText={setPassword}
              disabled={isLoading}
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              onFocus={() => onFieldFocus("password")}
              onBlur={() => onFieldBlur("password")}
              labelAccessory={
                mode === "login" ? (
                  <Link
                    href="/(auth)/forgot-password"
                    onPressIn={captureFocusHint}
                    onPress={() => navigateAuth("/(auth)/forgot-password")}
                    size="sm"
                    tone="muted"
                  >
                    Forgot?
                  </Link>
                ) : undefined
              }
            />
          </View>
        ) : null}

        {mode === "sign-up" && !isOtp ? (
          <View key="requirements" style={styles.row}>
            <PasswordRequirementsList
              password={password}
              showFirstUnmetOnly
              inline
            />
            <Link
              onPress={() => setPassword(generatePassword())}
              disabled={isLoading}
              size="sm"
              tone="muted"
            >
              Generate
            </Link>
          </View>
        ) : null}

        {!otpSent ? (
          <Button
            key="submit"
            onPress={onSubmit}
            loading={isLoading}
            disabled={submitDisabled}
          >
            {submitLabel}
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
