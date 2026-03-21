# Milestone 5 Implementation Plan

## Project: BibiGPT Rebuild MVP
## Target: Complete Video Player, Subtitle Edit, Export, and History Management

---

## Overview

This plan completes Milestone 5 based on the architecture diagram and user requirements:
- ✅ Video Player: iframe embedding for Bilibili & YouTube
- ✅ Timestamp Jump: Complete truncated code from plan file
- ✅ Subtitle Editor: Inline editing in "原文细读" tab
- ✅ Export Module: SRT/TXT/Markdown/JSON formats
- ✅ History Search: Title-based filtering in sidebar

---

## Phase 1: Infrastructure & Types

### 1.1 Create Video Types Extension
**File**: `src/types/video.ts` (append)
- Add `VideoPlatform` type extension if needed
- Ensure `VideoHistoryItem` has all required fields

### 1.2 Create Utility Functions
**File**: `src/lib/utils/time.ts` (modify)
- `formatTimeShort(seconds)` → "02:35"
- `formatTimeLong(seconds)` → "02:35:12"
- `secondsToSrtTime(seconds)` → "00:02:35,000"

### 1.3 Create Subtitle Export Utilities
**File**: `src/lib/utils/subtitle-export.ts` (new)
- `toSRT(subtitles)` → SRT format string
- `toTXT(subtitles, includeTimestamps)` → TXT format

**Dependencies**: None
**Parallel**: Yes

---

## Phase 2: Video Player Module

### 2.1 Create VideoPlayer Component
**File**: `src/components/video/video-player.tsx` (new)
```typescript
interface VideoPlayerProps {
  videoUrl: string;
  platform: VideoPlatform;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}
```
- Use iframe for Bilibili (player.bilibili.com)
- Use iframe for YouTube (youtube.com/embed)
- Sync currentTime from props

### 2.2 Create PlayerPlaceholder
**File**: `src/components/video/player-placeholder.tsx` (new)
- Show when videoUrl unavailable
- Platform-specific messaging
- External open button

### 2.3 Create useVideoPlayer Hook
**File**: `src/hooks/use-video-player.ts` (new)
```typescript
{
  currentTime, duration, isPlaying,
  seekTo(time), togglePlay(),
  setCurrentTime, setDuration
}
```

### 2.4 Integrate into SummaryShell
**File**: `src/components/summary/summary-shell.tsx` (modify lines 216-223)
- Replace placeholder with VideoPlayer
- Wrap with VideoTimeProvider

**Dependencies**: Phase 1.2
**Parallel**: Can parallel with Phase 3

---

## Phase 3: Timestamp Jump Module

### 3.1 Create VideoTimeContext
**File**: `src/components/summary/video-time-context.tsx` (new)
```typescript
interface VideoTimeContextType {
  currentTime: number;
  seekTo: (time: number) => void;
  registerSeekHandler: (handler: (time: number) => void) => void;
}
```
- Provider at summary-shell level
- Callback registration for player sync

### 3.2 Create TimestampButton
**File**: `src/components/summary/timestamp-button.tsx` (new)
```typescript
interface TimestampButtonProps {
  time: number;
  format?: "short" | "long";
  onClick?: () => void;
}
```
- Blue button with play icon
- Calls seekTo from context
- formatTimeShort/Long utilities

### 3.3 Add Timestamps to Subtitle Display
**File**: `src/components/summary/right-panel-tabs.tsx` (modify)
- Add TimestampButton before each subtitle segment
- Use "short" format (02:35)

**Dependencies**: Phase 2.3, Phase 1.2
**Parallel**: Can parallel with Phase 2

---

## Phase 4: Subtitle Editor Module

### 4.1 Create SubtitleEditor Component
**File**: `src/components/summary/subtitle-editor.tsx` (new)
```typescript
interface SubtitleEditorProps {
  subtitles: SubtitleSegment[];
  onSave: (subtitles: SubtitleSegment[]) => void;
  onCancel: () => void;
}
```
- Inline editing UI for text
- Time input fields (start/end)
- Save/Cancel buttons
- Optimistic updates

### 4.2 Integrate into RightPanelTabs
**File**: `src/components/summary/right-panel-tabs.tsx` (modify)
- Add "编辑" toggle button in "原文细读" tab
- Show SubtitleEditor when editing
- Show read-only view when not editing
- Call API to save changes

### 4.3 Create Edit API Endpoint (if needed)
**File**: `src/app/api/history/[id]/subtitles/route.ts` (new)
- PATCH endpoint to update subtitles
- Update sidebar-store

**Dependencies**: Phase 3.3
**Parallel**: No

---

## Phase 5: Export Module

### 5.1 Rewrite ExportActions Component
**File**: `src/components/summary/export-actions.tsx` (rewrite)
```typescript
interface ExportActionsProps {
  history: VideoHistoryItem;
}
```
- Accept history prop (remove mock data)
- Support 4 formats: SRT, TXT, Markdown, JSON

### 5.2 Implement SRT Export
- Use `toSRT()` utility
- Format: index + timecode + text + blank line
- Download: .srt file
- Copy to clipboard

### 5.3 Implement TXT Export
- Use `toTXT()` utility
- Default: plain text only
- Toggle: include timestamps
- Download: .txt file

### 5.4 Implement Markdown Export
- Use `history.summaryMarkdown`
- Fallback: generate from summaryJson
- Download: .md file
- Copy to clipboard

### 5.5 Implement JSON Export
- Use `history.summaryJson`
- Add metadata wrapper
- Pretty print
- Download: .json file
- Copy to clipboard

### 5.6 Update SummaryShell
**File**: `src/components/summary/summary-shell.tsx` (modify line 208)
- Pass history to ExportActions

**Dependencies**: Phase 1.3
**Parallel**: Can parallel with Phase 2, 3

---

## Phase 6: History Management Enhancement

### 6.1 Add Search to HomeSidebar
**File**: `src/components/home/home-sidebar.tsx` (modify)
- Add search input at top of "历史记录" section
- Client-side filtering by title
- Case-insensitive search
- Clear button

### 6.2 Update History Display
- Show filtered results
- Show "No results" when empty
- Maintain drag-drop functionality

**Dependencies**: None
**Parallel**: Yes

---

## Phase 7: Integration & Testing

### 7.1 Integration Tests
- Verify player loads with iframe
- Test timestamp jump syncs player
- Test subtitle editing saves correctly
- Test all export formats
- Test history search filters correctly

### 7.2 Type Check
```bash
npx tsc --noEmit
```

### 7.3 Build Verification
```bash
npm run build
```

---

## Parallel Execution Groups

### Group A (Independent)
- Phase 1: Infrastructure
- Phase 6: History Search

### Group B (Depends on Group A)
- Phase 2: Video Player
- Phase 3: Timestamp Jump
- Phase 5: Export Module

### Group C (Depends on B)
- Phase 4: Subtitle Editor

### Group D (Final)
- Phase 7: Integration

---

## File Summary

### New Files (8)
1. `src/components/video/video-player.tsx`
2. `src/components/video/player-placeholder.tsx`
3. `src/hooks/use-video-player.ts`
4. `src/components/summary/video-time-context.tsx`
5. `src/components/summary/timestamp-button.tsx`
6. `src/components/summary/subtitle-editor.tsx`
7. `src/lib/utils/subtitle-export.ts`
8. `src/app/api/history/[id]/subtitles/route.ts` (optional)

### Modified Files (4)
1. `src/lib/utils/time.ts` - Add time formatters
2. `src/components/summary/summary-shell.tsx` - Integrate all modules
3. `src/components/summary/right-panel-tabs.tsx` - Add timestamps & editor
4. `src/components/summary/export-actions.tsx` - Rewrite with real data
5. `src/components/home/home-sidebar.tsx` - Add search

---

## Success Criteria

- [ ] Video player shows Bilibili/YouTube iframe
- [ ] Clicking timestamp jumps video to that time
- [ ] Subtitle editing works inline with save/cancel
- [ ] Export works for all 4 formats (SRT, TXT, MD, JSON)
- [ ] History search filters by title
- [ ] No TypeScript errors
- [ ] Build succeeds
