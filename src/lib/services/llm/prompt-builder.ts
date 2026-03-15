import type { PromptBuildParams, SummaryStructured, SummaryTemplate } from "@/types/summary";
import type { QAMessage, SubtitleReference } from "@/types";
import { formatTime, formatDuration } from "@/lib/utils/time";
import { TEMPLATE_REGISTRY } from "@/types/summary";

const LANGUAGE_NAMES: Record<string, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch"
};

const DETAIL_LEVELS: Record<string, { points: number; chapters: number; description: string }> = {
  brief: { points: 3, chapters: 2, description: "精简总结，提取最核心的内容" },
  standard: { points: 5, chapters: 4, description: "标准详细程度，平衡全面性和简洁性" },
  detailed: { points: 8, chapters: 6, description: "详细总结，尽可能全面地覆盖内容" }
};

export function buildPrompt(params: PromptBuildParams): string {
  const {
    subtitles,
    videoMeta,
    template = "general",
    language = "zh",
    detail = "standard",
    showTimestamp = true,
    showEmoji = true
  } = params;

  const level = DETAIL_LEVELS[detail] ?? DETAIL_LEVELS.standard;
  const langName = LANGUAGE_NAMES[language] ?? language;
  const templateInfo = TEMPLATE_REGISTRY[template] ?? TEMPLATE_REGISTRY.general;

  const subtitleText = subtitles
    .map((s) => `[${formatTime(s.start)}] ${s.text}`)
    .join("\n");

  const emojiPrefix = showEmoji ? "📹 " : "";
  const timestampNote = showTimestamp ? "并在每个关键要点中包含对应的时间戳" : "";

  return `你是一位专业的视频内容分析师。请根据以下视频字幕，生成结构化的视频总结。

## 视频信息

- 标题：${videoMeta?.title ?? "未知"}
- 作者：${videoMeta?.author ?? "未知"}
- 平台：${videoMeta?.platform ?? "未知"}
- 时长：${videoMeta?.duration ? formatDuration(videoMeta.duration) : "未知"}

## 分析要求

- 输出语言：${langName}
- 模板类型：${templateInfo.name}
- 模板说明：${templateInfo.description}
- 分析重点：${templateInfo.promptFocus}
- 详细程度：${detail} - ${level.description}
- 关键要点数量：约 ${level.points} 个
- 章节数量：约 ${level.chapters} 个
- 时间戳：${showTimestamp ? "需要" : "不需要"}

## 字幕内容

\`\`\`
${subtitleText}
\`\`\`

## 输出格式

请严格按照以下 JSON 格式输出，确保 JSON 有效且可被解析：

\`\`\`json
{
  "overview": {
    "title": "${emojiPrefix}${videoMeta?.title ?? "视频标题"}",
    "topic": "视频的主要主题或话题",
    "duration": ${videoMeta?.duration ?? 0},
    "author": "${videoMeta?.author ?? ""}",
    "platform": "${videoMeta?.platform ?? ""}"
  },
  "keyPoints": [
    {
      "content": "关键要点内容${showTimestamp ? '（包含时间戳 [MM:SS]）' : ''}",
      "timestamp": ${showTimestamp ? 0 : "null"},
      "importance": 5
    }
  ],
  "chapters": [
    {
      "startTime": 0,
      "endTime": 60,
      "title": "章节标题",
      "summary": "章节内容摘要"
    }
  ],
  "tags": ["标签1", "标签2", "标签3"],
  "meta": {
    "generatedAt": "${new Date().toISOString()}",
    "template": "${template}",
    "language": "${language}",
    "model": "kimi"
  }
}
\`\`\`

## 重要说明

1. ${emojiPrefix}确保输出是**纯 JSON 格式**，不要包含任何额外的文本、markdown 代码块标记或解释
2. ${emojiPrefix}所有字符串必须使用双引号
3. ${emojiPrefix}关键要点要简洁明了，${timestampNote}
4. ${emojiPrefix}章节划分要合理，标题要概括该部分的核心内容
5. ${emojiPrefix}标签应该是视频的关键词，便于分类和检索
6. ${emojiPrefix}重要性等级 1-5，5 为最重要
7. ${emojiPrefix}时间戳单位为秒（数字类型）
8. ${emojiPrefix}根据"${templateInfo.name}"模板的特点，重点突出：${templateInfo.promptFocus}

请直接输出 JSON，不要添加任何其他内容。`;
}

export function buildMarkdownFromStructured(structured: SummaryStructured): string {
  const { overview, keyPoints, chapters, tags, meta } = structured;
  const lines: string[] = [];

  lines.push(`# ${overview.title}`);
  lines.push("");
  lines.push(`> **主题：** ${overview.topic}`);
  lines.push(`> **作者：** ${overview.author ?? "未知"}`);
  lines.push(`> **平台：** ${overview.platform ?? "未知"}`);
  lines.push(`> **时长：** ${formatDuration(overview.duration)}`);
  lines.push("");

  if (tags.length > 0) {
    lines.push(`**标签：** ${tags.map((t) => `#${t}`).join(" ")}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## 📋 关键要点");
  lines.push("");

  keyPoints.forEach((point, index) => {
    const timestamp = point.timestamp !== undefined && point.timestamp !== null
      ? ` **[${formatTime(point.timestamp)}]**`
      : "";
    const importance = "⭐".repeat(point.importance ?? 3);
    lines.push(`${index + 1}. ${importance}${timestamp} ${point.content}`);
  });

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 📑 章节分段");
  lines.push("");

  chapters.forEach((chapter) => {
    const timeRange = chapter.endTime
      ? `${formatTime(chapter.startTime)} - ${formatTime(chapter.endTime)}`
      : formatTime(chapter.startTime);
    lines.push(`### ${chapter.title}`);
    lines.push(`> ⏱️ ${timeRange}`);
    lines.push("");
    lines.push(chapter.summary);
    lines.push("");
  });

  if (meta) {
    lines.push("---");
    lines.push("");
    lines.push("*生成于 " + new Date(meta.generatedAt).toLocaleString("zh-CN") + "*");
  }

  return lines.join("\n");
}

interface QAPromptParams {
  question: string;
  references: SubtitleReference[];
  previousMessages: QAMessage[];
  videoTitle?: string;
}

export function buildQAPrompt(params: QAPromptParams): string {
  const { question, references, previousMessages, videoTitle } = params;

  const referencesText = references.length > 0
    ? references.map((ref, idx) =>
        `[${idx + 1}] [${formatTime(ref.start)}-${formatTime(ref.end)}] ${ref.text}`
      ).join("\n")
    : "（无相关字幕片段）";

  const historyText = previousMessages.length > 0
    ? previousMessages.map((msg) =>
        `${msg.role === "user" ? "用户" : "助手"}：${msg.content}`
      ).join("\n\n")
    : "（无历史对话）";

  return `你是一位专业的视频内容问答助手。请根据提供的视频字幕片段回答用户的问题。

## 视频标题

${videoTitle ?? "未命名视频"}

## 相关字幕片段（已按相关性排序）

${referencesText}

## 历史对话

${historyText}

## 当前问题

用户：${question}

## 回答要求

1. 基于提供的字幕片段回答问题，不要添加字幕中未提及的信息
2. 如果字幕片段不足以回答问题，请诚实说明
3. 回答要简洁明了，直接回应问题
4. 如需引用时间戳，使用 [MM:SS] 格式
5. 保持友好、专业的语气

请直接回答用户问题：`;
}

export function buildSubtitleTranslationPrompt(
  subtitles: Array<{ start: number; end: number; text: string }>,
  targetLanguage: "zh" | "en"
): string {
  const subtitleText = subtitles
    .map((s, index) => `[${index}] [${formatTime(s.start)}-${formatTime(s.end)}] ${s.text}`)
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

[0] [00:00-00:05] 翻译后的文本
[1] [00:05-00:10] 翻译后的文本
...

待翻译字幕：

${subtitleText}

请直接输出翻译结果，保持完全相同的格式。`;
}

export { TEMPLATE_REGISTRY };
export type { SummaryTemplate };
