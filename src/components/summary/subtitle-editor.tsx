"use client";

import { useState, useCallback } from "react";
import type { SubtitleSegment } from "@/types";
import { formatTimeShort } from "@/lib/utils/time";

interface SubtitleEditorProps {
  subtitles: SubtitleSegment[];
  onSave: (subtitles: SubtitleSegment[]) => void;
  onCancel: () => void;
}

export function SubtitleEditor({ subtitles, onSave, onCancel }: SubtitleEditorProps) {
  const [editedSubtitles, setEditedSubtitles] = useState<SubtitleSegment[]>(
    subtitles.map(s => ({ ...s }))
  );

  const updateSubtitle = useCallback((index: number, updates: Partial<SubtitleSegment>) => {
    setEditedSubtitles(prev => 
      prev.map((sub, i) => i === index ? { ...sub, ...updates } : sub)
    );
  }, []);

  const handleSave = () => {
    onSave(editedSubtitles);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="ui-btn-primary px-3 py-1.5 text-sm"
          >
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              保存
            </span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="ui-btn-secondary px-3 py-1.5 text-sm"
          >
            取消
          </button>
        </div>
        <span className="text-xs text-zinc-500">
          共 {editedSubtitles.length} 条字幕
        </span>
      </div>

      <div className="space-y-3">
        {editedSubtitles.map((subtitle, index) => (
          <div 
            key={index} 
            className="rounded-lg border border-zinc-200 bg-white p-3 transition-shadow hover:shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 w-6">#{index + 1}</span>
              
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={subtitle.start}
                  onChange={(e) => updateSubtitle(index, { start: parseFloat(e.target.value) || 0 })}
                  className="w-20 rounded border border-zinc-200 px-2 py-1 text-xs"
                  placeholder="开始"
                />
                <span className="text-zinc-400">s</span>
              </div>
              
              <span className="text-zinc-400">→</span>
              
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={subtitle.end}
                  onChange={(e) => updateSubtitle(index, { end: parseFloat(e.target.value) || 0 })}
                  className="w-20 rounded border border-zinc-200 px-2 py-1 text-xs"
                  placeholder="结束"
                />
                <span className="text-zinc-400">s</span>
              </div>

              <span className="ml-2 text-xs text-zinc-400">
                ({formatTimeShort(subtitle.start)} - {formatTimeShort(subtitle.end)})
              </span>
            </div>

            <textarea
              value={subtitle.text}
              onChange={(e) => updateSubtitle(index, { text: e.target.value })}
              className="w-full resize-none rounded border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
              rows={2}
              placeholder="字幕文本..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
