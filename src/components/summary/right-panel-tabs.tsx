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
      <div className="shrink-0 pb-2.5" style={{ borderBottom: "1px solid var(--border-sub)" }}>
        <div className="flex gap-2">
          {(["summary", "transcript"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded-t-sm px-3 py-1.5 text-sm transition-all"
              style={
                tab === t
                  ? {
                      background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                      color: "white",
                      border: "none",
                    }
                  : {
                      border: "1px solid var(--border)",
                      color: "var(--text-sec)",
                      background: "transparent",
                    }
              }
            >
              {t === "summary" ? "总结" : "原文细读"}
            </button>
          ))}
          {tab === "transcript" && (displaySubtitles?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto rounded-t-sm px-3 py-1.5 text-sm transition-all"
              style={{
                border: "1px solid var(--border-sub)",
                color: "var(--text-sec)",
                background: isEditing ? "var(--surface-sub)" : "transparent",
              }}
            >
              {isEditing ? "完成" : "编辑"}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
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
            <div className="flex h-full flex-col items-center justify-center p-8 text-center" style={{ border: "1.5px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
              <svg
                className="h-12 w-12"
                style={{ color: "var(--text-subtle)" }}
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
              <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}></p>
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
                <div
                  key={index}
                  className="p-2.5"
                  style={{
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-sub)",
                    background: "var(--surface-sub)",
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <TimestampButton time={seg.start} format="short" />
                    <span className="text-xs" style={{ color: "var(--text-subtle)" }}>-</span>
                    <span className="text-xs" style={{ color: "var(--text-subtle)" }}>{formatTimeShort(seg.end)}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-sec)" }}>{seg.text}</p>
                </div>
              ))}
              {(!displaySubtitles || displaySubtitles.length === 0) && (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center" style={{ border: "1.5px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>暂无字幕数据</p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}
