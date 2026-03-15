import path from "node:path";
import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

export interface SliceAudioOptions {
  segmentDurationSeconds?: number;
  outputFormat?: string;
}

export class FfmpegNotFoundError extends Error {
  constructor() {
    super("ffmpeg 未安装或未添加到 PATH。请先安装 ffmpeg：https://ffmpeg.org/download.html");
    this.name = "FfmpegNotFoundError";
  }
}

export class AudioSliceError extends Error {
  constructor(message: string) {
    super(`音频切片失败: ${message}`);
    this.name = "AudioSliceError";
  }
}

async function checkFfmpegInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

async function runFfmpeg(
  inputPath: string,
  outputPattern: string,
  segmentDuration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-i", inputPath,
      "-f", "segment",
      "-segment_time", String(segmentDuration),
      "-c", "copy",
      "-reset_timestamps", "1",
      outputPattern
    ];

    const child = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stderr = "";
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      reject(new AudioSliceError(`ffmpeg 启动失败: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new AudioSliceError(`ffmpeg 退出码 ${code}: ${stderr}`));
      } else {
        resolve();
      }
    });
  });
}

async function verifyChunkFiles(chunkPaths: string[]): Promise<void> {
  for (const chunkPath of chunkPaths) {
    try {
      const stats = await fs.stat(chunkPath);
      if (stats.size === 0) {
        throw new AudioSliceError(`切片文件为空: ${path.basename(chunkPath)}`);
      }
    } catch {
      throw new AudioSliceError(`切片文件验证失败: ${path.basename(chunkPath)}`);
    }
  }
}

export async function sliceAudio(
  audioPath: string,
  options: SliceAudioOptions = {}
): Promise<string[]> {
  const { segmentDurationSeconds = 180, outputFormat = "mp3" } = options;

  const isFfmpegInstalled = await checkFfmpegInstalled();
  if (!isFfmpegInstalled) {
    throw new FfmpegNotFoundError();
  }

  const workDir = await fs.mkdtemp(path.join(tmpdir(), "audio_slice_"));
  const outputPattern = path.join(workDir, `chunk_%03d.${outputFormat}`);

  try {
    await runFfmpeg(audioPath, outputPattern, segmentDurationSeconds);

    const files = await fs.readdir(workDir);
    const chunkPaths = files
      .filter((f) => f.startsWith("chunk_") && f.endsWith(`.${outputFormat}`))
      .sort()
      .map((f) => path.join(workDir, f));

    if (chunkPaths.length === 0) {
      throw new AudioSliceError("未生成任何切片文件");
    }

    await verifyChunkFiles(chunkPaths);

    return chunkPaths;
  } catch (error) {
    await cleanupSliceArtifacts(workDir);
    throw error;
  }
}

export async function cleanupSliceArtifacts(workDir: string): Promise<void> {
  if (!workDir || workDir.includes("*") || workDir.includes("?")) {
    return;
  }
  
  try {
    await fs.rm(workDir, { recursive: true, force: true });
  } catch {
    // 清理失败时静默处理
  }
}
