import type {
  PromptBuildParams,
  SummaryDetailLevel,
  SummaryStructured,
  SummaryTemplate
} from "@/types/summary";
import type { QAMessage, SubtitleReference } from "@/types";
import { formatDuration, formatTime } from "@/lib/utils/time";
import { DETAIL_LEVEL_CONFIG, TEMPLATE_REGISTRY } from "@/types/summary";

const LANGUAGE_NAMES: Record<string, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch"
};

const DETAIL_LEVELS: Record<"brief" | "standard" | "detailed", { points: number; chapters: number; description: string }> = {
  brief: { points: 3, chapters: 2, description: "精简总结，提取最核心的内容" },
  standard: { points: 5, chapters: 4, description: "标准详细程度，平衡全面性和简洁性" },
  detailed: { points: 8, chapters: 6, description: "详细总结，尽可能全面地覆盖内容" }
};

function normalizeDetailLevel(detail: SummaryDetailLevel): "concise" | "standard" | "detailed" {
  if (detail === "brief") {
    return "concise";
  }

  return detail;
}

function getTemplateDataJsonExample(template: SummaryTemplate): string | null {
  switch (template) {
    case "interview":
      return `"templateData": {
    "interview": {
      "coreTopics": ["核心话题1", "核心话题2"],
      "keyOpinions": ["关键观点1", "关键观点2"],
      "quotes": ["金句1", "金句2"],
      "dialogueFlow": "对话主线和推进过程"
    }
  }`;
    case "tutorial":
      return `"templateData": {
    "tutorial": {
      "learningGoal": "本教程的学习目标",
      "prerequisites": ["前置知识1", "前置知识2"],
      "steps": [
        { "title": "步骤1", "description": "步骤说明" },
        { "title": "步骤2", "description": "步骤说明" }
      ],
      "keyParams": ["关键参数或工具1", "关键参数或工具2"],
      "commonMistakes": ["常见错误1", "常见错误2"]
    }
  }`;
    case "news":
      return `"templateData": {
    "news": {
      "what": "发生了什么",
      "who": "涉及哪些人或机构",
      "when": "时间",
      "where": "地点",
      "why": "原因",
      "how": "经过或方式",
      "background": "事件背景",
      "progress": "当前进展",
      "impact": "影响分析",
      "controversies": ["争议点1", "争议点2"]
    }
  }`;
    case "meeting":
      return `"templateData": {
    "meeting": {
      "topics": ["讨论议题1", "讨论议题2"],
      "decisions": ["决策1", "决策2"],
      "actionItems": [
        { "task": "行动项1", "assignee": "负责人", "deadline": "截止时间" }
      ],
      "pendingQuestions": ["待确认问题1", "待确认问题2"]
    }
  }`;
    case "podcast":
      return `"templateData": {
    "podcast": {
      "theme": "本期主题",
      "mainOpinions": ["主要观点1", "主要观点2"],
      "dialogueThread": "对话主线",
      "highlights": ["亮点1", "亮点2"],
      "inspiration": "听后启发"
    }
  }`;
    case "review":
      return `"templateData": {
    "review": {
      "subject": "评测对象",
      "pros": ["优点1", "优点2"],
      "cons": ["缺点1", "缺点2"],
      "suitableFor": "适合人群",
      "notSuitableFor": "不适合人群",
      "conclusion": "最终结论"
    }
  }`;
    case "vlog":
      return `"templateData": {
    "vlog": {
      "timeline": [
        { "time": "00:30", "event": "事件1" },
        { "time": "03:20", "event": "事件2" }
      ],
      "experiences": ["主要经历1", "主要经历2"],
      "highlights": ["亮点1", "亮点2"],
      "mood": "整体氛围",
      "overallFeeling": "总体感受"
    }
  }`;
    default:
      return null;
  }
}

function getTemplateDataInstruction(template: SummaryTemplate): string | null {
  switch (template) {
    case "interview":
      return "必须提取 interview.templateData，尽量填写 coreTopics、keyOpinions、quotes、dialogueFlow。";
    case "tutorial":
      return "必须提取 tutorial.templateData，尽量填写 learningGoal、prerequisites、steps、keyParams、commonMistakes。";
    case "news":
      return "必须提取 news.templateData，尽量填写 5W1H、background、progress、impact、controversies。";
    case "meeting":
      return "必须提取 meeting.templateData，尽量填写 topics、decisions、actionItems、pendingQuestions。";
    case "podcast":
      return "必须提取 podcast.templateData，尽量填写 theme、mainOpinions、dialogueThread、highlights、inspiration。";
    case "review":
      return "必须提取 review.templateData，尽量填写 subject、pros、cons、suitableFor、notSuitableFor、conclusion。";
    case "vlog":
      return "必须提取 vlog.templateData，尽量填写 timeline、experiences、highlights、mood、overallFeeling。";
    default:
      return null;
  }
}

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

  const normalizedDetail = normalizeDetailLevel(detail);
  const detailKey = normalizedDetail === "concise" ? "brief" : normalizedDetail;
  const level = DETAIL_LEVELS[detailKey] ?? DETAIL_LEVELS.standard;
  const detailConfig = DETAIL_LEVEL_CONFIG[normalizedDetail];
  const langName = LANGUAGE_NAMES[language] ?? language;
  const templateInfo = TEMPLATE_REGISTRY[template] ?? TEMPLATE_REGISTRY.general;
  const subtitleText = subtitles
    .map((subtitle) => `[${formatTime(subtitle.start)}] ${subtitle.text}`)
    .join("\n");
  const emojiPrefix = showEmoji ? "📝 " : "";
  const timestampInstruction = showTimestamp
    ? "在关键要点中尽量提供对应时间戳，格式为 [MM:SS]。"
    : "不要输出时间戳内容，timestamp 统一设为 null。";
  const templateDataExample = getTemplateDataJsonExample(template);
  const templateDataInstruction = getTemplateDataInstruction(template);

  const jsonBody = `{
  "overview": {
    "title": "${emojiPrefix}${videoMeta?.title ?? "视频标题"}",
    "topic": "视频的主要主题或话题",
    "duration": ${videoMeta?.duration ?? 0},
    "author": "${videoMeta?.author ?? ""}",
    "platform": "${videoMeta?.platform ?? ""}"
  },
  "keyPoints": [
    {
      "content": "关键要点内容${showTimestamp ? "（可包含时间戳 [MM:SS]）" : ""}",
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
  "tags": ["标签1", "标签2", "标签3"],${templateDataExample ? `\n  ${templateDataExample},` : ""}
  "meta": {
    "generatedAt": "${new Date().toISOString()}",
    "template": "${template}",
    "language": "${language}",
    "model": "kimi"
  }
}`;

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
- 详细程度：${detailConfig.label} (${detail})
- 内容策略：${detailConfig.instruction}
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
${jsonBody}
\`\`\`

## 重要说明

1. ${emojiPrefix}确保输出是纯 JSON，不要包含任何额外说明、Markdown 标记或解释。
2. ${emojiPrefix}所有字符串必须使用双引号。
3. ${emojiPrefix}${timestampInstruction}
4. ${emojiPrefix}保持模板结构不变，但内容展开程度必须符合”${detailConfig.label}”档位。
5. ${emojiPrefix}${detailConfig.instruction}
6. ${emojiPrefix}总结长度根据原始内容的丰富程度自适应，不设硬性字数限制。内容多则充分展开，内容少则精炼概括。
7. ${emojiPrefix}如果字幕内容很多，优先保留关键信息、步骤、结论、背景和注意事项，避免重复表达。
8. ${emojiPrefix}如果字幕内容较少，不要为了凑字数编造信息，应在现有信息内尽量完整总结。
9. ${emojiPrefix}章节划分要合理，标题要概括该部分核心内容。
10. ${emojiPrefix}标签应是视频关键信息，便于分类和检索。
11. ${emojiPrefix}importance 取值范围为 1-5，5 为最重要。
12. ${emojiPrefix}startTime、endTime、timestamp 的单位为秒，必须是数字或 null。
13. ${emojiPrefix}根据模板“${templateInfo.name}”的特点突出内容重点：${templateInfo.promptFocus}
${templateDataInstruction ? `14. ${emojiPrefix}${templateDataInstruction}` : ""}
${templateDataInstruction ? `15. ${emojiPrefix}如果某个模板字段在字幕里没有足够信息，可以省略该字段，但不要返回错误类型。` : ""}

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
    lines.push(`**标签：** ${tags.map((tag) => `#${tag}`).join(" ")}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## 关键要点");
  lines.push("");

  keyPoints.forEach((point, index) => {
    const timestamp = point.timestamp !== undefined && point.timestamp !== null
      ? ` **[${formatTime(point.timestamp)}]**`
      : "";
    const importance = "★".repeat(point.importance ?? 3);
    lines.push(`${index + 1}. ${importance}${timestamp} ${point.content}`);
  });

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 章节分段");
  lines.push("");

  chapters.forEach((chapter) => {
    const timeRange = chapter.endTime
      ? `${formatTime(chapter.startTime)} - ${formatTime(chapter.endTime)}`
      : formatTime(chapter.startTime);
    lines.push(`### ${chapter.title}`);
    lines.push(`> ${timeRange}`);
    lines.push("");
    lines.push(chapter.summary);
    lines.push("");
  });

  if (meta) {
    lines.push("---");
    lines.push("");
    lines.push(`*生成于 ${new Date(meta.generatedAt).toLocaleString("zh-CN")}*`);
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
    ? references
      .map((reference, index) => `[${index + 1}] [${formatTime(reference.start)}-${formatTime(reference.end)}] ${reference.text}`)
      .join("\n")
    : "（无相关字幕片段）";

  const historyText = previousMessages.length > 0
    ? previousMessages
      .map((message) => `${message.role === "user" ? "用户" : "助手"}：${message.content}`)
      .join("\n\n")
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

1. 基于提供的字幕片段回答问题，不要添加字幕中未提及的信息。
2. 如果字幕片段不足以回答问题，请明确说明“根据字幕无法回答此问题”。
3. 回答要简洁明了，直接回应问题。
4. 如需引用时间戳，使用 [MM:SS] 格式。
5. 保持友好、专业的语气。

请直接回答用户问题：`;
}

export function buildSubtitleTranslationPrompt(
  subtitles: Array<{ start: number; end: number; text: string }>,
  targetLanguage: "zh" | "en"
): string {
  const subtitleText = subtitles
    .map((subtitle, index) => `[${index}] [${formatTime(subtitle.start)}-${formatTime(subtitle.end)}] ${subtitle.text}`)
    .join("\n");

  const targetLangName = targetLanguage === "zh" ? "中文" : "English";

  return `请将以下视频字幕翻译成 ${targetLangName}。

重要规则：
1. 必须保留原有时间戳 [start-end]。
2. 必须保留原有索引编号 [index]。
3. 只翻译文本内容，不要修改时间戳或索引。
4. 确保翻译自然流畅，符合口语习惯。
5. 如果原文已经是 ${targetLangName}，则保持原文不变。

输出格式：
[0] [00:00-00:05] 翻译后的文本
[1] [00:05-00:10] 翻译后的文本

待翻译字幕：

${subtitleText}

请直接输出翻译结果，保持完全相同的格式。`;
}

export { TEMPLATE_REGISTRY };
export type { SummaryTemplate };
