import { darkTokens, lightTokens, tokensToCssVars } from "@repo/ui";

function asBlock(selector: string, css: string) {
  const inner = css.replace(":root {", "").replace(/}\s*$/, "").trim();
  return `${selector} {\n${inner}\n}`;
}

export function ThemeStyle() {
  const light = tokensToCssVars(lightTokens); // ":root { ... }"
  const dark = tokensToCssVars(darkTokens);   // ":root { ... }"

  // IMPORTANT: this is deterministic; no client-only branching.
  return (
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `${light}\n\n${asBlock(".dark", dark)}\n`,
      }}
    />
  );
}
