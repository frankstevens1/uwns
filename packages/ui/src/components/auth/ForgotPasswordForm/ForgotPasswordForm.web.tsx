"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import { Link } from "../../../primitives/Link/Link.web";
import type { ForgotPasswordFormProps } from "./ForgotPasswordForm.types";
import { useAuthFormState } from "../useAuthFormState";

export function ForgotPasswordForm({ auth, notify, navigate, routes, redirectTo }: ForgotPasswordFormProps) {
  const { email, setEmail, isLoading, setIsLoading } = useAuthFormState();

  const afterRequest = routes?.afterRequest ?? "/auth/welcome";
  const login = routes?.login ?? "/auth/login";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await auth.resetPasswordForEmail({ email, redirectTo });
      if (error) {
        notify?.error?.(error.message);
        return;
      }
      notify?.success?.("Email sent.", { description: "Check your inbox for the reset link." });
      navigate?.(afterRequest);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset password"
      subtitle="We’ll send a password reset link to your email."
      footer={
        <div style={{ fontSize: 13 }}>
          <Link href={login} onPress={() => navigate?.(login)} style={{ textDecorationLine: "underline" as any }}>
            Back to sign in
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

        <Button type="submit" loading={isLoading} disabled={isLoading || !email}>
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
