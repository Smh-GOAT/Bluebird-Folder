import { z } from "zod";
import type {
  LLMResult,
  SummaryDetailLevel,
  SummaryStructured,
  WordCountValidation
} from "@/types/summary";
import { DETAIL_LEVEL_CONFIG } from "@/types/summary";

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

const InterviewDataSchema = z.object({
  coreTopics: z.array(z.string()).optional(),
  keyOpinions: z.array(z.string()).optional(),
  quotes: z.array(z.string()).optional(),
  dialogueFlow: z.string().optional()
}).partial();

const TutorialDataSchema = z.object({
  learningGoal: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).optional(),
  keyParams: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional()
}).partial();

const NewsDataSchema = z.object({
  what: z.string().optional(),
  who: z.string().optional(),
  when: z.string().optional(),
  where: z.string().optional(),
  why: z.string().optional(),
  how: z.string().optional(),
  background: z.string().optional(),
  progress: z.string().optional(),
  impact: z.string().optional(),
  controversies: z.array(z.string()).optional()
}).partial();

const MeetingDataSchema = z.object({
  topics: z.array(z.string()).optional(),
  decisions: z.array(z.string()).optional(),
  actionItems: z.array(z.object({
    task: z.string(),
    assignee: z.string().optional(),
    deadline: z.string().optional()
  })).optional(),
  pendingQuestions: z.array(z.string()).optional()
}).partial();

const PodcastDataSchema = z.object({
  theme: z.string().optional(),
  mainOpinions: z.array(z.string()).optional(),
  dialogueThread: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  inspiration: z.string().optional()
}).partial();

const ReviewDataSchema = z.object({
  subject: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  suitableFor: z.string().optional(),
  notSuitableFor: z.string().optional(),
  conclusion: z.string().optional()
}).partial();

const VlogDataSchema = z.object({
  timeline: z.array(z.object({
    time: z.string(),
    event: z.string()
  })).optional(),
  experiences: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  mood: z.string().optional(),
  overallFeeling: z.string().optional()
}).partial();

const TemplateDataSchema = z.object({
  interview: InterviewDataSchema.optional(),
  tutorial: TutorialDataSchema.optional(),
  news: NewsDataSchema.optional(),
  meeting: MeetingDataSchema.optional(),
  podcast: PodcastDataSchema.optional(),
  review: ReviewDataSchema.optional(),
  vlog: VlogDataSchema.optional()
}).partial();

const SummaryStructuredSchema = z.object({
  overview: SummaryOverviewSchema,
  keyPoints: z.array(SummaryKeyPointSchema),
  chapters: z.array(SummaryChapterSchema),
  tags: z.array(z.string()),
  meta: SummaryMetaSchema.optional().nullable(),
  templateData: TemplateDataSchema.optional()
});

function normalizeDetailLevel(detail: SummaryDetailLevel): "concise" | "standard" | "detailed" {
  if (detail === "brief") {
    return "concise";
  }

  return detail;
}

function parseWordRange(range: string): { min: number; max: number } {
  const match = range.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    return { min: 0, max: Number.MAX_SAFE_INTEGER };
  }

  return {
    min: Number(match[1]),
    max: Number(match[2])
  };
}

export function countSummaryWords(content: string): number {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/[#>*_\-\[\]()]/g, " ")
    .replace(/\s+/g, "")
    .length;
}

export function validateWordCount(
  content: string,
  detail: SummaryDetailLevel = "standard"
): WordCountValidation {
  const normalizedDetail = normalizeDetailLevel(detail);
  const config = DETAIL_LEVEL_CONFIG[normalizedDetail];
  const { min, max } = parseWordRange(config.targetWords);
  const actual = countSummaryWords(content);

  if (actual < min) {
    return {
      valid: false,
      actual,
      expectedRange: config.targetWords,
      min,
      max,
      message: `字数偏少，当前 ${actual}，目标 ${config.targetWords}。`
    };
  }

  if (actual > max) {
    return {
      valid: false,
      actual,
      expectedRange: config.targetWords,
      min,
      max,
      message: `字数偏多，当前 ${actual}，目标 ${config.targetWords}。`
    };
  }

  return {
    valid: true,
    actual,
    expectedRange: config.targetWords,
    min,
    max,
    message: `字数达标，当前 ${actual}，目标 ${config.targetWords}。`
  };
}

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
      const errorMessages = validation.error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return {
        rawText,
        success: false,
        error: `JSON 结构校验失败: ${errorMessages}`
      };
    }

    return {
      rawText,
      structured: validation.data,
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
  const trimmedText = text.trim();

  const codeBlockMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch?.[1]) {
    const innerText = codeBlockMatch[1].trim();
    if (looksLikeJson(innerText)) {
      return innerText;
    }
  }

  const jsonMatch = trimmedText.match(/(\{[\s\S]*\})/);
  if (jsonMatch?.[1]) {
    const candidate = jsonMatch[1].trim();
    if (looksLikeJson(candidate)) {
      return candidate;
    }
  }

  if (looksLikeJson(trimmedText)) {
    return trimmedText;
  }

  return null;
}

function looksLikeJson(text: string): boolean {
  const trimmedText = text.trim();
  return (trimmedText.startsWith("{") && trimmedText.endsWith("}")) ||
    (trimmedText.startsWith("[") && trimmedText.endsWith("]"));
}

export function validateSummaryStructure(data: unknown): data is SummaryStructured {
  return SummaryStructuredSchema.safeParse(data).success;
}
