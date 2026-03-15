import type { QAMessage, QASession } from "@/types/qa";

type QAStore = {
  sessions: Map<string, QASession>;
};

declare global {
  var __qaStore__: QAStore | undefined;
}

function createStore(): QAStore {
  return {
    sessions: new Map()
  };
}

function getStore(): QAStore {
  if (!globalThis.__qaStore__) {
    globalThis.__qaStore__ = createStore();
  }
  return globalThis.__qaStore__;
}

function generateId(): string {
  return `qa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createSession(historyId: string): QASession {
  const store = getStore();
  const now = new Date().toISOString();
  const session: QASession = {
    id: generateId(),
    historyId,
    messages: [],
    createdAt: now,
    updatedAt: now
  };
  store.sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): QASession | null {
  return getStore().sessions.get(sessionId) ?? null;
}

export function addMessage(sessionId: string, message: QAMessage): void {
  const store = getStore();
  const session = store.sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  session.messages.push(message);
  session.updatedAt = new Date().toISOString();
}

export function listSessionMessages(sessionId: string): QAMessage[] {
  const session = getStore().sessions.get(sessionId);
  return session?.messages ?? [];
}

export function clearSession(sessionId: string): void {
  const store = getStore();
  const session = store.sessions.get(sessionId);
  if (session) {
    session.messages = [];
    session.updatedAt = new Date().toISOString();
  }
}

export function deleteSession(sessionId: string): void {
  getStore().sessions.delete(sessionId);
}
