"use client";

import { useCallback, useEffect, useState } from "react";
import { forsionFetch } from "./client";

// ── Constants ────────────────────────────────────────────────────────

const FORSION_API_URL =
  process.env.NEXT_PUBLIC_FORSION_API_URL || "http://localhost:3001";

/**
 * Token key — must match the Forsion user-card-template.html convention
 * which reads localStorage "auth_token" or "token".
 */
const TOKEN_KEY = "auth_token";

// ── Token helpers ────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Redirect-based login (Forsion standard flow) ─────────────────────

/**
 * Redirect to the Forsion unified login page.
 * After login, Forsion will redirect back with ?token=xxx in the URL.
 */
export function redirectToLogin() {
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `${FORSION_API_URL}/auth?redirect=${currentUrl}&app=bluebird`;
}

/**
 * Capture token from URL after redirect back from Forsion auth page.
 * Should be called on app mount. Returns the token if found.
 */
export function captureTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    setToken(token);
    // Remove token from URL for security
    params.delete("token");
    const newSearch = params.toString();
    const newUrl =
      window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
    window.history.replaceState({}, "", newUrl);
    return token;
  }

  return null;
}

// ── Logout ───────────────────────────────────────────────────────────

export function logout() {
  clearToken();
  redirectToLogin();
}

// ── User type & fetching ─────────────────────────────────────────────

export interface ForsionUser {
  id: string;
  username: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  nickname?: string | null;
}

export async function fetchCurrentUser(): Promise<ForsionUser> {
  return forsionFetch<ForsionUser>("/api/auth/me");
}

// ── React hook ───────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState<ForsionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // First, try to capture token from URL (redirect back from auth page)
    captureTokenFromUrl();

    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await fetchCurrentUser();
      setUser(u);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Listen for 401 events from the API client
    const onUnauthorized = () => {
      clearToken();
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("forsion:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("forsion:unauthorized", onUnauthorized);
  }, [refresh]);

  const doLogout = useCallback(() => {
    logout();
  }, []);

  return { user, loading, refresh, logout: doLogout };
}

// ── Open account center ──────────────────────────────────────────────

export function openAccountCenter() {
  window.open(`${FORSION_API_URL}/account`, "_blank");
}
