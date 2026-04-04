"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/forsion/fetch";
import { useSearchParams } from "next/navigation";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { ExportActions } from "@/components/summary/export-actions";
import { RightPanelTabs } from "@/components/summary/right-panel-tabs";
import { GenerateStatus } from "@/components/summary/generate-status";
import { QAChatPanel } from "@/components/summary/qa-chat-panel";
import { VideoPlayer } from "@/components/video/video-player";
import { PlayerPlaceholder } from "@/components/video/player-placeholder";
import { VideoTimeProvider } from "@/components/summary/video-time-context";
import { ModeToggle } from "@/components/layout/theme-selector";
import type { VideoHistoryItem, SubtitleReference } from "@/types";
import type { SummaryDetailLevel, SummaryStructured } from "@/types/summary";

interface SummaryShellProps {
  summaryId: string;
}

export function SummaryShell({ summaryId }: SummaryShellProps) {
  const searchParams = useSearchParams();
  const [history, setHistory] = useState<VideoHistoryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [translateSubtitles, setTranslateSubtitles] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const template = searchParams.get("template") ?? "default";
  const language = searchParams.get("language") ?? "zh";
  const detail = (searchParams.get("detail") as SummaryDetailLevel) ?? "standard";
  const showTimestamp = searchParams.get("showTimestamp") !== "false";
  const showEmoji = searchParams.get("showEmoji") !== "false";
  const shouldTranslate = searchParams.get("translateSubtitles") === "true";
  const subtitleTargetLanguage = searchParams.get("subtitleTargetLanguage") ?? "zh";
  const modelId = searchParams.get("modelId") ?? undefined;

  const loadHistory = useCallback(async () => {
    try {
      const response = await authFetch(`/api/history/${summaryId}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const result = (await response.json()) as {
        code: number;
        data: VideoHistoryItem;
      };
      if (result.code === 0) {
        setHistory(result.data);
      }
    } catch (error) {
      console.error("[summary-shell] load history failed", error);
    }
  }, [summaryId]);

  const translateSubtitlesIfNeeded = useCallback(async () => {
    if (!history || !shouldTranslate || history.translatedSubtitles) return;
    if (!history.subtitlesArray || history.subtitlesArray.length === 0) return;
    if (translateSubtitles) return;

    setTranslateSubtitles(true);
    setTranslateError(null);
    
    try {
      const response = await authFetch("/api/subtitles/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historyId: summaryId,
          subtitles: history.subtitlesArray,
          options: {
            targetLanguage: subtitleTargetLanguage,
            preserveTimestamps: true
          }
        })
      });

      const result = await response.json();
      
      if (result.code === 0 && result.data?.translations) {
        setHistory(prev => prev ? { ...prev, translatedSubtitles: result.data.translations } : null);
      } else {
        const errorMsg = result.message || "字幕翻译失败";
        setTranslateError(errorMsg);
        console.error("[summary-shell] translate failed:", errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "字幕翻译请求失败";
      setTranslateError(errorMsg);
      console.error("[summary-shell] translate subtitles failed", error);
    } finally {
      setTranslateSubtitles(false);
    }
  }, [history, shouldTranslate, summaryId, subtitleTargetLanguage, translateSubtitles]);

  const generateSummary = useCallback(async () => {
    if (!history) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await authFetch("/api/summary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historyId: summaryId,
          template,
          language,
          detail,
          showTimestamp,
          showEmoji,
          modelId,
        })
      });

      const result = (await response.json()) as {
        code: number;
        data?: {
          summaryJson: SummaryStructured;
          summaryMarkdown: string;
          cached?: boolean;
        };
        message: string;
      };

      if (result.code === 0 && result.data) {
        setHistory((prev) =>
          prev
            ? {
                ...prev,
                summaryJson: result.data!.summaryJson,
                summaryMarkdown: result.data!.summaryMarkdown
              }
            : null
        );
      } else {
        setGenerateError(result.message ?? "生成总结失败");
      }
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "生成总结失败");
    } finally {
      setIsGenerating(false);
    }
  }, [history, summaryId, template, language, detail, showTimestamp, showEmoji]);

  useEffect(() => {
    let disposed = false;

    async function init() {
      await loadHistory();
      if (!disposed) {
        setHasChecked(true);
      }
    }

    init();

    return () => {
      disposed = true;
    };
  }, [loadHistory]);

  useEffect(() => {
    if (!hasChecked || !history) return;

    const hasSummary = history.summaryJson && history.summaryMarkdown;
    if (!hasSummary && !isGenerating && !generateError) {
      generateSummary();
    }
  }, [hasChecked, history, isGenerating, generateError, generateSummary]);

  useEffect(() => {
    if (hasChecked && history && shouldTranslate && !history.translatedSubtitles && !translateError) {
      translateSubtitlesIfNeeded();
    }
  }, [hasChecked, history, shouldTranslate, translateSubtitlesIfNeeded, translateError]);

  const handleReferenceClick = (ref: SubtitleReference) => {
    console.log("[summary-shell] reference clicked:", ref);
  };

  const isLoading = isGenerating || translateSubtitles;
  const currentError = generateError || translateError;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="mx-auto w-[96vw] max-w-[1760px] space-y-3 px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
        <header className="ui-panel px-4 py-2.5 lg:px-5 lg:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link
                href="/"
                className="ui-btn-secondary inline-flex h-8 items-center gap-1.5 px-3 text-[13px] font-medium"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M11.78 4.22a.75.75 0 010 1.06L8.06 9h7.19a.75.75 0 010 1.5H8.06l3.72 3.72a.75.75 0 11-1.06 1.06l-5-5a.75.75 0 010-1.06l5-5a.75.75 0 011.06 0z"
                    clipRule="evenodd"
                  />
                </svg>
                新总结
              </Link>
              <div className="min-w-0">
                <h1
                  className="truncate text-lg font-semibold lg:text-xl"
                  style={{ color: "var(--text)" }}
                >
                  {history?.title ?? "视频总结"}
                </h1>
                <p className="text-xs lg:text-sm" style={{ color: "var(--text-muted)" }}>
                  ID: {summaryId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ExportActions history={history} />
              <ModeToggle />
            </div>
          </div>
        </header>

        <VideoTimeProvider>
          <div className="grid min-h-[calc(100vh-8.5rem)] grid-cols-1 gap-4 lg:grid-cols-[220px_400px_minmax(680px,1fr)] xl:grid-cols-[220px_440px_minmax(720px,1fr)]">
            <HomeSidebar compact />

            <section className="ui-panel space-y-3 p-3.5 lg:p-4">
              <div className="ui-block p-3">
                <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>视频播放器</h2>
                <div className="mt-2.5">
                  {history?.videoUrl ? (
                    <VideoPlayer
                      videoUrl={history.videoUrl}
                      platform={history.platform}
                    />
                  ) : (
                    <PlayerPlaceholder
                      platform={history?.platform}
                      videoId={history?.videoId}
                    />
                  )}
                </div>
              </div>
              <div className="ui-block flex flex-col p-3" style={{ height: "400px" }}>
                <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text)" }}>AI 问答</h2>
                <div className="flex-1 overflow-hidden">
                  <QAChatPanel
                    historyId={summaryId}
                    onReferenceClick={handleReferenceClick}
                  />
                </div>
              </div>
            </section>

            <aside className="self-start lg:sticky lg:top-3 lg:h-[calc(100vh-7rem)]">
              {isLoading || currentError ? (
                <GenerateStatus
                  isGenerating={isLoading}
                  error={currentError}
                  onRetry={generateError ? generateSummary : translateSubtitlesIfNeeded}
                />
              ) : (
                <RightPanelTabs
                  subtitles={history?.subtitlesArray}
                  translatedSubtitles={history?.translatedSubtitles}
                  summaryMarkdown={history?.summaryMarkdown}
                  summaryJson={history?.summaryJson}
                  summaryTemplate={template}
                  summaryDetail={detail}
                />
              )}
            </aside>
          </div>
        </VideoTimeProvider>
      </div>
    </main>
  );
}
