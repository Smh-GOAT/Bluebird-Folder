"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GenerateSummaryModal } from "@/components/home/generate-summary-modal";
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const canParse = useMemo(() => url.includes("bilibili.com") || url.includes("b23.tv"), [url]);

  const handleParse = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const parseResponse = await fetch("/api/video/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const parseResult = (await parseResponse.json()) as {
        code: number;
        data: ParseVideoResponseData;
        message: string;
      };
      if (parseResult.code !== 0) {
        throw new Error(parseResult.message);
      }
      setParsedData(parseResult.data);
      onParsed?.();

      const transcriptResponse = await fetch("/api/transcript/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const transcriptResult = (await transcriptResponse.json()) as {
        code: number;
        data: TranscriptFetchResponseData;
        message: string;
      };
      if (transcriptResult.code !== 0) {
        throw new Error(transcriptResult.message);
      }
      setSegments(transcriptResult.data.segments);
      setSubtitleSource(transcriptResult.data.subtitleSource);
    } catch (error) {
      setParsedData(null);
      setSegments([]);
      setSubtitleSource(null);
      setErrorMessage(error instanceof Error ? error.message : "解析失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className={`ui-panel transition-all duration-500 ${centered ? "w-full max-w-2xl p-8" : "p-6"}`}>
        <h1 className={`font-bold tracking-tight text-zinc-900 ${centered ? "text-center text-3xl" : "text-2xl"}`}>
          Bluebird Folder
        </h1>
        <p className={`mt-2 leading-6 text-zinc-600 ${centered ? "text-center text-base" : "text-sm"}`}>
          粘贴 B站 链接，先解析字幕与转写，再进入总结流程
        </p>

        <div className={`mt-6 ${centered ? "space-y-3" : "flex flex-col gap-2 lg:flex-row"}`}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="例如：https://www.bilibili.com/video/BV1..."
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none transition-all focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
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

        {!canParse && url ? (
          <p className="mt-3 text-center text-xs text-amber-700">Milestone 1 当前仅支持 bilibili.com / b23.tv 链接</p>
        ) : null}

        {errorMessage ? <p className="mt-3 text-xs text-rose-600">{errorMessage}</p> : null}

        {parsedData ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 text-sm">
            <p className="font-medium text-zinc-900">{parsedData.meta.title}</p>
            <p className="mt-1 text-sm text-zinc-600">
              平台：{parsedData.meta.platform.toUpperCase()} · 作者：{parsedData.meta.author} · 时长：{parsedData.meta.duration}s
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              字幕来源：{subtitleSource ?? (parsedData.hasNativeSubtitle ? "native(待获取)" : "asr(待获取)")} · 片段数：
              {segments.length}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              半自动流程：解析完成后由你点击“生成总结”才触发生成并入库。
            </p>
            {segments.length ? (
              <div className="mt-3 max-h-44 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2">
                {segments.slice(0, 20).map((segment) => (
                  <p key={`${segment.start}-${segment.end}-${segment.text}`} className="text-xs text-zinc-700">
                    [{segment.start.toFixed(1)}-{segment.end.toFixed(1)}] {segment.text}
                  </p>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="ui-btn-primary mt-4 px-6 py-2.5"
              disabled={!segments.length}
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
          const id = createDemoId();
          const query = new URLSearchParams({
            template: values.template,
            language: values.language,
            detail: values.detail,
            showTimestamp: String(values.showTimestamp),
            showEmoji: String(values.showEmoji)
          });
          setOpenModal(false);
          router.push(`/summary/${id}?${query.toString()}`);
        }}
      />
    </>
  );
}
