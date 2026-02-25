export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const passwordRules: PasswordRule[] = [
  { id: "min8", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "lower", label: "Contains a lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "Contains an uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "Contains a number", test: (p) => /[0-9]/.test(p) },
  { id: "symbol", label: "Contains a symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function evaluatePassword(password: string) {
  const results = passwordRules.map((r) => ({ ...r, ok: r.test(password) }));
  const ok = results.every((r) => r.ok);
  return { ok, results };
}

export function generatePassword(options?: {
  length?: number;
  numbers?: boolean;
  symbols?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
}) {
  const {
    length = 14,
    numbers = true,
    symbols = true,
    lowercase = true,
    uppercase = true,
  } = options ?? {};

  const sets: string[] = [];
  if (lowercase) sets.push("abcdefghijklmnopqrstuvwxyz");
  if (uppercase) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (numbers) sets.push("0123456789");
  if (symbols) sets.push("!@#$%^&*()-_=+[]{};:,.<>/?");

  const pool = sets.join("");
  if (!pool) return "";

  // ensure at least one char from each enabled set
  const chars: (string | undefined)[] = [];
  for (const set of sets) {
    const idx = Math.floor(Math.random() * set.length);
    chars.push(set[idx] ?? "");
  }

  while (chars.length < length) {
    chars.push(pool[Math.floor(Math.random() * pool.length)] ?? "");
  }

  // shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
