import * as React from "react";
import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code, CodeBlock } from "@repo/ui";
import { slugifyHeading } from "@/lib/docs/loader";

function reactNodeToText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(reactNodeToText).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return reactNodeToText(node.props.children);
  }

  return "";
}

function createHeadingIdFactory() {
  const counts = new Map<string, number>();

  return (node: React.ReactNode) => {
    const base = slugifyHeading(reactNodeToText(node));
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function codeText(node: React.ReactNode) {
  return reactNodeToText(node).replace(/\n$/, "");
}

export function DocsMarkdown({ content }: { content: string }) {
  const headingId = createHeadingIdFactory();

  const components: Components = {
    h1() {
      return null;
    },
    h2({ children }) {
      const id = headingId(children);
      return (
        <h2
          id={id}
          className="scroll-mt-20 border-t border-(--ui-border) pt-8 text-2xl font-semibold"
        >
          {children}
        </h2>
      );
    },
    h3({ children }) {
      const id = headingId(children);
      return (
        <h3 id={id} className="scroll-mt-20 text-lg font-semibold">
          {children}
        </h3>
      );
    },
    p({ children }) {
      return <p className="text-sm leading-7 text-(--ui-muted-fg)">{children}</p>;
    },
    a({ href, children }) {
      if (!href) {
        return <span>{children}</span>;
      }

      const className =
        "font-medium text-(--ui-fg) underline decoration-(--ui-border) underline-offset-4 hover:decoration-(--ui-fg)";

      if (href.startsWith("/")) {
        return (
          <Link href={href} className={className}>
            {children}
          </Link>
        );
      }

      if (href.startsWith("#")) {
        return (
          <a href={href} className={className}>
            {children}
          </a>
        );
      }

      return (
        <a
          href={href}
          className={className}
          target="_blank"
          rel="noreferrer noopener"
        >
          {children}
        </a>
      );
    },
    ul({ children }) {
      return (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-(--ui-muted-fg)">
          {children}
        </ul>
      );
    },
    ol({ children }) {
      return (
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-(--ui-muted-fg)">
          {children}
        </ol>
      );
    },
    li({ children }) {
      return <li className="pl-1">{children}</li>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-2 border-(--ui-border) pl-4 text-sm text-(--ui-muted-fg)">
          {children}
        </blockquote>
      );
    },
    hr() {
      return <hr className="border-(--ui-border)" />;
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto rounded-lg border border-(--ui-border)">
          <table className="min-w-full divide-y divide-(--ui-border) text-sm">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-(--ui-subtle-bg)">{children}</thead>;
    },
    th({ children }) {
      return (
        <th className="px-3 py-2 text-left font-medium text-(--ui-fg)">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border-t border-(--ui-border) px-3 py-2 text-(--ui-muted-fg)">
          {children}
        </td>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
    code({ children, className }) {
      const language = /language-([\w-]+)/.exec(className ?? "")?.[1];

      if (language) {
        return (
          <CodeBlock
            code={codeText(children)}
            language={language}
            showLineNumbers={false}
          />
        );
      }

      return <Code>{children}</Code>;
    },
  };

  return (
    <div className="space-y-6">
      <Markdown components={components} remarkPlugins={[remarkGfm]} skipHtml>
        {content}
      </Markdown>
    </div>
  );
}
