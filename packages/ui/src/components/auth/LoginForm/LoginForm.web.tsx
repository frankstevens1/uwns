"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import { Link } from "../../../primitives/Link/Link.web";
import { PasswordField } from "../PasswordField/PasswordField.web";
import type { AuthMethod, LoginFormProps } from "./LoginForm.types";
import { useAuthFormState } from "../useAuthFormState";

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

  return (
    <AuthCard
      title="Sign in"
      subtitle={isOtp ? "Use an emailed magic link or code to continue." : "Use your email + password to continue."}
      footer={
        <div style={{ fontSize: 13 }}>
          Don&apos;t have an account?{" "}
          <Link href={signUp} onPress={() => navigate?.(signUp)} style={{ fontWeight: 600, textDecorationLine: "underline" as any }}>
            Sign up
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
          <div className="space-y-1">
            <PasswordField
              id="password"
              value={password}
              onChangeText={setPassword}
              disabled={isLoading}
            />
            <Link href={forgotPassword} onPress={() => navigate?.(forgotPassword)} style={{ fontSize: 13 }}>
              Forgot?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading || !email || (isOtp ? otpSent && !token : !password)}
        >
          {isLoading ? "Signing in…" : isOtp ? (otpSent ? "Verify code" : "Email me a link") : "Submit"}
        </Button>
      </form>
    </AuthCard>
  );
}
