"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface ReviewSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function ReviewSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: ReviewSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const reviewData = summaryJson?.templateData?.review;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border-l-4 border-rose-500 bg-rose-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="text-sm font-medium text-rose-900">评测分析</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-rose-950">
          {overview?.title ?? "评测视频"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-rose-800">{overview.topic}</p>
        )}
      </div>

      {/* Meta Info */}
      <MetaInfoCard
        platform={overview?.platform}
        author={overview?.author}
        duration={overview?.duration}
        variant="default"
      />

      {/* Subject Overview */}
      {reviewData?.subject && (
        <div className="rounded-xl border border-rose-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📦</span>
            评测对象
          </h2>
          <div className="rounded-lg bg-rose-50 p-3">
            <p className="text-sm font-medium text-rose-800">{reviewData.subject}</p>
          </div>
        </div>
      )}

      {/* Pros & Cons Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pros */}
        {reviewData?.pros && reviewData.pros.length > 0 && (
          <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-green-900">
              <span className="text-xl">👍</span>
              优点
            </h2>
            <ul className="space-y-2">
              {reviewData.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-600">✓</span>
                  <span className="text-sm text-green-800">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {reviewData?.cons && reviewData.cons.length > 0 && (
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-red-900">
              <span className="text-xl">👎</span>
              缺点
            </h2>
            <ul className="space-y-2">
              {reviewData.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 text-red-600">×</span>
                  <span className="text-sm text-red-800">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suitable For */}
      {reviewData?.suitableFor && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-blue-900">
            <span>✅</span>
            适合谁
          </h2>
          <div className="rounded-lg bg-white p-3">
            <p className="text-sm text-blue-800">{reviewData.suitableFor}</p>
          </div>
        </div>
      )}

      {/* Not Suitable For */}
      {reviewData?.notSuitableFor && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-orange-900">
            <span>❌</span>
            不适合谁
          </h2>
          <div className="rounded-lg bg-white p-3">
            <p className="text-sm text-orange-800">{reviewData.notSuitableFor}</p>
          </div>
        </div>
      )}

      {/* Final Conclusion */}
      {reviewData?.conclusion && (
        <div className="rounded-xl border-2 border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-rose-900">
            <span className="text-xl">🎯</span>
            最终结论
          </h2>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <p className="text-sm font-medium text-zinc-800">{reviewData.conclusion}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700"
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
