import { HomeSidebar } from "@/components/home/home-sidebar";
import { ExportActions } from "@/components/summary/export-actions";
import { RightPanelTabs } from "@/components/summary/right-panel-tabs";

interface SummaryShellProps {
  summaryId: string;
}

export function SummaryShell({ summaryId }: SummaryShellProps) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="ui-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900">视频总结</h1>
              <p className="mt-0.5 text-sm text-zinc-500">ID: {summaryId}</p>
            </div>
            <ExportActions />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr_320px]">
          <HomeSidebar />

          <section className="ui-panel space-y-4 p-4">
            <div className="ui-block p-3">
              <h2 className="text-sm font-semibold">视频播放器</h2>
              <div className="mt-2 flex h-60 items-center justify-center rounded-md bg-zinc-100 text-sm text-zinc-500">
                Video Player Placeholder
              </div>
            </div>
            <div className="ui-block p-3">
              <h2 className="text-sm font-semibold">AI 问答</h2>
              <div className="mt-2 space-y-2 rounded-md bg-zinc-50 p-3 text-sm">
                <p>
                  <span className="font-semibold">用户：</span>请总结这段视频的核心观点。
                </p>
                <p>
                  <span className="font-semibold">助手：</span>已基于字幕检索并生成回答（当前为演示数据）。
                </p>
              </div>
            </div>
          </section>

          <RightPanelTabs />
        </div>
      </div>
    </main>
  );
}
