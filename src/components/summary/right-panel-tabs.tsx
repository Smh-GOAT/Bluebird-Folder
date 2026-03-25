"use client";

import { useState } from "react";
import type { SubtitleSegment, SubtitleTranslation } from "@/types";
import type { SummaryDetailLevel, SummaryStructured, SummaryTemplate } from "@/types/summary";
import { SummaryDisplay } from "./summary-display";
import { SubtitleTranslationToggle } from "./subtitle-translation-toggle";
import { SubtitleEditor } from "./subtitle-editor";
import { TimestampButton } from "./timestamp-button";
import { formatTimeShort } from "@/lib/utils/time";

interface RightPanelTabsProps {
  subtitles?: SubtitleSegment[];
  translatedSubtitles?: SubtitleTranslation[];
  summaryMarkdown?: string | null;
  summaryJson?: SummaryStructured | null;
  summaryTemplate?: SummaryTemplate | string | null;
  summaryDetail?: SummaryDetailLevel;
}

export function RightPanelTabs({ 
  subtitles, 
  translatedSubtitles,
  summaryMarkdown, 
  summaryJson,
  summaryTemplate,
  summaryDetail
}: RightPanelTabsProps) {
  const [tab, setTab] = useState<"summary" | "transcript">("summary");
  const [showTranslated, setShowTranslated] = useState(!!translatedSubtitles);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubtitles, setEditedSubtitles] = useState<SubtitleSegment[] | null>(null);

  const hasSummary = summaryJson || summaryMarkdown;
  const hasTranslation = !!translatedSubtitles && translatedSubtitles.length > 0;

  const displaySubtitles = showTranslated && translatedSubtitles
    ? translatedSubtitles.map((t) => ({
        start: t.start,
        end: t.end,
        text: t.translatedText
      }))
    : subtitles;

  return (
    <section className="ui-panel-elevated flex h-full min-h-[560px] flex-col p-3.5 lg:min-h-0 lg:p-4">
      <div className="shrink-0 border-b border-zinc-100 pb-2.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("summary")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === "summary"
                ? "bg-zinc-900 text-white shadow-sm"
                : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            总结
          </button>
          <button
            type="button"
            onClick={() => setTab("transcript")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === "transcript"
                ? "bg-zinc-900 text-white shadow-sm"
                : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            原文细读
          </button>
          {tab === "transcript" && (displaySubtitles?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`ml-auto rounded-md px-3 py-1.5 text-sm ${
                isEditing 
                  ? "bg-zinc-100 text-zinc-700" 
                  : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {isEditing ? "完成" : "编辑"}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {hasSummary ? "右侧为主阅读区：优先阅读 Markdown，JSON 仅作结构辅助。" : "暂无总结，请先生成总结。"}
        </p>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {tab === "summary" ? (
          hasSummary ? (
            <SummaryDisplay
              summaryJson={summaryJson}
              summaryMarkdown={summaryMarkdown}
              summaryTemplate={summaryTemplate}
              summaryDetail={summaryDetail}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <svg
                className="h-12 w-12 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <p className="mt-3 text-sm text-zinc-600"></p>
            </div>
          )
        ) : (
          isEditing ? (
            <SubtitleEditor
              subtitles={displaySubtitles || []}
              onSave={(newSubtitles) => {
                setEditedSubtitles(newSubtitles);
                setIsEditing(false);
                console.log("Saving subtitles:", newSubtitles);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-2.5 text-sm">
              {hasTranslation && (
                <SubtitleTranslationToggle
                  originalSubtitles={subtitles ?? []}
                  translatedSubtitles={translatedSubtitles}
                  onToggle={setShowTranslated}
                />
              )}
              {displaySubtitles?.map((seg, index) => (
                <div key={index} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5">
                  <div className="mb-1 flex items-center gap-2">
                    <TimestampButton time={seg.start} format="short" />
                    <span className="text-xs text-zinc-400">-</span>
                    <span className="text-xs text-zinc-400">{formatTimeShort(seg.end)}</span>
                  </div>
                  <p className="text-sm">{seg.text}</p>
                </div>
              ))}
              {(!displaySubtitles || displaySubtitles.length === 0) && (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-8 text-center">
                  <p className="text-sm text-zinc-500">暂无字幕数据</p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}
