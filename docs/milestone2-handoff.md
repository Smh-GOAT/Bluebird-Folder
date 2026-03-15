# Milestone 2 交接文档（可直接执行）

## 目标与范围

- 目标：将小红书链路从 mock 升级为真实解析，达到与 Bilibili 同级稳定性。
- 范围：真实元信息解析、下载与 ASR 转写、历史入库与总结页回看、配置链路打通。
- 非范围：真实 LLM 总结（Milestone 3）、RAG 问答（Milestone 4）、导出与编辑完善（Milestone 5）。

## 当前状态

- Bilibili：已完成真实解析、字幕优先/ASR 回退、历史入库、总结页回看。
- 小红书：已接入真实解析链路（基于 `yt-dlp` + ASR），并支持 Cookie/UA 配置覆盖。
- 小红书健壮性：已补充自动重试机制（下载+ASR）与可读错误提示（Cookie失效/风控/超时）。
- 平台抽象：`PlatformParser` 已可插拔，API 路由已平台化。

## 接手顺序（按此执行）

1. ✅ 实现 `XiaohongshuParser.parse()` 真实抓取（替换 mock title/author/duration）。
2. ✅ 实现 `XiaohongshuParser.fetchTranscript()` 真实下载 + ASR 转写（替换 mock segments）。
3. ✅ 扩展下载能力：在 `src/lib/services/video/python-downloader.ts` 增加小红书下载入口。
4. ✅ 打通小红书运行时配置：`runtime-config-store` + `settings/runtime API` + 设置页输入区。
5. ✅ 补充边界处理：重试机制 + 可读错误提示。
6. 执行双平台端到端验证，完成稳定性回归后进入 Milestone 3。

## 必改文件

- `src/lib/services/video/xiaohongshu-parser.ts`
- `src/lib/services/video/python-downloader.ts`
- `src/lib/server/runtime-config-store.ts`
- `src/app/api/settings/runtime/route.ts`
- `src/app/settings/page.tsx`
- `.env.example`

## 接口契约（不可破坏）

`src/lib/services/video/platform-parser.ts` 约束如下：

- `parse(url)` 必须返回 `{ meta, hasNativeSubtitle }`
- `fetchTranscript(url)` 必须返回 `{ meta, subtitleSource, segments, fullText }`
- 小红书暂按 `subtitleSource: "asr"` 实现

## 验收标准（完成定义）

- 小红书链接可返回真实元信息（标题、作者、时长至少三项）。
- 小红书链路可完成：解析 -> 转写 -> 入历史 -> 跳转总结页回看。
- `POST /api/transcript/fetch` 对双平台均返回 `historyId`。
- `npm run lint` 与 `npm run build` 通过。

## 风险与注意事项

- 小红书存在反爬与登录态要求，需使用 Cookie/UA。
- `yt-dlp` 对小红书兼容性需实测，必要时准备专用下载分支逻辑。
- ✅ **已处理**：失败场景返回可读错误提示（Cookie 失效、风控、超时等）。
- ✅ **已处理**：下载与 ASR 阶段已增加自动重试机制（最多2次）。

## 进入 Milestone 3 前置条件

- Bilibili 与小红书各至少 3 条不同链接端到端通过。
- 历史记录可稳定回看，字段结构无回归。
- 设置页小红书配置可读可写，且服务端读取生效。
