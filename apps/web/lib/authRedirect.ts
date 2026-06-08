const DEFAULT_LOGIN_REDIRECT = "/app";
const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/update-password",
  "/check-email",
] as const;

export function sanitizeLoginRedirect(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return DEFAULT_LOGIN_REDIRECT;
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return DEFAULT_LOGIN_REDIRECT;
  }

  let url: URL;
  try {
    url = new URL(trimmed, "https://uwns.local");
  } catch {
    return DEFAULT_LOGIN_REDIRECT;
  }

  if (url.origin !== "https://uwns.local") return DEFAULT_LOGIN_REDIRECT;

  const isAuthRoute = AUTH_ROUTE_PREFIXES.some(
    (route) => url.pathname === route || url.pathname.startsWith(`${route}/`),
  );
  if (isAuthRoute) return DEFAULT_LOGIN_REDIRECT;

  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildLoginRedirectPath(
  pathname: string | null,
  search: string,
) {
  const path = pathname?.startsWith("/") ? pathname : DEFAULT_LOGIN_REDIRECT;
  return `${path}${search ? `?${search}` : ""}`;
}

export function buildLoginHref(redirectTo: string) {
  const params = new URLSearchParams({ redirectTo });
  return `/login?${params.toString()}`;
}

export function buildLoginEmailRedirectTo(
  origin: string,
  redirectTo: string,
  authMethod?: string | null,
) {
  const params = new URLSearchParams({ redirectTo });
  if (authMethod === "otp") {
    params.set("authMethod", "otp");
  }

  return `${origin}/login?${params.toString()}`;
}
