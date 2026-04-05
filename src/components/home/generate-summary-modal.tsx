"use client";

import { useState } from "react";
import {
  DETAIL_LEVEL_CONFIG,
  TEMPLATE_REGISTRY,
  type SummaryTemplate
} from "@/types/summary";
import { useSelectedModel, ModelSelector } from "@/components/layout/model-selector";

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
    modelId?: string;
  }) => void;
}

const TEMPLATE_ICONS: Record<SummaryTemplate, string> = {
  general: "📚", interview: "🎙️", travel: "✈️", academic: "📗",
  tutorial: "📘", news: "📰", meeting: "📋", podcast: "🎧",
  review: "⭐", vlog: "📹"
};

const TEMPLATES: SummaryTemplate[] = [
  "general","interview","travel","academic","tutorial",
  "news","meeting","podcast","review","vlog"
];

const DETAIL_OPTIONS = [
  { value: "brief",    label: DETAIL_LEVEL_CONFIG.concise.label,   targetWords: DETAIL_LEVEL_CONFIG.concise.targetWords,   instruction: DETAIL_LEVEL_CONFIG.concise.instruction },
  { value: "standard", label: DETAIL_LEVEL_CONFIG.standard.label,  targetWords: DETAIL_LEVEL_CONFIG.standard.targetWords,  instruction: DETAIL_LEVEL_CONFIG.standard.instruction },
  { value: "detailed", label: DETAIL_LEVEL_CONFIG.detailed.label,  targetWords: DETAIL_LEVEL_CONFIG.detailed.targetWords,  instruction: DETAIL_LEVEL_CONFIG.detailed.instruction }
] as const;

export function GenerateSummaryModal({ open, onClose, onConfirm }: GenerateSummaryModalProps) {
  const { modelId, models, select: selectModel } = useSelectedModel();
  const [selectedTemplate, setSelectedTemplate] = useState<SummaryTemplate>("general");
  const [language, setLanguage] = useState("zh");
  const [detail, setDetail] = useState<"brief" | "standard" | "detailed">("standard");
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [showEmoji, setShowEmoji] = useState(true);
  const [translateSubtitles, setTranslateSubtitles] = useState(false);
  const [subtitleTargetLanguage, setSubtitleTargetLanguage] = useState("zh");

  if (!open) return null;

  const selectedDetailOption = DETAIL_OPTIONS.find((o) => o.value === detail) ?? DETAIL_OPTIONS[1];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onConfirm({ template: selectedTemplate, language, detail, showTimestamp, showEmoji, translateSubtitles, subtitleTargetLanguage, modelId: modelId ?? undefined });
  };

  // Shared select style
  const selectStyle = {
    background: "var(--input-bg)",
    border: "1.5px solid var(--border)",
    color: "var(--text)",
    borderRadius: "var(--radius-sm)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
    >
      <div
        className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden"
        style={{
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          boxShadow: "var(--panel-shadow)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-sub)" }}
        >
          <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>生成总结</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            选择模板和输出档位，AI 会按对应字数范围生成总结。
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="summary-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Template grid */}
            <div>
              <label className="mb-3 block text-sm font-medium" style={{ color: "var(--text-sec)" }}>
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
                      className="flex flex-col items-center p-3 text-center transition-all"
                      style={{
                        borderRadius: "var(--radius-sm)",
                        border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border-sub)",
                        background: isSelected ? "var(--primary-tint)" : "var(--surface-sub)",
                        color: isSelected ? "var(--primary)" : "var(--text-sec)",
                      }}
                    >
                      <span className="mb-1 text-2xl">{TEMPLATE_ICONS[templateKey]}</span>
                      <span className="text-xs font-medium">{template.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                {TEMPLATE_REGISTRY[selectedTemplate].description}
              </p>
            </div>

            {/* Model selection */}
            {models.length > 0 && (
              <div>
                <label className="mb-3 block text-sm font-medium" style={{ color: "var(--text-sec)" }}>
                  AI 模型
                </label>
                <ModelSelector modelId={modelId} models={models} onSelect={selectModel} />
              </div>
            )}

            {/* Output settings */}
            <div>
              <label className="mb-3 block text-sm font-medium" style={{ color: "var(--text-sec)" }}>
                输出设置
              </label>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[140px] flex-1">
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={selectStyle}
                  >
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="min-w-[180px] flex-1">
                  <select
                    value={detail}
                    onChange={(event) => setDetail(event.target.value as "brief" | "standard" | "detailed")}
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={selectStyle}
                  >
                    {DETAIL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.targetWords} 字)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                {selectedDetailOption.instruction}
              </p>
            </div>

            {/* Display options */}
            <div>
              <label className="mb-3 block text-sm font-medium" style={{ color: "var(--text-sec)" }}>
                显示选项
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "显示时间戳", checked: showTimestamp, onChange: setShowTimestamp },
                  { label: "显示 Emoji",  checked: showEmoji,     onChange: setShowEmoji },
                  { label: "翻译字幕",     checked: translateSubtitles, onChange: setTranslateSubtitles },
                ].map(({ label, checked, onChange }) => (
                  <label key={label} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => onChange(event.target.checked)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--text-sec)" }}>{label}</span>
                  </label>
                ))}
              </div>
              {translateSubtitles && (
                <div className="mt-3">
                  <select
                    value={subtitleTargetLanguage}
                    onChange={(event) => setSubtitleTargetLanguage(event.target.value)}
                    className="px-3 py-2 text-sm outline-none"
                    style={selectStyle}
                  >
                    <option value="zh">翻译成中文</option>
                    <option value="en">翻译成英文</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 px-6 py-4"
          style={{
            borderTop: "1px solid var(--border-sub)",
            background: "var(--surface)",
          }}
        >
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="ui-btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              form="summary-form"
              className="ui-btn-primary"
            >
              生成总结
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
