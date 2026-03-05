export type VideoPlatform = "bilibili" | "youtube";

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export interface VideoHistoryItem {
  id: string;
  title: string;
  platform: VideoPlatform;
  createdAt: string;
  folderId?: string | null;
}

export interface FolderItem {
  id: string;
  name: string;
  count?: number;
}

export interface ParsePreview {
  title: string;
  platform: VideoPlatform;
  subtitleSource: "native" | "asr";
  subtitleCount: number;
}
