"use client";

import type { VideoPlatform } from "@/types";

interface PlayerPlaceholderProps {
  platform?: VideoPlatform;
  videoId?: string;
  onExternalOpen?: () => void;
}

export function PlayerPlaceholder({ platform, videoId, onExternalOpen }: PlayerPlaceholderProps) {
  const platformName = platform === "bilibili" ? "Bilibili" : platform === "youtube" ? "YouTube" : platform === "xiaohongshu" ? "小红书" : "";
  
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg bg-zinc-100">
      <svg className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="mt-3 text-sm text-zinc-500">
        {platformName ? `${platformName} 视频播放器` : "视频播放器"}
      </p>
      {videoId && onExternalOpen && (
        <button 
          onClick={onExternalOpen}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          在外部打开视频
        </button>
      )}
    </div>
  );
}
