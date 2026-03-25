# AGENTS.md

Agentic coding instructions for the Bluebird Folder project.

## Project Overview

A Next.js 16 + React 19 + TypeScript application for AI-powered video summarization and Q&A. Uses Supabase for auth/database, Prisma as ORM, and Tailwind CSS for styling.

## Build & Development Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Production
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint (eslint-config-next)
```

**Note:** No test runner is configured. Add tests with vitest/jest if needed.

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2022 with strict mode enabled
- **JSX**: `react-jsx` transform
- **Module**: ESNext with bundler resolution
- **Path alias**: `@/*` maps to `./src/*` — always use for internal imports

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `HomeSidebar.tsx` |
| Hooks | camelCase with `use-` prefix | `use-video-player.ts` |
| Utilities | camelCase | `time.ts` |
| Services | kebab-case | `bilibili-parser.ts` |
| Types | kebab-case, exported as PascalCase | `video.ts` exports `VideoMeta` |
| API Routes | `route.ts` in folder | `app/api/health/route.ts` |

### Import Ordering

```typescript
// 1. React/Next imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { createBrowserClient } from "@supabase/ssr";

// 3. Internal types (from @/types)
import type { VideoMeta } from "@/types";

// 4. Internal utilities/services/components
import { requestJson } from "@/lib/services/common/http-client";
import { HomeShell } from "@/components/home/home-shell";
```

### Naming Conventions

- **Functions/Variables**: camelCase (`fetchBilibiliMeta`, `currentTime`)
- **Components**: PascalCase (`HomeSidebar`, `AuthPanel`)
- **Types/Interfaces**: PascalCase (`VideoMeta`, `SubtitleSegment`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`BVID_REGEX`)
- **Error codes**: PascalCase object with numeric values (`ErrorCodes.INVALID_URL`)

### Type Patterns

```typescript
// Prefer interface for object shapes
export interface VideoMeta {
  platform: VideoPlatform;
  title: string;
  duration: number;
}

// Use type for unions/aliases
export type VideoPlatform = "bilibili" | "youtube" | "xiaohongshu";

// Export from index.ts for clean imports
export * from "./video";
export * from "./summary";
```

### Error Handling

Use the standardized API response format:

```typescript
// API routes
import { successResponse, errorResponse } from "@/lib/services/common/api-response";
import { ErrorCodes } from "@/lib/services/common/error-codes";

// Success
return successResponse({ status: "ok" });

// Error
return errorResponse(ErrorCodes.INVALID_URL, "Invalid video URL", 400);
```

### Styling Patterns

- Use Tailwind CSS utility classes
- Custom UI components use `@layer components` in `globals.css`:
  - `.ui-panel` — card containers
  - `.ui-title` — section headers
  - `.ui-btn-primary` / `.ui-btn-secondary` — buttons

### Services Architecture

```
src/lib/services/
├── common/          # Shared utilities (http-client, error-codes, api-response)
├── video/           # Platform parsers (bilibili, xiaohongshu)
├── asr/             # Audio transcription services
├── audio/           # Audio processing
├── llm/             # LLM providers and prompt building
└── rag/             # RAG/embedding services
```

### API Route Structure

```typescript
// app/api/resource/route.ts
import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/services/common/api-response";

export async function GET() {
  // Implementation
}

export async function POST(request: Request) {
  const body = await request.json();
  // Implementation
}
```

### Database (Prisma)

- Schema at `prisma/schema.prisma`
- Use `@map()` for snake_case column names
- Indexes defined with `@@index([fields])`

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `PYTHON_PATH` (for video download scripts)

## Key Dependencies

- **Framework**: Next.js 16, React 19
- **Database**: @supabase/ssr, @prisma/client
- **Styling**: Tailwind CSS 3.4
- **Validation**: Zod
- **Markdown**: react-markdown, remark-gfm

## Common Patterns

### Client Components

```typescript
"use client";  // Required for hooks/browser APIs

import { useState } from "react";

export function MyComponent() {
  // Implementation
}
```

### Supabase Client

```typescript
// Browser
import { createClient } from "@/lib/supabase/client";

// Server
import { createClient } from "@/lib/supabase/server";
```

### HTTP Client with Retry

```typescript
import { requestJson } from "@/lib/services/common/http-client";

const result = await requestJson<ApiResponse>(url, {
  timeoutMs: 10_000,
  retries: 1
});
```
