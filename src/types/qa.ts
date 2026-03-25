// 消息类型
export interface QAMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  references?: SubtitleReference[];
  model?: string;
}

// 字幕引用
export interface SubtitleReference {
  start: number;
  end: number;
  text: string;
  score: number;
}

// 对话会话
export interface QASession {
  id: string;
  historyId: string;
  messages: QAMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QAChunkingOptions {
  targetChunkSize?: number;
  minChunkSize?: number;
  maxDurationSeconds?: number;
  preferSentenceBoundary?: boolean;
  preserveSpeakerChanges?: boolean;
  maxSentencesPerChunk?: number;
}

// 请求/响应
export interface QAChatRequest {
  historyId: string;
  sessionId?: string;
  message: string;
  options?: {
    maxReferences?: number;
    temperature?: number;
    chunking?: QAChunkingOptions;
  };
}

export interface QAChatResponse {
  sessionId: string;
  message: QAMessage;
  references: SubtitleReference[];
}
