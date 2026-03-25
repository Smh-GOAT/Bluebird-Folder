"use client";

import { useState } from "react";
import {
  DETAIL_LEVEL_CONFIG,
  TEMPLATE_REGISTRY,
  type SummaryTemplate
} from "@/types/summary";

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
  general: "📚",
  interview: "🎙️",
  travel: "✈️",
  academic: "📗",
  tutorial: "📘",
  news: "📰",
  meeting: "📋",
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

const DETAIL_OPTIONS = [
  {
    value: "brief",
    label: DETAIL_LEVEL_CONFIG.concise.label,
    targetWords: DETAIL_LEVEL_CONFIG.concise.targetWords,
    instruction: DETAIL_LEVEL_CONFIG.concise.instruction
  },
  {
    value: "standard",
    label: DETAIL_LEVEL_CONFIG.standard.label,
    targetWords: DETAIL_LEVEL_CONFIG.standard.targetWords,
    instruction: DETAIL_LEVEL_CONFIG.standard.instruction
  },
  {
    value: "detailed",
    label: DETAIL_LEVEL_CONFIG.detailed.label,
    targetWords: DETAIL_LEVEL_CONFIG.detailed.targetWords,
    instruction: DETAIL_LEVEL_CONFIG.detailed.instruction
  }
] as const;

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

  const selectedDetailOption = DETAIL_OPTIONS.find((option) => option.value === detail) ?? DETAIL_OPTIONS[1];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
        <div className="flex-shrink-0 border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900">生成总结</h3>
          <p className="mt-1 text-sm text-zinc-500">
            选择模板和输出档位，AI 会按对应字数范围生成总结。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="summary-form" onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                输出设置
              </label>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[140px] flex-1">
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                  >
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="min-w-[180px] flex-1">
                  <select
                    value={detail}
                    onChange={(event) => setDetail(event.target.value as "brief" | "standard" | "detailed")}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
                  >
                    {DETAIL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.targetWords} 字)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {selectedDetailOption.instruction}
              </p>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                显示选项
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showTimestamp}
                    onChange={(event) => setShowTimestamp(event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">显示时间戳</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showEmoji}
                    onChange={(event) => setShowEmoji(event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">显示 Emoji</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={translateSubtitles}
                    onChange={(event) => setTranslateSubtitles(event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">翻译字幕</span>
                </label>
              </div>
              {translateSubtitles && (
                <div className="mt-3">
                  <select
                    value={subtitleTargetLanguage}
                    onChange={(event) => setSubtitleTargetLanguage(event.target.value)}
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
