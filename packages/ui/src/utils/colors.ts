export type BadgeColorStyle = {
  backgroundColor: string;
  borderColor: string;
  color: string;
};

export const badgeColorPalette = [
  {
    backgroundColor: "hsl(18, 100%, 92%)",
    borderColor: "hsl(18, 80%, 82%)",
    color: "hsl(18, 45%, 28%)",
  },
  {
    backgroundColor: "hsl(48, 100%, 92%)",
    borderColor: "hsl(48, 80%, 82%)",
    color: "hsl(40, 55%, 28%)",
  },
  {
    backgroundColor: "hsl(145, 52%, 92%)",
    borderColor: "hsl(145, 35%, 80%)",
    color: "hsl(145, 40%, 25%)",
  },
  {
    backgroundColor: "hsl(198, 100%, 92%)",
    borderColor: "hsl(198, 70%, 82%)",
    color: "hsl(202, 55%, 28%)",
  },
  {
    backgroundColor: "hsl(262, 100%, 94%)",
    borderColor: "hsl(262, 60%, 84%)",
    color: "hsl(262, 45%, 30%)",
  },
  {
    backgroundColor: "hsl(325, 100%, 94%)",
    borderColor: "hsl(325, 60%, 84%)",
    color: "hsl(325, 45%, 30%)",
  },
  {
    backgroundColor: "hsl(80, 80%, 92%)",
    borderColor: "hsl(80, 50%, 80%)",
    color: "hsl(82, 40%, 28%)",
  },
  {
    backgroundColor: "hsl(12, 90%, 95%)",
    borderColor: "hsl(12, 60%, 84%)",
    color: "hsl(12, 45%, 29%)",
  },
] as const satisfies readonly BadgeColorStyle[];

export function getKeyedBadgeColors(key: string): BadgeColorStyle {
  const hash = hashString(key);
  return badgeColorPalette[hash % badgeColorPalette.length]!;
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}
