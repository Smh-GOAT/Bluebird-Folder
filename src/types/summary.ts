export interface SummaryKeyPoint {
  content: string;
  timestamp?: number | null;
  importance?: number;
}

export interface SummaryChapter {
  startTime: number;
  endTime?: number | null;
  title: string;
  summary: string;
}

export interface SummaryOverview {
  title: string;
  topic: string;
  duration: number;
  author?: string | null;
  platform?: string | null;
}

// Template-specific data structures
export interface InterviewData {
  coreTopics?: string[];
  keyOpinions?: string[];
  quotes?: string[];
  dialogueFlow?: string;
}

export interface TutorialData {
  learningGoal?: string;
  prerequisites?: string[];
  steps?: Array<{ title: string; description: string }>;
  keyParams?: string[];
  commonMistakes?: string[];
}

export interface NewsData {
  what?: string;
  who?: string;
  when?: string;
  where?: string;
  why?: string;
  how?: string;
  background?: string;
  progress?: string;
  impact?: string;
  controversies?: string[];
}

export interface MeetingData {
  topics?: string[];
  decisions?: string[];
  actionItems?: Array<{ task: string; assignee?: string; deadline?: string }>;
  pendingQuestions?: string[];
}

export interface PodcastData {
  theme?: string;
  mainOpinions?: string[];
  dialogueThread?: string;
  highlights?: string[];
  inspiration?: string;
}

export interface ReviewData {
  subject?: string;
  pros?: string[];
  cons?: string[];
  suitableFor?: string;
  notSuitableFor?: string;
  conclusion?: string;
}

export interface VlogData {
  timeline?: Array<{ time: string; event: string }>;
  experiences?: string[];
  highlights?: string[];
  mood?: string;
  overallFeeling?: string;
}

export interface TemplateData {
  interview?: InterviewData;
  tutorial?: TutorialData;
  news?: NewsData;
  meeting?: MeetingData;
  podcast?: PodcastData;
  review?: ReviewData;
  vlog?: VlogData;
}

export interface SummaryStructured {
  overview: SummaryOverview;
  keyPoints: SummaryKeyPoint[];
  chapters: SummaryChapter[];
  tags: string[];
  meta?: {
    generatedAt: string;
    template?: string | null;
    language?: string | null;
    model?: string | null;
  } | null;
  templateData?: TemplateData;
}

export interface SummaryOutput {
  summaryJson: SummaryStructured;
  summaryMarkdown: string;
}

export interface GenerateSummaryParams {
  historyId: string;
  template?: SummaryTemplate;
  language?: string;
  detail?: SummaryDetailLevel;
  showTimestamp?: boolean;
  showEmoji?: boolean;
}

export type SummaryTemplate =
  | "general"      // 通用总结
  | "interview"    // 访谈纪要
  | "travel"       // 旅行攻略
  | "academic"     // 学术分析
  | "tutorial"     // 教程学习
  | "news"         // 新闻报道
  | "meeting"      // 会议记录
  | "podcast"      // 播客访谈
  | "review"       // 评测分析
  | "vlog";        // Vlog 时间线

export type SummaryDetailLevel = "brief" | "concise" | "standard" | "detailed";

export type LLMProviderType = "kimi" | "openai" | "anthropic" | "qwen";

export interface LLMGenerateParams {
  provider: LLMProviderType;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface LLMResult {
  rawText: string;
  structured?: SummaryStructured;
  markdown?: string;
  wordCountValidation?: WordCountValidation;
  warning?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  success: boolean;
  error?: string;
}

export interface PromptBuildParams {
  subtitles: Array<{ start: number; end: number; text: string }>;
  videoMeta?: {
    title?: string;
    author?: string;
    duration?: number;
    platform?: string;
  };
  template?: SummaryTemplate;
  language?: string;
  detail?: SummaryDetailLevel;
  showTimestamp?: boolean;
  showEmoji?: boolean;
}

export interface DetailLevelConfig {
  label: string;
  targetWords: string;
  instruction: string;
}

export interface WordCountValidation {
  valid: boolean;
  actual: number;
  expectedRange: string;
  min: number;
  max: number;
  message?: string;
}

export interface TemplateInfo {
  name: string;
  description: string;
  promptFocus: string;
}

export const DETAIL_LEVEL_CONFIG: Record<"concise" | "standard" | "detailed", DetailLevelConfig> = {
  concise: {
    label: "简洁",
    targetWords: "300-450",
    instruction: "仅保留最重要的信息，减少展开，控制小节数量，每节用1-2句话概括，避免冗长描述。"
  },
  standard: {
    label: "普通",
    targetWords: "600-900",
    instruction: "保持完整结构，适度展开每个部分，兼顾概览与细节，确保可读性和信息完整性。"
  },
  detailed: {
    label: "具体",
    targetWords: "1200-1800",
    instruction: "在保持模板结构不变的前提下充分展开内容，补充步骤、背景、论证、例子或注意事项，但避免重复表达。"
  }
};

export const TEMPLATE_REGISTRY: Record<SummaryTemplate, TemplateInfo> = {
  general: {
    name: "通用总结",
    description: "提炼核心观点、关键要点、章节结构",
    promptFocus: "提炼核心观点、关键要点、章节结构，保持全面但不冗长"
  },
  interview: {
    name: "访谈纪要",
    description: "对话提炼、观点摘要、金句提取",
    promptFocus: "提炼对话核心观点，识别嘉宾主要立场，提取金句和启发性语句，梳理讨论脉络"
  },
  travel: {
    name: "旅行攻略",
    description: "行程脉络、地点信息、交通/预算/避坑提示",
    promptFocus: "提取行程时间线、地点信息、交通方式、预算花费、避坑提醒、推荐体验点"
  },
  academic: {
    name: "学术分析",
    description: "研究问题、论证结构、方法论、结论与启发",
    promptFocus: "明确研究问题/核心命题，梳理论证结构和方法论，总结证据与局限性，提炼结论与启发"
  },
  tutorial: {
    name: "教程学习",
    description: "步骤拆解、方法流程、工具/代码/注意事项",
    promptFocus: "拆解操作步骤，梳理方法流程，提取工具/代码/命令，标注注意事项和常见错误"
  },
  news: {
    name: "新闻报道",
    description: "5W1H、事件背景、影响与后续发展",
    promptFocus: "遵循 5W1H 原则（What/Who/When/Where/Why/How），梳理事件背景，分析影响与后续发展，区分事实与观点"
  },
  meeting: {
    name: "会议记录",
    description: "核心议题、决策项、行动项、待确认问题",
    promptFocus: "识别核心议题，记录决策项和结论，提取行动项（责任人+截止时间），标注待确认问题"
  },
  podcast: {
    name: "播客访谈",
    description: "嘉宾主要观点、对话重点、金句/启发",
    promptFocus: "提炼嘉宾主要观点，梳理对话重点和争议点，提取金句和启发，把握主题脉络"
  },
  review: {
    name: "评测分析",
    description: "对象概述、优点/缺点、适合人群、最终结论",
    promptFocus: "概述评测对象，分析优点和缺点，明确适合人群，给出最终结论和推荐度"
  },
  vlog: {
    name: "Vlog 时间线",
    description: "时间线、主要经历、情绪氛围、生活片段亮点",
    promptFocus: "梳理时间线和主要经历，捕捉情绪氛围和情感变化，提炼生活片段亮点，保持轻松自然的语气"
  }
};
