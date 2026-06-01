"use client";

import * as React from "react";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import { Link } from "../../../primitives/Link/Link.web";
import { OtpCodeInput } from "../OtpCodeInput/OtpCodeInput.web";
import type { PasswordResetCheckEmailFormProps } from "./PasswordResetCheckEmailForm.types";

const OTP_LENGTH = 6;

export function PasswordResetCheckEmailForm({
  auth,
  email: initialEmail,
  redirectTo,
  onOpenMailbox,
  notify,
  navigate,
  routes,
}: PasswordResetCheckEmailFormProps) {
  const [email, setEmail] = React.useState(initialEmail ?? "");
  const [token, setToken] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [verifyingToken, setVerifyingToken] = React.useState<string | null>(
    null,
  );

  const login = routes?.login ?? "/auth/login";
  const updatePassword = routes?.updatePassword ?? "/auth/update-password";
  const canVerify = Boolean(email && token.length === OTP_LENGTH);

  const verifyCode = React.useCallback(async () => {
    const currentToken = token.trim();
    if (!email || currentToken.length !== OTP_LENGTH) return false;

    setVerifyingToken(currentToken);
    setIsLoading(true);
    try {
      const { error } = await auth.verifyPasswordResetOtp({
        email,
        token: currentToken,
      });
      if (error) {
        notify?.error?.(error.message, {
          description: "Check the code and try again.",
        });
        return false;
      }

      notify?.success?.("Code verified.", {
        description: "Choose a new password to finish resetting your account.",
      });
      navigate?.(updatePassword);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [auth, email, navigate, notify, token, updatePassword]);

  React.useEffect(() => {
    if (!canVerify || isLoading || verifyingToken === token) return;
    void verifyCode();
  }, [canVerify, isLoading, token, verifyingToken, verifyCode]);

  const resendCode = async () => {
    if (!auth.resetPasswordForEmail || !email) return;

    setIsLoading(true);
    try {
      const { error } = await auth.resetPasswordForEmail({ email, redirectTo });
      if (error) {
        notify?.error?.(error.message, {
          description: "Check the email address and try again.",
        });
        return;
      }

      setToken("");
      setVerifyingToken(null);
      notify?.success?.("Email sent.", {
        description: "Use the reset link or enter the new code here.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Check your email"
      subtitle="Use the reset link or enter the code we emailed you."
      footer={
        <div style={{ fontSize: 13 }}>
          <Link href={login} onPress={() => navigate?.(login)}>
            ← Back to <span style={{ fontWeight: "bold" }}>sign in</span>
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
            disabled={isLoading || Boolean(initialEmail)}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Label>Code</Label>
            {auth.resetPasswordForEmail ? (
              <Link
                onPress={resendCode}
                disabled={isLoading || !email}
                size="sm"
                tone="muted"
              >
                Resend
              </Link>
            ) : null}
          </div>
          <OtpCodeInput
            value={token}
            onChangeText={setToken}
            disabled={isLoading}
          />
        </div>

        {onOpenMailbox ? (
          <Button
            type="button"
            variant="outline"
            onPress={onOpenMailbox}
            disabled={isLoading}
          >
            Open mailbox
          </Button>
        ) : null}
      </div>
    </AuthCard>
  );
}
