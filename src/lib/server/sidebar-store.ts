import { mockFolders, mockHistory } from "@/lib/mock-data";
import type { FolderItem, VideoHistoryItem } from "@/types";

export const UNASSIGNED_FOLDER_ID = "unassigned";

type SidebarStore = {
  folders: FolderItem[];
  histories: VideoHistoryItem[];
};

declare global {
  var __sidebarStore__: SidebarStore | undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createStore(): SidebarStore {
  return {
    folders: clone(mockFolders),
    histories: clone(mockHistory)
  };
}

function getStore(): SidebarStore {
  if (!globalThis.__sidebarStore__) {
    globalThis.__sidebarStore__ = createStore();
  }
  return globalThis.__sidebarStore__;
}

export function listFolders() {
  return getStore().folders;
}

export function createFolder(name: string) {
  const store = getStore();
  const normalized = name.trim();
  if (!normalized) {
    throw new Error("文件夹名称不能为空");
  }
  const duplicated = store.folders.some((item) => item.name === normalized);
  if (duplicated) {
    throw new Error("文件夹名称已存在");
  }

  const folder: FolderItem = {
    id: `folder-${Date.now()}`,
    name: normalized
  };
  store.folders.unshift(folder);
  return folder;
}

export function renameFolder(id: string, name: string) {
  const store = getStore();
  const normalized = name.trim();
  if (!normalized) {
    throw new Error("文件夹名称不能为空");
  }
  const duplicated = store.folders.some((item) => item.id !== id && item.name === normalized);
  if (duplicated) {
    throw new Error("文件夹名称已存在");
  }

  const folder = store.folders.find((item) => item.id === id);
  if (!folder) {
    throw new Error("文件夹不存在");
  }
  folder.name = normalized;
  return folder;
}

export function deleteFolder(id: string) {
  const store = getStore();
  const exists = store.folders.some((item) => item.id === id);
  if (!exists) {
    throw new Error("文件夹不存在");
  }
  store.folders = store.folders.filter((item) => item.id !== id);
  store.histories = store.histories.map((item) => (item.folderId === id ? { ...item, folderId: null } : item));
}

export function listHistories(folderId?: string) {
  const histories = getStore().histories;
  if (!folderId || folderId === "all") {
    return histories;
  }
  if (folderId === UNASSIGNED_FOLDER_ID) {
    return histories.filter((item) => !item.folderId);
  }
  return histories.filter((item) => item.folderId === folderId);
}

export function getHistoryById(id: string) {
  return getStore().histories.find((item) => item.id === id) ?? null;
}

export function saveHistory(history: VideoHistoryItem) {
  const store = getStore();
  const existedIndex = store.histories.findIndex((item) => item.id === history.id);
  if (existedIndex >= 0) {
    store.histories[existedIndex] = history;
    return store.histories[existedIndex];
  }

  store.histories.unshift(history);
  return history;
}

export function moveHistoryToFolder(historyId: string, folderId: string | null) {
  const store = getStore();
  const history = store.histories.find((item) => item.id === historyId);
  if (!history) {
    throw new Error("历史记录不存在");
  }
  if (folderId) {
    const folderExists = store.folders.some((item) => item.id === folderId);
    if (!folderExists) {
      throw new Error("目标文件夹不存在");
    }
  }
  history.folderId = folderId;
  return history;
}

export function getFolderCounts() {
  const store = getStore();
  const map = new Map<string, number>();
  let unassignedCount = 0;

  store.histories.forEach((history) => {
    if (!history.folderId) {
      unassignedCount += 1;
      return;
    }
    map.set(history.folderId, (map.get(history.folderId) ?? 0) + 1);
  });

  return {
    total: store.histories.length,
    unassigned: unassignedCount,
    folders: Object.fromEntries(map)
  };
}
