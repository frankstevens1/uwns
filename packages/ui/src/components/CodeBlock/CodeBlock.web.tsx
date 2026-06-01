"use client";

import * as React from "react";
import CodeMirror, {
  EditorView,
  type BasicSetupOptions,
  type Extension,
} from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Check, Copy } from "lucide-react";
import type { CodeBlockProps } from "./CodeBlock.types";
import { Select } from "../../primitives/Select/Select.web";
import { cx } from "../../utils/cx";

function getBasicSetup(showLineNumbers: boolean): BasicSetupOptions {
  return {
    lineNumbers: showLineNumbers,
    foldGutter: false,
    highlightActiveLine: false,
    highlightActiveLineGutter: false,
    autocompletion: false,
    closeBrackets: false,
    searchKeymap: false,
    foldKeymap: false,
    completionKeymap: false,
    lintKeymap: false,
  };
}

const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--ui-bg)",
    color: "var(--ui-fg)",
    fontSize: "12px",
  },
  ".cm-editor": {
    backgroundColor: "var(--ui-bg)",
  },
  ".cm-scroller": {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: "20px",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  },
  ".cm-scroller::-webkit-scrollbar": {
    display: "none",
  },
  ".cm-content": {
    padding: "12px 0",
  },
  ".cm-line": {
    padding: "0 14px",
  },
  ".cm-gutters": {
    backgroundColor: "var(--ui-bg)",
    borderRight: "1px solid var(--ui-border)",
    color: "var(--ui-muted-fg)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    minWidth: "34px",
    padding: "0 10px 0 8px",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
  "&.cm-focused": {
    outline: "none",
  },
});

const compactEditorTheme = EditorView.theme({
  ".cm-line": {
    padding: "0 14px",
  },
});

function inferLanguage(language: string, filename?: string) {
  if (language !== "text") return language;

  const extension = filename?.split(".").pop()?.toLowerCase();
  if (extension === "ts" || extension === "tsx") return "tsx";
  if (extension === "js" || extension === "jsx") return "jsx";
  if (extension === "json") return "json";

  return language;
}

function languageExtensions(language: string): Extension[] {
  if (language === "tsx" || language === "typescript") {
    return [javascript({ jsx: true, typescript: true })];
  }

  if (language === "jsx" || language === "javascript") {
    return [javascript({ jsx: language === "jsx" })];
  }

  if (language === "json") {
    return [javascript()];
  }

  return [];
}

export function CodeBlock({
  theme = "none",
  code = "",
  language = "text",
  filename,
  snippets,
  showLineNumbers = true,
  copyable = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className = "",
  style,
}: CodeBlockProps) {
  const availableSnippets = React.useMemo(
    () =>
      snippets?.length
        ? snippets
        : [
            {
              id: "default",
              label: filename ?? language,
              code,
              language,
              filename,
            },
          ],
    [code, filename, language, snippets],
  );
  const [selectedSnippetId, setSelectedSnippetId] = React.useState(
    availableSnippets[0]?.id ?? "default",
  );
  const selectedSnippet =
    availableSnippets.find((snippet) => snippet.id === selectedSnippetId) ??
    availableSnippets[0];
  const currentCode = selectedSnippet?.code ?? "";
  const currentLanguage = selectedSnippet?.language ?? language;
  const currentFilename = selectedSnippet?.filename ?? filename;
  const label =
    selectedSnippet?.filename ?? selectedSnippet?.label ?? currentLanguage;
  const [copied, setCopied] = React.useState(false);
  const resolvedLanguage = inferLanguage(currentLanguage, currentFilename);
  const hasSnippetPicker = availableSnippets.length > 1;
  const snippetPickerWidth = React.useMemo(() => {
    const longest = Math.max(
      16,
      ...availableSnippets.map((snippet) => snippet.label.length),
    );
    return `${Math.min(longest + 4, 34)}ch`;
  }, [availableSnippets]);

  React.useEffect(() => {
    if (availableSnippets.some((snippet) => snippet.id === selectedSnippetId)) {
      return;
    }
    setSelectedSnippetId(availableSnippets[0]?.id ?? "default");
  }, [availableSnippets, selectedSnippetId]);

  const extensions = React.useMemo(
    () => [
      editorTheme,
      EditorView.lineWrapping,
      !showLineNumbers ? compactEditorTheme : [],
      ...languageExtensions(resolvedLanguage),
    ],
    [resolvedLanguage, showLineNumbers],
  );
  const setup = React.useMemo(
    () => getBasicSetup(showLineNumbers),
    [showLineNumbers],
  );

  const onCopy = async () => {
    if (!copyable) return;

    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    globalThis.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={cx(
        "overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-bg) shadow-sm",
        className,
      )}
      style={style}
    >
      <div className="flex h-9 items-center justify-between border-b border-(--ui-border) bg-(--ui-subtle-bg)">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-(--ui-border)" />
          {hasSnippetPicker ? (
            <Select
              value={selectedSnippetId}
              onChange={setSelectedSnippetId}
              options={availableSnippets.map((snippet) => ({
                label: snippet.label,
                value: snippet.id,
                group: snippet.group,
              }))}
              size="sm"
              variant="ghost"
              className="min-w-36"
              style={{ width: snippetPickerWidth }}
            />
          ) : (
            <span className="truncate font-mono text-xs font-medium text-(--ui-muted-fg)">
              {label}
            </span>
          )}
        </div>

        {copyable ? (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-7 items-center gap-1 rounded-md px-4 text-xs font-medium text-(--ui-muted-fg) hover:bg-(--ui-bg) hover:text-(--ui-fg)"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
        ) : null}
      </div>
      <CodeMirror
        value={currentCode}
        editable={false}
        readOnly
        basicSetup={setup}
        extensions={extensions}
        theme={theme}
        indentWithTab={false}
      />
    </div>
  );
}
