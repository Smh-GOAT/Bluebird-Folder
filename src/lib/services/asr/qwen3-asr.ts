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
  const ext = path.extname(audioPath).toLowerCase();
  const mimeType = ext === ".wav" ? "audio/wav" : "audio/mpeg";
  const dataUri = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

  const response = await fetch(config.qwenAsrBaseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.qwenAsrApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.qwenAsrModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_audio",
              input_audio: {
                data: dataUri
              }
            }
          ]
        }
      ],
      stream: false,
      asr_options: {
        enable_itn: false
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Qwen3-ASR 请求失败: ${response.status}${details ? ` - ${details.slice(0, 240)}` : ""}`);
  }

  const result = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const fullText = result.choices?.[0]?.message?.content || "";
  if (!fullText.trim()) {
    throw new Error("Qwen3-ASR 返回空文本");
  }

  return {
    fullText,
    segments: splitTextToSegments(fullText)
  };
}
