# 功能改进计划

## 背景
基于对现有代码库的深入分析，现提出以下两个功能改进方案。所有改进均在保持现有功能不变的前提下进行。

---

## 改进一：时间戳分段规则配置

### 现状分析

**当前实现：**
- `SubtitleChunker` 类位于 `src/lib/services/rag/subtitle-chunker.ts`
- 使用硬编码规则：`targetChunkSize = 200` 字符，`minChunkSize = 40` 字符
- 仅用于 QA/RAG 流程，按字符数简单累积分段
- 总结生成流程不使用分段，直接将全部字幕传给 LLM

**问题：**
- 段落长度不均匀，有的很长有的很短
- 没有考虑语义边界（句子结束、说话人变化等）
- 没有时间维度限制（如最长持续时间）

### 改进方案

#### 1. 新增分段配置类型

**文件：** `src/lib/services/rag/subtitle-chunker.ts`

```typescript
export interface ChunkingRules {
  // 基础规则
  targetChunkSize?: number;      // 默认 200
  minChunkSize?: number;         // 默认 40
  
  // 新增规则
  maxDurationSeconds?: number;      // 最大持续时间（秒）
  preferSentenceBoundary?: boolean; // 优先在句子边界分段
  preserveSpeakerChanges?: boolean; // 保留说话人变化
  maxSentencesPerChunk?: number;    // 每段最大句子数
}
```

#### 2. 扩展 SubtitleChunker 类

**文件：** `src/lib/services/rag/subtitle-chunker.ts`

- 构造函数接受 `ChunkingRules` 参数
- 新增 `isSentenceEnd(text: string): boolean` 方法检测句子结束
- 修改 `chunk()` 方法支持语义边界检测
- 保持向后兼容：不传配置时使用现有默认值

#### 3. 更新调用点

**文件：** `src/lib/services/rag/index.ts`

```typescript
export function createSubtitleChunker(rules?: ChunkingRules): SubtitleChunker {
  return new SubtitleChunker(rules);
}
```

**文件：** `src/app/api/qa/chat/route.ts`

- 从请求中读取分段配置参数（可选）
- 将配置传递给 `createSubtitleChunker()`

#### 4. 新增类型定义

**文件：** `src/types/chunking.ts`（新建）

```typescript
export interface ChunkingConfig {
  mode: 'fixed' | 'semantic' | 'hybrid';
  rules: ChunkingRules;
}

export const DEFAULT_CHUNKING_RULES: ChunkingRules = {
  targetChunkSize: 200,
  minChunkSize: 40,
  maxDurationSeconds: 30,
  preferSentenceBoundary: true,
  maxSentencesPerChunk: 3
};
```

### 实现步骤

1. **Phase 1: 基础配置**
   - 添加 `ChunkingRules` 接口
   - 修改 `SubtitleChunker` 构造函数
   - 更新工厂函数

2. **Phase 2: 语义分段逻辑**
   - 实现句子边界检测
   - 实现混合分段策略（字符数+语义边界）
   - 添加持续时间检查

3. **Phase 3: API 集成**
   - 修改 `/api/qa/chat` 接受分段配置
   - 测试不同规则组合

---

## 改进二：总结模板与字数要求

### 现状分析

**当前实现：**
- 已定义 10 种模板类型（`TEMPLATE_REGISTRY` in `src/types/summary.ts`）
- 仅实现了 3 种显示模板（generic, travel, academic）
- Prompt 构建器已支持模板信息和详细程度
- Prisma 有 `SummaryTemplate` 模型但未完全接入

**问题：**
- 总结过于简单，没有字数控制
- 模板系统不完整（7个模板缺少显示组件）
- 无法按模板定制字数要求

### 改进方案

#### 1. 扩展模板类型定义

**文件：** `src/types/summary.ts`

```typescript
export interface TemplateInfo {
  id: SummaryTemplate;
  name: string;
  description: string;
  promptFocus: string;
  
  // 新增字段
  wordCountConfig?: {
    min?: number;           // 最小字数
    max?: number;           // 最大字数
    target?: number;        // 目标字数
    perChapter?: boolean;   // 是否按章节应用
  };
  
  // 详细程度配置
  detailConfig?: {
    brief: { chapters: number; points: number; wordTarget: number };
    standard: { chapters: number; points: number; wordTarget: number };
    detailed: { chapters: number; points: number; wordTarget: number };
  };
}
```

#### 2. 更新模板注册表

**文件：** `src/types/summary.ts`

为每个模板添加字数配置示例：

```typescript
export const TEMPLATE_REGISTRY: Record<SummaryTemplate, TemplateInfo> = {
  general: {
    id: 'general',
    name: '通用总结',
    description: '...',
    promptFocus: '...',
    wordCountConfig: {
      min: 200,
      max: 800,
      target: 500,
      perChapter: false
    },
    detailConfig: {
      brief: { chapters: 3, points: 3, wordTarget: 200 },
      standard: { chapters: 5, points: 5, wordTarget: 500 },
      detailed: { chapters: 8, points: 8, wordTarget: 800 }
    }
  },
  // ... 其他模板
};
```

#### 3. 修改 Prompt 构建器

**文件：** `src/lib/services/llm/prompt-builder.ts`

在 `buildPrompt()` 中注入字数约束：

```typescript
// 在 detailLevel 部分后添加字数要求
if (templateInfo.wordCountConfig) {
  const { min, max, target } = templateInfo.wordCountConfig;
  prompt += `\n\n字数要求：\n`;
  if (target) prompt += `- 目标字数：约 ${target} 字\n`;
  if (min) prompt += `- 最少字数：${min} 字\n`;
  if (max) prompt += `- 最多字数：${max} 字\n`;
}

// 详细程度的字数目标
const detailWords = templateInfo.detailConfig?.[detailLevel]?.wordTarget;
if (detailWords) {
  prompt += `- 本详细程度目标字数：约 ${detailWords} 字\n`;
}
```

#### 4. 新增字数验证

**文件：** `src/lib/services/llm/parser.ts`

```typescript
export function validateWordCount(
  content: string, 
  config: TemplateInfo['wordCountConfig']
): { valid: boolean; actual: number; message?: string } {
  const wordCount = content.length; // 中文字符计数
  
  if (config?.min && wordCount < config.min) {
    return { valid: false, actual: wordCount, message: `字数不足（${wordCount}/${config.min}）` };
  }
  if (config?.max && wordCount > config.max) {
    return { valid: false, actual: wordCount, message: `字数超限（${wordCount}/${config.max}）` };
  }
  
  return { valid: true, actual: wordCount };
}
```

#### 5. 完善显示模板

为以下 7 个模板创建显示组件：
- interview-summary-template.tsx
- tutorial-summary-template.tsx
- news-summary-template.tsx
- meeting-summary-template.tsx
- podcast-summary-template.tsx
- review-summary-template.tsx
- vlog-summary-template.tsx

**参考：** `src/components/summary/templates/generic-summary-template.tsx`

#### 6. 字数显示 UI

**文件：** `src/components/summary/summary-display.tsx`

添加字数统计和提示：

```typescript
// 计算实际字数
const actualWordCount = useMemo(() => {
  if (!summary?.markdown) return 0;
  return summary.markdown.length;
}, [summary]);

// 显示字数对比
{templateInfo?.wordCountConfig && (
  <div className="text-xs text-zinc-500">
    字数：{actualWordCount} 
    {templateInfo.wordCountConfig.target && `/ ${templateInfo.wordCountConfig.target}`}
  </div>
)}
```

### 实现步骤

1. **Phase 1: 模板配置扩展**
   - 扩展 `TemplateInfo` 接口
   - 更新 `TEMPLATE_REGISTRY` 添加字数配置
   - 测试现有模板功能是否正常

2. **Phase 2: Prompt 字数约束**
   - 修改 `buildPrompt()` 注入字数要求
   - 添加字数验证逻辑
   - 测试不同字数配置的生成效果

3. **Phase 3: 缺失模板组件**
   - 创建 7 个缺失的显示模板
   - 更新 `SummaryTemplateRouter`
   - 确保所有模板都能正确渲染

4. **Phase 4: UI 优化**
   - 添加字数统计显示
   - 字数不足/超限提示
   - 生成进度中的字数预估

---

## 兼容性保证

### 向后兼容

两项改进都遵循**向后兼容**原则：

1. **分段规则**：不传配置时使用现有默认值，现有行为完全不变
2. **字数要求**：模板字数配置为可选，未配置的模板保持现有行为

### 无功能破坏

- 所有现有 API 端点保持兼容
- 所有现有组件继续工作
- 数据库 schema 无需修改（使用现有 JSON 字段）

---

## 预估工作量

| 改进项 | 文件数 | 预估工时 |
|--------|--------|----------|
| 时间戳分段规则 | 3-4 | 4-6 小时 |
| 总结模板完善 | 8-10 | 6-8 小时 |
| 字数要求系统 | 4-5 | 4-6 小时 |
| **总计** | **15-19** | **14-20 小时** |

---

## 建议实施顺序

1. **先完成改进二（总结模板）**
   - 影响面广，用户感知明显
   - 可以分批交付（先做字数，后补模板组件）

2. **后完成改进一（分段规则）**
   - 相对独立，主要影响 QA 功能
   - 需要测试不同规则对 RAG 效果的影响

---

## 需要您确认的问题

### 关于分段规则

1. **默认规则偏好**：
   - 是否默认启用语义边界检测？
   - 建议默认配置：`preferSentenceBoundary: true`, `maxDurationSeconds: 30`

2. **句子边界定义**：
   - 中文句子结束符：`。！？`
   - 是否需要支持英文标点 `.!?`

### 关于字数要求

1. **字数计算方式**：
   - 选项 A：字符数（含标点）- 简单直接
   - 选项 B：实际字数（中英文分别计算）- 更准确
   - 建议：先用字符数，后期优化

2. **字数策略**：
   - 宽松模式：仅作为提示，LLM 可能不遵守
   - 严格模式：生成后检查，不足则要求补充
   - 建议：先用宽松模式（仅修改 prompt）

3. **模板优先级**：
   - 建议先为哪几个模板配置字数？
   - 推荐：general（通用）、academic（学术）、tutorial（教程）

请审阅以上计划，确认后我将按步骤开始实施。
