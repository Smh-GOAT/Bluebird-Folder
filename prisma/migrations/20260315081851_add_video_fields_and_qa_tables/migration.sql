-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('bilibili', 'youtube', 'xiaohongshu', 'douyin');

-- CreateEnum
CREATE TYPE "SubtitleSource" AS ENUM ('platform', 'asr', 'imported');

-- CreateTable
CREATE TABLE "video_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "folder_id" TEXT,
    "video_id" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" "VideoPlatform" NOT NULL,
    "author" TEXT,
    "duration_sec" INTEGER,
    "publish_at" TIMESTAMPTZ(6),
    "subtitle_source" "SubtitleSource",
    "full_text" TEXT,
    "subtitles_array" JSONB,
    "original_subtitles_array" JSONB,
    "translated_subtitles" JSONB,
    "translation_meta" JSONB,
    "summary_json" JSONB,
    "summary_markdown" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "video_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "default_output_language" TEXT NOT NULL DEFAULT 'zh',
    "default_show_timestamp" BOOLEAN NOT NULL DEFAULT false,
    "default_show_emoji" BOOLEAN NOT NULL DEFAULT true,
    "default_enable_stream" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt_template" TEXT NOT NULL,
    "config" JSONB,
    "is_builtin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summary_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_sessions" (
    "id" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "qa_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT,
    "references" JSONB,

    CONSTRAINT "qa_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtitle_segments" (
    "id" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "lang" TEXT NOT NULL,

    CONSTRAINT "subtitle_segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_histories_user_id_idx" ON "video_histories"("user_id");

-- CreateIndex
CREATE INDEX "video_histories_user_id_created_at_idx" ON "video_histories"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "video_histories_user_id_updated_at_idx" ON "video_histories"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "video_histories_platform_idx" ON "video_histories"("platform");

-- CreateIndex
CREATE INDEX "video_histories_subtitle_source_idx" ON "video_histories"("subtitle_source");

-- CreateIndex
CREATE INDEX "video_histories_folder_id_idx" ON "video_histories"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "folders_user_id_idx" ON "folders"("user_id");

-- CreateIndex
CREATE INDEX "folders_user_id_created_at_idx" ON "folders"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "folders_user_id_name_key" ON "folders"("user_id", "name");

-- CreateIndex
CREATE INDEX "qa_sessions_history_id_user_id_idx" ON "qa_sessions"("history_id", "user_id");

-- CreateIndex
CREATE INDEX "qa_sessions_user_id_updated_at_idx" ON "qa_sessions"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "qa_sessions_updated_at_idx" ON "qa_sessions"("updated_at");

-- CreateIndex
CREATE INDEX "qa_messages_session_id_timestamp_idx" ON "qa_messages"("session_id", "timestamp");

-- CreateIndex
CREATE INDEX "subtitle_segments_history_id_idx_idx" ON "subtitle_segments"("history_id", "idx");

-- CreateIndex
CREATE INDEX "subtitle_segments_history_id_start_ms_end_ms_idx" ON "subtitle_segments"("history_id", "start_ms", "end_ms");

-- AddForeignKey
ALTER TABLE "video_histories" ADD CONSTRAINT "video_histories_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_sessions" ADD CONSTRAINT "qa_sessions_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "video_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_messages" ADD CONSTRAINT "qa_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "qa_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle_segments" ADD CONSTRAINT "subtitle_segments_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "video_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
