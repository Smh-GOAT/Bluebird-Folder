import { z } from "zod";
import type { SummaryStructured, LLMResult } from "@/types/summary";

const SummaryKeyPointSchema = z.object({
  content: z.string(),
  timestamp: z.number().optional().nullable(),
  importance: z.number().min(1).max(5).optional()
});

const SummaryChapterSchema = z.object({
  startTime: z.number(),
  endTime: z.number().optional().nullable(),
  title: z.string(),
  summary: z.string()
});

const SummaryOverviewSchema = z.object({
  title: z.string(),
  topic: z.string(),
  duration: z.number(),
  author: z.string().optional().nullable(),
  platform: z.string().optional().nullable()
});

const SummaryMetaSchema = z.object({
  generatedAt: z.string(),
  template: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  model: z.string().optional().nullable()
});

const SummaryStructuredSchema = z.object({
  overview: SummaryOverviewSchema,
  keyPoints: z.array(SummaryKeyPointSchema),
  chapters: z.array(SummaryChapterSchema),
  tags: z.array(z.string()),
  meta: SummaryMetaSchema.optional().nullable()
});

export function parseLLMResponse(rawText: string): LLMResult {
  const cleanText = extractJsonFromText(rawText);

  if (!cleanText) {
    return {
      rawText,
      success: false,
      error: "无法从响应中提取 JSON 内容"
    };
  }

  try {
    const parsed = JSON.parse(cleanText) as unknown;
    const validation = SummaryStructuredSchema.safeParse(parsed);

    if (!validation.success) {
      const errorMessages = validation.error.issues.map((issue: z.ZodIssue) =>
        `${issue.path.join(".")}: ${issue.message}`
      ).join("; ");
      return {
        rawText,
        success: false,
        error: `JSON 结构验证失败: ${errorMessages}`
      };
    }

    const structured = validation.data;

    return {
      rawText,
      structured,
      success: true
    };
  } catch (error) {
    return {
      rawText,
      success: false,
      error: `JSON 解析失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function extractJsonFromText(text: string): string | null {
  text = text.trim();

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch?.[1]) {
    const inner = codeBlockMatch[1].trim();
    if (looksLikeJson(inner)) {
      return inner;
    }
  }

  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch?.[1]) {
    const candidate = jsonMatch[1].trim();
    if (looksLikeJson(candidate)) {
      return candidate;
    }
  }

  if (looksLikeJson(text)) {
    return text;
  }

  return null;
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trim();
  return (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
         (trimmed.startsWith("[") && trimmed.endsWith("]"));
}

export function validateSummaryStructure(data: unknown): data is SummaryStructured {
  const result = SummaryStructuredSchema.safeParse(data);
  return result.success;
}
