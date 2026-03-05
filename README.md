# BibiGPT Rebuild (Milestone 0.6)

## 运行

1. 安装依赖

```bash
npm install
```

2. 创建环境变量

```bash
cp .env.example .env.local
```

3. 启动开发环境

```bash
npm run dev
```

4. 健康检查

访问 `http://localhost:3000/api/health`

## 当前完成

- Next.js + TypeScript + Tailwind 基础骨架
- Supabase 客户端封装（浏览器/服务端/中间件）
- 基础登录面板（邮箱注册/登录/退出）
- 首页双栏入口（左侧历史+分类，右侧链接输入与解析）
- “生成总结”自定义弹窗（模板/语言/细节等参数）
- 独立总结页三列布局（左历史分类 + 中播放器/QA + 右侧总结/原文 Tab）
- 顶部导出入口（Markdown/JSON 下载与复制）
- 左侧列最小可用交互：
  - 历史记录仅展示标题，点击可跳转总结页
  - 文件夹支持新建/重命名/删除（一级）
  - 历史记录支持拖拽到文件夹（移动语义）
- 新增左侧列后端接口：
  - `GET/POST /api/folders`
  - `PATCH/DELETE /api/folders/:id`
  - `GET /api/history`
  - `POST /api/history/:id/move`
- Prisma schema 增补（`Folder` 与 `VideoHistory.folderId`）
