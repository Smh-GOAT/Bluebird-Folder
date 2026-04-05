import type { SummaryPreferences } from "./summary-preferences";

/**
 * Server-side summary preferences — returns defaults.
 * Client-specific overrides are in localStorage and passed via request body when needed.
 */
export function getSummaryPreferences_server(): SummaryPreferences {
  return {
    template: "general",
    language: "zh",
    detail: "standard",
    showTimestamp: true,
    showEmoji: true,
    customPrompt: "",
  };
}
