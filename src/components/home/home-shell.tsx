"use client";

import { useState } from "react";
import Link from "next/link";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { LinkInputPanel } from "@/components/home/link-input-panel";
import { AnalysisQueueList } from "@/components/home/analysis-queue-list";
import { VideoDetailView } from "@/components/home/video-detail-view";
import { ModeToggle } from "@/components/layout/theme-selector";
import { useAnalysisQueue } from "@/lib/analysis-queue-context";

interface HomeShellProps {
  initialSelectedId?: string | null;
}

export function HomeShell({ initialSelectedId }: HomeShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const { refreshKey } = useAnalysisQueue();

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
        <div className="mx-auto flex h-14 max-w-[1760px] items-center justify-between px-4 sm:px-6 lg:px-8">
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
              className="text-lg font-semibold tracking-tight cursor-pointer"
              style={{ color: "var(--text)" }}
              onClick={() => setSelectedId(null)}
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

      {/* ── Layout body ── */}
      <div className="flex pt-14">
        {/* ── Sidebar ── */}
        <aside
          className={`fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-[260px] transform backdrop-blur-glass transition-transform duration-300 lg:relative lg:top-0 lg:z-auto lg:h-auto lg:min-h-[calc(100vh-3.5rem)] lg:transform-none lg:transition-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:-ml-[260px]"
          }`}
          style={{
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--border-sub)",
          }}
        >
          <div className="h-full overflow-y-auto p-3 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="ui-btn-primary mb-3 flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              新建总结
            </button>
            <HomeSidebar
              compact
              refreshKey={refreshKey}
              onSelect={(id) => setSelectedId(id)}
              selectedId={selectedId}
            />
          </div>
        </aside>

        {/* ── Backdrop (mobile only) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 backdrop-blur-sm lg:hidden"
            style={{ background: "var(--overlay)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main Content ── */}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-6 lg:py-5">
            {selectedId ? (
              <VideoDetailView historyId={selectedId} />
            ) : (
              <div className="mx-auto max-w-2xl pt-[12vh]">
                <LinkInputPanel />
                <AnalysisQueueList onSelect={(id) => setSelectedId(id)} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
