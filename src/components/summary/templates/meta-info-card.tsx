"use client";

import { formatDuration } from "@/lib/utils/time";

interface MetaInfoCardProps {
  platform?: string | null;
  author?: string | null;
  duration?: number;
  extraLabel?: string;
  extraValue?: string;
  variant?: "default" | "travel" | "academic";
}

export function MetaInfoCard({
  platform,
  author,
  duration = 0,
  extraLabel,
  extraValue,
  variant = "default"
}: MetaInfoCardProps) {
  const cardStyle = {
    borderRadius: "var(--radius-sm)",
    background: "var(--surface-sub)",
    border: "1px solid var(--border-sub)",
    padding: "12px",
    textAlign: "center" as const,
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { icon: "📺", label: "平台", value: platform ?? "未知" },
        { icon: "👤", label: variant === "academic" ? "讲者" : "作者", value: author ?? "未知" },
        { icon: "⏱️", label: "时长", value: formatDuration(duration) },
        ...(extraLabel || extraValue !== undefined
          ? [{ icon: "📍", label: extraLabel ?? "地点", value: extraValue ?? "待标注" }]
          : [])
      ].map((item) => (
        <div key={item.label} style={cardStyle}>
          <div className="text-lg">{item.icon}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</div>
          <div className="truncate px-1 text-sm font-medium" style={{ color: "var(--text)" }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
