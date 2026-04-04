"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/forsion/fetch";

interface HistoryItem {
  id: string;
  title: string;
  platform: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    authFetch("/api/history")
      .then((res) => res.json())
      .then((result) => {
        if (result.code === 0) setItems(result.data.items);
      })
      .catch(console.error);
  }, []);

  return (
    <main
      className="mx-auto max-w-3xl p-6"
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>历史记录</h1>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="p-3 text-sm"
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-sub)",
              background: "var(--surface)",
            }}
          >
            <p className="font-medium" style={{ color: "var(--text)" }}>{item.title}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {item.platform.toUpperCase()} · {item.createdAt}
            </p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm" style={{ color: "var(--text-muted)" }}>暂无记录</li>
        )}
      </ul>
    </main>
  );
}
