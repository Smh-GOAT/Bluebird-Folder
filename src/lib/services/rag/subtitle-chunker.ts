import type { SubtitleSegment } from "@/types";

export interface SubtitleChunk {
  id: string;
  text: string;
  start: number;
  end: number;
}

/**
 * 字幕分段规则配置
 */
export interface ChunkingRules {
  /** 目标分段大小（字符数），默认 200 */
  targetChunkSize?: number;
  /** 最小分段大小（字符数），默认 40 */
  minChunkSize?: number;
  /** 最大持续时间（秒），默认不限制 */
  maxDurationSeconds?: number;
  /** 优先在句子边界分段，默认 false */
  preferSentenceBoundary?: boolean;
  /** 保留说话人变化（预留），默认 false */
  preserveSpeakerChanges?: boolean;
  /** 每段最大句子数，默认不限制 */
  maxSentencesPerChunk?: number;
}

/**
 * 默认分段规则
 */
export const DEFAULT_CHUNKING_RULES: ChunkingRules = {
  targetChunkSize: 200,
  minChunkSize: 40,
  maxDurationSeconds: undefined,
  preferSentenceBoundary: false,
  preserveSpeakerChanges: false,
  maxSentencesPerChunk: undefined
};

export class SubtitleChunker {
  private targetChunkSize: number;
  private minChunkSize: number;
  private rules: ChunkingRules;

  constructor(rules?: ChunkingRules) {
    this.rules = { ...DEFAULT_CHUNKING_RULES, ...rules };
    this.targetChunkSize = this.rules.targetChunkSize!;
    this.minChunkSize = this.rules.minChunkSize!;
  }

  chunk(subtitles: SubtitleSegment[]): SubtitleChunk[] {
    if (subtitles.length === 0) return [];
    if (subtitles.length === 1) {
      return [{
        id: "chunk-0",
        text: subtitles[0].text,
        start: subtitles[0].start,
        end: subtitles[0].end
      }];
    }

    const chunks: SubtitleChunk[] = [];
    let currentChunk: SubtitleSegment[] = [];
    let currentText = "";
    let currentSentenceCount = 0;
    let chunkStartTime = 0;

    for (let i = 0; i < subtitles.length; i++) {
      const segment = subtitles[i];
      const isFirstSegment = currentChunk.length === 0;

      if (isFirstSegment) {
        currentChunk.push(segment);
        currentText = segment.text;
        chunkStartTime = segment.start;
        currentSentenceCount = this.countSentences(segment.text);
        continue;
      }

      const newTextLength = currentText.length + segment.text.length;
      const duration = segment.end - chunkStartTime;
      const newSentenceCount = currentSentenceCount + this.countSentences(segment.text);

      const shouldBreak = this.shouldBreakChunk({
        currentLength: currentText.length,
        newLength: newTextLength,
        duration,
        newSentenceCount,
        nextSegment: segment,
        isLastSegment: i === subtitles.length - 1
      });

      if (shouldBreak) {
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(chunks.length, currentChunk, currentText));
        }
        currentChunk = [segment];
        currentText = segment.text;
        chunkStartTime = segment.start;
        currentSentenceCount = this.countSentences(segment.text);
      } else {
        currentChunk.push(segment);
        currentText += segment.text;
        currentSentenceCount = newSentenceCount;
      }
    }

    if (currentChunk.length > 0) {
      const lastChunkText = currentChunk.map(s => s.text).join("");
      if (lastChunkText.length < this.minChunkSize && chunks.length > 0) {
        const prevChunk = chunks[chunks.length - 1];
        const mergedChunk: SubtitleChunk = {
          id: prevChunk.id,
          text: prevChunk.text + lastChunkText,
          start: prevChunk.start,
          end: currentChunk[currentChunk.length - 1].end
        };
        chunks[chunks.length - 1] = mergedChunk;
      } else {
        chunks.push(this.createChunk(chunks.length, currentChunk, lastChunkText));
      }
    }

    return chunks;
  }

  private shouldBreakChunk(params: {
    currentLength: number;
    newLength: number;
    duration: number;
    newSentenceCount: number;
    nextSegment: SubtitleSegment;
    isLastSegment: boolean;
  }): boolean {
    const { newLength, duration, newSentenceCount, nextSegment } = params;

    if (this.rules.maxDurationSeconds && duration >= this.rules.maxDurationSeconds) {
      return true;
    }

    if (this.rules.maxSentencesPerChunk && newSentenceCount > this.rules.maxSentencesPerChunk) {
      return true;
    }

    if (newLength >= this.targetChunkSize) {
      if (this.rules.preferSentenceBoundary) {
        if (this.isSentenceEnd(nextSegment.text)) {
          return true;
        }
        if (newLength > this.targetChunkSize * 1.2) {
          return true;
        }
        return false;
      }
      return true;
    }

    return false;
  }

  private isSentenceEnd(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;
    const lastChar = trimmed[trimmed.length - 1];
    const sentenceEndChars = new Set(["。", "！", "？", "!", "?", "."]);
    return sentenceEndChars.has(lastChar);
  }

  private countSentences(text: string): number {
    const matches = text.match(/[。！？.!?]+/g);
    return matches ? matches.length : 1;
  }

  private createChunk(index: number, segments: SubtitleSegment[], text: string): SubtitleChunk {
    return {
      id: `chunk-${index}`,
      text,
      start: segments[0].start,
      end: segments[segments.length - 1].end
    };
  }

  search(query: string, chunks: SubtitleChunk[], topK: number = 12): SubtitleChunk[] {
    const topKEffective = topK < 8 ? 12 : topK;
    const queryWords = this.extractKeywords(query.toLowerCase());
    if (queryWords.length === 0) return chunks.slice(0, topKEffective);

    const scored = chunks.map(chunk => {
      const chunkText = chunk.text.toLowerCase();
      let score = 0;

      for (const word of queryWords) {
        if (chunkText.includes(word)) {
          const count = (chunkText.match(new RegExp(word, "g")) || []).length;
          score += count * word.length;
        }
        const fuzzyMatches = this.fuzzyMatch(word, chunkText);
        score += fuzzyMatches * 0.5;
      }

      if (chunkText.includes(query.toLowerCase())) {
        score += query.length * 2;
      }

      const tfidfScore = this.calculateTFIDF(queryWords, chunkText, chunks);
      score += tfidfScore * 0.5;

      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topKEffective).map(s => s.chunk);
  }

  private fuzzyMatch(queryWord: string, chunkText: string): number {
    if (queryWord.length < 3) return 0;
    let bonus = 0;
    // Find all words in chunk that share >= 3-char prefix with queryWord
    const chunkWords = chunkText.split(/\s+/);
    for (const cw of chunkWords) {
      if (cw.length < 3) continue;
      const minLen = Math.min(queryWord.length, cw.length);
      let matchLen = 0;
      for (let i = 0; i < minLen; i++) {
        if (queryWord[i] === cw[i]) matchLen++;
        else break;
      }
      if (matchLen >= 3) bonus += matchLen;
    }
    return bonus;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "的", "了", "在", "是", "我", "有", "和", "就", "不", "人",
      "都", "一", "一个", "上", "也", "很", "到", "说", "要", "去",
      "你", "会", "着", "没有", "看", "好", "自己", "这", "那",
      "the", "a", "an", "is", "are", "was", "were", "be", "been",
      "have", "has", "had", "do", "does", "did", "will", "would",
      "could", "should", "may", "might", "must", "shall", "can",
      "need", "dare", "ought", "used", "to", "of", "in", "for",
      "on", "with", "at", "by", "from", "as", "into", "through",
      "during", "before", "after", "above", "below", "up", "down",
      "out", "off", "over", "under", "again", "further", "then",
      "once", "here", "there", "when", "where", "why", "how",
      "all", "each", "few", "more", "most", "other", "some",
      "such", "no", "nor", "not", "only", "own", "same", "so",
      "than", "too", "very", "just", "and", "but", "if", "or",
      "because", "until", "while", "this", "that", "these", "those"
    ]);

    return text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.has(word));
  }

  private calculateTFIDF(
    queryWords: string[],
    chunkText: string,
    allChunks: SubtitleChunk[]
  ): number {
    let score = 0;

    for (const word of queryWords) {
      const tf = (chunkText.match(new RegExp(word, "g")) || []).length / (chunkText.split(/\s+/).length || 1);
      const docCount = allChunks.filter(c => c.text.toLowerCase().includes(word)).length;
      const idf = Math.log((allChunks.length + 1) / (docCount + 1)) + 1;
      score += tf * idf;
    }

    return score;
  }
}
