"use client";

import { useVideoTime } from "./video-time-context";
import { formatTimeShort, formatTimeLong } from "@/lib/utils/time";

interface TimestampButtonProps {
  time: number;
  format?: "short" | "long";
  onClick?: () => void;
  className?: string;
}

export function TimestampButton({ 
  time, 
  format = "short",
  onClick,
  className 
}: TimestampButtonProps) {
  const { seekTo } = useVideoTime();
  
  const formattedTime = format === "short" 
    ? formatTimeShort(time)
    : formatTimeLong(time);
  
  const handleClick = () => {
    seekTo(time);
    onClick?.();
  };
  
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors ${className}`}
      title={`跳转到 ${formattedTime}`}
      type="button"
    >
      <svg className="mr-0.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
      </svg>
      {formattedTime}
    </button>
  );
}
