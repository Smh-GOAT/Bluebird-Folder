"use client";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
  };
}

export function ResizeHandle({ direction, handleProps }: ResizeHandleProps) {
  const isH = direction === "horizontal";

  return (
    <div
      {...handleProps}
      className={
        isH
          ? "group relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center"
          : "group relative z-10 flex h-2 shrink-0 cursor-row-resize items-center justify-center"
      }
      style={{ touchAction: "none", userSelect: "none" }}
    >
      <div
        className={`rounded-full transition-colors group-hover:opacity-100 group-active:opacity-100 ${
          isH ? "h-8 w-1 opacity-0" : "h-1 w-8 opacity-0"
        }`}
        style={{ background: "var(--border)" }}
      />
    </div>
  );
}
