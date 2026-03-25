"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface VlogSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function VlogSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: VlogSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const vlogData = summaryJson?.templateData?.vlog;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border-l-4 border-cyan-500 bg-cyan-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">📹</span>
          <span className="text-sm font-medium text-cyan-900">Vlog 时间线</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-cyan-950">
          {overview?.title ?? "Vlog 视频"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-cyan-800">{overview.topic}</p>
        )}
      </div>

      {/* Meta Info */}
      <MetaInfoCard
        platform={overview?.platform}
        author={overview?.author}
        duration={overview?.duration}
        variant="default"
      />

      {/* Mood */}
      {vlogData?.mood && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">氛围：</span>
          <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-700">
            {vlogData.mood}
          </span>
        </div>
      )}

      {/* Timeline */}
      {vlogData?.timeline && vlogData.timeline.length > 0 && (
        <div className="rounded-xl border border-cyan-200 bg-white p-4">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>⏱️</span>
            时间线
          </h2>
          <div className="relative space-y-4 pl-6">
            <div className="absolute bottom-2 left-2 top-2 w-0.5 bg-cyan-200"></div>
            {vlogData.timeline.map((event, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-cyan-400 bg-white"></div>
                <div className="rounded-lg bg-cyan-50 p-3">
                  <div className="mb-1 text-xs font-medium text-cyan-700">{event.time}</div>
                  <p className="text-sm text-zinc-700">{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experiences */}
      {vlogData?.experiences && vlogData.experiences.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📝</span>
            主要经历
          </h2>
          <ul className="space-y-2">
            {vlogData.experiences.map((exp, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-cyan-500">•</span>
                <span className="text-sm text-zinc-700">{exp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlights */}
      {vlogData?.highlights && vlogData.highlights.length > 0 && (
        <div className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-cyan-900">
            <span>✨</span>
            亮点片段
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {vlogData.highlights.map((highlight, index) => (
              <div
                key={index}
                className="rounded-lg border border-cyan-200 bg-white p-3 text-sm text-zinc-700"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Feeling */}
      {vlogData?.overallFeeling && (
        <div className="rounded-xl border border-cyan-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>💭</span>
            总体感受
          </h2>
          <div className="rounded-lg bg-cyan-50 p-3">
            <p className="text-sm text-zinc-700">{vlogData.overallFeeling}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Markdown Content */}
      {summaryMarkdown ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <MarkdownRenderer content={summaryMarkdown} />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50">
          <p className="text-sm text-zinc-400">暂无总结内容</p>
        </div>
      )}

      {/* Timestamp */}
      {meta?.generatedAt && (
        <p className="text-right text-xs text-zinc-400">
          生成于 {new Date(meta.generatedAt).toLocaleString("zh-CN")}
        </p>
      )}
    </div>
  );
}
