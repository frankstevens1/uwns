#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");

const artifactDirNames = new Set([
  ".expo",
  ".expo-shared",
  ".next",
  ".pytest_cache",
  ".ruff_cache",
  ".turbo",
  ".uv-cache",
  "__pycache__",
  "build",
  "coverage",
  "dist",
  "htmlcov",
  "out",
  "web-build",
]);

const artifactFileNames = new Set([
  ".coverage",
  ".eslintcache",
  "expo-env.d.ts",
  "next-env.d.ts",
]);

const artifactFileSuffixes = [".pyc", ".pyo", ".tsbuildinfo"];
const dependencyDirNames = new Set(["node_modules", ".pnpm-store"]);
const alwaysSkipDirNames = new Set([".git"]);

const targetedArtifactDirs = new Set([
  "supabase/.branches",
  "supabase/.temp",
]);

const serviceResets = {
  api: {
    root: "services/api",
    removeDirs: [".venv", ".pytest_cache", ".uv-cache"],
    install: {
      cmd: "uv",
      args: ["--cache-dir", ".uv-cache", "sync", "--dev"],
    },
  },
};

function parseArgs(argv) {
  const options = {
    deps: false,
    dryRun: false,
    help: false,
    services: new Set(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--all") {
      options.deps = true;
      Object.keys(serviceResets).forEach((service) =>
        options.services.add(service),
      );
      continue;
    }

    if (arg === "--deps" || arg === "--pnpm-store") {
      options.deps = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--services") {
      Object.keys(serviceResets).forEach((service) =>
        options.services.add(service),
      );
      continue;
    }

    if (arg === "--service") {
      const service = argv[index + 1];
      if (!service) throw new Error("--service requires a service name");
      options.services.add(service);
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: pnpm clean-repo -- [options]

Options:
  --dry-run          Show what would be removed without deleting anything.
  --deps            Also remove JS dependency state: node_modules and .pnpm-store.
  --pnpm-store      Alias for --deps; kept explicit for local pnpm store refreshes.
  --service api     Reset one service dependency environment and reinstall deps.
  --services        Reset every known service.
  --all             Clean artifacts, remove JS dependency state, and reset services.
  -h, --help        Show this help.

Default cleanup removes generated build, test, and tool caches only.`);
}

function toRelative(targetPath) {
  return path.relative(repoRoot, targetPath) || ".";
}

function addTarget(targets, targetPath) {
  targets.set(path.resolve(targetPath), toRelative(path.resolve(targetPath)));
}

function shouldRemoveFile(entryName) {
  if (artifactFileNames.has(entryName)) return true;
  return artifactFileSuffixes.some((suffix) => entryName.endsWith(suffix));
}

function shouldRemoveDir(entryName, relPath, options) {
  if (targetedArtifactDirs.has(relPath)) return true;
  if (artifactDirNames.has(entryName)) return true;
  if (options.deps && dependencyDirNames.has(entryName)) return true;
  return false;
}

function shouldSkipDir(entryName, options) {
  if (alwaysSkipDirNames.has(entryName)) return true;
  if (!options.deps && dependencyDirNames.has(entryName)) return true;
  if (entryName === ".venv") return true;
  return false;
}

function collectRepoTargets(options) {
  const targets = new Map();

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      const relPath = toRelative(entryPath);

      if (entry.isDirectory()) {
        if (shouldRemoveDir(entry.name, relPath, options)) {
          addTarget(targets, entryPath);
          continue;
        }

        if (shouldSkipDir(entry.name, options)) continue;
        walk(entryPath);
        continue;
      }

      if (entry.isFile() && shouldRemoveFile(entry.name)) {
        addTarget(targets, entryPath);
      }
    }
  }

  walk(repoRoot);
  return targets;
}

function collectTempTargets() {
  const targets = new Map();
  const tempRoot = fs.realpathSync(process.env.TMPDIR || "/tmp");
  const prefixes = ["haste-map-", "metro-"];

  let entries;
  try {
    entries = fs.readdirSync(tempRoot, { withFileTypes: true });
  } catch {
    return targets;
  }

  for (const entry of entries) {
    if (!prefixes.some((prefix) => entry.name.startsWith(prefix))) continue;
    addTarget(targets, path.join(tempRoot, entry.name));
  }

  return targets;
}

function removeTargets(targets, options) {
  const sortedTargets = Array.from(targets.entries()).sort((a, b) =>
    a[1].localeCompare(b[1]),
  );
  const failures = [];

  if (sortedTargets.length === 0) {
    console.log("No matching artifacts found.");
    return;
  }

  for (const [absolutePath, displayPath] of sortedTargets) {
    if (options.dryRun) {
      console.log(`would remove ${displayPath}`);
      continue;
    }

    try {
      fs.rmSync(absolutePath, {
        force: true,
        maxRetries: 3,
        recursive: true,
        retryDelay: 100,
      });
      console.log(`removed ${displayPath}`);
    } catch (error) {
      failures.push({ displayPath, error });
      console.warn(`failed to remove ${displayPath}`);
    }
  }

  if (failures.length > 0) {
    const details = failures
      .map(({ displayPath, error }) => {
        const message = error instanceof Error ? error.message : String(error);
        return `- ${displayPath}: ${message}`;
      })
      .join("\n");
    throw new Error(`Could not remove every target:\n${details}`);
  }
}

function resetService(serviceName, options) {
  const service = serviceResets[serviceName];
  if (!service) {
    const known = Object.keys(serviceResets).join(", ");
    throw new Error(`Unknown service "${serviceName}". Known services: ${known}`);
  }

  const serviceRoot = path.join(repoRoot, service.root);
  const targets = new Map();

  for (const dirName of service.removeDirs) {
    addTarget(targets, path.join(serviceRoot, dirName));
  }

  removeTargets(targets, options);

  if (options.dryRun) {
    console.log(
      `would run (${service.root}) ${service.install.cmd} ${service.install.args.join(" ")}`,
    );
    return;
  }

  console.log(`installing ${serviceName} dependencies...`);
  const result = spawnSync(service.install.cmd, service.install.args, {
    cwd: serviceRoot,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${service.install.cmd} exited with status ${result.status}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const repoTargets = collectRepoTargets(options);
  const tempTargets = collectTempTargets();
  const targets = new Map([...repoTargets, ...tempTargets]);

  console.log(options.dryRun ? "Cleaning repo artifacts (dry run)" : "Cleaning repo artifacts");
  removeTargets(targets, options);

  for (const serviceName of options.services) {
    console.log("");
    console.log(`Resetting service: ${serviceName}`);
    resetService(serviceName, options);
  }

  console.log("");
  console.log("Done.");

  if (options.deps) {
    console.log("Run `pnpm install` to recreate JS dependencies.");
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
