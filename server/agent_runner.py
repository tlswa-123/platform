#!/usr/bin/env python3
"""
WeCreat Agent Runner v2 (22 Agent, Direct Adams API - Streaming)

通用化 Agent 运行器，支持 22 个专业 Agent：
- 小助手组(2): coordinator, producer
- 策划组(6): creative-director, game-designer, systems-designer, level-designer, narrative-director, economy-designer
- 美术组(3): art-director, technical-artist, ux-designer
- 音效组(2): audio-director, sound-designer
- 工程师组(8): technical-director, lead-programmer, gameplay-programmer, engine-programmer, prototyper, unity-specialist, unreal-specialist, godot-specialist
- 审核组(1): qa-lead

Agent 行为由角色类型(role)决定：
- orchestrator: coordinator 专用，流式推送用户可见部分 + ---ORCHESTRATION--- JSON
- planner: 策划/美术/音效/审核，输出方案文本，支持流式推送
- coder: 工程师组中写代码的 Agent，输出 <<<FILE:path>>>...<<<END_FILE>>> 格式
- reviewer: 审核评审，输出评审报告

环境变量:
  WECREAT_PROMPT: 完整 prompt（由 index.js 包装后传入）
  WECREAT_CWD: 工作目录
  WECREAT_MODEL: 模型名 (默认 claude-opus-4-6)
  WECREAT_AGENT_ID: Agent ID (22个之一, 默认 prototyper)
  WECREAT_AGENT_ROLE: Agent 角色类型 (orchestrator|planner|coder|reviewer, 可选, 自动推断)
  ADAMS_API_BASE: Adams API 地址
  ADAMS_BUSINESS: Adams business header
  ADAMS_USER: Adams user header
  ADAMS_TOKEN: Adams token header
"""

import os
import sys
import json
import re
import time
import traceback
from pathlib import Path


# ====================================
# Agent 注册表（22 Agent）
# ====================================

AGENT_REGISTRY = {
    # 小助手组
    "coordinator":          {"name": "小助手",     "emoji": "🤖", "group": "小助手",  "role": "orchestrator", "model": "opus"},
    "producer":             {"name": "制作人",     "emoji": "📋", "group": "小助手",  "role": "planner",      "model": "opus"},
    # 策划组
    "creative-director":    {"name": "创意总监",   "emoji": "🎯", "group": "策划",    "role": "planner",      "model": "opus"},
    "game-designer":        {"name": "游戏设计师", "emoji": "🎮", "group": "策划",    "role": "planner",      "model": "sonnet"},
    "systems-designer":     {"name": "系统设计师", "emoji": "⚙️", "group": "策划",    "role": "planner",      "model": "sonnet"},
    "level-designer":       {"name": "关卡设计师", "emoji": "🗺️", "group": "策划",    "role": "planner",      "model": "sonnet"},
    "narrative-director":   {"name": "叙事导演",   "emoji": "📖", "group": "策划",    "role": "planner",      "model": "sonnet"},
    "economy-designer":     {"name": "经济设计师", "emoji": "💰", "group": "策划",    "role": "planner",      "model": "sonnet"},
    # 美术组
    "art-director":         {"name": "美术总监",   "emoji": "🎨", "group": "美术",    "role": "planner",      "model": "sonnet"},
    "technical-artist":     {"name": "技术美术",   "emoji": "🖌️", "group": "美术",    "role": "planner",      "model": "sonnet"},
    "ux-designer":          {"name": "UX设计师",   "emoji": "📱", "group": "美术",    "role": "planner",      "model": "sonnet"},
    # 音效组
    "audio-director":       {"name": "音频总监",   "emoji": "🎵", "group": "音效",    "role": "planner",      "model": "sonnet"},
    "sound-designer":       {"name": "音效设计师", "emoji": "🔊", "group": "音效",    "role": "planner",      "model": "haiku"},
    # 工程师组
    "technical-director":   {"name": "技术总监",   "emoji": "🏗️", "group": "工程师",  "role": "planner",      "model": "opus"},
    "lead-programmer":      {"name": "主程序",     "emoji": "👨‍💻", "group": "工程师",  "role": "planner",      "model": "sonnet"},
    "gameplay-programmer":  {"name": "游戏程序员", "emoji": "🎯", "group": "工程师",  "role": "coder",        "model": "sonnet"},
    "engine-programmer":    {"name": "引擎程序员", "emoji": "⚡", "group": "工程师",  "role": "coder",        "model": "sonnet"},
    "prototyper":           {"name": "原型师",     "emoji": "🚀", "group": "工程师",  "role": "coder",        "model": "sonnet"},
    "unity-specialist":     {"name": "Unity专家",  "emoji": "🔷", "group": "工程师",  "role": "coder",        "model": "sonnet"},
    "unreal-specialist":    {"name": "Unreal专家", "emoji": "🔶", "group": "工程师",  "role": "coder",        "model": "sonnet"},
    "godot-specialist":     {"name": "Godot专家",  "emoji": "🟢", "group": "工程师",  "role": "coder",        "model": "sonnet"},
    # 审核组
    "qa-lead":              {"name": "QA主管",     "emoji": "🔍", "group": "审核",    "role": "reviewer",     "model": "sonnet"},
}

# 模型名映射（Adams API 模型名）
MODEL_MAP = {
    "opus":   "claude-opus-4-6",
    "sonnet": "claude-sonnet-4-20250514",
    "haiku":  "claude-haiku-4-20250414",
}

# GLM 模型（统一模型名）
GLM_MODEL = "GLM-5-NVFP4-20115"
GLM_MODEL_MAP = {
    "opus":   GLM_MODEL,
    "sonnet": GLM_MODEL,
    "haiku":  GLM_MODEL,
}

# 当前模型 provider
MODEL_PROVIDER = os.environ.get("WECREAT_MODEL_PROVIDER", "claude")

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

# 兼容旧 Agent ID
if AGENT_ID in LEGACY_AGENT_MAP:
    AGENT_ID = LEGACY_AGENT_MAP[AGENT_ID]

AGENT_INFO = AGENT_REGISTRY.get(AGENT_ID, {
    "name": AGENT_ID, "emoji": "🤖", "group": "工程师", "role": "planner", "model": "sonnet"
})

# 允许通过环境变量覆盖角色类型
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
# 文件解析与写入（coder 角色专用）
# ====================================

FILE_START_RE = re.compile(r'<<<FILE:(.*?)>>>')
FILE_END_MARKER = '<<<END_FILE>>>'

def parse_and_write_files(full_text: str, cwd: str) -> list[str]:
    """从模型输出中解析 <<<FILE:path>>>...<<<END_FILE>>> 块并写入文件"""
    files_written = []
    
    parts = FILE_START_RE.split(full_text)
    
    i = 1
    while i < len(parts):
        filepath = parts[i].strip()
        i += 1
        if i >= len(parts):
            break
        
        raw_content = parts[i]
        i += 1
        
        end_idx = raw_content.find(FILE_END_MARKER)
        if end_idx != -1:
            content = raw_content[:end_idx]
        else:
            content = raw_content
        
        content = content.strip('\n')
        
        if filepath and content:
            full_path = Path(cwd) / filepath
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding='utf-8')
            files_written.append(filepath)
            emit_file_changed(filepath, "write")
            emit_agent(AGENT_ID, f"📝 已写入: `{filepath}` ({len(content)} 字符)")
    
    return files_written


def fallback_parse_markdown(text: str, cwd: str) -> list[str]:
    """兜底方案：从 markdown 代码块中提取 game.js 和 index.html"""
    files_written = []
    
    js_blocks = re.findall(r'```(?:javascript|js)\n(.*?)```', text, re.DOTALL)
    html_blocks = re.findall(r'```(?:html)\n(.*?)```', text, re.DOTALL)
    
    if js_blocks:
        longest_js = max(js_blocks, key=len)
        if len(longest_js) > 50:
            p = Path(cwd) / "game.js"
            p.write_text(longest_js.strip(), encoding='utf-8')
            files_written.append("game.js")
            emit_file_changed("game.js", "write")
            emit_agent(AGENT_ID, f"📝 写入: game.js ({len(longest_js)} 字符)")
    
    if html_blocks:
        longest_html = max(html_blocks, key=len)
        if len(longest_html) > 50:
            p = Path(cwd) / "index.html"
            p.write_text(longest_html.strip(), encoding='utf-8')
            files_written.append("index.html")
            emit_file_changed("index.html", "write")
            emit_agent(AGENT_ID, f"📝 写入: index.html ({len(longest_html)} 字符)")
    
    return files_written


# ====================================
# 构建增强 prompt
# ====================================

def build_file_output_instruction(user_prompt: str) -> str:
    """在 prompt 末尾追加文件输出格式要求（coder 角色专用）"""
    return user_prompt + """

## 关键输出格式要求
你必须用以下精确格式输出每个文件的完整代码：

<<<FILE:文件路径>>>
文件完整内容
<<<END_FILE>>>

例如：
<<<FILE:game.js>>>
// 游戏代码
const canvas = document.getElementById('gameCanvas');
...
<<<END_FILE>>>

<<<FILE:index.html>>>
<!DOCTYPE html>
...
<<<END_FILE>>>

注意事项：
1. 每个文件必须用 <<<FILE:路径>>> 开头，<<<END_FILE>>> 结尾
2. 文件路径使用相对路径（如 game.js, js/utils.js）
3. 输出文件的完整内容，不要省略任何代码
4. 不要在文件块之外输出代码块（```）
5. 可以在文件块之前或之间写简短说明文字"""


# ====================================
# 流式处理策略（按角色分类）
# ====================================

class StreamProcessor:
    """通用流式处理器，按 Agent 角色分派行为"""
    
    def __init__(self, agent_id: str, agent_role: str):
        self.agent_id = agent_id
        self.agent_role = agent_role
        self.full_text = ""
        self.chunk_count = 0
        self.start_time = time.time()
        self.last_progress_time = self.start_time
        
        # orchestrator 专用
        self.last_stream_push = 0
        self.last_stream_time = time.time()
        self.stream_interval = 0.8
        self.orchestration_started = False
        
        # coder 专用
        self.current_file = None
        self.files_detected = []
        self.first_file_found = False
        self.phase_sent = set()
        
        # planner 流式推送
        self.planner_last_push = 0
        self.planner_last_time = time.time()
        self.planner_interval = 1.0  # 策划类 Agent 每 1 秒推一次
    
    def process_chunk(self, text: str):
        """处理一个 chunk 的增量文本"""
        self.full_text += text
        self.chunk_count += 1
        
        if self.agent_role == "orchestrator":
            self._process_orchestrator(text)
        elif self.agent_role == "coder":
            self._process_coder(text)
        elif self.agent_role in ("planner", "reviewer"):
            self._process_planner(text)
        
        # 通用进度更新（每2秒）
        now = time.time()
        if now - self.last_progress_time > 2:
            self.last_progress_time = now
            self._update_progress()
    
    def on_complete(self):
        """流式结束时的清理工作"""
        if self.agent_role == "orchestrator":
            # 推送最后一批未推送的内容
            if not self.orchestration_started and len(self.full_text) > self.last_stream_push:
                delta_text = self.full_text[self.last_stream_push:]
                if delta_text.strip():
                    emit("stream_delta", {"agentId": self.agent_id, "delta": delta_text, "done": False})
            emit("stream_delta", {"agentId": self.agent_id, "delta": "", "done": True})
        
        elif self.agent_role in ("planner", "reviewer"):
            # 推送最后一批
            if len(self.full_text) > self.planner_last_push:
                delta_text = self.full_text[self.planner_last_push:]
                if delta_text.strip():
                    emit("stream_delta", {"agentId": self.agent_id, "delta": delta_text, "done": False})
            emit("stream_delta", {"agentId": self.agent_id, "delta": "", "done": True})
    
    def _process_orchestrator(self, text: str):
        """coordinator 专用：流式推送 ---ORCHESTRATION--- 之前的内容"""
        if "---ORCHESTRATION---" in self.full_text and not self.orchestration_started:
            self.orchestration_started = True
            sep_idx = self.full_text.index("---ORCHESTRATION---")
            if self.last_stream_push < sep_idx:
                delta_text = self.full_text[self.last_stream_push:sep_idx].strip()
                if delta_text:
                    emit("stream_delta", {"agentId": self.agent_id, "delta": delta_text, "done": False})
                self.last_stream_push = sep_idx
        
        if not self.orchestration_started:
            now = time.time()
            if now - self.last_stream_time >= self.stream_interval and len(self.full_text) > self.last_stream_push:
                delta_text = self.full_text[self.last_stream_push:]
                if delta_text.strip():
                    emit("stream_delta", {"agentId": self.agent_id, "delta": delta_text, "done": False})
                    self.last_stream_push = len(self.full_text)
                    self.last_stream_time = now
    
    def _process_coder(self, text: str):
        """coder 专用：检测文件标记 + 进度追踪"""
        # 检测文件开始
        file_match = FILE_START_RE.search(text)
        if file_match:
            new_file = file_match.group(1).strip()
            if new_file not in self.files_detected:
                self.files_detected.append(new_file)
                self.current_file = new_file
                if not self.first_file_found:
                    self.first_file_found = True
                    emit_agent(self.agent_id, "💻 开始编写代码...")
                emit_agent(self.agent_id, f"🔨 正在生成: `{new_file}`")
        
        # 检测文件结束
        if FILE_END_MARKER in text and self.current_file:
            emit_agent(self.agent_id, f"✅ `{self.current_file}` 生成完毕")
            self.current_file = None
        
        # 思考阶段进度（还没到文件输出之前）
        if not self.first_file_found:
            text_len = len(self.full_text)
            if text_len >= 2000 and "ready" not in self.phase_sent:
                self.phase_sent.add("ready")
                emit_agent(self.agent_id, "✍️ 方案设计完成，准备开始写代码...")
            elif text_len >= 500 and "designing" not in self.phase_sent:
                self.phase_sent.add("designing")
                emit_agent(self.agent_id, "📐 正在设计架构与模块划分...")
            elif text_len >= 100 and "thinking" not in self.phase_sent:
                self.phase_sent.add("thinking")
                emit_agent(self.agent_id, "🧠 正在分析需求，设计方案...")
    
    def _process_planner(self, text: str):
        """planner/reviewer 流式推送增量"""
        now = time.time()
        if now - self.planner_last_time >= self.planner_interval and len(self.full_text) > self.planner_last_push:
            delta_text = self.full_text[self.planner_last_push:]
            if delta_text.strip():
                emit("stream_delta", {"agentId": self.agent_id, "delta": delta_text, "done": False})
                self.planner_last_push = len(self.full_text)
                self.planner_last_time = now
    
    def _update_progress(self):
        """更新进度百分比"""
        if self.agent_role == "coder":
            progress = min(15 + len(self.files_detected) * 20, 85)
        else:
            progress = min(15 + int(len(self.full_text) / 100), 85)
        emit_progress(progress)


# ====================================
# 主执行逻辑
# ====================================

def run_agent():
    prompt = os.environ.get("WECREAT_PROMPT")
    cwd = os.environ.get("WECREAT_CWD")
    
    # 模型选择：环境变量 > Agent 注册表的默认模型
    env_model = os.environ.get("WECREAT_MODEL", "")
    provider = os.environ.get("WECREAT_MODEL_PROVIDER", "claude")
    
    if provider == "glm":
        # GLM 模式：统一使用 GLM 模型
        model = env_model if env_model else GLM_MODEL
    elif env_model and env_model in ("claude-opus-4-6", "claude-sonnet-4-20250514", "claude-haiku-4-20250414"):
        # 显式指定了完整模型名
        model = env_model
    elif env_model in MODEL_MAP:
        # 指定了简短名
        model = MODEL_MAP[env_model]
    else:
        # 使用 Agent 注册表的默认模型
        model = MODEL_MAP.get(AGENT_INFO.get("model", "sonnet"), "claude-sonnet-4-20250514")
    
    agent_id = AGENT_ID
    agent_role = AGENT_ROLE
    agent_name = AGENT_INFO.get("name", agent_id)
    agent_emoji = AGENT_INFO.get("emoji", "🤖")
    agent_group = AGENT_INFO.get("group", "工程师")
    
    # Adams API config (env vars passed from server/index.js)
    api_base = os.environ.get("ADAMS_API_BASE", "")
    adams_business = os.environ.get("ADAMS_BUSINESS", "")
    adams_user = os.environ.get("ADAMS_USER", "")
    adams_token = os.environ.get("ADAMS_TOKEN", "")
    
    if not prompt:
        emit("error_msg", {"message": "WECREAT_PROMPT 环境变量未设置"})
        sys.exit(1)
    if not cwd:
        emit("error_msg", {"message": "WECREAT_CWD 环境变量未设置"})
        sys.exit(1)

    emit_status("initializing", f"{agent_emoji} {agent_name}正在连接 AI 引擎...")
    emit_log(f"Agent: {agent_id} ({agent_name}), Role: {agent_role}, Group: {agent_group}, Model: {model}, Provider: {provider}")

    try:
        from openai import OpenAI
    except ImportError:
        emit("error_msg", {"message": "openai 未安装。请运行: pip3 install openai"})
        sys.exit(1)

    client = OpenAI(
        base_url=api_base,
        api_key="not-needed",
        default_headers={
            "ADAMS-BUSINESS": adams_business,
            "Adams-Platform-User": adams_user,
            "Adams-User-Token": adams_token,
            "ADAMS-PREDICT-LIMIT-S": "300",
        },
    )

    # 加载 agent 专属 system prompt
    system_prompt = load_agent_prompt(agent_id)
    emit_log(f"已加载 {agent_name} 的 system prompt ({len(system_prompt)} 字符)")

    # 构建 messages
    # coder 角色需要追加文件输出格式指令
    if agent_role == "coder":
        enhanced_prompt = build_file_output_instruction(prompt)
    else:
        enhanced_prompt = prompt

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": enhanced_prompt},
    ]

    emit_status("generating", f"{agent_emoji} {agent_name}正在工作...")
    emit_progress(5)

    # 创建流式处理器
    processor = StreamProcessor(agent_id, agent_role)

    try:
        stream = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=16384,
            stream=True,
        )

        emit_progress(10)

        _debug_chunk_count = 0
        _reasoning_chars = 0  # V39: 记录 GLM reasoning 字符数

        for chunk in stream:
            _debug_chunk_count += 1

            if not chunk.choices:
                continue
            
            delta = chunk.choices[0].delta

            # V39: 兼容多种 API 返回格式
            # - Claude: delta.content (标准)
            # - Claude extended thinking: delta.reasoning_content
            # - GLM-5: delta.reasoning (思考链) + delta.content (最终回复)
            #   GLM 流式输出分两阶段：先 reasoning 后 content
            content_text = None

            # 1) 标准 content 字段
            if delta.content:
                content_text = delta.content

            # 2) GLM reasoning 字段（非标准，通过 __dict__ 访问避免 SDK crash）
            if not content_text:
                try:
                    _delta_dict = delta.__dict__ if hasattr(delta, '__dict__') else {}
                    # GLM-5 的 reasoning 字段
                    _reasoning = _delta_dict.get('reasoning', None)
                    if _reasoning:
                        content_text = _reasoning
                        _reasoning_chars += len(_reasoning)
                    # Claude extended thinking
                    elif _delta_dict.get('reasoning_content', None):
                        content_text = _delta_dict['reasoning_content']
                    # 其他非标准字段
                    elif _delta_dict.get('text', None):
                        content_text = _delta_dict['text']
                except Exception:
                    pass

            if content_text:
                processor.process_chunk(content_text)
            
            if chunk.choices[0].finish_reason in ("stop", "length"):
                break

        emit_log(f"[stream] chunks={_debug_chunk_count}, processed={processor.chunk_count}, chars={len(processor.full_text)}, reasoning_chars={_reasoning_chars}")

        # 流式结束处理
        processor.on_complete()

        elapsed = round(time.time() - processor.start_time, 1)
        emit_log(f"[{agent_name}] 流式输出完成，{processor.chunk_count} 个 chunk，{len(processor.full_text)} 字符，{elapsed}s")

    except Exception as e:
        err_str = str(e)
        elapsed = round(time.time() - processor.start_time, 1)
        
        if "timeout" in err_str.lower() or "connection" in err_str.lower():
            emit("error_msg", {"message": f"[{agent_name}] 网络错误（{elapsed}s）: {err_str[:200]}"})
        else:
            emit("error_msg", {"message": f"[{agent_name}] AI 调用失败（{elapsed}s）: {err_str[:300]}", "traceback": traceback.format_exc()})
        sys.exit(1)

    # ====================================
    # 处理输出
    # ====================================
    
    full_text = processor.full_text
    elapsed = round(time.time() - processor.start_time, 1)
    
    if agent_role == "coder":
        # Coder: 解析文件输出并写入磁盘
        emit_status("writing", "正在写入文件...")
        emit_progress(90)

        files_written = parse_and_write_files(full_text, cwd)

        if not files_written:
            emit_log("未检测到 <<<FILE:>>> 格式，尝试解析 markdown 代码块...")
            files_written = fallback_parse_markdown(full_text, cwd)

        if not files_written:
            emit("error_msg", {"message": "AI 未输出任何文件内容。可能需要更明确的需求描述。"})
            emit_log(f"完整输出前500字符: {full_text[:500]}")
            sys.exit(1)

        emit_progress(100)
        emit_status("completed", f"生成完成！耗时 {elapsed}s，{len(files_written)} 个文件")
        emit_agent(agent_id,
            f"✅ 代码编写完成！\n\n"
            f"📊 统计:\n"
            f"• 耗时: {elapsed}s\n"
            f"• 输出: {len(full_text)} 字符\n"
            f"• 文件: {len(files_written)} 个\n"
            f"• 文件列表: {', '.join(sorted(files_written))}"
        )
        emit("result", {
            "agentId": agent_id,
            "group": agent_group,
            "role": agent_role,
            "duration_s": elapsed,
            "files": sorted(files_written),
            "total_chars": len(full_text),
        })
    else:
        # 非 coder（orchestrator / planner / reviewer）：输出纯文本
        emit_progress(100)
        emit_status("completed", f"{agent_name}任务完成！耗时 {elapsed}s")
        
        # 完整输出供下游 agent 使用
        emit("agent_output", {
            "agentId": agent_id,
            "group": agent_group,
            "role": agent_role,
            "content": full_text,
            "duration_s": elapsed,
            "total_chars": len(full_text),
        })
        
        emit_agent(agent_id, f"{agent_emoji} {agent_name}方案已输出 ({len(full_text)} 字符, {elapsed}s)")
        
        emit("result", {
            "agentId": agent_id,
            "group": agent_group,
            "role": agent_role,
            "duration_s": elapsed,
            "total_chars": len(full_text),
            "output": full_text,
        })


if __name__ == "__main__":
    run_agent()
