"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GenerateSummaryModal } from "@/components/home/generate-summary-modal";
import { authFetch } from "@/lib/forsion/fetch";
import type { ParseVideoResponseData, SubtitleSegment, TranscriptFetchResponseData } from "@/types";

interface LinkInputPanelProps {
  centered?: boolean;
  onParsed?: () => void;
}

function createDemoId() {
  return `demo-${Date.now()}`;
}

export function LinkInputPanel({ centered = false, onParsed }: LinkInputPanelProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [parsedData, setParsedData] = useState<ParseVideoResponseData | null>(null);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [subtitleSource, setSubtitleSource] = useState<"native" | "asr" | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parseStep, setParseStep] = useState<"idle" | "parsing" | "downloading" | "transcribing" | "saving">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const canParse = useMemo(
    () =>
      url.includes("bilibili.com") ||
      url.includes("b23.tv") ||
      url.includes("xiaohongshu.com") ||
      url.includes("xhslink.com"),
    [url]
  );

  const handleParse = async () => {
    setIsLoading(true);
    setParseStep("parsing");
    setErrorMessage("");
    setParsedData(null);
    setSegments([]);
    setSubtitleSource(null);
    setHistoryId(null);

    try {
      // Step 1: Parse video metadata
      const parseResponse = await authFetch("/api/video/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const parseResult = (await parseResponse.json()) as {
        code: number;
        data: ParseVideoResponseData;
        message: string;
      };
      if (parseResult.code !== 0) throw new Error(parseResult.message);
      setParsedData(parseResult.data);
      onParsed?.();

      // Step 2: Download & transcribe
      setParseStep(parseResult.data.hasNativeSubtitle ? "downloading" : "transcribing");
      const transcriptResponse = await authFetch("/api/transcript/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const transcriptResult = (await transcriptResponse.json()) as {
        code: number;
        data: TranscriptFetchResponseData;
        message: string;
      };
      if (transcriptResult.code !== 0) throw new Error(transcriptResult.message);

      // Step 3: Saving
      setParseStep("saving");
      setSegments(transcriptResult.data.segments);
      setSubtitleSource(transcriptResult.data.subtitleSource);
      setHistoryId(transcriptResult.data.historyId ?? null);
    } catch (error) {
      setParsedData(null);
      setSegments([]);
      setSubtitleSource(null);
      setHistoryId(null);
      setErrorMessage(error instanceof Error ? error.message : "解析失败");
    } finally {
      setIsLoading(false);
      setParseStep("idle");
    }
  };

  return (
    <>
      <section className={`ui-panel animate-fade-up transition-all duration-500 ${centered ? "w-full max-w-2xl p-8" : "p-6"}`}>
        <h1
          className={`font-bold tracking-tight ${centered ? "text-center text-3xl" : "text-2xl"}`}
          style={{ color: "var(--text)" }}
        >
          Bluebird Folder
        </h1>
        <p
          className={`mt-2 leading-6 ${centered ? "text-center text-base" : "text-sm"}`}
          style={{ color: "var(--text-muted)" }}
        >
          粘贴 B站 / 小红书链接，先解析字幕与转写，再进入总结流程
        </p>

        <div className={`mt-6 ${centered ? "space-y-3" : "flex flex-col gap-2 lg:flex-row"}`}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && canParse && !isLoading) handleParse(); }}
            placeholder="例如：https://www.bilibili.com/video/BV1..."
            className="ui-input px-4 py-3 text-base"
          />
          <button
            type="button"
            onClick={handleParse}
            disabled={!canParse || isLoading}
            className={`ui-btn-primary whitespace-nowrap font-medium ${centered ? "w-full py-3 text-base" : "px-6 py-2.5"}`}
          >
            {isLoading ? "解析中..." : "开始解析"}
          </button>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3">
              {/* Progress bar */}
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full"
                style={{ background: "var(--border-sub)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    background: "var(--primary)",
                    width:
                      parseStep === "parsing" ? "25%" :
                      parseStep === "downloading" || parseStep === "transcribing" ? "60%" :
                      parseStep === "saving" ? "90%" : "0%",
                  }}
                />
              </div>
              {/* Spinner */}
              <svg
                className="h-4 w-4 animate-spin"
                style={{ color: "var(--primary)" }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {parseStep === "parsing" && "正在解析视频信息..."}
              {parseStep === "downloading" && "正在获取原生字幕..."}
              {parseStep === "transcribing" && "正在下载音频并转录字幕（可能需要几分钟）..."}
              {parseStep === "saving" && "正在保存..."}
            </p>
          </div>
        ) : null}

        {!canParse && url ? (
          <p className="mt-3 text-center text-xs text-amber-700">
            当前支持 bilibili.com / b23.tv / xiaohongshu.com / xhslink.com 链接
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 text-xs text-rose-600">{errorMessage}</p>
        ) : null}

        {parsedData ? (
          <div
            className="mt-6 rounded-t-sm p-5 text-sm"
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface-sub)",
            }}
          >
            <p className="font-medium" style={{ color: "var(--text)" }}>
              {parsedData.meta.title}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-sec)" }}>
              平台：{parsedData.meta.platform.toUpperCase()} · 作者：{parsedData.meta.author} · 时长：{parsedData.meta.duration}s
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              字幕来源：{subtitleSource ?? (parsedData.hasNativeSubtitle ? "native(待获取)" : "asr(待获取)")} · 片段数：{segments.length}
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              解析完成后，点击「生成总结」才触发生成并入库。
            </p>
            {segments.length ? (
              <div
                className="mt-3 max-h-44 space-y-1 overflow-y-auto p-2"
                style={{
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-sub)",
                  background: "var(--surface)",
                }}
              >
                {segments.slice(0, 20).map((segment) => (
                  <p
                    key={`${segment.start}-${segment.end}-${segment.text}`}
                    className="text-xs"
                    style={{ color: "var(--text-sec)" }}
                  >
                    [{segment.start.toFixed(1)}-{segment.end.toFixed(1)}] {segment.text}
                  </p>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="ui-btn-primary mt-4 px-6 py-2.5"
              disabled={!segments.length || !historyId}
            >
              生成总结
            </button>
          </div>
        ) : null}
      </section>

      <GenerateSummaryModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={(values) => {
          const id = historyId ?? createDemoId();
          const query = new URLSearchParams({
            template: values.template,
            language: values.language,
            detail: values.detail,
            showTimestamp: String(values.showTimestamp),
            showEmoji: String(values.showEmoji),
            translateSubtitles: String(values.translateSubtitles),
            subtitleTargetLanguage: values.subtitleTargetLanguage,
            ...(values.modelId ? { modelId: values.modelId } : {}),
          });
          setOpenModal(false);
          router.push(`/summary/${id}?${query.toString()}`);
        }}
      />
    </>
  );
}
