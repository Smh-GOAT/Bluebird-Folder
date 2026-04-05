"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/forsion/fetch";
import { ExportActions } from "@/components/summary/export-actions";
import { RightPanelTabs } from "@/components/summary/right-panel-tabs";
import { GenerateStatus } from "@/components/summary/generate-status";
import { QAChatPanel } from "@/components/summary/qa-chat-panel";
import { VideoPlayer } from "@/components/video/video-player";
import { PlayerPlaceholder } from "@/components/video/player-placeholder";
import { VideoTimeProvider } from "@/components/summary/video-time-context";
import { GenerateSummaryModal } from "@/components/home/generate-summary-modal";
import { getSummaryPreferences } from "@/lib/summary-preferences";
import { useResizable } from "@/hooks/use-resizable";
import { ResizeHandle } from "@/components/layout/resize-handle";
import type { VideoHistoryItem, SubtitleReference } from "@/types";
import type { SummaryDetailLevel, SummaryStructured, SummaryTemplate } from "@/types/summary";

interface VideoDetailViewProps {
  historyId: string;
}

export function VideoDetailView({ historyId }: VideoDetailViewProps) {
  const [history, setHistory] = useState<VideoHistoryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<SummaryTemplate>("general");
  const [showResummarizeModal, setShowResummarizeModal] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const prefs = getSummaryPreferences();
    setCurrentTemplate(prefs.template);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const response = await authFetch(`/api/history/${historyId}`, { cache: "no-store" });
      if (!response.ok) return;
      const result = (await response.json()) as { code: number; data: VideoHistoryItem };
      if (result.code === 0) {
        setHistory(result.data);
      }
    } catch (error) {
      console.error("[video-detail] load history failed", error);
    }
  }, [historyId]);

  const generateSummary = useCallback(
    async (opts?: { template?: SummaryTemplate; force?: boolean }) => {
      if (!history) return;

      const prefs = getSummaryPreferences();
      const template = opts?.template ?? currentTemplate;

      setIsGenerating(true);
      setGenerateError(null);

      try {
        const response = await authFetch("/api/summary/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            historyId,
            template,
            language: prefs.language,
            detail: prefs.detail,
            showTimestamp: prefs.showTimestamp,
            showEmoji: prefs.showEmoji,
            force: opts?.force ?? false,
          }),
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
              ? { ...prev, summaryJson: result.data!.summaryJson, summaryMarkdown: result.data!.summaryMarkdown }
              : null
          );
          setCurrentTemplate(template);
        } else {
          setGenerateError(result.message ?? "生成总结失败");
        }
      } catch (error) {
        setGenerateError(error instanceof Error ? error.message : "生成总结失败");
      } finally {
        setIsGenerating(false);
      }
    },
    [history, historyId, currentTemplate]
  );

  // Load history on mount / id change
  useEffect(() => {
    setHistory(null);
    setHasChecked(false);
    setGenerateError(null);
    setIsGenerating(false);

    let disposed = false;
    (async () => {
      await loadHistory();
      if (!disposed) setHasChecked(true);
    })();
    return () => { disposed = true; };
  }, [loadHistory]);

  // Auto-generate summary if missing
  useEffect(() => {
    if (!hasChecked || !history) return;
    const hasSummary = history.summaryJson && history.summaryMarkdown;
    if (!hasSummary && !isGenerating && !generateError) {
      generateSummary();
    }
  }, [hasChecked, history, isGenerating, generateError, generateSummary]);

  const handleReferenceClick = (_ref: SubtitleReference) => {
    // handled by VideoTimeProvider
  };

  const isLoading = isGenerating;

  const leftCol = useResizable({
    storageKey: "detail-left-w",
    defaultSize: 440,
    min: 320,
    max: 700,
    direction: "horizontal",
  });

  const videoHeight = useResizable({
    storageKey: "detail-video-h",
    defaultSize: 280,
    min: 160,
    max: 600,
    direction: "vertical",
  });

  return (
    <>
      <VideoTimeProvider>
        {/* Top bar: title + actions */}
        <div
          className="mb-3 flex flex-wrap items-center justify-between gap-2 ui-panel px-4 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <h2
              className="truncate text-base font-semibold lg:text-lg"
              style={{ color: "var(--text)" }}
            >
              {history?.title ?? "加载中..."}
            </h2>
            {history && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {history.platform?.toUpperCase()} · {history.author} · {history.duration}s
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResummarizeModal(true)}
              className="ui-btn-secondary px-3 py-1.5 text-xs"
              disabled={isLoading}
            >
              重新总结
            </button>
            <ExportActions history={history} />
          </div>
        </div>

        {/* Two-column content */}
        <div className="flex min-h-[calc(100vh-12rem)]">
          {/* Left: Video + QA */}
          <section
            className="ui-panel flex flex-col gap-3 p-3.5 lg:p-4"
            style={{ width: leftCol.size, flexShrink: 0 }}
          >
            <div className="ui-block flex flex-col p-3" style={{ height: videoHeight.size }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                视频播放器
              </h3>
              <div className="mt-2.5 flex-1 overflow-hidden">
                {history?.videoUrl ? (
                  <VideoPlayer videoUrl={history.videoUrl} platform={history.platform} />
                ) : (
                  <PlayerPlaceholder platform={history?.platform} videoId={history?.videoId} />
                )}
              </div>
            </div>
            <ResizeHandle direction="vertical" handleProps={videoHeight.handleProps} />
            <div className="ui-block flex min-h-0 flex-1 flex-col p-3">
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--text)" }}>
                AI 问答
              </h3>
              <div className="flex-1 overflow-hidden">
                <QAChatPanel historyId={historyId} onReferenceClick={handleReferenceClick} />
              </div>
            </div>
          </section>

          <ResizeHandle direction="horizontal" handleProps={leftCol.handleProps} />

          {/* Right: Summary / Transcript */}
          <aside className="min-w-0 flex-1 self-start lg:sticky lg:top-3 lg:h-[calc(100vh-12rem)]">
            {isLoading || generateError ? (
              <GenerateStatus
                isGenerating={isLoading}
                error={generateError}
                onRetry={() => generateSummary()}
              />
            ) : (
              <RightPanelTabs
                subtitles={history?.subtitlesArray}
                translatedSubtitles={history?.translatedSubtitles}
                summaryMarkdown={history?.summaryMarkdown}
                summaryJson={history?.summaryJson}
                summaryTemplate={currentTemplate}
                summaryDetail={getSummaryPreferences().detail as SummaryDetailLevel}
              />
            )}
          </aside>
        </div>
      </VideoTimeProvider>

      {/* Re-summarize modal */}
      <GenerateSummaryModal
        open={showResummarizeModal}
        onClose={() => setShowResummarizeModal(false)}
        onConfirm={(values) => {
          setShowResummarizeModal(false);
          generateSummary({ template: values.template, force: true });
        }}
      />
    </>
  );
}
