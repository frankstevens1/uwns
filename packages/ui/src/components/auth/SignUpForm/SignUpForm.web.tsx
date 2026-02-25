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
import { useAuthFormState } from "../useAuthFormState";

export function SignUpForm({ auth, notify, navigate, routes, emailRedirectTo }: SignUpFormProps) {
  const { email, setEmail, password, setPassword, isLoading, setIsLoading } =
    useAuthFormState();

  const afterSignUp = routes?.afterSignUp ?? "/auth/welcome";
  const login = routes?.login ?? "/auth/login";

  const evalRes = evaluatePassword(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalRes.ok) {
      notify?.error?.("Password is too weak.", { description: "Please meet all requirements." });
      return;
    }

    setIsLoading(true);
    try {
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
      subtitle="Sign up with email and a strong password."
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

        <Button type="submit" loading={isLoading} disabled={isLoading || !email || !password || !evalRes.ok}>
          {isLoading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
