export function preserveSearchParams(
  params: Record<string, string | string[] | undefined>,
) {
  const next: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    next[key] = Array.isArray(value) ? value[0] : value;
  }

  return next;
}
