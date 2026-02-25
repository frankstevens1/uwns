import type { ThemeTokens } from "./theme";

export function tokensToCssVars(tokens: ThemeTokens) {
  const c = tokens.color;

  return `
:root {
  --ui-bg: ${c.bg};
  --ui-fg: ${c.fg};
  --ui-border: ${c.border};
  --ui-ring: ${c.border};
  --ui-primary-bg: ${c.primaryBg};
  --ui-primary-fg: ${c.primaryFg};
  --ui-success-fg: ${c.successFg};
  --ui-danger-fg: ${c.dangerFg};
  --ui-warning-fg: ${c.warningFg};
  --ui-info-fg: ${c.infoFg};
  --ui-subtle-bg: ${c.subtleBg};
  --ui-muted-fg: ${c.mutedFg};
  --ui-disabled-opacity: ${tokens.opacity.disabled};
  --ui-disabled-bg: ${c.disabledBg};
  --ui-disabled-fg: ${c.disabledFg};
  --ui-radius-sm: ${tokens.radius.sm}px;
  --ui-radius-md: ${tokens.radius.md}px;
  --ui-radius-lg: ${tokens.radius.lg}px;
  --ui-font-sm: ${tokens.fontSize.sm}px;
  --ui-font-md: ${tokens.fontSize.md}px;
  --ui-font-lg: ${tokens.fontSize.lg}px;
  --ui-success-border: ${c.successBorder};
  --ui-danger-border: ${c.dangerBorder};
  --ui-warning-border: ${c.warningBorder};
  --ui-info-border: ${c.infoBorder};
  --ui-panel: ${c.bg};
  --ui-fade-from: ${c.bg};
}
`.trim();
}
