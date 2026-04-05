"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY_PREFIX = "bluebird-resize:";

interface UseResizableOptions {
  /** Unique key for localStorage persistence */
  storageKey: string;
  /** Default size in pixels */
  defaultSize: number;
  /** Minimum size in pixels */
  min?: number;
  /** Maximum size in pixels */
  max?: number;
  /** Resize direction */
  direction: "horizontal" | "vertical";
}

export function useResizable({
  storageKey,
  defaultSize,
  min = 200,
  max = 1200,
  direction,
}: UseResizableOptions) {
  const fullKey = STORAGE_KEY_PREFIX + storageKey;

  const [size, setSize] = useState(() => {
    if (typeof window === "undefined") return defaultSize;
    const stored = localStorage.getItem(fullKey);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) return parsed;
    }
    return defaultSize;
  });

  const dragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const persist = useCallback(
    (value: number) => {
      localStorage.setItem(fullKey, String(value));
    },
    [fullKey],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      startPos.current = direction === "horizontal" ? e.clientX : e.clientY;
      startSize.current = size;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [direction, size],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const delta =
        direction === "horizontal"
          ? e.clientX - startPos.current
          : e.clientY - startPos.current;
      const next = Math.round(Math.min(max, Math.max(min, startSize.current + delta)));
      setSize(next);
    },
    [direction, min, max],
  );

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setSize((current) => {
      persist(current);
      return current;
    });
  }, [persist]);

  return {
    size,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
    isDragging: dragging,
  };
}
