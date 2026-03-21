import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bluebird Folder",
  description: "AI 音视频总结与问答 - Milestone 0"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
