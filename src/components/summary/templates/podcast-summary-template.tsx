"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface PodcastSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function PodcastSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: PodcastSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const podcastData = summaryJson?.templateData?.podcast;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border-l-4 border-purple-500 bg-purple-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          <span className="text-sm font-medium text-purple-900">播客访谈</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-purple-950">
          {overview?.title ?? "播客视频"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-purple-800">{overview.topic}</p>
        )}
      </div>

      {/* Meta Info */}
      <MetaInfoCard
        platform={overview?.platform}
        author={overview?.author}
        duration={overview?.duration}
        variant="default"
      />

      {/* Theme */}
      {podcastData?.theme && (
        <div className="rounded-xl border border-purple-200 bg-bb-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-bb-text">
            <span>🎯</span>
            本期主题
          </h2>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-sm font-medium text-purple-800">{podcastData.theme}</p>
          </div>
        </div>
      )}

      {/* Main Opinions */}
      {podcastData?.mainOpinions && podcastData.mainOpinions.length > 0 && (
        <div className="rounded-xl border border-bb-border bg-bb-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-bb-text">
            <span>💭</span>
            主要观点
          </h2>
          <div className="space-y-3">
            {podcastData.mainOpinions.map((opinion, index) => (
              <div
                key={index}
                className="rounded-lg border-l-4 border-purple-400 bg-purple-50/50 p-3"
              >
                <p className="text-sm text-bb-text-sec">{opinion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue Thread */}
      {podcastData?.dialogueThread && (
        <div className="rounded-xl border border-bb-border bg-bb-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-bb-text">
            <span>🔄</span>
            对话主线
          </h2>
          <div className="rounded-lg bg-bb-surface-sub p-3">
            <p className="text-sm text-bb-text-sec">{podcastData.dialogueThread}</p>
          </div>
        </div>
      )}

      {/* Highlights */}
      {podcastData?.highlights && podcastData.highlights.length > 0 && (
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-purple-900">
            <span>✨</span>
            金句与亮点
          </h2>
          <div className="space-y-3">
            {podcastData.highlights.map((highlight, index) => (
              <blockquote
                key={index}
                className="border-l-4 border-purple-400 bg-bb-surface p-3 text-sm italic text-bb-text-sec"
              >
                &ldquo;{highlight}&rdquo;
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Inspiration */}
      {podcastData?.inspiration && (
        <div className="rounded-xl border border-purple-200 bg-bb-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-bb-text">
            <span>💡</span>
            听后启发
          </h2>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-sm text-bb-text-sec">{podcastData.inspiration}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700"
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
