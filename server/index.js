/**
 * WeCreat Backend Server v2.1 (22 Agent, Multi-Mode, Security Hardened)
 * 
 * Express + SSE 架构，支持 22 Agent 编排：
 * 
 * API 模式：
 * - /api/orchestrate/:projectId    — Quick Mode（单轮自动编排，向后兼容 v1）
 * - /api/sessions/:projectId/*     — Collab Mode（多轮协作会话）
 * - /api/generate/:projectId       — 单 Agent 直调（向后兼容）
 * 
 * 编排引擎：
 * - coordinator → 拓扑排序 → 分批并行执行 → coder 写代码
 * - Session State 持久化 → 多轮对话
 * - 模型分级：opus(决策) / sonnet(执行) / haiku(审查)
 * 
 * 架构链路：
 * 前端 → Express SSE → Python 子进程(OpenAI SDK) → Adams API → 模型
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const multer = require('multer');

require('dotenv').config({path : path.join(__dirname, '..', '.env')});

// Auto-resolve ADAMS_API_BASE based on NODE_ENV if not explicitly set
// Claude 模型 API 地址
const ADAMS_API_BASE_CLAUDE =
    process.env.ADAMS_API_BASE ||
    (process.env.NODE_ENV === 'production'
         ? (process.env.ADAMS_API_BASE_ONLINE ||
            'http://mmdcadamsminiserverproxy.polaris:25340/service/18957/v1')
         : (process.env.ADAMS_API_BASE_LOCAL ||
            'http://mmdcadamsminiserverproxy.office.polaris/service/18957/v1'));

// GLM 模型 API 地址
const ADAMS_API_BASE_GLM =
    (process.env.NODE_ENV === 'production'
         ? (process.env.ADAMS_API_BASE_GLM_ONLINE ||
            'http://mmdcadamsminiserverproxy.polaris:25340/service/20115/v1')
         : (process.env.ADAMS_API_BASE_GLM_LOCAL ||
            'http://mmdcadamsminiserverproxy.office.polaris/service/20115/v1'));

// 默认使用 Claude（兼容旧逻辑）
const ADAMS_API_BASE = ADAMS_API_BASE_CLAUDE;

/**
 * 根据 provider 获取对应的 API 地址
 */
function getApiBaseByProvider(provider) {
    if (provider === 'glm') return ADAMS_API_BASE_GLM;
    if (provider === 'codebuddy') return '';  // CodeBuddy 不使用 Adams API
    return ADAMS_API_BASE_CLAUDE;
}

const app = express();
const PORT = process.env.PORT || 3001;

// 项目根目录（存放生成的游戏项目）
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// 活跃的生成任务
const activeTasks = new Map();

// V4: Checkpoint 确认信号量（projectId → { resolve, promise }）
const checkpointSignals = new Map();


// ====================================
// Agent 注册表（22 Agent）
// ====================================

const AGENT_REGISTRY = {
  // 小助手组
  'coordinator' : {
    name : '小助手',
    emoji : '🤖',
    group : '小助手',
    role : 'orchestrator',
    model : 'opus'
  },
  'producer' : {
    name : '制作人',
    emoji : '📋',
    group : '小助手',
    role : 'planner',
    model : 'opus'
  },
  // 策划组
  'creative-director' : {
    name : '创意总监',
    emoji : '🎯',
    group : '策划',
    role : 'planner',
    model : 'opus'
  },
  'game-designer' : {
    name : '游戏设计师',
    emoji : '🎮',
    group : '策划',
    role : 'planner',
    model : 'sonnet'
  },
  'systems-designer' : {
    name : '系统设计师',
    emoji : '⚙️',
    group : '策划',
    role : 'planner',
    model : 'sonnet'
  },
  'level-designer' : {
    name : '关卡设计师',
    emoji : '🗺️',
    group : '策划',
    role : 'planner',
    model : 'sonnet'
  },
  'narrative-director' : {
    name : '叙事导演',
    emoji : '📖',
    group : '策划',
    role : 'planner',
    model : 'sonnet'
  },
  'economy-designer' : {
    name : '经济设计师',
    emoji : '💰',
    group : '策划',
    role : 'planner',
    model : 'sonnet'
  },
  // 美术组
  'art-director' : {
    name : '美术总监',
    emoji : '🎨',
    group : '美术',
    role : 'planner',
    model : 'sonnet'
  },
  'technical-artist' : {
    name : '技术美术',
    emoji : '🖌️',
    group : '美术',
    role : 'planner',
    model : 'sonnet'
  },
  'ux-designer' : {
    name : 'UX设计师',
    emoji : '📱',
    group : '美术',
    role : 'planner',
    model : 'sonnet'
  },
  // 音效组
  'audio-director' : {
    name : '音频总监',
    emoji : '🎵',
    group : '音效',
    role : 'planner',
    model : 'sonnet'
  },
  'sound-designer' : {
    name : '音效设计师',
    emoji : '🔊',
    group : '音效',
    role : 'planner',
    model : 'haiku'
  },
  // 工程师组
  'technical-director' : {
    name : '技术总监',
    emoji : '🏗️',
    group : '工程师',
    role : 'planner',
    model : 'opus'
  },
  'lead-programmer' : {
    name : '主程序',
    emoji : '👨‍💻',
    group : '工程师',
    role : 'planner',
    model : 'sonnet'
  },
  'gameplay-programmer' : {
    name : '游戏程序员',
    emoji : '🎯',
    group : '工程师',
    role : 'coder',
    model : 'sonnet'
  },
  'engine-programmer' : {
    name : '引擎程序员',
    emoji : '⚡',
    group : '工程师',
    role : 'coder',
    model : 'sonnet'
  },
  'prototyper' : {
    name : '原型师',
    emoji : '🚀',
    group : '工程师',
    role : 'coder',
    model : 'sonnet'
  },
  'unity-specialist' : {
    name : 'Unity专家',
    emoji : '🔷',
    group : '工程师',
    role : 'coder',
    model : 'sonnet'
  },
  'unreal-specialist' : {
    name : 'Unreal专家',
    emoji : '🔶',
    group : '工程师',
    role : 'coder',
    model : 'sonnet'
  },
  'godot-specialist' : {
    name : 'Godot专家',
    emoji : '🟢',
    group : '工程师',
    role : 'coder',
    model : 'sonnet'
  },
  // 审核组
  'qa-lead' : {
    name : 'QA主管',
    emoji : '🔍',
    group : '审核',
    role : 'reviewer',
    model : 'sonnet'
  },
};

// 前端角色映射（agentId → 前端展示角色）
const AGENT_GROUP_MAP = {};
for (const [id, info] of Object.entries(AGENT_REGISTRY)) {
    AGENT_GROUP_MAP[id] = info.group;
}

// 向后兼容旧 Agent ID
const LEGACY_AGENT_MAP = {
    'artist': 'art-director',
    'sound': 'sound-designer',
    'engineer': 'prototyper',
};

// 模型名映射
const MODEL_MAP = {
  'opus' : 'claude-opus-4-6',
  'sonnet' : 'claude-sonnet-4-20250514',
  'haiku' : 'claude-haiku-4-20250414',
};

// GLM 模型映射（GLM 不区分 opus/sonnet/haiku，统一用同一个模型）
const GLM_MODEL = 'GLM-5-NVFP4-20115';
const GLM_MODEL_MAP = {
  'opus' : GLM_MODEL,
  'sonnet' : GLM_MODEL,
  'haiku' : GLM_MODEL,
};

/**
 * 获取 Agent 的 Adams API 模型名
 */
function getAgentModel(agentId, provider) {
    const info = AGENT_REGISTRY[agentId];
    const map = (provider === 'glm') ? GLM_MODEL_MAP : MODEL_MAP;
    if (!info) return map['sonnet'];
    return map[info.model] || map['sonnet'];
}

/**
 * 解析 Agent ID（兼容旧版）
 */
function resolveAgentId(agentId) {
    return LEGACY_AGENT_MAP[agentId] || agentId;
}


// ====================================
// Session State 管理
// ====================================

/**
 * 读取项目的 Session State
 * 返回 null 如果不存在
 */
function readSessionState(projectDir) {
    const statePath = path.join(projectDir, 'session-state.json');
    if (!fs.existsSync(statePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch {
        return null;
    }
}

/**
 * 写入项目的 Session State（原子写入）
 * 使用 write-tmp-then-rename 模式，防止并发写入或进程崩溃导致文件损坏
 */
function writeSessionState(projectDir, state) {
    const statePath = path.join(projectDir, 'session-state.json');
    const tmpPath = statePath + '.tmp.' + process.pid;
    try {
        fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2));
        fs.renameSync(tmpPath, statePath);
    } catch (err) {
        // 清理临时文件
        try {
          fs.unlinkSync(tmpPath);
        } catch {
        }
        throw err;
    }
}

/**
 * 创建初始 Session State
 */
function createSessionState(projectId, projectType = 'html5') {
  return {
    projectId,
    phase : 'brainstorm', // brainstorm | design | production | polish
    projectType,          // html5 | unity | unreal | godot
    mode : 'quick',       // quick | collab
    createdAt : Date.now(),
    updatedAt : Date.now(),

    // 编排状态
    orchestration : {
      currentAgent : null,
      waitingForUser : false,
      pendingQuestion : null,
      completedAgents : [],
      agentOutputs : {},
      agentDependencies : {},
    },

    // 决策日志
    decisions : [],

    // 项目文档状态
    documents : {},
  };
}

/**
 * 追加决策到 Session State
 */
function addDecision(state, agentId, decision, rationale = '') {
    state.decisions.push({
        time: new Date().toISOString(),
        agent: agentId,
        decision,
        rationale,
    });
    state.updatedAt = Date.now();
}


// ====================================
// 拓扑排序编排器
// ====================================

/**
 * 对 Agent 列表进行拓扑排序，按依赖关系分批
 * 返回 [[batch1_agents], [batch2_agents], ...]
 * 
 * @param {string[]} agents - 需要执行的 Agent ID 列表
 * @param {object} dependencies - { agentId: [dependsOn1, dependsOn2, ...] }
 */
function topologicalSort(agents, dependencies = {}) {
    const agentSet = new Set(agents);
    const batches = [];
    const completed = new Set();
    const remaining = new Set(agents);

    // 安全阀：最多迭代 agents.length 轮
    let maxIter = agents.length + 1;

    while (remaining.size > 0 && maxIter-- > 0) {
        const batch = [];

        for (const agentId of remaining) {
            const deps = (dependencies[agentId] || []).filter(d => agentSet.has(d));
            const allDepsMet = deps.every(d => completed.has(d));

            if (allDepsMet) {
                batch.push(agentId);
            }
        }

        if (batch.length === 0) {
            // 有循环依赖，把剩余的全部放入一批
            console.warn('[topo-sort] Circular dependency detected, forcing remaining agents');
            batches.push([...remaining]);
            break;
        }

        batches.push(batch);
        for (const a of batch) {
            completed.add(a);
            remaining.delete(a);
        }
    }

    return batches;
}


// ====================================
// ElevenLabs 音效生成
// ====================================

function parseSoundPrompts(agentOutput) {
    const prompts = [];

    const tableRe = /\|\s*(\w+)\s*\|\s*[^|]+\|\s*([^|]+)\|\s*(\d+)\s*(?:ms|s)/g;
    let match;
    while ((match = tableRe.exec(agentOutput)) !== null) {
        const [, name, desc, durStr] = match;
        if (['事件名', 'event', '---'].includes(name.toLowerCase())) continue;
        const durVal = parseInt(durStr);
        const durSec = durVal > 100 ? durVal / 1000 : durVal;
        prompts.push({
            name,
            prompt: `game sound effect: ${desc.trim()}`,
            duration: Math.max(0.5, Math.min(durSec, 5.0)),
        });
    }

    if (prompts.length === 0) {
        const listRe = /[-*]\s*\*?\*?(\w+)\*?\*?\s*[:：]\s*(.+?)(?:\n|$)/g;
        while ((match = listRe.exec(agentOutput)) !== null) {
            const [, name, desc] = match;
            if (desc.length < 5) continue;
            if (['风格', '情绪', '调式', 'bpm', '循环'].includes(name.toLowerCase())) continue;
            prompts.push({
                name,
                prompt: `game sound effect: ${desc.trim().slice(0, 100)}`,
                duration: 1.0,
            });
        }
    }

    const seen = new Set();
    return prompts.filter(p => {
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
    }).slice(0, 8);
}

function generateSingleSound(prompt, outputPath, durationSeconds = 2.0) {
    return new Promise((resolve) => {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            resolve({ success: false, error: 'ELEVENLABS_API_KEY 未配置' });
            return;
        }

        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const payload = JSON.stringify({
            text: prompt,
            duration_seconds: Math.max(0.5, Math.min(durationSeconds, 22.0)),
        });

        const options = {
            hostname: 'api.elevenlabs.io',
            port: 443,
            path: '/v1/sound-generation',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
                'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 60000,
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks);
                if (res.statusCode === 200) {
                    fs.writeFileSync(outputPath, body);
                    resolve({
                        success: true,
                        path: outputPath,
                        size_kb: Math.round(body.length / 1024 * 10) / 10,
                    });
                } else {
                    resolve({ success: false, error: `HTTP ${res.statusCode}: ${body.toString().slice(0, 200)}` });
                }
            });
        });

        req.on('error', (e) => resolve({ success: false, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'timeout' }); });
        req.write(payload);
        req.end();
    });
}

async function generateSoundAssets(agentOutput, outputDir, callback) {
    const soundPrompts = parseSoundPrompts(agentOutput);
    if (soundPrompts.length === 0) {
        console.log('[sound] 未从 Agent 输出中提取到音效 prompt');
        return [];
    }

    console.log(`[sound] 提取到 ${soundPrompts.length} 个音效 prompt，开始生成...`);
    const results = [];

    for (let i = 0; i < soundPrompts.length; i++) {
        const sp = soundPrompts[i];
        const outputPath = path.join(outputDir, `${sp.name}.mp3`);
        console.log(`[sound] (${i + 1}/${soundPrompts.length}) 生成: ${sp.name} — ${sp.prompt.slice(0, 60)}`);

        const result = await generateSingleSound(sp.prompt, outputPath, sp.duration);
        result.name = sp.name;
        result.prompt = sp.prompt;
        results.push(result);

        if (callback) callback(sp.name, result);

        if (i < soundPrompts.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    return results;
}


// ====================================
// AI 图片素材生成（iChat Gemini）
// ====================================

/**
 * 从 art-director 输出中解析 Asset List 表格，提取需要生成的图片
 * 支持标准格式：| 文件名 | 类型 | 尺寸 | 生成 Prompt |
 */
function parseImageAssets(agentOutput) {
    const assets = [];

    // V4: 增强正则——支持多种 Markdown 表格格式变体
    // 格式1: | filename.ext | type | WxH | prompt text |  （标准四列）
    const tableRe4 = /\|\s*([\w\-./]+\.(?:png|jpg|jpeg|webp|svg))\s*\|\s*([^|]+)\|\s*(\d+)\s*[xX×]\s*(\d+)\s*\|\s*([^|]+)\|/g;
    let match;
    while ((match = tableRe4.exec(agentOutput)) !== null) {
        const [, filename, type, width, height, prompt] = match;
        if (filename.toLowerCase().includes('文件名') || filename === '---') continue;
        if (prompt.trim().toLowerCase().includes('prompt') || prompt.trim() === '---') continue;
        assets.push({
            filename: filename.trim(),
            type: type.trim(),
            width: parseInt(width),
            height: parseInt(height),
            prompt: prompt.trim(),
        });
    }

    // V4 格式2: | filename.ext | WxH | prompt text |  （三列，无 type）
    if (assets.length === 0) {
        const tableRe3 = /\|\s*([\w\-./]+\.(?:png|jpg|jpeg|webp|svg))\s*\|\s*(\d+)\s*[xX×]\s*(\d+)\s*\|\s*([^|]+)\|/g;
        while ((match = tableRe3.exec(agentOutput)) !== null) {
            const [, filename, width, height, prompt] = match;
            if (filename.toLowerCase().includes('文件名') || filename === '---') continue;
            if (prompt.trim().toLowerCase().includes('prompt') || prompt.trim() === '---') continue;
            assets.push({
                filename: filename.trim(),
                type: 'auto',
                width: parseInt(width),
                height: parseInt(height),
                prompt: prompt.trim(),
            });
        }
    }

    // V4 格式3: | filename.ext | prompt text |  （两列，无尺寸）
    if (assets.length === 0) {
        const tableRe2 = /\|\s*([\w\-./]+\.(?:png|jpg|jpeg|webp|svg))\s*\|\s*([^|]{10,})\|/g;
        while ((match = tableRe2.exec(agentOutput)) !== null) {
            const [, filename, prompt] = match;
            if (filename.toLowerCase().includes('文件名') || filename === '---') continue;
            if (prompt.trim().toLowerCase().includes('prompt') || prompt.trim() === '---') continue;
            // 排除尺寸列（纯数字x数字不是 prompt）
            if (/^\s*\d+\s*[xX×]\s*\d+\s*$/.test(prompt)) continue;
            assets.push({
                filename: filename.trim(),
                type: 'auto',
                width: 512,
                height: 512,
                prompt: prompt.trim(),
            });
        }
    }

    // 备用解析：列表格式 - filename.png: prompt text
    if (assets.length === 0) {
        const listRe = /[-*]\s*\*?\*?`?([\w\-./]+\.(?:png|jpg|jpeg|webp|svg))`?\*?\*?\s*[:：]\s*(.+?)(?:\n|$)/g;
        while ((match = listRe.exec(agentOutput)) !== null) {
            const [, filename, prompt] = match;
            if (prompt.length < 10) continue;
            assets.push({
                filename: filename.trim(),
                type: 'auto',
                width: 512,
                height: 512,
                prompt: prompt.trim(),
            });
        }
    }

    // V4 备用解析2: 代码块中的 filename — prompt 格式
    if (assets.length === 0) {
        const codeRe = /([\w\-./]+\.(?:png|jpg|jpeg|webp))\s*[—–-]\s*(.{10,}?)(?:\n|$)/g;
        while ((match = codeRe.exec(agentOutput)) !== null) {
            const [, filename, prompt] = match;
            assets.push({
                filename: filename.trim(),
                type: 'auto',
                width: 512,
                height: 512,
                prompt: prompt.trim(),
            });
        }
    }

    // 去重 + 最多 12 张（V4 从 8 提升到 12）
    const seen = new Set();
    return assets.filter(a => {
        if (seen.has(a.filename)) return false;
        seen.add(a.filename);
        return true;
    }).slice(0, 12);
}

/**
 * V4: 生成 fallback 占位图（纯色 + 文字标注）
 * 不依赖 Python 脚本，用 SVG → Buffer 直接写文件
 */
function generatePlaceholderImage(outputPath, filename, width = 512, height = 512) {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${
      width}" height="${height}">
        <rect width="100%" height="100%" fill="#F0F0F0"/>
        <rect x="10" y="10" width="${width - 20}" height="${
      height -
      20}" fill="none" stroke="#CCC" stroke-width="2" stroke-dasharray="10,5" rx="8"/>
        <text x="50%" y="45%" text-anchor="middle" fill="#999" font-size="16" font-family="sans-serif">⚠️ 素材生成失败</text>
        <text x="50%" y="55%" text-anchor="middle" fill="#BBB" font-size="12" font-family="sans-serif">${
      filename}</text>
        <text x="50%" y="65%" text-anchor="middle" fill="#BBB" font-size="11" font-family="sans-serif">请用代码绘制替代</text>
    </svg>`;

  // 写为 SVG 文件（浏览器可以直接显示）
  const svgPath = outputPath.replace(/\.[^.]+$/, '.svg');
  fs.writeFileSync(svgPath, svgContent);
  return svgPath;
}

/**
 * V32: 自动抠图 — 调用 background_remover.py（BiRefNet 模型服务）
 * 将生成的白底 PNG 素材去掉背景，输出透明 PNG
 * @param {string} imagePath - 待抠图的图片绝对路径
 * @returns {string|null} 抠图后的文件路径（<原名>_nobg.png），失败返回 null
 */
async function removeImageBackground(imagePath) {
    // 查找 background_remover.py 脚本路径
    const possiblePaths = [
        path.join(__dirname, 'scripts', 'background_remover.py'),
        path.join(process.env.HOME || '', '.agents', 'skills', 'image-asset-toolkit', 'scripts', 'background_remover.py'),
        path.join(process.env.HOME || '', '.workbuddy', 'skills', 'image-asset-toolkit', 'scripts', 'background_remover.py'),
    ];
    const scriptPath = possiblePaths.find(p => fs.existsSync(p));
    if (!scriptPath) {
        console.warn('[art] background_remover.py 未找到，跳过自动抠图');
        return null;
    }

    const args = [scriptPath, '--input', imagePath, '--crop'];

    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';

        const child = spawn('python3', args, {
            timeout: 120000,
            env: { ...process.env },
        });

        child.stdout.on('data', (data) => { stdout += data.toString(); });
        child.stderr.on('data', (data) => { stderr += data.toString(); });

        child.on('close', (code) => {
            if (code === 0) {
                // 解析 [SUCCESS] 行获取输出路径
                const match = stdout.match(/\[SUCCESS\].*?:\s*(.+?)(?:\s*\([\d,]+ bytes\))?$/m);
                const outputPath = match?.[1]?.trim() || null;
                if (outputPath && fs.existsSync(outputPath)) {
                    console.log(`[art] 抠图完成: ${path.basename(outputPath)}`);
                    resolve(outputPath);
                } else {
                    console.warn(`[art] 抠图脚本成功但输出文件未找到: ${stdout.slice(-200)}`);
                    resolve(null);
                }
            } else {
                console.warn(`[art] 抠图脚本退出码 ${code}: ${(stderr || stdout).slice(0, 200)}`);
                resolve(null);
            }
        });

        child.on('error', (err) => {
            console.warn(`[art] 抠图脚本启动失败: ${err.message}`);
            resolve(null);
        });
    });
}

/**
 * 批量生成图片素材（V4: 3次重试 + 指数退避 + fallback 占位图 + manifest）
 * @param {Array} assets - parseImageAssets 的输出
 * @param {string} outputDir - 输出目录（项目的 assets/）
 * @param {Function} callback - 每生成一张图回调 (filename, result)
 */
async function generateImageAssets(assets, outputDir, callback) {
    if (assets.length === 0) return [];

    const scriptPath = path.join(__dirname, 'scripts', 'image_generator.py');
    if (!fs.existsSync(scriptPath)) {
        console.error('[art] image_generator.py 不存在');
        return [];
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const results = [];
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 3000, 9000]; // 指数退避

    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const outputBase = path.join(outputDir, asset.filename.replace(/\.[^.]+$/, ''));

        console.log(`[art] (${i + 1}/${assets.length}) 生成: ${asset.filename} — ${asset.prompt.slice(0, 60)}`);

        // 构建增强 prompt（加入尺寸和白底要求）
        let enhancedPrompt = asset.prompt;
        if (asset.type !== '背景' && !enhancedPrompt.toLowerCase().includes('white background')) {
            enhancedPrompt += ', pure white background #FFFFFF, no shadow';
        }

        const args = [
            scriptPath,
            '--mode', 'text_to_image',
            '--prompt', enhancedPrompt,
            '--output', outputBase,
        ];

        let lastError = null;
        let succeeded = false;

        // V4: 最多重试 3 次
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delay = RETRY_DELAYS[attempt - 1] || 3000;
                console.log(`[art] 重试 ${attempt}/${MAX_RETRIES}: ${asset.filename} (等待 ${delay}ms)`);
                await new Promise(r => setTimeout(r, delay));
            }

            try {
                const result = await new Promise((resolve) => {
                    let stdout = '';
                    let stderr = '';

                    const child = spawn('python3', args, {
                      timeout : 180000,
                      env : {...process.env},
                    });

                    child.stdout.on('data', (data) => { stdout += data.toString(); });
                    child.stderr.on('data', (data) => { stderr += data.toString(); });

                    child.on('close', (code) => {
                        if (code === 0) {
                            // 优先匹配"输出文件:"行（干净路径），fallback 到"保存到:"行（去掉 bytes 后缀）
                            const cleanMatch = stdout.match(/\[SUCCESS\].*?输出文件:\s*(.+)/);
                            const fallbackMatch = stdout.match(/\[SUCCESS\].*?保存到:\s*(.+?)(?:\s*\([\d,]+ bytes\))?$/m);
                            const rawMatch = stdout.match(/\[SUCCESS\].*?:\s*(.+)/);
                            const outputPath = (cleanMatch ? cleanMatch[1] : fallbackMatch ? fallbackMatch[1] : rawMatch ? rawMatch[1].replace(/\s*\([\d,]+ bytes\)\s*$/, '') : null)?.trim() || null;
                            resolve({ success: true, outputPath, stdout });
                        } else {
                            resolve({ success: false, error: stderr || stdout });
                        }
                    });

                    child.on('error', (err) => resolve({ success: false, error: err.message }));
                });

                if (result.success && result.outputPath && fs.existsSync(result.outputPath)) {
                    let finalPath = result.outputPath;
                    let actualFilename = path.basename(finalPath);

                    // V32: 非背景类 PNG 素材自动抠图（BiRefNet background_remover）
                    const isBackground = asset.type === '背景' || /^bg[_\-]/.test(asset.filename);
                    const isPng = /\.png$/i.test(actualFilename);
                    if (isPng && !isBackground) {
                        try {
                            const bgRemovedPath = await removeImageBackground(finalPath);
                            if (bgRemovedPath && fs.existsSync(bgRemovedPath)) {
                                // 用抠图后的文件替换原文件
                                fs.renameSync(bgRemovedPath, finalPath);
                                console.log(`[art] ✅ 已自动抠图: ${actualFilename}`);
                            }
                        } catch (bgErr) {
                            console.warn(`[art] ⚠️ 自动抠图失败(${actualFilename}): ${bgErr.message?.slice(0, 100)}`);
                            // 抠图失败不影响主流程，保留原图
                        }
                    }

                    const stat = fs.statSync(finalPath);
                    const sizeKb = Math.round(stat.size / 1024 * 10) / 10;

                    results.push({
                        success: true,
                        filename: actualFilename,
                        originalName: asset.filename,
                        path: `assets/${actualFilename}`,
                        size_kb: sizeKb,
                        prompt: asset.prompt,
                        attempts: attempt + 1,
                    });

                    if (callback) callback(actualFilename, { success: true, size_kb: sizeKb });
                    succeeded = true;
                    break; // 成功，跳出重试循环
                } else {
                    lastError = result.error?.slice(0, 200) || 'Unknown error';
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        // V4: 全部重试失败 → 生成 fallback 占位图
        if (!succeeded) {
            console.warn(`[art] ${asset.filename} 生成失败（${MAX_RETRIES}次重试），使用 fallback 占位图`);
            try {
                const placeholderPath = generatePlaceholderImage(
                    path.join(outputDir, asset.filename),
                    asset.filename,
                    asset.width || 512,
                    asset.height || 512
                );
                const placeholderFilename = path.basename(placeholderPath);
                results.push({
                    success: false,
                    filename: asset.filename,
                    fallback: placeholderFilename,
                    fallbackPath: `assets/${placeholderFilename}`,
                    error: lastError,
                    attempts: MAX_RETRIES,
                });
                if (callback) callback(asset.filename, {
                    success: false,
                    error: `失败(${MAX_RETRIES}次)，已生成占位图`,
                    fallback: placeholderFilename,
                });
            } catch (fbErr) {
                results.push({ success: false, filename: asset.filename, error: lastError, attempts: MAX_RETRIES });
                if (callback) callback(asset.filename, { success: false, error: lastError });
            }
        }

        // 间隔 1 秒，避免 API 限流
        if (i < assets.length - 1) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // V4: 写 manifest.json 记录生成结果
    try {
        const manifestPath = path.join(outputDir, 'manifest.json');
        const manifest = {
            generatedAt: new Date().toISOString(),
            total: assets.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            assets: results.map(r => ({
                filename: r.filename,
                originalName: r.originalName,
                success: r.success,
                path: r.path || r.fallbackPath,
                prompt: r.prompt,
                attempts: r.attempts,
                fallback: r.fallback || null,
            })),
        };
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch { /* ignore manifest write failure */ }

    return results;
}


// ====================================
// 中间件
// ====================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '..')));


// ====================================
// 工具函数
// ====================================

/**
 * 校验 projectId 格式，防止路径遍历攻击
 * 只允许字母、数字、短横线、下划线
 */
function isValidProjectId(id) {
    return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 64;
}

/**
 * 校验 projectId 的中间件工厂
 * 用于所有包含 :id 或 :projectId 的路由
 */
function validateProjectId(paramName = 'id') {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!isValidProjectId(id)) {
            return res.status(400).json({ error: 'Invalid project ID' });
        }
        next();
    };
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function createProjectDir(projectId) {
    const projectDir = path.join(PROJECTS_DIR, projectId);
    ensureDir(projectDir);
    const scaffoldHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; overflow: hidden; }
        canvas { display: block; margin: 0 auto; }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script src="game.js"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(projectDir, 'index.html'), scaffoldHtml);
    fs.writeFileSync(path.join(projectDir, 'game.js'), '// Game code will be generated here\n');
    return projectDir;
}

function readFileIfExists(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }
    } catch {
    }
    return '';
}


// ====================================
// 项目上下文读取（分层披露 v2）
// ====================================

/**
 * 获取项目文件清单（轻量级）
 */
function getProjectFileList(projectDir) {
    const files = [];
    function walk(dir, prefix = '') {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'chat_history.json' || entry.name === 'session-state.json') continue;
            const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                walk(path.join(dir, entry.name), relPath);
            } else {
                const stat = fs.statSync(path.join(dir, entry.name));
                const sizeKB = (stat.size / 1024).toFixed(1);
                files.push(`${relPath} (${sizeKB}KB)`);
            }
        }
    }
    walk(projectDir);
    return files;
}

/**
 * 读取项目代码文件的完整内容（重量级）
 */
function getProjectCodeContent(projectDir) {
    const codeFiles = [];
    const codeExtensions = ['.html', '.js', '.css', '.json'];
    const skipFiles = ['.meta.json', 'chat_history.json', 'package.json', 'package-lock.json', 'session-state.json', 'decisions.json'];

    function walk(dir, prefix = '') {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'design') continue;
            const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                walk(path.join(dir, entry.name), relPath);
            } else {
                if (skipFiles.includes(entry.name)) continue;
                const ext = path.extname(entry.name).toLowerCase();
                if (!codeExtensions.includes(ext)) continue;
                const fullPath = path.join(dir, entry.name);
                const stat = fs.statSync(fullPath);
                if (stat.size < 50 || stat.size > 200 * 1024) continue;
                try {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    codeFiles.push({ path: relPath, content, size: stat.size });
                } catch {
                }
            }
        }
    }
    walk(projectDir);
    return codeFiles;
}

/**
 * 读取聊天历史摘要
 */
/**
 * V4: 读取聊天历史摘要（扩容版）
 * - 最近 30 条消息（V2: 10条），每条截取 500 字（V2: 200字）
 * - 超过 30 条时，旧消息不丢弃而是压缩为概要
 */
function getChatHistorySummary(projectDir, maxMessages = 30) {
    const chatPath = path.join(projectDir, 'chat_history.json');
    if (!fs.existsSync(chatPath)) return '';
    try {
        const data = JSON.parse(fs.readFileSync(chatPath, 'utf-8'));
        const messages = data.messages || [];
        if (messages.length === 0) return '';

        // V4: 扩容到 30 条 500 字
        const maxChars = 500;
        const recent = messages.slice(-maxMessages);
        const lines = recent.map(m => {
            const role = m.agentId === 'user' ? '用户' : (m.agentId || '系统');
            const content = (m.content || '').slice(0, maxChars);
            return `[${role}]: ${content}`;
        });

        // V4: 如果总消息数超过 maxMessages，在头部添加概要提示
        let prefix = '';
        if (messages.length > maxMessages) {
            const olderCount = messages.length - maxMessages;
            prefix = `[注意：以下是最近 ${maxMessages} 条消息，另有 ${olderCount} 条更早的对话已省略]\n\n`;
        }

        return prefix + lines.join('\n');
    } catch {
        return '';
    }
}

/**
 * V4: 获取上一轮 prototyper 产出的代码摘要
 * 用于注入 prompt，让 Agent 知道当前代码结构
 */
function getLastCodeSummary(projectDir) {
    const codeFiles = getProjectCodeContent(projectDir);
    if (codeFiles.length === 0) return '';

    const summaryParts = [];
    for (const file of codeFiles) {
        // 提取关键函数签名和类定义
        const funcMatches = file.content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?function|class\s+\w+|(?:get|set|async)\s+\w+\s*\()/g) || [];
        if (funcMatches.length > 0) {
          summaryParts.push(`### ${file.path} (${
              Math.round(file.size / 1024)}KB)\n关键定义: ${
              funcMatches.slice(0, 15).join(', ')}`);
        } else {
          summaryParts.push(
              `### ${file.path} (${Math.round(file.size / 1024)}KB)`);
        }
    }
    return summaryParts.join('\n');
}

/**
 * 读取设计文档（策划/美术/音效 Agent 用）
 */
function getDesignDocuments(projectDir, group) {
    const designDir = path.join(projectDir, 'design');
    if (!fs.existsSync(designDir)) return {};

    const docs = {};

    // 所有 Agent 都读支柱文档
    const pillarsPath = path.join(designDir, 'pillars.md');
    if (fs.existsSync(pillarsPath)) {
        docs.pillars = fs.readFileSync(pillarsPath, 'utf-8');
    }

    const conceptPath = path.join(designDir, 'concept.md');
    if (fs.existsSync(conceptPath)) {
        docs.concept = fs.readFileSync(conceptPath, 'utf-8');
    }

    // 按分组读取相关文档
    const gddDir = path.join(designDir, 'gdd');

    switch (group) {
        case '策划':
            if (fs.existsSync(gddDir)) {
                const gddFiles = fs.readdirSync(gddDir).filter(f => f.endsWith('.md'));
                for (const f of gddFiles) {
                    const content = readFileIfExists(path.join(gddDir, f));
                    if (content) docs[`gdd/${f}`] = content;
                }
            }
            break;
        case '美术':
            docs.artStyle = readFileIfExists(path.join(designDir, 'art-style.md'));
            break;
        case '音效':
            docs.audioStyle = readFileIfExists(path.join(designDir, 'audio-style.md'));
            break;
        case '工程师':
            // 工程师读所有设计文档（概要）
            docs.artStyle = readFileIfExists(path.join(designDir, 'art-style.md'));
            docs.audioStyle = readFileIfExists(path.join(designDir, 'audio-style.md'));
            if (fs.existsSync(gddDir)) {
                const gddFiles = fs.readdirSync(gddDir).filter(f => f.endsWith('.md'));
                for (const f of gddFiles) {
                    const content = readFileIfExists(path.join(gddDir, f));
                    if (content) docs[`gdd/${f}`] = content;
                }
            }
            break;
    }

    return docs;
}


// ====================================
// Prompt 构建 v2（通用化，支持 22 Agent）
// ====================================

/**
 * 通用 Agent Prompt 构建器
 * 
 * 分层上下文策略：
 * - 所有 Agent：聊天历史 + Session State + 项目支柱
 * - orchestrator (coordinator)：+ 文件清单 + 判断新建/修改
 * - planner (策划/美术/音效/审核)：+ 对应设计文档 + 前序 Agent 输出
 * - coder (prototyper/引擎专家)：+ 完整代码文件 + 所有设计文档 + 前序输出
 * - reviewer (qa-lead)：+ 代码 + 设计文档
 */
function buildAgentPrompt(agentId, userPrompt, projectDir, prevOutputs = {}, orchestration = null) {
    // 解析 Agent ID
    const realAgentId = resolveAgentId(agentId);
    const agentInfo = AGENT_REGISTRY[realAgentId] || { group: '工程师', role: 'planner' };
    const group = agentInfo.group;
    const role = agentInfo.role;

    const parts = [];

    // 通用上下文
    parts.push(`## 工作目录\n${projectDir}\n`);

    // 1. Session State（如果存在）
    const sessionState = readSessionState(projectDir);
    if (sessionState) {
        parts.push(`## 项目状态\n- 阶段: ${sessionState.phase}\n- 项目类型: ${sessionState.projectType}\n- 模式: ${sessionState.mode}\n`);

        // 最近决策
        if (sessionState.decisions.length > 0) {
            const recentDecisions = sessionState.decisions.slice(-5);
            const decisionLines = recentDecisions.map(d => `- [${d.agent}] ${d.decision}`);
            parts.push(`## 最近决策\n${decisionLines.join('\n')}\n`);
        }
    }

    // 2. 聊天历史（所有 Agent 都看）
    const chatSummary = getChatHistorySummary(projectDir);
    if (chatSummary) {
        parts.push(`## 对话历史（最近消息）\n以下是用户在这个项目中之前的对话，帮助你理解上下文：\n${chatSummary}\n`);
    }

    // 3. 设计文档（按分组注入）
    const designDocs = getDesignDocuments(projectDir, group);
    if (designDocs.pillars) {
        parts.push(`## 项目支柱\n${designDocs.pillars}\n`);
    }
    if (designDocs.concept) {
        parts.push(`## 游戏概念\n${designDocs.concept}\n`);
    }

    // 4. 项目文件清单
    const fileList = getProjectFileList(projectDir);
    const hasExistingCode = fileList.some(
        f => (f.startsWith('game.js') || f.startsWith('index.html')) &&
             !f.includes('0.0KB') && !f.includes('0.1KB'));

    // ===== 按角色类型注入专属上下文 =====

    if (role === 'orchestrator') {
        // Coordinator: 文件清单 + 判断新建/修改
        if (fileList.length > 0) {
            parts.push(`## 项目现有文件\n${fileList.join('\n')}\n`);
            if (hasExistingCode) {
                parts.push(`⚠️ 注意：这是一个已有代码的项目。用户可能在要求修改/修 bug，而不是从零开始。
请仔细分析用户的意图：
- 如果是修 bug / 改功能 → engineer_brief 中必须明确说明「基于现有代码修改」，列出要修的具体问题
- 如果是全新需求 → 正常流程\n`);
            }
        }

        parts.push(`## 用户需求\n${userPrompt}\n`);

        if (hasExistingCode) {
            parts.push(`## 你的任务
分析用户需求。这是一个已有代码的项目，用户可能在要求修改或修 bug。
- 如果用户在修 bug / 改功能：engineer_brief 中必须明确「在现有代码基础上修改」+ 具体修改点
- 如果用户在做全新需求：正常输出游戏方案卡片和编排指令
严格复述用户的需求，不要自作主张换游戏类型。`);
        } else {
            parts.push(`## 你的任务
分析用户需求，输出浓缩的游戏方案卡片和结构化编排指令。
严格复述用户的游戏需求，不要自作主张换游戏类型。`);
        }

    } else if (role === 'coder') {
        // Coder: 完整代码 + 设计文档 + 前序输出
        if (hasExistingCode) {
            const codeFiles = getProjectCodeContent(projectDir);
            if (codeFiles.length > 0) {
                parts.push(`## 项目现有代码\n以下是当前项目中已有的代码文件，你必须在此基础上修改，不要从零重写：\n`);
                for (const file of codeFiles) {
                    parts.push(`### ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n`);
                }
                parts.push(`⚠️ 重要：你看到了项目的现有代码。
- 如果用户要求修 bug 或改功能，请在现有代码基础上修改，输出修改后的完整文件
- 不要从零写一个全新的游戏！保持原有的游戏类型和核心逻辑
- 用 <<<FILE:path>>> 格式输出需要修改的文件\n`);
            }
        }

        // 注入设计文档
        for (const [key, content] of Object.entries(designDocs)) {
            if (['pillars', 'concept'].includes(key)) continue; // 已注入
            if (content) {
                parts.push(`## 设计文档: ${key}\n${content}\n`);
            }
        }

        // V4: 注入上轮代码摘要（帮助 Agent 理解现有代码结构）
        const codeSummary = getLastCodeSummary(projectDir);
        if (codeSummary) {
            parts.push(`## 当前代码结构概要\n${codeSummary}\n`);
        }

        parts.push(`## 用户原始需求\n${userPrompt}\n`);

        // 前序 Agent 输出
        if (orchestration?.engineer_brief) {
            parts.push(`## 游戏技术规格（来自小助手）\n${orchestration.engineer_brief}\n`);
        }

        // 注入所有前序 planner 输出
        for (const [aid, output] of Object.entries(prevOutputs)) {
            if (aid === 'coordinator') continue; // coordinator 输出已通过 engineer_brief 精简传递
            const agentReg = AGENT_REGISTRY[aid] || AGENT_REGISTRY[resolveAgentId(aid)];
            if (agentReg) {
                parts.push(`## ${agentReg.name}的方案\n${output}\n`);
            }
        }

        // 技术规范（新项目且无前序输出）
        if (!orchestration?.engineer_brief && Object.keys(prevOutputs).length <= 1 && !hasExistingCode) {
            parts.push(`## 技术规范
1. 使用原生 Canvas 2D API，不要使用任何游戏框架
2. 游戏代码写在 game.js 中，HTML 结构在 index.html 中
3. 可以创建额外的 JS 文件做模块化
4. CSS 样式内联在 index.html 的 <style> 标签中
5. 确保 60fps 流畅运行
6. 支持触控和键盘操作

## 游戏要求
1. 完整游戏循环：开始界面 → 游戏中 → 结束界面 → 重新开始
2. 计分系统 + localStorage 最高分持久化
3. 自适应屏幕尺寸（响应式 Canvas）
4. 可以使用 assets/ 目录中的图片素材（通过 AI 生成或用户上传），用相对路径引用如 assets/bg.png?v=时间戳
5. 视觉元素优先使用 AI 生成的素材图片，简单图形（如按钮、色块）可以用代码绘制
6. 代码注释完整，结构清晰`);
        }

        if (hasExistingCode) {
            parts.push(`\n## 你的任务
基于项目现有代码和用户的新需求进行修改。
- 你已经看到了「项目现有代码」部分的全部文件内容
- 在现有代码基础上修改，输出修改后的完整文件
- 绝对不要更改游戏类型！如果现有代码是贪吃蛇，修 bug 后还是贪吃蛇
- 用 <<<FILE:path>>> 格式输出需要修改的文件`);
        } else {
            parts.push(`\n## 你的任务
基于以上所有规格文档，编写完整可运行的 HTML5 游戏代码。
严格按照用户原始需求和技术规格来实现，不要更改游戏类型。
确保 index.html 可以直接在浏览器中打开运行。`);
        }

    } else if (role === 'planner') {
        // Planner: 按分组注入相关设计文档 + 前序输出
        for (const [key, content] of Object.entries(designDocs)) {
            if (['pillars', 'concept'].includes(key)) continue;
            if (content) {
                parts.push(`## 设计文档: ${key}\n${content}\n`);
            }
        }

        parts.push(`## 用户原始需求\n${userPrompt}\n`);

        // 注入 orchestration 中对应的 brief
        const briefKey = `${realAgentId.replace(/-/g, '_')}_brief`;
        if (orchestration && orchestration[briefKey]) {
            parts.push(`## 小助手的任务简述\n${orchestration[briefKey]}\n`);
        }
        // 向后兼容旧字段
        if (orchestration?.artist_brief && group === '美术') {
            parts.push(`## 小助手的美术需求简述\n${orchestration.artist_brief}\n`);
        }
        if (orchestration?.sound_brief && group === '音效') {
            parts.push(`## 小助手的音效需求简述\n${orchestration.sound_brief}\n`);
        }

        // 注入前序 planner 输出（同组或上游）
        for (const [aid, output] of Object.entries(prevOutputs)) {
            if (aid === 'coordinator') continue;
            if (aid === realAgentId) continue;
            const agentReg = AGENT_REGISTRY[aid] || AGENT_REGISTRY[resolveAgentId(aid)];
            if (agentReg) {
                parts.push(`## ${agentReg.name}的方案\n${output.slice(0, 2000)}${output.length > 2000 ? '\n...(已截断)' : ''}\n`);
            }
        }

        parts.push(`## 你的任务
基于以上需求和上下文，输出完整的专业方案。
你的输出将传递给下游 Agent 使用，请确保内容精确、可执行、有专业深度。`);

    } else if (role === 'reviewer') {
        // Reviewer: 代码 + 设计文档
        if (hasExistingCode) {
            const codeFiles = getProjectCodeContent(projectDir);
            if (codeFiles.length > 0) {
                parts.push(`## 项目代码\n`);
                for (const file of codeFiles) {
                    parts.push(`### ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n`);
                }
            }
        }

        for (const [key, content] of Object.entries(designDocs)) {
            if (['pillars', 'concept'].includes(key)) continue;
            if (content) {
                parts.push(`## 设计文档: ${key}\n${content}\n`);
            }
        }

        parts.push(`## 用户原始需求\n${userPrompt}\n`);
        parts.push(`## 你的任务
审查项目代码和设计文档的质量、一致性和完整性。输出结构化的审查报告。`);
    }

    return parts.join('\n\n');
}


// ====================================
// Agent 子进程运行器 v2（通用化）
// ====================================

/**
 * 运行单个 Agent 子进程，收集其输出
 * 
 * v2 改进：
 * - 使用 Agent 注册表自动选择模型
 * - 支持 model override（Quick Mode 用户可能指定全 opus）
 * - 传递 group 和 role 信息给 agent_runner.py
 */
function runSingleAgent(agentId, prompt, projectDir, modelOverride, sendSSE, isAborted, provider) {
    return new Promise((resolve) => {
        if (isAborted()) {
            return resolve({ output: '', error: 'aborted' });
        }

        const realAgentId = resolveAgentId(agentId);
        const agentInfo = AGENT_REGISTRY[realAgentId] || { model: 'sonnet', role: 'planner', group: '工程师' };

        // 模型选择：override > Agent 注册表默认（考虑 provider）
        const effectiveProvider = provider || 'claude';
        const model = modelOverride || getAgentModel(realAgentId, effectiveProvider);
        const apiBase = getApiBaseByProvider(effectiveProvider);

        // V41: CodeBuddy provider 路由到 agent_runner_codebuddy.py
        const isCodeBuddy = effectiveProvider === 'codebuddy';
        const pythonScript = path.join(__dirname,
            isCodeBuddy ? 'agent_runner_codebuddy.py' : 'agent_runner.py'
        );

        const childEnv = isCodeBuddy
            ? {
                ...process.env,
                WECREAT_PROMPT : prompt,
                WECREAT_CWD : projectDir,
                WECREAT_AGENT_ID : realAgentId,
                WECREAT_AGENT_ROLE : agentInfo.role,
                WECREAT_MODEL_PROVIDER : 'codebuddy',
                CODEBUDDY_API_KEY : process.env.CODEBUDDY_API_KEY || '',
                CODEBUDDY_INTERNET_ENVIRONMENT : process.env.CODEBUDDY_INTERNET_ENVIRONMENT || '',
              }
            : {
                ...process.env,
                WECREAT_PROMPT : prompt,
                WECREAT_CWD : projectDir,
                WECREAT_MODEL : model,
                WECREAT_AGENT_ID : realAgentId,
                WECREAT_AGENT_ROLE : agentInfo.role,
                WECREAT_MODEL_PROVIDER : effectiveProvider,
                ADAMS_API_BASE : apiBase,
                ADAMS_BUSINESS : process.env.ADAMS_BUSINESS || '',
                ADAMS_USER : process.env.ADAMS_USER || '',
                ADAMS_TOKEN : process.env.ADAMS_TOKEN || '',
              };

        const child = spawn('python3', [ pythonScript ], {
          env : childEnv,
          cwd : projectDir,
        });

        let agentOutput = '';
        let hasError = false;

        // V37 核心修复: 行缓冲器——Node.js child.stdout 不保证按行分割,
        // 长消息(如 agent_output 含完整方案文本)会被拆成多个 data 事件,
        // 导致 JSON.parse 失败, agentOutput 为空, 下游 prototyper 无上下文。
        let _stdoutBuffer = '';

        child.stdout.on('data', (data) => {
            _stdoutBuffer += data.toString();
            const parts = _stdoutBuffer.split('\n');
            // 最后一段可能不完整——留在 buffer 里等下次 data 事件
            _stdoutBuffer = parts.pop() || '';

            for (const line of parts) {
                if (!line.trim()) continue;
                try {
                    if (line.startsWith('WECREAT_MSG:')) {
                        const msg = JSON.parse(line.slice('WECREAT_MSG:'.length));

                        if (msg.type === 'agent_output' && msg.data) {
                            agentOutput = msg.data.content || '';
                        }
                        if (msg.type === 'result' && msg.data && msg.data.output) {
                            agentOutput = msg.data.output;
                        }
                        if (msg.type === 'error_msg') hasError = true;

                        // 注入 group 信息到 SSE 事件（前端角色映射用）
                        if (msg.data && !msg.data.group) {
                            msg.data.group = agentInfo.group;
                        }

                        sendSSE(msg.type, msg.data);
                        continue;
                    }
                } catch (e) { /* not JSON */ }
                sendSSE('log', { text: `[${realAgentId}] ${line}` });
            }
        });

        child.stderr.on('data', (data) => {
            const text = data.toString().trim();
            if (text) console.error(`[agent:${realAgentId} stderr]`, text);
        });

        child.on('error', (err) => {
            console.error(`[agent:${realAgentId} spawn error]`, err.message);
            clearInterval(checkAbort); // Bug 7 fix: spawn error 可能不触发 close
            resolve({ output: agentOutput, error: `spawn error: ${err.message}` });
        });

        child.on('close', (code, signal) => {
            // V37: 处理 buffer 中残留的最后一行（没有尾部 \n 的情况）
            if (_stdoutBuffer.trim()) {
                const lastLine = _stdoutBuffer.trim();
                _stdoutBuffer = '';
                try {
                    if (lastLine.startsWith('WECREAT_MSG:')) {
                        const msg = JSON.parse(lastLine.slice('WECREAT_MSG:'.length));
                        if (msg.type === 'agent_output' && msg.data) {
                            agentOutput = msg.data.content || '';
                        }
                        if (msg.type === 'result' && msg.data && msg.data.output) {
                            agentOutput = msg.data.output;
                        }
                        if (msg.type === 'error_msg') hasError = true;
                        if (msg.data && !msg.data.group) msg.data.group = agentInfo.group;
                        sendSSE(msg.type, msg.data);
                    }
                } catch (e) {
                    console.warn(`[${realAgentId}] Failed to parse final buffer line (${lastLine.length} chars):`, e.message);
                }
            }

            console.log(`[runSingleAgent:${realAgentId}] close: code=${code}, signal=${signal}, hasError=${hasError}, outputLen=${agentOutput.length}`);
            if (code !== 0 || hasError) {
                resolve({ output: agentOutput, error: `exit code ${code}${signal ? ` (signal: ${signal})` : ''}` });
            } else {
                resolve({ output: agentOutput });
            }
        });

        const checkAbort = setInterval(() => {
            if (isAborted() && !child.killed) {
                child.kill('SIGTERM');
                clearInterval(checkAbort);
            }
        }, 1000);

        child.on('close', () => clearInterval(checkAbort));
    });
}


// ====================================
// API 路由 — 项目管理（不变）
// ====================================

app.post('/api/projects', (req, res) => {
    const projectId = uuidv4().slice(0, 8);
    const projectDir = createProjectDir(projectId);
    const meta = { id: projectId, name: req.body?.name || '新作品', createdAt: Date.now() };
    fs.writeFileSync(path.join(projectDir, '.meta.json'), JSON.stringify(meta));
    res.json({ projectId, path: projectDir });
});

app.get('/api/projects', (req, res) => {
    const projects = [];
    if (fs.existsSync(PROJECTS_DIR)) {
        const dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
        for (const d of dirs) {
            if (!d.isDirectory() || d.name.startsWith('.')) continue;
            const metaPath = path.join(PROJECTS_DIR, d.name, '.meta.json');
            let meta = { id: d.name, name: '未命名', createdAt: 0 };
            if (fs.existsSync(metaPath)) {
              try {
                meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
              } catch {
              }
            }
            const gamejsPath = path.join(PROJECTS_DIR, d.name, 'game.js');
            const hasGame = fs.existsSync(gamejsPath) && fs.statSync(gamejsPath).size > 100;

            // v2: 读取 session state 状态
            const sessionState = readSessionState(path.join(PROJECTS_DIR, d.name));
            // v21: 封面图 thumbnail
            const thumbPath = path.join(PROJECTS_DIR, d.name, 'thumbnail.png');
            const hasThumbnail = fs.existsSync(thumbPath);
            const thumbMtime = hasThumbnail ? fs.statSync(thumbPath).mtimeMs : 0;
            projects.push({
              ...meta,
              hasGame,
              phase : sessionState?.phase || null,
              mode : sessionState?.mode || null,
              thumbnail : hasThumbnail ? `/projects/${d.name}/thumbnail.png?v=${
                                             Math.floor(thumbMtime)}`
                                       : null,
            });
        }
    }
    projects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ projects });
});

app.delete('/api/projects/:id', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    fs.rmSync(projectDir, { recursive: true, force: true });
    res.json({ deleted: true });
});

app.get('/api/projects/:id/chat', validateProjectId('id'), (req, res) => {
    const chatPath = path.join(PROJECTS_DIR, req.params.id, 'chat_history.json');
    if (!fs.existsSync(chatPath)) {
        return res.json({ messages: [] });
    }
    try {
        const data = JSON.parse(fs.readFileSync(chatPath, 'utf-8'));
        res.json(data);
    } catch {
        res.json({ messages: [] });
    }
});

app.put('/api/projects/:id/chat', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const chatPath = path.join(projectDir, 'chat_history.json');
    fs.writeFileSync(chatPath, JSON.stringify(req.body || { messages: [] }));
    res.json({ saved: true });
});

app.patch('/api/projects/:id', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const metaPath = path.join(projectDir, '.meta.json');
    let meta = { id: req.params.id, name: '未命名', createdAt: Date.now() };
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch {
      }
    }
    if (req.body?.name) meta.name = req.body.name;
    fs.writeFileSync(metaPath, JSON.stringify(meta));
    res.json(meta);
});

app.get('/api/projects/:id/files', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    function listFiles(dir, prefix = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let files = [];
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                files = files.concat(listFiles(path.join(dir, entry.name), relPath));
            } else {
                files.push(relPath);
            }
        }
        return files;
    }

    res.json({ files: listFiles(projectDir) });
});

app.get('/api/projects/:id/files/*filepath', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    const filepath = req.params.filepath;
    const fullPath = path.join(projectDir, filepath);

    if (!fullPath.startsWith(projectDir)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ content });
});


// ====================================
// A4: 素材上传到项目目录
// ====================================

// multer 配置：存储到项目目录
const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const projectDir = path.join(PROJECTS_DIR, req.params.id);
        if (!fs.existsSync(projectDir)) {
            return cb(new Error('Project not found'));
        }
        // 图片存到 assets/ 子目录，其他存到项目根目录
        const isImage = file.mimetype.startsWith('image/');
        const destDir = isImage ? path.join(projectDir, 'assets') : projectDir;
        ensureDir(destDir);
        cb(null, destDir);
    },
    filename: (req, file, cb) => {
        // 保持原始文件名，如果重名则加时间戳
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fff]/g, '_');
        const ext = path.extname(safeName);
        const base = path.basename(safeName, ext);
        const destDir = path.join(PROJECTS_DIR, req.params.id, file.mimetype.startsWith('image/') ? 'assets' : '');
        const fullPath = path.join(destDir, safeName);
        if (fs.existsSync(fullPath)) {
            cb(null, `${base}_${Date.now()}${ext}`);
        } else {
            cb(null, safeName);
        }
    },
});
const upload = multer({ storage: uploadStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

app.post('/api/projects/:id/upload', validateProjectId('id'), upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    const isImage = req.file.mimetype.startsWith('image/');
    const relPath = isImage ? `assets/${req.file.filename}` : req.file.filename;
    const url = `/projects/${req.params.id}/${relPath}`;

    console.log(`[A4] Uploaded: ${req.file.filename} → ${relPath} (${(req.file.size / 1024).toFixed(1)}KB)`);

    res.json({
        filename: req.file.filename,
        path: relPath,
        url,
        size: req.file.size,
        mimetype: req.file.mimetype,
    });
});

// ====================================
// V38: 素材管理 API
// ====================================

/** 列出项目所有素材（扫描 assets/ + 项目根的音频文件） */
app.get('/api/projects/:id/assets', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const assetsDir = path.join(projectDir, 'assets');
    const sfxDir = path.join(projectDir, 'sfx');
    const assets = [];

    const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a'];

    // 读取 asset-manifest.json（如果存在）
    let manifest = {};
    const manifestPath = path.join(assetsDir, 'asset-manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        manifest =
            JSON.parse(fs.readFileSync(manifestPath, 'utf-8')).assets || {};
      } catch (e) {
      }
    }

    // Read all code files (html/js/css) to detect asset references
    let codeContent = '';
    const codeExts = [ '.html', '.js', '.css', '.json' ];
    try {
      const rootFiles = fs.readdirSync(projectDir);
      for (const cf of rootFiles) {
        const ext = path.extname(cf).toLowerCase();
        if (!codeExts.includes(ext))
          continue;
        const cfPath = path.join(projectDir, cf);
        try {
          const stat = fs.statSync(cfPath);
          if (stat.isFile() && stat.size < 5 * 1024 * 1024) {
            codeContent += fs.readFileSync(cfPath, 'utf-8') + '\n';
          }
        } catch (e) {
        }
      }
    } catch (e) {
    }
    // Keep backward-compatible variable name
    const indexContent = codeContent;

    // 扫描函数
    const scanDir = (dir, prefix) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const f of files) {
            if (f.startsWith('.') || f === 'asset-manifest.json') continue;
            const fullPath = path.join(dir, f);
            const stat = fs.statSync(fullPath);
            if (!stat.isFile()) continue;

            const ext = path.extname(f).toLowerCase();
            const isImage = imageExts.includes(ext);
            const isAudio = audioExts.includes(ext);
            if (!isImage && !isAudio) continue;

            const relPath = prefix + f;
            // 检测引用：精确匹配完整路径/文件名 + 模糊匹配基础名（覆盖模板字符串动态拼接场景）
            const baseName = path.basename(f, ext); // e.g. "fruit_apple" from "fruit_apple.png"
            const usedInCode = indexContent.includes(relPath)
                || indexContent.includes(f)
                || indexContent.includes(baseName)
                || (baseName.endsWith('_nobg') && indexContent.includes(baseName.replace('_nobg', '')));
            const manifestInfo = manifest[f] || {};

            const asset = {
              filename : f,
              path : relPath,
              type : isImage ? 'image' : 'audio',
              size : stat.size,
              createdAt : stat.birthtime || stat.mtime,
              usedInCode,
              prompt : manifestInfo.prompt || null,
              url : `/projects/${req.params.id}/${relPath}`,
            };

            assets.push(asset);
        }
    };

    scanDir(assetsDir, 'assets/');
    scanDir(sfxDir, 'sfx/');

    // 也扫描项目根目录的音频/图片文件
    const rootFiles = fs.readdirSync(projectDir);
    for (const f of rootFiles) {
        if (f.startsWith('.')) continue;
        const ext = path.extname(f).toLowerCase();
        const isAudio = audioExts.includes(ext);
        const isImage = imageExts.includes(ext);
        if (!isAudio && !isImage) continue;
        const fullPath = path.join(projectDir, f);
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) continue;
        const usedInCode = (() => {
            const baseName = path.basename(f, ext);
            return indexContent.includes(f)
                || indexContent.includes(baseName)
                || (baseName.endsWith('_nobg') && indexContent.includes(baseName.replace('_nobg', '')));
        })();
        assets.push({
          filename : f,
          path : f,
          type : isImage ? 'image' : 'audio',
          size : stat.size,
          createdAt : stat.birthtime || stat.mtime,
          usedInCode,
          prompt : null,
          url : `/projects/${req.params.id}/${f}`,
        });
    }

    // 按类型+名称排序
    assets.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'image' ? -1 : 1;
        return a.filename.localeCompare(b.filename);
    });

    const totalSize = assets.reduce((s, a) => s + a.size, 0);
    const usedCount = assets.filter(a => a.usedInCode).length;
    const unusedCount = assets.length - usedCount;

    res.json({ assets, totalSize, usedCount, unusedCount });
});

/** 删除素材 */
app.delete('/api/projects/:id/assets/:filename', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    const filename = req.params.filename;
    // 搜索文件位置
    const searchDirs = ['assets', 'sfx', ''];
    let found = false;
    for (const sub of searchDirs) {
        const fp = path.join(projectDir, sub, filename);
        if (fs.existsSync(fp)) {
            fs.unlinkSync(fp);
            console.log(`[V38] Deleted asset: ${sub ? sub + '/' : ''}${filename}`);
            found = true;
            break;
        }
    }
    if (!found) return res.status(404).json({ error: 'Asset not found' });
    res.json({ deleted: true });
});

/** 重命名素材 */
app.put('/api/projects/:id/assets/:filename', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    const filename = req.params.filename;
    const { newName } = req.body || {};
    if (!newName) return res.status(400).json({ error: 'newName is required' });

    const searchDirs = ['assets', 'sfx', ''];
    let found = false;
    for (const sub of searchDirs) {
        const fp = path.join(projectDir, sub, filename);
        if (fs.existsSync(fp)) {
            const newPath = path.join(projectDir, sub, newName);
            fs.renameSync(fp, newPath);

            // 更新 index.html 中的引用
            const indexPath = path.join(projectDir, 'index.html');
            if (fs.existsSync(indexPath)) {
                let html = fs.readFileSync(indexPath, 'utf-8');
                const oldRef = sub ? `${sub}/${filename}` : filename;
                const newRef = sub ? `${sub}/${newName}` : newName;
                if (html.includes(oldRef)) {
                    html = html.split(oldRef).join(newRef);
                    fs.writeFileSync(indexPath, html);
                    console.log(`[V38] Updated references: ${oldRef} → ${newRef}`);
                }
            }

            console.log(`[V38] Renamed: ${filename} → ${newName}`);
            found = true;
            break;
        }
    }
    if (!found) return res.status(404).json({ error: 'Asset not found' });
    res.json({ renamed: true, newName });
});

// v21: 保存项目封面截图（前端从 canvas 抓取后 POST base64）
app.post('/api/projects/:id/thumbnail', validateProjectId('id'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const { dataUrl } = req.body || {};
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid dataUrl' });
    }
    try {
        // 去掉 data:image/png;base64, 前缀
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const thumbPath = path.join(projectDir, 'thumbnail.png');
        fs.writeFileSync(thumbPath, buffer);
        console.log(`[v21] Thumbnail saved: ${req.params.id} (${(buffer.length / 1024).toFixed(1)}KB)`);
        res.json(
            {saved : true, url : `/projects/${req.params.id}/thumbnail.png`});
    } catch (e) {
        console.error('[v21] Thumbnail save error:', e);
        res.status(500).json({ error: 'Failed to save thumbnail' });
    }
});


// ====================================
// A2: 图片生成 API（iChat Gemini）
// ====================================

app.post('/api/projects/:id/generate-image', validateProjectId('id'), async (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const { prompt, mode = 'text_to_image', reference_images = [] } = req.body || {};
    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    const assetsDir = path.join(projectDir, 'assets');
    ensureDir(assetsDir);

    // 生成输出文件名
    const timestamp = Date.now();
    const outputBase = path.join(assetsDir, `generated_${timestamp}`);

    // 构建 Python 脚本参数
    const scriptPath = path.join(__dirname, 'scripts', 'image_generator.py');
    if (!fs.existsSync(scriptPath)) {
        return res.status(500).json({ error: 'image_generator.py not found in server/scripts/' });
    }

    const args = [
        scriptPath,
        '--mode', mode,
        '--prompt', prompt,
        '--output', outputBase,
    ];

    // 如果有参考图片（base64 → 临时文件）
    const tempFiles = [];
    if (reference_images.length > 0) {
        args.push('--reference_image_path');
        for (let i = 0; i < reference_images.length; i++) {
            const imgData = reference_images[i];
            if (imgData.startsWith('data:')) {
                // base64 数据，写临时文件
                const match = imgData.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                    const ext = match[1].split('/')[1] || 'png';
                    const tmpPath = path.join(assetsDir, `_tmp_ref_${i}.${ext}`);
                    fs.writeFileSync(tmpPath, Buffer.from(match[2], 'base64'));
                    args.push(tmpPath);
                    tempFiles.push(tmpPath);
                }
            } else {
                args.push(imgData); // 已经是路径
            }
        }
    }

    console.log(`[A2] Generating image: "${prompt.slice(0, 60)}..." mode=${mode}`);

    try {
        const result = await new Promise((resolve, reject) => {
            const child = spawn('python3', args, {
                env: {
                    ...process.env,
                    ICHAT_APPID: process.env.ICHAT_APPID || '',
                    ICHAT_APPKEY: process.env.ICHAT_APPKEY || '',
                },
                cwd: projectDir,
                timeout: 180000,
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => { stdout += data.toString(); });
            child.stderr.on('data', (data) => { stderr += data.toString(); });

            child.on('close', (code) => {
                if (code === 0) {
                    // 解析 [SUCCESS] 行获取输出路径
                    // 优先匹配"输出文件:"行（干净路径），fallback 到"保存到:"行（去掉 bytes 后缀）
                    const cleanMatch = stdout.match(/\[SUCCESS\].*?输出文件:\s*(.+)/);
                    const fallbackMatch = stdout.match(/\[SUCCESS\].*?保存到:\s*(.+?)(?:\s*\([\d,]+ bytes\))?$/m);
                    const rawMatch = stdout.match(/\[SUCCESS\].*?:\s*(.+)/);
                    const outputPath = (cleanMatch ? cleanMatch[1] : fallbackMatch ? fallbackMatch[1] : rawMatch ? rawMatch[1].replace(/\s*\([\d,]+ bytes\)\s*$/, '') : null)?.trim() || null;
                    resolve({ stdout, stderr, outputPath });
                } else {
                    reject(new Error(`image_generator.py exited with code ${code}: ${stderr || stdout}`));
                }
            });

            child.on('error', (err) => reject(err));
        });

        // 清理临时文件
        for (const tmp of tempFiles) {
          try {
            fs.unlinkSync(tmp);
          } catch {
          }
        }

        if (result.outputPath && fs.existsSync(result.outputPath)) {
            const filename = path.basename(result.outputPath);
            const relPath = `assets/${filename}`;
            const url = `/projects/${req.params.id}/${relPath}`;
            const stat = fs.statSync(result.outputPath);

            console.log(`[A2] Generated: ${filename} (${(stat.size / 1024).toFixed(1)}KB)`);

            res.json({
                filename,
                path: relPath,
                url,
                size: stat.size,
            });
        } else {
            res.status(500).json({ error: 'Image generation succeeded but output file not found', detail: result.stdout });
        }

    } catch (err) {
        // 清理临时文件
        for (const tmp of tempFiles) {
          try {
            fs.unlinkSync(tmp);
          } catch {
          }
        }
        console.error('[A2] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// ====================================
// 单 Agent 生成（向后兼容 v1）
// ====================================

app.get('/api/generate/:projectId', validateProjectId('projectId'), (req, res) => {
    const { projectId } = req.params;
    const prompt = req.query.prompt;
    const model = req.query.model || null; // null = 使用 Agent 默认模型
    const agentId = req.query.agentId || 'prototyper';
    const providerGen = req.query.provider || 'claude'; // V38: 模型 provider

    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    function sendSSE(event, data) {
        if (!res.writableEnded) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }

    const realAgentId = resolveAgentId(agentId);
    const agentInfo = AGENT_REGISTRY[realAgentId] || {};
    sendSSE('status', { phase: 'starting', message: `正在启动 ${agentInfo.name || agentId} Agent...` });

    const fullPrompt = buildAgentPrompt(realAgentId, prompt, projectDir);

    let aborted = false;
    res.on('close', () => { aborted = true; });

    runSingleAgent(realAgentId, fullPrompt, projectDir, model, sendSSE, () => aborted, providerGen)
        .then((result) => {
            if (!result.error) {
                sendSSE('status', { phase: 'completed', message: '生成完成！' });
            }
            sendSSE('done', {});
            res.end();
        })
        .catch((err) => {
            sendSSE('error_msg', { message: `Agent 错误: ${err.message}` });
            sendSSE('done', {});
            res.end();
        });
});


// ====================================
// Quick Mode 编排（v1 向后兼容 + v2 增强）
// ====================================

/**
 * 从 coordinator 输出中解析 ---ORCHESTRATION--- 之后的 JSON
 */
function parseCoordinatorOutput(rawOutput) {
    const separator = '---ORCHESTRATION---';
    const sepIdx = rawOutput.indexOf(separator);

    let userMessage = rawOutput;
    let orchestration = null;

    if (sepIdx !== -1) {
        userMessage = rawOutput.slice(0, sepIdx).trim();
        const jsonPart = rawOutput.slice(sepIdx + separator.length).trim();

        const jsonMatch = jsonPart.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, jsonPart];
        const jsonStr = (jsonMatch[1] || jsonPart).trim();

        try {
            orchestration = JSON.parse(jsonStr);
        } catch (e) {
            console.warn('[orchestrate] Full JSON parse failed:', e.message);

            // 降级：正则提取关键字段
            try {
                const agentsMatch = jsonStr.match(/"agents_needed"\s*:\s*\[(.*?)\]/s);
                if (agentsMatch) {
                    const agentsList = agentsMatch[1].match(/"([\w-]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
                    orchestration = { agents_needed: agentsList };

                    const nameMatch = jsonStr.match(/"game_name"\s*:\s*"([^"]+)"/);
                    if (nameMatch) orchestration.game_name = nameMatch[1];

                    const typeMatch = jsonStr.match(/"game_type"\s*:\s*"([^"]+)"/);
                    if (typeMatch) orchestration.game_type = typeMatch[1];

                    const projectTypeMatch = jsonStr.match(/"project_type"\s*:\s*"([^"]+)"/);
                    if (projectTypeMatch) orchestration.project_type = projectTypeMatch[1];

                    const phaseMatch = jsonStr.match(/"phase"\s*:\s*"([^"]+)"/);
                    if (phaseMatch) orchestration.phase = phaseMatch[1];

                    const skipMatch = jsonStr.match(/"skip_reason"\s*:\s*\{([\s\S]*?)\}(?=\s*[,}])/);
                    if (skipMatch) {
                        const skipObj = {};
                        const reasonMatches = skipMatch[1].matchAll(/"([\w-]+)"\s*:\s*"([^"]+)"/g);
                        for (const m of reasonMatches) {
                            skipObj[m[1]] = m[2];
                        }
                        orchestration.skip_reason = skipObj;
                    }

                    const briefMatch = jsonStr.match(/"engineer_brief"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                    if (briefMatch) {
                        orchestration.engineer_brief = briefMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    }

                    const tasksMatch = jsonStr.match(/"agent_tasks"\s*:\s*\{([\s\S]*?)\}(?=\s*[,}])/);
                    if (tasksMatch) {
                        const tasksObj = {};
                        const taskMatches = tasksMatch[1].matchAll(/"([\w-]+)"\s*:\s*"([^"]+)"/g);
                        for (const m of taskMatches) {
                            tasksObj[m[1]] = m[2];
                        }
                        orchestration.agent_tasks = tasksObj;
                    }

                    // v2: 提取 agent_dependencies
                    const depsMatch = jsonStr.match(/"agent_dependencies"\s*:\s*\{([\s\S]*?)\}(?=\s*[,}])/);
                    if (depsMatch) {
                        try {
                            orchestration.agent_dependencies = JSON.parse(`{${depsMatch[1]}}`);
                        } catch {
                        }
                    }

                    console.log('[orchestrate] Regex fallback succeeded:', JSON.stringify(orchestration.agents_needed));
                } else {
                    console.warn('[orchestrate] Regex fallback also failed');
                }
            } catch (e2) {
                console.warn('[orchestrate] Regex fallback error:', e2.message);
            }
        }
    }

    return { userMessage, orchestration };
}

/**
 * GET /api/orchestrate/:projectId
 * SSE 端点：Quick Mode 多 Agent 编排（v1 兼容 + v2 增强）
 */
app.get('/api/orchestrate/:projectId', validateProjectId('projectId'), (req, res) => {
    const { projectId } = req.params;
    const userPrompt = req.query.prompt;
    const modelOverride = req.query.model === 'claude-opus-4-6' ? req.query.model : null; // 全 opus override
    const provider = req.query.provider || 'claude'; // V38: 模型 provider 选择

    if (!userPrompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    function sendSSE(event, data) {
        if (!res.writableEnded) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }

    let aborted = false;
    res.on('close', () => { aborted = true; });

    const taskId = `orchestrate-${projectId}-${Date.now()}`;
    activeTasks.set(taskId, { projectId, startTime: Date.now(), abort: () => { aborted = true; } });

    // 发送 Agent 注册表（前端用于角色映射）
    sendSSE('agent_registry', {
      agents : Object.fromEntries(
          Object.entries(AGENT_REGISTRY).map(([ id, info ]) => [id, {
                                               name : info.name,
                                               emoji : info.emoji,
                                               group : info.group
                                             }])),
      groupMap : AGENT_GROUP_MAP,
    });

    sendSSE('status', { phase: 'starting', message: '🎬 多 Agent 编排启动...' });

    runQuickModeOrchestration(projectId, projectDir, userPrompt, modelOverride, sendSSE, () => aborted, provider)
        .then(() => {
            activeTasks.delete(taskId);
            sendSSE('done', {});
            res.end();
        })
        .catch((err) => {
            activeTasks.delete(taskId);
            console.error('[orchestrate] Fatal error:', err);
            sendSSE('error_msg', { message: `编排错误: ${err.message}` });
            sendSSE('done', {});
            res.end();
        });
});

/**
 * POST /api/orchestrate/:projectId/confirm
 * V4 Checkpoint: 前端确认/调整信号
 * body: { action: 'proceed' | 'adjust' }
 */
app.post('/api/orchestrate/:projectId/confirm', (req, res) => {
    const { projectId } = req.params;
    const { action } = req.body || {};
    console.log(`[checkpoint] Received confirm: projectId=${projectId}, action=${action}`);

    const signal = checkpointSignals.get(projectId);
    if (signal && signal.resolve) {
        signal.resolve(action || 'proceed');
        checkpointSignals.delete(projectId);
        res.json({ ok: true, action });
    } else {
        // 没有等待中的 checkpoint（可能已超时或已确认）
        res.json({ ok: true, action, note: 'no pending checkpoint' });
    }
});

// ====================================
// V4: 意图分类器（Layer 1 — haiku 快速路由）
// ====================================

/**
 * 用 haiku 模型快速分类用户意图（1-2秒）
 * 
 * 四档意图：
 * - tweak:   微调（改颜色/改大小/调位置/改文案/改样式）→ 跳过 coordinator，直接 prototyper
 * - bugfix:  修 bug（报错/不工作/显示异常/逻辑错误）→ 跳过 coordinator，prototyper + 错误日志
 * - feature: 添加功能（新增一个XX/加上XX功能）→ coordinator(sonnet) 出 brief → prototyper
 * - new_game: 全新项目（做一个XX游戏/创建新游戏）→ 完整编排流程
 * 
 * @returns {{ intent: string, confidence: number, reason: string }}
 */
async function classifyIntent(userPrompt, projectDir, sendSSE, isAborted, provider) {
    const hasExistingCode = (() => {
        const fileList = getProjectFileList(projectDir);
        return fileList.some(
            f => (f.startsWith('game.js') || f.startsWith('index.html')) &&
                 !f.includes('0.0KB') && !f.includes('0.1KB'));
    })();

    // 如果没有现有代码，一定是 new_game
    if (!hasExistingCode) {
        return { intent: 'new_game', confidence: 1.0, reason: '项目无代码，视为全新项目' };
    }

    const classifyPrompt = `你是一个意图分类器。判断用户对一个**已有代码的游戏项目**的请求属于哪个类别：

## 分类标准

1. **tweak** — 微小调整，不改变功能逻辑
   - 改颜色、改大小、调位置、改文案、改字体、改间距、改透明度
   - 替换图片、换背景、调速度参数
   - 示例：「把按钮颜色改成红色」「标题字体大一点」「背景换成蓝色」

2. **bugfix** — 修复 bug 或异常
   - 报错、崩溃、白屏、不显示、点击无反应
   - 逻辑错误（得分不对、碰撞检测失灵、无法过关）
   - 示例：「游戏打开白屏」「点击开始没反应」「分数算错了」

3. **feature** — 添加新功能或扩展（在现有游戏基础上改进）
   - 新增一个系统/模块（排行榜、商店、新关卡）
   - 增加音效、增加动画效果、增加新玩法
   - **关键判断**：feature 是对现有游戏的增量改进，不改变游戏类型
   - 示例：「加一个排行榜」「增加背景音乐」「添加双人模式」

4. **new_game** — 想做一个新游戏（全新的游戏创意/设计）
   - 用户描述了一个游戏概念、主题、玩法创意
   - 即使项目已有代码，只要用户想的是一个全新游戏，就是 new_game
   - **关键判断**：涉及"做/创建/设计一个XX游戏"、描述完整的游戏创意和玩法
   - 示例：「做一个贪吃蛇游戏」「我想做一个老鹰捉小鸡的游戏」「帮我创建一个跑酷游戏」「做一个消除类游戏，玩法是...」「你有什么好的游戏想法和建议」

## 输出格式

严格输出一行 JSON，不要输出其他任何内容：
{"intent":"tweak|bugfix|feature|new_game","confidence":0.0-1.0,"reason":"一句话理由"}

## 用户请求

${userPrompt}`;

    try {
        const result = await new Promise((resolve) => {
            let output = '';
            const pythonScript = path.join(__dirname, 'agent_runner.py');
            const child = spawn('python3', [pythonScript], {
                env: {
                    ...process.env,
                    WECREAT_PROMPT: classifyPrompt,
                    WECREAT_CWD: projectDir,
                    WECREAT_MODEL: (provider === 'glm') ? GLM_MODEL : MODEL_MAP.haiku,
                    WECREAT_AGENT_ID: 'intent-classifier',
                    WECREAT_AGENT_ROLE: 'classifier',
                    // V41: codebuddy provider 的分类器仍走 Adams claude haiku（快速分类不需要 agentic SDK）
                    WECREAT_MODEL_PROVIDER: (provider === 'codebuddy') ? 'claude' : (provider || 'claude'),
                    ADAMS_API_BASE: getApiBaseByProvider((provider === 'codebuddy') ? 'claude' : provider),
                    ADAMS_BUSINESS: process.env.ADAMS_BUSINESS || '',
                    ADAMS_USER: process.env.ADAMS_USER || '',
                    ADAMS_TOKEN: process.env.ADAMS_TOKEN || '',
                },
                cwd: projectDir,
                timeout: 30000, // 30秒超时（haiku 通常 1-3 秒）
            });

            child.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('WECREAT_MSG:')) {
                        try {
                            const msg = JSON.parse(line.slice('WECREAT_MSG:'.length));
                            if (msg.type === 'agent_output' && msg.data?.content) {
                                output = msg.data.content;
                            }
                            if (msg.type === 'result' && msg.data?.output) {
                                output = msg.data.output;
                            }
                        } catch { /* ignore */ }
                    }
                }
            });

            child.stderr.on('data', () => {}); // 静默 stderr

            child.on('close', (code) => {
                resolve(output);
            });

            child.on('error', () => {
                resolve('');
            });

            // abort 检查
            const checkAbort = setInterval(() => {
                if (isAborted() && !child.killed) {
                    child.kill('SIGTERM');
                    clearInterval(checkAbort);
                }
            }, 500);
            child.on('close', () => clearInterval(checkAbort));
        });

        if (!result) {
            // V36: 分类器无输出时，根据用户消息关键词判断意图
            const newGameKeywords = /做一个|创建一个|设计一个|帮我做|想做|开发一个|做个|来个|搞一个|弄一个|新游戏|游戏.*想法|游戏.*建议|游戏.*创意/;
            if (newGameKeywords.test(userPrompt)) {
                console.warn('[classifyIntent] No output, keyword match → new_game');
                return { intent: 'new_game', confidence: 0.7, reason: '分类器无输出，关键词匹配为新游戏需求' };
            }
            return { intent: 'feature', confidence: 0.5, reason: '分类器无输出，降级为 feature' };
        }

        // 从输出中提取 JSON
        const jsonMatch = result.match(/\{[^}]*"intent"\s*:\s*"[^"]+"/);
        if (jsonMatch) {
            // 尝试找完整的 JSON 对象
            const startIdx = result.indexOf(jsonMatch[0]);
            let braceCount = 0;
            let endIdx = startIdx;
            for (let i = startIdx; i < result.length; i++) {
                if (result[i] === '{') braceCount++;
                if (result[i] === '}') braceCount--;
                if (braceCount === 0) { endIdx = i + 1; break; }
            }
            const jsonStr = result.slice(startIdx, endIdx);
            try {
                const parsed = JSON.parse(jsonStr);
                const validIntents = ['tweak', 'bugfix', 'feature', 'new_game'];
                if (validIntents.includes(parsed.intent)) {
                    console.log(`[classify] intent=${parsed.intent} confidence=${parsed.confidence} reason=${parsed.reason}`);
                    return parsed;
                }
            } catch { /* fall through */ }
        }

        // 降级
        return { intent: 'feature', confidence: 0.5, reason: '分类器输出无法解析，降级为 feature' };

    } catch (err) {
        console.warn('[classify] Error:', err.message);
        return { intent: 'feature', confidence: 0.5, reason: `分类器异常: ${err.message}` };
    }
}

/**
 * Quick Mode 快速路由（tweak/bugfix 跳过 coordinator，直接调 prototyper）
 * 省掉 coordinator 的 opus 调用（~15-30秒）→ 直接编码（~20秒）
 */
async function runFastRoute(projectId, projectDir, userPrompt, intent, modelOverride, sendSSE, isAborted, provider) {
    const agentOutputs = {};

    // 初始化 Session State
    let sessionState = readSessionState(projectDir) || createSessionState(projectId);
    sessionState.mode = 'quick';
    sessionState.updatedAt = Date.now();
    writeSessionState(projectDir, sessionState);

    // 发送简化的编排方案（只有 prototyper）
    sendSSE('orchestrate_plan', {
        agents_needed: ['prototyper'],
        agent_tasks: { prototyper: intent.reason || userPrompt.slice(0, 100) },
        agent_dependencies: {},
        game_name: '',
        game_type: '',
        project_type: sessionState.projectType || 'html5',
        phase: 'production',
        fast_route: true,
        intent: intent.intent,
    });

    // 对于 tweak 用 sonnet，bugfix 也用 sonnet（准确性重要）
    const fastModelMap = (provider === 'glm') ? GLM_MODEL_MAP : MODEL_MAP;
    const coderModel = modelOverride || fastModelMap.sonnet;

    // 构建增强的 prototyper prompt
    let enhancedPrompt = userPrompt;
    if (intent.intent === 'bugfix') {
        enhancedPrompt = `[Bug 修复模式] ${userPrompt}\n\n请仔细分析代码，找到 bug 的根因并修复。只修改有问题的部分，不要重写整个文件。`;
    } else if (intent.intent === 'tweak') {
        enhancedPrompt = `[微调模式] ${userPrompt}\n\n这是一个简单的调整请求，请精准修改对应的代码，最小化改动范围。`;
    }

    sendSSE('orchestrate_phase', {
        phase: 'engineer',
        message: `🚀 快速路由 → 直接编码${intent.intent === 'bugfix' ? '（修 bug 模式）' : '（微调模式）'}`,
        agents: ['prototyper'],
    });

    const coderPrompt = buildAgentPrompt('prototyper', enhancedPrompt, projectDir, agentOutputs);
    const coderResult = await runSingleAgent('prototyper', coderPrompt, projectDir, coderModel, sendSSE, isAborted, provider);

    if (isAborted()) return;

    if (coderResult.error) {
        sendSSE('error_msg', { message: `工程师失败: ${coderResult.error}` });
        return;
    }

    agentOutputs.prototyper = coderResult.output;
    sessionState.orchestration.completedAgents.push('prototyper');

    // 统计生成的文件
    const generatedFiles = [];
    try {
        const walkForFiles = (dir, prefix = '') => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
                const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
                if (entry.isDirectory()) {
                    walkForFiles(path.join(dir, entry.name), relPath);
                } else if (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.css')) {
                    const stat = fs.statSync(path.join(dir, entry.name));
                    if (stat.size > 100) generatedFiles.push(relPath);
                }
            }
        };
        walkForFiles(projectDir);
    } catch { /* ignore */ }

    const fileList = generatedFiles.length > 0 ? generatedFiles.join(', ') : 'index.html';
    sendSSE('agent_summary', { agentId: 'prototyper', summary: `✅ 快速${intent.intent === 'bugfix' ? '修复' : '调整'}完成！修改文件：${fileList}`, group: '工程师' });

    // 编排完成
    sendSSE('orchestrate_phase', { phase: 'done', message: `✅ 快速${intent.intent === 'bugfix' ? '修复' : '调整'}完成！`, agents: ['prototyper'] });
    sendSSE('status', { phase: 'completed', message: `快速${intent.intent === 'bugfix' ? '修复' : '调整'}完成！` });

    // 更新 Session State
    addDecision(sessionState, 'system', `Fast route (${intent.intent}): ${fileList}`);
    writeSessionState(projectDir, sessionState);
}


/**
 * Quick Mode 编排流程 v4
 * 
 * V4 改进：
 * 1. Layer 1: haiku 意图分类器（1-2s 快速判断）
 * 2. tweak/bugfix → 快速路由（跳过 coordinator）
 * 3. feature → coordinator(sonnet 降级) 出 brief → prototyper
 * 4. new_game → 完整编排流程（coordinator + planner + coder）
 * 5. 拓扑排序分批并行执行
 * 6. Session State 记录
 */
async function runQuickModeOrchestration(projectId, projectDir, userPrompt, modelOverride, sendSSE, isAborted, provider) {
    const agentOutputs = {};

    // 初始化/更新 Session State
    let sessionState = readSessionState(projectDir) || createSessionState(projectId);
    sessionState.mode = 'quick';
    sessionState.updatedAt = Date.now();
    writeSessionState(projectDir, sessionState);

    // ============================
    // V4 Layer 1: 意图分类（haiku，1-2秒）
    // ============================
    sendSSE('orchestrate_phase', { phase: 'classifying', message: '⚡ 正在判断请求类型...' });
    sendSSE('intent_classifying', { status: 'start' });

    const intent = await classifyIntent(userPrompt, projectDir, sendSSE, isAborted, provider);
    if (isAborted()) return;

    console.log(`[orchestrate] V4 intent: ${intent.intent} (confidence=${intent.confidence})`);
    sendSSE('intent_classified', { intent: intent.intent, confidence: intent.confidence, reason: intent.reason });

    // V4 快速路由：tweak/bugfix 跳过 coordinator，直接调 prototyper
    if ((intent.intent === 'tweak' || intent.intent === 'bugfix') && intent.confidence >= 0.7) {
        console.log(`[orchestrate] Fast route → ${intent.intent}, skipping coordinator`);
        addDecision(sessionState, 'intent-classifier', `快速路由: ${intent.intent} — ${intent.reason}`);
        writeSessionState(projectDir, sessionState);
        return runFastRoute(projectId, projectDir, userPrompt, intent, modelOverride, sendSSE, isAborted, provider);
    }

    // V4: feature 用 sonnet 降级 coordinator（不用 opus，省时间）
    const effectiveModelMap = (provider === 'glm') ? GLM_MODEL_MAP : MODEL_MAP;
    const coordinatorModel = (intent.intent === 'feature') ? effectiveModelMap.sonnet : effectiveModelMap.opus;

    // ============================
    // Phase 1: Coordinator 分析需求
    // ============================
    sendSSE('orchestrate_phase', { phase: 'coordinator', message: '🤖 小助手正在分析需求...' });

    const coordinatorPrompt = buildAgentPrompt('coordinator', userPrompt, projectDir);
    // V4: feature 用 sonnet，new_game 用 opus
    const coordinatorResult = await runSingleAgent('coordinator', coordinatorPrompt, projectDir, coordinatorModel, sendSSE, isAborted, provider);

    if (isAborted()) return;
    if (coordinatorResult.error) {
        sendSSE('error_msg', { message: `小助手失败: ${coordinatorResult.error}` });
        return;
    }

    let { userMessage, orchestration } = parseCoordinatorOutput(coordinatorResult.output);
    agentOutputs.coordinator = coordinatorResult.output;

    if (userMessage) {
        console.log(`[orchestrate] coordinator userMessage: ${userMessage.slice(0, 100)}...`);
    }

    // 更新 Session State
    sessionState.orchestration.completedAgents.push('coordinator');
    sessionState.orchestration.agentOutputs.coordinator = coordinatorResult.output.slice(0, 1000);
    if (orchestration?.project_type) {
        sessionState.projectType = orchestration.project_type;
    }
    if (orchestration?.phase) {
        sessionState.phase = orchestration.phase;
    }
    addDecision(sessionState, 'coordinator', `分析完成，需要 Agent: ${orchestration?.agents_needed?.join(', ') || '仅工程师'}`);
    writeSessionState(projectDir, sessionState);

    // ============================
    // Phase 2: 按 coordinator 编排执行 Agent
    // ============================

    if (!orchestration || !orchestration.agents_needed) {
        // 降级：根据意图决定分配哪些 Agent
        if (intent.intent === 'new_game') {
            // 新游戏需求：至少分配策划+美术+工程师
            console.warn('[orchestrate] No orchestration for new_game, using default team');
            const defaultAgents = ['game-designer', 'art-director', 'prototyper'];
            // V36: 构造临时 orchestration 让后续执行逻辑也能使用
            orchestration = {
                agents_needed: defaultAgents,
                agent_tasks: {
                    'game-designer': '设计核心玩法和游戏系统',
                    'art-director': '制定美术风格和素材规格',
                    'prototyper': '实现游戏原型',
                },
                phase: 'brainstorm',
            };
            sendSSE('orchestrate_plan', {
                ...orchestration,
                game_name: '',
                game_type: '',
                checkpoint: true,
                intent: intent.intent,
            });
        } else {
            console.warn('[orchestrate] No orchestration, falling back to coder only');
            orchestration = { agents_needed: ['prototyper'], agent_tasks: {} };
            sendSSE('orchestrate_plan', { agents_needed: ['prototyper'], agent_tasks: {}, game_name: '', game_type: '' });
        }
    } else {
        // V4: feature/new_game 添加 checkpoint 标记（前端可显示确认卡片）
        const needsCheckpoint = (intent.intent === 'feature' || intent.intent === 'new_game');

        // 发送编排方案
        sendSSE('orchestrate_plan', {
            agents_needed: orchestration.agents_needed,
            agent_tasks: orchestration.agent_tasks || {},
            agent_dependencies: orchestration.agent_dependencies || {},
            game_name: orchestration.game_name || '',
            game_type: orchestration.game_type || '',
            project_type: orchestration.project_type || 'html5',
            phase: orchestration.phase || 'production',
            checkpoint: needsCheckpoint, // V4: 标记需要用户检查
            intent: intent.intent,
        });

        // V4: Checkpoint 暂停——等待前端确认后再继续执行
        if (needsCheckpoint) {
            console.log(`[checkpoint] Waiting for user confirmation (projectId=${projectId})...`);
            sendSSE('checkpoint_waiting', { message: '等待确认方案...' });

            const checkpointAction = await new Promise((resolve) => {
                // 存入信号量 Map，等前端 POST /confirm 触发
                checkpointSignals.set(projectId, { resolve });

                // 超时 120 秒自动继续（防止用户走开导致永远卡住）
                setTimeout(() => {
                    if (checkpointSignals.has(projectId)) {
                        console.log(`[checkpoint] Timeout, auto-proceeding (projectId=${projectId})`);
                        checkpointSignals.delete(projectId);
                        resolve('proceed');
                    }
                }, 120000);
            });

            if (isAborted()) return;

            if (checkpointAction === 'adjust') {
                // 用户选择调整——停止当前编排，等用户发新消息
                console.log(`[checkpoint] User chose to adjust, aborting current orchestration`);
                sendSSE('checkpoint_result', { action: 'adjust', message: '用户选择调整方案' });
                sendSSE('done', {});
                return; // 终止编排，等用户重新发消息
            }

            console.log(`[checkpoint] User confirmed, proceeding with orchestration`);
            sendSSE('checkpoint_result', { action: 'proceed', message: '方案已确认，开始执行' });
        }
    }

    if (isAborted()) return;

    // 提取 planner 和 coder Agent 列表
    const agentsNeeded = orchestration?.agents_needed || ['prototyper'];
    const dependencies = orchestration?.agent_dependencies || {};

    // 分离 coder 和非 coder Agent
    const plannerAgents = agentsNeeded.filter(a => {
        const info = AGENT_REGISTRY[a];
        return info && info.role !== 'coder';
    });
    const coderAgents = agentsNeeded.filter(a => {
        const info = AGENT_REGISTRY[a];
        return info && info.role === 'coder';
    });

    // 如果 agentsNeeded 包含旧的 'artist'/'sound'/'engineer'，映射到新 ID
    let mappedPlanners = [];
    const mappedCoders = [];
    for (const a of agentsNeeded) {
        const real = resolveAgentId(a);
        const info = AGENT_REGISTRY[real];
        if (!info) continue;
        if (info.role === 'coder') {
            if (!mappedCoders.includes(real)) mappedCoders.push(real);
        } else {
            if (!mappedPlanners.includes(real)) mappedPlanners.push(real);
        }
    }

    // V4 Phase B: feature 意图下，裁剪 planner 列表
    // 只保留 art-director / technical-artist（美术需求）和 sound-designer / audio-director（音效需求）
    // 砍掉策划组（creative-director、game-designer、systems-designer 等）——feature 不需要全套策划
    // V35 修正：如果 coordinator 明确分配了策划 agent 或 phase=brainstorm，说明是新游戏需求，不裁剪
    // V36 增强：如果 coordinator 的 agents_needed 明确包含策划 agent，也不裁剪（尊重 coordinator 判断）
    const isBrainstormPhase = orchestration?.phase === 'brainstorm';
    const plannerGroupAgents = new Set(['creative-director', 'game-designer', 'systems-designer', 'level-designer', 'narrative-director', 'economy-designer']);
    const coordinatorAssignedPlanner = (orchestration?.agents_needed || []).some(a => plannerGroupAgents.has(a));
    if (intent.intent === 'feature' && !isBrainstormPhase && !coordinatorAssignedPlanner) {
        const keepGroups = new Set(['美术', '音效']); // 只保留美术和音效
        const trimmedPlanners = mappedPlanners.filter(a => {
            const info = AGENT_REGISTRY[a];
            return info && keepGroups.has(info.group);
        });
        const trimmedCount = mappedPlanners.length - trimmedPlanners.length;
        if (trimmedCount > 0) {
            console.log(`[orchestrate] V4 Phase B: feature 模式裁剪了 ${trimmedCount} 个策划 Agent`);
            // 发送跳过的 agent
            for (const a of mappedPlanners) {
                if (!trimmedPlanners.includes(a)) {
                    sendSSE('agent_skip', { agentId: a, reason: 'Feature模式：跳过策划，加速执行', group: AGENT_REGISTRY[a]?.group });
                }
            }
            mappedPlanners = trimmedPlanners;
        }
    }

    // 拓扑排序 planner agents
    const plannerBatches = topologicalSort(mappedPlanners, dependencies);

    // 执行 planner Agent 批次
    for (let batchIdx = 0; batchIdx < plannerBatches.length; batchIdx++) {
        const batch = plannerBatches[batchIdx];
        if (isAborted()) return;

        const batchLabels = batch.map(a => {
            const info = AGENT_REGISTRY[a];
            return `${info?.emoji || '🤖'}${info?.name || a}`;
        });

        sendSSE('orchestrate_phase', {
          phase : 'parallel',
          message : `${batchLabels.join(' + ')} 并行工作中...`,
          agents : batch,
          batchIndex : batchIdx,
          totalBatches : plannerBatches.length,
        });

        const batchPromises = batch.map(agentId => {
            const prompt = buildAgentPrompt(agentId, userPrompt, projectDir, agentOutputs, orchestration);
            return runSingleAgent(agentId, prompt, projectDir, modelOverride, sendSSE, isAborted, provider)
                .then(result => ({ agentId, result }));
        });

        const batchResults = await Promise.all(batchPromises);
        if (isAborted()) return;

        for (const { agentId, result } of batchResults) {
            if (result.error) {
                const info = AGENT_REGISTRY[agentId];
                sendSSE('agent_message', { agentId, content: `⚠️ ${info?.name || agentId}方案生成失败: ${result.error}`, group: info?.group });
            } else if (!result.output || result.output.trim().length < 10) {
                // V37: 空输出检查——planner 返回空内容也视为失败
                const info = AGENT_REGISTRY[agentId];
                sendSSE('agent_message', { agentId, content: `⚠️ ${info?.name || agentId}方案输出为空，可能需要更明确的需求描述`, group: info?.group });
                console.warn(`[orchestrate] Agent ${agentId} returned empty output (${result.output?.length || 0} chars)`);
            } else {
                agentOutputs[agentId] = result.output;
                const info = AGENT_REGISTRY[agentId];
                const summary = result.output.slice(0, 100).replace(/\n/g, ' ');
                sendSSE('agent_summary', { agentId, summary: `✅ ${info?.name || agentId}方案已完成：${summary}...`, group: info?.group });

                // 更新 Session State
                sessionState.orchestration.completedAgents.push(agentId);
                sessionState.orchestration.agentOutputs[agentId] = result.output.slice(0, 500);

                // 音效 Agent 特殊处理：调 ElevenLabs
                if ((agentId === 'sound-designer' || agentId === 'audio-director') && process.env.ELEVENLABS_API_KEY) {
                    sendSSE('agent_message', { agentId, content: '🎵 正在生成真实音效文件...', group: info?.group });
                    try {
                        const sfxDir = path.join(projectDir, 'sfx');
                        const sfxResults = await generateSoundAssets(result.output, sfxDir, (name, sfxResult) => {
                            if (sfxResult.success) {
                                sendSSE('agent_message', { agentId, content: `🔊 已生成音效: \`${name}.mp3\` (${sfxResult.size_kb}KB)`, group: info?.group });
                                sendSSE('file_changed', { filepath: `sfx/${name}.mp3`, action: 'write' });
                            }
                        });

                        const successCount = sfxResults.filter(r => r.success).length;
                        if (successCount > 0) {
                            sendSSE('agent_message', { agentId, content: `✅ 已生成 ${successCount} 个音效文件到 sfx/ 目录`, group: info?.group });
                            agentOutputs[agentId] += `\n\n## 🎵 已生成的音效文件\n\n以下音效已通过 ElevenLabs API 生成为 mp3 文件，放在 sfx/ 目录下。\n工程师可以直接用 \`new Audio('sfx/xxx.mp3')\` 加载使用。\n\n`;
                            sfxResults.filter(r => r.success).forEach(r => {
                                agentOutputs[agentId] += `- \`sfx/${r.name}.mp3\` — ${r.prompt}\n`;
                            });
                        }
                    } catch (sfxErr) {
                        sendSSE('log', { text: `[sound] 音效生成异常: ${sfxErr.message}` });
                    }
                }

                // 美术 Agent 特殊处理：自动生成图片素材
                if (agentId === 'art-director' || agentId === 'technical-artist') {
                    const imageAssets = parseImageAssets(result.output);
                    if (imageAssets.length > 0) {
                        // V39: 发送专门的素材生成事件（前端渲染进度卡片）
                        const assetList = imageAssets.map(a => ({ name: a.filename, prompt: a.prompt, type: a.type || 'sprite', status: 'pending' }));
                        sendSSE('asset_gen_start', { agentId, total: imageAssets.length, assets: assetList, group: info?.group });
                        try {
                            const assetsDir = path.join(projectDir, 'assets');
                            let completedCount = 0;
                            const imgResults = await generateImageAssets(imageAssets, assetsDir, (filename, imgResult) => {
                                completedCount++;
                                if (imgResult.success) {
                                    sendSSE('asset_gen_progress', { agentId, filename, index: completedCount, total: imageAssets.length, success: true, size_kb: imgResult.size_kb, group: info?.group });
                                    sendSSE('file_changed', { filepath: `assets/${filename}`, action: 'write' });
                                } else {
                                    sendSSE('asset_gen_progress', { agentId, filename, index: completedCount, total: imageAssets.length, success: false, error: imgResult.error?.slice(0, 80) || '未知错误', group: info?.group });
                                }
                            });

                            const successImgs = imgResults.filter(r => r.success);
                            const failedImgs = imgResults.filter(r => !r.success);
                            sendSSE('asset_gen_done', { agentId, total: imageAssets.length, success: successImgs.length, failed: failedImgs.length, results: imgResults.map(r => ({ filename: r.filename || r.originalName, success: r.success, path: r.path, size_kb: r.size_kb, fallback: r.fallbackPath })), group: info?.group });

                            if (successImgs.length > 0) {
                                // 将生成结果追加到 agentOutputs，让 coder 知道可以用哪些文件
                                agentOutputs[agentId] += `\n\n## 🎨 已生成的素材文件\n\n以下素材已通过 AI 图片生成 API 创建，存放在 assets/ 目录下。\n工程师请直接使用这些文件路径（加 ?v=时间戳 破缓存）。\n\n`;
                                successImgs.forEach(r => {
                                    agentOutputs[agentId] += `- \`${r.path}\` — ${r.prompt}\n`;
                                });
                            }

                            if (failedImgs.length > 0) {
                                agentOutputs[agentId] += `\n\n### ⚠️ 未能生成的素材\n以下素材生成失败，工程师请用代码绘制替代方案：\n`;
                                failedImgs.forEach(r => {
                                    agentOutputs[agentId] += `- \`${r.filename}\` — 失败原因: ${r.error?.slice(0, 100) || '未知'}\n`;
                                });
                            }
                        } catch (imgErr) {
                            sendSSE('log', { text: `[art] 图片素材生成异常: ${imgErr.message}` });
                        }
                    }
                }
            }
        }

        writeSessionState(projectDir, sessionState);
    }

    // 跳过的 Agent
    for (const agentId of Object.keys(AGENT_REGISTRY)) {
        if (orchestration?.skip_reason?.[agentId]) {
            sendSSE('agent_skip', { agentId, reason: orchestration.skip_reason[agentId], group: AGENT_REGISTRY[agentId].group });
        }
    }
    // 向后兼容旧字段
    if (orchestration?.skip_reason?.artist && !orchestration.skip_reason['art-director']) {
        sendSSE('agent_skip', { agentId: 'art-director', reason: orchestration.skip_reason.artist, group: '美术' });
    }
    if (orchestration?.skip_reason?.sound && !orchestration.skip_reason['sound-designer']) {
        sendSSE('agent_skip', { agentId: 'sound-designer', reason: orchestration.skip_reason.sound, group: '音效' });
    }

    if (isAborted()) return;

    // ============================
    // Phase 3: Coder 编写代码
    // ============================
    const actualCoders = mappedCoders.length > 0 ? mappedCoders : ['prototyper'];

    for (const coderId of actualCoders) {
        if (isAborted()) return;

        const coderInfo = AGENT_REGISTRY[coderId] || {};
        sendSSE('orchestrate_phase', {
          phase : 'engineer',
          message : `${coderInfo.emoji || '👨‍💻'} ${
              coderInfo.name || '工程师'}正在编写代码...`,
          agents : [ coderId ],
        });

        const coderPrompt = buildAgentPrompt(coderId, userPrompt, projectDir, agentOutputs, orchestration);
        const coderResult = await runSingleAgent(coderId, coderPrompt, projectDir, modelOverride, sendSSE, isAborted, provider);

        if (isAborted()) return;

        if (coderResult.error) {
            sendSSE('error_msg', { message: `${coderInfo.name || '工程师'}失败: ${coderResult.error}` });
            return;
        }

        agentOutputs[coderId] = coderResult.output;
        sessionState.orchestration.completedAgents.push(coderId);
    }

    // 统计生成的文件
    const generatedFiles = [];
    try {
        const walkForFiles = (dir, prefix = '') => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
                const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
                if (entry.isDirectory()) {
                    walkForFiles(path.join(dir, entry.name), relPath);
                } else if (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.css')) {
                    const stat = fs.statSync(path.join(dir, entry.name));
                    if (stat.size > 100) generatedFiles.push(relPath);
                }
            }
        };
        walkForFiles(projectDir);
    } catch {
    }

    const fileList = generatedFiles.length > 0 ? generatedFiles.join(', ') : 'index.html';
    const lastCoder = actualCoders[actualCoders.length - 1];
    sendSSE('agent_summary', { agentId: lastCoder, summary: `✅ 代码编写完成！生成文件：${fileList}`, group: '工程师' });

    // 编排完成
    const activeAgents = sessionState.orchestration.completedAgents;
    sendSSE('orchestrate_phase', { phase: 'done', message: '✅ 全部 Agent 完成！', agents: activeAgents });
    sendSSE('status', { phase: 'completed', message: '游戏生成完成！' });

    // 最终更新 Session State
    sessionState.phase = 'production';
    addDecision(sessionState, 'system', `Quick Mode 编排完成，生成文件: ${fileList}`);
    writeSessionState(projectDir, sessionState);
}


// ====================================
// Collab Mode Session API（v2 新增）
// ====================================

/**
 * POST /api/sessions/:projectId/start
 * 启动新的协作会话
 * Body: { prompt, projectType? }
 */
app.post('/api/sessions/:projectId/start', validateProjectId('projectId'), (req, res) => {
    const { projectId } = req.params;
    const { prompt, projectType = 'html5', provider: collabProvider = 'claude' } = req.body || {};

    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    // 创建 Session State
    const sessionState = createSessionState(projectId, projectType);
    sessionState.mode = 'collab';
    sessionState.phase = 'brainstorm';
    writeSessionState(projectDir, sessionState);

    // 设置 SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    function sendSSE(event, data) {
        if (!res.writableEnded) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }

    let aborted = false;
    res.on('close', () => { aborted = true; console.log(`[session:${projectId}] client disconnected`); });

    // 发送 Agent 注册表
    sendSSE('agent_registry', {
      agents : Object.fromEntries(
          Object.entries(AGENT_REGISTRY).map(([ id, info ]) => [id, {
                                               name : info.name,
                                               emoji : info.emoji,
                                               group : info.group
                                             }])),
      groupMap : AGENT_GROUP_MAP,
    });

    sendSSE('session_state', sessionState);

    // 启动 coordinator 分析
    const coordinatorPrompt = buildAgentPrompt('coordinator', prompt, projectDir);

    runSingleAgent('coordinator', coordinatorPrompt, projectDir, (collabProvider === 'glm') ? GLM_MODEL : MODEL_MAP.opus, sendSSE, () => aborted, collabProvider)
        .then((result) => {
            if (result.error) {
                sendSSE('error_msg', { message: `小助手失败: ${result.error}` });
            } else {
                const { userMessage, orchestration } = parseCoordinatorOutput(result.output);

                // 更新 Session State
                sessionState.orchestration.completedAgents.push('coordinator');
                sessionState.orchestration.agentOutputs.coordinator = result.output.slice(0, 1000);

                if (orchestration) {
                    sessionState.orchestration.agentDependencies = orchestration.agent_dependencies || {};
                    if (orchestration.project_type) sessionState.projectType = orchestration.project_type;
                }

                // Collab Mode: coordinator 分析完后等待用户确认
                sessionState.orchestration.waitingForUser = true;
                sessionState.orchestration.pendingQuestion = {
                    agentId: 'coordinator',
                    question: '以上是我对你的需求的理解和编排方案，确认后我将开始调度对应的专家来协作。',
                    options: ['确认方案，开始执行', '我想修改需求'],
                    orchestration: orchestration,
                };

                addDecision(sessionState, 'coordinator', `分析完成`);
                writeSessionState(projectDir, sessionState);

                sendSSE('session_state', sessionState);
            }

            sendSSE('done', {});
            res.end();
        })
        .catch((err) => {
            sendSSE('error_msg', { message: `会话启动失败: ${err.message}` });
            sendSSE('done', {});
            res.end();
        });
});

/**
 * POST /api/sessions/:projectId/respond
 * 用户回答当前问题 / 确认方案
 * Body: { response, agentId? }
 */
app.post('/api/sessions/:projectId/respond', validateProjectId('projectId'), (req, res) => {
    const { projectId } = req.params;
    const { response, agentId, provider: respondProvider = 'claude' } = req.body || {};

    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const sessionState = readSessionState(projectDir);
    if (!sessionState) {
        return res.status(400).json({ error: 'No active session' });
    }

    if (!sessionState.orchestration.waitingForUser) {
        return res.status(400).json({ error: 'Not waiting for user input' });
    }

    // SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    function sendSSE(event, data) {
        if (!res.writableEnded) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }

    let aborted = false;
    res.on('close', () => { aborted = true; });

    // 处理用户响应
    const pending = sessionState.orchestration.pendingQuestion;
    sessionState.orchestration.waitingForUser = false;
    sessionState.orchestration.pendingQuestion = null;
    addDecision(sessionState, 'user', response);

    // 如果是确认编排方案
    if (pending?.orchestration && response.includes('确认')) {
        const orchestration = pending.orchestration;
        const agentsNeeded = orchestration.agents_needed || [];
        const dependencies = orchestration.agent_dependencies || {};

        sessionState.phase = 'design';
        writeSessionState(projectDir, sessionState);

        sendSSE('session_state', sessionState);

        // 按拓扑排序执行
        const plannerAgents = agentsNeeded.filter(a => {
            const info = AGENT_REGISTRY[resolveAgentId(a)];
            return info && info.role !== 'coder';
        }).map(a => resolveAgentId(a));

        const batches = topologicalSort(plannerAgents, dependencies);

        (async () => {
            const agentOutputs = { coordinator: sessionState.orchestration.agentOutputs.coordinator || '' };

            for (const batch of batches) {
                if (aborted) break;

                const batchLabels = batch.map(a => {
                    const info = AGENT_REGISTRY[a];
                    return `${info?.emoji}${info?.name}`;
                });
                sendSSE('orchestrate_phase', { phase: 'parallel', message: `${batchLabels.join(' + ')} 工作中...`, agents: batch });

                const promises = batch.map(aid => {
                    const prompt = buildAgentPrompt(aid, response, projectDir, agentOutputs, orchestration);
                    return runSingleAgent(aid, prompt, projectDir, null, sendSSE, () => aborted, respondProvider)
                        .then(result => ({ agentId: aid, result }));
                });

                const results = await Promise.all(promises);

                for (const { agentId: aid, result } of results) {
                    if (!result.error) {
                        agentOutputs[aid] = result.output;
                        sessionState.orchestration.completedAgents.push(aid);
                        sessionState.orchestration.agentOutputs[aid] = result.output.slice(0, 500);
                    }
                }
            }

            // Collab Mode: planner 完成后等用户确认是否进入 production
            sessionState.phase = 'design';
            sessionState.orchestration.waitingForUser = true;
            sessionState.orchestration.pendingQuestion = {
                agentId: 'system',
                question: '设计阶段完成！所有策划/美术/音效方案已就绪。是否进入制作阶段？',
                options: ['开始制作（编写代码）', '我想修改设计'],
                agentOutputs: Object.keys(agentOutputs),
            };

            writeSessionState(projectDir, sessionState);
            sendSSE('session_state', sessionState);
            sendSSE('done', {});
            res.end();
        })().catch(err => {
            sendSSE('error_msg', { message: err.message });
            sendSSE('done', {});
            res.end();
        });

    } else if (pending?.agentOutputs && response.includes('开始制作')) {
        // Bug 3 fix: 用户确认进入制作阶段（编写代码）
        sessionState.phase = 'production';
        writeSessionState(projectDir, sessionState);
        sendSSE('session_state', sessionState);

        // 从 Session State 恢复之前的编排信息
        const prevOutputs = sessionState.orchestration.agentOutputs || {};

        // 确定使用哪个 coder Agent
        let orchestration = null;
        if (prevOutputs.coordinator) {
            const parsed = parseCoordinatorOutput(prevOutputs.coordinator);
            orchestration = parsed.orchestration;
        }

        const projectType = sessionState.projectType || 'html5';
        const coderMap = {
            'html5': 'prototyper',
            'unity': 'unity-specialist',
            'unreal': 'unreal-specialist',
            'godot': 'godot-specialist',
        };
        const coderId = coderMap[projectType] || 'prototyper';
        const coderInfo = AGENT_REGISTRY[coderId] || {};

        sendSSE('orchestrate_phase', {
          phase : 'engineer',
          message : `${coderInfo.emoji || '👨‍💻'} ${
              coderInfo.name || '工程师'}正在编写代码...`,
          agents : [ coderId ],
        });

        // 获取用户最初的 prompt
        const chatSummary = getChatHistorySummary(projectDir, 1);
        const userOriginalPrompt = chatSummary.replace(/^\[用户\]:\s*/, '') || response;

        const coderPrompt = buildAgentPrompt(coderId, userOriginalPrompt, projectDir, prevOutputs, orchestration);

        runSingleAgent(coderId, coderPrompt, projectDir, null, sendSSE, () => aborted, respondProvider)
            .then((result) => {
                if (result.error) {
                    sendSSE('error_msg', { message: `${coderInfo.name || '工程师'}失败: ${result.error}` });
                } else {
                    sessionState.orchestration.completedAgents.push(coderId);
                    sessionState.orchestration.agentOutputs[coderId] = result.output.slice(0, 500);

                    sendSSE('agent_summary', {
                      agentId : coderId,
                      summary : `✅ 代码编写完成！`,
                      group : '工程师'
                    });

                    sessionState.phase = 'polish';
                    addDecision(sessionState, coderId, 'Collab Mode 代码生成完成');
                }

                writeSessionState(projectDir, sessionState);
                sendSSE('session_state', sessionState);
                sendSSE('done', {});
                res.end();
            })
            .catch(err => {
                sendSSE('error_msg', { message: err.message });
                sendSSE('done', {});
                res.end();
            });

    } else {
        // 其他响应：转发给当前 Agent 继续对话
        const targetAgent = agentId || pending?.agentId || 'coordinator';
        const prompt = buildAgentPrompt(targetAgent, response, projectDir, sessionState.orchestration.agentOutputs);

        runSingleAgent(targetAgent, prompt, projectDir, null, sendSSE, () => aborted, respondProvider)
            .then((result) => {
                if (!result.error) {
                    sessionState.orchestration.agentOutputs[targetAgent] = result.output.slice(0, 1000);
                    sessionState.orchestration.completedAgents.push(targetAgent);
                }
                writeSessionState(projectDir, sessionState);
                sendSSE('session_state', sessionState);
                sendSSE('done', {});
                res.end();
            })
            .catch(err => {
                sendSSE('error_msg', { message: err.message });
                sendSSE('done', {});
                res.end();
            });
    }
});

/**
 * GET /api/sessions/:projectId/state
 * 获取当前 Session State
 */
app.get('/api/sessions/:projectId/state', validateProjectId('projectId'), (req, res) => {
    const projectDir = path.join(PROJECTS_DIR, req.params.projectId);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const sessionState = readSessionState(projectDir);
    if (!sessionState) {
        return res.json({ session: null });
    }

    res.json({ session: sessionState });
});

/**
 * POST /api/sessions/:projectId/agent/:agentId
 * 直接与指定 Agent 对话（用户手动 @agent）
 * Body: { message }
 */
app.post('/api/sessions/:projectId/agent/:agentId', validateProjectId('projectId'), (req, res) => {
    const { projectId, agentId } = req.params;
    const { message, provider: agentChatProvider = 'claude' } = req.body || {};

    if (!message) {
        return res.status(400).json({ error: 'message is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const realAgentId = resolveAgentId(agentId);
    if (!AGENT_REGISTRY[realAgentId]) {
        return res.status(400).json({ error: `Unknown agent: ${agentId}` });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    function sendSSE(event, data) {
        if (!res.writableEnded) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }

    let aborted = false;
    res.on('close', () => { aborted = true; });

    const sessionState = readSessionState(projectDir);
    const prevOutputs = sessionState?.orchestration?.agentOutputs || {};

    const prompt = buildAgentPrompt(realAgentId, message, projectDir, prevOutputs);

    runSingleAgent(realAgentId, prompt, projectDir, null, sendSSE, () => aborted, agentChatProvider)
        .then((result) => {
            if (!result.error && sessionState) {
                sessionState.orchestration.agentOutputs[realAgentId] = result.output.slice(0, 1000);
                writeSessionState(projectDir, sessionState);
            }
            sendSSE('done', {});
            res.end();
        })
        .catch((err) => {
            sendSSE('error_msg', { message: err.message });
            sendSSE('done', {});
            res.end();
        });
});

/**
 * POST /api/sessions/:projectId/phase
 * 手动切换项目阶段
 * Body: { phase }
 */
app.post('/api/sessions/:projectId/phase', validateProjectId('projectId'), (req, res) => {
    const { projectId } = req.params;
    const { phase } = req.body || {};

    const validPhases = ['brainstorm', 'design', 'production', 'polish'];
    if (!validPhases.includes(phase)) {
        return res.status(400).json({ error: `Invalid phase. Valid: ${validPhases.join(', ')}` });
    }

    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const sessionState = readSessionState(projectDir);
    if (!sessionState) {
        return res.status(400).json({ error: 'No active session' });
    }

    sessionState.phase = phase;
    sessionState.updatedAt = Date.now();
    addDecision(sessionState, 'user', `手动切换阶段到: ${phase}`);
    writeSessionState(projectDir, sessionState);

    res.json({ session: sessionState });
});


// ====================================
// 其他路由
// ====================================

app.post('/api/generate/:projectId/stop', validateProjectId('projectId'), (req, res) => {
    const { projectId } = req.params;
    let stopped = false;
    for (const [taskId, task] of activeTasks) {
        if (task.projectId === projectId) {
            // Bug 1 fix: 设置 abort flag 触发所有关联子进程的 abort 检测
            if (typeof task.abort === 'function') {
                task.abort();
            }
            // 同时尝试 kill 直接存储的 child（单 Agent 模式）
            if (task.child && !task.child.killed) {
                task.child.kill('SIGTERM');
            }
            activeTasks.delete(taskId);
            stopped = true;
        }
    }
    res.json({ stopped, message: stopped ? 'Task stopped' : 'No active task found' });
});

app.use('/projects/:projectId', (req, res, next) => {
  const projectDir = path.join(PROJECTS_DIR, req.params.projectId);
  if (!fs.existsSync(projectDir)) {
    return res.status(404).send('Project not found');
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  express.static(projectDir, {
    setHeaders : (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    }
  })(req, res, next);
});

/**
 * V41: POST /api/settings
 * 设置运行时配置（如 CodeBuddy API Key）
 * Body: { codebuddyApiKey?, codebuddyEnv? }
 * Key 设置到 process.env，仅在本次进程生命周期内有效
 */
app.post('/api/settings', (req, res) => {
    const { codebuddyApiKey, codebuddyEnv } = req.body || {};
    if (codebuddyApiKey !== undefined) {
        process.env.CODEBUDDY_API_KEY = codebuddyApiKey;
        console.log(`[settings] CODEBUDDY_API_KEY ${codebuddyApiKey ? 'set' : 'cleared'} (${(codebuddyApiKey || '').length} chars)`);
    }
    if (codebuddyEnv !== undefined) {
        process.env.CODEBUDDY_INTERNET_ENVIRONMENT = codebuddyEnv;
        console.log(`[settings] CODEBUDDY_INTERNET_ENVIRONMENT = ${codebuddyEnv || '(empty)'}`);
    }
    res.json({ ok: true });
});

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status : 'ok',
    version : 'v2',
    activeTasks : activeTasks.size,
    projectsDir : PROJECTS_DIR,
    agentCount : Object.keys(AGENT_REGISTRY).length,
    agents : Object.keys(AGENT_REGISTRY),
    groups : [...new Set(Object.values(AGENT_REGISTRY).map(a => a.group)) ],
    models : MODEL_MAP,
    glmModel: GLM_MODEL,
    providers: ['claude', 'glm', 'codebuddy'],
  });
});

/**
 * GET /api/agents
 * 获取 Agent 注册表（前端用）
 */
app.get('/api/agents', (req, res) => {
    res.json({
        agents: AGENT_REGISTRY,
        groupMap: AGENT_GROUP_MAP,
        models: MODEL_MAP,
        glmModel: GLM_MODEL,
        providers: ['claude', 'glm'],
        legacy: LEGACY_AGENT_MAP,
    });
});


// ====================================
// 启动服务器
// ====================================
app.listen(PORT, () => {
    ensureDir(PROJECTS_DIR);
    const agentCount = Object.keys(AGENT_REGISTRY).length;
    const groups = [...new Set(Object.values(AGENT_REGISTRY).map(a => a.group))];
    console.log(`\n🎮 WeCreat Backend Server v2 (${agentCount} Agents)`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   Projects dir: ${PROJECTS_DIR}`);
    console.log(`   Agent groups: ${groups.join(', ')}`);
    console.log(`   Modes: Quick Mode (/api/orchestrate) + Collab Mode (/api/sessions)`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Agent list: http://localhost:${PORT}/api/agents\n`);
});
