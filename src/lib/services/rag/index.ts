import { SubtitleChunker, type ChunkingRules } from "./subtitle-chunker";

export * from "./subtitle-chunker";

export function createSubtitleChunker(rules?: ChunkingRules): SubtitleChunker {
  return new SubtitleChunker(rules);
}
