"use client";

import type { PasswordRequirementsListProps } from "./PasswordRequirementsList.types";
import { evaluatePassword } from "../../../utils/auth/password";
import { CheckCircle2, Circle } from "lucide-react";

export function PasswordRequirementsList({
  password,
  showFirstUnmetOnly = false,
  inline = false,
}: PasswordRequirementsListProps) {
  const { results } = evaluatePassword(password);
  const firstUnmet = results.find((result) => !result.ok);

  if (showFirstUnmetOnly) {
    const row = firstUnmet ?? results[results.length - 1];
    if (!row) return null;

    const ok = !firstUnmet;

    return (
      <ul
        aria-label="Password requirements"
        style={{
          marginTop: inline ? 0 : 8,
          paddingLeft: 0,
          listStyle: "none",
          display: "flex",
          flex: inline ? "1 1 0%" : undefined,
          minWidth: inline ? 0 : undefined,
          gap: 4,
        }}
      >
        <li
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            lineHeight: "18px",
            minWidth: 0,
            color: ok ? "var(--ui-success-fg)" : "var(--ui-muted-fg)",
          }}
        >
          {ok ? (
            <CheckCircle2
              aria-hidden="true"
              size={16}
              style={{
                flex: "0 0 auto",
                color: "var(--ui-success-fg)",
              }}
            />
          ) : (
            <Circle
              aria-hidden="true"
              size={16}
              style={{
                flex: "0 0 auto",
                color: "var(--ui-muted-fg)",
              }}
            />
          )}
          <span>{ok ? "Password requirements met" : row.label}</span>
        </li>
      </ul>
    );
  }

  return (
    <ul
      aria-label="Password requirements"
      style={{
        marginTop: 8,
        paddingLeft: 0,
        listStyle: "none",
        display: "grid",
        gap: 4,
      }}
    >
      {results.map((r) => {
        const ok = Boolean(r.ok);

        return (
          <li
            key={r.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              lineHeight: "18px",
              color: ok ? "var(--ui-success-fg)" : "var(--ui-muted-fg)",
            }}
          >
            <CheckCircle2
              aria-hidden="true"
              size={16}
              style={{
                flex: "0 0 auto",
                color: ok ? "var(--ui-success-fg)" : "var(--ui-muted-fg)",
              }}
            />
            <span>{r.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
