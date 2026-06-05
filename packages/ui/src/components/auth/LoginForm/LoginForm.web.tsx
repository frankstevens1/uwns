"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import { Link } from "../../../primitives/Link/Link.web";
import { PasswordField } from "../PasswordField/PasswordField.web";
import { OtpCodeInput } from "../OtpCodeInput/OtpCodeInput.web";
import { inputTokens } from "../../../theme";
import { px } from "../../../utils/platform.web";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../primitives/ToggleGroup/ToggleGroup.web";
import type { AuthMethod, LoginFormProps } from "./LoginForm.types";
import { useAuthFormState } from "../useAuthFormState";
import { appendAuthMethodParam } from "../authFocus";

const OTP_LENGTH = 6;

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
  const [verifyingToken, setVerifyingToken] = React.useState<string | null>(null);

  const forgotPassword = routes?.forgotPassword ?? "/auth/forgot-password";
  const signUp = routes?.signUp ?? "/auth/sign-up";
  const isOtp = method === "otp" && canUseOtp;
  const signUpHref = method === "otp" ? appendAuthMethodParam(signUp, method) : signUp;
  const lockedEmailStyle: React.CSSProperties = {
    minHeight: px(inputTokens.base.height.md),
    borderRadius: px(inputTokens.base.radius),
    borderWidth: px(inputTokens.base.borderWidth),
    borderStyle: "solid",
    borderColor: "var(--ui-border)",
    paddingLeft: px(inputTokens.base.paddingX),
    paddingRight: px(inputTokens.base.paddingX),
    display: "flex",
    alignItems: "center",
    background: "var(--ui-bg)",
    color: "var(--ui-fg)",
    fontSize: px(inputTokens.base.fontSize),
  };

  const selectMethod = (nextMethod: AuthMethod) => {
    setMethod(nextMethod);
    setOtpSent(false);
    setToken("");
  };

  const resetOtpToSignIn = () => {
    setOtpSent(false);
    setToken("");
    setVerifyingToken(null);
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const footer = otpSent ? (
    <div style={{ fontSize: 13 }}>
      <Link onPress={resetOtpToSignIn}>
        ← Back to <span style={{ fontWeight: "bold" }}>sign in</span>
      </Link>
    </div>
  ) : (
    <div style={{ fontSize: 13 }}>
      Don&apos;t have an account?{" "}
      <Link href={signUpHref} onPress={() => navigate?.(signUpHref)} style={{ fontWeight: 600 }}>
        Sign up
      </Link>
    </div>
  );

  return (
    <AuthCard
      title="Sign in"
      subtitle={isOtp ? "Use an emailed magic link or code to continue." : "Use your email + password to continue."}
      footer={footer}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {canChooseMethod ? (
          <ToggleGroup
            value={method}
            onValueChange={(next) => selectMethod(next as AuthMethod)}
            ariaLabel="Authentication method"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              width: "100%",
            }}
          >
            <ToggleGroupItem value="password">Password</ToggleGroupItem>
            <ToggleGroupItem value="otp">Magic link</ToggleGroupItem>
          </ToggleGroup>
        ) : null}

        {otpSent ? (
          <div className="space-y-1">
            <div className="text-xs font-medium" style={{ color: "var(--ui-muted-fg)" }}>Email</div>
            <div style={lockedEmailStyle}>
              {email}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChangeText={onEmailChange}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
        )}

        {isOtp ? (
          otpSent ? (
            <div className="space-y-1">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Label>Code</Label>
                <Link
                  onPress={onResendOtp}
                  disabled={isLoading || !email}
                  size="sm"
                  tone="muted"
                >
                  Resend
                </Link>
              </div>
              <OtpCodeInput
                value={token}
                onChangeText={setToken}
                disabled={isLoading}
              />
            </div>
          ) : null
        ) : (
          <div className="space-y-1">
            <PasswordField
              id="password"
              value={password}
              onChangeText={setPassword}
              disabled={isLoading}
              labelAccessory={
                <Link
                  href={forgotPassword}
                  onPress={() => navigate?.(forgotPassword)}
                  size="sm"
                  tone="muted"
                >
                  Forgot?
                </Link>
              }
            />
          </div>
        )}

        {!otpSent ? (
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !email || (isOtp ? false : !password)}
          >
            {isLoading ? "Signing in…" : isOtp ? "Email me a link" : "Submit"}
          </Button>
        ) : null}
      </form>
    </AuthCard>
  );
}
