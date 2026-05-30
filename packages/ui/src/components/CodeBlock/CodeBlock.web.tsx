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

function languageExtensions(language: string): Extension[] {
  if (language === "tsx" || language === "typescript") {
    return [javascript({ jsx: true, typescript: true })];
  }

  if (language === "jsx" || language === "javascript") {
    return [javascript({ jsx: language === "jsx" })];
  }

  return [];
}

export function CodeBlock({
  theme = "none",
  code,
  language = "text",
  filename,
  showLineNumbers = true,
  copyable = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className = "",
  style,
}: CodeBlockProps) {
  const label = filename ?? language;
  const [copied, setCopied] = React.useState(false);
  const extensions = React.useMemo(
    () => [
      editorTheme,
      EditorView.lineWrapping,
      !showLineNumbers ? compactEditorTheme : [],
      ...languageExtensions(language),
    ],
    [language, showLineNumbers],
  );
  const setup = React.useMemo(
    () => getBasicSetup(showLineNumbers),
    [showLineNumbers],
  );

  const onCopy = async () => {
    if (!copyable) return;

    await navigator.clipboard.writeText(code);
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
      <div className="flex h-9 items-center justify-between border-b border-(--ui-border) bg-(--ui-subtle-bg) px-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-(--ui-border)" />
          <span className="truncate font-mono text-xs font-medium text-(--ui-muted-fg)">
            {label}
          </span>
        </div>

        {copyable ? (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-(--ui-muted-fg) hover:bg-(--ui-bg) hover:text-(--ui-fg)"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
        ) : null}
      </div>
      <CodeMirror
        value={code}
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
