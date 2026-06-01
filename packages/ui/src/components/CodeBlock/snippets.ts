export function abbreviatedCodeSnippet(parts: readonly string[]) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n// ...\n\n");
}
