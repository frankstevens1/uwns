"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import { Link } from "../../../primitives/Link/Link.web";
import { PasswordField } from "../PasswordField/PasswordField.web";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.web";
import { OtpCodeInput } from "../OtpCodeInput/OtpCodeInput.web";
import { evaluatePassword, generatePassword } from "../../../utils/auth/password";
import { buttonTokens, inputTokens } from "../../../theme";
import { px } from "../../../utils/platform.web";
import type { SignUpFormProps } from "./SignUpForm.types";
import type { AuthMethod } from "../LoginForm/LoginForm.types";
import { useAuthFormState } from "../useAuthFormState";
import { appendAuthMethodParam } from "../authFocus";

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
  const loginHref = method === "otp" ? appendAuthMethodParam(login, method) : login;
  const methodSelectorStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: px(2),
    borderRadius: px(buttonTokens.base.radius),
    borderWidth: px(buttonTokens.base.borderWidth),
    borderStyle: "solid",
    borderColor: "var(--ui-border)",
    padding: px(2),
  };
  const methodButtonStyle = (selected: boolean): React.CSSProperties => ({
    height: px(buttonTokens.size.sm.height),
    borderStyle: "solid",
    borderColor: selected ? "var(--ui-border)" : "transparent",
    borderRadius: px(buttonTokens.base.radius),
    borderWidth: 1,
    background: selected ? "var(--ui-subtle-bg)" : "transparent",
    color: "var(--ui-fg)",
    fontSize: px(buttonTokens.size.sm.fontSize),
    fontWeight: buttonTokens.base.fontWeight as any,
  });
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const footer = otpSent ? (
    <div style={{ fontSize: 13 }}>
      <Link href={loginHref} onPress={() => navigate?.(loginHref)}>
        ← Back to <span style={{ fontWeight: "bold" }}>sign in</span>
      </Link>
    </div>
  ) : (
    <div style={{ fontSize: 13 }}>
      Already have an account?{" "}
      <Link href={loginHref} onPress={() => navigate?.(loginHref)} style={{ fontWeight: 600 }}>
        Sign in
      </Link>
    </div>
  );

  return (
    <AuthCard
      title="Create account"
      subtitle={isOtp ? "Sign up with an emailed magic link or code." : "Sign up with email and a strong password."}
      footer={footer}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {canChooseMethod ? (
          <div style={methodSelectorStyle}>
            <button
              type="button"
              onClick={() => selectMethod("password")}
              style={methodButtonStyle(method === "password")}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => selectMethod("otp")}
              style={methodButtonStyle(method === "otp")}
            >
              Magic link
            </button>
          </div>
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
          <>
            <PasswordField
              value={password}
              onChangeText={setPassword}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <div className="flex items-center justify-between">
              <div className="text-xs" style={{ color: "var(--ui-muted-fg)" }}>Password requirements</div>
              <Link
                onPress={() => setPassword(generatePassword())}
                disabled={isLoading}
                size="sm"
                tone="muted"
              >
                Generate
              </Link>
            </div>

            <PasswordRequirementsList password={password} />
          </>
        )}

        {!otpSent ? (
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !email || (isOtp ? false : !password || !evalRes.ok)}
          >
            {isLoading ? "Creating…" : isOtp ? "Email me a link" : "Create account"}
          </Button>
        ) : null}
      </form>
    </AuthCard>
  );
}
