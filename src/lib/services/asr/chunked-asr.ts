import path from "node:path";
import type { SubtitleSegment } from "@/types";
import { transcribeByQwen3Asr } from "./qwen3-asr";
import { cleanupSliceArtifacts } from "@/lib/services/audio";

export interface ChunkedAsrOptions {
  onLog?: (message: string) => void;
  maxAttempts?: number;
  segmentDurationSeconds?: number;
  totalDurationSeconds?: number;
}

export interface ChunkedAsrResult {
  segments: SubtitleSegment[];
  fullText: string;
}

export class ChunkedAsrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChunkedAsrError";
  }
}

async function transcribeWithRetry(
  chunkPath: string,
  chunkIndex: number,
  maxAttempts: number,
  chunkDurationSeconds?: number,
  onLog?: (message: string) => void
): Promise<{ fullText: string; segments: SubtitleSegment[] }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        onLog?.(`[ASR] 片段 ${chunkIndex + 1} 第${attempt - 1}次重试...`);
      }

      const result = await transcribeByQwen3Asr(chunkPath, chunkDurationSeconds);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        onLog?.(`[ASR] 片段 ${chunkIndex + 1} 第${attempt}次尝试失败，准备重试...`);
        await delay(1000 * attempt);
      }
    }
  }
  
  throw new ChunkedAsrError(
    `片段 ${chunkIndex + 1} 转写失败（已重试${maxAttempts}次）: ${lastError?.message}`
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transcribeAudioChunks(
  chunkPaths: string[],
  options: ChunkedAsrOptions = {}
): Promise<ChunkedAsrResult> {
  const {
    onLog,
    maxAttempts = 2,
    segmentDurationSeconds = 180,
    totalDurationSeconds,
  } = options;
  
  if (chunkPaths.length === 0) {
    throw new ChunkedAsrError("没有可处理的音频片段");
  }
  
  const workDir = path.dirname(chunkPaths[0]);
  const allSegments: SubtitleSegment[] = [];
  const allTexts: string[] = [];
  
  try {
    onLog?.(`[ASR] 开始处理 ${chunkPaths.length} 个音频片段`);
    
    for (let i = 0; i < chunkPaths.length; i++) {
      const chunkPath = chunkPaths[i];
      const offsetSeconds = i * segmentDurationSeconds;

      // For the last chunk, calculate the actual remaining duration
      const isLastChunk = i === chunkPaths.length - 1;
      const chunkDuration =
        isLastChunk && totalDurationSeconds
          ? Math.max(0, totalDurationSeconds - i * segmentDurationSeconds)
          : segmentDurationSeconds;

      onLog?.(`[ASR] 处理片段 ${i + 1}/${chunkPaths.length} (时间偏移: +${offsetSeconds}s)`);

      const result = await transcribeWithRetry(chunkPath, i, maxAttempts, chunkDuration, onLog);
      
      const adjustedSegments = result.segments.map((segment) => ({
        start: segment.start + offsetSeconds,
        end: segment.end + offsetSeconds,
        text: segment.text
      }));
      
      allSegments.push(...adjustedSegments);
      allTexts.push(result.fullText);
    }
    
    onLog?.(`[ASR] 全部完成，共 ${chunkPaths.length} 个片段`);
    
    return {
      segments: allSegments,
      fullText: allTexts.join("\n")
    };
  } finally {
    onLog?.(`[ASR] 清理临时切片文件`);
    await cleanupSliceArtifacts(workDir);
  }
}

export async function transcribeChunked(
  audioPath: string,
  sliceOptions: { onLog?: (message: string) => void; maxAttempts?: number; totalDurationSeconds?: number } = {}
): Promise<ChunkedAsrResult> {
  const { sliceAudio } = await import("@/lib/services/audio");

  const { onLog, maxAttempts = 2, totalDurationSeconds } = sliceOptions;

  onLog?.(`[ASR] 检测到长视频，开始音频切片...`);

  const chunkPaths = await sliceAudio(audioPath, { segmentDurationSeconds: 180 });

  onLog?.(`[ASR] 音频已切片为 ${chunkPaths.length} 个片段`);

  return transcribeAudioChunks(chunkPaths, { onLog, maxAttempts, totalDurationSeconds });
}
