import { PrismaClient, Prisma } from "@prisma/client";
import type { QASession, QAMessage, SubtitleReference } from "@/types/qa";

const prisma = new PrismaClient();

// Helper to convert Prisma QASession to frontend QASession
function toQASession(
  dbSession: {
    id: string;
    historyId: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  messages: QAMessage[] = []
): QASession {
  return {
    id: dbSession.id,
    historyId: dbSession.historyId,
    title: dbSession.title ?? undefined,
    messages,
    createdAt: dbSession.createdAt.toISOString(),
    updatedAt: dbSession.updatedAt.toISOString()
  };
}

// Helper to convert Prisma QAMessage to frontend QAMessage
function toQAMessage(dbMessage: {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
  model: string | null;
  references: unknown;
}): QAMessage {
  return {
    id: dbMessage.id,
    role: dbMessage.role as "user" | "assistant",
    content: dbMessage.content,
    timestamp: dbMessage.timestamp.toISOString(),
    model: dbMessage.model ?? undefined,
    references: dbMessage.references as SubtitleReference[] | undefined
  };
}

export async function createSession(
  userId: string,
  historyId: string,
  title?: string
): Promise<QASession> {
  const session = await prisma.qASession.create({
    data: {
      userId,
      historyId,
      title: title ?? null
    }
  });

  return toQASession(session);
}

export async function getSession(userId: string, sessionId: string): Promise<QASession | null> {
  const session = await prisma.qASession.findFirst({
    where: { id: sessionId, userId },
    include: {
      messages: {
        orderBy: { timestamp: "asc" }
      }
    }
  });

  if (!session) return null;

  const messages = session.messages.map(toQAMessage);
  return toQASession(session, messages);
}

export async function listSessionsByHistoryId(userId: string, historyId: string): Promise<QASession[]> {
  const sessions = await prisma.qASession.findMany({
    where: { historyId, userId },
    orderBy: { updatedAt: "desc" }
  });

  return sessions.map((session) => toQASession(session));
}

export async function addMessage(
  userId: string,
  sessionId: string,
  message: Omit<QAMessage, "id">
): Promise<QAMessage> {
  // Verify session exists and belongs to user
  const session = await prisma.qASession.findFirst({
    where: { id: sessionId, userId }
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Create message and update session updatedAt
  const [createdMessage, _] = await prisma.$transaction([
    prisma.qAMessage.create({
      data: {
        sessionId,
        role: message.role,
        content: message.content,
        model: message.model ?? null,
        references: message.references ? (message.references as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        timestamp: new Date(message.timestamp)
      }
    }),
    prisma.qASession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })
  ]);

  return toQAMessage(createdMessage);
}

export async function listSessionMessages(userId: string, sessionId: string): Promise<QAMessage[]> {
  // Verify session exists and belongs to user
  const session = await prisma.qASession.findFirst({
    where: { id: sessionId, userId }
  });

  if (!session) {
    throw new Error("Session not found");
  }

  const messages = await prisma.qAMessage.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" }
  });

  return messages.map(toQAMessage);
}

export async function clearSession(userId: string, sessionId: string): Promise<void> {
  // Verify session exists and belongs to user
  const session = await prisma.qASession.findFirst({
    where: { id: sessionId, userId }
  });

  if (!session) {
    throw new Error("Session not found");
  }

  await prisma.$transaction([
    prisma.qAMessage.deleteMany({
      where: { sessionId }
    }),
    prisma.qASession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })
  ]);
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  try {
    await prisma.qASession.delete({
      where: { id: sessionId, userId }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      throw new Error("Session not found");
    }
    throw error;
  }
}

export { prisma };
