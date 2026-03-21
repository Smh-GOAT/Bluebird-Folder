import { NextRequest, NextResponse } from "next/server";
import type { QAChatRequest, QAChatResponse, QAMessage, SubtitleReference } from "@/types";
import { getHistoryById } from "@/lib/server/sidebar-store";
import { createSession, getSession, addMessage } from "@/lib/server/qa-store";
import { SubtitleChunker } from "@/lib/services/rag";
import { createLLMProvider } from "@/lib/services/llm";
import { getRuntimeConfig } from "@/lib/server/runtime-config-store";

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

    const history = getHistoryById(historyId);
    if (!history) {
      return NextResponse.json(
        { code: 404, message: "History not found" },
        { status: 404 }
      );
    }

    let session = sessionId ? getSession(sessionId) : null;
    if (!session) {
      session = createSession(historyId);
    }

    const userMessage: QAMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    addMessage(session.id, userMessage);

    const chunker = new SubtitleChunker();
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

    const config = getRuntimeConfig();
    const llmProvider = createLLMProvider({
      provider: config.llmProvider ?? "kimi",
      model: config.llmModel ?? "kimi-latest",
      apiKey: config.llmApiKey ?? "",
      baseUrl: config.llmBaseUrl,
      temperature: options?.temperature ?? 0.7
    });

    const previousMessages = session.messages.slice(0, -1);
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
      model: config.llmModel
    };
    addMessage(session.id, assistantMessage);

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
