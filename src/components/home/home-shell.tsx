"use client";

import { useState } from "react";
import Link from "next/link";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { LinkInputPanel } from "@/components/home/link-input-panel";
import { ModeToggle } from "@/components/layout/theme-selector";

export function HomeShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg)" }}>
      {/* ── Header ── */}
      <header
        className="fixed left-0 right-0 top-0 z-40 backdrop-blur-glass"
        style={{
          background: "var(--header-bg)",
          borderBottom: "1px solid var(--border-sub)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-t-sm p-2 transition-colors"
              style={{ color: "var(--text-muted)" }}
              aria-label="切换侧边栏"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Bluebird Folder
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link
              href="/settings"
              className="rounded-t-sm p-2 transition-colors"
              style={{ color: "var(--text-muted)" }}
              title="设置"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Sidebar overlay ── */}
      <aside
        className={`fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-[280px] transform backdrop-blur-glass transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border-sub)",
        }}
      >
        <div className="h-full overflow-y-auto p-4">
          <HomeSidebar compact />
        </div>
      </aside>

      {/* ── Backdrop ── */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-20 backdrop-blur-sm"
          style={{ background: "var(--overlay)" }}
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* ── Main ── */}
      <main
        className={`min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:pl-[280px]" : ""}`}
      >
        <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:py-8">
          <div
            className={`transition-all duration-500 ${!hasParsed ? "flex min-h-[60vh] flex-col items-center justify-center" : ""}`}
          >
            <LinkInputPanel centered={!hasParsed} onParsed={() => setHasParsed(true)} />

            {!hasParsed ? (
              <div className="mt-12 max-w-md text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  支持 Bilibili、小红书等主流平台
                </p>
                <div className="mt-6 flex items-center justify-center gap-6 text-xs" style={{ color: "var(--text-subtle)" }}>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    自动提取字幕
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />
                    AI 智能总结
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    一键导出
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {hasParsed ? (
            <div className="mt-6">
              <div className="ui-panel p-5">
                <h2 className="ui-title">流程说明</h2>
                <ol
                  className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6"
                  style={{ color: "var(--text-sec)" }}
                >
                  <li>先输入视频链接并完成元信息 + 字幕/转写解析。</li>
                  <li>确认解析结果后，点击"生成总结"打开自定义弹窗。</li>
                  <li>选择模板和语言参数后，进入总结页查看三列内容并导出。</li>
                </ol>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
