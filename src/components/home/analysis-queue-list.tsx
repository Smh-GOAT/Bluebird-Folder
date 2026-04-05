"use client";

import { useAnalysisQueue, type QueueItem } from "@/lib/analysis-queue-context";

function itemLabel(item: QueueItem) {
  if (item.progressLabel && item.status !== "completed" && item.status !== "error" && item.status !== "pending") {
    return item.progressLabel;
  }
  switch (item.status) {
    case "pending":      return "排队中";
    case "parsing":      return "解析中...";
    case "transcribing": return "转写中...";
    case "completed":    return "已完成";
    case "error":        return "失败";
  }
}

function StatusIndicator({ status }: { status: QueueItem["status"] }) {
  if (status === "completed") {
    return (
      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  // pending / parsing / transcribing → spinner
  return (
    <svg
      className="h-4 w-4 animate-spin"
      style={{ color: "var(--primary)" }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

interface AnalysisQueueListProps {
  onSelect?: (historyId: string) => void;
}

export function AnalysisQueueList({ onSelect }: AnalysisQueueListProps) {
  const { items, removeItem, dismissCompleted } = useAnalysisQueue();

  if (items.length === 0) return null;

  const hasCompleted = items.some((i) => i.status === "completed");

  return (
    <div className="mt-4 ui-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="ui-title">分析队列</h2>
        {hasCompleted && (
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

      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = item.status === "parsing" || item.status === "transcribing";
          return (
            <li
              key={item.id}
              className="rounded-t-sm p-3 transition-colors"
              style={{
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-sub)",
                background: item.status === "completed" ? "var(--primary-tint)" : "var(--surface-sub)",
              }}
            >
              <div className="flex items-center gap-3">
                <StatusIndicator status={item.status} />

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: "var(--text)" }}
                    title={item.title || item.url}
                  >
                    {item.title || item.url}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {itemLabel(item)}
                    </span>
                    {isActive && item.progress > 0 && (
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        {item.progress}%
                      </span>
                    )}
                    {item.error && (
                      <span className="truncate text-xs text-red-500" title={item.error}>
                        {item.error}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {item.status === "completed" && item.historyId && (
                    <button
                      type="button"
                      onClick={() => onSelect?.(item.historyId!)}
                      className="ui-btn-primary px-3 py-1 text-xs"
                    >
                      查看
                    </button>
                  )}
                  {(item.status === "completed" || item.status === "error") && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-md p-1.5 transition-colors"
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

              {/* Progress bar */}
              {isActive && item.progress > 0 && (
                <div
                  className="mt-2 h-1 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--border-sub)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, item.progress)}%`,
                      background: "var(--primary)",
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
