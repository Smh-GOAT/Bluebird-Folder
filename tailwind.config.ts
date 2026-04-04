import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic surface tokens ──
        "bb-bg":           "var(--bg)",
        "bb-bg-alt":       "var(--bg-alt)",
        "bb-surface":      "var(--surface)",
        "bb-surface-sub":  "var(--surface-sub)",
        "bb-surface-hover":"var(--surface-hover)",

        // ── Semantic border tokens ──
        "bb-border":       "var(--border)",
        "bb-border-sub":   "var(--border-sub)",
        "bb-border-hover": "var(--border-hover)",

        // ── Semantic text tokens ──
        "bb-text":         "var(--text)",
        "bb-text-sec":     "var(--text-sec)",
        "bb-text-muted":   "var(--text-muted)",
        "bb-text-subtle":  "var(--text-subtle)",

        // ── Semantic primary tokens ──
        "bb-primary":      "var(--primary)",
        "bb-primary-dark": "var(--primary-dark)",
        "bb-primary-tint": "var(--primary-tint)",

        // ── Overlay ──
        "bb-overlay":      "var(--overlay)",

        // ── Legacy notion tokens (kept for backward compat, remove when migration done) ──
        "notion-bg":       "#f7f6f3",
        "notion-text":     "#1f1f1f"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      borderRadius: {
        "t-xs":   "var(--radius-xs)",
        "t-sm":   "var(--radius-sm)",
        "t-md":   "var(--radius-md)",
        "t-lg":   "var(--radius-lg)",
        "t-xl":   "var(--radius-xl)",
        "t-pill": "var(--radius-pill)"
      },
      backdropBlur: {
        "glass": "20px"
      },
      boxShadow: {
        "panel":  "var(--panel-shadow)",
        "glow":   "0 4px 14px var(--primary-glow)"
      },
      transitionTimingFunction: {
        "apple":  "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      animation: {
        "fade-up":   "fadeUp 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both",
        "chip-in":   "chipIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite"
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" }
        },
        chipIn: {
          from: { opacity: "0", transform: "scale(0.82) translateY(6px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" }
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":       { opacity: "0.45", transform: "scale(0.8)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
