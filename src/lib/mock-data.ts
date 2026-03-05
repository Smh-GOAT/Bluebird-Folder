import type { FolderItem, ParsePreview, VideoHistoryItem } from "@/types";

export const mockHistory: VideoHistoryItem[] = [
  {
    id: "demo-1",
    title: "BibiGPT MVP 重建思路",
    platform: "bilibili",
    createdAt: "2026-03-04 21:00",
    folderId: "product"
  },
  {
    id: "demo-2",
    title: "YouTube: Building AI Summary Workflow",
    platform: "youtube",
    createdAt: "2026-03-04 19:20",
    folderId: null
  }
];

export const mockSubtitle = [
  { start: 0, end: 15, text: "欢迎来到 BibiGPT 重建演示。" },
  { start: 15, end: 45, text: "第一步是粘贴视频链接并解析元信息。" },
  { start: 45, end: 80, text: "字幕获取失败时自动降级到 ASR 转写。" }
];

export const mockFolders: FolderItem[] = [
  { id: "product", name: "产品拆解" },
  { id: "tech", name: "技术学习" }
];

export const mockParsePreview: ParsePreview = {
  title: "BibiGPT 路线规划（演示）",
  platform: "bilibili",
  subtitleSource: "native",
  subtitleCount: 152
};

export const mockSummaryMarkdown = `# 视频总结

- 主题：从 0 重建 BibiGPT
- 关键步骤：先解析字幕，再按模板生成总结
- 下一步：接入真实 B站/YouTube 解析器`;

export const mockSummaryJson = {
  topic: "从 0 重建 BibiGPT",
  highlights: [
    "首页改为 ChatGPT 风格入口",
    "生成总结前先弹出参数配置",
    "总结页独立三列布局并提供导出入口"
  ]
};
