"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface TravelSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function TravelSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: TravelSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const hasStructuredData = !!summaryJson;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-5 text-white">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-sm font-medium opacity-90">旅行攻略</span>
          </div>
          <h1 className="mb-2 text-xl font-bold">
            {overview?.title ?? "旅行视频总结"}
          </h1>
          {overview?.topic && (
            <p className="text-sm opacity-90">{overview.topic}</p>
          )}
        </div>
      </div>

      {hasStructuredData && overview && (
        <MetaInfoCard
          platform={overview.platform}
          author={overview.author}
          duration={overview.duration}
          extraLabel="地点"
          extraValue={tags[0]}
          variant="travel"
        />
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800"
            >
              📍 {tag}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-medium text-amber-900">攻略要点</span>
        </div>
        <p className="text-sm text-amber-800">
          以下内容包含行程规划、交通方式、预算参考及避坑提醒，建议收藏备用。
        </p>
      </div>

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
