"use client";

import { useState } from "react";
import { mockSubtitle, mockSummaryJson, mockSummaryMarkdown } from "@/lib/mock-data";

export function RightPanelTabs() {
  const [tab, setTab] = useState<"summary" | "transcript">("summary");

  return (
    <section className="ui-panel space-y-3 p-3">
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

      {tab === "summary" ? (
        <div className="space-y-2">
          <p className="text-xs text-zinc-600">两段式输出：先 JSON，再 Markdown</p>
          <pre className="overflow-auto rounded-xl bg-zinc-900 p-3 text-xs leading-5 text-zinc-100">
            {JSON.stringify(mockSummaryJson, null, 2)}
          </pre>
          <article className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-sm whitespace-pre-wrap">
            {mockSummaryMarkdown}
          </article>
        </div>
      ) : (
        <div className="max-h-[480px] space-y-2 overflow-auto text-sm">
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
    </section>
  );
}
