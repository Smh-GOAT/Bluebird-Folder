import { NextRequest, NextResponse } from "next/server";
import type { QAChatRequest, QAChatResponse, QAMessage, SubtitleReference } from "@/types";
import { forsionFromRequest } from "@/lib/forsion/proxy";
import { extractToken } from "@/lib/forsion/client";
import { createSubtitleChunker } from "@/lib/services/rag";
import { createForsionLLMProvider } from "@/lib/forsion/llm-client";

const DEFAULT_MODEL_ID = process.env.FORSION_MODEL_ID || "qwen3.5-plus";

interface HistoryData {
  id: string;
  title: string;
  subtitlesArray?: Array<{ start: number; end: number; text: string }>;
  [key: string]: unknown;
}

interface QASessionData {
  id: string;
  historyId: string;
  messages: QAMessage[];
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body: QAChatRequest = await request.json();
    const { historyId, sessionId, message, options } = body;

    if (!historyId) {
      return NextResponse.json(
        { code: 400, message: "historyId is required" },
        { status: 400 }
      );
    }

    const client = forsionFromRequest(request);

    // Fetch history from Forsion Backend
    let history: HistoryData;
    try {
      const result = await client.fetch<{ data: HistoryData }>(`/api/bluebird/histories/${historyId}`);
      history = result.data;
    } catch {
      return NextResponse.json(
        { code: 404, message: "History not found" },
        { status: 404 }
      );
    }

    // Get or create QA session
    let session: QASessionData;
    if (sessionId) {
      try {
        const result = await client.fetch<{ data: QASessionData }>(`/api/bluebird/qa/sessions/${sessionId}`);
        session = result.data;
      } catch {
        const result = await client.fetch<{ data: QASessionData }>("/api/bluebird/qa/sessions", {
          method: "POST",
          body: JSON.stringify({ historyId }),
        });
        session = result.data;
      }
    } else {
      const result = await client.fetch<{ data: QASessionData }>("/api/bluebird/qa/sessions", {
        method: "POST",
        body: JSON.stringify({ historyId }),
      });
      session = result.data;
    }

    const userMessage: QAMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };

    const chunker = createSubtitleChunker(options?.chunking);
    const chunks = history.subtitlesArray
      ? chunker.chunk(history.subtitlesArray)
      : [];

    const maxRefs = options?.maxReferences ?? 10;
    const relevantChunks = chunks.length > 0
      ? chunker.search(message, chunks, maxRefs)
      : [];

    const references: SubtitleReference[] = relevantChunks.map(chunk => ({
      start: chunk.start,
      end: chunk.end,
      text: chunk.text,
      score: 1.0
    }));

    // Use Forsion LLM via chat/completions
    const token = extractToken(request);
    const llmProvider = createForsionLLMProvider({
      modelId: DEFAULT_MODEL_ID,
      token,
      temperature: options?.temperature ?? 0.7,
    });

    const previousMessages = session.messages ?? [];
    const qaResult = await llmProvider.generateQA({
      question: message,
      references,
      previousMessages,
      videoTitle: history.title
    });

    if (!qaResult.success) {
      return NextResponse.json(
        { code: 500, message: qaResult.error || "AI 回答生成失败" },
        { status: 500 }
      );
    }

    const assistantMessage: QAMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: qaResult.answer,
      timestamp: new Date().toISOString(),
      references: qaResult.references,
      model: DEFAULT_MODEL_ID,
    };

    // Update session messages in Forsion Backend
    const updatedMessages = [...previousMessages, userMessage, assistantMessage];
    await client.fetch(`/api/bluebird/qa/sessions/${session.id}`, {
      method: "PUT",
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const response: QAChatResponse = {
      sessionId: session.id,
      message: assistantMessage,
      references
    };

    return NextResponse.json({ code: 0, data: response });
  } catch (error) {
    console.error("[qa-chat] error:", error);
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
