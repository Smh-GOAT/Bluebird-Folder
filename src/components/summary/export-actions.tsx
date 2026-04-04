"use client";

import { useState } from "react";
import type { VideoHistoryItem } from "@/types";
import { toSRT, toTXT } from "@/lib/utils/subtitle-export";

interface ExportActionsProps {
  history?: VideoHistoryItem | null;
}

export function ExportActions({ history }: ExportActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(false);

  function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} 已复制到剪贴板`);
    } catch {
      alert("复制失败，请手动复制");
    }
  }

  const safeFilename = history?.title
    ? history.title.replace(/[^\w\u4e00-\u9fa5]/g, "_").slice(0, 50)
    : "export";

  const subtitles = history?.subtitlesArray || [];
  const translatedSubtitles = history?.translatedSubtitles;

  const exportSubtitles = translatedSubtitles?.length
    ? translatedSubtitles.map((t) => ({
        start: t.start,
        end: t.end,
        text: t.translatedText,
      }))
    : subtitles;

  const exportSRT = () => {
    if (!exportSubtitles.length) {
      alert("没有可导出的字幕");
      return;
    }
    const content = toSRT(exportSubtitles);
    downloadFile(`${safeFilename}.srt`, content, "text/plain");
  };

  const exportTXT = () => {
    if (!exportSubtitles.length) {
      alert("没有可导出的字幕");
      return;
    }
    const content = toTXT(exportSubtitles, includeTimestamps);
    downloadFile(`${safeFilename}.txt`, content, "text/plain");
  };

  const exportMarkdown = () => {
    const content = history?.summaryMarkdown || "# 无总结内容\n";
    downloadFile(`${safeFilename}.md`, content, "text/markdown");
  };

  const exportJSON = () => {
    const exportData = {
      meta: {
        title: history?.title,
        platform: history?.platform,
        author: history?.author,
        duration: history?.duration,
        exportedAt: new Date().toISOString(),
      },
      summary: history?.summaryJson,
      subtitles: history?.subtitlesArray,
      translatedSubtitles: history?.translatedSubtitles,
    };
    const content = JSON.stringify(exportData, null, 2);
    downloadFile(`${safeFilename}.json`, content, "application/json");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="ui-btn-primary px-3 py-1.5 text-sm"
        onClick={() => copyText(history?.summaryMarkdown || "", "Markdown")}
        disabled={!history?.summaryMarkdown}
      >
        <span className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          复制 Markdown
        </span>
      </button>

      <div className="relative">
        <button
          type="button"
          className="ui-btn-secondary px-2.5 py-1.5 text-sm"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          <span className="flex items-center gap-1">
            导出
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {showDropdown && (
          <div
            className="absolute right-0 z-20 mt-1 w-56 py-1 shadow-panel"
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors disabled:opacity-50"
              style={{ color: "var(--text-sec)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => {
                exportSRT();
                setShowDropdown(false);
              }}
              disabled={!exportSubtitles.length}
            >
              <span>📝</span>
              导出 SRT 字幕
            </button>

            <div
              className="px-4 py-2 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 text-left text-sm disabled:opacity-50"
                style={{ color: "var(--text-sec)" }}
                onClick={() => {
                  exportTXT();
                  setShowDropdown(false);
                }}
                disabled={!exportSubtitles.length}
              >
                <span>📄</span>
                导出 TXT 文本
              </button>
              <label className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                包含时间戳
              </label>
            </div>

            <div className="mx-2 my-1 h-px" style={{ background: "var(--border-sub)" }} />

            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
              style={{ color: "var(--text-sec)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { exportMarkdown(); setShowDropdown(false); }}
            >
              <span>📋</span>
              导出 Markdown
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
              style={{ color: "var(--text-sec)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { exportJSON(); setShowDropdown(false); }}
            >
              <span>🔧</span>
              导出 JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
