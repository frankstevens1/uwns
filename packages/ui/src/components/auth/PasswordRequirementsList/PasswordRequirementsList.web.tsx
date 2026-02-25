"use client";

import type { PasswordRequirementsListProps } from "./PasswordRequirementsList.types";
import { evaluatePassword } from "../../../utils/auth/password";
import { CheckCircle2 } from "lucide-react";

export function PasswordRequirementsList({
  password,
}: PasswordRequirementsListProps) {
  const { results } = evaluatePassword(password);

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
