"use client";

import { useMemo, useState } from "react";
import { SummaryTemplateRouter } from "./summary-template-router";
import { countSummaryWords } from "@/lib/services/llm/parser";
import {
  DETAIL_LEVEL_CONFIG,
  type SummaryDetailLevel,
  type SummaryStructured,
  type SummaryTemplate
} from "@/types/summary";

interface SummaryDisplayProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
  summaryTemplate?: SummaryTemplate | string | null;
  summaryDetail?: SummaryDetailLevel;
}

function normalizeDetailLevel(detail: SummaryDetailLevel = "standard"): "concise" | "standard" | "detailed" {
  if (detail === "brief") {
    return "concise";
  }

  return detail;
}

function parseWordRange(range: string): { min: number; max: number } {
  const match = range.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    return { min: 0, max: Number.MAX_SAFE_INTEGER };
  }

  return {
    min: Number(match[1]),
    max: Number(match[2])
  };
}

export function SummaryDisplay({
  summaryJson,
  summaryMarkdown,
  summaryTemplate,
  summaryDetail = "standard"
}: SummaryDisplayProps) {
  const [showJson, setShowJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const normalizedDetail = normalizeDetailLevel(summaryDetail);
  const detailConfig = DETAIL_LEVEL_CONFIG[normalizedDetail];
  const actualWordCount = useMemo(() => {
    if (!summaryMarkdown) {
      return 0;
    }

    return countSummaryWords(summaryMarkdown);
  }, [summaryMarkdown]);
  const wordRange = useMemo(() => parseWordRange(detailConfig.targetWords), [detailConfig.targetWords]);

  const wordCountState = useMemo(() => {
    if (actualWordCount === 0) {
      return {
        tone: "neutral" as const,
        label: "未统计"
      };
    }

    if (actualWordCount < wordRange.min) {
      return {
        tone: "warn" as const,
        label: "字数偏少"
      };
    }

    if (actualWordCount > wordRange.max) {
      return {
        tone: "warn" as const,
        label: "字数偏多"
      };
    }

    return {
      tone: "ok" as const,
      label: "字数达标"
    };
  }, [actualWordCount, wordRange.max, wordRange.min]);

  const wordCountClasses = {
    neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-700"
  } satisfies Record<typeof wordCountState.tone, string>;

  const effectiveTemplate = (summaryTemplate ??
    summaryJson?.meta?.template ??
    "general") as SummaryTemplate;

  const handleCopyJson = async () => {
    if (!summaryJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(summaryJson, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyMarkdown = async () => {
    if (!summaryMarkdown) {
      return;
    }

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
      {summaryMarkdown && (
        <div className="flex flex-wrap items-center gap-2">
          <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${wordCountClasses[wordCountState.tone]}`}>
            {wordCountState.label}
          </div>
          <div className="text-xs text-zinc-500">
            字数 {actualWordCount} / 目标 {detailConfig.targetWords}
          </div>
          <div className="text-xs text-zinc-400">
            档位：{detailConfig.label}
          </div>
        </div>
      )}

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
          template={effectiveTemplate}
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      </div>
    </div>
  );
}
