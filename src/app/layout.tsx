import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthGuard } from "@/components/layout/auth-guard";
import { AnalysisQueueProvider } from "@/lib/analysis-queue-context";

export const metadata: Metadata = {
  title: "Bluebird Folder",
  description: "AI 音视频总结与问答"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    // Default attrs prevent FOUC before client JS loads
    <html lang="zh-CN" data-theme="apple" data-mode="light">
      <body>
        <ThemeProvider>
          <AuthGuard>
            <AnalysisQueueProvider>
              {children}
            </AnalysisQueueProvider>
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
