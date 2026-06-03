import type { AuthFocusField } from "@repo/ui";

export function normalizeAuthFocusParam(
  value: string | string[] | undefined,
): AuthFocusField | undefined {
  const focus = Array.isArray(value) ? value[0] : value;

  return focus === "email" || focus === "password" ? focus : undefined;
}
