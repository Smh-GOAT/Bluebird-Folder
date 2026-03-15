"use client";

import type { SummaryStructured } from "@/types/summary";
import { formatDuration } from "@/lib/utils/time";
import { MarkdownRenderer } from "../markdown-renderer";

interface GenericSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function GenericSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: GenericSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const hasStructuredData = !!summaryJson;

  return (
    <div className="space-y-4">
      {hasStructuredData && overview && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h1 className="mb-3 text-lg font-semibold text-zinc-900">
            {overview.title}
          </h1>

          <div className="mb-3 flex flex-wrap gap-2 text-sm text-zinc-600">
            {overview.author && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5">
                👤 {overview.author}
              </span>
            )}
            {overview.platform && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5">
                📺 {overview.platform}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5">
              ⏱️ {formatDuration(overview.duration)}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {overview?.topic && (
        <div className="rounded-lg border-l-4 border-zinc-800 bg-zinc-50 p-3">
          <p className="text-sm font-medium text-zinc-700">{overview.topic}</p>
        </div>
      )}

      {summaryMarkdown ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <MarkdownRenderer content={summaryMarkdown} />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50">
          <p className="text-sm text-zinc-400">暂无总结内容</p>
        </div>
      )}

      {meta?.generatedAt && (
        <p className="text-right text-xs text-zinc-400">
          生成于 {new Date(meta.generatedAt).toLocaleString("zh-CN")}
        </p>
      )}
    </div>
  );
}
