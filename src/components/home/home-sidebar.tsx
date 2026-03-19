"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/user/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
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

interface HomeSidebarProps {
  compact?: boolean;
  onLoginClick?: () => void;
}

export function HomeSidebar({ compact = false, onLoginClick }: HomeSidebarProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [folders, setFolders] = useState<Array<FolderItem & { count: number }>>([]);
  const [histories, setHistories] = useState<VideoHistoryItem[]>([]);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);
  const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);
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

  async function loadHistories() {
    const response = await fetch("/api/history", { cache: "no-store" });
    const result = (await response.json()) as HistoryResponse;
    if (result.code !== 0) {
      throw new Error(result.message);
    }
    setHistories(result.data.items);
  }

  async function refreshAll() {
    setLoading(true);
    try {
      await loadFolders();
      await loadHistories();
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

  const folderItems = useMemo(() => folders, [folders]);

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
    await refreshAll();
  }

  async function onDropHistory(historyId: string, targetFolderId: string) {
    const response = await fetch(`/api/history/${historyId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId: targetFolderId })
    });
    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      window.alert(result.message ?? "拖拽移动失败");
      return;
    }
    await refreshAll();
  }

  function toggleFolderExpand(folderId: string) {
    setExpandedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      if (event.target.closest("[data-folder-menu-root='true']")) {
        return;
      }
      setOpenMenuFolderId(null);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      <aside className={compact ? "flex h-full min-h-0 flex-col space-y-3" : "ui-panel flex h-full min-h-0 flex-col p-4"}>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <section className={compact ? "ui-panel p-3" : ""}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="ui-title">文档分类</h2>
          <button
            type="button"
            onClick={onCreateFolder}
            className="ui-btn-secondary px-2 py-1 text-xs"
          >
            新建文件
          </button>
        </div>
        <ul className="max-h-[38vh] space-y-2 overflow-y-auto pr-1">
          {folderItems.map((folder) => {
            const expanded = expandedFolderIds.includes(folder.id);
            const videosInFolder = histories.filter((item) => item.folderId === folder.id);

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
                  await onDropHistory(historyId, folder.id);
                }}
                className={`rounded-xl border border-zinc-200 ${compact ? "px-2.5 py-2" : "px-3 py-2.5"} text-sm transition hover:border-zinc-300 hover:bg-zinc-50 ${
                  dragOverFolderId === folder.id ? "bg-zinc-50 ring-2 ring-zinc-300" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <button
                      type="button"
                      className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100"
                      onClick={() => toggleFolderExpand(folder.id)}
                      aria-label={expanded ? "收起文件夹" : "展开文件夹"}
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : "rotate-0"}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M7 5l6 5-6 5V5z" />
                      </svg>
                    </button>
                    <span className="truncate text-left text-[15px] leading-6 text-zinc-800">{folder.name}</span>
                  </div>
                  <div className="grid shrink-0 grid-cols-[2rem_2rem] items-center justify-items-center">
                    <span className="w-8 text-center text-xs text-zinc-500">{folder.count ?? 0}</span>
                    <div className="relative" data-folder-menu-root="true">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
                        onClick={() =>
                          setOpenMenuFolderId((current) => (current === folder.id ? null : folder.id))
                        }
                        aria-label="更多操作"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <circle cx="10" cy="4" r="1.5" />
                          <circle cx="10" cy="10" r="1.5" />
                          <circle cx="10" cy="16" r="1.5" />
                        </svg>
                      </button>
                      {openMenuFolderId === folder.id ? (
                        <div className="absolute right-0 top-full z-20 mt-1.5 w-36 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                            onClick={() => {
                              onRenameFolder(folder.id, folder.name).catch((error) => {
                                console.error("[home-sidebar] rename folder failed", error);
                              });
                              setOpenMenuFolderId(null);
                            }}
                          >
                            <span>✏️</span>
                            重命名
                          </button>
                          <div className="mx-2 h-px bg-zinc-100" />
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              onDeleteFolder(folder.id).catch((error) => {
                                console.error("[home-sidebar] delete folder failed", error);
                              });
                              setOpenMenuFolderId(null);
                            }}
                          >
                            <span>🗑️</span>
                            删除
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {expanded ? (
                  <ul className="mt-2 space-y-1.5 border-t border-zinc-100 pt-2">
                    {videosInFolder.length === 0 ? (
                      <li className="px-2 text-xs text-zinc-500">暂无视频</li>
                    ) : (
                      videosInFolder.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            className="w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                            onClick={() => router.push(`/summary/${item.id}`)}
                            title={item.title}
                          >
                            {item.title}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
          </section>

          <section className={compact ? "ui-panel flex min-h-0 flex-1 flex-col p-3" : "flex min-h-0 flex-1 flex-col"}>
            <h2 className="mb-3 ui-title">历史记录</h2>
            {loading ? <p className="text-xs text-zinc-500">加载中...</p> : null}
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
                    className={`cursor-grab rounded-xl border border-zinc-200 ${compact ? "px-2.5 py-2" : "px-3 py-2.5"} text-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:cursor-grabbing`}
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
            </div>
          </section>
        </div>

        <section className={compact ? "ui-panel-subtle mt-3 p-2.5" : "ui-panel-subtle mt-3 p-3"}>
          {isAuthenticated && user ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-zinc-100"
              onClick={onLoginClick}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
                账
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-zinc-700">
                  登录 / 注册
                </span>
                <span className="block text-xs text-zinc-500">
                  点击打开账户面板
                </span>
              </span>
            </button>
          )}
        </section>
      </aside>
    </>
  );
}
