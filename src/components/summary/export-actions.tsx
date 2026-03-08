"use client";

import { useState } from "react";
import { mockSummaryJson, mockSummaryMarkdown } from "@/lib/mock-data";

export function ExportActions() {
  const [showDropdown, setShowDropdown] = useState(false);

  function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    alert(`${label} 已复制到剪贴板`);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className="ui-btn-primary px-3 py-1.5 text-sm"
        onClick={() => copyText(mockSummaryMarkdown, "Markdown")}
      >
        <span className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
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
            下载
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {showDropdown ? (
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
              onClick={() => {
                downloadFile("summary.md", mockSummaryMarkdown, "text/markdown");
                setShowDropdown(false);
              }}
            >
              下载 Markdown
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
              onClick={() => {
                downloadFile("summary.json", JSON.stringify(mockSummaryJson, null, 2), "application/json");
                setShowDropdown(false);
              }}
            >
              下载 JSON
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
              onClick={() => {
                copyText(JSON.stringify(mockSummaryJson, null, 2), "JSON");
                setShowDropdown(false);
              }}
            >
              复制 JSON
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
