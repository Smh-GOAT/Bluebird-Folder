"use client";

import { useState } from "react";
import type { QAMessage, SubtitleReference } from "@/types";

interface MessageBubbleProps {
  message: QAMessage;
  onReferenceClick?: (ref: SubtitleReference) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function ReferenceList({
  references,
  onReferenceClick,
}: {
  references: SubtitleReference[];
  onReferenceClick?: (ref: SubtitleReference) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 pt-2" style={{ borderTop: "1px solid var(--border-sub)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-90" : "rotate-0"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M7 5l6 5-6 5V5z" />
        </svg>
        参考片段（{references.length}）
      </button>
      {open && (
        <div className="mt-1.5 space-y-1.5">
          {references.map((ref, idx) => (
            <button
              key={idx}
              onClick={() => onReferenceClick?.(ref)}
              className="block w-full px-2.5 py-1.5 text-left text-xs transition-colors"
              style={{
                borderRadius: "var(--radius-xs)",
                background: "var(--surface-sub)",
                border: "1px solid var(--border-sub)",
                color: "var(--text-sec)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>
                [{formatTime(ref.start)}-{formatTime(ref.end)}]
              </span>{" "}
              {ref.text.slice(0, 60)}...
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessageBubble({ message, onReferenceClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className="max-w-[85%] px-4 py-3"
        style={
          isUser
            ? {
                background: "var(--chat-user-bg)",
                color: "white",
                borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)",
              }
            : {
                background: "var(--chat-ai-bg)",
                border: "1px solid var(--chat-ai-border)",
                color: "var(--text-sec)",
                borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)",
              }
        }
      >
        <div className="text-sm leading-relaxed">{message.content}</div>

        {!isUser && message.references && message.references.length > 0 && (
          <ReferenceList references={message.references} onReferenceClick={onReferenceClick} />
        )}

        <div className="mt-1.5 text-right text-[10px]" style={{ color: isUser ? "rgba(255,255,255,0.55)" : "var(--text-subtle)" }}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
          {message.model && <span className="ml-2">· {message.model}</span>}
        </div>
      </div>
    </div>
  );
}
