"use client";

import * as React from "react";
import type { OtpCodeInputProps } from "./OtpCodeInput.types";
import { inputTokens } from "../../../theme";
import { useFocusVisible } from "../../../utils/focusVisible";
import { px } from "../../../utils/platform.web";

function sanitizeCode(value: string, length: number) {
  return value.replace(/\D/g, "").slice(0, length);
}

export function OtpCodeInput({
  value,
  onChangeText,
  length = 6,
  disabled,
}: OtpCodeInputProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const code = sanitizeCode(value, length);
  const t = inputTokens.base;
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  const cellStyle: React.CSSProperties = {
    height: px(t.height.md),
    width: "100%",
    borderRadius: px(t.radius),
    borderWidth: px(t.borderWidth),
    borderStyle: "solid",
    borderColor: "var(--ui-border)",
    paddingLeft: 0,
    paddingRight: 0,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: px(t.fontSize),
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
    textAlign: "center",
    background: "var(--ui-bg)",
    color: "var(--ui-fg)",
    outline: "none",
    boxShadow: isFocusVisible
      ? "0 0 0 3px var(--ui-ring, rgba(0,0,0,0.25))"
      : "none",
  };

  const setCode = (nextValue: string, focusIndex?: number) => {
    const nextCode = sanitizeCode(nextValue, length);
    onChangeText(nextCode);

    if (typeof focusIndex !== "number") return;
    window.requestAnimationFrame(() => {
      inputRefs.current[Math.min(focusIndex, length - 1)]?.focus();
    });
  };

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Code digit ${index + 1}`}
          value={code[index] ?? ""}
          disabled={disabled}
          maxLength={1}
          onChange={(event) => {
            const nextDigit = sanitizeCode(event.target.value, 1);
            const chars = code.padEnd(length, " ").split("");
            chars[index] = nextDigit || " ";
            const nextCode = chars.join("").replace(/\s/g, "");
            setCode(nextCode, nextDigit ? index + 1 : index);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Backspace" || code[index]) return;
            inputRefs.current[Math.max(index - 1, 0)]?.focus();
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = sanitizeCode(event.clipboardData.getData("text"), length);
            if (!pasted) return;
            setCode(pasted, pasted.length);
          }}
          onFocus={(event) => {
            onFocus();
            event.currentTarget.select();
          }}
          onBlur={onBlur}
          style={cellStyle}
        />
      ))}
    </div>
  );
}
