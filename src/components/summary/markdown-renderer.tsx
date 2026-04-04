"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 text-xl font-semibold first:mt-0" style={{ color: "var(--text)" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 text-lg font-semibold" style={{ color: "var(--text)" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-medium" style={{ color: "var(--text)" }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-7 last:mb-0" style={{ color: "var(--text-sec)" }}>
      {children}
    </p>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="mb-4 py-2 pl-4"
      style={{
        borderLeft: "3px solid var(--primary)",
        background: "var(--primary-tint)",
        color: "var(--text-muted)",
        borderRadius: "0 var(--radius-xs) var(--radius-xs) 0",
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-5 list-disc space-y-1.5" style={{ color: "var(--text-sec)" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-5 list-decimal space-y-1.5" style={{ color: "var(--text-sec)" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-6">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold" style={{ color: "var(--text)" }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic" style={{ color: "var(--text-sec)" }}>{children}</em>
  ),
  hr: () => <hr className="my-6" style={{ borderColor: "var(--border-sub)" }} />,
  code: ({ children, className }) => {
    const isInline = !className;
    return isInline ? (
      <code
        className="rounded px-1.5 py-0.5 text-sm font-mono"
        style={{ background: "var(--surface-sub)", color: "var(--text-sec)" }}
      >
        {children}
      </code>
    ) : (
      <code
        className="block overflow-x-auto p-3 text-sm font-mono"
        style={{
          background: "var(--bg-alt)",
          color: "var(--text-sec)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      className="mb-4 overflow-x-auto p-0"
      style={{ borderRadius: "var(--radius-sm)", background: "var(--bg-alt)" }}
    >
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 transition-colors"
      style={{ color: "var(--primary)" }}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: "var(--surface-sub)" }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th
      className="px-3 py-2 text-left font-medium"
      style={{ border: "1px solid var(--border-sub)", color: "var(--text-sec)" }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      className="px-3 py-2"
      style={{ border: "1px solid var(--border-sub)", color: "var(--text-sec)" }}
    >
      {children}
    </td>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || content.trim().length === 0) {
    return (
      <div className={`text-sm ${className}`} style={{ color: "var(--text-subtle)" }}>
        暂无总结内容
      </div>
    );
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
