"use client";

interface GenerateStatusProps {
  isGenerating: boolean;
  error: string | null;
  onRetry: () => void;
}

export function GenerateStatus({ error, onRetry }: GenerateStatusProps) {
  if (error) {
    return (
      <section className="ui-panel-elevated flex h-full min-h-[560px] flex-col items-center justify-center p-6 text-center lg:min-h-0">
        <div className="rounded-full bg-rose-100 p-4">
          <svg
            className="h-8 w-8 text-rose-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-zinc-900">生成失败</h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="ui-btn-primary mt-6 px-6 py-2.5"
        >
          重试
        </button>
      </section>
    );
  }

  return (
    <section className="ui-panel-elevated flex h-full min-h-[560px] flex-col items-center justify-center p-6 text-center lg:min-h-0">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900">正在生成总结...</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">
        AI 正在分析视频字幕内容，请稍候。这可能需要几秒钟到一分钟的时间。
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
        处理中
      </div>
    </section>
  );
}
