"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Link } from "../../../primitives/Link/Link.web";
import { PasswordField } from "../PasswordField/PasswordField.web";
import { PasswordRequirementsList } from "../PasswordRequirementsList/PasswordRequirementsList.web";
import {
  evaluatePassword,
  generatePassword,
} from "../../../utils/auth/password";
import type { UpdatePasswordFormProps } from "./UpdatePasswordForm.types";
import { useAuthFormState } from "../useAuthFormState";

export function UpdatePasswordForm({
  auth,
  notify,
  navigate,
  routes,
}: UpdatePasswordFormProps) {
  const { password, setPassword, isLoading, setIsLoading } = useAuthFormState();

  const afterUpdate = routes?.afterUpdate ?? "/auth/login";
  const evalRes = evaluatePassword(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalRes.ok) {
      notify?.error?.("Password is too weak.", {
        description: "Please meet all requirements.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await auth.updateUserPassword({ password });
      if (error) {
        notify?.error?.(error.message);
        return;
      }
      notify?.success?.("Password updated.", {
        description: "You can now sign in.",
      });
      navigate?.(afterUpdate);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Update password" subtitle="Choose a strong new password.">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <PasswordField
          value={password}
          onChangeText={setPassword}
          disabled={isLoading}
          autoComplete="new-password"
        />

        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: "var(--ui-muted-fg)" }}>
            Password requirements
          </div>
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

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading || !password || !evalRes.ok}
        >
          {isLoading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
