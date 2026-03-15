"use client";

import type { QAMessage, SubtitleReference } from "@/types";

interface MessageBubbleProps {
  message: QAMessage;
  onReferenceClick?: (ref: SubtitleReference) => void;
}

export function MessageBubble({ message, onReferenceClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-zinc-900 text-white"
            : "bg-zinc-100 text-zinc-900"
        }`}
      >
        <div className="text-sm leading-relaxed">{message.content}</div>

        {!isUser && message.references && message.references.length > 0 && (
          <div className="mt-3 border-t border-zinc-200 pt-2">
            <p className="mb-1.5 text-xs text-zinc-500">参考片段：</p>
            <div className="space-y-1.5">
              {message.references.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => onReferenceClick?.(ref)}
                  className="block w-full rounded bg-white/70 px-2.5 py-1.5 text-left text-xs hover:bg-white"
                >
                  <span className="text-zinc-500">
                    [{formatTime(ref.start)}-{formatTime(ref.end)}]
                  </span>{" "}
                  <span className="text-zinc-700">{ref.text.slice(0, 60)}...</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`mt-1.5 text-right text-[10px] ${isUser ? "text-zinc-400" : "text-zinc-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit"
          })}
          {message.model && (
            <span className="ml-2">· {message.model}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
