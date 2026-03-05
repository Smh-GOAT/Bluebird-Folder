 "use client";

import { useState } from "react";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { LinkInputPanel } from "@/components/home/link-input-panel";

export function HomeShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);

  return (
    <div className="relative min-h-screen">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
              aria-label="切换侧边栏"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">BibiGPT</h1>
          </div>
        </div>
      </header>

      <aside
        className={`fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-[280px] transform border-r border-zinc-200 bg-zinc-50/80 backdrop-blur-sm transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-4">
          <HomeSidebar compact />
        </div>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <main className={`min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:pl-[280px]" : ""}`}>
        <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:py-8">
          <div className={`transition-all duration-500 ${!hasParsed ? "flex min-h-[60vh] flex-col items-center justify-center" : ""}`}>
            <LinkInputPanel centered={!hasParsed} onParsed={() => setHasParsed(true)} />

            {!hasParsed ? (
              <div className="mt-12 max-w-md text-center">
                <p className="text-sm text-zinc-500">支持 Bilibili、YouTube、Twitter 等主流平台</p>
                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    自动提取字幕
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-zinc-600">
                  <li>先输入视频链接并完成元信息 + 字幕/转写解析。</li>
                  <li>确认解析结果后，点击“生成总结”打开自定义弹窗。</li>
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
