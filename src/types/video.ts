import type { SummaryStructured } from "./summary";
import type { SubtitleTranslation } from "./translation";

export type VideoPlatform = "bilibili" | "youtube" | "xiaohongshu";

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
  videoId?: string;
  videoUrl?: string;
  author?: string;
  duration?: number;
  publishAt?: string;
  subtitleSource?: SubtitleSource;
  subtitlesArray?: SubtitleSegment[];
  translatedSubtitles?: SubtitleTranslation[];
  translationMeta?: {
    sourceLanguage: string;
    targetLanguage: string;
    translatedAt: string;
  };
  fullText?: string;
  summaryMarkdown?: string | null;
  summaryJson?: SummaryStructured | null;
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

export type SubtitleSource = "native" | "asr";

export interface VideoChapterItem {
  cid: number;
  title: string;
  duration: number;
  page: number;
}

export interface VideoMeta {
  platform: VideoPlatform;
  videoId: string;
  title: string;
  author: string;
  duration: number;
  publishAt: string;
  viewCount?: number;
  likeCount?: number;
  pages: VideoChapterItem[];
}

export interface ParseVideoRequest {
  url: string;
}

export interface ParseVideoResponseData {
  meta: VideoMeta;
  hasNativeSubtitle: boolean;
}

export interface TranscriptFetchRequest {
  url: string;
}

export interface TranscriptFetchResponseData {
  meta: VideoMeta;
  subtitleSource: SubtitleSource;
  segments: SubtitleSegment[];
  fullText: string;
  historyId?: string;
}
