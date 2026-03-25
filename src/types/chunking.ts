export interface SubtitleChunk {
  id: string;
  text: string;
  start: number;
  end: number;
}

export interface ChunkingRules {
  targetChunkSize?: number;
  minChunkSize?: number;
  maxDurationSeconds?: number;
  preferSentenceBoundary?: boolean;
  preserveSpeakerChanges?: boolean;
  maxSentencesPerChunk?: number;
}

export interface ChunkingConfig {
  mode: "fixed" | "semantic" | "hybrid";
  rules: ChunkingRules;
}

export const DEFAULT_CHUNKING_RULES: ChunkingRules = {
  targetChunkSize: 200,
  minChunkSize: 40,
  maxDurationSeconds: undefined,
  preferSentenceBoundary: false,
  preserveSpeakerChanges: false,
  maxSentencesPerChunk: undefined
};

export interface ChunkingOptions {
  targetChunkSize?: number;
  minChunkSize?: number;
  maxDurationSeconds?: number;
  preferSentenceBoundary?: boolean;
  preserveSpeakerChanges?: boolean;
  maxSentencesPerChunk?: number;
}
