import path from "node:path";
import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";

interface DownloaderResult {
  mergedVideoPath: string;
  audioPath: string;
  workDir: string;
}

interface DownloaderPayload {
  url: string;
  userAgent: string;
  cookie: string;
}

function runPython(scriptPath: string, payload: DownloaderPayload): Promise<DownloaderResult> {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.env.PYTHON_BIN || "python";
    const child = spawn(pythonCmd, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python downloader exited with ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout) as DownloaderResult);
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
  return runPython(scriptPath, input);
}
