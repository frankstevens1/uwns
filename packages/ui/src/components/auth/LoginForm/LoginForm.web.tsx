"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import { Link } from "../../../primitives/Link/Link.web";
import { PasswordField } from "../PasswordField/PasswordField.web";
import type { LoginFormProps } from "./LoginForm.types";
import { useAuthFormState } from "../useAuthFormState";

export function LoginForm({
  auth,
  navigate,
  notify,
  routes,
}: LoginFormProps) {
  const { email, setEmail, password, setPassword, isLoading, setIsLoading } =
    useAuthFormState();

  const forgotPassword = routes?.forgotPassword ?? "/auth/forgot-password";
  const signUp = routes?.signUp ?? "/auth/sign-up";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
      subtitle="Use your email + password to continue."
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
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
            disabled={isLoading}
          />
        </div>

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

        <Button type="submit" loading={isLoading} disabled={isLoading || !email || !password}>
          {isLoading ? "Signing in…" : "Submit"}
        </Button>
      </form>
    </AuthCard>
  );
}
