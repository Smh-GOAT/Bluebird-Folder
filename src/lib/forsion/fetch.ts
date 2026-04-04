/**
 * Authenticated fetch for browser-side API calls.
 *
 * Wraps the native fetch to automatically attach the Forsion JWT token
 * from localStorage to every request to our Next.js API routes.
 * The Next.js routes then forward this token to Forsion Backend.
 */

import { getToken } from "./auth";

export async function authFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Ensure Content-Type is set for JSON bodies
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, { ...init, headers });

  // If 401, the token is expired/invalid — dispatch event for auth UI
  if (response.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("forsion:unauthorized"));
  }

  return response;
}
