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
    <h1 className="mb-4 mt-6 text-xl font-semibold text-zinc-900 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 text-lg font-semibold text-zinc-800">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-medium text-zinc-800">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-7 text-zinc-700 last:mb-0">
      {children}
    </p>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-zinc-300 bg-zinc-100/50 py-2 pl-4 text-zinc-600">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-5 list-disc space-y-1.5 text-zinc-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-zinc-700">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-6">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-zinc-700">
      {children}
    </em>
  ),
  hr: () => (
    <hr className="my-6 border-zinc-200" />
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    return isInline ? (
      <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-zinc-800">
        {children}
      </code>
    ) : (
      <code className="block overflow-x-auto rounded-lg bg-zinc-900 p-3 text-sm font-mono text-zinc-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-0">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-100">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border border-zinc-200 px-3 py-2 text-left font-medium text-zinc-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-200 px-3 py-2 text-zinc-700">
      {children}
    </td>
  ),
  tbody: ({ children }) => (
    <tbody>
      {children}
    </tbody>
  ),
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || content.trim().length === 0) {
    return (
      <div className={`text-sm text-zinc-400 ${className}`}>
        暂无总结内容
      </div>
    );
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
