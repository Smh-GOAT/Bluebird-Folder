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
  title?: string;
  messages: QAMessage[];
  createdAt: string;
  updatedAt: string;
}

// 请求/响应
export interface QAChatRequest {
  historyId: string;
  sessionId?: string;
  message: string;
  options?: {
    maxReferences?: number;
    temperature?: number;
  };
}

export interface QAChatResponse {
  sessionId: string;
  message: QAMessage;
  references: SubtitleReference[];
}
