# Bluebird Folder

视频内容智能分析平台，支持 Bilibili / 小红书视频的字幕提取、AI 总结、问答与翻译。

## 技术栈

- **前端**: Next.js 16 + TypeScript + Tailwind CSS
- **数据层**: [Forsion Backend](http://localhost:3001) REST API（无 Supabase/Prisma 依赖）
- **LLM**: 通过 Forsion Backend 路由（默认模型：`qwen3.5-plus`）
- **视频处理**: Python（yt-dlp + ffmpeg + moviepy）+ Qwen3-ASR

## 功能

- Bilibili / 小红书链接解析与字幕提取（原生字幕优先，缺失时 ASR 转写）
- 多模板 AI 总结（通用、学术、访谈、播客、会议、新闻、教程、Vlog、旅行、测评）
- 视频播放器 + 时间戳跳转
- 字幕翻译（中/英等多语言）
- 视频 QA 问答（RAG 检索增强）
- 历史记录管理（文件夹分类、拖拽移动）
- 总结导出（Markdown / JSON）

## 快速开始

### 1. 安装 Node 依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

按需填写 `.env`：

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_FORSION_API_URL` | Forsion Backend 地址，默认 `http://localhost:3001` |
| `FORSION_MODEL_ID` | LLM 模型 ID，默认 `qwen3.5-plus` |
| `BILIBILI_COOKIE` | Bilibili 登录 Cookie（高清视频 / 会员内容必填） |
| `BILIBILI_USER_AGENT` | 可选，覆盖默认 UA |
| `XIAOHONGSHU_COOKIE` | 小红书 Cookie |
| `QWEN3_ASR_API_KEY` | 阿里云 DashScope API Key（无原生字幕时 ASR 必填） |

> Cookie 也可在应用的 `/settings` 页面运行时覆盖，无需重启服务。

### 3. 安装 Python 依赖

```bash
pip install -r scripts/requirements.txt
```

> 需要 Python 3.9+，建议使用虚拟环境（`.venv/`）。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

健康检查：`http://localhost:3000/api/health`

## API 路由

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/transcript/fetch` | 获取字幕（原生或 ASR） |
| `POST` | `/api/summary/generate` | 生成 AI 总结 |
| `POST` | `/api/subtitles/translate` | 字幕翻译 |
| `POST` | `/api/qa/chat` | QA 问答（RAG） |
| `GET/DELETE` | `/api/qa/session/[id]` | QA 会话管理 |
| `GET/POST` | `/api/history` | 历史记录列表 |
| `GET/PATCH/DELETE` | `/api/history/[id]` | 历史记录详情 |
| `POST` | `/api/history/[id]/move` | 移动到文件夹 |
| `GET/POST` | `/api/folders` | 文件夹列表 |
| `PATCH/DELETE` | `/api/folders/[id]` | 文件夹操作 |
| `GET/POST` | `/api/settings/runtime` | 运行时配置覆盖 |
| `GET` | `/api/models` | 可用模型列表 |

## Python 脚本

| 脚本 | 用途 |
|---|---|
| `scripts/bilibili_downloader.py` | Bilibili 视频下载 + 音频提取（stdin JSON → stdout JSON） |
| `scripts/xiaohongshu_extractor.py` | 小红书内容提取 |
| `scripts/requirements.txt` | Python 依赖清单 |
