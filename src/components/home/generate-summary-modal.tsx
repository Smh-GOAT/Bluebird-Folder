"use client";

import { useState } from "react";
import { TEMPLATE_REGISTRY, type SummaryTemplate } from "@/types/summary";

interface GenerateSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: {
    template: SummaryTemplate;
    language: string;
    detail: "brief" | "standard" | "detailed";
    showTimestamp: boolean;
    showEmoji: boolean;
    translateSubtitles: boolean;
    subtitleTargetLanguage: string;
  }) => void;
}

const TEMPLATE_ICONS: Record<SummaryTemplate, string> = {
  general: "📄",
  interview: "🎤",
  travel: "✈️",
  academic: "🎓",
  tutorial: "📚",
  news: "📰",
  meeting: "📝",
  podcast: "🎧",
  review: "⭐",
  vlog: "📹"
};

const TEMPLATES: SummaryTemplate[] = [
  "general",
  "interview",
  "travel",
  "academic",
  "tutorial",
  "news",
  "meeting",
  "podcast",
  "review",
  "vlog"
];

export function GenerateSummaryModal({ open, onClose, onConfirm }: GenerateSummaryModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<SummaryTemplate>("general");
  const [language, setLanguage] = useState("zh");
  const [detail, setDetail] = useState<"brief" | "standard" | "detailed">("standard");
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [showEmoji, setShowEmoji] = useState(true);
  const [translateSubtitles, setTranslateSubtitles] = useState(false);
  const [subtitleTargetLanguage, setSubtitleTargetLanguage] = useState("zh");

  if (!open) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      template: selectedTemplate,
      language,
      detail,
      showTimestamp,
      showEmoji,
      translateSubtitles,
      subtitleTargetLanguage
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-white">
        {/* Header */}
        <div className="flex-shrink-0 border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900">生成总结</h3>
          <p className="mt-1 text-sm text-zinc-500">选择模板和配置，AI 将为您生成专业总结</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="summary-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selection */}
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                选择模板
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {TEMPLATES.map((templateKey) => {
                  const template = TEMPLATE_REGISTRY[templateKey];
                  const isSelected = selectedTemplate === templateKey;
                  return (
                    <button
                      key={templateKey}
                      type="button"
                      onClick={() => setSelectedTemplate(templateKey)}
                      className={`flex flex-col items-center rounded-lg border p-3 text-center transition-all ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                      }`}
                    >
                      <span className="mb-1 text-2xl">{TEMPLATE_ICONS[templateKey]}</span>
                      <span className="text-xs font-medium">{template.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {TEMPLATE_REGISTRY[selectedTemplate].description}
              </p>
            </div>

            {/* Output Settings - Horizontal Layout */}
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                输出设置
              </label>
              <div className="flex flex-wrap gap-3">
                {/* Language */}
                <div className="flex-1 min-w-[140px]">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                  >
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Detail Level */}
                <div className="flex-1 min-w-[140px]">
                  <select
                    value={detail}
                    onChange={(e) => setDetail(e.target.value as "brief" | "standard" | "detailed")}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                  >
                    <option value="brief">简洁</option>
                    <option value="standard">标准</option>
                    <option value="detailed">详细</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                显示选项
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showTimestamp}
                    onChange={(e) => setShowTimestamp(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">显示时间戳</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showEmoji}
                    onChange={(e) => setShowEmoji(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">显示 Emoji</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={translateSubtitles}
                    onChange={(e) => setTranslateSubtitles(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">翻译字幕</span>
                </label>
              </div>
              {translateSubtitles && (
                <div className="mt-3">
                  <select
                    value={subtitleTargetLanguage}
                    onChange={(e) => setSubtitleTargetLanguage(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                  >
                    <option value="zh">翻译成中文</option>
                    <option value="en">翻译成英文</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 border-t bg-white px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              取消
            </button>
            <button
              type="submit"
              form="summary-form"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              生成总结
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
