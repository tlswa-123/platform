# -*- coding: utf-8 -*-
"""
图片生成/编辑工具 (Image Generator / Editor)

通过 iChat API 调用 Gemini 模型进行文生图或图片编辑。
可被 AI Agent（如 ClaudeCode）通过 bash 工具调用。

所有执行结果（成功/失败）均通过 stdout 输出，便于 AI Agent 解析。
成功时以 [SUCCESS] 开头，失败时以 [ERROR] 开头，进度信息以 [INFO] 开头。

用法:
    # 文生图（无参考图）
    python image_generator.py --mode text_to_image --prompt "生成一张风景图片"

    # 文生图（带参考图）
    python image_generator.py --mode text_to_image --prompt "生成类似风格的图片" \\
        --reference_image_path ./ref1.png ./ref2.png

    # 图片编辑
    python image_generator.py --mode image_edit --prompt "将这张图片改成正午的阳光" \\
        --reference_image_path ./input.png

    # 指定输出路径
    python image_generator.py --mode text_to_image --prompt "一只猫" --output ./results/cat

参数:
    --mode                 必填。text_to_image(文生图) 或 image_edit(图片编辑)
    --prompt               必填。生成/编辑图片的提示词
    --reference_image_path 可选。一个或多个参考图片路径（空格分隔）
    --output               可选。输出图片路径（可不带扩展名，会根据返回格式自动补充），默认 output_image

环境变量:
    ICHAT_APPID   - iChat 应用 ID
    ICHAT_APPKEY  - iChat 应用密钥
"""

import sys
import time
import hmac
import hashlib
import json
import urllib.request
import urllib.error
import os
import base64
import re
import mimetypes
import argparse

# ============================================================
# 全局配置
# ============================================================
ICHAT_SOURCE = "WechatGame"
ICHAT_APPID = os.getenv("ICHAT_APPID")
ICHAT_APPKEY = os.getenv("ICHAT_APPKEY")
BASE_URL = "http://ichat.woa.com"

# API 请求超时时间（秒）
REQUEST_TIMEOUT = 150

# MIME 类型到文件扩展名的映射，用于从 Data URI 自动推断输出文件扩展名
MIME_TO_EXT = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/svg+xml": ".svg",
    "image/tiff": ".tiff",
    "image/x-icon": ".ico",
}


# ============================================================
# 认证相关
# ============================================================

def calc_authorization(source: str, appkey: str) -> tuple[str, int]:
    """
    计算 iChat API 的 HMAC-SHA256 签名。

    Args:
        source: 应用来源标识（如 "WechatGame"）
        appkey: 应用密钥

    Returns:
        (签名hex字符串, 时间戳)
    """
    timestamp = int(time.time())
    sign_str = "x-timestamp: %s\nx-source: %s" % (timestamp, source)
    sign = hmac.new(
        appkey.encode("utf-8"),
        sign_str.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return sign.hex(), timestamp


def get_auth_headers() -> dict[str, str]:
    """
    构建带认证信息的 HTTP 请求头。

    Returns:
        包含 AppID、Source、Timestamp、Authorization 的 headers 字典

    Raises:
        ValueError: 当 ICHAT_APPID 或 ICHAT_APPKEY 未配置时
    """
    if not ICHAT_APPID or not ICHAT_APPKEY:
        raise ValueError(
            "环境变量 ICHAT_APPID 或 ICHAT_APPKEY 未设置。"
        )

    auth, timestamp = calc_authorization(ICHAT_SOURCE, ICHAT_APPKEY)
    return {
        "X-AppID": ICHAT_APPID,
        "X-Source": ICHAT_SOURCE,
        "X-Timestamp": str(timestamp),
        "X-Authorization": auth,
    }


# ============================================================
# 图片编解码工具
# ============================================================

def image_to_data_uri(image_path: str) -> str:
    """
    读取本地图片文件并转换为 Data URI 格式的 base64 字符串。
    Data URI 格式: data:<mime_type>;base64,<base64_data>

    Args:
        image_path: 本地图片文件路径

    Returns:
        Data URI 格式的 base64 字符串

    Raises:
        FileNotFoundError: 图片文件不存在
        PermissionError: 无权限读取文件
        OSError: 其他文件读取错误
    """
    # 检查文件是否存在
    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"参考图片不存在: {image_path}")

    # 推断 MIME 类型
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = "image/png"  # 无法推断时默认使用 PNG

    with open(image_path, "rb") as f:
        image_data = f.read()

    if len(image_data) == 0:
        raise ValueError(f"参考图片文件为空: {image_path}")

    base64_str = base64.b64encode(image_data).decode("utf-8")
    print(f"[INFO] 已加载参考图片: {image_path} ({len(image_data)} bytes, {mime_type})")
    return f"data:{mime_type};base64,{base64_str}"


def base64_to_image(base64_str: str, output_path: str) -> str:
    """
    将 base64 字符串解码并保存为图片文件。
    支持 Data URI 格式（data:<mime>;base64,<data>），会自动识别 MIME 类型并补充扩展名。

    Args:
        base64_str: base64 编码的图片数据（支持 Data URI 格式）
        output_path: 输出文件路径（可不带扩展名，Data URI 时会自动补充）

    Returns:
        实际保存的文件完整路径

    Raises:
        ValueError: base64 数据为空或解码失败
        OSError: 文件写入失败
    """
    if not base64_str:
        raise ValueError("base64 图片数据为空，无法保存。")

    if base64_str.startswith("data:"):
        # 解析 Data URI: data:<mime>;base64,<data>
        match = re.match(r"data:([\w/\-+.]+);base64,(.+)", base64_str, re.DOTALL)
        if match:
            mime_type = match.group(1)
            base64_str = match.group(2)

            # 根据 MIME 类型确定文件扩展名
            ext = MIME_TO_EXT.get(mime_type)
            if ext is None:
                # 兜底：从 MIME 类型中提取，如 image/png -> .png
                ext = "." + mime_type.split("/")[-1]

            # 如果 output_path 没有扩展名，自动补上
            if "." not in os.path.basename(output_path):
                output_path += ext
        else:
            raise ValueError("Data URI 格式无效，无法解析 MIME 类型和 base64 数据。")

    # 确保输出目录存在
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        print(f"[INFO] 已创建输出目录: {output_dir}")

    # 解码并写入文件
    try:
        image_data = base64.b64decode(base64_str)
    except Exception as e:
        raise ValueError(f"base64 解码失败: {e}")

    if len(image_data) == 0:
        raise ValueError("解码后的图片数据为空。")

    with open(output_path, "wb") as f:
        f.write(image_data)

    # 返回绝对路径，方便 AI Agent 后续使用
    abs_path = os.path.abspath(output_path)
    print(f"[SUCCESS] 图片已保存到: {abs_path} ({len(image_data)} bytes)")
    return abs_path


# ============================================================
# 核心 API 调用
# ============================================================

def _call_generate_api(prompt: str, image_urls: list[str], output_path: str) -> str:
    """
    调用 iChat Gemini 图片生成 API 的内部通用方法。

    Args:
        prompt: 提示词
        image_urls: Data URI 格式的参考图片列表（可为空列表）
        output_path: 输出文件路径

    Returns:
        实际保存的文件完整路径

    Raises:
        ValueError: 认证失败或响应数据异常
        urllib.error.URLError: 网络请求失败
        TimeoutError: 请求超时
    """
    url = BASE_URL + "/api/txt2img/gemini/generate"

    # 构建请求参数
    params = {
        "prompt": prompt,
        "model": "gemini-2.5-flash-image",
        "image_urls": image_urls,
        "image_format": "base64",
        "extra_body": {},
        "cid": "string",
    }

    # 构建请求头（含认证）
    headers = get_auth_headers()
    headers["Content-Type"] = "application/json"

    data = json.dumps(params).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    print(f"[INFO] 正在请求 API: {url}")
    print(f"[INFO] 提示词: {prompt}")
    print(f"[INFO] 参考图片数量: {len(image_urls)}")

    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
            resp_body = response.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        # HTTP 错误（4xx, 5xx）
        error_body = ""
        try:
            error_body = e.read().decode("utf-8")
        except Exception:
            pass
        raise RuntimeError(
            f"API 返回 HTTP 错误 {e.code}: {e.reason}\n响应内容: {error_body}"
        )
    except urllib.error.URLError as e:
        raise RuntimeError(f"网络请求失败（无法连接到服务器）: {e.reason}")
    except TimeoutError:
        raise RuntimeError(f"API 请求超时（超过 {REQUEST_TIMEOUT} 秒），请稍后重试。")

    # 解析响应 JSON
    try:
        resp_dict = json.loads(resp_body)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"API 响应不是有效的 JSON: {e}\n原始响应: {resp_body[:500]}")

    # 检查业务错误码
    if resp_dict.get("code") != 0:
        error_msg = resp_dict.get("msg", "未知错误")
        raise RuntimeError(f"API 返回业务错误 (code={resp_dict.get('code')}): {error_msg}")

    # 提取图片数据
    data_field = resp_dict.get("data", {})
    urls = data_field.get("urls", [])

    if not urls or len(urls) == 0:
        raise RuntimeError(
            "API 返回成功但未包含图片数据。"
            f"\n响应详情: {json.dumps(resp_dict, ensure_ascii=False, indent=2)[:500]}"
        )

    # 输出模型返回的文本（如果有）
    detail = data_field.get("detail", {})
    if detail.get("text"):
        print(f"[INFO] 模型回复文本: {detail['text'].strip()}")

    # 输出 token 用量信息（便于 AI Agent 追踪消耗）
    usage = detail.get("usage", {})
    if usage:
        print(
            f"[INFO] Token 用量 - 输入: {usage.get('prompt_tokens', 'N/A')}, "
            f"输出: {usage.get('completion_tokens', 'N/A')}, "
            f"总计: {usage.get('total_tokens', 'N/A')}, "
            f"费用: ${usage.get('cost_usd', 'N/A')}"
        )

    # 保存图片
    return base64_to_image(urls[0], output_path)


def text_to_image(
    prompt: str,
    reference_image_paths: list[str] | None = None,
    output_path: str = "output_image",
) -> str:
    """
    文生图模式：根据提示词生成图片，可选传入参考图片辅助生成。

    Args:
        prompt: 图片生成提示词
        reference_image_paths: 可选的参考图片路径列表
        output_path: 输出图片文件路径

    Returns:
        实际保存的文件完整路径
    """
    print("[INFO] === 模式: 文生图 (text_to_image) ===")

    # 加载参考图片（如果有）
    image_urls = []
    if reference_image_paths:
        for path in reference_image_paths:
            image_urls.append(image_to_data_uri(path))

    return _call_generate_api(prompt, image_urls, output_path)


def image_edit(
    prompt: str,
    reference_image_paths: list[str] | None = None,
    output_path: str = "output_image",
) -> str:
    """
    图片编辑模式：基于参考图片和提示词进行图片编辑。

    Args:
        prompt: 图片编辑提示词（描述希望如何修改图片）
        reference_image_paths: 待编辑的图片路径列表（至少应提供一张）
        output_path: 输出图片文件路径

    Returns:
        实际保存的文件完整路径
    """
    print("[INFO] === 模式: 图片编辑 (image_edit) ===")

    # 图片编辑模式下，建议至少提供一张参考图片
    if not reference_image_paths:
        print("[WARNING] 图片编辑模式下未提供参考图片，结果可能不符合预期。")

    # 加载参考图片
    image_urls = []
    if reference_image_paths:
        for path in reference_image_paths:
            image_urls.append(image_to_data_uri(path))

    return _call_generate_api(prompt, image_urls, output_path)


# ============================================================
# 命令行入口
# ============================================================

def main():
    """命令行入口函数，解析参数并执行对应模式。"""
    parser = argparse.ArgumentParser(
        description="图片生成/编辑工具 - 通过 iChat API 调用 Gemini 模型",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 文生图
  python image_generator.py --mode text_to_image --prompt "一只可爱的猫咪"

  # 图片编辑
  python image_generator.py --mode image_edit --prompt "把背景改成海滩" --reference_image_path ./photo.png

  # 多张参考图 + 自定义输出路径
  python image_generator.py --mode text_to_image --prompt "融合风格" \\
      --reference_image_path ./style1.png ./style2.png --output ./results/merged
        """,
    )
    parser.add_argument(
        "--mode",
        type=str,
        required=True,
        choices=["text_to_image", "image_edit"],
        help="模式: text_to_image(文生图) 或 image_edit(图片编辑)",
    )
    parser.add_argument(
        "--prompt",
        type=str,
        required=True,
        help="生成/编辑图片的提示词",
    )
    parser.add_argument(
        "--reference_image_path",
        type=str,
        nargs="+",
        default=None,
        help="参考图片路径，可传一个或多个（空格分隔）",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="output_image",
        help="输出图片路径（可不带扩展名，会根据返回格式自动补充），默认: output_image",
    )
    args = parser.parse_args()

    # 执行对应模式
    try:
        result_path: str
        if args.mode == "text_to_image":
            result_path = text_to_image(
                prompt=args.prompt,
                reference_image_paths=args.reference_image_path,
                output_path=args.output,
            )
        else:  # image_edit
            result_path = image_edit(
                prompt=args.prompt,
                reference_image_paths=args.reference_image_path,
                output_path=args.output,
            )

        # 最终成功汇总（AI Agent 可据此判断整体执行结果）
        print(f"[SUCCESS] 任务完成。输出文件: {result_path}")
        sys.exit(0)

    except FileNotFoundError as e:
        print(f"[ERROR] 文件未找到: {e}", file=sys.stderr)
        sys.exit(1)
    except PermissionError as e:
        print(f"[ERROR] 权限不足: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"[ERROR] 参数或数据异常: {e}", file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(f"[ERROR] 运行时错误: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[ERROR] 用户中断执行。", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        # 兜底：捕获所有未预期的异常，确保 AI Agent 能看到错误信息
        print(f"[ERROR] 未预期的异常 ({type(e).__name__}): {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
