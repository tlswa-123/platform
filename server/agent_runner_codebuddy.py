#!/usr/bin/env python3
"""
WeCreat Agent Runner — CodeBuddy Agent SDK Backend

与 agent_runner.py (Adams API + OpenAI SDK) 并列的第二种 Agent 运行模式。
CodeBuddy Agent SDK 底层是 agentic coding（类似 Claude Code），Agent 自己
在项目目录里读写文件、执行命令，不需要 <<<FILE:>>> 格式解析。

通信协议与 agent_runner.py 完全一致：
  - stdout 输出 `WECREAT_MSG:{json}` 结构化消息
  - Node.js 父进程 (server/index.js) 解析后转为 SSE 事件推送前端

环境变量（由 server/index.js 注入）：
  WECREAT_PROMPT:           完整 prompt（由 index.js 包装后传入）
  WECREAT_CWD:              工作目录（项目路径）
  WECREAT_AGENT_ID:         Agent ID（22个之一）
  WECREAT_AGENT_ROLE:       Agent 角色类型 (orchestrator|planner|coder|reviewer)
  CODEBUDDY_API_KEY:        CodeBuddy API Key（必填）
  CODEBUDDY_INTERNET_ENVIRONMENT: CodeBuddy 网络环境（可选）

依赖：
  pip3 install codebuddy-agent-sdk
"""

import os
import sys
import json
import asyncio
import time
import traceback
from pathlib import Path


# ====================================
# Agent 注册表（复用 agent_runner.py 的定义）
# ====================================

AGENT_REGISTRY = {
    # 小助手组
    "coordinator":          {"name": "小助手",     "emoji": "🤖", "group": "小助手",  "role": "orchestrator"},
    "producer":             {"name": "制作人",     "emoji": "📋", "group": "小助手",  "role": "planner"},
    # 策划组
    "creative-director":    {"name": "创意总监",   "emoji": "🎯", "group": "策划",    "role": "planner"},
    "game-designer":        {"name": "游戏设计师", "emoji": "🎮", "group": "策划",    "role": "planner"},
    "systems-designer":     {"name": "系统设计师", "emoji": "⚙️", "group": "策划",    "role": "planner"},
    "level-designer":       {"name": "关卡设计师", "emoji": "🗺️", "group": "策划",    "role": "planner"},
    "narrative-director":   {"name": "叙事导演",   "emoji": "📖", "group": "策划",    "role": "planner"},
    "economy-designer":     {"name": "经济设计师", "emoji": "💰", "group": "策划",    "role": "planner"},
    # 美术组
    "art-director":         {"name": "美术总监",   "emoji": "🎨", "group": "美术",    "role": "planner"},
    "technical-artist":     {"name": "技术美术",   "emoji": "🖌️", "group": "美术",    "role": "planner"},
    "ux-designer":          {"name": "UX设计师",   "emoji": "📱", "group": "美术",    "role": "planner"},
    # 音效组
    "audio-director":       {"name": "音频总监",   "emoji": "🎵", "group": "音效",    "role": "planner"},
    "sound-designer":       {"name": "音效设计师", "emoji": "🔊", "group": "音效",    "role": "planner"},
    # 工程师组
    "technical-director":   {"name": "技术总监",   "emoji": "🏗️", "group": "工程师",  "role": "planner"},
    "lead-programmer":      {"name": "主程序",     "emoji": "👨‍💻", "group": "工程师",  "role": "planner"},
    "gameplay-programmer":  {"name": "游戏程序员", "emoji": "🎯", "group": "工程师",  "role": "coder"},
    "engine-programmer":    {"name": "引擎程序员", "emoji": "⚡", "group": "工程师",  "role": "coder"},
    "prototyper":           {"name": "原型师",     "emoji": "🚀", "group": "工程师",  "role": "coder"},
    "unity-specialist":     {"name": "Unity专家",  "emoji": "🔷", "group": "工程师",  "role": "coder"},
    "unreal-specialist":    {"name": "Unreal专家", "emoji": "🔶", "group": "工程师",  "role": "coder"},
    "godot-specialist":     {"name": "Godot专家",  "emoji": "🟢", "group": "工程师",  "role": "coder"},
    # 审核组
    "qa-lead":              {"name": "QA主管",     "emoji": "🔍", "group": "审核",    "role": "reviewer"},
}

# 向后兼容旧 Agent ID
LEGACY_AGENT_MAP = {
    "artist":   "art-director",
    "sound":    "sound-designer",
    "engineer": "prototyper",
}


# ====================================
# 当前 Agent 信息
# ====================================

AGENT_ID = os.environ.get("WECREAT_AGENT_ID", "prototyper")

if AGENT_ID in LEGACY_AGENT_MAP:
    AGENT_ID = LEGACY_AGENT_MAP[AGENT_ID]

AGENT_INFO = AGENT_REGISTRY.get(AGENT_ID, {
    "name": AGENT_ID, "emoji": "🤖", "group": "工程师", "role": "planner"
})

AGENT_ROLE = os.environ.get("WECREAT_AGENT_ROLE", AGENT_INFO["role"])


# ====================================
# 结构化消息输出（与 Node.js SSE 对接）
# ====================================

def emit(msg_type: str, data: dict):
    """发送结构化消息到 Node.js 父进程"""
    msg = json.dumps({"type": msg_type, "data": data}, ensure_ascii=False)
    print(f"WECREAT_MSG:{msg}", flush=True)

def emit_log(text: str):
    emit("log", {"text": text})

def emit_status(phase: str, message: str):
    emit("status", {"phase": phase, "message": message})

def emit_agent(agent_id: str, content: str, detail: str = ""):
    emit("agent_message", {"agentId": agent_id, "content": content, "detail": detail})

def emit_file_changed(filepath: str, action: str = "write"):
    emit("file_changed", {"filepath": filepath, "action": action})

def emit_progress(pct: int, agent_id: str = None):
    if agent_id is None:
        agent_id = AGENT_ID
    emit("progress", {"percent": pct, "agentId": agent_id})


# ====================================
# Agent Prompt 加载
# ====================================

def load_agent_prompt(agent_id: str) -> str:
    """从 server/agents/{agent_id}.md 加载 system prompt"""
    prompt_path = Path(__file__).parent / "agents" / f"{agent_id}.md"
    if not prompt_path.exists():
        agent_info = AGENT_REGISTRY.get(agent_id, {})
        name = agent_info.get("name", agent_id)
        emit_log(f"⚠️ Agent prompt 文件不存在: {prompt_path}, 使用默认 prompt")
        return f"你是 WeCreat 游戏创作工坊的 {name}。请根据你的专业知识完成任务。"
    return prompt_path.read_text(encoding='utf-8')


# ====================================
# CodeBuddy Agent SDK 消息处理
# ====================================

class CodeBuddyStreamProcessor:
    """
    处理 CodeBuddy Agent SDK 的流式消息，转换为 WECREAT_MSG 协议。

    与 agent_runner.py 的 StreamProcessor 不同:
    - CodeBuddy SDK 是 agentic 模式，Agent 自己读写文件
    - 消息类型包括: AssistantMessage (思考/文字), ToolUseBlock (工具调用),
      ToolResultBlock (工具结果), ResultMessage (完成)
    - 不需要 <<<FILE:>>> 格式解析，文件操作由 Agent SDK 自行完成
    """

    def __init__(self, agent_id: str, agent_role: str):
        self.agent_id = agent_id
        self.agent_role = agent_role
        self.start_time = time.time()
        self.msg_count = 0
        self.tool_count = 0
        self.files_written = []
        self.full_text = ""        # 累计 assistant 文本
        self.last_progress_time = self.start_time

        # 流式推送控制
        self.last_stream_push = 0
        self.last_stream_time = time.time()
        self.stream_interval = 0.8   # 秒

        # orchestrator 专用
        self.orchestration_started = False

        # 阶段标记
        self.phase_sent = set()

    def process_message(self, message):
        """处理一条 SDK 消息"""
        from codebuddy_agent_sdk import (
            AssistantMessage, UserMessage, SystemMessage, ResultMessage,
            ToolUseBlock, ToolResultBlock, TextBlock, ThinkingBlock,
        )

        self.msg_count += 1

        if isinstance(message, AssistantMessage):
            self._process_assistant(message)

        elif isinstance(message, ResultMessage):
            self._process_result(message)

        # 进度更新
        now = time.time()
        if now - self.last_progress_time > 2:
            self.last_progress_time = now
            self._update_progress()

    def _process_assistant(self, message):
        """处理 AssistantMessage — 含文本/思考/工具调用"""
        from codebuddy_agent_sdk import (
            ToolUseBlock, ToolResultBlock, TextBlock, ThinkingBlock,
        )

        for block in message.content:
            if isinstance(block, TextBlock):
                text = block.text or ""
                if text:
                    self.full_text += text
                    self._handle_text_stream(text)

            elif isinstance(block, ThinkingBlock):
                thinking = block.thinking or ""
                if thinking:
                    # 思考过程只记 log，不推前端
                    emit_log(f"[{AGENT_ID} thinking] {thinking[:200]}...")

            elif isinstance(block, ToolUseBlock):
                self.tool_count += 1
                tool_name = block.name
                tool_input = block.input or {}

                # 检测文件写入
                if tool_name in ("Write", "Edit", "MultiEdit"):
                    filepath = tool_input.get("file_path", "") or tool_input.get("path", "")
                    if filepath:
                        # 转为相对路径
                        cwd = os.environ.get("WECREAT_CWD", "")
                        if cwd and filepath.startswith(cwd):
                            filepath = filepath[len(cwd):].lstrip("/")
                        if filepath not in self.files_written:
                            self.files_written.append(filepath)
                            emit_file_changed(filepath, "write")
                            emit_agent(self.agent_id, f"📝 正在编写: `{filepath}`")

                elif tool_name == "Bash":
                    cmd = tool_input.get("command", "")
                    if cmd:
                        # 简短展示命令
                        short_cmd = cmd[:80] + ("..." if len(cmd) > 80 else "")
                        emit_agent(self.agent_id, f"⚡ 执行: `{short_cmd}`")

                elif tool_name == "Read":
                    filepath = tool_input.get("file_path", "") or tool_input.get("path", "")
                    if filepath:
                        cwd = os.environ.get("WECREAT_CWD", "")
                        if cwd and filepath.startswith(cwd):
                            filepath = filepath[len(cwd):].lstrip("/")
                        emit_agent(self.agent_id, f"📖 读取: `{filepath}`")

                else:
                    emit_agent(self.agent_id, f"🔧 调用工具: {tool_name}")

            elif isinstance(block, ToolResultBlock):
                # 工具结果 — 简要展示
                content = block.content if isinstance(block.content, str) else str(block.content)
                if len(content) > 200:
                    content = content[:200] + "..."
                emit_log(f"[tool result] {content}")

    def _handle_text_stream(self, new_text: str):
        """处理文本流式推送"""
        if self.agent_role == "orchestrator":
            # coordinator: 推送 ---ORCHESTRATION--- 之前的内容
            if "---ORCHESTRATION---" in self.full_text and not self.orchestration_started:
                self.orchestration_started = True
                sep_idx = self.full_text.index("---ORCHESTRATION---")
                if self.last_stream_push < sep_idx:
                    delta = self.full_text[self.last_stream_push:sep_idx].strip()
                    if delta:
                        emit("stream_delta", {"agentId": self.agent_id, "delta": delta, "done": False})
                    self.last_stream_push = sep_idx

            if not self.orchestration_started:
                now = time.time()
                if now - self.last_stream_time >= self.stream_interval:
                    if len(self.full_text) > self.last_stream_push:
                        delta = self.full_text[self.last_stream_push:]
                        if delta.strip():
                            emit("stream_delta", {"agentId": self.agent_id, "delta": delta, "done": False})
                            self.last_stream_push = len(self.full_text)
                            self.last_stream_time = now

        elif self.agent_role in ("planner", "reviewer"):
            # planner/reviewer: 定期推送增量
            now = time.time()
            if now - self.last_stream_time >= 1.0:
                if len(self.full_text) > self.last_stream_push:
                    delta = self.full_text[self.last_stream_push:]
                    if delta.strip():
                        emit("stream_delta", {"agentId": self.agent_id, "delta": delta, "done": False})
                        self.last_stream_push = len(self.full_text)
                        self.last_stream_time = now

        elif self.agent_role == "coder":
            # coder: 展示阶段信息
            text_len = len(self.full_text)
            if text_len >= 500 and "thinking" not in self.phase_sent:
                self.phase_sent.add("thinking")
                emit_agent(self.agent_id, "🧠 正在分析需求，设计方案...")
            elif text_len >= 2000 and "ready" not in self.phase_sent:
                self.phase_sent.add("ready")
                emit_agent(self.agent_id, "✍️ 方案设计完成，开始编写代码...")

    def _process_result(self, message):
        """处理 ResultMessage — Agent 完成"""
        is_error = getattr(message, 'is_error', False)
        subtype = getattr(message, 'subtype', 'unknown')

        if is_error:
            emit_log(f"[{AGENT_ID}] Agent 返回错误: subtype={subtype}")
        else:
            emit_log(f"[{AGENT_ID}] Agent 完成: subtype={subtype}")

    def on_complete(self):
        """流式结束后的清理"""
        # 推送最后一批未推送的文本
        if self.agent_role == "orchestrator":
            if not self.orchestration_started and len(self.full_text) > self.last_stream_push:
                delta = self.full_text[self.last_stream_push:]
                if delta.strip():
                    emit("stream_delta", {"agentId": self.agent_id, "delta": delta, "done": False})
            emit("stream_delta", {"agentId": self.agent_id, "delta": "", "done": True})

        elif self.agent_role in ("planner", "reviewer"):
            if len(self.full_text) > self.last_stream_push:
                delta = self.full_text[self.last_stream_push:]
                if delta.strip():
                    emit("stream_delta", {"agentId": self.agent_id, "delta": delta, "done": False})
            emit("stream_delta", {"agentId": self.agent_id, "delta": "", "done": True})

    def _update_progress(self):
        """更新进度百分比"""
        if self.agent_role == "coder":
            progress = min(15 + len(self.files_written) * 15 + self.tool_count * 3, 85)
        else:
            progress = min(15 + int(len(self.full_text) / 100) + self.tool_count * 5, 85)
        emit_progress(progress)


# ====================================
# 登录检测
# ====================================

async def check_and_login() -> bool:
    """
    检测 CodeBuddy 登录状态。

    - 已登录：返回 True
    - 未登录：发送 codebuddy_auth_required 事件（含登录 URL）并等待用户完成登录
    - 登录超时/失败：返回 False

    SDK 的 authenticate() 分两阶段：
    1. 拿到 auth_url（如果需要登录）
    2. await auth 等待用户在浏览器完成登录（最多 5 分钟）
    """
    from codebuddy_agent_sdk import authenticate
    from codebuddy_agent_sdk._errors import AuthenticationError

    emit_status("authenticating", "🔐 正在检查 CodeBuddy 登录状态...")

    try:
        auth = await authenticate(timeout=300.0)

        if not auth.auth_url:
            # 已登录
            result = await auth
            user_name = getattr(result.userinfo, 'user_name', '') if result.userinfo else ''
            emit_log(f"CodeBuddy 已登录: {user_name}")
            emit_agent(AGENT_ID, f"🔐 已登录 CodeBuddy{f' ({user_name})' if user_name else ''}")
            return True

        # 需要登录 — 发送登录 URL 给前端
        login_url = auth.auth_url
        emit_log(f"CodeBuddy 需要登录: {login_url}")
        emit("codebuddy_auth_required", {
            "loginUrl": login_url,
            "message": "请在浏览器中完成 CodeBuddy 登录",
        })
        emit_agent(AGENT_ID,
            f"🔐 **需要登录 CodeBuddy**\n\n"
            f"请点击下方链接在浏览器中登录：\n"
            f"[👉 登录 CodeBuddy]({login_url})\n\n"
            f"登录完成后会自动继续..."
        )

        # 等待用户在浏览器完成登录
        result = await auth
        user_name = getattr(result.userinfo, 'user_name', '') if result.userinfo else ''
        emit_log(f"CodeBuddy 登录成功: {user_name}")
        emit_agent(AGENT_ID, f"✅ 登录成功！{f'欢迎 {user_name}' if user_name else ''}")
        emit("codebuddy_auth_success", {"userName": user_name})
        return True

    except AuthenticationError as e:
        emit_log(f"CodeBuddy 登录失败: {e}")
        emit("error_msg", {
            "message": f"CodeBuddy 登录失败: {str(e)[:200]}\n请重试或检查网络连接。"
        })
        return False

    except Exception as e:
        emit_log(f"CodeBuddy 登录检测异常: {e}")
        emit("error_msg", {
            "message": f"CodeBuddy 登录检测失败: {str(e)[:200]}"
        })
        return False


# ====================================
# 主执行逻辑
# ====================================

async def run_agent_async():
    prompt = os.environ.get("WECREAT_PROMPT")
    cwd = os.environ.get("WECREAT_CWD")
    api_key = os.environ.get("CODEBUDDY_API_KEY", "")
    internet_env = os.environ.get("CODEBUDDY_INTERNET_ENVIRONMENT", "")

    agent_id = AGENT_ID
    agent_role = AGENT_ROLE
    agent_name = AGENT_INFO.get("name", agent_id)
    agent_emoji = AGENT_INFO.get("emoji", "🤖")
    agent_group = AGENT_INFO.get("group", "工程师")

    if not prompt:
        emit("error_msg", {"message": "WECREAT_PROMPT 环境变量未设置"})
        sys.exit(1)
    if not cwd:
        emit("error_msg", {"message": "WECREAT_CWD 环境变量未设置"})
        sys.exit(1)

    emit_status("initializing", f"{agent_emoji} {agent_name}正在启动 CodeBuddy Agent...")
    emit_log(f"Agent: {agent_id} ({agent_name}), Role: {agent_role}, Group: {agent_group}, Provider: codebuddy")
    emit_log(f"CWD: {cwd}")

    try:
        from codebuddy_agent_sdk import (
            CodeBuddySDKClient,
            CodeBuddyAgentOptions,
            ResultMessage,
        )
    except ImportError:
        emit("error_msg", {"message": "codebuddy_agent_sdk 未安装。请运行: pip3 install codebuddy-agent-sdk"})
        sys.exit(1)

    # ====================================
    # 阶段 0: 登录检测
    # ====================================
    logged_in = await check_and_login()
    if not logged_in:
        sys.exit(1)

    # 加载 Agent 专属 system prompt
    system_prompt = load_agent_prompt(agent_id)
    emit_log(f"已加载 {agent_name} 的 system prompt ({len(system_prompt)} 字符)")

    # 构建增强 prompt
    # CodeBuddy Agent SDK 是 agentic 的，Agent 自己读写文件，
    # 但仍需告知输出预期
    if agent_role == "coder":
        enhanced_prompt = prompt + """

## 重要：你在项目目录中工作

你可以直接读取和写入项目目录中的文件。请：
1. 先阅读现有代码了解项目结构
2. 直接创建或修改文件（不要用 <<<FILE:>>> 格式）
3. 输出完整文件内容，不要省略代码
4. 确保代码可以直接运行"""
    else:
        enhanced_prompt = prompt

    # 构建 SDK Options
    env = {}
    if api_key:
        env["CODEBUDDY_API_KEY"] = api_key
    if internet_env:
        env["CODEBUDDY_INTERNET_ENVIRONMENT"] = internet_env
    # 确保 PATH 包含 node
    env["PATH"] = os.environ.get("PATH", "")

    # 权限模式：允许所有操作（因为是在受控的项目目录内）
    options = CodeBuddyAgentOptions(
        env=env,
        cwd=cwd,
        system_prompt=system_prompt,
        permission_mode="bypassPermissions",
        include_partial_messages=True,
        max_turns=50,  # 最多 50 轮工具调用
    )

    emit_status("generating", f"{agent_emoji} {agent_name}正在工作...")
    emit_progress(5)

    # 创建流式处理器
    processor = CodeBuddyStreamProcessor(agent_id, agent_role)

    try:
        client = CodeBuddySDKClient(options=options)
        await client.connect()
        emit_progress(10)
        emit_log("CodeBuddy Agent SDK 已连接")

        # 发送 query
        await client.query(enhanced_prompt)

        # 收集消息
        async for message in client.receive_response():
            processor.process_message(message)

            # 检测完成
            if isinstance(message, ResultMessage):
                is_error = getattr(message, 'is_error', False)
                if is_error:
                    emit_log(f"[{agent_id}] Agent 返回错误")
                break

        # 断开连接
        await client.disconnect()

    except Exception as e:
        err_str = str(e)
        elapsed = round(time.time() - processor.start_time, 1)
        emit("error_msg", {
            "message": f"[{agent_name}] CodeBuddy Agent 调用失败（{elapsed}s）: {err_str[:300]}",
            "traceback": traceback.format_exc()
        })
        sys.exit(1)

    # ====================================
    # 处理完成
    # ====================================

    processor.on_complete()

    elapsed = round(time.time() - processor.start_time, 1)
    full_text = processor.full_text

    if agent_role == "coder":
        # Coder: 文件由 Agent SDK 直接写入，列出变更文件
        emit_progress(100)

        files = processor.files_written
        if files:
            emit_status("completed", f"生成完成！耗时 {elapsed}s，{len(files)} 个文件")
            emit_agent(agent_id,
                f"✅ 代码编写完成！\n\n"
                f"📊 统计:\n"
                f"• 耗时: {elapsed}s\n"
                f"• 工具调用: {processor.tool_count} 次\n"
                f"• 文件: {len(files)} 个\n"
                f"• 文件列表: {', '.join(sorted(files))}"
            )
        else:
            emit_status("completed", f"Agent 完成！耗时 {elapsed}s（工具调用 {processor.tool_count} 次）")
            emit_agent(agent_id,
                f"✅ 任务完成！\n"
                f"• 耗时: {elapsed}s\n"
                f"• 工具调用: {processor.tool_count} 次"
            )

        emit("result", {
            "agentId": agent_id,
            "group": agent_group,
            "role": agent_role,
            "duration_s": elapsed,
            "files": sorted(files) if files else [],
            "tool_calls": processor.tool_count,
            "total_chars": len(full_text),
        })

    else:
        # 非 coder（orchestrator / planner / reviewer）
        emit_progress(100)
        emit_status("completed", f"{agent_name}任务完成！耗时 {elapsed}s")

        emit("agent_output", {
            "agentId": agent_id,
            "group": agent_group,
            "role": agent_role,
            "content": full_text,
            "duration_s": elapsed,
            "total_chars": len(full_text),
            "tool_calls": processor.tool_count,
        })

        emit_agent(agent_id, f"{agent_emoji} {agent_name}方案已输出 ({len(full_text)} 字符, {elapsed}s)")

        emit("result", {
            "agentId": agent_id,
            "group": agent_group,
            "role": agent_role,
            "duration_s": elapsed,
            "total_chars": len(full_text),
            "output": full_text,
            "tool_calls": processor.tool_count,
        })


def run_agent():
    """同步入口，兼容 agent_runner.py 的调用方式"""
    asyncio.run(run_agent_async())


if __name__ == "__main__":
    run_agent()
