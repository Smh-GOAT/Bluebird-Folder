"use client";

import { useState } from "react";
import { mockSubtitle, mockSummaryJson, mockSummaryMarkdown } from "@/lib/mock-data";

export function RightPanelTabs() {
  const [tab, setTab] = useState<"summary" | "transcript">("summary");

  return (
    <section className="ui-panel-elevated flex h-full min-h-[560px] flex-col p-3.5 lg:min-h-0 lg:p-4">
      <div className="shrink-0 border-b border-zinc-100 pb-2.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("summary")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === "summary" ? "bg-zinc-900 text-white shadow-sm" : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            总结
          </button>
          <button
            type="button"
            onClick={() => setTab("transcript")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === "transcript" ? "bg-zinc-900 text-white shadow-sm" : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            原文细读
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">右侧为主阅读区：优先阅读 Markdown，JSON 仅作结构辅助。</p>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {tab === "summary" ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-2.5">
              <p className="mb-1 text-xs text-zinc-600">结构化 JSON（辅助）</p>
              <pre className="max-h-40 overflow-auto rounded-lg bg-zinc-900 p-2 text-xs leading-5 text-zinc-100">
                {JSON.stringify(mockSummaryJson, null, 2)}
              </pre>
            </div>
            <article className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-[15px] leading-7 whitespace-pre-wrap">
              {mockSummaryMarkdown}
            </article>
          </div>
        ) : (
          <div className="space-y-2.5 text-sm">
            {mockSubtitle.map((seg, index) => (
              <p key={index} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5">
                <span className="mr-2 text-xs text-zinc-500">
                  {seg.start}s - {seg.end}s
                </span>
                {seg.text}
              </p>
            ))}
            <div className="rounded-xl border border-zinc-200 p-2.5 text-xs text-zinc-600">
              字幕编辑与 SRT/TXT 导出将在 Milestone 5 接入真实处理流程。
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
