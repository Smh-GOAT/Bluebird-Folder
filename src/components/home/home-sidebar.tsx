"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, openAccountCenter, logout } from "@/lib/forsion/auth";
import { CreditBalance } from "@/components/layout/credit-balance";
import { authFetch } from "@/lib/forsion/fetch";
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
  refreshKey?: number;
  onSelect?: (historyId: string) => void;
  selectedId?: string | null;
}

export function HomeSidebar({ compact = false, refreshKey, onSelect, selectedId }: HomeSidebarProps) {
  const { user: forsionUser } = useAuth();
  const [folders, setFolders] = useState<Array<FolderItem & { count: number }>>([]);
  const [histories, setHistories] = useState<VideoHistoryItem[]>([]);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);
  const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistories = useMemo(() => {
    if (!searchQuery.trim()) return histories;
    const query = searchQuery.toLowerCase();
    return histories.filter((item) => item.title.toLowerCase().includes(query));
  }, [histories, searchQuery]);

  async function loadFolders() {
    const response = await authFetch("/api/folders", { cache: "no-store" });
    const result = (await response.json()) as FoldersResponse;
    if (result.code !== 0) throw new Error(result.message);
    setFolders(result.data.folders);
    return result.data;
  }

  async function loadHistories() {
    const response = await authFetch("/api/history", { cache: "no-store" });
    const result = (await response.json()) as HistoryResponse;
    if (result.code !== 0) throw new Error(result.message);
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

  // Re-fetch when analysis queue completes an item
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      refreshAll().catch((error) => {
        console.error("[home-sidebar] refresh failed", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const accountDisplayName = forsionUser?.nickname || forsionUser?.username || null;

  const folderItems = useMemo(() => folders, [folders]);

  async function onCreateFolder() {
    const name = window.prompt("输入文件夹名称");
    if (!name) return;
    const response = await authFetch("/api/folders", {
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
    if (!name || name === currentName) return;
    const response = await authFetch(`/api/folders/${folderId}`, {
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
    if (!confirmed) return;
    const response = await authFetch(`/api/folders/${folderId}`, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      window.alert(result.message ?? "删除失败");
      return;
    }
    await refreshAll();
  }

  async function onDropHistory(historyId: string, targetFolderId: string) {
    const response = await authFetch(`/api/history/${historyId}/move`, {
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
      if (!(event.target instanceof HTMLElement)) return;
      if (event.target.closest("[data-folder-menu-root='true']")) return;
      setOpenMenuFolderId(null);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      <aside className={compact ? "flex h-full min-h-0 flex-col space-y-3" : "ui-panel flex h-full min-h-0 flex-col p-4"}>
        <div className="flex min-h-0 flex-1 flex-col gap-3">

          {/* ── Folders ── */}
          <section className={compact ? "ui-panel p-3" : ""}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="ui-title">文档分类</h2>
              <button
                type="button"
                onClick={onCreateFolder}
                className="ui-btn-secondary px-2 py-1 text-xs"
              >
                新建文件夹
              </button>
            </div>
            <ul className="max-h-[38vh] space-y-1.5 overflow-y-auto pr-1">
              {folderItems.map((folder) => {
                const expanded = expandedFolderIds.includes(folder.id);
                const videosInFolder = histories.filter((item) => item.folderId === folder.id);
                const isDragOver = dragOverFolderId === folder.id;

                return (
                  <li
                    key={folder.id}
                    onDragOver={(event) => { event.preventDefault(); setDragOverFolderId(folder.id); }}
                    onDragLeave={() => setDragOverFolderId(null)}
                    onDrop={async (event) => {
                      event.preventDefault();
                      setDragOverFolderId(null);
                      const historyId = event.dataTransfer.getData("historyId");
                      if (!historyId) return;
                      await onDropHistory(historyId, folder.id);
                    }}
                    className="rounded-t-sm text-sm transition-colors"
                    style={{
                      padding: compact ? "8px 10px" : "10px 12px",
                      border: `1px solid ${isDragOver ? "var(--primary)" : "var(--border-sub)"}`,
                      borderRadius: "var(--radius-sm)",
                      background: isDragOver ? "var(--primary-tint)" : "var(--surface)",
                      boxShadow: isDragOver ? "0 0 0 2px var(--primary-glow)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <button
                          type="button"
                          className="rounded-md p-1 transition-colors"
                          style={{ color: "var(--text-muted)" }}
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
                        <span
                          className="truncate text-left text-[15px] leading-6"
                          style={{ color: "var(--text-sec)" }}
                        >
                          {folder.name}
                        </span>
                      </div>
                      <div className="grid shrink-0 grid-cols-[2rem_2rem] items-center justify-items-center">
                        <span className="w-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                          {folder.count ?? 0}
                        </span>
                        <div className="relative" data-folder-menu-root="true">
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                            style={{ color: "var(--text-muted)" }}
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
                            <div
                              className="absolute right-0 top-full z-20 mt-1.5 w-36 py-1 shadow-panel"
                              style={{
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                              }}
                            >
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                                style={{ color: "var(--text-sec)" }}
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
                              <div className="mx-2 h-px" style={{ background: "var(--border-sub)" }} />
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
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
                      <ul
                        className="mt-2 space-y-1.5 pt-2"
                        style={{ borderTop: "1px solid var(--border-sub)" }}
                      >
                        {videosInFolder.length === 0 ? (
                          <li className="px-2 text-xs" style={{ color: "var(--text-muted)" }}>
                            暂无视频
                          </li>
                        ) : (
                          videosInFolder.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                className="w-full truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors"
                                style={{ color: "var(--text-sec)" }}
                                onClick={() => onSelect?.(item.id)}
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

          {/* ── History ── */}
          <section className={compact ? "ui-panel flex min-h-0 flex-1 flex-col p-3" : "flex min-h-0 flex-1 flex-col"}>
            <h2 className="mb-3 ui-title">历史记录</h2>
            {loading ? <p className="text-xs" style={{ color: "var(--text-muted)" }}>加载中...</p> : null}

            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索历史记录..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ui-input w-full py-2 pl-9 pr-3"
                />
                <svg
                  className="absolute left-3 top-2.5 h-4 w-4"
                  style={{ color: "var(--text-subtle)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2 transition-colors"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {!loading && histories.length === 0 ? (
                <p
                  className="rounded-t-sm p-2 text-xs"
                  style={{
                    border: "1px solid var(--border-sub)",
                    background: "var(--surface-sub)",
                    color: "var(--text-muted)",
                    borderRadius: "var(--radius-xs)",
                  }}
                >
                  该分类下暂无记录
                </p>
              ) : null}
              <ul className="space-y-1.5">
                {filteredHistories.map((item) => {
                  const isActive = selectedId === item.id;
                  return (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("historyId", item.id);
                      }}
                      className="ui-card cursor-grab active:cursor-grabbing"
                      style={{
                        padding: compact ? "8px 10px" : "10px 12px",
                        ...(isActive
                          ? { borderColor: "var(--primary)", background: "var(--primary-tint)" }
                          : {}),
                      }}
                    >
                      <button
                        type="button"
                        className="line-clamp-2 w-full text-left text-[15px] font-medium leading-6"
                        style={{ color: isActive ? "var(--primary)" : "var(--text)" }}
                        onClick={() => onSelect?.(item.id)}
                      >
                        {item.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!loading && filteredHistories.length === 0 && searchQuery ? (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  未找到匹配的历史记录
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* ── Credits ── */}
        {forsionUser ? (
          <div className="mt-2 flex justify-center">
            <CreditBalance />
          </div>
        ) : null}

        {/* ── User ── */}
        <section className={compact ? "ui-panel-subtle mt-3 p-2.5" : "ui-panel-subtle mt-3 p-3"}>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-t-sm px-2 py-1.5 text-left transition-colors"
            onClick={openAccountCenter}
          >
            {forsionUser?.avatar ? (
              <img
                src={forsionUser.avatar}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: "var(--primary-tint)",
                  color: "var(--primary)",
                }}
              >
                {accountDisplayName ? accountDisplayName.slice(0, 1).toUpperCase() : "账"}
              </span>
            )}
            <span className="min-w-0">
              <span
                className="block truncate text-sm"
                style={{ color: "var(--text-sec)" }}
              >
                {accountDisplayName ? accountDisplayName : "登录 / 注册"}
              </span>
              <span className="block text-xs" style={{ color: "var(--text-muted)" }}>
                {accountDisplayName ? "管理账户" : "点击打开账户面板"}
              </span>
            </span>
          </button>
        </section>
        <button
          type="button"
          onClick={logout}
          className="mt-1 w-full rounded-md px-2 py-1 text-left text-xs transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          退出登录
        </button>
      </aside>


    </>
  );
}
