"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface TutorialSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function TutorialSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: TutorialSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const tutorialData = summaryJson?.templateData?.tutorial;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-sm font-medium text-emerald-900">教程学习</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-emerald-950">
          {overview?.title ?? "教程视频"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-emerald-800">{overview.topic}</p>
        )}
      </div>

      {/* Meta Info */}
      <MetaInfoCard
        platform={overview?.platform}
        author={overview?.author}
        duration={overview?.duration}
        variant="default"
      />

      {/* Learning Goal */}
      {tutorialData?.learningGoal && (
        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>🎯</span>
            学习目标
          </h2>
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-sm font-medium text-emerald-800">
              {tutorialData.learningGoal}
            </p>
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {tutorialData?.prerequisites && tutorialData.prerequisites.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📋</span>
            前置准备
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {tutorialData.prerequisites.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2 text-sm text-zinc-700"
              >
                <span className="text-emerald-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps Timeline */}
      {tutorialData?.steps && tutorialData.steps.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📝</span>
            操作步骤
          </h2>
          <div className="space-y-3">
            {tutorialData.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {index + 1}
                </div>
                <div className="flex-1 rounded-lg bg-zinc-50 p-3">
                  <p className="mb-1 text-sm font-medium text-zinc-900">
                    {step.title}
                  </p>
                  <p className="text-sm text-zinc-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Parameters */}
      {tutorialData?.keyParams && tutorialData.keyParams.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>⚙️</span>
            关键参数 / 工具
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {tutorialData.keyParams.map((param, index) => (
              <div
                key={index}
                className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-zinc-700"
              >
                {param}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {tutorialData?.commonMistakes && tutorialData.commonMistakes.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-orange-900">
            <span>⚠️</span>
            常见错误
          </h2>
          <ul className="space-y-2">
            {tutorialData.commonMistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">!</span>
                <span className="text-sm text-orange-800">{mistake}</span>
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
              className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
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
