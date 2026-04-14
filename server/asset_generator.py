"""
WeCreat 素材生成模块

支持：
- ElevenLabs 音效生成（sound-generation API）
- iChat 图片生成（待接入）

环境变量：
- ELEVENLABS_API_KEY：ElevenLabs API key
- ICHAT_APPID / ICHAT_APPKEY：iChat 图片 API（内网）
"""

import os
import re
import json
import time
import urllib.request
import urllib.error

# ====================================
# ElevenLabs 音效生成
# ====================================

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
ELEVENLABS_SOUND_URL = "https://api.elevenlabs.io/v1/sound-generation"

def generate_sound_effect(prompt: str, output_path: str, duration_seconds: float = 2.0) -> dict:
    """
    用 ElevenLabs API 生成音效 mp3 文件。
    
    Args:
        prompt: 音效描述（英文效果最好）
        output_path: 输出文件路径（.mp3）
        duration_seconds: 音效时长（0.5-22秒）
    
    Returns:
        {"success": True, "path": output_path, "size": file_size} 或
        {"success": False, "error": error_message}
    """
    if not ELEVENLABS_API_KEY:
        return {"success": False, "error": "ELEVENLABS_API_KEY 未配置"}
    
    # 限制时长
    duration_seconds = max(0.5, min(duration_seconds, 22.0))
    
    payload = json.dumps({
        "text": prompt,
        "duration_seconds": duration_seconds,
    }).encode("utf-8")
    
    req = urllib.request.Request(
        ELEVENLABS_SOUND_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
        },
        method="POST",
    )
    
    try:
        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with urllib.request.urlopen(req, timeout=60) as resp:
            if resp.status == 200:
                data = resp.read()
                with open(output_path, "wb") as f:
                    f.write(data)
                return {
                    "success": True,
                    "path": output_path,
                    "size": len(data),
                    "size_kb": round(len(data) / 1024, 1),
                }
            else:
                return {"success": False, "error": f"HTTP {resp.status}"}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:200]
        return {"success": False, "error": f"HTTP {e.code}: {body}"}
    except Exception as e:
        return {"success": False, "error": str(e)[:200]}


def parse_sound_prompts(agent_output: str) -> list:
    """
    从音效 Agent 的输出中提取音效描述，生成 ElevenLabs 可用的 prompt。
    
    返回格式：[{"name": "player_shoot", "prompt": "short percussive...", "duration": 0.5}, ...]
    """
    prompts = []
    
    # 模式1：表格格式（| 事件名 | 触发条件 | 音色描述 | 时长 | ...）
    table_rows = re.findall(
        r'\|\s*(\w+)\s*\|\s*[^|]+\|\s*([^|]+)\|\s*(\d+)(?:ms|s)',
        agent_output
    )
    for name, desc, duration_str in table_rows:
        if name.lower() in ('事件名', 'event', '---', ''):
            continue
        desc = desc.strip()
        # 转换时长
        duration_val = int(duration_str)
        duration_s = duration_val / 1000 if duration_val > 100 else duration_val
        duration_s = max(0.5, min(duration_s, 5.0))
        
        # 生成英文 prompt（ElevenLabs 英文效果更好）
        prompt = f"game sound effect: {desc}"
        prompts.append({
            "name": name,
            "prompt": prompt,
            "duration": duration_s,
        })
    
    # 模式2：列表格式（- **xxx**: 描述...）
    if not prompts:
        list_items = re.findall(
            r'[-*]\s*\*?\*?(\w+)\*?\*?\s*[:：]\s*(.+?)(?:\n|$)',
            agent_output
        )
        for name, desc in list_items:
            if len(desc) < 5 or name.lower() in ('风格', '情绪', '调式', 'bpm', '循环'):
                continue
            prompts.append({
                "name": name,
                "prompt": f"game sound effect: {desc.strip()[:100]}",
                "duration": 1.0,
            })
    
    # 去重 + 限制数量（最多 8 个音效，避免 API 调用过多）
    seen = set()
    unique_prompts = []
    for p in prompts:
        if p["name"] not in seen:
            seen.add(p["name"])
            unique_prompts.append(p)
        if len(unique_prompts) >= 8:
            break
    
    return unique_prompts


def batch_generate_sounds(sound_prompts: list, output_dir: str, callback=None) -> list:
    """
    批量生成音效文件。
    
    Args:
        sound_prompts: parse_sound_prompts 的输出
        output_dir: 音效文件输出目录
        callback: 可选回调 callback(name, result)，用于实时进度推送
    
    Returns:
        [{"name": "xxx", "path": "sfx/xxx.mp3", "success": True, ...}, ...]
    """
    results = []
    os.makedirs(output_dir, exist_ok=True)
    
    for i, sp in enumerate(sound_prompts):
        output_path = os.path.join(output_dir, f"{sp['name']}.mp3")
        result = generate_sound_effect(
            prompt=sp["prompt"],
            output_path=output_path,
            duration_seconds=sp["duration"],
        )
        result["name"] = sp["name"]
        result["prompt"] = sp["prompt"]
        results.append(result)
        
        if callback:
            callback(sp["name"], result)
        
        # ElevenLabs 有频率限制，间隔 0.5 秒
        if i < len(sound_prompts) - 1:
            time.sleep(0.5)
    
    return results


# ====================================
# 图片生成（iChat / 待接入）
# ====================================

ICHAT_APPID = os.environ.get("ICHAT_APPID", "")
ICHAT_APPKEY = os.environ.get("ICHAT_APPKEY", "")

def generate_image(prompt: str, output_path: str, size: str = "512x512") -> dict:
    """
    用 iChat API 生成图片。
    注意：iChat API 需要在内网环境（woa.com 域名可达）才能使用。
    
    目前暂未接入——美术 Agent 的输出仍然是文字规格。
    """
    return {"success": False, "error": "图片生成 API 暂未接入（需要内网环境）"}


# ====================================
# 测试入口
# ====================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python3 asset_generator.py <command> [args]")
        print("  test_sound <prompt> [output_path]")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "test_sound":
        prompt = sys.argv[2] if len(sys.argv) > 2 else "short cheerful game victory jingle"
        output = sys.argv[3] if len(sys.argv) > 3 else "/tmp/test_wecreat_sound.mp3"
        print(f"生成音效: {prompt}")
        result = generate_sound_effect(prompt, output)
        print(json.dumps(result, indent=2))
    else:
        print(f"未知命令: {cmd}")
