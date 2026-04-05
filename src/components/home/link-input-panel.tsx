"use client";

import { useMemo, useState } from "react";
import { useAnalysisQueue } from "@/lib/analysis-queue-context";

export function LinkInputPanel() {
  const [url, setUrl] = useState("");
  const { addUrl } = useAnalysisQueue();

  const canParse = useMemo(
    () =>
      url.includes("bilibili.com") ||
      url.includes("b23.tv") ||
      url.includes("xiaohongshu.com") ||
      url.includes("xhslink.com"),
    [url]
  );

  const handleSubmit = () => {
    if (!canParse) return;
    addUrl(url);
    setUrl("");
  };

  return (
    <section className="ui-panel p-8 animate-fade-up">
      <h1
        className="text-center text-3xl font-bold tracking-tight"
        style={{ color: "var(--text)" }}
      >
        Bluebird Folder
      </h1>
      <p
        className="mt-2 text-center text-base leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        粘贴视频链接，自动解析字幕并生成 AI 总结
      </p>

      <div className="mt-6 space-y-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canParse) handleSubmit();
          }}
          placeholder="例如：https://www.bilibili.com/video/BV1..."
          className="ui-input px-4 py-3 text-base"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canParse}
          className="ui-btn-primary w-full py-3 text-base font-medium"
        >
          添加到分析队列
        </button>
      </div>

      {!canParse && url ? (
        <p className="mt-3 text-center text-xs text-amber-700">
          当前支持 bilibili.com / b23.tv / xiaohongshu.com / xhslink.com 链接
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-center gap-6 text-xs" style={{ color: "var(--text-subtle)" }}>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          自动提取字幕
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />
          AI 智能总结
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          一键导出
        </span>
      </div>
    </section>
  );
}
