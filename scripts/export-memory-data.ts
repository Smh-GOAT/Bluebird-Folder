/**
 * 内存数据导出脚本
 * 
 * 用法:
 * npx ts-node scripts/export-memory-data.ts > backup_$(date +%Y%m%d).json
 */

import { listFolders, listHistories } from "../src/lib/server/sidebar-store";

interface ExportData {
  folders: Array<{
    id: string;
    name: string;
  }>;
  histories: Array<{
    id: string;
    title: string;
    platform: string;
    createdAt: string;
    folderId?: string | null;
    videoId?: string;
    videoUrl?: string;
    author?: string;
    duration?: number;
    publishAt?: string;
    subtitleSource?: string;
    subtitlesArray?: Array<{ start: number; end: number; text: string }>;
    translatedSubtitles?: unknown;
    translationMeta?: unknown;
    fullText?: string;
    summaryMarkdown?: string | null;
    summaryJson?: unknown;
  }>;
  exportedAt: string;
}

function main() {
  const folders = listFolders();
  const histories = listHistories();

  const exportData: ExportData = {
    folders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name
    })),
    histories: histories.map((history) => ({
      id: history.id,
      title: history.title,
      platform: history.platform,
      createdAt: history.createdAt,
      folderId: history.folderId,
      videoId: history.videoId,
      videoUrl: history.videoUrl,
      author: history.author,
      duration: history.duration,
      publishAt: history.publishAt,
      subtitleSource: history.subtitleSource,
      subtitlesArray: history.subtitlesArray,
      translatedSubtitles: history.translatedSubtitles,
      translationMeta: history.translationMeta,
      fullText: history.fullText,
      summaryMarkdown: history.summaryMarkdown,
      summaryJson: history.summaryJson
    })),
    exportedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(exportData, null, 2));
}

main();
