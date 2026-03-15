import path from "node:path";
import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";

interface DownloaderResult {
  mergedVideoPath: string;
  audioPath: string;
  workDir: string;
  meta?: {
    videoId?: string;
    title?: string;
    author?: string;
    duration?: number;
    timestamp?: number | "";
    webpageUrl?: string;
  };
}

interface DownloaderPayload {
  url: string;
  userAgent: string;
  cookie: string;
  download?: boolean;
}

const DEFAULT_DOWNLOADER_TIMEOUT_MS = 600_000;

function parseDownloaderJson(stdout: string): DownloaderResult {
  const trimmed = stdout.trim();
  try {
    return JSON.parse(trimmed) as DownloaderResult;
  } catch {
    const lastJsonStart = trimmed.lastIndexOf("{");
    if (lastJsonStart >= 0) {
      const tail = trimmed.slice(lastJsonStart);
      return JSON.parse(tail) as DownloaderResult;
    }
    throw new Error("Python downloader returned invalid JSON");
  }
}

function runPython(
  scriptPath: string,
  payload: DownloaderPayload,
  timeoutMs = DEFAULT_DOWNLOADER_TIMEOUT_MS
): Promise<DownloaderResult> {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.env.PYTHON_BIN || "python";
    const child = spawn(pythonCmd, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    let settled = false;

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`Python downloader timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr || `Python downloader exited with ${code}`));
        return;
      }
      try {
        const parsed = parseDownloaderJson(stdout);
        resolve(parsed);
      } catch {
        reject(new Error("Python downloader returned invalid JSON"));
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export async function runBilibiliDownloader(input: {
  url: string;
  userAgent: string;
  cookie: string;
}) {
  const scriptPath = path.join(process.cwd(), "scripts", "bilibili_downloader.py");
  await fs.access(scriptPath);
  const timeoutMs = Number(process.env.BILIBILI_DOWNLOADER_TIMEOUT_MS || DEFAULT_DOWNLOADER_TIMEOUT_MS);
  return runPython(scriptPath, input, timeoutMs);
}

export async function runXiaohongshuExtractor(input: {
  url: string;
  userAgent: string;
  cookie: string;
  download: boolean;
}) {
  const scriptPath = path.join(process.cwd(), "scripts", "xiaohongshu_extractor.py");
  await fs.access(scriptPath);
  const timeoutMs = Number(process.env.XIAOHONGSHU_DOWNLOADER_TIMEOUT_MS || DEFAULT_DOWNLOADER_TIMEOUT_MS);
  return runPython(scriptPath, input, timeoutMs);
}

export async function cleanupDownloaderArtifacts(workDir: string) {
  if (!workDir) {
    return;
  }
  await fs.rm(workDir, { recursive: true, force: true });
}
