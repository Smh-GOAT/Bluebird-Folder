"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GenerateSummaryModal } from "@/components/home/generate-summary-modal";
import { mockParsePreview } from "@/lib/mock-data";

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
  const [parsed, setParsed] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const canParse = useMemo(() => url.includes("bilibili.com") || url.includes("youtube.com"), [url]);
  const handleParse = () => {
    setParsed(true);
    onParsed?.();
  };

  return (
    <>
      <section className={`ui-panel transition-all duration-500 ${centered ? "w-full max-w-2xl p-8" : "p-6"}`}>
        <h1 className={`font-bold tracking-tight text-zinc-900 ${centered ? "text-center text-3xl" : "text-2xl"}`}>
          BibiGPT
        </h1>
        <p className={`mt-2 leading-6 text-zinc-600 ${centered ? "text-center text-base" : "text-sm"}`}>
          粘贴 B站 / YouTube 链接，AI 帮你总结视频内容
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
            disabled={!canParse}
            className={`ui-btn-primary whitespace-nowrap font-medium ${centered ? "w-full py-3 text-base" : "px-6 py-2.5"}`}
          >
            开始解析
          </button>
        </div>

        {!canParse && url ? (
          <p className="mt-3 text-center text-xs text-amber-700">当前仅支持 bilibili.com / youtube.com 链接</p>
        ) : null}

        {parsed ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 text-sm">
            <p className="font-medium text-zinc-900">{mockParsePreview.title}</p>
            <p className="mt-1 text-sm text-zinc-600">
              平台：{mockParsePreview.platform.toUpperCase()} · 字幕来源：{mockParsePreview.subtitleSource} · 片段数：
              {mockParsePreview.subtitleCount}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              半自动流程：解析完成后由你点击“生成总结”才触发生成并入库。
            </p>
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="ui-btn-primary mt-4 px-6 py-2.5"
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
