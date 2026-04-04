"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface InterviewSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function InterviewSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: InterviewSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const interviewData = summaryJson?.templateData?.interview;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <span className="text-sm font-medium text-amber-900">访谈总结</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-amber-950">
          {overview?.title ?? "访谈视频"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-amber-800">{overview.topic}</p>
        )}
      </div>

      {/* Meta Info */}
      <MetaInfoCard
        platform={overview?.platform}
        author={overview?.author}
        duration={overview?.duration}
        variant="default"
      />

      {/* Core Topics */}
      {interviewData?.coreTopics && interviewData.coreTopics.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-bb-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-bb-text">
            <span>📋</span>
            核心议题
          </h2>
          <ul className="space-y-2">
            {interviewData.coreTopics.map((topic, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-amber-500">•</span>
                <span className="text-sm text-bb-text-sec">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Opinions */}
      {interviewData?.keyOpinions && interviewData.keyOpinions.length > 0 && (
        <div className="rounded-xl border border-bb-border bg-bb-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-bb-text">
            <span>💭</span>
            关键观点
          </h2>
          <div className="space-y-3">
            {interviewData.keyOpinions.map((opinion, index) => (
              <div
                key={index}
                className="rounded-lg border-l-4 border-amber-400 bg-amber-50/50 p-3"
              >
                <p className="text-sm text-bb-text-sec">{opinion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotes */}
      {interviewData?.quotes && interviewData.quotes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-900">
            <span>💬</span>
            金句摘录
          </h2>
          <div className="space-y-3">
            {interviewData.quotes.map((quote, index) => (
              <blockquote
                key={index}
                className="border-l-4 border-amber-400 bg-bb-surface p-3 text-sm italic text-bb-text-sec"
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue Flow */}
      {interviewData?.dialogueFlow && (
        <div className="rounded-xl border border-bb-border bg-bb-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-bb-text">
            <span>🔄</span>
            对话脉络
          </h2>
          <div className="rounded-lg bg-bb-surface-sub p-3">
            <p className="text-sm text-bb-text-sec">{interviewData.dialogueFlow}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Markdown Content */}
      {summaryMarkdown ? (
        <div className="rounded-xl border border-bb-border bg-bb-surface p-4">
          <MarkdownRenderer content={summaryMarkdown} />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-bb-border bg-bb-surface-sub">
          <p className="text-sm text-bb-text-subtle">暂无总结内容</p>
        </div>
      )}

      {/* Timestamp */}
      {meta?.generatedAt && (
        <p className="text-right text-xs text-bb-text-subtle">
          生成于 {new Date(meta.generatedAt).toLocaleString("zh-CN")}
        </p>
      )}
    </div>
  );
}
