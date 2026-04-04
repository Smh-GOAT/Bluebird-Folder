"use client";

import { useTheme } from "@/lib/theme-provider";
import type { ThemeName } from "@/lib/theme-provider";

interface ThemeSelectorProps {
  compact?: boolean;
}

const THEMES: { id: ThemeName; label: string }[] = [
  { id: "apple",   label: "Apple" },
  { id: "forsion", label: "Forsion" },
  { id: "notion",  label: "Notion" },
];

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { theme, mode, setTheme, toggleMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Theme chip row */}
      <div
        className="flex items-center gap-1 p-0.5"
        style={{
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--border-sub)",
          background: "var(--surface-sub)",
        }}
      >
        {THEMES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className="text-[11px] font-medium leading-none transition-all"
            style={{
              padding: compact ? "4px 9px" : "5px 11px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              cursor: "pointer",
              background: theme === id
                ? "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))"
                : "transparent",
              color: theme === id ? "white" : "var(--text-muted)",
              boxShadow: theme === id ? "0 1px 4px var(--primary-glow)" : "none",
              transform: theme === id ? "scale(1.02)" : "scale(1)",
            }}
            title={`${label} 主题`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Light / Dark toggle */}
      <ModeToggle />
    </div>
  );
}

/** 独立的亮/暗模式切换按钮，用于 Header */
export function ModeToggle() {
  const { mode, toggleMode } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleMode}
      title={mode === "light" ? "切换到暗色模式" : "切换到亮色模式"}
      className="flex h-8 w-8 items-center justify-center transition-all"
      style={{
        borderRadius: "var(--radius-pill)",
        border: "1px solid var(--border-sub)",
        background: "var(--surface-sub)",
        color: "var(--text-muted)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--primary-tint)";
        e.currentTarget.style.color = "var(--primary)";
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface-sub)";
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.borderColor = "var(--border-sub)";
      }}
    >
      {mode === "light" ? (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}
