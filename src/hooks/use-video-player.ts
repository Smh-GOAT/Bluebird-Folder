"use client";

import { useState, useCallback } from "react";

export function useVideoPlayer() {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return {
    currentTime,
    duration,
    isPlaying,
    seekTo,
    togglePlay,
    setCurrentTime,
    setDuration,
  };
}
