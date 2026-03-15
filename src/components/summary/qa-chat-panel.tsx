"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { QAMessage, SubtitleReference } from "@/types";
import { MessageBubble } from "./message-bubble";

interface QAChatPanelProps {
  historyId: string;
  onReferenceClick?: (ref: SubtitleReference) => void;
}

export function QAChatPanel({ historyId, onReferenceClick }: QAChatPanelProps) {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!historyId) return;

    const loadSession = async () => {
      try {
        const response = await fetch(`/api/qa/session/${historyId}`);
        const result = await response.json();
        if (result.code === 0 && result.data?.messages?.length > 0) {
          setMessages(result.data.messages);
          setSessionId(result.data.sessionId);
        }
      } catch (error) {
        console.error("[qa-chat] load session failed:", error);
      }
    };

    loadSession();
  }, [historyId]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !historyId) return;

    const messageText = inputValue.trim();
    setInputValue("");
    
    // 先添加用户消息到界面
    const userMessage: QAMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/qa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historyId,
          sessionId,
          message: messageText,
          options: { maxReferences: 5 }
        })
      });

      const result = await response.json();

      if (result.code === 0 && result.data) {
        const { sessionId: newSessionId, message: assistantMessage } = result.data;
        if (newSessionId) setSessionId(newSessionId);
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // API 返回错误时显示错误消息
        const errorMessage: QAMessage = {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content: result.message || "抱歉，获取回答时出现错误，请稍后重试。",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("[qa-chat] send failed:", error);
      const errorMessage: QAMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "抱歉，发送消息时出现错误，请稍后重试。",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, historyId, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
            <svg
              className="mb-3 h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            <p className="text-sm">基于字幕内容提问</p>
            <p className="mt-1 text-xs text-zinc-300">AI 将检索相关片段并回答您的问题</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onReferenceClick={onReferenceClick}
            />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex max-w-[85%] items-center space-x-2 rounded-2xl bg-zinc-100 px-4 py-3">
              <div className="flex space-x-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-75"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-100 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入问题..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none disabled:bg-zinc-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
          >
            发送
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-zinc-400">
          按 Enter 发送，Shift+Enter 换行
        </p>
      </div>
    </div>
  );
}
