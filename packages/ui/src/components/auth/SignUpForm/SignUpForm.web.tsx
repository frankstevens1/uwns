"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import { Link } from "../../../primitives/Link/Link.web";
import { PasswordField } from "../PasswordField/PasswordField.web";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.web";
import { evaluatePassword, generatePassword } from "../../../utils/auth/password";
import type { SignUpFormProps } from "./SignUpForm.types";
import type { AuthMethod } from "../LoginForm/LoginForm.types";
import { useAuthFormState } from "../useAuthFormState";

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

  return (
    <AuthCard
      title="Create account"
      subtitle={isOtp ? "Sign up with an emailed magic link or code." : "Sign up with email and a strong password."}
      footer={
        <div style={{ fontSize: 13 }}>
          Already have an account?{" "}
          <Link href={login} onPress={() => navigate?.(login)} style={{ fontWeight: 600, textDecorationLine: "underline" as any }}>
            Sign in
          </Link>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {canChooseMethod ? (
          <div className="grid grid-cols-2 gap-0.5 rounded border border-(--ui-border) bg-transparent p-0.5">
            <button
              type="button"
              onClick={() => selectMethod("password")}
              className="h-7 rounded text-xs font-semibold"
              style={{
                background: method === "password" ? "var(--ui-subtle-bg)" : "transparent",
                color: "var(--ui-fg)",
              }}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => selectMethod("otp")}
              className="h-7 rounded text-xs font-semibold"
              style={{
                background: method === "otp" ? "var(--ui-subtle-bg)" : "transparent",
                color: "var(--ui-fg)",
              }}
            >
              Magic link
            </button>
          </div>
        ) : null}

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

        {isOtp ? (
          otpSent ? (
            <div className="space-y-1">
              <Label htmlFor="otp">Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="123456"
                value={token}
                onChangeText={setToken}
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={onResendOtp}
                className="text-xs font-semibold underline"
                style={{ color: "var(--ui-fg)" }}
                disabled={isLoading || !email}
              >
                Resend code
              </button>
            </div>
          ) : null
        ) : (
          <>
            <PasswordField value={password} onChangeText={setPassword} disabled={isLoading} />

            <div className="flex items-center justify-between">
              <div className="text-xs" style={{ color: "var(--ui-muted-fg)" }}>Password requirements</div>
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="text-xs font-semibold underline"
                style={{ color: "var(--ui-fg)" }}
                disabled={isLoading}
              >
                Generate
              </button>
            </div>

            <PasswordRequirementsList password={password} />
          </>
        )}

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading || !email || (isOtp ? otpSent && !token : !password || !evalRes.ok)}
        >
          {isLoading ? "Creating…" : isOtp ? (otpSent ? "Verify code" : "Email me a link") : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
