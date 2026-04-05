"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisQueue, type QueueItem } from "@/lib/analysis-queue-context";

function StatusDot({ status }: { status: QueueItem["status"] }) {
  if (status === "completed") {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />;
  }
  if (status === "error") {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />;
  }
  return (
    <span className="h-2 w-2 shrink-0 rounded-full animate-pulse-dot" style={{ background: "var(--primary)" }} />
  );
}

function statusLabel(item: QueueItem) {
  if (item.progressLabel && item.status !== "completed" && item.status !== "error" && item.status !== "pending") {
    return item.progressLabel;
  }
  switch (item.status) {
    case "pending": return "排队中";
    case "parsing": return "解析中";
    case "transcribing": return "转写中";
    case "completed": return "已完成";
    case "error": return "失败";
  }
}

function ProgressBar({ percent }: { percent: number }) {
  if (percent <= 0) return null;
  return (
    <div
      className="mt-1.5 h-1 w-full overflow-hidden rounded-full"
      style={{ background: "var(--border-sub)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.min(100, percent)}%`,
          background: percent >= 100 ? "#22c55e" : "var(--primary)",
        }}
      />
    </div>
  );
}

export function AnalysisQueueIndicator() {
  const router = useRouter();
  const { items, addUrl, removeItem, dismissCompleted } = useAnalysisQueue();
  const [open, setOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const activeCount = items.filter(
    (i) => i.status === "pending" || i.status === "parsing" || i.status === "transcribing"
  ).length;
  const completedCount = items.filter((i) => i.status === "completed").length;
  const hasItems = items.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const canAdd =
    inputUrl.includes("bilibili.com") ||
    inputUrl.includes("b23.tv") ||
    inputUrl.includes("xiaohongshu.com") ||
    inputUrl.includes("xhslink.com");

  function handleAdd() {
    if (!canAdd) return;
    addUrl(inputUrl);
    setInputUrl("");
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-t-sm p-2 transition-colors"
        style={{ color: hasItems ? "var(--primary)" : "var(--text-muted)" }}
        title="分析队列"
      >
        {/* Queue icon */}
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        {/* Badge */}
        {activeCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            {activeCount}
          </span>
        )}
        {completedCount > 0 && activeCount === 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold text-white">
            {completedCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-alt)",
            boxShadow: "var(--panel-shadow)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border-sub)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              分析队列
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={dismissCompleted}
                className="text-xs transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                清除已完成
              </button>
            )}
          </div>

          {/* Add URL input */}
          <div className="flex gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-sub)" }}>
            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canAdd) handleAdd(); }}
              placeholder="粘贴视频链接..."
              className="ui-input flex-1 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className="ui-btn-primary whitespace-nowrap px-3 py-1.5 text-xs"
            >
              添加
            </button>
          </div>

          {/* Queue items */}
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  队列为空，粘贴链接添加视频
                </p>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border-sub)" }}>
                {items.map((item) => {
                  const isActive = item.status === "parsing" || item.status === "transcribing";
                  return (
                    <li key={item.id} className="px-4 py-2.5">
                      <div className="flex items-start gap-2.5">
                        <StatusDot status={item.status} />
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium"
                            style={{ color: "var(--text)" }}
                            title={item.title || item.url}
                          >
                            {item.title || item.url}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                              {statusLabel(item)}
                            </span>
                            {isActive && item.progress > 0 && (
                              <span className="text-[11px] font-medium" style={{ color: "var(--primary)" }}>
                                {item.progress}%
                              </span>
                            )}
                            {item.error && (
                              <span className="truncate text-[11px] text-red-500" title={item.error}>
                                {item.error}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {item.status === "completed" && item.historyId && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpen(false);
                                router.push(`/summary/${item.historyId}`);
                              }}
                              className="rounded-md px-2 py-1 text-[11px] font-medium transition-colors"
                              style={{ color: "var(--primary)" }}
                            >
                              查看
                            </button>
                          )}
                          {(item.status === "completed" || item.status === "error") && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="rounded-md p-1 transition-colors"
                              style={{ color: "var(--text-subtle)" }}
                              title="移除"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {isActive && <ProgressBar percent={item.progress} />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
