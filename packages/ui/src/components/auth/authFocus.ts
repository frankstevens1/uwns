export type AuthFocusField = "email" | "password";

type AuthMethod = "password" | "otp";

function appendQueryParam(path: string, key: string, value: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

export function appendAuthFocusParam(path: string, focus?: AuthFocusField | null) {
  if (!focus) return path;

  return appendQueryParam(path, "focus", focus);
}

export function appendAuthMethodParam(path: string, authMethod?: AuthMethod | null) {
  if (!authMethod) return path;

  return appendQueryParam(path, "authMethod", authMethod);
}

export function normalizeAuthMethodParam(
  value: string | string[] | null | undefined,
): AuthMethod | undefined {
  const next = Array.isArray(value) ? value[0] : value;
  if (next === "password" || next === "otp") return next;

  return undefined;
}
