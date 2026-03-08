import Link from "next/link";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { ExportActions } from "@/components/summary/export-actions";
import { RightPanelTabs } from "@/components/summary/right-panel-tabs";

interface SummaryShellProps {
  summaryId: string;
}

export function SummaryShell({ summaryId }: SummaryShellProps) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-[96vw] max-w-[1760px] space-y-3 px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
        <header className="ui-panel px-4 py-2.5 lg:px-5 lg:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M11.78 4.22a.75.75 0 010 1.06L8.06 9h7.19a.75.75 0 010 1.5H8.06l3.72 3.72a.75.75 0 11-1.06 1.06l-5-5a.75.75 0 010-1.06l5-5a.75.75 0 011.06 0z"
                    clipRule="evenodd"
                  />
                </svg>
                新总结
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-zinc-900 lg:text-xl">视频总结</h1>
                <p className="text-xs text-zinc-500 lg:text-sm">ID: {summaryId}</p>
              </div>
            </div>
            <ExportActions />
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-8.5rem)] grid-cols-1 gap-4 lg:grid-cols-[220px_400px_minmax(680px,1fr)] xl:grid-cols-[220px_440px_minmax(720px,1fr)]">
          <HomeSidebar compact />

          <section className="ui-panel space-y-3 p-3.5 lg:p-4">
            <div className="ui-block p-3">
              <h2 className="text-sm font-semibold">视频播放器</h2>
              <div className="mt-2.5 aspect-video w-full rounded-lg bg-zinc-100 text-sm text-zinc-500">
                <div className="flex h-full items-center justify-center">Video Player Placeholder</div>
              </div>
            </div>
            <div className="ui-block p-3">
              <h2 className="text-sm font-semibold">AI 问答</h2>
              <div className="mt-2.5 space-y-2 rounded-lg bg-zinc-50 p-2.5 text-sm">
                <p>
                  <span className="font-semibold">用户：</span>请总结这段视频的核心观点。
                </p>
                <p>
                  <span className="font-semibold">助手：</span>已基于字幕检索并生成回答（当前为演示数据）。
                </p>
              </div>
            </div>
          </section>

          <aside className="self-start lg:sticky lg:top-3 lg:h-[calc(100vh-7rem)]">
            <RightPanelTabs />
          </aside>
        </div>
      </div>
    </main>
  );
}
