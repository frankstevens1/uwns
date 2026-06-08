const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  CONFIG_PATH,
  OUTPUT_PATH,
  discoverRouteFiles,
  buildManifest,
  readJson,
} = require("../generate-notification-destinations.js");

const ROOT = path.resolve(__dirname, "..");
const NATIVE_NOTIFICATIONS_ROUTE = path.join(
  ROOT,
  "apps",
  "native",
  "app",
  "notifications.tsx",
);
const WEB_DOCS_ROUTE = path.join(
  ROOT,
  "apps",
  "web",
  "app",
  "docs",
  "[[...slug]]",
  "page.tsx",
);
const WEB_SETTINGS_ROUTE = path.join(
  ROOT,
  "apps",
  "web",
  "app",
  "app",
  "settings",
  "page.tsx",
);

test("discovers route tree entries and allows denylisted routes", () => {
  const config = readJson(CONFIG_PATH);
  const discovered = discoverRouteFiles();

  assert.ok(discovered.nativeRoutes.has(NATIVE_NOTIFICATIONS_ROUTE));
  assert.ok(discovered.webRoutes.has(WEB_DOCS_ROUTE));
  assert.ok(discovered.webRoutes.has(WEB_SETTINGS_ROUTE));

  const manifest = buildManifest(config, discovered);
  assert.equal(manifest.length, 5);
  assert.deepEqual(
    manifest.map((entry) => entry.id),
    ["account", "actions", "docs", "home", "notifications"],
  );
});

test("checked-in manifest matches regenerated output", () => {
  const config = readJson(CONFIG_PATH);
  const discovered = discoverRouteFiles();
  const manifest = buildManifest(config, discovered);
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

  assert.equal(fs.readFileSync(OUTPUT_PATH, "utf8"), serialized);
});

test("unignored routes fail manifest validation", () => {
  const config = readJson(CONFIG_PATH);
  const discovered = discoverRouteFiles();
  const withoutIgnoreRoutes = {
    ...config,
    ignoreRoutes: [],
  };

  assert.throws(
    () => buildManifest(withoutIgnoreRoutes, discovered),
    /Unaccounted route files/,
  );
});
