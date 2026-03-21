"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

interface VideoTimeContextType {
  currentTime: number;
  seekTo: (time: number) => void;
  registerSeekHandler: (handler: (time: number) => void) => void;
  unregisterSeekHandler: (handler: (time: number) => void) => void;
}

const VideoTimeContext = createContext<VideoTimeContextType | null>(null);

export function VideoTimeProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const handlersRef = useRef<Set<(time: number) => void>>(new Set());

  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
    // Notify all registered handlers
    handlersRef.current.forEach(handler => handler(time));
  }, []);

  const registerSeekHandler = useCallback((handler: (time: number) => void) => {
    handlersRef.current.add(handler);
  }, []);

  const unregisterSeekHandler = useCallback((handler: (time: number) => void) => {
    handlersRef.current.delete(handler);
  }, []);

  return (
    <VideoTimeContext.Provider 
      value={{ currentTime, seekTo, registerSeekHandler, unregisterSeekHandler }}
    >
      {children}
    </VideoTimeContext.Provider>
  );
}

export function useVideoTime() {
  const context = useContext(VideoTimeContext);
  if (!context) {
    throw new Error("useVideoTime must be used within VideoTimeProvider");
  }
  return context;
}
