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
  return detail === "brief" ? "concise" : detail;
}

function parseWordRange(range: string): { min: number; max: number } {
  const match = range.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return { min: 0, max: Number.MAX_SAFE_INTEGER };
  return { min: Number(match[1]), max: Number(match[2]) };
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
    return summaryMarkdown ? countSummaryWords(summaryMarkdown) : 0;
  }, [summaryMarkdown]);

  const wordRange = useMemo(() => parseWordRange(detailConfig.targetWords), [detailConfig.targetWords]);

  const wordCountState = useMemo(() => {
    if (actualWordCount === 0) return { tone: "neutral" as const, label: "未统计" };
    if (actualWordCount < wordRange.min) return { tone: "warn" as const, label: "字数偏少" };
    if (actualWordCount > wordRange.max) return { tone: "warn" as const, label: "字数偏多" };
    return { tone: "ok" as const, label: "字数达标" };
  }, [actualWordCount, wordRange.max, wordRange.min]);

  // Status badge stays semantic — green/amber/neutral are content-meaning colors
  const wordCountStyle = {
    neutral: { border: "1px solid var(--border-sub)", background: "var(--surface-sub)", color: "var(--text-muted)" },
    ok:      { border: "1px solid rgba(52,199,89,0.3)", background: "rgba(52,199,89,0.07)", color: "#1A7F35" },
    warn:    { border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.07)", color: "#92400E" }
  }[wordCountState.tone];

  const effectiveTemplate = (summaryTemplate ?? summaryJson?.meta?.template ?? "general") as SummaryTemplate;

  const handleCopyJson = async () => {
    if (!summaryJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(summaryJson, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch { /* ignore */ }
  };

  const handleCopyMarkdown = async () => {
    if (!summaryMarkdown) return;
    try {
      await navigator.clipboard.writeText(summaryMarkdown);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-3">
      {/* Word count banner */}
      {summaryMarkdown && (
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
            style={wordCountStyle}
          >
            {wordCountState.label}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            字数 {actualWordCount} / 目标 {detailConfig.targetWords}
          </div>
          <div className="text-xs" style={{ color: "var(--text-subtle)" }}>
            档位：{detailConfig.label}
          </div>
        </div>
      )}

      {/* JSON inspector */}
      {summaryJson && (
        <div
          className="p-2.5"
          style={{
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-sub)",
            background: "var(--surface-sub)",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>结构化 JSON（辅助）</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setShowJson(!showJson)}
                className="rounded px-2 py-1 text-xs transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {showJson ? "收起" : "展开"}
              </button>
              <button
                type="button"
                onClick={handleCopyJson}
                className="rounded px-2 py-1 text-xs transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {copiedJson ? "已复制" : "复制"}
              </button>
            </div>
          </div>
          <pre
            className={`overflow-auto p-2 text-xs leading-5 transition-all ${showJson ? "max-h-60" : "max-h-20"}`}
            style={{
              borderRadius: "var(--radius-xs)",
              background: "var(--bg-alt)",
              color: "var(--text-sec)",
            }}
          >
            {JSON.stringify(summaryJson, null, 2)}
          </pre>
        </div>
      )}

      {/* Markdown body */}
      <div className="relative">
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="rounded px-2 py-1 text-xs text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--primary-dark)" }}
            disabled={!summaryMarkdown}
          >
            {copiedMarkdown ? "已复制" : "复制"}
          </button>
          {summaryMarkdown && (
            <a
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(summaryMarkdown)}`}
              download="summary.md"
              className="rounded px-2 py-1 text-xs text-white"
              style={{ background: "var(--primary-dark)" }}
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
