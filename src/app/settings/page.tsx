"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme-provider";

interface RuntimeConfigResponse {
  code: number;
  data: {
    bilibiliCookie: string;
    bilibiliUserAgent: string;
    xiaohongshuCookie: string;
    xiaohongshuUserAgent: string;
  };
  message: string;
}

const THEME_OPTIONS = [
  {
    id: "apple" as const,
    label: "Apple",
    desc: "简洁磨砂玻璃风，灵感来自 macOS",
    preview: ["#F5F5F7", "#0071E3", "#1C1C1E"],
  },
  {
    id: "forsion" as const,
    label: "Forsion",
    desc: "天蓝渐变，Forsion 品牌配色",
    preview: ["#EFF6FF", "#0EA5E9", "#08090f"],
  },
  {
    id: "notion" as const,
    label: "Notion",
    desc: "暖米纸质感，Notion 风格阅读体验",
    preview: ["#F7F6F3", "#2EAADC", "#191919"],
  },
] as const;

export default function SettingsPage() {
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const [biliCookie, setBiliCookie] = useState("");
  const [biliUserAgent, setBiliUserAgent] = useState("");
  const [xhsCookie, setXhsCookie] = useState("");
  const [xhsUserAgent, setXhsUserAgent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/settings/runtime", { cache: "no-store" });
      const result = (await response.json()) as RuntimeConfigResponse;
      if (result.code === 0) {
        setBiliCookie(result.data.bilibiliCookie);
        setBiliUserAgent(result.data.bilibiliUserAgent);
        setXhsCookie(result.data.xiaohongshuCookie);
        setXhsUserAgent(result.data.xiaohongshuUserAgent);
      }
    }
    load().catch(() => { setMessage("读取运行配置失败"); });
  }, []);

  async function handleSave() {
    setMessage("");
    const response = await fetch("/api/settings/runtime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bilibiliCookie: biliCookie,
        bilibiliUserAgent: biliUserAgent,
        xiaohongshuCookie: xhsCookie,
        xiaohongshuUserAgent: xhsUserAgent
      })
    });
    const result = (await response.json()) as RuntimeConfigResponse;
    setMessage(result.code === 0 ? "已保存（服务端优先使用此覆盖配置）" : result.message || "保存失败");
  }

  return (
    <main className="mx-auto max-w-3xl p-6" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>设置</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
        管理外观偏好、模型提供商配置和平台访问头。
      </p>

      {/* ── 外观 ── */}
      <section
        className="mt-6 p-5"
        style={{
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>外观</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          选择主题风格和亮色 / 暗色模式，偏好会自动保存到浏览器。
        </p>

        {/* Theme cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_OPTIONS.map(({ id, label, desc, preview }) => {
            const isActive = theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className="flex flex-col items-start p-3 text-left transition-all"
                style={{
                  borderRadius: "var(--radius-sm)",
                  border: isActive
                    ? "2px solid var(--primary)"
                    : "1.5px solid var(--border-sub)",
                  background: isActive ? "var(--primary-tint)" : "var(--surface-sub)",
                  cursor: "pointer",
                }}
              >
                {/* Color swatches */}
                <div className="mb-2 flex gap-1.5">
                  {preview.map((color, i) => (
                    <span
                      key={i}
                      className="inline-block h-4 w-4 rounded-full border"
                      style={{
                        background: color,
                        borderColor: "var(--border-sub)",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: isActive ? "var(--primary)" : "var(--text)" }}
                >
                  {label}
                  {isActive && (
                    <span className="ml-1.5 text-[10px] font-normal opacity-70">✓ 当前</span>
                  )}
                </span>
                <span className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Light / Dark toggle */}
        <div
          className="mt-4 flex items-center justify-between p-3"
          style={{
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-sub)",
            background: "var(--surface-sub)",
          }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {mode === "light" ? "亮色模式" : "暗色模式"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {mode === "light" ? "使用浅色背景，适合白天使用" : "使用深色背景，适合夜间使用"}
            </p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            onClick={toggleMode}
            className="relative flex-shrink-0"
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "var(--radius-pill)",
              background: mode === "dark" ? "var(--primary)" : "var(--border-sub)",
              border: "none",
              cursor: "pointer",
              transition: "background 200ms ease",
            }}
            title={mode === "light" ? "切换到暗色" : "切换到亮色"}
          >
            <span
              className="absolute top-[3px] left-[3px]"
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: mode === "dark" ? "translateX(20px)" : "translateX(0)",
                display: "block",
              }}
            />
          </button>
        </div>
      </section>

      {/* Bilibili */}
      <section
        className="mt-6 p-4"
        style={{
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          Bilibili 访问头覆盖（Milestone 1）
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          优先使用这里的值；为空时回退到 .env 默认值。
        </p>
        <label className="mt-4 block text-xs font-medium" style={{ color: "var(--text-sec)" }}>User-Agent</label>
        <textarea
          value={biliUserAgent}
          onChange={(e) => setBiliUserAgent(e.target.value)}
          className="ui-textarea mt-1"
          style={{ height: "96px" }}
        />
        <label className="mt-4 block text-xs font-medium" style={{ color: "var(--text-sec)" }}>Cookie</label>
        <textarea
          value={biliCookie}
          onChange={(e) => setBiliCookie(e.target.value)}
          className="ui-textarea mt-1"
          style={{ height: "112px" }}
        />
      </section>

      {/* Xiaohongshu */}
      <section
        className="mt-4 p-4"
        style={{
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          小红书访问头覆盖（Milestone 2）
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          用于真实解析与下载链路，建议填写有效登录态 Cookie。
        </p>
        <label className="mt-4 block text-xs font-medium" style={{ color: "var(--text-sec)" }}>User-Agent</label>
        <textarea
          value={xhsUserAgent}
          onChange={(e) => setXhsUserAgent(e.target.value)}
          className="ui-textarea mt-1"
          style={{ height: "96px" }}
        />
        <label className="mt-4 block text-xs font-medium" style={{ color: "var(--text-sec)" }}>Cookie</label>
        <textarea
          value={xhsCookie}
          onChange={(e) => setXhsCookie(e.target.value)}
          className="ui-textarea mt-1"
          style={{ height: "112px" }}
        />

        <button type="button" onClick={handleSave} className="ui-btn-primary mt-4 px-4 py-2 text-sm">
          保存覆盖配置
        </button>
        {message ? (
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>{message}</p>
        ) : null}
      </section>
    </main>
  );
}
