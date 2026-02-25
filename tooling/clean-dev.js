#!/usr/bin/env node

const { execSync } = require("node:child_process");

// Patterns to match directories/files to remove
const patterns = [
  "**/node_modules",
  "**/.next",
  "**/.turbo",
  "**/.expo",
  "**/.expo-shared",
  `${process.env.TMPDIR || "/tmp"}/metro-*`,
  `${process.env.TMPDIR || "/tmp"}/haste-map-*`
];

function rm(pattern) {
  try {
    // Use find to match all directories/files recursively
    execSync(`find . -type d -name "${pattern.replace('**/', '')}" -prune -exec rm -rf {} +`, { stdio: "ignore" });
    // Remove caches in TMPDIR directly
    if (pattern.startsWith(process.env.TMPDIR || "/tmp")) {
      execSync(`rm -rf ${pattern}`, { stdio: "ignore" });
    }
    console.log(`✔ removed ${pattern}`);
  } catch {
    // ignore
  }
}

console.log("🧹 Cleaning dev artefacts...\n");

patterns.forEach(rm);

console.log("\n✅ Dev environment cleaned.");
console.log("➡ Run `pnpm install` then `pnpm dev`");
