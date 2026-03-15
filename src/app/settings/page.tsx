"use client";

import { useEffect, useState } from "react";

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

export default function SettingsPage() {
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
    load().catch(() => {
      setMessage("读取运行配置失败");
    });
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
    if (result.code === 0) {
      setMessage("已保存（服务端优先使用此覆盖配置）");
      return;
    }
    setMessage(result.message || "保存失败");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">API / 设置页面</h1>
      <p className="mt-2 text-sm text-zinc-600">
        管理模型提供商配置（Key / BaseURL / Model），并预留 Notion / 飞书导出入口（MVP 先占位）。
      </p>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Bilibili 访问头覆盖（Milestone 1）</h2>
        <p className="mt-1 text-xs text-zinc-500">优先使用这里的值；为空时回退到 .env 默认值。</p>

        <label className="mt-4 block text-xs font-medium text-zinc-700">User-Agent</label>
        <textarea
          value={biliUserAgent}
          onChange={(e) => setBiliUserAgent(e.target.value)}
          className="mt-1 h-24 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-zinc-400"
        />

        <label className="mt-4 block text-xs font-medium text-zinc-700">Cookie</label>
        <textarea
          value={biliCookie}
          onChange={(e) => setBiliCookie(e.target.value)}
          className="mt-1 h-28 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-zinc-400"
        />
      </section>

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">小红书访问头覆盖（Milestone 2）</h2>
        <p className="mt-1 text-xs text-zinc-500">用于真实解析与下载链路，建议填写有效登录态 Cookie。</p>

        <label className="mt-4 block text-xs font-medium text-zinc-700">User-Agent</label>
        <textarea
          value={xhsUserAgent}
          onChange={(e) => setXhsUserAgent(e.target.value)}
          className="mt-1 h-24 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-zinc-400"
        />

        <label className="mt-4 block text-xs font-medium text-zinc-700">Cookie</label>
        <textarea
          value={xhsCookie}
          onChange={(e) => setXhsCookie(e.target.value)}
          className="mt-1 h-28 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-zinc-400"
        />

        <button type="button" onClick={handleSave} className="ui-btn-primary mt-4 px-4 py-2 text-sm">
          保存覆盖配置
        </button>
        {message ? <p className="mt-2 text-xs text-zinc-600">{message}</p> : null}
      </section>
    </main>
  );
}
