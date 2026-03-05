# 《重建蓝图》- BibiGPT 重构版

## 1. 技术栈建议

| 层级 | 技术选型 | 版本 | 理由 |
|------|---------|------|------|
| 前端 | Next.js + React | 14.x | SSR支持、API路由、部署便捷 |
| UI组件 | shadcn/ui + Tailwind | latest | 现代化UI、快速开发 |
| 后端 | Next.js API Routes | 14.x | 前后端统一、减少复杂度 |
| AI服务 | OpenAI SDK | 4.x | 多模型支持、流式输出 |
| 数据库 | SQLite (本地) | 3.x | 零配置、足够MVP使用 |
| 缓存 | 内存Map | - | MVP阶段简化 |
| 部署 | Vercel/本地 | - | 一键部署 |

## 2. 目录结构

```
rebuild-bibigpt/
├── app/                      # Next.js App Router
│   ├── api/                  # API路由
│   │   ├── summarize/        # 视频总结接口
│   │   ├── transcript/       # 字幕获取接口
│   │   └── history/          # 历史记录接口
│   ├── page.tsx              # 首页
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/               # React组件
│   ├── ui/                   # shadcn组件
│   ├── video-input.tsx       # 视频输入组件
│   ├── summary-result.tsx    # 结果展示组件
│   └── history-list.tsx      # 历史列表组件
├── lib/                      # 工具函数
│   ├── ai/                   # AI相关
│   │   ├── openai.ts         # OpenAI客户端
│   │   └── prompts.ts        # 提示词模板
│   ├── video/                # 视频处理
│   │   ├── parser.ts         # 链接解析
│   │   └── transcript.ts     # 字幕获取
│   └── db/                   # 数据库
│       └── sqlite.ts         # SQLite客户端
├── types/                    # TypeScript类型
│   └── index.ts
├── public/                   # 静态资源
└── scripts/                  # 脚本
    └── init-db.ts            # 数据库初始化
```

## 3. MVP 路线

### Phase 1: 核心骨架（可运行）
- [ ] 项目初始化 (Next.js + shadcn)
- [ ] 基础配置 (环境变量、类型定义)
- [ ] 第一个可运行的端点 (/api/health)

### Phase 2: 核心功能
- [ ] 模块1：视频链接解析与验证
- [ ] 模块2：字幕获取与处理
- [ ] 模块3：AI总结生成

### Phase 3: 完善
- [ ] 错误处理中间件
- [ ] 日志记录
- [ ] 基础测试
- [ ] 历史记录功能

## 4. 模块拆分 + 接口契约

### 模块1：视频链接解析

**职责描述**：解析用户输入的视频链接，提取平台信息和视频ID

#### 接口1.1: 解析视频链接

- **Method**: POST
- **Path**: `/api/video/parse`
- **请求参数**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "format": "uri",
      "description": "视频链接"
    }
  },
  "required": ["url"]
}
```

- **响应成功 (200)**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "code": { "type": "integer", "enum": [0] },
    "data": {
      "type": "object",
      "properties": {
        "platform": { 
          "type": "string", 
          "enum": ["youtube", "bilibili"] 
        },
        "videoId": { "type": "string" },
        "title": { "type": "string" },
        "duration": { "type": "number" }
      }
    },
    "message": { "type": "string" }
  }
}
```

- **响应错误**：

| 错误码 | 含义 | 场景 |
|--------|------|------|
| 40001 | URL格式错误 | 不是有效的URL |
| 40002 | 不支持的平台 | 非YouTube/B站链接 |
| 40401 | 视频不存在 | 视频已删除或私密 |

---

### 模块2：字幕获取

**职责描述**：从视频平台获取字幕/转录文本

#### 接口2.1: 获取字幕

- **Method**: POST
- **Path**: `/api/transcript/fetch`
- **请求参数**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "platform": { 
      "type": "string", 
      "enum": ["youtube", "bilibili"] 
    },
    "videoId": { "type": "string" },
    "language": { 
      "type": "string", 
      "default": "zh" 
    }
  },
  "required": ["platform", "videoId"]
}
```

- **响应成功 (200)**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "code": { "type": "integer", "enum": [0] },
    "data": {
      "type": "object",
      "properties": {
        "transcript": { 
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "text": { "type": "string" },
              "start": { "type": "number" },
              "duration": { "type": "number" }
            }
          }
        },
        "language": { "type": "string" },
        "fullText": { "type": "string" }
      }
    },
    "message": { "type": "string" }
  }
}
```

- **响应错误**：

| 错误码 | 含义 | 场景 |
|--------|------|------|
| 40402 | 无可用字幕 | 视频没有字幕/转录 |
| 50002 | 获取失败 | 平台API错误 |

---

### 模块3：AI总结

**职责描述**：使用AI模型生成视频内容总结

#### 接口3.1: 生成总结

- **Method**: POST
- **Path**: `/api/summarize/generate`
- **请求参数**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "transcript": { "type": "string" },
    "style": { 
      "type": "string", 
      "enum": ["brief", "detailed", "bullet"],
      "default": "brief"
    },
    "language": { 
      "type": "string", 
      "default": "zh" 
    }
  },
  "required": ["transcript"]
}
```

- **响应成功 (200)**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "code": { "type": "integer", "enum": [0] },
    "data": {
      "type": "object",
      "properties": {
        "summary": { "type": "string" },
        "keyPoints": { 
          "type": "array",
          "items": { "type": "string" }
        },
        "tokensUsed": { "type": "number" }
      }
    },
    "message": { "type": "string" }
  }
}
```

- **响应错误**：

| 错误码 | 含义 | 场景 |
|--------|------|------|
| 40003 | 文本过长 | 超出模型上下文限制 |
| 50003 | AI服务错误 | OpenAI API错误 |
| 42902 | 限流 | 请求过于频繁 |

## 5. 数据模型

### 总结记录 SummaryRecord

```typescript
interface SummaryRecord {
  id: string;              // UUID
  videoUrl: string;        // 原始视频链接
  platform: string;        // 平台类型
  videoId: string;         // 平台视频ID
  title: string;           // 视频标题
  transcript: string;      // 完整字幕文本
  summary: string;         // 总结内容
  keyPoints: string[];     // 关键要点
  style: string;           // 总结风格
  language: string;        // 语言
  tokensUsed: number;      // Token消耗
  createdAt: Date;         // 创建时间
}
```

## 6. 依赖关系图

```
[视频输入] → [链接解析] → [字幕获取] → [AI总结] → [结果展示]
                ↓              ↓            ↓
            [错误处理]    [错误处理]   [错误处理]
                ↓              ↓            ↓
            [日志记录]    [日志记录]   [日志记录]
```

## 7. 风险与注意事项

1. **字幕获取不稳定**：YouTube/B站API可能变化 → 准备备用方案（手动粘贴）
2. **AI Token成本**：长视频消耗大 → 添加长度限制和预估提示
3. **CORS问题**：浏览器直接调用可能受限 → 使用服务端代理
