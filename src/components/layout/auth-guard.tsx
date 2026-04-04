"use client";

import type { ReactNode } from "react";
import { useAuth, redirectToLogin } from "@/lib/forsion/auth";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Wraps the app — if the user is not authenticated,
 * redirects to Forsion's unified login page at /auth.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>加载中...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to Forsion unified login page
    redirectToLogin();
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>正在跳转到登录页面...</p>
      </div>
    );
  }

  return <>{children}</>;
}
