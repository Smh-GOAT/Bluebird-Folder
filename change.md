# 变更记录

## 2026-03-04

### 新增：重建蓝图工作流 Skill

**功能描述**：
添加 `.cursor/skills/rebuild-blueprint/` Skill，实现"固定工作流"开发模式。

**工作流说明**：
- **Kimi-K2.5**：输出《重建蓝图》（技术栈、目录结构、MVP路线、模块接口契约）
- **GPT-5.3-Codex**：按蓝图落地（每次一个可运行增量）
- **循环审查**：做完一个模块回 Kimi 审查（偏离？遗漏边界？需抽公共层？）

**文件结构**：
```
.cursor/skills/rebuild-blueprint/
├── SKILL.md                           # 主流程文档
├── templates/
│   ├── blueprint-template.md          # 《重建蓝图》模板
│   ├── module-contract-template.md    # 模块接口契约模板
│   └── progress-tracker.md            # 进度跟踪模板
└── examples/
    └── example-blueprint.md           # BibiGPT示例蓝图
```

**触发词**：
- "按重建蓝图工作流来"
- "开始重建"
- "输出蓝图"
- "按工作流来"

## 2026-03-05

### 新增：Milestone 0 项目骨架（可运行）

**功能描述**：
在当前目录完成 BibiGPT MVP 的第一阶段可运行骨架，包含 Next.js + TypeScript + Tailwind 基础框架、Supabase Auth 基础链路与三列布局演示页。

**本次新增**：
- 初始化并配置 Next.js（App Router）工程文件与脚本：`dev/build/start/lint`
- 建立 Tailwind、ESLint、TypeScript、PostCSS 配置
- 新增 Supabase 客户端封装（浏览器端/服务端/中间件会话刷新）
- 新增首页三列布局演示（左栏历史 + 中间主区 + 右栏总结/字幕占位）
- 新增基础认证面板（邮箱注册/登录/退出，未配置环境变量时安全降级提示）
- 新增健康检查接口：`/api/health`
- 新增 Prisma 初版模型文件（VideoHistory/UserPreference/SummaryTemplate）
- 新增 `.env.example` 与 `README.md` 运行说明

**验收结果**：
- `npm run lint` 通过
- `npm run dev` 启动成功（`http://localhost:3000`）
- 健康检查接口返回：`{"code":0,"data":{"status":"ok","milestone":"0"},"message":"success"}`

### 新增：Milestone 0.5 页面形态重构（MVP 流程对齐）

**功能描述**：
按最新产品形态要求重构基础页面：首页改为 ChatGPT 风格入口（左侧历史+文档分类，右侧输入链接解析），点击“生成总结”通过自定义弹窗选择参数后进入独立总结页（三列布局 + 顶部导出入口）。

**本次新增**：
- 首页重构为双栏入口页，保留“贴链接 -> 解析 -> 再点击生成总结”的半自动流程
- 新增“生成总结”弹窗：模板、语言、细节等级、时间戳、表情等参数
- 新增独立总结页路由：`/summary/[id]`
- 总结页三列布局：
  - 左侧：历史记录 + 分类文件夹
  - 中间：播放器占位 + AI 问答占位
  - 右侧：总结 / 原文细读 Tab 切换
- 新增顶部导出入口（MVP）：Markdown/JSON 下载与复制
- 更新设置页文案：模型配置 + Notion/飞书占位入口

**验收结果**：
- `npm run lint` 通过
- 页面路由返回 200：
  - `/`
  - `/summary/demo-1`
  - `/settings`

### 新增：Milestone 0.6 左侧列最小可用改造（前后端）

**功能描述**：
按“左侧列最小可用改造计划”完成首页左栏从静态展示到可交互版本升级，支持历史记录跳转、文件夹管理和拖拽归档，并新增对应后端 API。

**本次新增**：
- 左侧历史记录只显示视频标题，点击可跳转 `/summary/[id]`
- 文档分类支持一级文件夹管理：新建 / 重命名 / 删除
- 增加“未分类”分组，删除文件夹后记录自动回到未分类
- 支持将历史记录拖拽到目标文件夹（移动语义，单归属）
- 新增 API：
  - `GET/POST /api/folders`
  - `PATCH/DELETE /api/folders/:id`
  - `GET /api/history`
  - `POST /api/history/:id/move`
- 新增服务端内存数据层 `src/lib/server/sidebar-store.ts` 作为最小可运行后端存储
- Prisma schema 增补：
  - 新增 `Folder` 模型
  - `VideoHistory` 新增 `folderId` 字段与索引

**验收结果**：
- `npm run lint` 通过
- 首页 `/` 返回 200
- `GET /api/folders`、`GET /api/history` 正常返回
- `POST /api/history/:id/move` 移动成功并可恢复为未分类

### 新增：Milestone 0.5.1 UI 校准迭代（仅样式与比例）

**功能描述**：
在不改业务逻辑的前提下，完成首页与总结页的视觉系统校准：统一容器比例、卡片层级、按钮体系与左栏交互态，风格向 Notion / ChatGPT 的信息工作台靠拢。

**本次新增**：
- 全局样式体系升级（`globals.css`）：
  - 新增颜色变量（背景/表面/边框/文本/强调色）
  - 新增通用 UI 类：`ui-panel`、`ui-block`、`ui-title`、`ui-btn-*`
- 首页布局比例调整：
  - 页面最大宽度从 `1440` 收敛到 `1320`
  - 左栏宽度提升为 `300`，增强导航辨识度
- 总结页布局比例对齐：
  - 三列改为 `300 / 主区 / 360`
  - 头部与中栏统一卡片层级
- 左栏视觉升级（不改逻辑）：
  - 文件夹项/历史项统一 hover、selected、drag-over 态
  - 文字与间距节奏统一，提升可读性
- 输入区与导出区样式统一：
  - 主按钮/次按钮/危险按钮语义统一
  - 解析结果卡片、JSON 展示区与原文项统一边框圆角风格
- 登录面板样式对齐：
  - 输入框、按钮与卡片统一视觉语言

**验收结果**：
- `npm run lint` 通过
- 所有现有业务交互（点击、拖拽、跳转、弹窗）保持可用

### 新增：Focused Minimalism UI 重构（首页聚焦模式）

**功能描述**：
按“Google 首页输入聚焦体验 + Notion 卡片层级”方向完成 UI 重构：首页改为聚焦式输入体验（侧栏可收起/展开），并统一总结页布局比例、导出操作层级和登录区域主次按钮视觉。

**本次新增**：
- 首页结构重构：
  - 新增固定顶栏与侧栏开关（Hamburger）
  - 侧栏改为可收起/展开浮层，支持遮罩关闭
  - 默认进入“输入聚焦态”，解析后切换到常规内容态
- `LinkInputPanel` 增加聚焦模式能力：
  - 新增 `centered` 与 `onParsed` 属性
  - 居中模式下放大输入与按钮，强化核心操作
- 总结页比例优化：
  - 外层宽度扩展到 `1600`
  - 三列比例调整为 `280 / 1fr / 320`（并增加 `lg` 两列过渡）
- 导出操作重构：
  - 主操作改为“复制 Markdown”
  - 次操作收纳为下载下拉菜单（Markdown/JSON 下载，JSON 复制）
- 登录面板操作层级优化：
  - 主按钮突出“登录”
  - “注册”降级为次文案操作
- 全局视觉层级系统增强：
  - 新增 `ui-panel-elevated`、`ui-panel-subtle`
  - 强化按钮交互反馈（hover shadow / active scale）

**验收结果**：
- `npm run lint` 通过
- 首页 `/` 返回 200
- 总结页 `/summary/demo-1` 返回 200
- 业务逻辑未变：解析、弹窗、拖拽、跳转流程保持可用
