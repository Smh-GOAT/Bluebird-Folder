"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface AcademicSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function AcademicSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: AcademicSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const hasStructuredData = !!summaryJson;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-l-4 border-indigo-600 bg-indigo-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-sm font-medium text-indigo-900">学术分析</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-indigo-950">
          {overview?.title ?? "学术视频分析"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-indigo-800">{overview.topic}</p>
        )}
      </div>

      {hasStructuredData && overview && (
        <MetaInfoCard
          platform={overview.platform}
          author={overview.author}
          duration={overview.duration}
          extraLabel="领域"
          extraValue={tags[0]}
          variant="academic"
        />
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800"
            >
              🏷️ {tag}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-bb-border bg-bb-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">❓</span>
            <span className="font-medium text-bb-text">核心问题</span>
          </div>
          <p className="text-sm text-bb-text-muted">
            详见下方正文分析
          </p>
        </div>

        <div className="rounded-lg border border-bb-border bg-bb-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="font-medium text-bb-text">关键观点</span>
          </div>
          <p className="text-sm text-bb-text-muted">
            详见下方正文分析
          </p>
        </div>

        <div className="rounded-lg border border-bb-border bg-bb-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">📐</span>
            <span className="font-medium text-bb-text">方法 / 论证</span>
          </div>
          <p className="text-sm text-bb-text-muted">
            详见下方正文分析
          </p>
        </div>

        <div className="rounded-lg border border-bb-border bg-bb-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span className="font-medium text-bb-text">局限 / 启发</span>
          </div>
          <p className="text-sm text-bb-text-muted">
            详见下方正文分析
          </p>
        </div>
      </div>

      {summaryMarkdown ? (
        <div className="rounded-xl border border-bb-border bg-bb-surface p-4">
          <MarkdownRenderer content={summaryMarkdown} />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-bb-border bg-bb-surface-sub">
          <p className="text-sm text-bb-text-subtle">暂无总结内容</p>
        </div>
      )}

      {meta?.generatedAt && (
        <p className="text-right text-xs text-bb-text-subtle">
          生成于 {new Date(meta.generatedAt).toLocaleString("zh-CN")}
        </p>
      )}
    </div>
  );
}
