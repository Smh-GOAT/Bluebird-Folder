"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/layout/auth-panel";
import type { FolderItem, VideoHistoryItem } from "@/types";

interface FoldersResponse {
  code: number;
  data: {
    folders: Array<FolderItem & { count: number }>;
    total: number;
    unassigned: number;
  };
  message: string;
}

interface HistoryResponse {
  code: number;
  data: { items: VideoHistoryItem[] };
  message: string;
}

const ALL_FOLDER_ID = "all";
const UNASSIGNED_FOLDER_ID = "unassigned";

interface HomeSidebarProps {
  compact?: boolean;
}

export function HomeSidebar({ compact = false }: HomeSidebarProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<Array<FolderItem & { count: number }>>([]);
  const [histories, setHistories] = useState<VideoHistoryItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(ALL_FOLDER_ID);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadFolders() {
    const response = await fetch("/api/folders", { cache: "no-store" });
    const result = (await response.json()) as FoldersResponse;
    if (result.code !== 0) {
      throw new Error(result.message);
    }
    setFolders(result.data.folders);
    return result.data;
  }

  async function loadHistories(folderId = selectedFolderId) {
    const query = folderId === ALL_FOLDER_ID ? "" : `?folderId=${folderId}`;
    const response = await fetch(`/api/history${query}`, { cache: "no-store" });
    const result = (await response.json()) as HistoryResponse;
    if (result.code !== 0) {
      throw new Error(result.message);
    }
    setHistories(result.data.items);
  }

  async function refreshAll(folderId = selectedFolderId) {
    setLoading(true);
    try {
      await loadFolders();
      await loadHistories(folderId);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll().catch((error) => {
      console.error("[home-sidebar] init failed", error);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const folderItems = useMemo(() => {
    const total = folders.reduce((sum, folder) => sum + (folder.count ?? 0), 0);
    const unassigned = histories.filter((history) => !history.folderId).length;
    return [
      { id: ALL_FOLDER_ID, name: "全部历史", count: total },
      ...folders,
      { id: UNASSIGNED_FOLDER_ID, name: "未分类", count: unassigned }
    ];
  }, [folders, histories]);

  async function onSelectFolder(folderId: string) {
    setSelectedFolderId(folderId);
    await loadHistories(folderId);
  }

  async function onCreateFolder() {
    const name = window.prompt("输入文件夹名称");
    if (!name) {
      return;
    }
    const response = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      window.alert(result.message ?? "创建失败");
      return;
    }
    await refreshAll();
  }

  async function onRenameFolder(folderId: string, currentName: string) {
    const name = window.prompt("输入新名称", currentName);
    if (!name || name === currentName) {
      return;
    }
    const response = await fetch(`/api/folders/${folderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      window.alert(result.message ?? "重命名失败");
      return;
    }
    await refreshAll();
  }

  async function onDeleteFolder(folderId: string) {
    const confirmed = window.confirm("删除后，文件夹内历史会转到未分类。确定删除？");
    if (!confirmed) {
      return;
    }
    const response = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      window.alert(result.message ?? "删除失败");
      return;
    }
    if (selectedFolderId === folderId) {
      setSelectedFolderId(ALL_FOLDER_ID);
    }
    await refreshAll(selectedFolderId === folderId ? ALL_FOLDER_ID : selectedFolderId);
  }

  async function onDropHistory(historyId: string, targetFolderId: string) {
    const folderId = targetFolderId === UNASSIGNED_FOLDER_ID ? null : targetFolderId;
    const response = await fetch(`/api/history/${historyId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId })
    });
    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      window.alert(result.message ?? "拖拽移动失败");
      return;
    }
    await refreshAll(selectedFolderId);
  }

  return (
    <aside className={compact ? "space-y-4" : "ui-panel space-y-5 p-4"}>
      <section className={compact ? "ui-panel-elevated p-4" : ""}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="ui-title">文档分类</h2>
          <button
            type="button"
            onClick={onCreateFolder}
            className="ui-btn-secondary px-2.5 py-1 text-xs"
          >
            新建文件
          </button>
        </div>
        <ul className="space-y-2">
          {folderItems.map((folder) => {
            const selected = selectedFolderId === folder.id;
            const folderEditable = folder.id !== ALL_FOLDER_ID && folder.id !== UNASSIGNED_FOLDER_ID;
            return (
              <li
                key={folder.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverFolderId(folder.id);
                }}
                onDragLeave={() => setDragOverFolderId(null)}
                onDrop={async (event) => {
                  event.preventDefault();
                  setDragOverFolderId(null);
                  const historyId = event.dataTransfer.getData("historyId");
                  if (!historyId) {
                    return;
                  }
                  if (folder.id === ALL_FOLDER_ID) {
                    return;
                  }
                  await onDropHistory(historyId, folder.id);
                }}
                className={`rounded-xl border border-zinc-200 px-3 py-2.5 text-sm transition ${
                  selected ? "border-zinc-300 bg-zinc-100/80" : "hover:border-zinc-300 hover:bg-zinc-50"
                } ${dragOverFolderId === folder.id ? "bg-zinc-50 ring-2 ring-zinc-300" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="truncate text-left text-[15px] leading-6 text-zinc-800 hover:text-zinc-950"
                    onClick={() => {
                      onSelectFolder(folder.id).catch((error) => {
                        console.error("[home-sidebar] select folder failed", error);
                      });
                    }}
                  >
                    {folder.name}
                  </button>
                  <span className="shrink-0 text-xs text-zinc-500">{folder.count ?? 0}</span>
                </div>
                {folderEditable ? (
                  <div className="mt-2 flex gap-2 text-xs">
                    <button
                      type="button"
                      className="ui-btn-secondary px-2 py-1 text-xs"
                      onClick={() => {
                        onRenameFolder(folder.id, folder.name).catch((error) => {
                          console.error("[home-sidebar] rename folder failed", error);
                        });
                      }}
                    >
                      重命名
                    </button>
                    <button
                      type="button"
                      className="ui-btn-danger px-2 py-1 text-xs"
                      onClick={() => {
                        onDeleteFolder(folder.id).catch((error) => {
                          console.error("[home-sidebar] delete folder failed", error);
                        });
                      }}
                    >
                      删除
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={compact ? "ui-panel p-4" : ""}>
        <h2 className="mb-3 ui-title">历史记录</h2>
        {loading ? <p className="text-xs text-zinc-500">加载中...</p> : null}
        {!loading && histories.length === 0 ? (
          <p className="rounded-md border bg-zinc-50 p-2 text-xs text-zinc-500">该分类下暂无记录</p>
        ) : null}
        <ul className="space-y-2">
          {histories.map((item) => (
            <li
              key={item.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("historyId", item.id);
              }}
              className="cursor-grab rounded-xl border border-zinc-200 px-3 py-2.5 text-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:cursor-grabbing"
            >
              <button
                type="button"
                className="line-clamp-2 w-full text-left text-[15px] font-medium leading-6 text-zinc-800 hover:text-zinc-950"
                onClick={() => router.push(`/summary/${item.id}`)}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={compact ? "ui-panel-subtle p-4" : ""}>
        <AuthPanel />
      </section>
    </aside>
  );
}
