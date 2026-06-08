const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  OUTPUT_PATH,
  buildDocsSearchIndex,
  filePathToSlug,
  main,
  readDocsPages,
  slugifyHeading,
} = require("../generate-docs-search-index.js");

test("builds page and heading docs search entries", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "uwns-docs-"));
  const pagesRoot = path.join(tempRoot, "pages");

  try {
    fs.mkdirSync(path.join(pagesRoot, "getting-started"), { recursive: true });
    fs.writeFileSync(
      path.join(pagesRoot, "index.md"),
      [
        "---",
        "title: Docs home",
        "description: Start here",
        "section: Intro",
        "order: 1",
        "---",
        "# Docs home",
        "",
        "This content mentions Supabase and native browser docs.",
        "",
        "## Setup",
        "",
        "### Repeated",
        "",
        "### Repeated",
        "",
      ].join("\n"),
    );
    fs.writeFileSync(
      path.join(pagesRoot, "getting-started", "repo-structure.md"),
      [
        "---",
        "title: Repo Structure",
        "description: Package boundaries",
        "section: Intro",
        "order: 2",
        "---",
        "# Repo Structure",
        "",
        "Shared packages and app routes.",
        "",
        "## Apps",
        "",
      ].join("\n"),
    );

    const pages = readDocsPages(pagesRoot);
    const index = buildDocsSearchIndex(pages);

    assert.deepEqual(
      pages.map((page) => page.href),
      ["/docs", "/docs/getting-started/repo-structure"],
    );
    assert.equal(index[0].type, "page");
    assert.equal(index[0].href, "/docs");
    assert.ok(index[0].searchText.includes("supabase"));
    assert.ok(index.some((item) => item.href === "/docs#setup"));
    assert.ok(index.some((item) => item.href === "/docs#repeated"));
    assert.ok(index.some((item) => item.href === "/docs#repeated-2"));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("derives docs slugs and heading ids", () => {
  assert.equal(
    filePathToSlug(
      path.join("docs", "pages", "architecture", "web.md"),
      path.join("docs", "pages"),
    ),
    "architecture/web",
  );
  assert.equal(
    filePathToSlug(
      path.join("docs", "pages", "reference", "index.md"),
      path.join("docs", "pages"),
    ),
    "reference",
  );
  assert.equal(slugifyHeading("Native & Web setup"), "native-web-setup");
});

test("checked-in docs search index matches regenerated output", () => {
  const serialized = main(["--check"]);
  assert.equal(fs.readFileSync(OUTPUT_PATH, "utf8"), serialized);
});
