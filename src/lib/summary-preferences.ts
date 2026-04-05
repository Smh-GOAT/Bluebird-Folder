import type { SummaryTemplate } from "@/types/summary";

export interface SummaryPreferences {
  template: SummaryTemplate;
  language: string;
  detail: "brief" | "standard" | "detailed";
  showTimestamp: boolean;
  showEmoji: boolean;
  customPrompt: string;
}

const STORAGE_KEY = "bluebird-summary-preferences";

const DEFAULT_PREFERENCES: SummaryPreferences = {
  template: "general",
  language: "zh",
  detail: "standard",
  showTimestamp: true,
  showEmoji: true,
  customPrompt: "",
};

export function getSummaryPreferences(): SummaryPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveSummaryPreferences(prefs: Partial<SummaryPreferences>) {
  if (typeof window === "undefined") return;
  const current = getSummaryPreferences();
  const merged = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export { DEFAULT_PREFERENCES };
