import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SubtitleSegment } from "@/types";
import { getRuntimeConfig } from "@/lib/server/runtime-config-store";

function splitTextToSegments(text: string): SubtitleSegment[] {
  const lines = text
    .split(/[。！？!?]\s*/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    return [];
  }

  return lines.map((line, index) => ({
    start: index * 8,
    end: index * 8 + 8,
    text: line
  }));
}

export async function transcribeByQwen3Asr(audioPath: string) {
  const config = getRuntimeConfig();
  if (!config.qwenAsrApiKey) {
    throw new Error("未配置 QWEN3_ASR_API_KEY，无法执行 ASR");
  }

  const fileBuffer = await readFile(audioPath);
  const fileName = path.basename(audioPath);
  const form = new FormData();
  const blob = new Blob([fileBuffer], { type: "audio/mpeg" });
  form.append("file", blob, fileName);
  form.append("model", config.qwenAsrModel);

  const response = await fetch(config.qwenAsrBaseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.qwenAsrApiKey}`
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Qwen3-ASR 请求失败: ${response.status}`);
  }

  const result = (await response.json()) as {
    text?: string;
    output?: { text?: string };
  };

  const fullText = result.text || result.output?.text || "";
  if (!fullText.trim()) {
    throw new Error("Qwen3-ASR 返回空文本");
  }

  return {
    fullText,
    segments: splitTextToSegments(fullText)
  };
}
