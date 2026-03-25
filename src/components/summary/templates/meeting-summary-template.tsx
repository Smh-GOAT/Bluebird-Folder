"use client";

import type { SummaryStructured } from "@/types/summary";
import { MarkdownRenderer } from "../markdown-renderer";
import { MetaInfoCard } from "./meta-info-card";

interface MeetingSummaryTemplateProps {
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function MeetingSummaryTemplate({
  summaryJson,
  summaryMarkdown
}: MeetingSummaryTemplateProps) {
  const overview = summaryJson?.overview;
  const tags = summaryJson?.tags ?? [];
  const meta = summaryJson?.meta;
  const meetingData = summaryJson?.templateData?.meeting;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border-l-4 border-blue-600 bg-blue-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="text-sm font-medium text-blue-900">会议记录</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-blue-950">
          {overview?.title ?? "会议视频"}
        </h1>
        {overview?.topic && (
          <p className="text-sm text-blue-800">{overview.topic}</p>
        )}
      </div>

      {/* Meta Info */}
      <MetaInfoCard
        platform={overview?.platform}
        author={overview?.author}
        duration={overview?.duration}
        variant="default"
      />

      {/* Meeting Overview */}
      <div className="rounded-xl border border-blue-200 bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
          <span>📋</span>
          会议概览
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="mb-1 text-xs text-blue-700">会议主题</div>
            <p className="text-sm font-medium text-zinc-800">
              {overview?.topic ?? "未标注"}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="mb-1 text-xs text-blue-700">时长</div>
            <p className="text-sm font-medium text-zinc-800">
              {overview?.duration ? `${Math.round(overview.duration / 60)} 分钟` : "未标注"}
            </p>
          </div>
        </div>
      </div>

      {/* Topics */}
      {meetingData?.topics && meetingData.topics.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span>📌</span>
            讨论议题
          </h2>
          <ul className="space-y-2">
            {meetingData.topics.map((topic, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-lg bg-zinc-50 p-3"
              >
                <span className="mt-0.5 text-blue-500">{index + 1}.</span>
                <span className="text-sm text-zinc-700">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decisions - HIGHLIGHTED */}
      {meetingData?.decisions && meetingData.decisions.length > 0 && (
        <div className="rounded-xl border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-green-900">
            <span className="text-xl">✅</span>
            决策项
          </h2>
          <ul className="space-y-2">
            {meetingData.decisions.map((decision, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-lg bg-white p-3 shadow-sm"
              >
                <span className="mt-0.5 text-green-600">✓</span>
                <span className="text-sm font-medium text-zinc-800">{decision}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items */}
      {meetingData?.actionItems && meetingData.actionItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-900">
            <span>⚡</span>
            行动项
          </h2>
          <div className="space-y-2">
            {meetingData.actionItems.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-amber-200 bg-white p-3"
              >
                <div className="mb-2 text-sm font-medium text-zinc-800">
                  {item.task}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {item.assignee && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                      👤 {item.assignee}
                    </span>
                  )}
                  {item.deadline && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                      ⏰ {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Questions */}
      {meetingData?.pendingQuestions && meetingData.pendingQuestions.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-orange-900">
            <span>❓</span>
            待确认问题
          </h2>
          <ul className="space-y-2">
            {meetingData.pendingQuestions.map((question, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-0.5 text-orange-500">?</span>
                <span className="text-sm text-orange-800">{question}</span>
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
              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
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
