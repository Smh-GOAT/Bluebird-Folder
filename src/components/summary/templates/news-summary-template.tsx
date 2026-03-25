"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface NewsSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function NewsSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: NewsSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const newsData = summaryJson?.templateData?.news;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border-l-4 border-slate-600 bg-slate-100 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">📰</span>
          <span className="text-sm font-medium text-slate-700">新闻报道</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-900">
          {overview?.title ?? "新闻报道"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-slate-600">{overview.topic}</p>
        )}
      </div>

      {/* Meta Info */}
      <MetaInfoCard
        platform={overview?.platform}
        author={overview?.author}
        duration={overview?.duration}
        variant="default"
      />

      {/* 5W1H */}
      {(newsData?.what ||
        newsData?.who ||
        newsData?.when ||
        newsData?.where ||
        newsData?.why ||
        newsData?.how) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📋</span>
            5W1H 要点
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {newsData?.what && (
              <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3">
                <div className="mb-1 text-xs font-medium text-blue-700">
                  What · 事件
                </div>
                <p className="text-sm text-zinc-700">{newsData.what}</p>
              </div>
            )}
            {newsData?.who && (
              <div className="rounded-lg border-l-4 border-green-400 bg-green-50 p-3">
                <div className="mb-1 text-xs font-medium text-green-700">
                  Who · 相关方
                </div>
                <p className="text-sm text-zinc-700">{newsData.who}</p>
              </div>
            )}
            {newsData?.when && (
              <div className="rounded-lg border-l-4 border-purple-400 bg-purple-50 p-3">
                <div className="mb-1 text-xs font-medium text-purple-700">
                  When · 时间
                </div>
                <p className="text-sm text-zinc-700">{newsData.when}</p>
              </div>
            )}
            {newsData?.where && (
              <div className="rounded-lg border-l-4 border-orange-400 bg-orange-50 p-3">
                <div className="mb-1 text-xs font-medium text-orange-700">
                  Where · 地点
                </div>
                <p className="text-sm text-zinc-700">{newsData.where}</p>
              </div>
            )}
            {newsData?.why && (
              <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-3">
                <div className="mb-1 text-xs font-medium text-red-700">
                  Why · 原因
                </div>
                <p className="text-sm text-zinc-700">{newsData.why}</p>
              </div>
            )}
            {newsData?.how && (
              <div className="rounded-lg border-l-4 border-teal-400 bg-teal-50 p-3">
                <div className="mb-1 text-xs font-medium text-teal-700">
                  How · 方式
                </div>
                <p className="text-sm text-zinc-700">{newsData.how}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background */}
      {newsData?.background && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📖</span>
            事件背景
          </h2>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-zinc-700">{newsData.background}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      {newsData?.progress && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📈</span>
            关键进展
          </h2>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-zinc-700">{newsData.progress}</p>
          </div>
        </div>
      )}

      {/* Impact */}
      {newsData?.impact && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>🌊</span>
            影响分析
          </h2>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-zinc-700">{newsData.impact}</p>
          </div>
        </div>
      )}

      {/* Controversies */}
      {newsData?.controversies && newsData.controversies.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-orange-900">
            <span>⚡</span>
            争议与待观察点
          </h2>
          <ul className="space-y-2">
            {newsData.controversies.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">•</span>
                <span className="text-sm text-orange-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700"
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
