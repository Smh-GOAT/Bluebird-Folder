"use client";

import { useState, useRef, useEffect } from "react";

interface ThemedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function ThemedSelect({ value, onChange, options, className = "" }: ThemedSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ui-input flex w-full items-center justify-between px-3 py-2 text-left text-sm"
      >
        <span>{selected?.label ?? ""}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto py-1"
          style={{
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--bg-alt)",
            boxShadow: "var(--panel-shadow)",
          }}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center px-3 py-2 text-left text-sm transition-colors"
                style={{
                  color: opt.value === value ? "var(--primary)" : "var(--text)",
                  background: opt.value === value ? "var(--primary-tint)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = "var(--surface-sub)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = opt.value === value ? "var(--primary-tint)" : "transparent";
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
