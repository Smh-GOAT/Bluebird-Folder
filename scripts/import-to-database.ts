/**
 * 数据导入脚本（幂等、分批、日志）
 * 
 * 用法:
 * npx ts-node scripts/import-to-database.ts < backup_20250315.json
 */

import { PrismaClient, VideoPlatform, SubtitleSource, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

function toJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }
  return value as Prisma.InputJsonValue;
}

interface ImportData {
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

const BATCH_SIZE = 100;

function parsePlatform(platform: string): VideoPlatform {
  const map: Record<string, VideoPlatform> = {
    bilibili: VideoPlatform.bilibili,
    youtube: VideoPlatform.youtube,
    xiaohongshu: VideoPlatform.xiaohongshu,
    douyin: VideoPlatform.douyin
  };
  return map[platform] ?? VideoPlatform.bilibili;
}

function parseSubtitleSource(source?: string): SubtitleSource | null {
  if (!source) return null;
  const map: Record<string, SubtitleSource> = {
    native: SubtitleSource.platform,
    asr: SubtitleSource.asr,
    imported: SubtitleSource.imported
  };
  return map[source] ?? null;
}

async function importFolders(folders: ImportData["folders"], userId: string) {
  console.log(`开始导入文件夹: ${folders.length} 个`);
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const folder of folders) {
    try {
      await prisma.folder.upsert({
        where: { id: folder.id },
        create: {
          id: folder.id,
          userId,
          name: folder.name,
          createdAt: new Date()
        },
        update: {
          name: folder.name
        }
      });
      success++;
    } catch (error) {
      failed++;
      errors.push(`文件夹 ${folder.id}: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  console.log(`文件夹导入完成: 成功 ${success} 个, 失败 ${failed} 个`);
  if (errors.length > 0 && errors.length <= 5) {
    errors.forEach((e) => console.log(`  - ${e}`));
  } else if (errors.length > 5) {
    console.log(`  - 前5个错误:`);
    errors.slice(0, 5).forEach((e) => console.log(`    ${e}`));
    console.log(`  - ... 还有 ${errors.length - 5} 个错误`);
  }

  return { success, failed };
}

async function importHistories(histories: ImportData["histories"], userId: string) {
  console.log(`开始导入历史记录: ${histories.length} 条`);
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  let subtitleSegmentCount = 0;

  for (let i = 0; i < histories.length; i += BATCH_SIZE) {
    const batch = histories.slice(i, i + BATCH_SIZE);
    
    await prisma.$transaction(async (tx) => {
      for (const history of batch) {
        try {
          await tx.videoHistory.upsert({
            where: { id: history.id },
            create: {
              id: history.id,
              userId,
              folderId: history.folderId ?? null,
              videoId: history.videoId ?? "",
              videoUrl: history.videoUrl ?? "",
              title: history.title,
              platform: parsePlatform(history.platform),
              author: history.author ?? null,
              durationSec: history.duration ?? null,
              publishAt: history.publishAt ? new Date(history.publishAt) : null,
              subtitleSource: parseSubtitleSource(history.subtitleSource),
              fullText: history.fullText ?? null,
              subtitlesArray: history.subtitlesArray ?? [],
              translatedSubtitles: toJsonValue(history.translatedSubtitles),
              translationMeta: toJsonValue(history.translationMeta),
              summaryJson: toJsonValue(history.summaryJson),
              summaryMarkdown: history.summaryMarkdown ?? null,
              createdAt: new Date(history.createdAt)
            },
            update: {
              folderId: history.folderId ?? null,
              videoId: history.videoId ?? "",
              videoUrl: history.videoUrl ?? "",
              title: history.title,
              platform: parsePlatform(history.platform),
              author: history.author ?? null,
              durationSec: history.duration ?? null,
              publishAt: history.publishAt ? new Date(history.publishAt) : null,
              subtitleSource: parseSubtitleSource(history.subtitleSource),
              fullText: history.fullText ?? null,
              subtitlesArray: history.subtitlesArray ?? [],
              translatedSubtitles: toJsonValue(history.translatedSubtitles),
              translationMeta: toJsonValue(history.translationMeta),
              summaryJson: toJsonValue(history.summaryJson),
              summaryMarkdown: history.summaryMarkdown ?? null
            }
          });

          if (history.subtitlesArray && history.subtitlesArray.length > 0) {
            for (let idx = 0; idx < history.subtitlesArray.length; idx++) {
              const seg = history.subtitlesArray[idx];
              await tx.subtitleSegment.create({
                data: {
                  historyId: history.id,
                  idx,
                  startMs: Math.floor(seg.start * 1000),
                  endMs: Math.floor(seg.end * 1000),
                  text: seg.text,
                  lang: history.translationMeta && typeof history.translationMeta === "object" && "targetLanguage" in history.translationMeta 
                    ? (history.translationMeta as { targetLanguage?: string }).targetLanguage ?? "zh" 
                    : "zh"
                }
              });
              subtitleSegmentCount++;
            }
          }

          success++;
        } catch (error) {
          failed++;
          errors.push(`历史记录 ${history.id}: ${error instanceof Error ? error.message : "未知错误"}`);
        }
      }
    });

    console.log(`  批次 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(histories.length / BATCH_SIZE)} 完成`);
  }

  console.log(`历史记录导入完成: 成功 ${success} 条, 失败 ${failed} 条`);
  console.log(`字幕片段导入完成: ${subtitleSegmentCount} 条`);
  if (errors.length > 0 && errors.length <= 5) {
    errors.forEach((e) => console.log(`  - ${e}`));
  } else if (errors.length > 5) {
    console.log(`  - 前5个错误:`);
    errors.slice(0, 5).forEach((e) => console.log(`    ${e}`));
    console.log(`  - ... 还有 ${errors.length - 5} 个错误`);
  }

  return { success, failed, subtitleSegmentCount };
}

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0];

  const filePath = args[1];

  if (!userId) {
    console.error("用法: npx ts-node scripts/import-to-database.ts <user-id> [backup.json]");
    console.error("请提供用户ID作为参数");
    process.exit(1);
  }

  let data: ImportData;
  
  try {
    let jsonContent: string;
    
    if (filePath) {
      // 从文件读取
      const fs = await import("fs");
      jsonContent = fs.readFileSync(filePath, "utf-8");
    } else {
      // 从 stdin 读取
      jsonContent = await new Promise<string>((resolve) => {
        let result = "";
        process.stdin.on("data", (chunk) => {
          result += chunk;
        });
        process.stdin.on("end", () => {
          resolve(result);
        });
      });
    }

    data = JSON.parse(jsonContent);
  } catch (error) {
    console.error("解析输入JSON失败:", error instanceof Error ? error.message : "未知错误");
    process.exit(1);
  }

  console.log("=== 数据导入开始 ===");
  console.log(`导出时间: ${data.exportedAt}`);
  console.log(`目标用户: ${userId}`);
  console.log("");

  const folderResult = await importFolders(data.folders, userId);
  console.log("");
  
  const historyResult = await importHistories(data.histories, userId);
  console.log("");

  console.log("=== 导入完成 ===");
  console.log(`文件夹: ${folderResult.success} 成功, ${folderResult.failed} 失败`);
  console.log(`历史记录: ${historyResult.success} 成功, ${historyResult.failed} 失败`);
  console.log(`字幕片段: ${historyResult.subtitleSegmentCount} 条`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("导入失败:", error);
  process.exit(1);
});
