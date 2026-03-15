import type { SubtitleSegment } from "./video";

export interface SubtitleTranslation {
  originalText: string;
  translatedText: string;
  start: number;
  end: number;
  detectedLanguage?: string;
  targetLanguage: string;
}

export interface TranslationOptions {
  sourceLanguage?: string;  // 不指定则自动检测
  targetLanguage: string;   // "zh" 或 "en"
  preserveTimestamps: true; // 必须保留
}

export interface SubtitleTranslateRequest {
  historyId: string;
  subtitles: SubtitleSegment[];
  options: TranslationOptions;
}

export interface SubtitleTranslateResponse {
  historyId: string;
  translations: SubtitleTranslation[];
  detectedSourceLanguage?: string;
  translatedAt: string;
}
