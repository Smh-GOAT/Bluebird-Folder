import { SubtitleChunker } from "./subtitle-chunker";

export * from "./subtitle-chunker";

export function createSubtitleChunker(): SubtitleChunker {
  return new SubtitleChunker();
}
