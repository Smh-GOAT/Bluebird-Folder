import { NextRequest, NextResponse } from "next/server";
import type { SubtitleTranslateRequest, SubtitleTranslation } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { getHistoryById, saveHistory } from "@/lib/server/prisma-store";
import { createLLMProvider } from "@/lib/services/llm";
import { getRuntimeConfig } from "@/lib/server/runtime-config-store";
import { formatTime } from "@/lib/utils/time";

const BATCH_SIZE = 50;

function buildSubtitleTranslationPrompt(
  subtitles: Array<{ start: number; end: number; text: string }>,
  targetLanguage: "zh" | "en",
  startIndex: number
): string {
  const subtitleText = subtitles
    .map((s, index) => `[${startIndex + index}] [${formatTime(s.start)}-${formatTime(s.end)}] ${s.text}`)
    .join("\n");

  const targetLangName = targetLanguage === "zh" ? "中文" : "English";

  return `请将以下视频字幕翻译成${targetLangName}。

重要规则：

1. 必须保持原有时间戳不变 [start-end]
2. 必须保持原有索引编号 [index]
3. 只翻译文本内容，不要修改时间戳或索引
4. 确保翻译自然流畅，符合口语习惯
5. 如果原文已经是${targetLangName}，则保持原文不变

输出格式：

请按以下格式返回翻译结果：

[${startIndex}] [00:00-00:05] 翻译后的文本
[${startIndex + 1}] [00:05-00:10] 翻译后的文本
...

待翻译字幕：

${subtitleText}

请直接输出翻译结果，保持完全相同的格式。`;
}

function parseTranslationResult(
  result: string,
  originalSubtitles: Array<{ start: number; end: number; text: string }>,
  targetLanguage: "zh" | "en",
  startIndex: number
): SubtitleTranslation[] {
  const lines = result.split("\n").filter(line => line.trim());
  const translations: SubtitleTranslation[] = [];

  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]\s*\[(\d{2}:\d{2})-(\d{2}:\d{2})\]\s*(.+)$/);
    if (match) {
      const index = parseInt(match[1], 10);
      const translatedText = match[4].trim();
      const original = originalSubtitles[index - startIndex];

      if (original) {
        translations.push({
          originalText: original.text,
          translatedText,
          start: original.start,
          end: original.end,
          targetLanguage
        });
      }
    }
  }

  return translations;
}

async function translateBatch(
  llmProvider: ReturnType<typeof createLLMProvider>,
  subtitles: Array<{ start: number; end: number; text: string }>,
  targetLanguage: "zh" | "en",
  startIndex: number
): Promise<SubtitleTranslation[]> {
  const prompt = buildSubtitleTranslationPrompt(subtitles, targetLanguage, startIndex);
  const result = await llmProvider.translateSubtitles(prompt);

  if (!result.success) {
    throw new Error(result.error || "Translation batch failed");
  }

  const translations = parseTranslationResult(
    result.translatedText,
    subtitles,
    targetLanguage,
    startIndex
  );

  if (translations.length === 0) {
    return subtitles.map(s => ({
      originalText: s.text,
      translatedText: s.text,
      start: s.start,
      end: s.end,
      targetLanguage
    }));
  }

  return translations;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { code: 40101, data: null, message: "未登录" },
        { status: 401 }
      );
    }

    const body: SubtitleTranslateRequest = await request.json();
    const { historyId, subtitles, options } = body;

    if (!historyId || !subtitles || subtitles.length === 0) {
      return NextResponse.json(
        { code: 400, message: "historyId and subtitles are required" },
        { status: 400 }
      );
    }

    const history = await getHistoryById(user.id, historyId);
    if (!history) {
      return NextResponse.json(
        { code: 404, message: "History not found" },
        { status: 404 }
      );
    }

    const config = getRuntimeConfig();
    const llmProvider = createLLMProvider({
      provider: config.llmProvider ?? "kimi",
      model: config.llmModel ?? "kimi-latest",
      apiKey: config.llmApiKey ?? "",
      baseUrl: config.llmBaseUrl,
      temperature: 0.3,
      timeout: 120000
    });

    const targetLang = options.targetLanguage as "zh" | "en";
    const allTranslations: SubtitleTranslation[] = [];
    
    const totalBatches = Math.ceil(subtitles.length / BATCH_SIZE);
    console.log(`[subtitles-translate] Translating ${subtitles.length} subtitles in ${totalBatches} batches`);

    for (let i = 0; i < subtitles.length; i += BATCH_SIZE) {
      const batch = subtitles.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`[subtitles-translate] Processing batch ${batchNum}/${totalBatches} (${batch.length} subtitles)`);
      
      try {
        const batchTranslations = await translateBatch(llmProvider, batch, targetLang, i);
        allTranslations.push(...batchTranslations);
      } catch (error) {
        console.error(`[subtitles-translate] Batch ${batchNum} failed:`, error);
        throw new Error(`翻译批次 ${batchNum}/${totalBatches} 失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`[subtitles-translate] Completed: ${allTranslations.length} translations`);

    const updatedHistory = {
      ...history,
      translatedSubtitles: allTranslations,
      translationMeta: {
        sourceLanguage: "auto",
        targetLanguage: options.targetLanguage,
        translatedAt: new Date().toISOString()
      }
    };
    await saveHistory(user.id, updatedHistory);

    return NextResponse.json({
      code: 0,
      data: {
        historyId,
        translations: allTranslations,
        detectedSourceLanguage: "auto",
        translatedAt: updatedHistory.translationMeta.translatedAt
      }
    });
  } catch (error) {
    console.error("[subtitles-translate] error:", error);
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
