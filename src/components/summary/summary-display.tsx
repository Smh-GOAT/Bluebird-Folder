"use client";

import { useState } from "react";
import { SummaryTemplateRouter } from "./summary-template-router";
import type { SummaryStructured, SummaryTemplate } from "@/types/summary";

interface SummaryDisplayProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
  summaryTemplate?: SummaryTemplate | string | null;
}

export function SummaryDisplay({
  summaryJson,
  summaryMarkdown,
  summaryTemplate
}: SummaryDisplayProps) {
  const [showJson, setShowJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const handleCopyJson = async () => {
    if (!summaryJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(summaryJson, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyMarkdown = async () => {
    if (!summaryMarkdown) return;
    try {
      await navigator.clipboard.writeText(summaryMarkdown);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-3">
      {summaryJson && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-zinc-600">结构化 JSON（辅助）</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setShowJson(!showJson)}
                className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200"
              >
                {showJson ? "收起" : "展开"}
              </button>
              <button
                type="button"
                onClick={handleCopyJson}
                className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200"
              >
                {copiedJson ? "已复制" : "复制"}
              </button>
            </div>
          </div>
          <pre
            className={`overflow-auto rounded-lg bg-zinc-900 p-2 text-xs leading-5 text-zinc-100 transition-all ${
              showJson ? "max-h-60" : "max-h-20"
            }`}
          >
            {JSON.stringify(summaryJson, null, 2)}
          </pre>
        </div>
      )}

      <div className="relative">
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="rounded bg-zinc-800/80 px-2 py-1 text-xs text-white hover:bg-zinc-800"
            disabled={!summaryMarkdown}
          >
            {copiedMarkdown ? "已复制" : "复制"}
          </button>
          {summaryMarkdown && (
            <a
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(summaryMarkdown)}`}
              download="summary.md"
              className="rounded bg-zinc-800/80 px-2 py-1 text-xs text-white hover:bg-zinc-800"
            >
              下载
            </a>
          )}
        </div>

        <SummaryTemplateRouter
          template={summaryTemplate}
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      </div>
    </div>
  );
}
