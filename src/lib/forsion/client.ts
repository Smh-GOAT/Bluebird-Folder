/**
 * Forsion Backend API Client
 *
 * Browser-side client reads token from localStorage.
 * Server-side (Next.js API routes) receives token via the incoming request
 * and forwards it to Forsion Backend.
 */

const FORSION_API_URL =
  process.env.NEXT_PUBLIC_FORSION_API_URL || "http://localhost:3001";

const PROJECT_SOURCE = "bluebird";

// ── Browser-side helpers ─────────────────────────────────────────────

function getBrowserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || localStorage.getItem("token");
}

// ── Generic fetcher ──────────────────────────────────────────────────

interface ForsionRequestInit extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** Override token (for server-side pass-through) */
  token?: string | null;
}

export async function forsionFetch<T = unknown>(
  path: string,
  init: ForsionRequestInit = {}
): Promise<T> {
  const { token: overrideToken, headers: extraHeaders, ...rest } = init;
  const token = overrideToken ?? getBrowserToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Project-Source": PROJECT_SOURCE,
    ...extraHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${FORSION_API_URL}${path}`;
  const res = await fetch(url, { ...rest, headers });

  // Handle 401 on browser side — clear token
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    // Dispatch a custom event so auth-aware components can react
    window.dispatchEvent(new CustomEvent("forsion:unauthorized"));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail =
      (body as Record<string, unknown>).detail ??
      (body as Record<string, unknown>).message ??
      res.statusText;
    throw new ForsionApiError(res.status, String(detail));
  }

  return res.json() as Promise<T>;
}

// ── Server-side helper ───────────────────────────────────────────────

/**
 * Extract the Bearer token from an incoming Next.js API request.
 * Works with both Request (App Router) and headers string.
 */
export function extractToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

/**
 * Create a server-side fetcher that forwards the caller's token to Forsion.
 */
export function createServerForsionClient(token: string | null) {
  return {
    fetch<T = unknown>(path: string, init: ForsionRequestInit = {}) {
      return forsionFetch<T>(path, { ...init, token });
    },
  };
}

// ── Error class ──────────────────────────────────────────────────────

export class ForsionApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(`Forsion API ${status}: ${detail}`);
    this.name = "ForsionApiError";
  }
}
