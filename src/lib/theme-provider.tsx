"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeName = "apple" | "forsion" | "notion";
export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (t: ThemeName) => void;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "apple",
  mode: "light",
  setTheme: () => {},
  setMode: () => {},
  toggleMode: () => {}
});

const STORAGE_THEME = "bb-theme";
const STORAGE_MODE  = "bb-mode";

function applyToHtml(theme: ThemeName, mode: ThemeMode) {
  const el = document.documentElement;
  el.dataset.theme = theme;
  el.dataset.mode  = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("apple");
  const [mode,  setModeState]  = useState<ThemeMode>("light");

  // Restore saved values once mounted (client-only)
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_THEME) as ThemeName | null;
    const savedMode  = localStorage.getItem(STORAGE_MODE)  as ThemeMode | null;

    const t: ThemeName = savedTheme && ["apple","forsion","notion"].includes(savedTheme)
      ? savedTheme : "apple";
    const m: ThemeMode = savedMode  && ["light","dark"].includes(savedMode)
      ? savedMode  : "light";

    setThemeState(t);
    setModeState(m);
    applyToHtml(t, m);
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_THEME, t);
    applyToHtml(t, mode);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_MODE, m);
    applyToHtml(theme, m);
  }, [theme]);

  const toggleMode = useCallback(() => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setModeState(next);
    localStorage.setItem(STORAGE_MODE, next);
    applyToHtml(theme, next);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
