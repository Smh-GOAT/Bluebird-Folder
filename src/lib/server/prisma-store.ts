import { PrismaClient, VideoPlatform, SubtitleSource, Prisma } from "@prisma/client";
import type { FolderItem, VideoHistoryItem } from "@/types";

const prisma = new PrismaClient();

// Helper to convert Prisma VideoHistory to frontend VideoHistoryItem
function toVideoHistoryItem(dbHistory: {
  id: string;
  userId: string;
  folderId: string | null;
  videoId: string;
  videoUrl: string;
  title: string;
  platform: VideoPlatform;
  author: string | null;
  durationSec: number | null;
  publishAt: Date | null;
  subtitleSource: SubtitleSource | null;
  fullText: string | null;
  subtitlesArray: unknown;
  originalSubtitlesArray: unknown;
  translatedSubtitles: unknown;
  translationMeta: unknown;
  summaryJson: unknown;
  summaryMarkdown: string | null;
  createdAt: Date;
  updatedAt: Date;
}): VideoHistoryItem {
  return {
    id: dbHistory.id,
    title: dbHistory.title,
    platform: dbHistory.platform as "bilibili" | "youtube" | "xiaohongshu",
    createdAt: dbHistory.createdAt.toISOString(),
    folderId: dbHistory.folderId,
    videoId: dbHistory.videoId,
    videoUrl: dbHistory.videoUrl,
    author: dbHistory.author ?? undefined,
    duration: dbHistory.durationSec ?? undefined,
    publishAt: dbHistory.publishAt?.toISOString(),
    subtitleSource: dbHistory.subtitleSource as "native" | "asr" | undefined,
    subtitlesArray: dbHistory.subtitlesArray as unknown as VideoHistoryItem["subtitlesArray"],
    translatedSubtitles: dbHistory.translatedSubtitles as unknown as VideoHistoryItem["translatedSubtitles"],
    translationMeta: dbHistory.translationMeta as unknown as VideoHistoryItem["translationMeta"],
    fullText: dbHistory.fullText ?? undefined,
    summaryMarkdown: dbHistory.summaryMarkdown,
    summaryJson: dbHistory.summaryJson as unknown as VideoHistoryItem["summaryJson"]
  };
}

// Helper to convert frontend VideoHistoryItem to Prisma input
function toPrismaVideoHistory(
  userId: string,
  item: VideoHistoryItem
): Prisma.VideoHistoryUncheckedCreateInput {
  // Map platform string to enum
  const platformMap: Record<string, VideoPlatform> = {
    bilibili: VideoPlatform.bilibili,
    youtube: VideoPlatform.youtube,
    xiaohongshu: VideoPlatform.xiaohongshu,
    douyin: VideoPlatform.douyin
  };

  // Map subtitleSource string to enum
  const subtitleSourceMap: Record<string, SubtitleSource> = {
    native: SubtitleSource.platform,
    asr: SubtitleSource.asr,
    imported: SubtitleSource.imported
  };

  return {
    id: item.id,
    userId,
    folderId: item.folderId ?? null,
    videoId: item.videoId ?? "",
    videoUrl: item.videoUrl ?? "",
    title: item.title,
    platform: platformMap[item.platform] ?? VideoPlatform.bilibili,
    author: item.author ?? null,
    durationSec: item.duration ?? null,
    publishAt: item.publishAt ? new Date(item.publishAt) : null,
    subtitleSource: item.subtitleSource ? subtitleSourceMap[item.subtitleSource] ?? null : null,
    fullText: item.fullText ?? null,
    subtitlesArray: (item.subtitlesArray as unknown as Prisma.InputJsonValue) ?? [],
    translatedSubtitles: item.translatedSubtitles
      ? (item.translatedSubtitles as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    translationMeta: item.translationMeta
      ? (item.translationMeta as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    summaryJson: item.summaryJson
      ? (item.summaryJson as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    summaryMarkdown: item.summaryMarkdown ?? null,
    createdAt: new Date(item.createdAt)
  };
}

// Folder operations
export async function listFolders(userId: string): Promise<FolderItem[]> {
  const folders = await prisma.folder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return folders.map((folder) => ({
    id: folder.id,
    name: folder.name
  }));
}

export async function createFolder(userId: string, name: string): Promise<FolderItem> {
  const normalized = name.trim();
  if (!normalized) {
    throw new Error("文件夹名称不能为空");
  }

  try {
    const folder = await prisma.folder.create({
      data: {
        userId,
        name: normalized
      }
    });

    return {
      id: folder.id,
      name: folder.name
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new Error("文件夹名称已存在");
    }
    throw error;
  }
}

export async function renameFolder(userId: string, id: string, name: string): Promise<FolderItem> {
  const normalized = name.trim();
  if (!normalized) {
    throw new Error("文件夹名称不能为空");
  }

  try {
    const folder = await prisma.folder.update({
      where: { id, userId },
      data: { name: normalized }
    });

    return {
      id: folder.id,
      name: folder.name
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      throw new Error("文件夹不存在");
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new Error("文件夹名称已存在");
    }
    throw error;
  }
}

export async function deleteFolder(userId: string, id: string): Promise<void> {
  try {
    // First, unassign all histories from this folder
    await prisma.videoHistory.updateMany({
      where: { folderId: id, userId },
      data: { folderId: null }
    });

    // Then delete the folder
    await prisma.folder.delete({
      where: { id, userId }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      throw new Error("文件夹不存在");
    }
    throw error;
  }
}

// History operations
export async function listHistories(userId: string, folderId?: string): Promise<VideoHistoryItem[]> {
  const where: { userId: string; folderId?: string | null } = { userId };

  if (folderId && folderId !== "all") {
    if (folderId === "unassigned") {
      where.folderId = null;
    } else {
      where.folderId = folderId;
    }
  }

  const histories = await prisma.videoHistory.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return histories.map(toVideoHistoryItem);
}

export async function getHistoryById(userId: string, id: string): Promise<VideoHistoryItem | null> {
  const history = await prisma.videoHistory.findFirst({
    where: { id, userId }
  });

  if (!history) return null;
  return toVideoHistoryItem(history);
}

export async function saveHistory(userId: string, history: VideoHistoryItem): Promise<VideoHistoryItem> {
  const data = toPrismaVideoHistory(userId, history);

  const saved = await prisma.videoHistory.upsert({
    where: { id: history.id },
    create: data,
    update: {
      folderId: data.folderId,
      videoId: data.videoId,
      videoUrl: data.videoUrl,
      title: data.title,
      platform: data.platform,
      author: data.author,
      durationSec: data.durationSec,
      publishAt: data.publishAt,
      subtitleSource: data.subtitleSource,
      fullText: data.fullText,
      subtitlesArray: data.subtitlesArray as Prisma.InputJsonValue,
      translatedSubtitles: data.translatedSubtitles as Prisma.InputJsonValue,
      translationMeta: data.translationMeta as Prisma.InputJsonValue,
      summaryJson: data.summaryJson as Prisma.InputJsonValue,
      summaryMarkdown: data.summaryMarkdown
    }
  });

  return toVideoHistoryItem(saved);
}

export async function moveHistoryToFolder(
  userId: string,
  historyId: string,
  folderId: string | null
): Promise<VideoHistoryItem> {
  // Verify folder exists if provided
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId }
    });
    if (!folder) {
      throw new Error("目标文件夹不存在");
    }
  }

  try {
    const updated = await prisma.videoHistory.update({
      where: { id: historyId, userId },
      data: { folderId }
    });

    return toVideoHistoryItem(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      throw new Error("历史记录不存在");
    }
    throw error;
  }
}

export async function getFolderCounts(userId: string): Promise<{
  total: number;
  unassigned: number;
  folders: Record<string, number>;
}> {
  const histories = await prisma.videoHistory.findMany({
    where: { userId },
    select: { folderId: true }
  });

  const map = new Map<string, number>();
  let unassignedCount = 0;

  histories.forEach((history) => {
    if (!history.folderId) {
      unassignedCount += 1;
      return;
    }
    map.set(history.folderId, (map.get(history.folderId) ?? 0) + 1);
  });

  return {
    total: histories.length,
    unassigned: unassignedCount,
    folders: Object.fromEntries(map)
  };
}

export { prisma };
