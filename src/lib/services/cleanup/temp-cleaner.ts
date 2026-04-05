import { promises as fs } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

/** Prefixes used by downloaders and audio slicer */
const TEMP_PREFIXES = ["bili_dl_", "xhs_dl_", "audio_slice_"];

/** Max age before a temp dir is considered stale (default: 1 hour) */
const DEFAULT_MAX_AGE_MS = 60 * 60 * 1000;

/**
 * Remove temp directories older than `maxAgeMs` that match known prefixes.
 * Safe to call concurrently and on startup.
 */
export async function cleanupStaleTempDirs(maxAgeMs = DEFAULT_MAX_AGE_MS): Promise<number> {
  const tmp = tmpdir();
  let removed = 0;

  try {
    const entries = await fs.readdir(tmp, { withFileTypes: true });
    const now = Date.now();

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!TEMP_PREFIXES.some((p) => entry.name.startsWith(p))) continue;

      const dirPath = path.join(tmp, entry.name);
      try {
        const stat = await fs.stat(dirPath);
        const ageMs = now - stat.mtimeMs;
        if (ageMs > maxAgeMs) {
          await fs.rm(dirPath, { recursive: true, force: true });
          removed++;
          console.log(`[temp-cleaner] removed stale dir: ${entry.name} (age: ${Math.round(ageMs / 60000)}min)`);
        }
      } catch {
        // directory may have been removed by another process
      }
    }
  } catch (error) {
    console.warn("[temp-cleaner] failed to scan tmp dir:", error);
  }

  if (removed > 0) {
    console.log(`[temp-cleaner] cleaned ${removed} stale temp directories`);
  }

  return removed;
}

let intervalHandle: ReturnType<typeof setInterval> | null = null;

/** Start periodic cleanup (default: every 30 minutes) */
export function startPeriodicCleanup(intervalMs = 30 * 60 * 1000) {
  if (intervalHandle) return;

  // Run immediately on start
  cleanupStaleTempDirs().catch(() => {});

  intervalHandle = setInterval(() => {
    cleanupStaleTempDirs().catch(() => {});
  }, intervalMs);

  // Don't prevent process from exiting
  if (intervalHandle.unref) {
    intervalHandle.unref();
  }
}
