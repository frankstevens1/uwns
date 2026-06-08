#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(
  ROOT,
  "tooling",
  "notification-destination-config.json",
);
const OUTPUT_PATH = path.join(
  ROOT,
  "packages",
  "lib",
  "src",
  "notification-destinations.json",
);

const WEB_DISCOVERY_ROOT = path.join(ROOT, "apps", "web", "app", "app");
const WEB_DISCOVERY_ROOTS = [
  WEB_DISCOVERY_ROOT,
  path.join(ROOT, "apps", "web", "app", "docs"),
];
const WEB_ROUTE_ROOT = path.join(ROOT, "apps", "web", "app");
const NATIVE_SCOPE = path.join(ROOT, "apps", "native", "app");
const NATIVE_ROUTE_ROOTS = [
  path.join(NATIVE_SCOPE, "(tabs)"),
  path.join(NATIVE_SCOPE, "actions.tsx"),
  path.join(NATIVE_SCOPE, "notifications.tsx"),
];

if (require.main === module) {
  main();
}

function main(argv = process.argv.slice(2)) {
  const verifyOnly = argv.includes("--check");
  const config = readJson(CONFIG_PATH);
  const discovered = discoverRouteFiles();
  const manifest = buildManifest(config, discovered);
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

  if (verifyOnly) {
    const current = fs.existsSync(OUTPUT_PATH)
      ? fs.readFileSync(OUTPUT_PATH, "utf8")
      : "";
    if (current !== serialized) {
      process.stderr.write(
        `notification destination manifest is stale. Run ${path.relative(
          ROOT,
          __filename,
        )} to regenerate it.\n`,
      );
      process.exitCode = 1;
    }
    return serialized;
  }

  fs.writeFileSync(OUTPUT_PATH, serialized);
  return serialized;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function discoverRouteFiles() {
  const webRoutes = new Set();
  for (const routeRoot of WEB_DISCOVERY_ROOTS) {
    for (const route of collectWebRoutes(routeRoot)) {
      webRoutes.add(route);
    }
  }

  const nativeRoutes = new Set();

  for (const routeRoot of NATIVE_ROUTE_ROOTS) {
    if (!fs.existsSync(routeRoot)) continue;
    const stat = fs.statSync(routeRoot);
    if (stat.isDirectory()) {
      for (const filePath of walkFiles(routeRoot)) {
        if (!filePath.endsWith(".tsx")) continue;
        const base = path.basename(filePath);
        if (base.startsWith("_")) continue;
        nativeRoutes.add(normalizePath(filePath));
      }
      continue;
    }

    if (stat.isFile() && routeRoot.endsWith(".tsx")) {
      nativeRoutes.add(normalizePath(routeRoot));
    }
  }

  return {
    webRoutes,
    nativeRoutes,
  };
}

function collectWebRoutes(root) {
  const routes = new Set();
  if (!fs.existsSync(root)) return routes;

  for (const filePath of walkFiles(root)) {
    if (!filePath.endsWith("page.tsx")) continue;
    routes.add(normalizePath(filePath));
  }

  return routes;
}

function walkFiles(root) {
  const stack = [root];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function buildManifest(config, discovered) {
  const ignoreRoutes = new Set(
    (config.ignoreRoutes ?? []).map((value) =>
      normalizePath(path.join(ROOT, value)),
    ),
  );
  const usedRoutes = new Set();

  const manifest = (config.destinations ?? []).map((destination) => {
    const webRoute = destination.webRoute
      ? normalizePath(path.join(ROOT, destination.webRoute))
      : null;
    const nativeRoute = destination.nativeRoute
      ? normalizePath(path.join(ROOT, destination.nativeRoute))
      : null;

    assert(
      webRoute || nativeRoute,
      `Destination ${destination.id} must define at least one platform route`,
    );

    if (webRoute) {
      assert(
        discovered.webRoutes.has(webRoute),
        `Missing web route for destination ${destination.id}: ${destination.webRoute}`,
      );
      usedRoutes.add(webRoute);
    }

    if (nativeRoute) {
      assert(
        discovered.nativeRoutes.has(nativeRoute),
        `Missing native route for destination ${destination.id}: ${destination.nativeRoute}`,
      );
      usedRoutes.add(nativeRoute);
    }

    const paths = {};
    if (webRoute) {
      paths.web =
        destination.webPath ?? deriveRoutePath(webRoute, WEB_ROUTE_ROOT);
    }
    if (nativeRoute) {
      paths.native =
        destination.nativePath ?? deriveRoutePath(nativeRoute, NATIVE_SCOPE);
    }

    assert(
      Object.keys(paths).length > 0,
      `Destination ${destination.id} must define at least one platform path`,
    );

    return {
      id: destination.id,
      label: destination.label,
      paths,
    };
  });

  const accountedRoutes = new Set([...ignoreRoutes, ...usedRoutes]);
  const unaccountedRoutes = [
    ...discovered.webRoutes,
    ...discovered.nativeRoutes,
  ].filter((routePath) => !accountedRoutes.has(routePath));

  if (unaccountedRoutes.length > 0) {
    throw new Error(
      `Unaccounted route files:\n${unaccountedRoutes
        .sort()
        .map((routePath) => `  - ${path.relative(ROOT, routePath)}`)
        .join("\n")}`,
    );
  }

  return manifest.sort((a, b) => a.id.localeCompare(b.id));
}

function deriveRoutePath(filePath, scopeRoot) {
  const relative = path.relative(scopeRoot, filePath);
  const parts = relative.split(path.sep);
  const fileName = parts.pop();
  const segments = parts.filter((part) => !isRouteGroup(part));

  if (!fileName) {
    return "/";
  }

  const stem = fileName.replace(/\.[^.]+$/, "");
  if (stem === "page") {
    return (
      `/${segments.join("/")}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/"
    );
  }

  if (stem === "index") {
    return (
      `/${segments.join("/")}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/"
    );
  }

  segments.push(stem);
  return (
    `/${segments.join("/")}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/"
  );
}

function isRouteGroup(part) {
  return part.startsWith("(") && part.endsWith(")");
}

function normalizePath(filePath) {
  return path.normalize(filePath);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

module.exports = {
  ROOT,
  CONFIG_PATH,
  OUTPUT_PATH,
  WEB_DISCOVERY_ROOT,
  WEB_DISCOVERY_ROOTS,
  WEB_ROUTE_ROOT,
  NATIVE_SCOPE,
  NATIVE_ROUTE_ROOTS,
  main,
  readJson,
  discoverRouteFiles,
  collectWebRoutes,
  walkFiles,
  buildManifest,
  deriveRoutePath,
  isRouteGroup,
  normalizePath,
};
