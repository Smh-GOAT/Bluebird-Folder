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

const VARIANT_STYLES = {
  default: {
    card: "rounded-lg bg-zinc-50 p-3 text-center",
    icon: "text-lg",
    label: "text-xs text-zinc-500",
    value: "text-sm font-medium text-zinc-800"
  },
  travel: {
    card: "rounded-lg bg-blue-50 p-3 text-center",
    icon: "text-lg",
    label: "text-xs text-zinc-500",
    value: "text-sm font-medium text-zinc-800"
  },
  academic: {
    card: "rounded-lg border border-indigo-100 bg-white p-3 text-center shadow-sm",
    icon: "text-lg",
    label: "text-xs text-zinc-500",
    value: "text-sm font-medium text-zinc-800"
  }
};

export function MetaInfoCard({
  platform,
  author,
  duration = 0,
  extraLabel,
  extraValue,
  variant = "default"
}: MetaInfoCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className={styles.card}>
        <div className={styles.icon}>📺</div>
        <div className={styles.label}>平台</div>
        <div className={styles.value}>{platform ?? "未知"}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.icon}>👤</div>
        <div className={styles.label}>{variant === "academic" ? "讲者" : "作者"}</div>
        <div className={styles.value}>{author ?? "未知"}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.icon}>⏱️</div>
        <div className={styles.label}>时长</div>
        <div className={styles.value}>{formatDuration(duration)}</div>
      </div>

      {(extraLabel || extraValue !== undefined) && (
        <div className={styles.card}>
          <div className={styles.icon}>📍</div>
          <div className={styles.label}>{extraLabel ?? "地点"}</div>
          <div className={`${styles.value} truncate px-1`}>
            {extraValue ?? "待标注"}
          </div>
        </div>
      )}
    </div>
  );
}
