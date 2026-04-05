"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authFetch } from "@/lib/forsion/fetch";
import type { ParseVideoResponseData } from "@/types";

export interface QueueItem {
  id: string;
  url: string;
  title?: string;
  status: "pending" | "parsing" | "transcribing" | "completed" | "error";
  error?: string;
  historyId?: string;
  /** 0-100 progress percentage */
  progress: number;
  /** Current step label */
  progressLabel?: string;
}

interface AnalysisQueueContextValue {
  items: QueueItem[];
  addUrl: (url: string) => void;
  removeItem: (id: string) => void;
  dismissCompleted: () => void;
  /** Increments each time an item completes — watch to trigger sidebar refresh */
  refreshKey: number;
}

const AnalysisQueueContext = createContext<AnalysisQueueContextValue | null>(null);

export function useAnalysisQueue() {
  const ctx = useContext(AnalysisQueueContext);
  if (!ctx) throw new Error("useAnalysisQueue must be inside AnalysisQueueProvider");
  return ctx;
}

function updateItem(prev: QueueItem[], id: string, patch: Partial<QueueItem>): QueueItem[] {
  return prev.map((i) => (i.id === id ? { ...i, ...patch } : i));
}

export function AnalysisQueueProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const processingRef = useRef(false);

  const processNext = useCallback(async () => {
    if (processingRef.current) return;

    const pending = items.find((i) => i.status === "pending");
    if (!pending) return;

    processingRef.current = true;
    const itemId = pending.id;

    // Mark as parsing
    setItems((prev) =>
      updateItem(prev, itemId, { status: "parsing", progress: 2, progressLabel: "解析链接" })
    );

    try {
      // Step 1: Parse metadata (quick)
      const parseRes = await authFetch("/api/video/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pending.url }),
      });
      const parseResult = (await parseRes.json()) as {
        code: number;
        data: ParseVideoResponseData;
        message: string;
      };
      if (parseResult.code !== 0) throw new Error(parseResult.message);

      setItems((prev) =>
        updateItem(prev, itemId, {
          title: parseResult.data.meta.title,
          status: "transcribing",
          progress: 8,
          progressLabel: "准备转录",
        })
      );

      // Step 2: Stream transcript with progress via SSE
      const transcriptRes = await authFetch("/api/transcript/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pending.url }),
      });

      if (!transcriptRes.body) throw new Error("无法建立流式连接");

      const reader = transcriptRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let historyId: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string;
              percent?: number;
              label?: string;
              message?: string;
              historyId?: string;
            };

            if (event.type === "progress") {
              setItems((prev) =>
                updateItem(prev, itemId, {
                  progress: event.percent ?? 0,
                  progressLabel: event.label,
                })
              );
            } else if (event.type === "complete") {
              historyId = event.historyId;
            } else if (event.type === "error") {
              throw new Error(event.message ?? "转录失败");
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "转录失败") {
              // JSON parse error, skip
              continue;
            }
            throw e;
          }
        }
      }

      if (!historyId) throw new Error("转录完成但未返回 historyId");

      setItems((prev) =>
        updateItem(prev, itemId, {
          status: "completed",
          historyId,
          progress: 100,
          progressLabel: "完成",
        })
      );
      setRefreshKey((k) => k + 1);
    } catch (error) {
      setItems((prev) =>
        updateItem(prev, itemId, {
          status: "error",
          error: error instanceof Error ? error.message : "分析失败",
          progress: 0,
        })
      );
    } finally {
      processingRef.current = false;
    }
  }, [items]);

  // Process next pending item whenever the queue changes
  useEffect(() => {
    if (!processingRef.current && items.some((i) => i.status === "pending")) {
      processNext();
    }
  }, [items, processNext]);

  const addUrl = useCallback((url: string) => {
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((prev) => [...prev, { id, url, status: "pending", progress: 0 }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const dismissCompleted = useCallback(() => {
    setItems((prev) => prev.filter((i) => i.status !== "completed"));
  }, []);

  return (
    <AnalysisQueueContext.Provider
      value={{ items, addUrl, removeItem, dismissCompleted, refreshKey }}
    >
      {children}
    </AnalysisQueueContext.Provider>
  );
}
