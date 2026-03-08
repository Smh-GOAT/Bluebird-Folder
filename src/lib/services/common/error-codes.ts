export const ErrorCodes = {
  INVALID_URL: 40001,
  UNSUPPORTED_PLATFORM: 40002,
  BAD_REQUEST: 40003,
  VIDEO_PARSE_FAILED: 50010,
  SUBTITLE_FETCH_FAILED: 50020,
  DOWNLOADER_FAILED: 50030,
  ASR_FAILED: 50040,
  INTERNAL_ERROR: 50050
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
