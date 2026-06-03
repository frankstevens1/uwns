"use client";

import * as React from "react";
import { IconButton } from "../../../primitives/IconButton/IconButton.web";
import { Input } from "../../../primitives/Input/Input.web";
import { Label } from "../../../primitives/Label/Label.web";
import type { PasswordFieldProps } from "./PasswordField.types";

export function PasswordField({
  label = "Password",
  value,
  onChangeText,
  placeholder = "Your password",
  disabled,
  error,
  id = "password",
  name = "password",
  autoComplete = "current-password",
  autoFocus,
  onFocus,
  onBlur,
  rightAccessory,
  labelAccessory,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const toggle = () => {
    setShow((v) => !v);
    inputRef.current?.focus();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Label htmlFor={id}>{label}</Label>
        {labelAccessory}
      </div>

      <div style={{ position: "relative" }}>
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{ paddingRight: 44 }}
        />

        <div
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {rightAccessory ?? (
            <IconButton
              aria-label={show ? "Hide password" : "Show password"}
              onPress={toggle}
              disabled={disabled}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-muted-fg)", paddingRight: "1rem" }}>
                {show ? "Hide" : "Show"}
              </span>
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}
