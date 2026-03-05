"use client";

interface GenerateSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: {
    template: string;
    language: string;
    detail: string;
    showTimestamp: boolean;
    showEmoji: boolean;
  }) => void;
}

export function GenerateSummaryModal({ open, onClose, onConfirm }: GenerateSummaryModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">生成总结参数</h3>
        <p className="mt-1 text-xs text-zinc-500">选择模板、语言等配置后再生成总结。</p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            onConfirm({
              template: String(form.get("template") ?? "general"),
              language: String(form.get("language") ?? "zh"),
              detail: String(form.get("detail") ?? "medium"),
              showTimestamp: form.get("showTimestamp") === "on",
              showEmoji: form.get("showEmoji") === "on"
            });
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-zinc-600">模板</span>
            <select name="template" className="w-full rounded-md border px-3 py-2">
              <option value="general">通用总结</option>
              <option value="tutorial">教程拆解</option>
              <option value="interview">访谈纪要</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-zinc-600">语言</span>
            <select name="language" className="w-full rounded-md border px-3 py-2">
              <option value="zh">简体中文</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-zinc-600">细节等级</span>
            <select name="detail" className="w-full rounded-md border px-3 py-2">
              <option value="brief">简洁</option>
              <option value="medium">标准</option>
              <option value="detailed">详细</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="flex items-center gap-2 rounded-md border p-2">
              <input name="showTimestamp" type="checkbox" />
              显示时间戳
            </label>
            <label className="flex items-center gap-2 rounded-md border p-2">
              <input name="showEmoji" type="checkbox" defaultChecked />
              显示表情
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
              生成总结
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
