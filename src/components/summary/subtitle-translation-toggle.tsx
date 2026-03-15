"use client";

import { useState } from "react";
import type { SubtitleTranslation } from "@/types";

interface SubtitleTranslationToggleProps {
  originalSubtitles: Array<{ start: number; end: number; text: string }>;
  translatedSubtitles?: SubtitleTranslation[];
  onToggle?: (showTranslated: boolean) => void;
}

export function SubtitleTranslationToggle({
  originalSubtitles: _originalSubtitles,
  translatedSubtitles,
  onToggle
}: SubtitleTranslationToggleProps) {
  const [showTranslated, setShowTranslated] = useState(!!translatedSubtitles);

  if (!translatedSubtitles || translatedSubtitles.length === 0) {
    return null;
  }

  const handleToggle = () => {
    const newValue = !showTranslated;
    setShowTranslated(newValue);
    onToggle?.(newValue);
  };

  return (
    <div className="mb-3 flex items-center justify-between rounded-lg border bg-zinc-50 p-2">
      <span className="text-sm text-zinc-600">
        {showTranslated ? "显示翻译字幕" : "显示原文字幕"}
      </span>
      <button
        onClick={handleToggle}
        className="rounded bg-zinc-200 px-3 py-1 text-sm hover:bg-zinc-300"
      >
        {showTranslated ? "切换回原文字幕" : "切换到翻译字幕"}
      </button>
    </div>
  );
}

export function useSubtitleDisplay(
  originalSubtitles: Array<{ start: number; end: number; text: string }>,
  translatedSubtitles?: SubtitleTranslation[]
) {
  const [showTranslated, setShowTranslated] = useState(!!translatedSubtitles);

  const displaySubtitles = showTranslated && translatedSubtitles
    ? translatedSubtitles.map((t) => ({
        start: t.start,
        end: t.end,
        text: t.translatedText
      }))
    : originalSubtitles;

  return {
    showTranslated,
    setShowTranslated,
    displaySubtitles,
    hasTranslation: !!translatedSubtitles && translatedSubtitles.length > 0
  };
}
