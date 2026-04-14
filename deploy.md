# WeCreat —— 启动与使用指南

## 架构总览

```
┌──────────────┐    SSE     ┌──────────────┐   子进程   ┌──────────────────┐
│   前端 UI    │ ◄────────► │  Node.js     │ ────────► │  agent_runner.py │
│ index.html   │  /api/*    │  Express     │           │  Claude Agent SDK│
│ app.js       │            │  server/     │           │  → CCR → LiteLLM │
│ styles.css   │            │  index.js    │           │  → Adams → Model │
└──────────────┘            └──────────────┘           └──────────────────┘
       │                          │
       │  iframe                  │  /preview/:id/*
       ▼                          ▼
┌──────────────┐            ┌──────────────┐
│ 游戏预览     │            │ projects/    │
│ (设备仿真)   │            │   {id}/      │
└──────────────┘            │   index.html │
                            │   game.js    │
                            └──────────────┘
```

## 快速启动

### 前置条件

1. **Node.js** ≥ 18
2. **Python 3** + `claude-agent-sdk`
3. **CCR (Claude Code Router)** 运行在 `localhost:3456`（或自行修改 `.env`）

### 安装依赖

```bash
cd server
npm install
```

### 配置环境变量

编辑 `server/.env`：
```env
PORT=3001
ANTHROPIC_BASE_URL=http://localhost:3456
ANTHROPIC_AUTH_TOKEN=test
DEFAULT_MODEL=litellm,opus_4d6
```

### 启动后端

```bash
cd server
npm start
# 或开发模式（文件改动自动重启）
npm run dev
```

后端启动后：
- API 地址: http://localhost:3001
- 健康检查: http://localhost:3001/api/health

### 访问前端

直接访问 http://localhost:3001 即可（Express 已配置前端静态文件服务）。

## 两种模式

### 仿真模式（默认）

前端右上角的 API 开关保持关闭状态。发送消息后会走仿真流程——模拟多 Agent 协作、逐步展示进度，不调用真实 AI。适合 UI 演示。

### Real API 模式

打开右上角 API 开关，发送消息后：
1. 前端 → `POST /api/projects` 创建项目
2. 前端 → `GET /api/generate/:projectId?prompt=...` 建立 SSE 连接
3. 后端 → 启动 `agent_runner.py` 子进程
4. Python → 通过 Claude Agent SDK 调用 AI 模型
5. AI 在 `projects/{id}/` 目录下生成游戏文件
6. 后端通过 SSE 实时推送进度、日志、文件变更
7. 生成完成后，前端自动在预览区加载 iframe → `/preview/{id}/index.html`

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/projects` | 创建新项目，返回 `{ projectId }` |
| GET | `/api/projects/:id/files` | 列出项目文件 |
| GET | `/api/projects/:id/files/*` | 读取项目文件内容 |
| GET | `/api/generate/:id?prompt=&model=` | SSE 流式生成 |
| POST | `/api/generate/:id/stop` | 停止生成 |
| GET | `/preview/:id/*` | 静态文件预览 |
| GET | `/api/health` | 健康检查 |

### SSE 事件类型

| 事件 | 说明 |
|------|------|
| `status` | 阶段状态 (starting/generating/completed) |
| `agent_message` | Agent 发言（展示在聊天区） |
| `progress` | 进度百分比 |
| `file_changed` | 文件写入通知 |
| `log` | 日志文本 |
| `error_msg` | 错误消息 |
| `done` | 流结束 |

## 已完成的改造

### Phase 1: 从仿真到真实 AI

1. ✅ **Node.js 后端服务器** — Express + SSE 架构，封装 Claude Code SDK 调用
2. ✅ **SSE 流式接口** — `/api/generate`，实时推送 AI 生成进度
3. ✅ **前端 handleSend() 改造** — 仿真/Real API 双模式，SSE 监听 + 状态机
4. ✅ **预览区 iframe 化** — loading 动画 → iframe 淡入 → 刷新/全屏 → 回退仿真
5. ✅ **静态文件预览** — `/preview/:id/*`，禁缓存 + 正确 MIME

### 核心文件清单

```
├── index.html          # 前端主页面
├── app.js              # 前端逻辑（3700+ 行）
├── styles.css          # 样式
├── server/
│   ├── index.js        # Express 后端
│   ├── agent_runner.py # Python AI 调用脚本
│   ├── package.json    # Node 依赖
│   └── .env            # 环境变量配置
├── projects/           # AI 生成的游戏项目目录
└── demo-game/          # 手动验证的 Demo 游戏
```
