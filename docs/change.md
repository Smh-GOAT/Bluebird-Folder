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
按最新产品形态要求重构基础页面：首页改为 ChatGPT 风格入口（左侧历史+文档分类，右侧输入链接解析），点击"生成总结"通过自定义弹窗选择参数后进入独立总结页（三列布局 + 顶部导出入口）。

**本次新增**：
- 首页重构为双栏入口页，保留"贴链接 -> 解析 -> 再点击生成总结"的半自动流程
- 新增"生成总结"弹窗：模板、语言、细节等级、时间戳、表情等参数
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
按"左侧列最小可用改造计划"完成首页左栏从静态展示到可交互版本升级，支持历史记录跳转、文件夹管理和拖拽归档，并新增对应后端 API。

**本次新增**：
- 左侧历史记录只显示视频标题，点击可跳转 `/summary/[id]`
- 文档分类支持一级文件夹管理：新建 / 重命名 / 删除
- 增加"未分类"分组，删除文件夹后记录自动回到未分类
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
按"Google 首页输入聚焦体验 + Notion 卡片层级"方向完成 UI 重构：首页改为聚焦式输入体验（侧栏可收起/展开），并统一总结页布局比例、导出操作层级和登录区域主次按钮视觉。

**本次新增**：
- 首页结构重构：
  - 新增固定顶栏与侧栏开关（Hamburger）
  - 侧栏改为可收起/展开浮层，支持遮罩关闭
  - 默认进入"输入聚焦态"，解析后切换到常规内容态
- `LinkInputPanel` 增加聚焦模式能力：
  - 新增 `centered` 与 `onParsed` 属性
  - 居中模式下放大输入与按钮，强化核心操作
- 总结页比例优化：
  - 外层宽度扩展到 `1600`
  - 三列比例调整为 `280 / 1fr / 320`（并增加 `lg` 两列过渡）
- 导出操作重构：
  - 主操作改为"复制 Markdown"
  - 次操作收纳为下载下拉菜单（Markdown/JSON 下载，JSON 复制）
- 登录面板操作层级优化：
  - 主按钮突出"登录"
  - "注册"降级为次文案操作
- 全局视觉层级系统增强：
  - 新增 `ui-panel-elevated`、`ui-panel-subtle`
  - 强化按钮交互反馈（hover shadow / active scale）

**验收结果**：
- `npm run lint` 通过
- 首页 `/` 返回 200
- 总结页 `/summary/demo-1` 返回 200
- 业务逻辑未变：解析、弹窗、拖拽、跳转流程保持可用

### 新增：左侧文档分类树与浅色菜单交互

**功能描述**：
升级首页/总结页共用左侧栏的文档分类交互：文件夹支持展开查看所属视频列表，文件夹操作从内联按钮改为三点按钮触发的浅色下拉菜单，同时保持原有拖拽归档能力不变。

**本次新增**：
- 文档分类支持树形展开/收起：
  - 每个文件夹左侧新增箭头按钮
  - 展开后在文件夹下显示该文件夹下的视频标题列表
  - 点击视频标题可跳转 `/summary/[id]`
- 文件夹操作改为浅色弹出菜单：
  - 可编辑文件夹右侧新增"更多"按钮
  - 菜单项包含"重命名 / 删除"，含图标、分隔线、浅色 hover 效果
  - 点击菜单外部自动关闭菜单
- 保持现有拖拽能力：
  - 历史记录仍可拖拽到文件夹，`onDragOver/onDragLeave/onDrop` 逻辑不变

**验收结果**：
- `npm run lint` 通过
- 展开/收起、菜单操作、点击跳转与拖拽移动均可用

### 新增：文档分类精简与三点图标对齐修正

**功能描述**：
根据交互反馈进一步精简左侧文档分类，仅保留用户创建的文件夹；同时修正三点菜单图标视觉对齐问题，确保纵向三点严格居中对齐。

**本次新增**：
- 删除固定分类项：
  - 移除"全部历史""未分类"两个自动分类分组
  - 文档分类区仅展示用户文件夹
- 文件夹展开列表逻辑同步：
  - 展开后仅显示该文件夹 `folderId` 对应的视频
- 三点按钮图标修正：
  - 图标由 path 改为三个 `circle` 纵向排布
  - 保持固定尺寸按钮容器，确保整列对齐

**验收结果**：
- `npm run lint` 通过
- 分类列表仅显示用户文件夹
- 三点菜单按钮纵向对齐稳定

### 新增：视频总结页布局重平衡（内容详情页取向）

**功能描述**：
将"视频总结"页面从偏控制台布局调整为"中间内容优先"的详情页结构：缩窄左栏、固定右栏、显著放大中间主列，同时减少四周无效留白并压缩顶部与右栏密度。

**本次新增**：
- 页面外层容器调整：
  - 总结页主容器宽度调整为 `max-w-[1520px]`
  - 外层留白改为更紧凑的 `px-3/5/6` 与 `py-4/6`
  - 顶部标题栏与三栏主体使用同一主容器宽度
- 三栏比例重构：
  - 主体 grid 调整为 `lg: [240px, 1fr]`，`xl: [240px, 1fr, 320px]`
  - 左栏明显缩窄，右栏固定中等宽度，中栏成为视觉中心
- 中间主内容增强：
  - 视频播放器改为 `aspect-video`（16:9）+ `w-full` 响应式比例
  - AI 问答保持与播放器同列同宽，增强主列连续性
- 右栏压重处理：
  - 右栏面板与内容 padding 收紧
  - JSON 展示区增加 `max-h-56`，避免抢占过多纵向空间
- 左栏模块收紧：
  - `compact` 模式下三段卡片 padding 从 `4` 收紧为 `3.5`
  - 降低左栏视觉体积，保持导航清晰但不抢焦点
- 顶部操作区紧凑化：
  - 头部容器 `p-5 -> p-4`，`gap-4 -> gap-3`
  - 导出按钮组间距和主按钮宽度适度收紧

**验收结果**：
- `npm run lint` 通过
- 首页 `/` 与总结页 `/summary/demo-1` 均返回 200
- 功能逻辑无变更：拖拽、跳转、菜单、导出行为保持正常

### 新增：视频总结页二次布局重构（右侧总结主导）

**功能描述**：
按"右侧总结主导、中间视频辅助、左侧导航最弱"的阅读页目标重构总结页桌面端布局，重点调整主容器宽度、三栏比例、顶部工具栏密度、右栏阅读权重和首屏纵向空间利用。

**本次新增**：
- 总结页主容器扩展与留白压缩：
  - `w-full max-w-[1520px]` -> `w-[96vw] max-w-[1760px]`
  - 外层 spacing 从 `space-y-5` 收紧到 `space-y-3`
  - 外层 padding 收紧为 `px-4/5/6 + py-3/4`
- 顶部区域工具栏化：
  - header `p-4` -> `px-4 py-2.5`（lg 为 `px-5 py-3`）
  - 标题与操作区 `gap-3` -> `gap-2`，减少垂直占用
- 三栏比例重排（右侧最宽）：
  - `lg: [240,1fr] + xl: [240,1fr,320]`
  - 调整为 `lg: [220,400,minmax(680,1fr)]`，`xl: [220,440,minmax(720,1fr)]`
  - 满足"右侧 > 中间 > 左侧"的主次关系
- 中间视频区降级为辅助：
  - 保留 `aspect-video` 16:9，但整体列宽降至固定中等宽度（400/440）
  - 中列卡片与内部 padding 收紧，降低视觉体积
- 右侧总结区主内容化：
  - 右栏容器提升为 `ui-panel-elevated`
  - Markdown 阅读区提升到 `text-[15px] leading-7`
  - JSON 预览区高度压缩为 `max-h-44`
  - 右栏容器启用 `lg:sticky top-3` 增强桌面阅读稳定性
- 左栏继续弱化：
  - 总结页使用 `HomeSidebar compact`
  - compact 模式下模块和列表项 padding 进一步收紧

**验收结果**：
- `npm run lint` 通过
- 总结页 `/summary/demo-1` 返回 200
- 业务逻辑不变：数据结构/API/交互流程保持原样

### 新增：左侧边栏纵向重构（账户入口底部化）

**功能描述**：
优化左侧边栏纵向空间分配：将常驻登录表单移出主内容区，改为底部紧凑账户入口 + 弹窗登录；主内容聚焦"文档分类 + 历史记录"，并为后续长列表滚动体验预留结构。

**本次新增**：
- 账号模块降级为底部入口：
  - 移除左侧常驻展开登录表单
  - 底部新增"账户与登录"紧凑入口（头像+按钮）
  - 点击后以 modal 方式打开原登录面板
- 左侧主内容重排：
  - 上方文档分类区保留自适应高度并加最大高度约束（`max-h-[38vh]`）
  - 历史记录区改为 `flex-1 + min-h-0 + overflow-y-auto`，作为主要滚动列表区域
  - 分类、历史、账户三层职责更清晰
- 结构适配未来滚动：
  - 左侧整体改为 `flex-col` 纵向布局
  - 主区与底部账户入口分离，避免首屏被账号模块占用

**验收结果**：
- `npm run lint` 通过
- 左侧首屏占用显著收紧，历史区可承载后续长列表滚动
- 登录能力保留（通过底部入口弹窗进入）

### 新增：底部账户入口登录态展示优化

**功能描述**：
优化左侧底部账户入口的信息表达：已登录时显示邮箱简写与账户摘要，未登录时显示"登录/注册"提示，让用户无需展开面板即可感知当前账号状态。

**本次新增**：
- 账户入口增加 Supabase 登录态感知：
  - 已登录：显示邮箱首字母头像 + 邮箱文本 + "管理账户"
  - 未登录：显示默认头像"账" + "登录 / 注册" + "点击打开账户面板"
- 保持原交互不变：
  - 点击入口仍通过 modal 打开原 `AuthPanel`
  - 不改动原有认证逻辑和数据结构

**验收结果**：
- `npm run lint` 通过
- 登录态变化时账户入口文本可实时更新

### 新增：右侧总结区滚动结构重构（三层阅读模型）

**功能描述**：
将右侧总结区重构为"顶部控制区 + JSON 辅助区 + Markdown 主阅读区"的纵向结构，明确高度分配与滚动职责，减少多层滚动混乱并提升长内容阅读体验。

**本次新增**：
- 右侧整体结构调整：
  - 右侧容器改为 `flex-col` 布局，形成清晰三层结构
  - 顶部控制区（标签+说明）设置为 `shrink-0`，高度紧凑且稳定
- JSON 区辅助化处理：
  - JSON 外层作为辅助信息块保留
  - 预览区限制为 `max-h-40`，并采用内部滚动
  - 防止 JSON 区无限增长挤压正文区域
- Markdown 区主阅读化：
  - Markdown 区提升为右侧主体阅读内容
  - 文本排版保持 `text-[15px] leading-7`，增强连续阅读舒适度
  - 在右侧主体滚动容器中获得主要可见面积
- 滚动层级优化：
  - 右侧主滚动统一为中间主体区 `flex-1 + overflow-y-auto`
  - transcript 模式下复用同一主体滚动容器
  - 避免右侧出现过多并行滚动容器
- 右侧高度策略增强：
  - 右侧外层在桌面端使用 `lg:h-[calc(100vh-7rem)]`
  - 搭配 `sticky`，保证阅读区在桌面端稳定可用

**验收结果**：
- `npm run lint` 通过
- 右侧结构满足"控制区紧凑 + JSON受限 + Markdown主阅读"目标
- 未改动业务逻辑与数据结构

### 新增：总结页头部"新总结"导航入口

**功能描述**：
在"视频总结"详情页头部左侧增加页面级导航按钮"新总结"，用于快速返回首页发起新总结流程，并保持原有"左标题信息 / 右操作区"结构。

**本次新增**：
- 在头部标题区左侧新增轻量按钮：
  - 文案：`新总结`
  - 样式：轻边框次级按钮（非主 CTA）
  - 图标：左箭头语义图标
- 按钮跳转：
  - 点击后路由跳转到首页 `/`
- 头部布局微调：
  - 左侧由"标题块"改为"新总结按钮 + 标题块"的横向组合
  - 保持右侧"复制 Markdown / 下载"操作区不变

**验收结果**：
- `npm run lint` 通过
- 头部按钮位置与跳转行为符合页面级导航预期

### 新增：站点名称更新为 Bluebird Folder

**功能描述**：
统一页面品牌名称，将应用对外展示名称更新为 `Bluebird Folder`，用于浏览器页签与首页顶栏展示。

**本次新增**：
- 更新全局 metadata 标题为 `Bluebird Folder`
- 更新首页顶栏主标题文案为 `Bluebird Folder`

**验收结果**：
- 浏览器页签标题显示为 `Bluebird Folder`
- 首页顶栏品牌名显示为 `Bluebird Folder`

### 新增：Milestone 1（Bilibili + Qwen3-ASR）最小可运行链路

**功能描述**：
完成 Milestone 1 首阶段落地：支持 Bilibili 链接解析、字幕优先获取、无字幕自动走 Python 下载与 Qwen3-ASR 转写，并在首页展示转写预览；同时提供 Cookie/User-Agent 的服务端混合配置（env 默认 + 设置页覆盖）。

**本次新增**：
- 新增 API：
  - `POST /api/video/parse`：解析 Bilibili 元信息并判断是否有原生字幕
  - `POST /api/transcript/fetch`：原生字幕优先，失败回退 ASR
  - `GET/POST /api/settings/runtime`：读取/保存 Bilibili Header 覆盖配置
- 新增服务层：
  - `bilibili-parser`（BV/av 解析、短链解析、元信息抓取）
  - `bilibili-subtitle`（原生字幕索引与下载）
  - `python-downloader`（Node 调 Python）
  - `qwen3-asr`（ASR 请求与文本转字幕段）
  - `http-client`、统一响应与错误码
- 新增 Python 脚本：
  - `scripts/bilibili_downloader.py`
  - 依赖 `yt-dlp + moviepy`（底层依赖 ffmpeg）
- 前端接入：
  - 首页输入框从 mock 解析改为真实请求 `/api/video/parse` + `/api/transcript/fetch`
  - 展示元信息、字幕来源（native/asr）与转写片段预览
  - 仅有转写片段时才允许点击"生成总结"
- 设置页接入：
  - 新增 Bilibili User-Agent/Cookie 覆盖输入与保存

**验收结果**：
- `npm run lint` 通过
- 输入 Bilibili 链接可触发解析请求并返回可读结果

### 新增：Milestone 2（历史持久化 + 小红书平台可插拔）

**功能描述**：
完成 Milestone 2 目标链路：解析/转写成功后自动保存历史，左侧历史可实时展示并跳转总结页回看；同时引入平台解析抽象并接入小红书 mock 解析，验证可插拔架构。

**本次新增**：
- 历史存取能力：
  - `POST /api/history`：保存历史记录
  - `GET /api/history/[id]`：按 ID 查询历史详情
  - `sidebar-store` 新增 `saveHistory` / `getHistoryById`
- 转写链路入库：
  - `POST /api/transcript/fetch` 成功后自动保存历史
  - 响应新增 `historyId`，用于前端跳转 `/summary/[id]`
- 平台解析抽象：
  - 新增 `PlatformParser` 抽象与平台路由
  - `POST /api/video/parse` 与 `POST /api/transcript/fetch` 改为平台路由模式
- 小红书接入（M2 验证版）：
  - 新增 `XiaohongshuParser`（mock 元信息 + mock 转写）
  - 首页输入支持 `xiaohongshu.com / xhslink.com` 链接
- 总结页真实回看：
  - `SummaryShell` 按路由 ID 拉取历史详情
  - `RightPanelTabs` 优先展示真实字幕与记录中的总结字段（无值时回退 mock 占位）
- 配置补充：
  - `.env.example` 新增 `BILIBILI_DOWNLOADER_TIMEOUT_MS`
  - `.env.example` 预留小红书 UA/Cookie 配置项

**验收结果**：
- `npm run lint` 通过
- `npm run build` 通过
- Bilibili 链接可完成：解析 -> 转写 -> 入历史 -> 跳转总结页回看
- 小红书链接可完成 mock 版：解析 -> 转写 -> 入历史 -> 回看

## 2026-03-09

### 新增：Milestone 2 交接文档落地（仓库内可直接接手）

**功能描述**：
将 Milestone 2 的交接内容从会话/计划层落地到仓库文档，形成可直接执行的开发交接说明，明确目标范围、接手顺序、必改文件、验收标准与风险边界。

**本次新增**：
- 新增交接文档：`docs/milestone2-handoff.md`
- 补充"接手顺序（可执行步骤）"，覆盖小红书真实解析的完整落地路径
- 补充"接口契约（不可破坏）"，约束 `PlatformParser` 输入输出
- 补充"验收标准（完成定义）"与"进入 Milestone 3 前置条件"

**验收结果**：
- 仓库内可直接阅读并接手 Milestone 2 后续实现，无需额外口头说明

### 新增：Milestone 2 小红书真实解析链路落地（解析+下载+ASR+配置）

**功能描述**：
完成 Milestone 2 的核心缺口补齐：将小红书从 mock 解析升级为真实链路，接入 Python 提取器与 Qwen3-ASR，并打通小红书 Cookie/UA 的服务端覆盖配置与设置页输入。

**本次新增**：
- 新增脚本：`scripts/xiaohongshu_extractor.py`
  - 支持 `download=false` 仅提取元信息
  - 支持 `download=true` 下载视频并抽取 `audio.mp3`
- 扩展下载服务：`src/lib/services/video/python-downloader.ts`
  - 新增 `runXiaohongshuExtractor(...)`
  - 支持小红书下载超时配置 `XIAOHONGSHU_DOWNLOADER_TIMEOUT_MS`
- 重构小红书解析器：`src/lib/services/video/xiaohongshu-parser.ts`
  - `parse()` 改为真实元信息提取
  - `fetchTranscript()` 改为真实下载 + ASR 转写
  - 增加 xhslink 短链跳转解析
- 配置体系扩展：
  - `runtime-config-store` 增加 `xiaohongshuCookie`、`xiaohongshuUserAgent`
  - `GET/POST /api/settings/runtime` 增加小红书配置读写
  - 设置页新增"小红书访问头覆盖（Milestone 2）"输入区
- 环境变量补充：`.env.example` 新增 `XIAOHONGSHU_DOWNLOADER_TIMEOUT_MS`
- 请求头构建补充：`request-headers.ts` 新增 `buildXiaohongshuHeaders`

**验收结果**：
- `npm run lint` 通过
- `npm run build` 通过
- 小红书链路由 mock 升级为真实解析链路，可用于后续端到端实测

### 新增：Milestone 2 边界处理补充（重试+错误提示）

**功能描述**：
补充小红书链路的健壮性处理：增加自动重试机制（下载与ASR），并提供面向用户的可读错误提示。

**本次新增**：
- 小红书解析器增强（`src/lib/services/video/xiaohongshu-parser.ts`）：
  - 新增 `withRetry` 通用重试工具（默认最多2次尝试）
  - `parse()` 阶段：短链解析与元信息提取增加重试
  - `fetchTranscript()` 阶段：下载与 ASR 转写均增加重试
  - 新增 `toReadableError` 错误转换器，覆盖以下场景：
    - Cookie 失效/风控（403/401/forbidden/captcha 等）
    - 处理超时（timed out/timeout）
    - 视频流不可用（no video formats found/unable to extract）
    - ASR 404 配置错误
  - 错误提示引导用户更新设置页 Cookie

**验收结果**：
- `npm run lint` 通过
- 边界情况已覆盖：重试机制、Cookie 失效提示、超时提示、风控提示

### 新增：Milestone 3 - 真实 LLM 总结功能（JSON + Markdown 双格式）

**功能描述**：
将总结区从 mock 占位切换为真实 LLM 生成，输出严格格式的 JSON 结构化和 Markdown 可读内容，并持久化到历史记录，确保刷新页面后总结不丢失。

**本次新增**：
- **类型定义增强**（`src/types/summary.ts`）：
  - 新增完整的 `SummaryStructured` 类型：包含 `overview`、`keyPoints`、`chapters`、`tags`、`meta`
  - 新增 `LLMProviderType`、`LLMGenerateParams`、`LLMResult` 等 LLM 相关类型
  - 新增 `PromptBuildParams`、`GenerateSummaryParams` 等参数类型
- **LLM 服务层**（`src/lib/services/llm/`）：
  - `prompt-builder.ts`：构建专业 Prompt，支持多种模板（default/academic/tutorial/news/meeting）、语言、详细程度
  - `parser.ts`：LLM 响应解析器，使用 Zod 进行 JSON Schema 校验
  - `provider.ts`：统一 LLM Provider 抽象，支持 Kimi（主选）、OpenAI、Anthropic 三家，带自动重试机制
  - `index.ts`：统一导出 LLM 服务接口
- **API 路由**（`src/app/api/summary/generate/route.ts`）：
  - `POST /api/summary/generate`：根据 historyId 获取字幕，调用 LLM 生成总结
  - 自动缓存：已生成的总结直接返回，避免重复调用 LLM
  - 错误处理：覆盖无字幕、无 API Key、LLM 调用失败等场景
- **前端集成**：
  - `summary-shell.tsx`：接管异步生成逻辑，页面加载时自动检查并触发生成
  - 从 URL query 读取生成参数（template/language/detail/showTimestamp/showEmoji）
  - `generate-status.tsx`：新增生成状态组件，显示"生成中"加载动画或"生成失败"重试界面
  - `right-panel-tabs.tsx`：更新为展示真实总结数据
  - `summary-display.tsx`：新增总结展示组件，支持 JSON 展开/收起、复制、Markdown 复制/下载
- **环境变量配置**（`.env.example`）：
  - 新增 `LLM_PROVIDER`：选择主 provider（kimi/openai/anthropic）
  - 新增 Kimi 配置：`KIMI_API_KEY`、`KIMI_BASE_URL`、`KIMI_MODEL`
  - 新增 OpenAI 配置：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`
  - 新增 Anthropic 配置：`ANTHROPIC_API_KEY`、`ANTHROPIC_BASE_URL`、`ANTHROPIC_MODEL`

**技术亮点**：
- 多 Provider 支持：主选国产 Kimi 模型，同时支持 OpenAI/Anthropic 作为备选
- 自动重试机制：网络超时、速率限制等可恢复错误自动重试（最多3次）
- 严格的 JSON Schema：使用 Zod 校验 LLM 输出，确保数据结构一致性
- 双格式输出：同时生成结构化 JSON 和可读 Markdown，满足不同使用场景
- 持久化存储：总结结果保存到 sidebar-store，刷新页面不丢失

**验收结果**：
- `npm run lint` 通过（无错误）
- `npm run build` 通过
- 文件变更汇总：
  - 新建：`src/types/summary.ts`、`src/lib/services/llm/*.ts`、`src/app/api/summary/generate/route.ts`、`src/components/summary/generate-status.tsx`、`src/components/summary/summary-display.tsx`
  - 修改：`src/components/summary/summary-shell.tsx`、`src/components/summary/right-panel-tabs.tsx`、`src/types/video.ts`（类型扩展）、`.env.example`

## 2026-03-11

### 新增：Milestone 3.5 - 总结体验全面优化（Markdown 渲染 + 10 模板 + 弹窗重构）

**功能描述**：
完成 Milestone 3.5 目标：提升总结功能的用户体验，实现 Markdown 富文本渲染、10 个专业模板、模板化展示、优化的弹窗交互。

**本次新增**：

#### 1. Markdown 渲染优化
- **新增组件**：`src/components/summary/markdown-renderer.tsx`
  - 使用 `react-markdown` + `remark-gfm` 渲染 Markdown 为富文本
  - 自定义组件映射：h1/h2/h3 标题层级、blockquote 引用块、列表、代码块、表格等
  - 样式与现有 UI 风格一致，简洁现代的产品化阅读界面
- **依赖安装**：`react-markdown`、`remark-gfm`

#### 2. 模板系统升级（10 个专业模板）
- **类型扩展**（`src/types/summary.ts`）：
  - 新增 `SummaryTemplate` 联合类型：general/interview/travel/academic/tutorial/news/meeting/podcast/review/vlog
  - 新增 `TEMPLATE_REGISTRY`：包含 10 个模板的名称、描述、Prompt 重点
  - 模板差异化策略：每个模板有独特的分析重点和指导语
- **Prompt 构建器**（`src/lib/services/llm/prompt-builder.ts`）：
  - 根据选择的模板注入对应的 `promptFocus` 指导语
  - 保留通用要求：清晰结构、语言一致、支持时间戳、支持 emoji
- **服务导出更新**（`src/lib/services/llm/index.ts`）：
  - 导出 `TEMPLATE_REGISTRY` 和 `SummaryTemplate` 类型

#### 3. 生成总结弹窗优化
- **模板选择网格**（`src/components/home/generate-summary-modal.tsx`）：
  - 将 `<select>` 改为卡片式网格布局（桌面端 5 列，响应式调整）
  - 每个模板卡片展示：图标 + 模板名称，选中状态有高亮边框和背景变化
  - 默认选中 `general` 模板
- **参数区横向布局**：
  - 语言选择（简体中文/English）和详细程度（简洁/标准/详细）横向排列
  - 显示选项区（时间戳/Emoji）独立成块，横向排列
- **底部操作栏固定**：
  - 底部操作区固定在弹窗底部，避免移动端按钮被挤出视口
  - 顶部内容区域独立滚动，提升长表单体验

#### 4. 首版模板化展示（路由 + 3 个专用组件）
- **模板路由组件**（`src/components/summary/summary-template-router.tsx`）：
  - 根据 `summary.template` 字段决定使用哪个展示组件
  - 路由规则：travel -> TravelSummaryTemplate, academic -> AcademicSummaryTemplate, 其他 -> GenericSummaryTemplate
  - 兜底逻辑：无模板字段时默认使用 `general`
- **通用模板**（`src/components/summary/templates/generic-summary-template.tsx`）：
  - 顶部标题区 + TL;DR + 元信息卡片（作者/平台/时长/标签）+ Markdown 正文
  - 标签使用 chip/pill 样式，元信息使用轻卡片样式
- **旅行模板**（`src/components/summary/templates/travel-summary-template.tsx`）：
  - 渐变蓝色头部（✈️ 旅行攻略标识）
  - 四格信息卡：平台、作者、时长、地点
  - 攻略要点提示框（💡 行程/交通/预算/避坑提示）
  - 地点标签使用 📍 前缀，体现旅游攻略风格
- **学术模板**（`src/components/summary/templates/academic-summary-template.tsx`）：
  - 靛青色边框头部（🎓 学术分析标识）
  - 四格信息卡：平台、讲者、时长、领域
  - 结构化分析区：核心问题、关键观点、方法/论证、局限/启发（2x2 网格布局）
  - 标签使用 🏷️ 前缀，体现学术研究风格
- **展示入口更新**（`src/components/summary/summary-display.tsx`）：
  - 改为调用 `SummaryTemplateRouter`，将数据传递给对应模板组件
  - 保留复制/下载功能，按钮固定在内容区右上角

#### 5. 元信息展示增强 + 兜底逻辑
- **元信息结构化展示**：
  - 所有模板组件统一展示：标题、作者、平台、时长、标签
  - 使用轻卡片 / 小标签（chip）样式，避免单纯使用 blockquote
- **兼容与兜底规则**：
  - 没有 `template` 字段：默认使用 `general`
  - 模板类型未知：fallback 到 `general`
  - 某模板没有专属组件：fallback 到 `GenericSummaryTemplate`
  - 结构化元信息缺失：继续渲染 Markdown 正文
  - Markdown 为空：显示空态提示

**文件变更汇总**：
- 新建：
  - `src/components/summary/markdown-renderer.tsx`
  - `src/components/summary/summary-template-router.tsx`
  - `src/components/summary/templates/generic-summary-template.tsx`
  - `src/components/summary/templates/travel-summary-template.tsx`
  - `src/components/summary/templates/academic-summary-template.tsx`
- 修改：
  - `package.json`：添加 `react-markdown`、`remark-gfm` 依赖
  - `src/types/summary.ts`：扩展 `SummaryTemplate` 类型，新增 `TEMPLATE_REGISTRY`
  - `src/lib/services/llm/prompt-builder.ts`：使用 `TEMPLATE_REGISTRY` 构建差异化 Prompt
  - `src/lib/services/llm/index.ts`：导出 `TEMPLATE_REGISTRY` 和 `SummaryTemplate`
  - `src/components/home/generate-summary-modal.tsx`：模板网格选择 + 弹窗布局重构
  - `src/components/summary/summary-display.tsx`：接入模板路由与渲染器

**技术亮点**：
- 模板系统可扩展：新增模板只需在 `TEMPLATE_REGISTRY` 注册，并可选创建专用展示组件
- Markdown 渲染可配置：通过自定义组件映射，统一到现有 UI 风格
- 兜底逻辑完善：确保旧数据、缺失字段情况下页面不报错，优雅降级
- 弹窗体验优化：卡片网格选择直观，固定底部操作栏避免移动端布局问题

**验收结果**：
- `npm run lint` 通过
- `npm run build` 通过
- Markdown 正确渲染（标题、引用、列表、代码块、表格）
- 10 个模板在弹窗中可正常选择，默认选中 general
- general/travel/academic 三个模板有差异化展示，其他模板通过通用模板正常显示
- 旧总结数据（无 template 字段）自动走 general 模板，不报错

### 代码重构：抽取公共工具函数与组件（Milestone 3.5 后续优化）

**功能描述**：
对 Milestone 3.5 的代码进行重构，提取重复的时间格式化函数和元信息卡片组件，提高代码复用性和可维护性。

**本次重构**：

#### 1. 时间工具函数抽取
- **新增文件**：`src/lib/utils/time.ts`
  - `formatTime(seconds)`：将秒数格式化为 MM:SS 字符串
  - `formatDuration(seconds)`：将秒数格式化为时长字符串（自动判断是否显示小时）
- **更新引用**：
  - `src/lib/services/llm/prompt-builder.ts`：删除本地函数定义，改为从 `time.ts` 导入
  - `src/components/summary/templates/generic-summary-template.tsx`：改为从 `time.ts` 导入
  - `src/components/summary/templates/meta-info-card.tsx`：使用 `time.ts` 中的函数

#### 2. 元信息卡片组件抽取
- **新增文件**：`src/components/summary/templates/meta-info-card.tsx`
  - `MetaInfoCard` 组件：统一展示平台、作者、时长、扩展字段四个信息卡片
  - 支持三种变体样式：`default`（灰底）、`travel`（蓝底）、`academic`（白底带边框）
  - 根据 variant 自动调整标签文案（如 academic 显示"讲者"而非"作者"）
- **更新模板组件**：
  - `travel-summary-template.tsx`：使用 `MetaInfoCard` 替代内联的四格卡片
  - `academic-summary-template.tsx`：使用 `MetaInfoCard` 替代内联的四格卡片

**重构收益**：
- **消除重复代码**：`formatDuration` 从 4 个文件重复定义减少到 1 个公共函数
- **统一维护入口**：时间格式化逻辑集中管理，后续修改只需改一处
- **组件复用**：元信息卡片样式统一，新增模板时可快速复用
- **类型安全保持**：所有导入/导出保持完整的 TypeScript 类型定义

**功能保证**：
- 原功能不发生变动：所有样式、布局、交互行为保持与原实现一致
- 仅代码组织方式优化，用户可见层无感知

**验收结果**：
- `npm run lint` 通过
- `npm run build` 通过
- 文件变更汇总：
  - 新建：`src/lib/utils/time.ts`、`src/components/summary/templates/meta-info-card.tsx`
  - 修改：`src/lib/services/llm/prompt-builder.ts`、`src/components/summary/templates/generic-summary-template.tsx`、`src/components/summary/templates/travel-summary-template.tsx`、`src/components/summary/templates/academic-summary-template.tsx`

## 2026-03-11

### 新增：Milestone 4 - 视频问答 RAG 系统 + 字幕翻译功能

**功能描述**：
完成 Milestone 4 目标：将总结页中间的 AI 问答区从静态占位改造为真实的 RAG 问答系统，同时在生成总结时支持字幕翻译功能。

**本次新增**：

#### 1. 视频问答 RAG 系统
- **类型定义**（`src/types/qa.ts`）：
  - `QAMessage`：问答消息结构（id/role/content/timestamp/references/model）
  - `QASession`：对话会话结构（id/historyId/messages/createdAt/updatedAt）
  - `SubtitleReference`：字幕引用（start/end/text/score）
  - `QAChatRequest/QAChatResponse`：API 请求/响应类型

- **RAG 检索服务**（`src/lib/services/rag/`）：
  - `subtitle-chunker.ts`：字幕切分与关键词检索服务
    - `chunk()`：合并相邻字幕形成语义块（目标 50-100 字）
    - `search()`：基于关键词 + TF-IDF 的轻量级检索（首版无需向量数据库）
  - `index.ts`：统一导出 RAG 服务

- **问答存储层**（`src/lib/server/qa-store.ts`）：
  - 基于内存存储，类似 sidebar-store
  - `createSession()`：创建新会话
  - `getSession()`：获取会话
  - `addMessage()`：添加消息
  - `listSessionMessages()`：列出会话消息
  - `clearSession()`：清空会话

- **问答 API 路由**：
  - `POST /api/qa/chat`：核心问答接口，完整 RAG 流程（检索→Prompt→LLM→保存）
  - `GET /api/qa/session/[id]`：获取会话历史消息

- **Prompt 扩展**（`src/lib/services/llm/prompt-builder.ts`）：
  - 新增 `buildQAPrompt()`：构建包含检索上下文和对话历史的 QA Prompt

- **LLM Provider 扩展**（`src/lib/services/llm/provider.ts`）：
  - 新增 `generateQA()`：生成问答回答
  - 新增 `translateSubtitles()`：翻译字幕
  - 新增 `_call*Raw()` 私有方法：支持通用的系统提示词调用

- **前端问答组件**：
  - `src/components/summary/message-bubble.tsx`：消息气泡组件，显示用户/助手消息，助手消息包含引用片段
  - `src/components/summary/qa-chat-panel.tsx`：核心问答交互组件，包含消息列表、输入区、发送逻辑、加载状态

#### 2. 字幕翻译功能
- **类型定义**（`src/types/translation.ts`）：
  - `SubtitleTranslation`：翻译后字幕结构
  - `TranslationOptions`：翻译选项
  - `SubtitleTranslateRequest/SubtitleTranslateResponse`：API 请求/响应

- **弹窗优化**（`src/components/home/generate-summary-modal.tsx`）：
  - 新增"翻译字幕"复选框选项
  - 新增目标语言选择（中文/英文）
  - 参数通过 URL query 传递到总结页

- **字幕翻译 API**（`src/app/api/subtitles/translate/route.ts`）：
  - `POST /api/subtitles/translate`：字幕翻译接口
  - 批量翻译字幕，保持时间戳不变
  - 解析翻译结果并保存到历史记录

- **原文细读支持切换**（`src/components/summary/subtitle-translation-toggle.tsx`）：
  - `SubtitleTranslationToggle`：字幕切换组件
  - `useSubtitleDisplay`：字幕显示 Hook
  - 支持原文字幕和翻译字幕切换

- **存储层扩展**（`src/types/video.ts`）：
  - `VideoHistoryItem` 新增 `translatedSubtitles` 和 `translationMeta` 字段

- **运行时配置扩展**（`src/lib/server/runtime-config-store.ts`）：
  - 新增 LLM 相关配置字段：llmProvider/llmModel/llmApiKey/llmBaseUrl

- **集成更新**：
  - `src/components/summary/summary-shell.tsx`：替换静态问答区为 QAChatPanel，集成字幕翻译逻辑
  - `src/components/summary/right-panel-tabs.tsx`：支持字幕切换显示

**技术亮点**：
- RAG 首版使用关键词+TF-IDF检索，无需向量数据库，降低部署复杂度
- 问答会话基于内存存储，刷新页面后对话历史不丢失（通过 API 恢复）
- 字幕翻译批量处理，保持时间戳不变，翻译结果持久化
- 翻译和 QA 功能复用同一套 LLM Provider 基础设施

**文件变更汇总**：
- 新建：
  - `src/types/qa.ts`、`src/types/translation.ts`
  - `src/lib/services/rag/subtitle-chunker.ts`、`src/lib/services/rag/index.ts`
  - `src/lib/server/qa-store.ts`
  - `src/app/api/qa/chat/route.ts`、`src/app/api/qa/session/[id]/route.ts`
  - `src/app/api/subtitles/translate/route.ts`
  - `src/components/summary/qa-chat-panel.tsx`、`src/components/summary/message-bubble.tsx`
  - `src/components/summary/subtitle-translation-toggle.tsx`
- 修改：
  - `src/types/video.ts`：扩展翻译字段
  - `src/types/index.ts`：导出新类型
  - `src/lib/services/llm/prompt-builder.ts`：新增 QA 和翻译 Prompt
  - `src/lib/services/llm/provider.ts`：新增 generateQA 和 translateSubtitles
  - `src/lib/server/runtime-config-store.ts`：扩展 LLM 配置
  - `src/components/home/generate-summary-modal.tsx`：添加翻译字幕选项
  - `src/components/summary/summary-shell.tsx`：集成问答区
  - `src/components/summary/right-panel-tabs.tsx`：支持字幕切换

**验收结果**：
- `npm run lint` 通过（1 个警告，_originalSubtitles 参数预留）
- `npm run build` 通过
- 新增 API 路由：
  - `POST /api/qa/chat`
  - `GET /api/qa/session/[id]`
  - `POST /api/subtitles/translate`

## 2026-03-15

### 新增：Milestone 4.5 - 数据库迁移（内存存储 → Supabase PostgreSQL）

**功能描述**：
将项目从内存存储迁移到 Supabase PostgreSQL 数据库，实现数据持久化、多用户隔离，并为 Milestone 5 扩展提供稳定的数据层。

**本次新增**：

#### 1. 数据库 Schema 升级
- **扩展 `VideoHistory` 模型**：
  - 添加 `VideoPlatform` 和 `SubtitleSource` Enums
  - 新增字段：author, durationSec, publishAt, subtitleSource, fullText, translatedSubtitles, translationMeta
  - 添加与 Folder 的关系
  - 添加所有必要的索引（userId, platform, subtitleSource, folderId 等）
  
- **新增 QA 相关模型**：
  - `QASession`：QA 会话表，支持按 historyId 和 userId 查询
  - `QAMessage`：QA 消息表，存储对话消息和引用信息
  - 添加级联删除关系（删除历史记录时自动清理关联的会话和消息）
  
- **新增字幕分段表**：
  - `SubtitleSegment`：支持按时间范围查询字幕片段
  - 用于 QA 引用跳转和精确时间定位

#### 2. Prisma 数据访问层
- **`src/lib/server/prisma-store.ts`**：
  - 文件夹操作：listFolders, createFolder, renameFolder, deleteFolder
  - 历史记录操作：listHistories, getHistoryById, saveHistory, moveHistoryToFolder
  - 统计操作：getFolderCounts
  - 类型转换：前端 VideoHistoryItem ↔ 数据库 VideoHistory
  - 所有操作强制带 userId 过滤（多用户隔离）

- **`src/lib/server/prisma-qa-store.ts`**：
  - 会话操作：createSession, getSession, listSessionsByHistoryId
  - 消息操作：addMessage, listSessionMessages
  - 管理操作：clearSession, deleteSession
  - 事务处理：添加消息时同时更新会话 updatedAt

#### 3. 数据迁移脚本
- **`scripts/export-memory-data.ts`**：
  - 从内存存储导出所有文件夹、历史记录和 QA 会话
  - 输出标准 JSON 格式，便于备份和迁移
  
- **`scripts/import-to-database.ts`**：
  - 幂等导入（upsert），重复执行不会插入重复数据
  - 分批写入（每批100条），带事务保证
  - 字段映射转换（Enum 转换、DateTime 转换、duration → durationSec）
  - 字幕拆分逻辑：同时写入 JSON 和 subtitle_segments 表
  - 详细日志输出（成功/失败计数、错误原因 Top N）

#### 4. API 路由迁移到 Prisma
- **文件夹 API**：
  - `GET/POST /api/folders` - 使用 prisma-store
  - `PATCH/DELETE /api/folders/[id]` - 使用 prisma-store
  - 添加用户认证检查

- **历史记录 API**：
  - `GET /api/history` - 使用 prisma-store
  - `POST /api/history` - 使用 prisma-store
  - `GET /api/history/[id]` - 使用 prisma-store
  - `POST /api/history/[id]/move` - 使用 prisma-store
  - 添加用户认证检查

- **QA API**：
  - `POST /api/qa/chat` - 使用 prisma-qa-store
  - `GET /api/qa/session/[id]` - 使用 prisma-qa-store
  - `POST /api/qa/session` - 创建新会话
  - `DELETE /api/qa/session/[id]` - 删除会话
  - `POST /api/qa/message` - 发送消息
  - `GET /api/qa/history/[historyId]/sessions` - 获取视频的所有会话
  - 添加用户认证检查

- **其他 API**：
  - `POST /api/transcript/fetch` - 使用 prisma-store 保存历史
  - `POST /api/summary/generate` - 使用 prisma-store 读取和更新历史

#### 5. 安全与兼容性
- 所有 API 路由都添加了 Supabase 用户认证检查
- 所有数据库查询都强制包含 userId 过滤
- 标记 `sidebar-store.ts` 为 deprecated（保留向后兼容）
- 更新 `package.json` 使用 Prisma 6.6.0（稳定版本）
- 添加 `ts-node` 用于运行迁移脚本
- 更新错误码：添加 `UNAUTHORIZED` (40101)

**数据模型关系**：
```
VideoHistory
├── QASession[] (1:N)
├── SubtitleSegment[] (1:N)
└── Folder? (N:1)

QASession
├── VideoHistory (N:1)
└── QAMessage[] (1:N)

Folder
└── VideoHistory[] (1:N)
```

**字段映射规则**：
| 前端字段 | 数据库字段 | 转换 |
|---------|-----------|------|
| platform (string) | platform (VideoPlatform Enum) | bilibili/youtube/xiaohongshu |
| createdAt (string ISO) | createdAt (DateTime) | 自动转换 |
| publishAt (string ISO) | publishAt (DateTime) | 自动转换 |
| duration (number) | durationSec (Int) | 字段名映射 |
| subtitleSource (string) | subtitleSource (SubtitleSource Enum) | native→platform, asr, imported |

**迁移步骤**：
1. `npm install` - 安装依赖
2. 配置 `.env.local`（DATABASE_URL, DIRECT_URL）
3. `npx prisma generate` - 生成 Prisma Client
4. `npx prisma migrate dev --name add_video_fields_and_qa_tables` - 创建迁移
5. `npx ts-node scripts/export-memory-data.ts > backup.json` - 导出数据
6. `npx ts-node scripts/import-to-database.ts <user-id> < backup.json` - 导入数据
7. `npm run lint && npm run build` - 验证

**技术亮点**：
- 幂等迁移脚本，可重复执行不丢数据
- 分批事务处理，大数据量安全导入
- 完整的类型转换层，前端代码无需大改
- 级联删除关系，数据一致性保障
- 多用户隔离，所有查询强制 userId 过滤

**文件变更汇总**：
- 新建：
  - `scripts/export-memory-data.ts`
  - `scripts/import-to-database.ts`
  - `src/lib/server/prisma-store.ts`
  - `src/lib/server/prisma-qa-store.ts`
  - `src/app/api/qa/session/route.ts`
  - `src/app/api/qa/session/[id]/route.ts`
  - `src/app/api/qa/message/route.ts`
  - `src/app/api/qa/history/[historyId]/sessions/route.ts`
- 修改：
  - `prisma/schema.prisma` - 完整数据库 Schema
  - `package.json` - 更新 Prisma 版本
  - `src/lib/server/sidebar-store.ts` - 标记 deprecated
  - `src/lib/services/common/error-codes.ts` - 添加 UNAUTHORIZED
  - `src/app/api/folders/route.ts` - 迁移到 Prisma
  - `src/app/api/folders/[id]/route.ts` - 迁移到 Prisma
  - `src/app/api/history/route.ts` - 迁移到 Prisma
  - `src/app/api/history/[id]/route.ts` - 迁移到 Prisma
  - `src/app/api/history/[id]/move/route.ts` - 迁移到 Prisma
  - `src/app/api/qa/chat/route.ts` - 迁移到 Prisma QA store
  - `src/app/api/transcript/fetch/route.ts` - 迁移到 Prisma store
  - `src/app/api/summary/generate/route.ts` - 迁移到 Prisma store

**验收标准**：
- Prisma migrate 成功执行，无错误
- Supabase Dashboard 可见所有表且结构正确
- 从内存导出的数据完整导入数据库（记录数一致）
- 时间字段正确存储为 Timestamptz，排序正常
- Enum 字段无脏数据（platform、subtitleSource）
- subtitle_segments 表正确拆分并关联到 video_histories
- Bilibili/小红书解析链路在数据库模式下正常工作
- 总结生成后可在数据库中查询到 summaryJson 和 summaryMarkdown
- 创建 QA 会话、发送消息、查询历史会话流程通顺
- 重启 Next.js 服务后，历史记录不丢失
- `npm run lint` 和 `npm run build` 通过

**注意**：当前 LSP 类型错误将在运行 `npm install && npx prisma generate` 后自动消失。