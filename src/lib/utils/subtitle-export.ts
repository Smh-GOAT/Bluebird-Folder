import type { SubtitleSegment } from "@/types";
import { secondsToSrtTime, formatTimeShort } from "./time";

/**
 * Convert subtitles to SRT format
 */
export function toSRT(subtitles: SubtitleSegment[]): string {
  return subtitles.map((sub, index) => {
    const startTime = secondsToSrtTime(sub.start);
    const endTime = secondsToSrtTime(sub.end);
    return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`;
  }).join("\n");
}

/**
 * Convert subtitles to TXT format
 */
export function toTXT(subtitles: SubtitleSegment[], includeTimestamps: boolean = false): string {
  if (includeTimestamps) {
    return subtitles.map(sub => `[${formatTimeShort(sub.start)}] ${sub.text}`).join("\n");
  }
  return subtitles.map(sub => sub.text).join("\n");
}
