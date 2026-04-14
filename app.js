/**
 * WeCreat v40 — 侧边栏+单聊页重构（去预览区素材坞/合并任务进度到侧边栏/单聊头部精简/真实任务list/当前产出卡片）
 */

// ========================================
// 6 个前端可见角色组定义（颜色/图标/描述）
// ========================================
const AGENT_GROUPS = {
  '小助手' : {
    icon : 'fa-robot',
    color : '#6366F1',
    desc : '项目管理 · 任务调度',
    avatar : 'avatars/avatar_assistant.png',
    nickname : '小蓝',
    personality : '靠谱的项目经理，帮你理清思路',
    status : [
      '正在整理待办清单', '刚泡好一杯美式', '随时待命', '在复盘昨天的项目'
    ],
    canDirectChat : false, // 只在群聊中出现，不可单聊
  },
  '策划' : {
    icon : 'fa-lightbulb',
    color : '#F59E0B',
    desc : '调研分析 · 玩法设计 · 系统策划',
    avatar : 'avatars/avatar_planner.png',
    nickname : '灵灵',
    personality : '脑洞无限，把创意变成可落地的方案',
    status : [
      '正在翻游戏设计文档', '又想到一个新玩法', '在分析竞品数据',
      '画了一下午流程图'
    ],
    canDirectChat : true,
  },
  '美术' : {
    icon : 'fa-palette',
    color : '#EC4899',
    desc : '视觉设计 · 画面表现',
    avatar : 'avatars/avatar_artist.png',
    nickname : '绘绘',
    personality : '像素级审美，让每帧画面都有表现力',
    status : [
      '刚调完一组配色', '在研究新的画风', '正在 P 图中...', '盯着参考图发呆'
    ],
    canDirectChat : true,
  },
  '音效' : {
    icon : 'fa-music',
    color : '#06B6D4',
    desc : '音频设计 · 氛围营造',
    avatar : 'avatars/avatar_sound.png',
    nickname : '乐乐',
    personality : '用声音讲故事，每个交互都有灵魂',
    status : [
      '戴着耳机调音色', '在合成新的打击感', '正在听参考曲', '刚做完一段 BGM'
    ],
    canDirectChat : true,
  },
  '工程师' : {
    icon : 'fa-code',
    color : '#10B981',
    desc : '架构编码 · 性能优化',
    avatar : 'avatars/avatar_engineer.png',
    nickname : '码哥',
    personality : '代码洁癖，不只是能跑还要跑得漂亮',
    status : [
      '正在 debug 中...', '重构了一段老代码', '在写单元测试', '刚合了一个 PR'
    ],
    canDirectChat : false, // 只在群聊中出现，不可单聊
  },

};

// ========================================
// 22 Agent 完整注册表（与后端 AGENT_REGISTRY 对齐）
// ========================================
const AGENTS = {
  // 小助手组
  'coordinator' : {
    id : 'coordinator',
    name : '小助手',
    icon : 'fa-robot',
    emoji : '🤖',
    color : '#6366F1',
    group : '小助手',
    role : 'orchestrator',
    desc : '理解需求 · 玩法设计 · 任务拆解 · 调度协作'
  },
  'producer' : {
    id : 'producer',
    name : '制作人',
    icon : 'fa-clipboard-list',
    emoji : '📋',
    color : '#6366F1',
    group : '小助手',
    role : 'planner',
    desc : '项目管理 · 里程碑 · 资源调度'
  },
  // 策划组
  'creative-director' : {
    id : 'creative-director',
    name : '创意总监',
    icon : 'fa-lightbulb',
    emoji : '🎯',
    color : '#F59E0B',
    group : '策划',
    role : 'planner',
    desc : '创意方向 · 核心体验 · 差异化'
  },
  'game-designer' : {
    id : 'game-designer',
    name : '游戏设计师',
    icon : 'fa-gamepad',
    emoji : '🎮',
    color : '#F59E0B',
    group : '策划',
    role : 'planner',
    desc : '核心循环 · 操作设计 · 交互流程'
  },
  'systems-designer' : {
    id : 'systems-designer',
    name : '系统设计师',
    icon : 'fa-gears',
    emoji : '⚙️',
    color : '#F59E0B',
    group : '策划',
    role : 'planner',
    desc : '成长系统 · 战斗系统 · 数值框架'
  },
  'level-designer' : {
    id : 'level-designer',
    name : '关卡设计师',
    icon : 'fa-map',
    emoji : '🗺️',
    color : '#F59E0B',
    group : '策划',
    role : 'planner',
    desc : '关卡节奏 · 难度曲线 · 空间规划'
  },
  'narrative-director' : {
    id : 'narrative-director',
    name : '叙事导演',
    icon : 'fa-book-open',
    emoji : '📖',
    color : '#F59E0B',
    group : '策划',
    role : 'planner',
    desc : '世界观 · 故事线 · 对白'
  },
  'economy-designer' : {
    id : 'economy-designer',
    name : '经济设计师',
    icon : 'fa-coins',
    emoji : '💰',
    color : '#F59E0B',
    group : '策划',
    role : 'planner',
    desc : '货币系统 · 商店 · 奖励循环'
  },
  // 美术组
  'art-director' : {
    id : 'art-director',
    name : '美术总监',
    icon : 'fa-palette',
    emoji : '🎨',
    color : '#EC4899',
    group : '美术',
    role : 'planner',
    desc : '视觉风格 · 色彩方案 · 素材规范'
  },
  'technical-artist' : {
    id : 'technical-artist',
    name : '技术美术',
    icon : 'fa-pen-nib',
    emoji : '🖌️',
    color : '#EC4899',
    group : '美术',
    role : 'planner',
    desc : '动效实现 · 粒子系统 · 性能优化'
  },
  'ux-designer' : {
    id : 'ux-designer',
    name : 'UX设计师',
    icon : 'fa-mobile-screen',
    emoji : '📱',
    color : '#EC4899',
    group : '美术',
    role : 'planner',
    desc : 'UI布局 · 交互流程 · 用户体验'
  },
  // 音效组
  'audio-director' : {
    id : 'audio-director',
    name : '音频总监',
    icon : 'fa-headphones',
    emoji : '🎵',
    color : '#06B6D4',
    group : '音效',
    role : 'planner',
    desc : '音频策略 · 风格定义 · 混音方案'
  },
  'sound-designer' : {
    id : 'sound-designer',
    name : '音效设计师',
    icon : 'fa-volume-high',
    emoji : '🔊',
    color : '#06B6D4',
    group : '音效',
    role : 'planner',
    desc : 'BGM · SFX · 音频实现'
  },
  // 工程师组
  'technical-director' : {
    id : 'technical-director',
    name : '技术总监',
    icon : 'fa-building',
    emoji : '🏗️',
    color : '#10B981',
    group : '工程师',
    role : 'planner',
    desc : '架构决策 · 技术选型 · 风险评估'
  },
  'lead-programmer' : {
    id : 'lead-programmer',
    name : '主程序',
    icon : 'fa-laptop-code',
    emoji : '👨‍💻',
    color : '#10B981',
    group : '工程师',
    role : 'planner',
    desc : '代码规范 · 模块分工 · Code Review'
  },
  'gameplay-programmer' : {
    id : 'gameplay-programmer',
    name : '游戏程序员',
    icon : 'fa-crosshairs',
    emoji : '🎯',
    color : '#10B981',
    group : '工程师',
    role : 'coder',
    desc : '游戏逻辑 · 物理 · AI行为'
  },
  'engine-programmer' : {
    id : 'engine-programmer',
    name : '引擎程序员',
    icon : 'fa-bolt',
    emoji : '⚡',
    color : '#10B981',
    group : '工程师',
    role : 'coder',
    desc : '渲染管线 · 资源管理 · 性能'
  },
  'prototyper' : {
    id : 'prototyper',
    name : '原型师',
    icon : 'fa-rocket',
    emoji : '🚀',
    color : '#10B981',
    group : '工程师',
    role : 'coder',
    desc : 'HTML5快速原型 · 一键出Demo'
  },
  'unity-specialist' : {
    id : 'unity-specialist',
    name : 'Unity专家',
    icon : 'fa-diamond',
    emoji : '🔷',
    color : '#10B981',
    group : '工程师',
    role : 'coder',
    desc : 'Unity C# · UGUI · URP'
  },
  'unreal-specialist' : {
    id : 'unreal-specialist',
    name : 'Unreal专家',
    icon : 'fa-cube',
    emoji : '🔶',
    color : '#10B981',
    group : '工程师',
    role : 'coder',
    desc : 'Unreal C++ · Blueprint · Nanite'
  },
  'godot-specialist' : {
    id : 'godot-specialist',
    name : 'Godot专家',
    icon : 'fa-circle',
    emoji : '🟢',
    color : '#10B981',
    group : '工程师',
    role : 'coder',
    desc : 'GDScript · 2D/3D · 开源引擎'
  },
  // 审核组
  'qa-lead' : {
    id : 'qa-lead',
    name : 'QA主管',
    icon : 'fa-shield-halved',
    emoji : '🔍',
    color : '#8B5CF6',
    group : '审核',
    role : 'reviewer',
    desc : '质量验收 · Bug检测 · 合规审查'
  },
};

// ========================================
// 向后兼容：旧版 Agent ID → 新版映射
// ========================================
const LEGACY_AGENT_MAP = {
  'artist' : 'art-director',
  'sound' : 'sound-designer',
  'engineer' : 'prototyper',
};

// 解析 Agent ID（兼容旧版），返回有效的 AGENTS key
function resolveAgentId(id) {
    if (AGENTS[id]) return id;
    if (LEGACY_AGENT_MAP[id] && AGENTS[LEGACY_AGENT_MAP[id]]) return LEGACY_AGENT_MAP[id];
    return null;
}

// 安全获取 Agent 信息（兼容旧 ID + 未知 ID 不崩）
function getAgent(id) {
    const resolved = resolveAgentId(id);
    return resolved ? AGENTS[resolved] : null;
}

/** 获取 agent 头像 HTML（优先使用组的卡通插画头像） */
function getAgentAvatarHTML(agentId) {
    const agent = getAgent(agentId);
    if (!agent) return '🤖';
    const groupInfo = AGENT_GROUPS[agent.group];
    if (groupInfo && groupInfo.avatar) {
        return `<img src="${groupInfo.avatar}" alt="${agent.group}" />`;
    }
    return agent.emoji;
}

/** 统一角色展示名：「角色 昵称」格式，如"美术 绘绘" */
function getGroupDisplayName(groupName) {
    const info = AGENT_GROUPS[groupName];
    if (!info) return groupName;
    return info.nickname ? `${groupName} ${info.nickname}` : groupName;
}

/** 根据 agentId 获取统一展示名 */
function getAgentDisplayName(agentId) {
    const agent = getAgent(agentId);
    if (!agent) return agentId;
    return getGroupDisplayName(agent.group);
}

// 获取某组下所有 Agent ID
function getAgentIdsByGroup(groupName) {
    return Object.keys(AGENTS).filter(id => AGENTS[id].group === groupName);
}

// 获取所有非 coordinator 的执行 Agent ID（用于进度面板等）
function getExecutionAgentIds() {
    return Object.keys(AGENTS).filter(id => AGENTS[id].role !== 'orchestrator');
}

// ========================================
// 设备预设
// ========================================
const DEVICES = {
    iphone14: { name: 'iPhone 14', width: 390, height: 844, hasNotch: true, type: 'phone', icon: 'fa-mobile-screen-button' },
    iphone14pro: { name: 'iPhone 14 Pro Max', width: 430, height: 932, hasNotch: true, type: 'phone', icon: 'fa-mobile-screen-button' },
    ipad: { name: 'iPad', width: 820, height: 1180, hasNotch: false, type: 'tablet', icon: 'fa-tablet-screen-button' },
    desktop: { name: '桌面', width: 1280, height: 800, hasNotch: false, type: 'desktop', icon: 'fa-desktop' },
    custom: { name: '自定义', width: 375, height: 667, hasNotch: true, type: 'phone', icon: 'fa-crop-simple' },
};

// ========================================
// 各Agent子任务定义(根据游戏类型动态生成)
// ========================================
const GAME_TYPE_CONFIGS = {
    '消消乐': {
        icon: '🍬',
        artist: [
            { name: '确定视觉风格', detail: '糖果/宝石主题配色' },
            { name: '绘制方块素材', detail: '6-8种颜色方块' },
            { name: '设计UI界面', detail: '得分/关卡/道具栏' },
            { name: '制作消除特效', detail: '消除/连锁/掉落动画' },
            { name: '输出设计资产包', detail: '20+张切图' },
        ],
        sound: [
            { name: '确定音效风格', detail: '欢快轻松风格' },
            { name: '制作背景音乐', detail: '2首BGM' },
            { name: '制作交互音效', detail: '消除/连锁/得分/失败' },
            { name: '音频混音与导出', detail: '10个文件' },
        ],
        engineer: [
            { name: '游戏主界面', detail: '开始/关卡选择/设置' },
            { name: '棋盘与方块系统', detail: '网格生成/方块匹配' },
            { name: '消除与掉落逻辑', detail: '三消/连锁/重力下落' },
            { name: '计分与关卡系统', detail: '目标分/星级评定' },
            { name: '适配与发布', detail: '全机型60fps' },
        ],
        params: {
            labels: ['棋盘列数', '棋盘行数', '方块种类', '目标分数'],
            values: [7, 9, 6, 1000],
            units: ['列', '行', '种', '分'],
            mins: [5, 5, 4, 500],
            maxs: [10, 12, 8, 5000],
            steps: [1, 1, 1, 100],
        },
        plan: {
            goal: '玩家通过交换相邻方块，使三个或更多相同颜色方块连成一线触发消除',
            controls: '点击/拖拽: 交换相邻方块',
            mechanics: [
                '三消匹配: 横/竖3个以上相同方块消除',
                '连锁反应: 消除后方块下落触发新消除',
                '特殊方块: 4消生成条纹、5消生成彩虹',
                '关卡目标: 限定步数内达到目标分数',
            ],
        },
    },
    '贪吃蛇': {
        icon: '🐍',
        artist: [
            { name: '确定视觉风格', detail: '复古像素主题' },
            { name: '绘制蛇身与食物', detail: '蛇头/蛇身/食物' },
            { name: '设计UI界面', detail: '得分/最高分/暂停' },
            { name: '制作吃食与死亡特效', detail: '吞咽/碰撞动画' },
            { name: '输出设计资产包', detail: '10+张切图' },
        ],
        sound: [
            { name: '确定音效风格', detail: '复古8-bit电子风' },
            { name: '制作背景音乐', detail: '1首BGM' },
            { name: '制作交互音效', detail: '吃食/转弯/碰撞/得分' },
            { name: '音频混音与导出', detail: '6个文件' },
        ],
        engineer: [
            { name: '游戏主界面', detail: '开始/暂停/结束' },
            { name: '蛇身移动系统', detail: '方向控制/身体跟随' },
            { name: '食物与碰撞检测', detail: '生成食物/边界碰撞' },
            { name: '计分与难度系统', detail: '加速/排行榜' },
            { name: '适配与发布', detail: '全机型60fps' },
        ],
        params: {
            labels: ['初始速度', '网格大小', '初始长度', '加速间隔'],
            values: [150, 20, 3, 5],
            units: ['ms/格', 'px', '节', '个食物'],
            mins: [50, 10, 2, 3],
            maxs: [300, 40, 10, 20],
            steps: [10, 5, 1, 1],
        },
        plan: {
            goal: '控制蛇吃到食物不断变长，避免撞墙或撞到自己',
            controls: '方向键/WASD/滑动: 控制移动方向',
            mechanics: [
                '蛇身跟随: 头部移动带动身体',
                '食物生成: 随机出现在空白格',
                '碰撞检测: 撞墙/撞自身=游戏结束',
                '难度曲线: 每吃5个食物加速10%',
            ],
        },
    },
    '太空射击': {
        icon: '🚀',
        artist: [
            { name: '确定视觉风格', detail: '暗色霓虹主题' },
            { name: '绘制游戏角色素材', detail: '3个角色' },
            { name: '设计UI界面组件', detail: '6个UI元素' },
            { name: '制作动效与粒子', detail: '4组动画' },
            { name: '输出设计资产包', detail: '12张切图' },
        ],
        sound: [
            { name: '确定音效风格', detail: '8-bit电子风' },
            { name: '制作背景音乐', detail: '2首BGM' },
            { name: '制作交互音效', detail: '8个音效' },
            { name: '音频混音与导出', detail: '10个文件' },
        ],
        engineer: [
            { name: '游戏主界面', detail: '开始/暂停/结束' },
            { name: '角色操控', detail: '移动与射击' },
            { name: '敌人与碰撞', detail: '生成/击毁/爆炸' },
            { name: '计分与排行', detail: '实时得分显示' },
            { name: '适配与发布', detail: '全机型60fps' },
        ],
        params: {
            labels: ['玩家移速', '射击间隔', '敌机刷新', '初始生命'],
            values: [6, 300, 1500, 3],
            units: ['px/帧', 'ms', 'ms', '点'],
            mins: [1, 50, 500, 1],
            maxs: [20, 2000, 5000, 10],
            steps: [1, 50, 100, 1],
        },
        plan: {
            goal: '操控战机击落敌机，累积分数，存活越久难度越大',
            controls: '方向键/WASD: 移动战机\n空格键/鼠标左键: 发射子弹\nP键: 暂停游戏',
            mechanics: [
                '子弹冷却: 0.3秒射击间隔',
                '敌机生成: 每1.5秒刷新一波',
                '难度曲线: 每30秒敌机速度+10%',
                '3次生命机会，挑战最高分记录',
            ],
        },
    },
    '跑酷': {
        icon: '🏃',
        artist: [
            { name: '确定视觉风格', detail: '卡通横版主题' },
            { name: '绘制角色与障碍物', detail: '跑步/跳跃/滑行' },
            { name: '设计场景背景', detail: '多层视差滚动' },
            { name: '制作动作动画', detail: '跑/跳/摔倒帧' },
            { name: '输出设计资产包', detail: '15+张切图' },
        ],
        sound: [
            { name: '确定音效风格', detail: '动感节奏风' },
            { name: '制作背景音乐', detail: '1首循环BGM' },
            { name: '制作交互音效', detail: '跳跃/金币/碰撞/滑行' },
            { name: '音频混音与导出', detail: '8个文件' },
        ],
        engineer: [
            { name: '游戏主界面', detail: '开始/暂停/结束' },
            { name: '角色与跑动系统', detail: '自动跑/跳/滑' },
            { name: '障碍物生成', detail: '随机障碍+金币' },
            { name: '计分与距离系统', detail: '距离/金币/最高分' },
            { name: '适配与发布', detail: '全机型60fps' },
        ],
        params: {
            labels: ['跑动速度', '跳跃高度', '重力加速度', '障碍间距'],
            values: [5, 120, 0.8, 300],
            units: ['px/帧', 'px', 'px/帧²', 'px'],
            mins: [2, 60, 0.3, 150],
            maxs: [15, 200, 2, 600],
            steps: [1, 10, 0.1, 50],
        },
        plan: {
            goal: '控制角色不断向前跑，躲避障碍物收集金币',
            controls: '上键/空格/点击: 跳跃\n下键/滑动: 滑行',
            mechanics: [
                '自动跑动: 角色自动前进，速度递增',
                '跳跃物理: 重力下落+二段跳',
                '障碍生成: 随机高低障碍组合',
                '金币系统: 收集金币解锁角色皮肤',
            ],
        },
    },
    '记忆翻牌': {
        icon: '🃏',
        artist: [
            { name: '确定视觉风格', detail: '可爱卡通主题' },
            { name: '绘制卡牌图案', detail: '8-12种配对图案' },
            { name: '设计UI界面', detail: '计时/步数/关卡' },
            { name: '制作翻牌动画', detail: '翻转/匹配/消失' },
            { name: '输出设计资产包', detail: '15+张切图' },
        ],
        sound: [
            { name: '确定音效风格', detail: '轻松可爱风' },
            { name: '制作背景音乐', detail: '1首轻音乐BGM' },
            { name: '制作交互音效', detail: '翻牌/匹配/失败/过关' },
            { name: '音频混音与导出', detail: '6个文件' },
        ],
        engineer: [
            { name: '游戏主界面', detail: '开始/难度选择' },
            { name: '卡牌系统', detail: '洗牌/翻转/配对' },
            { name: '匹配与消除逻辑', detail: '两两配对/错误翻回' },
            { name: '计时与关卡系统', detail: '限时/星级评价' },
            { name: '适配与发布', detail: '全机型60fps' },
        ],
        params: {
            labels: ['行数', '列数', '翻牌时间', '配对数'],
            values: [4, 4, 1.5, 8],
            units: ['行', '列', '秒', '对'],
            mins: [2, 2, 0.5, 2],
            maxs: [6, 6, 5, 18],
            steps: [1, 1, 0.5, 1],
        },
        plan: {
            goal: '翻开卡牌找到相同图案的配对，用最少步数完成',
            controls: '点击/触摸: 翻开卡牌',
            mechanics: [
                '洗牌布局: 随机打乱配对卡牌位置',
                '翻牌规则: 同时只能翻2张',
                '匹配判定: 相同则消除，不同则翻回',
                '过关条件: 限时内翻完所有配对',
            ],
        },
    },
};

// 默认配置(通用小游戏)
const DEFAULT_GAME_CONFIG = {
    icon: '🎮',
    artist: [
        { name: '确定视觉风格', detail: '确定画面风格' },
        { name: '绘制游戏素材', detail: '角色/道具/场景' },
        { name: '设计UI界面', detail: '菜单/HUD/弹窗' },
        { name: '制作动效', detail: '交互动画' },
        { name: '输出设计资产包', detail: '全部切图' },
    ],
    sound: [
        { name: '确定音效风格', detail: '匹配游戏氛围' },
        { name: '制作背景音乐', detail: '1-2首BGM' },
        { name: '制作交互音效', detail: '核心交互音效' },
        { name: '音频混音与导出', detail: '全部音频文件' },
    ],
    engineer: [
        { name: '游戏主界面', detail: '开始/暂停/结束' },
        { name: '核心玩法实现', detail: '主要游戏逻辑' },
        { name: '交互与碰撞系统', detail: '输入处理/碰撞检测' },
        { name: '计分与存储', detail: '得分/排行/持久化' },
        { name: '适配与发布', detail: '全机型60fps' },
    ],
    params: {
        labels: ['游戏速度', '难度等级', '初始生命', '目标分数'],
        values: [5, 1, 3, 1000],
        units: ['级', '级', '点', '分'],
        mins: [1, 1, 1, 100],
        maxs: [10, 5, 10, 10000],
        steps: [1, 1, 1, 100],
    },
    plan: {
        goal: '完成游戏目标，获得高分',
        controls: '方向键/点击: 游戏操作',
        mechanics: [
            '核心玩法循环',
            '难度递增系统',
            '得分与奖励机制',
            '游戏结束与重开',
        ],
    },
};

function detectGameType(prompt) {
    const typeMap = {
        '消消乐': ['消消乐', '三消', '消除', 'match-3', 'match3', 'candy', '宝石'],
        '贪吃蛇': ['贪吃蛇', 'snake'],
        '太空射击': ['射击', '打飞机', '飞机大战', '太空射击', 'shooter', 'shoot'],
        '跑酷': ['跑酷', '跑步', '酷跑', 'runner', 'run'],
        '记忆翻牌': ['翻牌', '记忆', '配对', 'memory', 'match'],
    };
    const lower = prompt.toLowerCase();
    for (const [type, keywords] of Object.entries(typeMap)) {
        if (keywords.some(kw => lower.includes(kw))) return type;
    }
    return null;
}

function getGameConfig(gameType) {
    return GAME_TYPE_CONFIGS[gameType] || DEFAULT_GAME_CONFIG;
}

function getAgentSubtasks(gameType) {
    const config = getGameConfig(gameType);
    const result = {};
    // 动态取 config 中定义了子任务的所有 Agent key（兼容旧版 artist/sound/engineer + 新版 ID）
    for (const key of Object.keys(config)) {
        if (Array.isArray(config[key]) && key !== 'mechanics') {
            result[key] = config[key];
        }
    }
    return result;
}

// ========================================
// 状态管理
// ========================================
const AppState = {
  isGenerating : false,
  isPaused : false,
  task : null,

  // 对话管理
  sessions : [],
  currentSessionId : null,
  currentView : 'group',
  currentAgentId : null,

  // 工作区
  activePanel : 'main-preview',
  activeTool : 'preview',

  // 设备模拟
  currentDevice : 'iphone14',
  isLandscape : false,
  deviceDropdownOpen : false,

  // 素材坞
  assetDockOpen : false,
  assetGenCardEl : null, // V40: 素材生成进度卡片DOM引用

  // 布局模式
  layoutMode : false,
  layoutCoords : [],
  coordsRefText : '',

  // 版本管理
  versions : [],

  // 评审区（默认隐藏）
  reviewOpen : false,

  // V34: 子线程系统已移除（看板面板直接承载角色对话入口）
  // activeThread : null,  // DEPRECATED
  // threads : [],         // DEPRECATED
  roleStates : {}, // 角色工作状态 { '策划': 'idle'|'working'|'done', ... }

  // V33: 成员详情页
  activeMemberView :
      null, // 当前查看的成员角色组名（如 '美术'），null 表示在主群聊

  // V38: 素材管理视图
  activeAssetView : false, // 是否在素材管理全页面
  projectAssets : [],      // 当前项目素材列表（从后端加载）
  assetFilter : 'all',     // 当前筛选类型 'all'|'image'|'audio'|'unused'
  assetSearch : '',        // 搜索关键词
  selectedAssets : new Set(), // 多选的素材文件名集合
  assetPreviewIndex : -1,     // 预览弹层当前索引

  // V38: 模型 Provider 选择
  modelProvider : 'glm',   // 'claude' | 'glm' | 'codebuddy'，默认 glm

  // V41: CodeBuddy API Key（存 localStorage，不随请求上传）
  codebuddyApiKey : localStorage.getItem('wecreat_codebuddy_api_key') || '',
  codebuddyEnv : localStorage.getItem('wecreat_codebuddy_env') || '',

  // 网页窗口
  webviewWindows : [],

  // @提及
  mentionActive : false,
  mentionFilter : '',
  mentionSelectedIndex : 0,
  mentionedAgents : [],

  // 文件上传
  uploadedFiles : [],

  // 挂载的素材胶囊（输入框内的实体上下文）
  attachedAssets : [],

  // 进度面板展开状态（默认收折）
  progressExpanded : false,

  // ====== Phase 1: Real API ======
  useRealAPI : false,      // 默认仿真模式，顶栏可切换到 Real API
  currentProjectId : null, // 当前项目ID
  apiBaseUrl :
      window.location.pathname.startsWith('/zoi')
          ? window.location.origin + '/zoi'
      : window.location.pathname.includes('/zoi')
          ? window.location.origin + '/zoi'
          : window.location.origin, // 后端地址（代理模式自动加 /zoi 前缀）
  eventSource : null,               // SSE 连接
  previewUrl : null,                // 当前预览 URL
  backendOnline : false,            // 后端服务是否在线

  // ====== Phase 4: Collab Mode ======
  currentMode : 'quick',        // 'quick' | 'collab'
  sessionState : null,          // 后端 Session State 快照
  collabAbortController : null, // POST SSE 的 AbortController

  // ====== v11: 新增状态 ======
  previewErrors : [],     // iframe 运行时错误列表
  errorPanelOpen : false, // 错误面板是否展开
  imageAttachments : [],  // 待发送的图片附件 [{name, base64, file}]
};

// ========================================
// Per-Session 并行任务辅助函数
// ========================================

/** 获取指定 session（默认当前）的生成锁状态 */
function getSessionGenerating(sessionId) {
    const sid = sessionId || AppState.currentSessionId;
    const session = AppState.sessions.find(s => s.id === sid);
    return session?._isGenerating || false;
}

/** 设置指定 session 的生成锁，同时同步全局 AppState（兼容） */
function setSessionGenerating(sessionId, value) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (session) session._isGenerating = value;
    // 仅当操作的是当前显示的 session 时同步全局状态+UI
    if (sessionId === AppState.currentSessionId) {
        AppState.isGenerating = value;
        updatePauseButton(value);
    }
    // 更新侧边栏进度指示
    renderConvList();
}

/** 更新暂停按钮的显示状态（仅在当前 session 调用） */
function updatePauseButton(isGenerating) {
    DOM.btnPause.style.display = isGenerating ? 'flex' : 'none';
}

/** 获取指定 session 的 EventSource */
function getSessionEventSource(sessionId) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    return session?._eventSource || null;
}

/** 设置指定 session 的 EventSource */
function setSessionEventSource(sessionId, es) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (session) session._eventSource = es;
    // 兼容：当前 session 同步到全局
    if (sessionId === AppState.currentSessionId) {
        AppState.eventSource = es;
    }
}

/** 获取指定 session 的 AbortController */
function getSessionAbortController(sessionId) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    return session?._abortController || null;
}

/** 设置指定 session 的 AbortController */
function setSessionAbortController(sessionId, ctrl) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (session) session._abortController = ctrl;
    // 兼容：当前 session 同步到全局
    if (sessionId === AppState.currentSessionId) {
        AppState.collabAbortController = ctrl;
    }
}

/** 更新输入框占位文案——根据当前 session 的生成状态 */
function updateInputPlaceholder() {
    const session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (!session) return;
    if (session._isGenerating) {
        DOM.chatInput.placeholder = '当前频道正在工作中，你可以切到其他频道继续对话...';
        DOM.chatInput.classList.add('input-busy');
    } else {
        DOM.chatInput.placeholder = '描述你想要的游戏... 输入 @ 指定Agent';
        DOM.chatInput.classList.remove('input-busy');
    }
}

/** 处理 session 排队消息 — 当生成完成后，自动处理队列中的下一条消息 */
function processSessionPendingMessages(sessionId) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (!session || !session._pendingMessages || session._pendingMessages.length === 0) return;
    if (session._isGenerating) return; // 还在忙，等下次

    const nextMsg = session._pendingMessages.shift();
    console.log(`[PendingQueue] 处理排队消息 session=${sessionId}: "${nextMsg.substring(0, 50)}..."`);

    if (AppState.currentSessionId === sessionId) {
        // 当前就在这个 session，直接模拟输入并发送
        DOM.chatInput.value = nextMsg;
        handleSend();
    } else {
        // 后台 session —— 不切换视图，直接在后台触发发送
        addSystemMessage(`📨 正在处理排队消息...`, sessionId);
        // 临时切换 currentSessionId 来触发正确的路由，然后立即切回
        const savedSessionId = AppState.currentSessionId;
        AppState.currentSessionId = sessionId;
        DOM.chatInput.value = nextMsg;
        handleSend();
        // 立即恢复到用户正在查看的 session（不触发 UI 重渲染）
        AppState.currentSessionId = savedSessionId;
    }
}

// ========================================
// DOM 引用
// ========================================
const DOM = {};

function initDOM() {
    DOM.topbar = document.getElementById('topbar');
    DOM.projectTitle = document.getElementById('projectTitle');
    DOM.projectStatus = document.getElementById('projectStatus');

    // 三栏主体
    DOM.mainBody = document.querySelector('.main-body');

    // 右栏：预览面板
    DOM.previewPanel = document.getElementById('previewPanel');
    DOM.previewContent = document.getElementById('previewContent');
    DOM.previewViewport = document.getElementById('previewViewport');
    DOM.deviceFrame = document.getElementById('deviceFrame');
    DOM.deviceScreen = document.getElementById('deviceScreen');
    DOM.deviceNotch = document.getElementById('deviceNotch');
    DOM.deviceHomeBar = document.getElementById('deviceHomeBar');
    DOM.deviceSizeLabel = document.getElementById('deviceSizeLabel');

    // 设备下拉
    DOM.deviceDropdown = document.getElementById('deviceDropdown');
    DOM.deviceDropdownTrigger = document.getElementById('deviceDropdownTrigger');
    DOM.deviceDropdownMenu = document.getElementById('deviceDropdownMenu');
    DOM.deviceDropdownIcon = document.getElementById('deviceDropdownIcon');
    DOM.deviceDropdownLabel = document.getElementById('deviceDropdownLabel');
    DOM.customSizeRow = document.getElementById('customSizeRow');

    // 素材坞
    DOM.assetDock = document.getElementById('assetDock');
    DOM.assetDockToggle = document.getElementById('assetDockToggle');
    DOM.assetDockPanel = document.getElementById('assetDockPanel');
    DOM.assetDockClose = document.getElementById('assetDockClose');

    DOM.pixelOverlay = document.getElementById('pixelOverlay');
    DOM.pixelCanvas = document.getElementById('pixelCanvas');
    DOM.pixelCoordsBar = document.getElementById('pixelCoordsBar');
    DOM.coordsTags = document.getElementById('coordsTags');
    DOM.layoutModeToggle = document.getElementById('layoutModeToggle');

    DOM.versionsDrawer = document.getElementById('versionsDrawer');
    DOM.versionsTimeline = document.getElementById('versionsTimeline');

    // 左栏：对话面板
    DOM.chatPanel = document.getElementById('chatPanel');
    DOM.chatHeader = document.getElementById('chatHeader');
    DOM.chatTitle = document.getElementById('chatTitle');
    DOM.chatMessages = document.getElementById('chatMessages');
    DOM.welcomeScreen = document.getElementById('welcomeScreen');
    DOM.taskProgressBar = document.getElementById('sidebarTaskProgress'); // V40: 移到侧边栏
    DOM.taskProgressAgents = document.getElementById('sidebarTaskList');  // V40

    // 对话侧边栏
    DOM.convSidebar = document.getElementById('convSidebar');
    DOM.convGroupItems = document.getElementById('convGroupItems');
    DOM.chatPanelTitle = document.getElementById('chatPanelTitle');

    DOM.chatInput = document.getElementById('chatInput');
    DOM.btnSend = document.getElementById('btnSend');
    DOM.btnPause = document.getElementById('btnPause');
    DOM.btnUpload = document.getElementById('btnUpload');
    DOM.fileInput = document.getElementById('fileInput');
    DOM.uploadedFiles = document.getElementById('uploadedFiles');
    DOM.mentionDropdown = document.getElementById('mentionDropdown');
    DOM.coordsRefBar = document.getElementById('coordsRefBar');
    DOM.coordsRefText = document.getElementById('coordsRefText');
    DOM.assetTokenBar = document.getElementById('assetTokenBar');
    DOM.inputHintText = document.getElementById('inputHintText');
    // V30: 引用条
    DOM.quoteRefBar = document.getElementById('quoteRefBar');
    DOM.quoteRefSource = document.getElementById('quoteRefSource');
    DOM.quoteRefPreview = document.getElementById('quoteRefPreview');
    DOM.btnRemoveQuote = document.getElementById('btnRemoveQuote');

    // 双 resize handle
    DOM.resizeHandleLeft = document.getElementById('resizeHandleLeft');
    DOM.resizeHandleRight = document.getElementById('resizeHandleRight');

    // 中栏：评审区（动态 Tab 系统，面板按需创建）
    DOM.reviewPanel = document.getElementById('reviewPanel');
    DOM.reviewTabs = document.getElementById('reviewTabs');
    DOM.reviewContent = document.getElementById('reviewContent');
    DOM.reviewWelcome = document.getElementById('reviewWelcome');
    DOM.reviewCollapseBtn = document.getElementById('reviewCollapseBtn');
    DOM.reviewBadge = document.getElementById('reviewBadge');

    DOM.newSessionModal = document.getElementById('newSessionModal');
    DOM.fullscreenModal = document.getElementById('fullscreenModal');
    DOM.imagePreviewOverlay = document.getElementById('imagePreviewOverlay');
    DOM.saveVersionModal = document.getElementById('saveVersionModal');

    // v11 DOM
    DOM.errorIndicator = document.getElementById('btnErrorIndicator');
    DOM.errorCount = document.getElementById('errorCount');
    DOM.errorPanel = document.getElementById('errorPanel');
    DOM.errorPanelList = document.getElementById('errorPanelList');
    DOM.imageAttachPreview = document.getElementById('imageAttachPreview');
}

// ========================================
// 工具函数
// ========================================
function generateId() { return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6); }
function getTimeStr() {
  const n = new Date();
  return n.getHours().toString().padStart(2, '0') + ':' +
         n.getMinutes().toString().padStart(2, '0');
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function scrollToBottom(force) {
    if (!DOM.chatMessages) return;
    // 检测用户是否在查看历史（距底部超过 150px）
    const isNearBottom = DOM.chatMessages.scrollHeight - DOM.chatMessages.scrollTop - DOM.chatMessages.clientHeight < 150;
    if (force || isNearBottom) {
        DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
        _hideNewMsgIndicator();
    } else {
        _showNewMsgIndicator();
    }
}

function _showNewMsgIndicator() {
    let indicator = document.getElementById('newMsgIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'newMsgIndicator';
        indicator.className = 'new-msg-indicator';
        indicator.innerHTML = '<i class="fas fa-chevron-down"></i> 有新消息';
        indicator.addEventListener('click', () => {
            if (DOM.chatMessages) DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
            _hideNewMsgIndicator();
        });
        // 插入到 chat-panel 中（消息区上方）
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) chatPanel.appendChild(indicator);
    }
    indicator.style.display = 'flex';
}

function _hideNewMsgIndicator() {
    const indicator = document.getElementById('newMsgIndicator');
    if (indicator) indicator.style.display = 'none';
}
function autoNameTask(p) {
  let n =
      p.replace(/帮我|做一个|生成|创建|设计|开发|请|给我/g, '')
          .trim();
  if (n.length > 20)
    n = n.substring(0, 20) + '...';
  return n || '新的游戏创作';
}

// ========================================
// 设备模拟器（收折为下拉）
// ========================================
function toggleDeviceDropdown() {
    AppState.deviceDropdownOpen = !AppState.deviceDropdownOpen;
    DOM.deviceDropdownMenu.classList.toggle('show', AppState.deviceDropdownOpen);
    DOM.deviceDropdownTrigger.classList.toggle('open', AppState.deviceDropdownOpen);
}

function closeDeviceDropdown() {
    AppState.deviceDropdownOpen = false;
    DOM.deviceDropdownMenu.classList.remove('show');
    DOM.deviceDropdownTrigger.classList.remove('open');
}

function switchDevice(deviceId) {
    AppState.currentDevice = deviceId;
    const device = DEVICES[deviceId];
    if (!device) return;

    const frame = DOM.deviceFrame;
    frame.classList.remove('landscape', 'desktop-mode', 'ipad-mode');

    if (device.type === 'desktop') {
        frame.classList.add('desktop-mode');
    } else if (device.type === 'tablet') {
        frame.classList.add('ipad-mode');
    }

    if (AppState.isLandscape && device.type !== 'desktop') {
        frame.classList.add('landscape');
    }

    DOM.deviceNotch.style.display = device.hasNotch ? 'flex' : 'none';
    DOM.deviceHomeBar.style.display = device.type !== 'desktop' ? 'flex' : 'none';

    updateDeviceSize(device);

    // 更新下拉触发器显示
    DOM.deviceDropdownLabel.textContent = device.name;
    DOM.deviceDropdownIcon.className = 'fas ' + device.icon;

    // 高亮下拉菜单项
    DOM.deviceDropdownMenu.querySelectorAll('.device-dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.device === deviceId);
    });

    // 自定义尺寸
    DOM.customSizeRow.style.display = deviceId === 'custom' ? 'flex' : 'none';

    // 方向切换选项（桌面模式下隐藏）
    const orientationItem = document.getElementById('deviceOrientationItem');
    if (orientationItem) {
        orientationItem.style.display = device.type === 'desktop' ? 'none' : 'flex';
    }
    updateOrientationLabel();

    if (deviceId !== 'custom') {
        closeDeviceDropdown();
    }
}

function updateDeviceSize(device) {
    let w = device.width;
    let h = device.height;

    if (AppState.isLandscape && device.type !== 'desktop') {
        [w, h] = [h, w];
    }

    const viewport = DOM.previewViewport;
    const vpW = viewport.clientWidth;
    const vpH = viewport.clientHeight;

    // V37: 如果 viewport 尚未布局完成（尺寸为0或极小），延迟重试
    if (vpW < 50 || vpH < 50) {
        requestAnimationFrame(() => {
            setTimeout(() => updateDeviceSize(device), 80);
        });
        // 先给一个合理的默认尺寸，避免显示黑屏小框
        DOM.deviceFrame.style.width = (w + 24) + 'px';
        DOM.deviceFrame.style.height = (h + 24 + (device.hasNotch ? 32 : 0) + (device.type !== 'desktop' ? 12 : 0)) + 'px';
        DOM.deviceFrame.style.transform = 'scale(0.5)';
        DOM.deviceFrame.style.transformOrigin = 'center center';
        DOM.deviceScreen.style.width = '';
        DOM.deviceScreen.style.height = '';
        DOM.deviceSizeLabel.textContent = `${w}×${h}`;
        return;
    }

    // 留出边距
    const maxW = vpW - 32;
    const maxH = vpH - 32;

    // 计算 frame 的 padding 占用
    let padH = 12; // padding-top of device-frame
    let padB = 12; // padding-bottom
    let padL = 12;
    let padR = 12;
    let notchH = device.hasNotch ? 32 : 0; // notch 高度
    let homeBarH = device.type !== 'desktop' ? 12 : 0; // home-bar 高度

    if (device.type === 'desktop') {
        padH = 0; padB = 0; padL = 0; padR = 0;
        notchH = 0; homeBarH = 0;
    } else if (device.type === 'tablet') {
        padH = 14; padB = 14; padL = 14; padR = 14;
    }

    // frame 的基础总尺寸（未缩放）
    const frameW = w + padL + padR;
    const frameH = h + padH + padB + notchH + homeBarH;

    // 计算缩放比：让 frame 撑满可用空间
    const scaleW = maxW / frameW;
    const scaleH = maxH / frameH;
    const scale = Math.min(scaleW, scaleH);

    // 给 device-frame 设置显式基础宽高（未缩放尺寸）
    DOM.deviceFrame.style.width = frameW + 'px';
    DOM.deviceFrame.style.height = frameH + 'px';
    DOM.deviceFrame.style.transform = `scale(${scale})`;
    DOM.deviceFrame.style.transformOrigin = 'center center';

    // device-screen 不再设置固定宽高，让 flex:1 填满 frame 剩余空间
    DOM.deviceScreen.style.width = '';
    DOM.deviceScreen.style.height = '';

    DOM.deviceSizeLabel.textContent = `${w}×${h}`;
}

function toggleDeviceOrientation() {
    const device = DEVICES[AppState.currentDevice];
    if (device.type === 'desktop') return;
    AppState.isLandscape = !AppState.isLandscape;
    switchDevice(AppState.currentDevice);
}

function updateOrientationLabel() {
    const label = document.getElementById('orientationLabel');
    const icon = document.getElementById('orientationIcon');
    if (label) {
        label.textContent = AppState.isLandscape ? '切换为竖屏' : '切换为横屏';
    }
}

function initDeviceSimulator() {
    // 下拉触发器
    DOM.deviceDropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDeviceDropdown();
    });

    // 下拉菜单项
    DOM.deviceDropdownMenu.querySelectorAll('.device-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            switchDevice(item.dataset.device);
        });
    });

    // 自定义尺寸
    document.getElementById('btnApplyCustomSize')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = parseInt(document.getElementById('customWidth').value) || 375;
        const h = parseInt(document.getElementById('customHeight').value) || 667;
        DEVICES.custom.width = w;
        DEVICES.custom.height = h;
        updateDeviceSize(DEVICES.custom);
        closeDeviceDropdown();
    });

    // 横竖屏切换（合并在下拉菜单内）
    document.getElementById('deviceOrientationItem')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDeviceOrientation();
        updateOrientationLabel();
        closeDeviceDropdown();
    });

    // 点击外部关闭下拉
    document.addEventListener('click', () => {
        if (AppState.deviceDropdownOpen) closeDeviceDropdown();
    });

    // 窗口大小变化
    window.addEventListener('resize', () => {
        const device = DEVICES[AppState.currentDevice];
        if (device) updateDeviceSize(device);
    });

    // 默认竖屏手机（确保不是横屏）
    AppState.isLandscape = false;
    switchDevice('iphone14');
}

// ========================================
// 素材坞 Asset Dock
// ========================================
function initAssetDock() { /* V40: 预览区素材坞已移除，统一在侧边栏管理 */ }

// 打开素材坞并选中某个素材
function openAssetDockAndSelect(assetId) { /* V40: deprecated */ }

// 在素材列表中选中某个素材
function selectAssetInList(assetId) {
    document.querySelectorAll('.asset-dock-item').forEach(item => {
        item.classList.remove('selected');
    });
    const targetItem = document.querySelector(`.asset-dock-item[data-asset="${assetId}"]`);
    if (targetItem) {
        targetItem.classList.add('selected');
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 更新素材副标题
function updateAssetSubtitle() {
    const usedCount = document.querySelectorAll('.asset-dock-item.used').length;
    const subtitle = document.getElementById('assetDockSubtitle');
    if (subtitle) subtitle.textContent = `当前共使用 ${usedCount} 个素材`;
}

// 清空素材坞（新建/切换项目时调用，去掉假数据）
function clearAssetDock() {
    const grid = document.getElementById('assetDockGrid');
    if (!grid) return;
    // 保留上传按钮，移除所有素材项
    grid.querySelectorAll('.asset-dock-item:not(.upload)').forEach(item => item.remove());
    // 移除清理区域
    const cleanup = document.getElementById('assetDockCleanup');
    if (cleanup) cleanup.style.display = 'none';
    updateAssetSubtitle();
}

// 画布联动：高亮定位元素
function highlightCanvasElement(assetId) {
    const selectedEl = document.getElementById('selectedElement');
    if (!selectedEl) return;

    selectedEl.classList.remove('canvas-highlight');
    void selectedEl.offsetWidth;
    selectedEl.classList.add('canvas-highlight');

    setTimeout(() => {
        selectedEl.classList.remove('canvas-highlight');
    }, 3000);
}

// ========================================
// 抛物线飞入动效（Fly-to-cart）
// ========================================
function flyAssetToInput(fromRect, assetInfo, onComplete) {
    if (!fromRect) {
        // 没有源位置，直接添加胶囊
        addAssetToken(assetInfo);
        if (onComplete) onComplete();
        return;
    }

    // 创建飞入残影
    const ghost = document.createElement('div');
    ghost.className = 'fly-asset-ghost';
    ghost.textContent = assetInfo.emoji;
    document.body.appendChild(ghost);

    // 起点：飞船在屏幕上的中心
    const startX = fromRect.left + fromRect.width / 2 - 20;
    const startY = fromRect.top + fromRect.height / 2 - 20;

    // 终点：输入框容器
    const inputContainer = document.getElementById('chatInputContainer');
    const inputRect = inputContainer.getBoundingClientRect();
    const endX = inputRect.left + 40;
    const endY = inputRect.top + 10;

    // 初始位置
    ghost.style.left = startX + 'px';
    ghost.style.top = startY + 'px';

    // 使用 requestAnimationFrame 做抛物线动画
    const duration = 450; // ms
    const startTime = performance.now();

    // 贝塞尔控制点（产生抛物线弧度）
    const cpX = (startX + endX) / 2;
    const cpY = Math.min(startY, endY) - 80; // 控制点在上方，产生弧线

    function animate(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        // 缓动函数：easeOutQuad
        const ease = 1 - (1 - t) * (1 - t);

        // 二次贝塞尔曲线
        const x = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * cpX + ease * ease * endX;
        const y = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * cpY + ease * ease * endY;

        // 缩放：从大到小
        const scale = 1 - ease * 0.5;

        ghost.style.left = x + 'px';
        ghost.style.top = y + 'px';
        ghost.style.transform = `scale(${scale})`;
        ghost.style.opacity = String(1 - ease * 0.3);

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            // 动画完成：移除残影，添加胶囊，高亮输入框
            ghost.remove();
            addAssetToken(assetInfo);
            blinkInputContainer();
            if (onComplete) onComplete();
        }
    }

    requestAnimationFrame(animate);
}

// 输入框接收高亮震馈
function blinkInputContainer() {
    const container = document.getElementById('chatInputContainer');
    if (!container) return;
    container.classList.remove('receive-blink');
    void container.offsetWidth; // force reflow
    container.classList.add('receive-blink');
    setTimeout(() => container.classList.remove('receive-blink'), 700);
}

// ========================================
// 资源胶囊 Token 管理
// ========================================
function addAssetToken(assetInfo) {
    // 防止重复添加
    if (AppState.attachedAssets.find(a => a.id === assetInfo.id)) return;

    AppState.attachedAssets.push(assetInfo);
    renderAssetTokens();
    updateCanvasReferencedState();
}

function removeAssetToken(assetId) {
    AppState.attachedAssets = AppState.attachedAssets.filter(a => a.id !== assetId);
    renderAssetTokens();
    updateCanvasReferencedState();
}

// V30: 引用条（来自单聊频道的引用）
function showQuoteReferenceBar(quote) {
    if (!DOM.quoteRefBar) return;
    DOM.quoteRefSource.textContent = `来自「${quote.source}」`;
    DOM.quoteRefPreview.textContent = quote.preview || quote.content?.slice(0, 120) || '';
    DOM.quoteRefBar.style.display = 'flex';
}
function hideQuoteReferenceBar() {
    if (!DOM.quoteRefBar) return;
    DOM.quoteRefBar.style.display = 'none';
    DOM.quoteRefSource.textContent = '';
    DOM.quoteRefPreview.textContent = '';
}

function clearAssetTokens() {
    AppState.attachedAssets = [];
    renderAssetTokens();
    updateCanvasReferencedState();
}

function renderAssetTokens() {
    const bar = DOM.assetTokenBar;
    if (!bar) return;

    if (AppState.attachedAssets.length === 0) {
        bar.innerHTML = '';
        bar.classList.remove('has-tokens');
        return;
    }

    bar.classList.add('has-tokens');
    bar.innerHTML = AppState.attachedAssets.map(asset => `
        <div class="asset-token" data-token-id="${asset.id}">
            <div class="token-thumb" style="background:${asset.thumbBg || '#1a1a2e'}">${asset.emoji}</div>
            <span class="token-name">${asset.name}</span>
            <button class="token-remove" data-remove-id="${asset.id}"><i class="fas fa-xmark"></i></button>
        </div>
    `).join('');

    // 绑定删除按钮
    bar.querySelectorAll('.token-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeAssetToken(btn.dataset.removeId);
        });
    });
}

// 画布端呼吸灯双向绑定：有胶囊时激活，无胶囊时取消
function updateCanvasReferencedState() {
    const selectedEl = document.getElementById('selectedElement');
    if (!selectedEl) return;

    const hasRocketRef = AppState.attachedAssets.some(a => a.id === 'rocket');
    if (hasRocketRef) {
        selectedEl.classList.add('asset-referenced');
    } else {
        selectedEl.classList.remove('asset-referenced');
    }
}

// ========================================
// V38: 素材管理系统（完整实现）
// ========================================

/** 从后端加载项目素材 */
async function loadProjectAssets() {
    if (!AppState.currentProjectId) return;
    try {
        const resp = await fetch(`${AppState.apiBaseUrl}/api/projects/${AppState.currentProjectId}/assets`);
        if (!resp.ok) { AppState.projectAssets = []; return; }
        const data = await resp.json();
        const baseUrl = AppState.apiBaseUrl || '';
        AppState.projectAssets =
            (data.assets || []).map(a => ({
                                      ...a,
                                      url : a.url && !a.url.startsWith('http')
                                                ? `${baseUrl}${a.url}`
                                                : a.url
                                    }));
        renderSidebarAssetEntry();
        // 如果当前正在看素材视图，也刷新
        if (AppState.activeAssetView) renderAssetView();
    } catch (e) {
        console.warn('[V38] loadProjectAssets error:', e);
        AppState.projectAssets = [];
    }
}

/** 渲染侧边栏素材快览入口 */
function renderSidebarAssetEntry() {
    const countEl = document.getElementById('sidebarAssetCount');
    const thumbsEl = document.getElementById('sidebarAssetThumbs');
    const emptyEl = document.getElementById('sidebarAssetEmpty');
    const entryEl = document.getElementById('sidebarAssetEntry');
    if (!countEl || !thumbsEl) return;

    const assets = AppState.projectAssets;
    countEl.textContent = `${assets.length} 个`;

    // 选中态
    if (entryEl) {
        entryEl.classList.toggle('active', AppState.activeAssetView);
    }

    // 渲染缩略图
    thumbsEl.innerHTML = '';
    if (assets.length === 0) {
        thumbsEl.innerHTML = '<div class="sidebar-asset-empty"><span>点击查看或上传素材</span></div>';
        return;
    }

    const maxShow = 7;
    const showAssets = assets.slice(0, maxShow);
    showAssets.forEach(a => {
        const div = document.createElement('div');
        if (a.type === 'audio') {
            div.className = 'sidebar-asset-thumb audio-thumb';
            div.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            div.className = 'sidebar-asset-thumb';
            div.innerHTML = `<img src="${a.url}" alt="${a.filename}" loading="lazy">`;
        }
        thumbsEl.appendChild(div);
    });

    if (assets.length > maxShow) {
        const overflow = document.createElement('div');
        overflow.className = 'sidebar-asset-thumb overflow-thumb';
        overflow.textContent = `+${assets.length - maxShow}`;
        thumbsEl.appendChild(overflow);
    }
}

/** 打开素材管理视图（替代聊天面板） */
function openAssetView() {
    AppState.activeAssetView = true;
    AppState.activeMemberView = null; // 互斥
    AppState.selectedAssets = new Set();

    // 更新 header
    if (DOM.chatPanelTitle) {
        DOM.chatPanelTitle.innerHTML = `
            <button class="thread-back-btn" id="assetBackBtn"><i class="fas fa-chevron-left"></i></button>
            <i class="fas fa-cube" style="margin-right:4px;color:var(--text-secondary);font-size:12px;"></i> 项目素材
            <div class="chat-panel-header-actions">
                <button class="chat-header-btn" id="assetViewUploadBtn" title="上传素材"><i class="fas fa-cloud-arrow-up"></i></button>
                <button class="chat-header-btn" id="btnReviewToggle" title="评审区"><i class="fas fa-clipboard-check"></i><span class="review-badge-dot" id="reviewBadgeDot"></span></button>
            </div>`;
        document.getElementById('assetBackBtn')?.addEventListener('click', closeAssetView);
        document.getElementById('assetViewUploadBtn')?.addEventListener('click', () => {
            const fi = document.getElementById('assetFileInput');
            if (fi) fi.click();
        });
    }

    // 隐藏聊天输入区，显示素材操作栏
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    if (inputWrapper) inputWrapper.style.display = 'none';

    // 渲染素材页面
    renderAssetView();
    renderSidebarAssetEntry();
    renderConvList(); // 刷新侧边栏选中态
}

/** 关闭素材视图 → 回到聊天 */
function closeAssetView() {
    AppState.activeAssetView = false;
    AppState.selectedAssets = new Set();

    // 恢复 header
    if (DOM.chatPanelTitle) {
        DOM.chatPanelTitle.textContent = '团队群聊';
    }
    // 恢复输入区
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    if (inputWrapper) inputWrapper.style.display = '';

    // 恢复输入框占位文字
    if (DOM.chatInput) {
        DOM.chatInput.placeholder = '描述你想要的游戏... 输入 @ 指定Agent';
    }

    // 重新渲染聊天消息
    const session = getCurrentGroupSession();
    if (session) renderChatMessages(session);

    renderSidebarAssetEntry();
    renderConvList();
}

/** 渲染素材管理全页面到 chat-messages 区域 */
function renderAssetView() {
    const container = DOM.chatMessages;
    if (!container) return;
    container.innerHTML = '';

    // 初始化素材分类数据
    if (!AppState.artCategories || AppState.artCategories.length === 0) {
        const defaults = _getDefaultAssetCategories();
        AppState.artCategories = defaults.art;
        AppState.audioCategories = defaults.audio;
    }
    if (!AppState.activeArtTab) AppState.activeArtTab = AppState.artCategories[0]?.id || 'characters';
    if (!AppState.activeAudioTab) AppState.activeAudioTab = AppState.audioCategories[0]?.id || 'bgm';

    const activeArtCat = AppState.artCategories.find(c => c.id === AppState.activeArtTab) || AppState.artCategories[0];
    const activeAudioCat = AppState.audioCategories.find(c => c.id === AppState.activeAudioTab) || AppState.audioCategories[0];

    // 美术 Tab 栏
    const artTabsHtml = AppState.artCategories.map(cat => {
        const done = cat.assets.filter(a => a.status === 'completed').length;
        return `<button class="asset-cat-tab ${cat.id === AppState.activeArtTab ? 'active' : ''}" data-cat-id="${cat.id}" data-section="art">
            ${cat.name} <span class="asset-cat-count">${done}/${cat.assets.length}</span>
        </button>`;
    }).join('');

    // 美术卡片
    const artCardsHtml = activeArtCat ? activeArtCat.assets.map((a, i) => _renderAssetGenCard(a, activeArtCat.id, i)).join('') : '';

    // 音效 Tab 栏
    const audioTabsHtml = AppState.audioCategories.map(cat => {
        const done = cat.assets.filter(a => a.status === 'completed').length;
        return `<button class="asset-cat-tab ${cat.id === AppState.activeAudioTab ? 'active' : ''}" data-cat-id="${cat.id}" data-section="audio">
            ${cat.name} <span class="asset-cat-count">${done}/${cat.assets.length}</span>
        </button>`;
    }).join('');

    // 音效卡片
    const audioCardsHtml = activeAudioCat ? activeAudioCat.assets.map((a, i) => _renderAssetGenCard(a, activeAudioCat.id, i)).join('') : '';

    container.innerHTML = `
        <div class="asset-gen-page">
            <!-- ===== 顶部操作栏 ===== -->
            <div class="asset-import-toolbar">
                <button class="asset-import-btn" id="importAssetPackBtn">
                    <i class="fas fa-file-import"></i> 导入素材包
                </button>
            </div>

            <!-- ===== 导入素材包弹窗 ===== -->
            <div class="asset-import-modal-overlay" id="assetImportModal" style="display:none;">
                <div class="asset-import-modal">
                    <div class="asset-import-modal-header">
                        <h3><i class="fas fa-file-import"></i> 导入素材包</h3>
                        <button class="asset-import-modal-close" id="closeImportModal"><i class="fas fa-xmark"></i></button>
                    </div>
                    <div class="asset-import-modal-body">
                        <!-- 三个入口卡片 -->
                        <div class="asset-import-options">
                            <!-- 1. 本地导入 -->
                            <div class="asset-import-option" id="importFromLocal">
                                <div class="asset-import-option-icon"><i class="fas fa-folder-open"></i></div>
                                <div class="asset-import-option-info">
                                    <h4>本地导入</h4>
                                    <p>从电脑选择素材文件或素材包（ZIP）上传到项目中</p>
                                </div>
                                <i class="fas fa-chevron-right asset-import-option-arrow"></i>
                            </div>
                            <!-- 2. 我的收藏 -->
                            <div class="asset-import-option" id="importFromFavorites">
                                <div class="asset-import-option-icon star"><i class="fas fa-star"></i></div>
                                <div class="asset-import-option-info">
                                    <h4>我的收藏</h4>
                                    <p>查看在平台收藏的素材包或单个素材，一键导入到项目</p>
                                </div>
                                <i class="fas fa-chevron-right asset-import-option-arrow"></i>
                            </div>
                            <!-- 3. 一键推荐素材包 -->
                            <div class="asset-import-option" id="importFromRecommend">
                                <div class="asset-import-option-icon ai"><i class="fas fa-wand-magic-sparkles"></i></div>
                                <div class="asset-import-option-info">
                                    <h4>一键推荐素材包</h4>
                                    <p>让绘绘根据你的游戏方案智能推荐最合适的素材包</p>
                                </div>
                                <i class="fas fa-chevron-right asset-import-option-arrow"></i>
                            </div>
                        </div>

                        <!-- 本地导入面板 (默认隐藏) -->
                        <div class="asset-import-panel" id="localImportPanel" style="display:none;">
                            <div class="asset-import-panel-back" id="backFromLocal">
                                <i class="fas fa-arrow-left"></i> 返回
                            </div>
                            <div class="asset-import-dropzone" id="localDropzone">
                                <i class="fas fa-cloud-arrow-up"></i>
                                <p>拖拽文件到此处，或点击选择</p>
                                <span>支持 PNG / JPG / SVG / MP3 / WAV / ZIP 素材包</span>
                                <input type="file" id="localFileInput" multiple accept=".png,.jpg,.jpeg,.svg,.mp3,.wav,.ogg,.zip" style="display:none;">
                            </div>
                            <div class="asset-import-file-list" id="localFileList"></div>
                            <button class="asset-import-confirm-btn" id="confirmLocalImport" style="display:none;">
                                <i class="fas fa-check"></i> 确认导入
                            </button>
                        </div>

                        <!-- 我的收藏面板 (默认隐藏) -->
                        <div class="asset-import-panel" id="favoritesPanel" style="display:none;">
                            <div class="asset-import-panel-back" id="backFromFavorites">
                                <i class="fas fa-arrow-left"></i> 返回
                            </div>
                            <div class="asset-import-fav-tabs">
                                <button class="asset-import-fav-tab active" data-fav-type="packs">素材包</button>
                                <button class="asset-import-fav-tab" data-fav-type="singles">单个素材</button>
                            </div>
                            <div class="asset-import-fav-grid" id="favoritesGrid">
                                ${_renderFavoriteMockData('packs')}
                            </div>
                        </div>

                        <!-- 推荐素材包面板 (默认隐藏) -->
                        <div class="asset-import-panel" id="recommendPanel" style="display:none;">
                            <div class="asset-import-panel-back" id="backFromRecommend">
                                <i class="fas fa-arrow-left"></i> 返回
                            </div>
                            <div class="asset-import-recommend-hint">
                                <i class="fas fa-robot"></i>
                                <p>将跳转到<strong>绘绘</strong>的聊天页面，根据你的游戏方案自动推荐最匹配的素材包。</p>
                            </div>
                            <button class="asset-import-recommend-btn" id="goToHuihui">
                                <i class="fas fa-comments"></i> 进入绘绘聊天
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== 美术区 ===== -->
            <div class="asset-gen-section">
                <div class="asset-gen-section-title">
                    <i class="fas fa-palette"></i> 美术素材
                </div>
                <div class="asset-gen-tabs-bar">
                    <div class="asset-gen-tabs">${artTabsHtml}</div>
                    <button class="asset-gen-all-btn" data-section="art" id="artGenAllBtn">
                        <i class="fas fa-wand-magic-sparkles"></i> 全部生成
                    </button>
                </div>
                ${activeArtCat ? `
                <div class="asset-gen-category-header">
                    <div class="asset-gen-cat-info">
                        <h3 class="asset-gen-cat-title">${activeArtCat.name}</h3>
                        <p class="asset-gen-cat-desc">${activeArtCat.description}</p>
                    </div>
                </div>
                <div class="asset-gen-grid">${artCardsHtml}</div>
                ` : ''}
            </div>

            <!-- ===== 音效区 ===== -->
            <div class="asset-gen-section asset-gen-section-audio">
                <div class="asset-gen-section-title">
                    <i class="fas fa-headphones"></i> 音效素材
                </div>
                <div class="asset-gen-tabs-bar">
                    <div class="asset-gen-tabs">${audioTabsHtml}</div>
                    <button class="asset-gen-all-btn" data-section="audio" id="audioGenAllBtn">
                        <i class="fas fa-wand-magic-sparkles"></i> 全部生成
                    </button>
                </div>
                ${activeAudioCat ? `
                <div class="asset-gen-category-header">
                    <div class="asset-gen-cat-info">
                        <h3 class="asset-gen-cat-title">${activeAudioCat.name}</h3>
                        <p class="asset-gen-cat-desc">${activeAudioCat.description}</p>
                    </div>
                </div>
                <div class="asset-gen-grid asset-gen-grid-audio">${audioCardsHtml}</div>
                ` : ''}
            </div>
        </div>`;

    _bindAssetGenEvents();
}

/** 默认素材分类 */
function _getDefaultAssetCategories() {
    return {
        art: [
            {
                id: 'characters',
                name: '角色',
                description: '玩家角色、敌人、NPC 等游戏角色素材',
                assets: [
                    { id: 'char-1', name: '玩家主角', prompt: '像素风格的太空战机，朝右飞行，蓝色光效，透明背景', status: 'idle', imageUrl: '' },
                    { id: 'char-2', name: '小型敌机 A', prompt: '像素风格的小型敌机，红色配色，朝左飞行，透明背景', status: 'idle', imageUrl: '' },
                    { id: 'char-3', name: '小型敌机 B', prompt: '像素风格的小型敌机，紫色配色，朝左飞行，透明背景', status: 'idle', imageUrl: '' },
                    { id: 'char-4', name: 'BOSS', prompt: '像素风格的大型BOSS飞船，红黑配色，威武霸气，透明背景', status: 'idle', imageUrl: '' },
                ]
            },
            {
                id: 'backgrounds',
                name: '背景',
                description: '游戏场景、背景、环境素材',
                assets: [
                    { id: 'bg-1', name: '星空滚动背景', prompt: '深蓝色星空背景，星星闪烁，适合横版滚动，无缝平铺', status: 'idle', imageUrl: '' },
                    { id: 'bg-2', name: '星云装饰', prompt: '紫色和蓝色的星云，半透明，适合叠加在星空上', status: 'idle', imageUrl: '' },
                    { id: 'bg-3', name: '远景行星', prompt: '远处的行星，暗色调，半透明，作为背景装饰', status: 'idle', imageUrl: '' },
                ]
            },
            {
                id: 'effects',
                name: '特效',
                description: '爆炸、粒子、光效等特效素材',
                assets: [
                    { id: 'fx-1', name: '爆炸动画', prompt: '像素风格的爆炸效果，橙黄色，8帧sprite sheet，透明背景', status: 'idle', imageUrl: '' },
                    { id: 'fx-2', name: '子弹', prompt: '蓝色能量子弹，像素风格，发光效果，透明背景', status: 'idle', imageUrl: '' },
                    { id: 'fx-3', name: '护盾光效', prompt: '半透明蓝色护盾球，像素风格，发光，透明背景', status: 'idle', imageUrl: '' },
                ]
            },
            {
                id: 'ui',
                name: 'UI',
                description: '界面元素、按钮、图标等 UI 素材',
                assets: [
                    { id: 'ui-1', name: '开始按钮', prompt: '像素风格的"START"按钮，绿色发光边框，透明背景', status: 'idle', imageUrl: '' },
                    { id: 'ui-2', name: '血条', prompt: '像素风格的血条UI，红色填充绿色边框，横版，透明背景', status: 'idle', imageUrl: '' },
                    { id: 'ui-3', name: '游戏LOGO', prompt: '太空射击游戏LOGO，霓虹字体效果，像素风格', status: 'idle', imageUrl: '' },
                ]
            },
        ],
        audio: [
            {
                id: 'bgm',
                name: 'BGM',
                description: '背景音乐 — 循环播放的游戏配乐',
                assets: [
                    { id: 'bgm-1', name: '主菜单 BGM', prompt: '太空氛围电子音乐，节奏舒缓，适合主菜单循环播放，8-bit风格', status: 'idle', imageUrl: '' },
                    { id: 'bgm-2', name: '战斗 BGM', prompt: '紧张刺激的太空战斗音乐，节奏快，8-bit电子风格，适合循环', status: 'idle', imageUrl: '' },
                    { id: 'bgm-3', name: 'BOSS 战 BGM', prompt: '史诗感BOSS战音乐，紧迫感强，电子合成器风格', status: 'idle', imageUrl: '' },
                ]
            },
            {
                id: 'voice',
                name: '角色声音',
                description: '角色语音、台词、反应声等',
                assets: [
                    { id: 'voice-1', name: '开火语音', prompt: '战斗机飞行员开火时的短促呼喊，科幻风格', status: 'idle', imageUrl: '' },
                    { id: 'voice-2', name: '受伤语音', prompt: '角色受到攻击时的痛苦呻吟，简短', status: 'idle', imageUrl: '' },
                    { id: 'voice-3', name: '胜利语音', prompt: '通关胜利时的欢呼声，兴奋的语调', status: 'idle', imageUrl: '' },
                ]
            },
            {
                id: 'sfx',
                name: '音效',
                description: '交互音效 — 射击、爆炸、拾取等',
                assets: [
                    { id: 'sfx-1', name: '激光射击', prompt: '激光枪射击音效，短促有力，8-bit风格', status: 'idle', imageUrl: '' },
                    { id: 'sfx-2', name: '敌机爆炸', prompt: '敌机被击毁的爆炸音效，有冲击感，8-bit风格', status: 'idle', imageUrl: '' },
                    { id: 'sfx-3', name: '道具拾取', prompt: '拾取道具的叮咚音效，清脆悦耳', status: 'idle', imageUrl: '' },
                    { id: 'sfx-4', name: '护盾激活', prompt: '护盾开启的能量音效，有科技感', status: 'idle', imageUrl: '' },
                    { id: 'sfx-5', name: '失败音效', prompt: '游戏失败/死亡的低沉警告声', status: 'idle', imageUrl: '' },
                ]
            },
        ],
    };
}

/** 渲染单个素材生成卡片 */
function _renderAssetGenCard(asset, categoryId, index) {
    const isAudio = (categoryId === 'bgm' || categoryId === 'voice' || categoryId === 'sfx');
    const statusClass = asset.status || 'idle';

    let thumbContent = '';
    if (asset.status === 'generating') {
        thumbContent = `<div class="asset-gen-loading"><i class="fas fa-spinner fa-spin"></i><span>生成中...</span></div>`;
    } else if (asset.imageUrl) {
        if (isAudio) {
            thumbContent = `<div class="asset-gen-audio-done"><i class="fas fa-music"></i><span>已生成</span></div>`;
        } else {
            thumbContent = `<img src="${asset.imageUrl}" alt="${escapeHTML(asset.name)}" loading="lazy">`;
        }
    } else if (asset.status === 'error') {
        thumbContent = `<div class="asset-gen-error"><i class="fas fa-exclamation-triangle"></i><span>生成失败</span></div>`;
    } else {
        thumbContent = `<div class="asset-gen-empty"><i class="fas ${isAudio ? 'fa-music' : 'fa-image'}"></i><span>待生成</span></div>`;
    }

    return `
        <div class="asset-gen-card ${statusClass}" data-asset-id="${asset.id}" data-cat-id="${categoryId}">
            <div class="asset-gen-card-header">
                <span class="asset-gen-card-name">${escapeHTML(asset.name)}</span>
                <button class="asset-gen-card-edit" data-action="edit-prompt" title="编辑 Prompt">
                    <i class="fas fa-pen"></i>
                </button>
            </div>
            <div class="asset-gen-card-thumb">${thumbContent}</div>
            <div class="asset-gen-card-prompt" id="prompt-${asset.id}">
                <span class="prompt-text">${escapeHTML(asset.prompt)}</span>
            </div>
            <div class="asset-gen-card-prompt-edit" id="prompt-edit-${asset.id}" style="display:none;">
                <textarea class="prompt-textarea">${escapeHTML(asset.prompt)}</textarea>
                <div class="prompt-edit-actions">
                    <button class="prompt-save-btn" data-action="save-prompt"><i class="fas fa-check"></i> 保存</button>
                    <button class="prompt-cancel-btn" data-action="cancel-prompt"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
            <div class="asset-gen-card-footer">
                <button class="asset-gen-btn ${asset.status === 'generating' ? 'disabled' : ''}" data-action="generate">
                    <i class="fas ${asset.imageUrl ? 'fa-rotate-right' : 'fa-wand-magic-sparkles'}"></i>
                    ${asset.imageUrl ? '重新生成' : '生成'}
                </button>
            </div>
        </div>`;
}

/** 绑定素材生成页事件 */
function _bindAssetGenEvents() {
    // Tab 切换（美术 + 音效）
    document.querySelectorAll('.asset-cat-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            if (section === 'audio') {
                AppState.activeAudioTab = tab.dataset.catId;
            } else {
                AppState.activeArtTab = tab.dataset.catId;
            }
            renderAssetView();
        });
    });

    // 全部生成（美术）
    document.getElementById('artGenAllBtn')?.addEventListener('click', () => {
        const cat = AppState.artCategories.find(c => c.id === AppState.activeArtTab);
        if (!cat) return;
        cat.assets.forEach(asset => {
            if (asset.status !== 'generating' && asset.status !== 'completed') {
                _simulateAssetGeneration(cat.id, asset.id);
            }
        });
    });

    // 全部生成（音效）
    document.getElementById('audioGenAllBtn')?.addEventListener('click', () => {
        const cat = AppState.audioCategories.find(c => c.id === AppState.activeAudioTab);
        if (!cat) return;
        cat.assets.forEach(asset => {
            if (asset.status !== 'generating' && asset.status !== 'completed') {
                _simulateAssetGeneration(cat.id, asset.id);
            }
        });
    });

    // 卡片操作
    document.querySelectorAll('.asset-gen-card').forEach(card => {
        const assetId = card.dataset.assetId;
        const catId = card.dataset.catId;

        // 生成/重新生成
        card.querySelector('[data-action="generate"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            _simulateAssetGeneration(catId, assetId);
        });

        // 编辑 prompt
        card.querySelector('[data-action="edit-prompt"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const promptEl = document.getElementById(`prompt-${assetId}`);
            const editEl = document.getElementById(`prompt-edit-${assetId}`);
            if (promptEl) promptEl.style.display = 'none';
            if (editEl) editEl.style.display = 'block';
        });

        // 保存 prompt
        card.querySelector('[data-action="save-prompt"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const editEl = document.getElementById(`prompt-edit-${assetId}`);
            const textarea = editEl?.querySelector('.prompt-textarea');
            if (textarea) {
                const cat = AppState.assetCategories.find(c => c.id === catId);
                const asset = cat?.assets.find(a => a.id === assetId);
                if (asset) {
                    asset.prompt = textarea.value;
                    renderAssetView();
                }
            }
        });

        // 取消编辑
        card.querySelector('[data-action="cancel-prompt"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const promptEl = document.getElementById(`prompt-${assetId}`);
            const editEl = document.getElementById(`prompt-edit-${assetId}`);
            if (promptEl) promptEl.style.display = '';
            if (editEl) editEl.style.display = 'none';
        });
    });

    // 绑定导入素材包弹窗事件
    _bindAssetImportEvents();
}

/** 渲染收藏 Mock 数据 */
function _renderFavoriteMockData(type) {
    if (type === 'packs') {
        const packs = [
            { id: 'pack-1', name: '像素太空射击', cover: '', count: 24, author: '官方', desc: '完整太空射击游戏素材包，含角色/背景/UI/音效' },
            { id: 'pack-2', name: '卡通农场经营', cover: '', count: 36, author: '小鱼工作室', desc: '可爱卡通风农场经营全套素材' },
            { id: 'pack-3', name: '赛博朋克跑酷', cover: '', count: 18, author: '官方', desc: '霓虹风赛博朋克跑酷游戏素材' },
            { id: 'pack-4', name: '中国风消除', cover: '', count: 42, author: '墨染设计', desc: '水墨中国风三消游戏素材包' },
        ];
        return packs.map(p => `
            <div class="asset-fav-card pack" data-pack-id="${p.id}">
                <div class="asset-fav-card-cover">
                    <div class="asset-fav-card-cover-placeholder"><i class="fas fa-box-open"></i></div>
                </div>
                <div class="asset-fav-card-info">
                    <h5>${escapeHTML(p.name)}</h5>
                    <p class="asset-fav-card-desc">${escapeHTML(p.desc)}</p>
                    <div class="asset-fav-card-meta">
                        <span><i class="fas fa-image"></i> ${p.count} 个素材</span>
                        <span><i class="fas fa-user"></i> ${escapeHTML(p.author)}</span>
                    </div>
                </div>
                <button class="asset-fav-import-btn" data-pack-id="${p.id}"><i class="fas fa-download"></i> 导入</button>
            </div>
        `).join('');
    } else {
        const singles = [
            { id: 'fav-s1', name: '星空背景', type: 'image', category: '背景', thumb: '' },
            { id: 'fav-s2', name: '像素剑士', type: 'image', category: '角色', thumb: '' },
            { id: 'fav-s3', name: '8-bit 战斗 BGM', type: 'audio', category: 'BGM', thumb: '' },
            { id: 'fav-s4', name: '爆炸音效', type: 'audio', category: '音效', thumb: '' },
            { id: 'fav-s5', name: '按钮图标', type: 'image', category: 'UI', thumb: '' },
            { id: 'fav-s6', name: '草地纹理', type: 'image', category: '背景', thumb: '' },
        ];
        return singles.map(s => `
            <div class="asset-fav-card single" data-single-id="${s.id}">
                <div class="asset-fav-card-thumb-sm">
                    <i class="fas ${s.type === 'audio' ? 'fa-music' : 'fa-image'}"></i>
                </div>
                <div class="asset-fav-card-info">
                    <h5>${escapeHTML(s.name)}</h5>
                    <span class="asset-fav-card-tag">${escapeHTML(s.category)}</span>
                </div>
                <button class="asset-fav-import-btn" data-single-id="${s.id}"><i class="fas fa-download"></i> 导入</button>
            </div>
        `).join('');
    }
}

/** 绑定导入素材包弹窗事件 */
function _bindAssetImportEvents() {
    const modal = document.getElementById('assetImportModal');
    if (!modal) return;

    // 打开弹窗
    document.getElementById('importAssetPackBtn')?.addEventListener('click', () => {
        modal.style.display = 'flex';
        // 重置到选项视图
        _showImportOptions();
    });

    // 关闭弹窗
    document.getElementById('closeImportModal')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // ---- 三个入口 ----
    document.getElementById('importFromLocal')?.addEventListener('click', () => {
        _hideImportOptions();
        document.getElementById('localImportPanel').style.display = '';
    });
    document.getElementById('importFromFavorites')?.addEventListener('click', () => {
        _hideImportOptions();
        document.getElementById('favoritesPanel').style.display = '';
    });
    document.getElementById('importFromRecommend')?.addEventListener('click', () => {
        _hideImportOptions();
        document.getElementById('recommendPanel').style.display = '';
    });

    // ---- 返回按钮 ----
    document.getElementById('backFromLocal')?.addEventListener('click', () => {
        document.getElementById('localImportPanel').style.display = 'none';
        _showImportOptions();
    });
    document.getElementById('backFromFavorites')?.addEventListener('click', () => {
        document.getElementById('favoritesPanel').style.display = 'none';
        _showImportOptions();
    });
    document.getElementById('backFromRecommend')?.addEventListener('click', () => {
        document.getElementById('recommendPanel').style.display = 'none';
        _showImportOptions();
    });

    // ---- 本地导入：文件选择 & 拖拽 ----
    const dropzone = document.getElementById('localDropzone');
    const fileInput = document.getElementById('localFileInput');
    dropzone?.addEventListener('click', () => fileInput?.click());
    dropzone?.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone?.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        _handleLocalFiles(e.dataTransfer.files);
    });
    fileInput?.addEventListener('change', () => {
        if (fileInput.files.length) _handleLocalFiles(fileInput.files);
    });

    // 确认本地导入
    document.getElementById('confirmLocalImport')?.addEventListener('click', () => {
        _doLocalImport();
    });

    // ---- 收藏 Tab 切换 ----
    document.querySelectorAll('.asset-import-fav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.asset-import-fav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const grid = document.getElementById('favoritesGrid');
            if (grid) grid.innerHTML = _renderFavoriteMockData(tab.dataset.favType);
            _bindFavImportBtns();
        });
    });
    _bindFavImportBtns();

    // ---- 一键推荐 → 跳转绘绘 ----
    document.getElementById('goToHuihui')?.addEventListener('click', () => {
        modal.style.display = 'none';
        // 找到绘绘 Agent（美术相关），切换到对应聊天
        _switchToHuihuiChat();
    });
}

function _showImportOptions() {
    const opts = document.querySelector('.asset-import-options');
    if (opts) opts.style.display = '';
    document.getElementById('localImportPanel') && (document.getElementById('localImportPanel').style.display = 'none');
    document.getElementById('favoritesPanel') && (document.getElementById('favoritesPanel').style.display = 'none');
    document.getElementById('recommendPanel') && (document.getElementById('recommendPanel').style.display = 'none');
}
function _hideImportOptions() {
    const opts = document.querySelector('.asset-import-options');
    if (opts) opts.style.display = 'none';
}

/** 处理本地文件选择 */
let _pendingLocalFiles = [];
function _handleLocalFiles(fileList) {
    _pendingLocalFiles = Array.from(fileList);
    const listEl = document.getElementById('localFileList');
    const confirmBtn = document.getElementById('confirmLocalImport');
    if (listEl) {
        listEl.innerHTML = _pendingLocalFiles.map(f => `
            <div class="asset-import-file-item">
                <i class="fas ${f.name.endsWith('.zip') ? 'fa-file-zipper' : f.type.startsWith('audio') ? 'fa-music' : 'fa-image'}"></i>
                <span class="asset-import-file-name">${escapeHTML(f.name)}</span>
                <span class="asset-import-file-size">${(f.size / 1024).toFixed(1)} KB</span>
            </div>
        `).join('');
    }
    if (confirmBtn) confirmBtn.style.display = _pendingLocalFiles.length ? '' : 'none';
}

/** 执行本地导入（仿真） */
function _doLocalImport() {
    if (!_pendingLocalFiles.length) return;
    const count = _pendingLocalFiles.length;
    _pendingLocalFiles = [];
    document.getElementById('assetImportModal').style.display = 'none';
    // Toast 提示
    _showImportToast(`成功导入 ${count} 个素材文件`);
}

/** 绑定收藏导入按钮 */
function _bindFavImportBtns() {
    document.querySelectorAll('.asset-fav-import-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const packId = btn.dataset.packId;
            const singleId = btn.dataset.singleId;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-check"></i> 已导入';
            btn.classList.add('imported');
            _showImportToast(packId ? '素材包已导入到项目' : '素材已导入到项目');
        });
    });
}

/** 跳转到绘绘聊天 */
function _switchToHuihuiChat() {
    // 找美术相关 Agent：优先匹配名称含"绘"或"美术"或"Art"的
    const agents = AppState.agents || [];
    const huihui = agents.find(a => /绘|美术|art|画/i.test(a.name || a.role || ''));
    if (huihui) {
        AppState.activeAssetView = false;
        AppState.activeConvId = huihui.id || huihui.convId || 'art-agent';
        renderConvList();
        const chatEl = DOM.chatMessages;
        if (chatEl) {
            chatEl.innerHTML = '';
            // 发送一条自动消息
            _appendSystemBubble('已进入绘绘的聊天页面，你可以描述你的游戏方案，让绘绘为你推荐最合适的素材包 🎨');
        }
        const inputWrapper = document.querySelector('.chat-input-wrapper, .input-wrapper, .chat-input-area');
        if (inputWrapper) inputWrapper.style.display = '';
    } else {
        // fallback: 回到主聊天并提示
        AppState.activeAssetView = false;
        renderConvList();
        const chatEl = DOM.chatMessages;
        if (chatEl) {
            chatEl.innerHTML = '';
            _appendSystemBubble('正在为你连接绘绘... 请在聊天中描述你的游戏需求，绘绘会推荐合适的素材包 🎨');
        }
        const inputWrapper = document.querySelector('.chat-input-wrapper, .input-wrapper, .chat-input-area');
        if (inputWrapper) inputWrapper.style.display = '';
    }
}

/** 简易 Toast 提示 */
function _showImportToast(msg) {
    const existing = document.querySelector('.asset-import-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'asset-import-toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHTML(msg)}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

/** 系统消息气泡 */
function _appendSystemBubble(text) {
    const chatEl = DOM.chatMessages;
    if (!chatEl) return;
    const div = document.createElement('div');
    div.className = 'message-row ai';
    div.innerHTML = `<div class="msg-bubble ai-bubble"><div class="msg-text">${text}</div></div>`;
    chatEl.appendChild(div);
}

/** 模拟素材生成（仿真模式下随机延迟后标记完成） */
function _simulateAssetGeneration(catId, assetId) {
    const allCats = [...(AppState.artCategories || []), ...(AppState.audioCategories || [])];
    const cat = allCats.find(c => c.id === catId);
    const asset = cat?.assets.find(a => a.id === assetId);
    if (!asset) return;

    asset.status = 'generating';
    renderAssetView();

    // 模拟 1.5-4 秒生成时间
    const delay = 1500 + Math.random() * 2500;
    setTimeout(() => {
        // 生成一个示意占位图（渐变色块）
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const hue = Math.floor(Math.random() * 360);
        const grad = ctx.createLinearGradient(0, 0, 256, 256);
        grad.addColorStop(0, `hsl(${hue}, 60%, 30%)`);
        grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 50%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        // 画个简单图标
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '80px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icons = ['🚀', '👾', '💥', '🌌', '🎮', '🛡️', '🎵', '🎨'];
        ctx.fillText(icons[Math.floor(Math.random() * icons.length)], 128, 128);

        asset.imageUrl = canvas.toDataURL('image/png');
        asset.status = 'completed';
        renderAssetView();
    }, delay);
}

/** 空状态 */
function _renderAssetEmpty() {
    if (AppState.assetSearch || AppState.assetFilter !== 'all') {
        return `<div class="asset-empty-state">
            <div class="asset-empty-icon">🔍</div>
            <div class="asset-empty-title">没有找到匹配的素材</div>
            <div class="asset-empty-desc">试试调整搜索词或筛选条件</div>
        </div>`;
    }
    return `<div class="asset-empty-state">
        <div class="asset-empty-icon">🎨</div>
        <div class="asset-empty-title">还没有素材</div>
        <div class="asset-empty-desc">上传文件或让 AI 工作室在协作中自动生成</div>
        <div class="asset-empty-actions">
            <button class="asset-empty-btn" id="assetEmptyUpload"><i class="fas fa-cloud-arrow-up"></i> 上传素材</button>
            <button class="asset-empty-btn primary" id="assetEmptyChat"><i class="fas fa-comments"></i> 回到对话</button>
        </div>
    </div>`;
}

/** 获取筛选后的素材列表 */
function _getFilteredAssets() {
    let list = [...AppState.projectAssets];
    // 类型筛选
    if (AppState.assetFilter === 'image') list = list.filter(a => a.type === 'image');
    else if (AppState.assetFilter === 'audio') list = list.filter(a => a.type === 'audio');
    else if (AppState.assetFilter === 'unused') list = list.filter(a => !a.usedInCode);
    // 搜索
    if (AppState.assetSearch) {
        const kw = AppState.assetSearch.toLowerCase();
        list = list.filter(a => a.filename.toLowerCase().includes(kw) || (a.prompt && a.prompt.toLowerCase().includes(kw)));
    }
    return list;
}

/** 绑定素材视图所有事件 */
function _bindAssetViewEvents() {
    // 搜索
    const searchInput = document.getElementById('assetSearchInput2');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppState.assetSearch = e.target.value;
            _refreshAssetGrid();
        });
    }

    // 筛选按钮
    document.querySelectorAll('.asset-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            AppState.assetFilter = btn.dataset.filter;
            renderAssetView();
        });
    });

    // 卡片点击（预览）
    document.querySelectorAll('.asset-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // 如果点的是checkbox
            if (e.target.closest('[data-checkbox]')) {
                e.stopPropagation();
                const fn = card.dataset.filename;
                if (AppState.selectedAssets.has(fn)) AppState.selectedAssets.delete(fn);
                else AppState.selectedAssets.add(fn);
                _refreshAssetGrid();
                _updateAssetActionBar();
                return;
            }
            // 如果点的是hover action按钮
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                e.stopPropagation();
                const action = actionBtn.dataset.action;
                const fn = card.dataset.filename;
                if (action === 'preview') openAssetPreview(fn);
                else if (action === 'copy') _copyAssetPath(fn);
                else if (action === 'delete') _deleteAsset(fn);
                return;
            }
            // 默认：打开预览
            openAssetPreview(card.dataset.filename);
        });

        // 右键菜单
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            _showAssetContextMenu(e, card.dataset.filename);
        });
    });

    // 上传按钮
    const fileInput = document.getElementById('assetFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            _handleAssetUpload(e.target.files);
            e.target.value = '';
        });
    }

    document.getElementById('assetBtnUploadBottom')?.addEventListener('click', () => {
        document.getElementById('assetFileInput')?.click();
    });
    document.getElementById('assetEmptyUpload')?.addEventListener('click', () => {
        document.getElementById('assetFileInput')?.click();
    });
    document.getElementById('assetEmptyChat')?.addEventListener('click', closeAssetView);
}

/** 只刷新网格区域（不重建整个页面） */
function _refreshAssetGrid() {
    const gridContainer = document.getElementById('assetGridContainer');
    if (!gridContainer) return;
    const assets = _getFilteredAssets();
    if (assets.length > 0) {
        gridContainer.innerHTML = `<div class="asset-grid" id="assetGrid">${assets.map((a, i) => _renderAssetCard(a, i)).join('')}</div>`;
    } else {
        gridContainer.innerHTML = _renderAssetEmpty();
    }
    // 重新绑定卡片事件
    document.querySelectorAll('.asset-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-checkbox]')) {
                e.stopPropagation();
                const fn = card.dataset.filename;
                if (AppState.selectedAssets.has(fn)) AppState.selectedAssets.delete(fn);
                else AppState.selectedAssets.add(fn);
                _refreshAssetGrid();
                _updateAssetActionBar();
                return;
            }
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                e.stopPropagation();
                const action = actionBtn.dataset.action;
                const fn = card.dataset.filename;
                if (action === 'preview') openAssetPreview(fn);
                else if (action === 'copy') _copyAssetPath(fn);
                else if (action === 'delete') _deleteAsset(fn);
                return;
            }
            openAssetPreview(card.dataset.filename);
        });
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            _showAssetContextMenu(e, card.dataset.filename);
        });
    });
}

/** 更新底部操作栏（多选模式） */
function _updateAssetActionBar() {
    const bar = document.getElementById('assetActionBar');
    if (!bar) return;
    const count = AppState.selectedAssets.size;
    if (count > 0) {
        bar.innerHTML = `
            <div class="action-label">已选 ${count} 个</div>
            <div class="action-btns">
                <button class="asset-action-btn" id="assetBatchCopy"><i class="fas fa-clipboard"></i> 复制路径</button>
                <button class="asset-action-btn danger" id="assetBatchDelete"><i class="fas fa-trash"></i> 删除</button>
                <button class="asset-action-btn" id="assetBatchCancel">取消</button>
            </div>`;
        document.getElementById('assetBatchCopy')?.addEventListener('click', () => {
            const paths = [...AppState.selectedAssets].map(fn => {
                const a = AppState.projectAssets.find(x => x.filename === fn);
                return a ? a.path : fn;
            });
            navigator.clipboard?.writeText(paths.join('\n'));
            _showAssetToast('已复制 ' + paths.length + ' 个路径');
        });
        document.getElementById('assetBatchDelete')?.addEventListener('click', async () => {
            if (!confirm(`确认删除 ${count} 个素材？此操作不可撤销。`)) return;
            for (const fn of [...AppState.selectedAssets]) {
                await _deleteAssetAPI(fn);
            }
            AppState.selectedAssets.clear();
            await loadProjectAssets();
        });
        document.getElementById('assetBatchCancel')?.addEventListener('click', () => {
            AppState.selectedAssets.clear();
            _refreshAssetGrid();
            _updateAssetActionBar();
        });
    } else {
        bar.innerHTML = `
            <div class="action-btns">
                <button class="asset-action-btn primary" id="assetBtnUploadBottom"><i class="fas fa-cloud-arrow-up"></i> 上传素材</button>
            </div>`;
        document.getElementById('assetBtnUploadBottom')?.addEventListener('click', () => {
            document.getElementById('assetFileInput')?.click();
        });
    }
}

/** 打开素材预览弹层 */
function openAssetPreview(filename) {
    const assets = _getFilteredAssets();
    const idx = assets.findIndex(a => a.filename === filename);
    if (idx < 0) return;
    AppState.assetPreviewIndex = idx;
    _renderAssetPreview(assets[idx], assets);
}

function _renderAssetPreview(asset, assets) {
    const overlay = DOM.imagePreviewOverlay;
    const img = document.getElementById('imagePreviewImg');
    const audioPreview = document.getElementById('assetAudioPreview');
    const infoBar = document.getElementById('assetInfoBar');
    const infoDetails = document.getElementById('assetInfoDetails');
    const prevBtn = document.getElementById('assetNavPrev');
    const nextBtn = document.getElementById('assetNavNext');
    const audioPlayer = document.getElementById('audioPreviewPlayer');
    const audioName = document.getElementById('audioPreviewName');
    if (!overlay) return;

    overlay.style.display = 'flex';

    if (asset.type === 'image') {
        img.src = asset.url;
        img.style.display = '';
        if (audioPreview) audioPreview.style.display = 'none';
    } else {
        img.style.display = 'none';
        if (audioPreview) {
            audioPreview.style.display = 'flex';
            if (audioPlayer) audioPlayer.src = asset.url;
            if (audioName) audioName.textContent = asset.filename;
        }
    }

    // 信息栏
    if (infoBar) {
        infoBar.style.display = '';
        const sizeStr = _formatSize(asset.size);
        let detailsHTML = `
            <span><span class="info-label">文件名</span> <span class="info-value">${escapeHTML(asset.filename)}</span></span>
            <span><span class="info-label">大小</span> <span class="info-value">${sizeStr}</span></span>
            <span><span class="info-label">类型</span> <span class="info-value">${asset.type === 'image' ? '图片' : '音频'}</span></span>
            <span><span class="info-label">引用</span> <span class="info-value">${asset.usedInCode ? '✅ 已引用' : '⚠️ 未使用'}</span></span>`;
        if (asset.prompt) {
            detailsHTML += `<span style="width:100%;"><span class="info-label">🤖 AI Prompt</span> <span class="info-value">${escapeHTML(asset.prompt.slice(0, 100))}${asset.prompt.length > 100 ? '...' : ''}</span></span>`;
        }
        if (infoDetails) infoDetails.innerHTML = detailsHTML;
    }

    // 左右切换按钮
    if (prevBtn) prevBtn.style.display = AppState.assetPreviewIndex > 0 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = AppState.assetPreviewIndex < assets.length - 1 ? '' : 'none';

    // 绑定预览操作
    _bindPreviewActions(asset, assets);
}

function _bindPreviewActions(asset, assets) {
    // 左右切换
    const prevBtn = document.getElementById('assetNavPrev');
    const nextBtn = document.getElementById('assetNavNext');

    const onPrev = () => {
        if (AppState.assetPreviewIndex > 0) {
            AppState.assetPreviewIndex--;
            _renderAssetPreview(assets[AppState.assetPreviewIndex], assets);
        }
    };
    const onNext = () => {
        if (AppState.assetPreviewIndex < assets.length - 1) {
            AppState.assetPreviewIndex++;
            _renderAssetPreview(assets[AppState.assetPreviewIndex], assets);
        }
    };

    if (prevBtn) { prevBtn.onclick = (e) => { e.stopPropagation(); onPrev(); }; }
    if (nextBtn) { nextBtn.onclick = (e) => { e.stopPropagation(); onNext(); }; }

    // 操作按钮
    document.getElementById('assetBtnCopyPath')?.addEventListener('click', (e) => {
        e.stopPropagation();
        _copyAssetPath(asset.filename);
    });
    document.getElementById('assetBtnDownload')?.addEventListener('click', (e) => {
        e.stopPropagation();
        _downloadAsset(asset);
    });
    document.getElementById('assetBtnDelete')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`确认删除 ${asset.filename}？`)) {
            DOM.imagePreviewOverlay.style.display = 'none';
            await _deleteAsset(asset.filename);
        }
    });
    document.getElementById('assetBtnRename')?.addEventListener('click', (e) => {
        e.stopPropagation();
        _renameAsset(asset.filename);
    });
    document.getElementById('assetBtnReplace')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const fi = document.createElement('input');
        fi.type = 'file';
        fi.accept = asset.type === 'image' ? 'image/*' : 'audio/*';
        fi.onchange = async () => {
            if (fi.files[0]) {
                await _replaceAsset(asset.filename, fi.files[0]);
                DOM.imagePreviewOverlay.style.display = 'none';
            }
        };
        fi.click();
    });
    document.getElementById('assetBtnRembg')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        _showAssetToast('抠图功能开发中...');
    });

    // 键盘左右箭头
    const keyHandler = (e) => {
        if (e.key === 'ArrowLeft') onPrev();
        else if (e.key === 'ArrowRight') onNext();
        else if (e.key === 'Escape') {
            DOM.imagePreviewOverlay.style.display = 'none';
            document.removeEventListener('keydown', keyHandler);
        }
    };
    document.addEventListener('keydown', keyHandler);

    // 关闭弹层时移除键盘监听
    const closeHandler = () => {
        const audioPlayer = document.getElementById('audioPreviewPlayer');
        if (audioPlayer) audioPlayer.pause();
        document.removeEventListener('keydown', keyHandler);
        // 隐藏信息栏和音频预览
        const infoBar = document.getElementById('assetInfoBar');
        if (infoBar) infoBar.style.display = 'none';
        const audioPreview = document.getElementById('assetAudioPreview');
        if (audioPreview) audioPreview.style.display = 'none';
    };
    DOM.imagePreviewOverlay._closeHandler = closeHandler;
}

/** 右键菜单 */
function _showAssetContextMenu(e, filename) {
    // 移除已有
    document.querySelector('.asset-context-menu')?.remove();

    const asset = AppState.projectAssets.find(a => a.filename === filename);
    if (!asset) return;

    const menu = document.createElement('div');
    menu.className = 'asset-context-menu';
    menu.innerHTML = `
        <div class="asset-context-item" data-action="preview"><i class="fas fa-eye"></i> 预览</div>
        <div class="asset-context-item" data-action="copy"><i class="fas fa-clipboard"></i> 复制路径</div>
        <div class="asset-context-item" data-action="rename"><i class="fas fa-pen"></i> 重命名</div>
        <div class="asset-context-item" data-action="download"><i class="fas fa-download"></i> 下载</div>
        <div class="asset-context-item" data-action="replace"><i class="fas fa-arrow-right-arrow-left"></i> 替换</div>
        ${asset.type === 'image' ? '<div class="asset-context-item" data-action="rembg"><i class="fas fa-scissors"></i> 抠图/去背</div>' : ''}
        <div class="asset-context-sep"></div>
        <div class="asset-context-item danger" data-action="delete"><i class="fas fa-trash"></i> 删除</div>`;

    // 定位
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    document.body.appendChild(menu);

    // 确保不超出屏幕
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';

    // 绑定操作
    menu.querySelectorAll('.asset-context-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            menu.remove();
            if (action === 'preview') openAssetPreview(filename);
            else if (action === 'copy') _copyAssetPath(filename);
            else if (action === 'rename') _renameAsset(filename);
            else if (action === 'download') _downloadAsset(asset);
            else if (action === 'replace') {
                const fi = document.createElement('input');
                fi.type = 'file';
                fi.accept = asset.type === 'image' ? 'image/*' : 'audio/*';
                fi.onchange = () => { if (fi.files[0]) _replaceAsset(filename, fi.files[0]); };
                fi.click();
            }
            else if (action === 'delete') _deleteAsset(filename);
            else if (action === 'rembg') _showAssetToast('抠图功能开发中...');
        });
    });

    // 点击外部关闭
    setTimeout(() => {
        document.addEventListener('click', function _closeMenu(ev) {
            if (!menu.contains(ev.target)) {
                menu.remove();
                document.removeEventListener('click', _closeMenu);
            }
        });
    }, 10);
}

// --- 素材操作 API 调用 ---

async function _deleteAsset(filename) {
    if (!confirm(`确认删除 ${filename}？此操作不可撤销。`)) return;
    await _deleteAssetAPI(filename);
    await loadProjectAssets();
}

async function _deleteAssetAPI(filename) {
    try {
        await fetch(`${AppState.apiBaseUrl}/api/projects/${AppState.currentProjectId}/assets/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    } catch (e) {
        console.warn('[V38] delete error:', e);
    }
}

function _copyAssetPath(filename) {
    const asset = AppState.projectAssets.find(a => a.filename === filename);
    const path = asset ? asset.path : filename;
    navigator.clipboard?.writeText(path);
    _showAssetToast(`已复制: ${path}`);
}

function _downloadAsset(asset) {
    const a = document.createElement('a');
    a.href = asset.url;
    a.download = asset.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

async function _renameAsset(filename) {
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const baseName = filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename;
    const newBase = prompt('输入新文件名:', baseName);
    if (!newBase || newBase === baseName) return;
    const newName = newBase + ext;
    try {
        const resp = await fetch(`${AppState.apiBaseUrl}/api/projects/${AppState.currentProjectId}/assets/${encodeURIComponent(filename)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newName }),
        });
        if (resp.ok) {
            _showAssetToast(`已重命名为 ${newName}`);
            await loadProjectAssets();
        }
    } catch (e) {
        console.warn('[V38] rename error:', e);
    }
}

async function _replaceAsset(filename, file) {
    // 先删除旧的
    await _deleteAssetAPI(filename);
    // 上传新的（保持同名）
    const formData = new FormData();
    // 重命名为原始文件名
    const renamedFile = new File([file], filename, { type: file.type });
    formData.append('file', renamedFile);
    try {
        await fetch(`${AppState.apiBaseUrl}/api/projects/${AppState.currentProjectId}/upload`, {
            method: 'POST',
            body: formData,
        });
        _showAssetToast(`已替换 ${filename}`);
        await loadProjectAssets();
    } catch (e) {
        console.warn('[V38] replace error:', e);
    }
}

async function _handleAssetUpload(files) {
    if (!files || files.length === 0) return;
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            await fetch(`${AppState.apiBaseUrl}/api/projects/${AppState.currentProjectId}/upload`, {
                method: 'POST',
                body: formData,
            });
        } catch (e) {
            console.warn('[V38] upload error:', e);
        }
    }
    _showAssetToast(`已上传 ${files.length} 个文件`);
    await loadProjectAssets();
}

// --- 工具函数 ---

function _formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function _showAssetToast(msg) {
    // 复用全局 Toast 或创建临时 Toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;z-index:400;animation:fadeIn 0.2s;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 2000);
    setTimeout(() => toast.remove(), 2300);
}

/** 初始化侧边栏素材入口的点击事件 */
function initSidebarAssetEntry() {
    const entry = document.getElementById('sidebarAssetEntry');
    const addBtn = document.getElementById('sidebarAssetAddBtn');

    if (entry) {
        // 点击整个入口区域 → 打开素材全页面
        entry.addEventListener('click', (e) => {
            // 防止上传按钮的点击冒泡
            if (e.target.closest('#sidebarAssetAddBtn')) return;
            if (AppState.activeAssetView) {
                closeAssetView();
            } else {
                openAssetView();
            }
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // 如果不在素材视图，先打开再触发上传
            if (!AppState.activeAssetView) openAssetView();
            setTimeout(() => {
                document.getElementById('assetFileInput')?.click();
            }, 100);
        });
    }
}

// ========================================
// V34: 侧边栏渲染 — 团队聊天入口 + 角色成员列表（去掉子线程）
// ========================================
function renderConvList() {
    renderTeamStatusPanel();
    // V34: 不再渲染子线程列表
    if (DOM.convGroupItems) DOM.convGroupItems.innerHTML = '';

    // 只在非成员详情模式且非素材视图时才重置 header
    if (!AppState.activeMemberView && !AppState.activeAssetView) {
        if (DOM.chatPanelTitle) {
            DOM.chatPanelTitle.textContent = '团队群聊';
        }
    }

    // V38: 更新素材入口选中态
    renderSidebarAssetEntry();
}

/** V42: 渲染团队状态面板 — 群聊入口突出 + 成员行缩进从属 */
function renderTeamStatusPanel() {
    const panel = document.getElementById('teamStatusPanel');
    if (!panel) return;
    panel.innerHTML = '';

    // ====== 群聊入口（强调） ======
    const teamRow = document.createElement('div');
    teamRow.className = 'team-chat-entry' + (!AppState.activeMemberView && !AppState.activeAssetView ? ' active' : '');
    teamRow.innerHTML = `
        <div class="tce-icon"><i class="fas fa-comments"></i></div>
        <div class="tce-body">
            <div class="tce-name">团队聊天</div>
            <div class="tce-summary">${_getTeamStatusSummary()}</div>
        </div>`;
    teamRow.addEventListener('click', () => {
        if (AppState.activeMemberView) closeMemberView();
        if (AppState.activeAssetView) closeAssetView();
    });
    panel.appendChild(teamRow);

    // ====== 成员小标题 ======
    const memberLabel = document.createElement('div');
    memberLabel.className = 'tp-member-label';
    memberLabel.textContent = '团队成员';
    panel.appendChild(memberLabel);

    const task = getCurrentTask();

    // ====== 各角色成员行（缩进） ======
    for (const [groupName, groupInfo] of Object.entries(AGENT_GROUPS)) {
        const state = AppState.roleStates[groupName] || 'idle';
        const nickname = groupInfo.nickname || groupName;
        const isActive = AppState.activeMemberView === groupName;

        let statusText = '';
        let effectiveState = state;
        if (state === 'working' && task) {
            const groupAgentIds = Object.keys(AGENTS).filter(aid => AGENTS[aid].group === groupName);
            if (groupName === '美术' && AppState.assetGenCardEl) {
                statusText = '素材生成中...';
            } else {
                for (const aid of groupAgentIds) {
                    const subtasks = task.agentSubtasks?.[aid] || [];
                    const current = subtasks.find(s => s.status === 'working');
                    if (current) { statusText = current.name; break; }
                }
                if (!statusText) {
                    for (const aid of groupAgentIds) {
                        const desc = task.planData?.agent_tasks?.[aid];
                        if (desc && task.agentStatus?.[aid] === 'working') { statusText = desc; break; }
                    }
                }
            }
            if (!statusText) statusText = '工作中...';
        } else if (state === 'done') {
            if (groupName === '美术' && AppState.assetGenCardEl) {
                effectiveState = 'working';
                statusText = '素材生成中...';
            } else {
                statusText = '已完成';
            }
        } else {
            if (task?.planData?.agents_needed) {
                const groupAgentIds = Object.keys(AGENTS).filter(aid => AGENTS[aid].group === groupName);
                const isAssigned = groupAgentIds.some(aid => task.planData.agents_needed.includes(aid));
                if (isAssigned) {
                    effectiveState = 'queued';
                    const taskDesc = groupAgentIds.map(aid => task.planData?.agent_tasks?.[aid]).filter(Boolean)[0];
                    statusText = taskDesc ? `等待中：${taskDesc.slice(0, 20)}` : '等待前置环节...';
                } else {
                    statusText = '待命中';
                }
            } else {
                statusText = '待命中';
            }
        }

        const statusIcon = effectiveState === 'working' ? '🔄' : effectiveState === 'done' ? '✅' : effectiveState === 'queued' ? '⏳' : '💤';

        const row = document.createElement('div');
        row.className = 'tp-member-row' + (isActive ? ' active' : '');
        row.dataset.group = groupName;
        row.innerHTML = `
            <div class="tp-member-avatar">${groupInfo.avatar ? `<img src="${groupInfo.avatar}" alt="${nickname}" />` : `<i class="fas ${groupInfo.icon}"></i>`}</div>
            <div class="tp-member-info">
                <div class="tp-member-name">${nickname} <span class="tp-member-role-tag">${groupName}</span></div>
                <div class="tp-member-status ${effectiveState === 'working' ? 'scrolling' : ''}">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-label">${escapeHTML(statusText)}</span>
                </div>
            </div>
            <div class="tp-member-dot ${effectiveState}"></div>
            <i class="fas fa-chevron-right tp-member-arrow"></i>`;

        row.addEventListener('click', () => openMemberView(groupName));
        panel.appendChild(row);
    }
}

/** V33: 获取团队整体状态摘要（一行文字） */
function _getTeamStatusSummary() {
    const states = Object.values(AppState.roleStates);
    const workingCount = states.filter(s => s === 'working').length;
    const doneCount = states.filter(s => s === 'done').length;
    if (workingCount > 0) return `${workingCount} 位成员工作中`;
    if (doneCount === states.length && doneCount > 0) return '全部完成 ✅';
    return `${Object.keys(AGENT_GROUPS).length} 位成员待命`;
}

/** V34: 刷新角色状态面板 + 如果正在查看成员详情页则同步更新 */
function refreshTeamAndMemberView() {
    renderTeamStatusPanel();
    if (AppState.activeMemberView) {
        renderMemberView(AppState.activeMemberView);
        // V42c: 同步更新 header 状态
        const groupInfo = AGENT_GROUPS[AppState.activeMemberView];
        const nickname = groupInfo?.nickname || AppState.activeMemberView;
        const state = AppState.roleStates[AppState.activeMemberView] || 'idle';
        const stateLabel = state === 'working' ? '工作中' : state === 'done' ? '已完成' : '待命中';
        const stateClass = state === 'working' ? 'working' : state === 'done' ? 'done' : 'idle';
        if (DOM.chatPanelTitle) {
            const avatarHTML = groupInfo?.avatar
                ? `<img src="${groupInfo.avatar}" class="mp-header-avatar" />`
                : `<span class="mp-header-avatar-fb" style="background:${groupInfo?.color}"><i class="fas ${groupInfo?.icon}" style="color:#fff;font-size:11px;"></i></span>`;
            DOM.chatPanelTitle.innerHTML = `${avatarHTML}<div class="mp-header-text"><span class="mp-header-name">${escapeHTML(nickname)}</span><span class="mp-header-role">${escapeHTML(groupInfo?.personality || groupInfo?.desc || '')}</span></div><span class="mp-header-state ${stateClass}"><span class="mp-state-dot ${stateClass}"></span>${stateLabel}</span>`;
        }
        const inputWrapper = document.querySelector('.chat-input-wrapper');
        if (inputWrapper) inputWrapper.style.display = 'none';
    }
    updateGlobalProgress();
}

/** V34: 子线程系统已移除 — 以下函数保留空壳防止调用报错 */
function renderThreadList() { /* DEPRECATED V34 */ }

/** V31: 旧函数兼容映射 */
function generateConvAvatarHTML(session) {
    const channelAvatarMap = {
        'main': { avatar: AGENT_GROUPS['小助手']?.avatar, fallback: '🎮', bg: 'linear-gradient(135deg, #6366F1, #818CF8)' },
    };
    const mapped = channelAvatarMap[session.channel || session.id];
    if (mapped?.avatar) {
        return `<div class="conv-item-avatar conv-avatar-single"><img src="${mapped.avatar}" alt="" /></div>`;
    }
    if (mapped) {
        return `<div class="conv-item-avatar conv-avatar-all" style="background:${mapped.bg};">${mapped.fallback}</div>`;
    }
    return `<div class="conv-item-avatar conv-avatar-all" style="background:linear-gradient(135deg, #07C160, #06AD56);">🎮</div>`;
}

function createConvSidebarItem(session, task) {
    // V31: 保留兼容空壳，不再使用
    const item = document.createElement('div');
    item.className = 'conv-sidebar-item';
    return item;
}

// 向后兼容：旧代码可能调 renderChatTabs
function renderChatTabs() { renderConvList(); }

function closeSessionTab(sessionId) {
    // V31: 只有 main，不可关闭
    return;
    const idx = AppState.sessions.findIndex(s => s.id === sessionId);
    if (idx < 0) return;

    AppState.sessions.splice(idx, 1);
    if (AppState.currentSessionId === sessionId) {
        switchSession('main');
    }
    renderChatTabs();
}

// ========================================
// 会话管理
// ========================================
function initDefaultSession() {
    // V31: 只保留 1 条主线群聊（全角色），子线程按需从主线拆出
    const _mkSession = (id, type, name, icon, color, agents, channel) => ({
        id, type, name, icon, color,
        messages: [],
        agents,
        agentMessages: {},
        task: null,
        _pendingConfirms: 0,
        _projectId: null,
        _sessionState: null,
        _mode: 'quick',
        _isGenerating: false,
        _abortController: null,
        _eventSource: null,
        _pendingMessages: [],
        _reviewOpen: false,
        channel,
        fixed: true,
        role: null,
    });

    const mainSession = _mkSession('main', 'group', '💬 AI 工作室', 'fa-gamepad', '#6366F1', Object.keys(AGENTS), 'main');

    AppState.sessions = [mainSession];
    AppState.currentSessionId = 'main';
    AppState.activeMemberView = null;

    // 初始化角色状态
    for (const groupName of Object.keys(AGENT_GROUPS)) {
        AppState.roleStates[groupName] = 'idle';
    }

    // 清理 Collab 状态（切换/新建项目时防止状态泄漏）
    resetCollabState();
}

/**
 * 重置 Collab 相关状态 — 切换/新建项目时调用
 */
function resetCollabState() {
    // 1. 中断所有 session 进行中的 SSE 流
    AppState.sessions.forEach(s => {
        if (s._abortController) { s._abortController.abort(); s._abortController = null; }
        if (s._eventSource) { s._eventSource.close(); s._eventSource = null; }
        s._isGenerating = false;
        s._pendingMessages = [];
    });
    // 兼容全局
    if (AppState.collabAbortController) {
        AppState.collabAbortController.abort();
        AppState.collabAbortController = null;
    }
    if (AppState.eventSource) {
        AppState.eventSource.close();
        AppState.eventSource = null;
    }
    // 2. 重置模式和 session 状态
    AppState.currentMode = 'quick';
    AppState.sessionState = null;
    AppState.isGenerating = false;
    // 3. 重置模式按钮 UI
    const modeBtnQuick = document.getElementById('modeBtnQuick');
    const modeBtnCollab = document.getElementById('modeBtnCollab');
    if (modeBtnQuick) modeBtnQuick.classList.toggle('active', true);
    if (modeBtnCollab) modeBtnCollab.classList.toggle('active', false);
    // 4. 清理阶段指示器
    const indicator = document.getElementById('phaseIndicator');
    if (indicator) indicator.style.display = 'none';
    // 5. 重置输入框提示
    if (DOM.chatInput) {
        DOM.chatInput.placeholder = '描述你想要的游戏，AI 工作室协作帮你实现... 输入 @ 指定Agent';
    }
    if (DOM.inputHintText) {
        DOM.inputHintText.textContent = 'Enter 发送 · Shift+Enter 换行 · @ 指定Agent';
    }
}

// 聊天历史持久化
let _chatSaveTimer = null;

function saveChatHistory() {
    if (!AppState.currentProjectId) return;
    // 防抖：500ms 内只保存一次
    clearTimeout(_chatSaveTimer);
    _chatSaveTimer = setTimeout(() => {
        const groupSession = AppState.sessions.find(s => s.id === 'main' || s.id === 'group');
        if (!groupSession) return;
        const data = { messages: groupSession.messages.slice(-200) }; // 最多保存200条
        fetch(`${AppState.apiBaseUrl}/api/projects/${
                  AppState.currentProjectId}/chat`,
              {
                method : 'PUT',
                headers : {'Content-Type' : 'application/json'},
                body : JSON.stringify(data),
              })
            .catch(() => {});
    }, 500);
}

async function loadChatHistory(projectId) {
    if (!projectId) return;
    try {
        const res = await fetch(`${AppState.apiBaseUrl}/api/projects/${projectId}/chat`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
            const groupSession = AppState.sessions.find(s => s.id === 'main' || s.id === 'group');
            if (groupSession) {
                groupSession.messages = data.messages;
                // 重新渲染聊天区
                renderChatMessages(groupSession);
            }
        }
    } catch (e) {
        console.warn('[Chat] load history failed:', e);
    }
}

// renderChatMessages: 统一在下方定义（BUG 3.1 fix: 删除重复定义）

// [v12d] 私聊已移除 — 以下函数保留签名兼容，不再创建单独会话
function createSession() { /* no-op */ }

function enterAgentChat(agentId) {
    // V31: 打开该 Agent 所属角色组的子线程
    const agent = AGENTS[agentId];
    if (!agent) return;
    openThread(agent.group);
}

// V31: 空间下钻改为打开子线程
function drillIntoAgent(agentId) {
    enterAgentChat(agentId);
}

// 从单聊切换回群聊（已无私聊，保留兼容）
function drillBackToGroup() {
    switchSession('main');
}

// ========================================
// V34: 子线程系统已废弃 — 空壳保留防止外部引用报错
// ========================================
function openThread() { /* DEPRECATED V34 */ }
function focusThread() { /* DEPRECATED V34 */ }
function closeThread() { /* DEPRECATED V34 */ }
function archiveThread() { /* DEPRECATED V34 */ }
function renderThreadMessages() { /* DEPRECATED V34 */ }
function sendThreadMessage() { /* DEPRECATED V34 */ }

// ========================================
// V33: 成员单独聊天页面 — 详细进度 + 任务流水 + 空闲强提醒
// ========================================

/** V34: 打开成员详情/聊天页面（从看板卡片或侧边栏角色点击进入） */
function openMemberView(groupName) {
    const groupInfo = AGENT_GROUPS[groupName];
    if (!groupInfo) return;

    // ★ 可单聊的角色（策划/美术/音效）→ 进入聊天模式
    if (groupInfo.canDirectChat) {
        openMemberChat(groupName);
        return;
    }

    // V38: 如果在素材视图，先关闭
    if (AppState.activeAssetView) {
        AppState.activeAssetView = false;
    }

    AppState.activeMemberView = groupName;
    const nickname = groupInfo.nickname || groupName;
    const state = AppState.roleStates[groupName] || 'idle';
    const stateLabel = state === 'working' ? '工作中' : state === 'done' ? '已完成' : '待命中';
    const stateClass = state === 'working' ? 'working' : state === 'done' ? 'done' : 'idle';

    // V42d: header 显示角色头像+昵称+定位+slogan
    if (DOM.chatPanelTitle) {
        const avatarHTML = groupInfo.avatar
            ? `<img src="${groupInfo.avatar}" class="mp-header-avatar" />`
            : `<span class="mp-header-avatar-fb" style="background:${groupInfo.color}"><i class="fas ${groupInfo.icon}" style="color:#fff;font-size:11px;"></i></span>`;
        DOM.chatPanelTitle.innerHTML = `${avatarHTML}<div class="mp-header-text"><span class="mp-header-name">${escapeHTML(nickname)}</span><span class="mp-header-role">${escapeHTML(groupInfo.personality || groupInfo.desc)}</span></div><span class="mp-header-state ${stateClass}"><span class="mp-state-dot ${stateClass}"></span>${stateLabel}</span>`;
    }

    // V42: 隐藏输入框 — 不可聊天的成员面板是纯信息查看
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    if (inputWrapper) inputWrapper.style.display = 'none';

    // 渲染成员信息面板到 chat-messages 区域
    renderMemberView(groupName);

    renderConvList();
}

/** V33: 关闭成员详情 → 回到主群聊 */
function closeMemberView() {
    AppState.activeMemberView = null;

    // V42c: 恢复 header 为团队群聊
    if (DOM.chatPanelTitle) {
        DOM.chatPanelTitle.textContent = '团队群聊';
    }
    // V42: 恢复输入框
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    if (inputWrapper) inputWrapper.style.display = '';
    if (DOM.chatInput) {
        DOM.chatInput.placeholder = '描述你想要的游戏... 输入 @ 指定Agent';
    }

    // 重新渲染主群聊消息
    const session = getCurrentGroupSession();
    if (session) renderChatMessages(session);

    renderConvList();
}

/** V42d: 渲染成员信息面板 */
function renderMemberView(groupName) {
    const container = DOM.chatMessages;
    if (!container) return;
    container.innerHTML = '';

    const groupInfo = AGENT_GROUPS[groupName];
    if (!groupInfo) return;
    const nickname = groupInfo.nickname || groupName;
    const state = AppState.roleStates[groupName] || 'idle';
    const task = getCurrentTask();
    const session = getCurrentGroupSession();
    const groupAgentIds = Object.keys(AGENTS).filter(aid => AGENTS[aid].group === groupName);

    // ======== 当前任务（按 agent 拆解，#4修复：agent done时子任务强制done） ========
    let taskHTML = '';
    if (task) {
        let agentSections = '';
        groupAgentIds.forEach(aid => {
            const st = task.agentStatus?.[aid] || 'idle';
            if (st === 'skipped' || st === 'idle') return;
            const agent = AGENTS[aid];
            const agentName = agent?.name || aid;
            const subtasks = task.agentSubtasks?.[aid] || [];
            const taskDesc = task.planData?.agent_tasks?.[aid] || agent?.desc || '';
            const agentDone = (st === 'done');

            let stepsHTML = '';
            if (subtasks.length > 0) {
                stepsHTML = subtasks.map(sub => {
                    // #4 fix: 如果 agent 已完成，强制所有子任务显示为 done
                    const effectiveStatus = agentDone ? 'done' : (sub.status || 'pending');
                    const icon = effectiveStatus === 'done' ? '✅' : effectiveStatus === 'working' ? '<span class="step-spinner"></span>' : effectiveStatus === 'error' ? '❌' : '<span class="step-pending-dot">○</span>';
                    return `<div class="member-task-step ${effectiveStatus}"><span class="step-icon">${icon}</span><span class="step-name">${escapeHTML(sub.name)}</span></div>`;
                }).join('');
            } else {
                const stepSt = agentDone ? 'done' : st === 'working' ? 'working' : st === 'error' ? 'error' : 'pending';
                const icon = stepSt === 'done' ? '✅' : stepSt === 'working' ? '<span class="step-spinner"></span>' : stepSt === 'error' ? '❌' : '<span class="step-pending-dot">○</span>';
                stepsHTML = `<div class="member-task-step ${stepSt}"><span class="step-icon">${icon}</span><span class="step-name">${escapeHTML(taskDesc)}</span></div>`;
            }

            const agentStateLabel = agentDone ? '已完成' : st === 'working' ? '进行中' : st === 'error' ? '出错' : '等待中';
            const agentStateClass = agentDone ? 'done' : st === 'working' ? 'working' : 'pending';
            agentSections += `
                <div class="mp-agent-task">
                    <div class="mp-agent-task-head">
                        <span class="mp-agent-task-emoji">${agent?.emoji || '🤖'}</span>
                        <span class="mp-agent-task-name">${escapeHTML(agentName)}</span>
                        <span class="mp-agent-task-state ${agentStateClass}">${agentStateLabel}</span>
                    </div>
                    <div class="member-task-list">${stepsHTML}</div>
                </div>`;
        });

        if (agentSections) {
            const allSteps = [];
            groupAgentIds.forEach(aid => {
                const st = task.agentStatus?.[aid] || 'idle';
                if (st === 'skipped' || st === 'idle') return;
                // #4 fix: 直接用 agent status 计算进度
                allSteps.push(st === 'done' ? 'done' : 'pending');
            });
            const doneCount = allSteps.filter(s => s === 'done').length;
            const pct = allSteps.length > 0 ? Math.round((doneCount / allSteps.length) * 100) : 0;

            taskHTML = `
                <div class="mp-section">
                    <div class="mp-section-header">
                        <span class="mp-section-title"><i class="fas fa-tasks"></i> 当前任务</span>
                        <span class="mp-task-pct">${doneCount}/${allSteps.length} · ${pct}%</span>
                    </div>
                    <div class="mp-progress-bar"><div class="mp-progress-fill" style="width:${pct}%"></div></div>
                    ${agentSections}
                </div>`;
        }
    }
    if (!taskHTML && state === 'idle') {
        taskHTML = `
            <div class="mp-section">
                <div class="mp-section-header">
                    <span class="mp-section-title"><i class="fas fa-tasks"></i> 当前任务</span>
                </div>
                <div class="mp-empty-task">
                    <i class="fas fa-inbox"></i>
                    <span>暂无任务 · 在群聊中 @${escapeHTML(nickname)} 分配任务</span>
                </div>
            </div>`;
    }

    // ======== 产出物（#1#5 修复：用评审区内容提取标题 + 完整摘要） ========
    const outputItems = [];
    // 1) 从群聊消息 role_summary
    if (session) {
        session.messages.forEach(msg => {
            if (msg.extra !== 'role_summary' || !msg.extraData) return;
            const aid = msg.extraData.agentId;
            if (!groupAgentIds.includes(aid)) return;
            const agent = AGENTS[aid];
            outputItems.push({
                title: msg.extraData.summary?.split('\n')[0]?.replace(/^[#·\s]+/, '').slice(0, 40) || agent?.name || aid,
                summary: msg.extraData.summary || '',
                status: msg.extraData.status || 'done',
                agentId: aid,
                time: msg.time || '',
            });
        });
    }
    // 2) 从评审区 DOM panes
    if (outputItems.length === 0 && DOM.reviewContent) {
        groupAgentIds.forEach(aid => {
            const agent = AGENTS[aid];
            if (agent?.group === '工程师') return;
            const tabId = `agent-${aid}`;
            const pane = DOM.reviewContent.querySelector(`.review-pane[data-pane="${tabId}"]`);
            if (!pane) return;
            const viewer = pane.querySelector('.agent-review-viewer');
            if (!viewer) return;
            const textContent = viewer.textContent || '';
            if (textContent.length < 30) return;
            // #5: 从内容提取第一行有意义的标题
            const lines = textContent.split('\n').map(l => l.trim()).filter(l => l.length > 2);
            const smartTitle = lines[0]?.replace(/^[#·✅🔄📋🎨🎵\s]+/, '').slice(0, 40) || agent?.name || aid;
            outputItems.push({
                title: smartTitle,
                summary: textContent.slice(0, 600),
                status: 'done',
                agentId: aid,
                time: '',
            });
        });
    }

    let outputHTML = '';
    if (outputItems.length > 0) {
        const cardsHTML = outputItems.map(item => {
            const summaryLines = item.summary.split(/[。\n]/).filter(l => l.trim()).slice(0, 5);
            const bulletHTML = summaryLines.map(l => `<div class="output-bullet">• ${escapeHTML(l.trim().slice(0, 100))}</div>`).join('');
            const charCount = item.summary.length;

            return `<div class="mp-output-card" data-action="open-review" data-tab="agent-${item.agentId}">
                <div class="mp-output-head">
                    <span class="mp-output-badge">${item.status === 'done' ? '✅' : '🔄'}</span>
                    <span class="mp-output-title">${escapeHTML(item.title)}</span>
                    <span class="mp-output-meta">${charCount > 0 ? charCount + '字' : ''}</span>
                </div>
                <div class="mp-output-body">${bulletHTML}</div>
                <div class="mp-output-action"><i class="fas fa-external-link-alt"></i> 在评审区查看详情</div>
            </div>`;
        }).join('');

        outputHTML = `
            <div class="mp-section">
                <div class="mp-section-header">
                    <span class="mp-section-title"><i class="fas fa-file-alt"></i> 产出物</span>
                    <span class="mp-output-count">${outputItems.length} 项</span>
                </div>
                ${cardsHTML}
            </div>`;
    }

    // ======== #3: 素材缩略图（美术/音效组展示生成的素材） ========
    let assetsHTML = '';
    if ((groupName === '美术' || groupName === '音效') && AppState.projectAssets.length > 0) {
        const typeFilter = groupName === '美术' ? 'image' : 'audio';
        const groupAssets = AppState.projectAssets.filter(a => a.type === typeFilter);
        if (groupAssets.length > 0) {
            const maxShow = 8;
            const showItems = groupAssets.slice(0, maxShow);
            const thumbsHTML = showItems.map(a => {
                if (a.type === 'audio') {
                    return `<div class="mp-asset-thumb audio"><i class="fas fa-music"></i><span class="mp-asset-name">${escapeHTML(a.filename)}</span></div>`;
                }
                return `<div class="mp-asset-thumb"><img src="${a.url}" alt="${escapeHTML(a.filename)}" loading="lazy" /><span class="mp-asset-name">${escapeHTML(a.filename)}</span></div>`;
            }).join('');
            const overflowHTML = groupAssets.length > maxShow ? `<div class="mp-asset-thumb overflow">+${groupAssets.length - maxShow}</div>` : '';

            assetsHTML = `
                <div class="mp-section">
                    <div class="mp-section-header">
                        <span class="mp-section-title"><i class="fas ${groupName === '美术' ? 'fa-images' : 'fa-headphones'}"></i> ${groupName === '美术' ? '生成素材' : '音效文件'}</span>
                        <span class="mp-output-count">${groupAssets.length} 个</span>
                    </div>
                    <div class="mp-asset-grid">${thumbsHTML}${overflowHTML}</div>
                </div>`;
        }
    }

    // ======== 教学引导 ========
    const suggestions = _getMemberIdleSuggestions(groupName);
    const guideHTML = `
        <div class="mp-section mp-section-guide">
            <div class="mp-section-header">
                <span class="mp-section-title"><i class="fas fa-comment-dots"></i> 可以和我聊什么</span>
            </div>
            <div class="mp-guide-list">
                ${suggestions.map(s => `<div class="mp-guide-item" data-prompt="${escapeHTML(s.prompt)}"><span class="mp-guide-emoji">${s.emoji}</span><div class="mp-guide-body"><div class="mp-guide-label">${escapeHTML(s.label)}</div><div class="mp-guide-desc">${escapeHTML(s.prompt)}</div></div><i class="fas fa-chevron-right mp-guide-arrow"></i></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = `<div class="mp-container">${taskHTML}${outputHTML}${assetsHTML}${guideHTML}</div>`;

    // 绑定产出卡片点击
    container.querySelectorAll('[data-action="open-review"]').forEach(card => {
        card.addEventListener('click', () => { const tabId = card.dataset.tab; if (tabId) openReviewTab(tabId); });
    });
    // 绑定教学引导点击 → 回到群聊并填入 prompt
    container.querySelectorAll('.mp-guide-item').forEach(item => {
        item.addEventListener('click', () => {
            const prompt = item.dataset.prompt;
            closeMemberView();
            if (DOM.chatInput && prompt) { DOM.chatInput.value = prompt; DOM.chatInput.focus(); }
        });
    });
    // 素材溢出点击 → 打开素材视图
    container.querySelector('.mp-asset-thumb.overflow')?.addEventListener('click', () => {
        closeMemberView();
        openAssetView();
    });
}

/** V33: 获取成员空闲时的建议话题 */
function _getMemberIdleSuggestions(groupName) {
    const suggestions = {
        '策划': [
            { emoji: '🔍', label: '竞品分析', prompt: '@灵灵 帮我分析一下当前热门小游戏的玩法趋势' },
            { emoji: '🧩', label: '玩法设计', prompt: '@灵灵 帮我设计一个三消+RPG的混合玩法' },
            { emoji: '📊', label: '数值框架', prompt: '@灵灵 帮我搭建一个休闲游戏的经济数值框架' },
        ],
        '美术': [
            { emoji: '🎨', label: '风格探索', prompt: '@绘绘 帮我的游戏设计一套视觉风格方案' },
            { emoji: '🖼️', label: '素材生成', prompt: '@绘绘 帮我生成一组卡通风格的角色素材' },
            { emoji: '✨', label: '特效设计', prompt: '@绘绘 设计一套打击感强烈的特效方案' },
        ],
        '音效': [
            { emoji: '🎵', label: 'BGM创作', prompt: '@乐乐 为我的游戏创作一段轻松的探索BGM' },
            { emoji: '💥', label: '打击音效', prompt: '@乐乐 设计一组爽快的近战打击音效' },
            { emoji: '🌊', label: '环境音', prompt: '@乐乐 制作一套场景环境音效' },
        ],
        '小助手': [
            { emoji: '📋', label: '任务规划', prompt: '帮我规划一下接下来的开发任务' },
            { emoji: '🔄', label: '进度检查', prompt: '现在各个角色的工作进度怎么样了？' },
        ],
        '工程师': [
            { emoji: '🚀', label: '性能优化', prompt: '帮我分析一下游戏的性能瓶颈' },
            { emoji: '🐛', label: '调试问题', prompt: '我的游戏有个bug，帮我看看' },
        ],
    };
    return suggestions[groupName] || [
        { emoji: '💬', label: '开始聊天', prompt: `帮我看看现在有什么可以改进的地方` },
    ];
}

/** V40b: 单聊直接发送消息（不再回群聊），消息留在当前单聊 */
function sendMemberMessage() {
    if (!AppState.activeMemberView) return;
    const input = DOM.chatInput;
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const groupName = AppState.activeMemberView;
    const groupInfo = AGENT_GROUPS[groupName];
    const nickname = groupInfo?.nickname || groupName;

    // 在群聊 session 中发送（后台），带 @提及 让后端路由到对应 agent
    const msgText = text.startsWith('@') ? text : `@${nickname} ${text}`;
    input.value = '';

    // 在单聊界面显示用户消息
    const container = DOM.chatMessages;
    const chatArea = container?.querySelector('.mc-chat-area');
    if (chatArea) {
        // 移除空状态和建议话题
        const emptyChat = chatArea.querySelector('.mc-empty-chat');
        if (emptyChat) emptyChat.remove();
        const suggestions = chatArea.querySelector('.mc-suggestions');
        if (suggestions) suggestions.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'mc-msg mc-msg-user';
        msgDiv.innerHTML = `<div class="mc-msg-content">${escapeHTML(text)}</div><div class="mc-msg-time">${getTimeStr()}</div>`;
        chatArea.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    } else {
        // fallback: 旧版容器
        const msgCard = document.createElement('div');
        msgCard.className = 'member-chat-bubble user';
        msgCard.innerHTML = `<div class="member-chat-bubble-content">${escapeHTML(text)}</div>`;
        const viewContainer = container?.querySelector('.member-view-container, .member-chat-container');
        if (viewContainer) viewContainer.appendChild(msgCard);
    }

    // 后台发到主群聊 session
    const session = getCurrentGroupSession();
    if (session) {
        session.messages.push({ role: 'user', isUser: true, content: msgText, time: getTimeStr(), mentioned: Object.keys(AGENTS).filter(aid => AGENTS[aid].group === groupName) });
    }

    // 触发实际发送（复用 handleSend 的后端通信逻辑）
    DOM.chatInput.value = msgText;
    // 临时取消 activeMemberView 防止 handleSend 递归
    const savedView = AppState.activeMemberView;
    AppState.activeMemberView = null;
    handleSend();
    AppState.activeMemberView = savedView;

    // 保持在成员聊天页
    setTimeout(() => {
        if (!AppState.activeMemberView) {
            openMemberChat(groupName);
        }
    }, 100);
}

/** 在主群聊插入空闲邀请卡片 */
function insertIdleInvite(groupName, text, options) {
    addGroupMessage('coordinator', '', 'idle_invite', {
        groupName,
        text,
        options: options || [],
    });
}

/** 在主群聊插入角色摘要卡片 */
function insertRoleSummaryCard(agentId, summary, status) {
    addGroupMessage(agentId, '', 'role_summary', {
        agentId,
        summary,
        status: status || 'done',
    });
}

/** V32: 在主群聊插入素材画廊卡片（合并所有素材为一张卡片 + 图片预览网格） */
function insertAssetGalleryCard(agentId, summary, assets, status) {
    addGroupMessage(agentId, '', 'asset_gallery', {
        agentId,
        summary,
        assets: assets || [],
        status: status || 'done',
    });
}

/** 在主群聊插入状态分隔线 */
function insertStatusDivider(text) {
    const session = AppState.sessions.find(s => s.id === 'main');
    if (!session) return;
    session.messages.push({ type: 'status_divider', content: text, time: getTimeStr() });
    if (AppState.currentSessionId === 'main') {
        appendStatusDividerDOM(text);
    }
}
function appendStatusDividerDOM(text) {
    const el = document.createElement('div');
    el.className = 'chat-status-divider';
    el.innerHTML = `<span class="csd-icon"><span class="pulse-dot"></span> ${escapeHTML(text)}</span>`;
    DOM.chatMessages.appendChild(el);
    scrollToBottom();
}

function switchSession(sessionId) {
    // ② 保存当前 session 的运行状态（不再中断其 SSE）
    const prevSession = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (prevSession) {
        prevSession._projectId = AppState.currentProjectId;
        prevSession._sessionState = AppState.sessionState;
        prevSession._mode = AppState.currentMode;
        // _isGenerating 已经由 setSessionGenerating 实时更新，无需再同步
        prevSession._reviewOpen = AppState.reviewOpen; // ③ 保存评审区状态
    }

    AppState.currentSessionId = sessionId;
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (!session) return;

    // ② 恢复目标 session 的运行状态
    AppState.currentProjectId = session._projectId || null;
    AppState.sessionState = session._sessionState || null;
    AppState.currentMode = session._mode || 'quick';
    AppState.isGenerating = session._isGenerating || false;
    AppState.eventSource = session._eventSource || null;
    AppState.collabAbortController = session._abortController || null;

    // 更新模式按钮 UI
    const modeBtnQuick = document.getElementById('modeBtnQuick');
    const modeBtnCollab = document.getElementById('modeBtnCollab');
    if (modeBtnQuick) modeBtnQuick.classList.toggle('active', AppState.currentMode === 'quick');
    if (modeBtnCollab) modeBtnCollab.classList.toggle('active', AppState.currentMode === 'collab');
    // 更新暂停按钮
    updatePauseButton(AppState.isGenerating);
    // 更新输入框状态
    updateInputPlaceholder();

    renderChatHeader(session);
    renderChatMessages(session);
    renderChatTabs();

    // V30: 切换 session 时同步引用条状态
    if (sessionId === 'main' && AppState._pendingQuote) {
        showQuoteReferenceBar(AppState._pendingQuote);
    } else {
        hideQuoteReferenceBar();
    }

    AppState.currentView = 'group';
    AppState.currentAgentId = null;

    // 同步顶栏标题为该 session 的任务名
    const sessionTask = session.task || AppState.task;
    if (sessionTask?.name) {
        DOM.projectTitle.textContent = sessionTask.name;
        const phase = sessionTask.phase;
        if (phase === 'error') {
            DOM.projectStatus.className = 'project-status';
            DOM.projectStatus.textContent = '出错';
            DOM.projectStatus.style.color = '#DC2626';
        } else if (phase === 'done') {
            DOM.projectStatus.className = 'project-status completed';
            DOM.projectStatus.textContent = '已完成';
        } else {
            DOM.projectStatus.className = 'project-status running';
            DOM.projectStatus.textContent = '执行中';
        }
    }

    // 清除该 session 的待确认标记
    clearPendingConfirms(sessionId);

    updateGlobalProgress();

    // ③ 恢复评审区展开/收起状态
    const shouldShowReview = session._reviewOpen || false;
    if (shouldShowReview !== AppState.reviewOpen) {
        toggleReviewPanel(shouldShowReview);
    }

    // 更新侧边栏选中态
    if (DOM.convGroupItems) {
        DOM.convGroupItems.querySelectorAll('.conv-sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.convId === sessionId);
        });
    }
    // 更新面板标题
    if (DOM.chatPanelTitle) {
        DOM.chatPanelTitle.textContent = session.name || '创作工坊';
    }
}

function renderChatHeader(session) {
    DOM.chatInput.placeholder = '描述你想要的游戏... 输入 @ 指定角色';
    DOM.inputHintText.textContent = 'Enter 发送 · Shift+Enter 换行 · @ 指定角色';
}

function renderChatMessages(session) {
    if (!DOM.chatMessages) return;
    // BUG 5.3 fix: 切换会话时重置流式合并跟踪变量
    _lastMsgEl = null;
    _lastMsgAgentId = null;
    _lastMsgTime = 0;

    // 清空消息但保留 welcomeScreen 容器
    const existingWelcome = DOM.welcomeScreen;
    DOM.chatMessages.innerHTML = '';
    // 重新插入 welcomeScreen（innerHTML='' 会把它删掉）
    if (!DOM.chatMessages.contains(existingWelcome)) {
        const ws = document.createElement('div');
        ws.className = 'welcome-screen';
        ws.id = 'welcomeScreen';
        DOM.chatMessages.appendChild(ws);
        DOM.welcomeScreen = ws;
    }
    if (session.messages.length === 0) {
        renderWelcomeScreen(session);
        return;
    }
    hideWelcome();
    // V39: 需要过滤掉的自动化流程系统消息
    const _autoMsgFilters = ['方案已自动确认', '等待确认编排方案', '方案已确认，团队开始工作', '正在快速分析请求类型', '微调模式', '修 Bug 模式', '新功能模式', '全新项目模式'];
    session.messages.forEach(msg => {
        // 兼容两种用户消息标志：type === 'user' 或 isUser === true（聊天历史格式）
        if (msg.type === 'user' || msg.isUser) {
            appendUserMessageDOM(msg);
        } else if (msg.type === 'system') {
            // V39: 过滤自动化流程消息
            if (_autoMsgFilters.some(f => msg.content?.includes(f))) return;
            appendSystemMessageDOM(msg.content);
        } else if (msg.type === 'status_divider') {
            appendStatusDividerDOM(msg.content);
        } else {
            appendGroupMessageDOM(msg);
        }
    });
    // V42d fix: 重建后重新找回素材生成卡片 DOM 引用（修复刷新后卡片消失）
    const restoredCard = DOM.chatMessages.querySelector('.asset-gen-card');
    if (restoredCard) {
        AppState.assetGenCardEl = restoredCard;
    }
    scrollToBottom();
}

// ========================================
// 全局进度胶囊（悬浮在聊天区顶部）
// ========================================
function toggleProgressPanel() {
    AppState.progressExpanded = !AppState.progressExpanded;
    const body = document.getElementById('taskProgressBody');
    const icon = document.getElementById('tpToggleIcon');
    const collapsedRow = document.getElementById('tpCollapsedRow');
    if (body) {
        body.style.display = AppState.progressExpanded ? 'block' : 'none';
    }
    if (collapsedRow) {
        collapsedRow.style.display = AppState.progressExpanded ? 'none' : 'flex';
    }
    if (icon) {
        icon.className = AppState.progressExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
}

function updateGlobalProgress() {
    const task = getCurrentTask();
    if (!task || AppState.currentView !== 'group') return;

    const agentIds = Object.keys(task.agentStatus || {});
    const coordinatorWorking = task.agentStatus?.coordinator === 'working';
    const hasActivity = coordinatorWorking || agentIds.some(id => task.agentStatus[id] !== 'idle');
    if (!hasActivity) return;

    // 同步 roleStates
    const groupStateMap = {};
    agentIds.forEach(aid => {
        const agent = AGENTS[aid];
        if (!agent) return;
        const gn = agent.group;
        const st = task.agentStatus[aid] || 'idle';
        if (st === 'skipped') return;
        if (!groupStateMap[gn]) groupStateMap[gn] = [];
        groupStateMap[gn].push(st);
    });
    for (const [gn, states] of Object.entries(groupStateMap)) {
        if (states.some(s => s === 'working')) AppState.roleStates[gn] = 'working';
        else if (states.every(s => s === 'done')) AppState.roleStates[gn] = 'done';
        else if (states.some(s => s === 'error')) AppState.roleStates[gn] = 'done';
        else if (states.some(s => s === 'idle')) AppState.roleStates[gn] = 'idle';
    }

    // V40b: 刷新侧边栏角色行滚动播报
    renderTeamStatusPanel();
    // V40b: 如果在成员详情页，局部刷新任务区
    if (AppState.activeMemberView) _refreshMemberTaskSection(AppState.activeMemberView);
}

/** V40b: 局部刷新成员详情页的任务进度区 */
function _refreshMemberTaskSection(groupName) {
    const taskListEl = document.querySelector('.member-task-list');
    if (!taskListEl) return;
    const task = getCurrentTask();
    if (!task) return;
    const groupAgentIds = Object.keys(AGENTS).filter(aid => AGENTS[aid].group === groupName);
    const taskSteps = [];
    groupAgentIds.forEach(aid => {
        const st = task.agentStatus?.[aid] || 'idle';
        if (st === 'skipped' || st === 'idle') return;
        const agent = AGENTS[aid];
        const taskDesc = task.planData?.agent_tasks?.[aid] || agent.desc;
        const subtasks = task.agentSubtasks?.[aid] || [];
        if (subtasks.length > 0) {
            subtasks.forEach(sub => { taskSteps.push({ name: sub.name, status: sub.status || 'pending' }); });
        } else {
            taskSteps.push({ name: taskDesc, status: st === 'done' ? 'done' : st === 'working' ? 'working' : st === 'error' ? 'error' : 'pending' });
        }
    });
    const doneCount = taskSteps.filter(s => s.status === 'done').length;
    const countEl = document.querySelector('.member-task-count');
    if (countEl) countEl.textContent = `${doneCount}/${taskSteps.length}`;
    taskListEl.innerHTML = taskSteps.map(step => {
        const icon = step.status === 'done' ? '✅' : step.status === 'working' ? '<span class="step-spinner"></span>' : step.status === 'error' ? '❌' : '<span class="step-pending-dot">○</span>';
        return `<div class="member-task-step ${step.status}"><span class="step-icon">${icon}</span><span class="step-name">${escapeHTML(step.name)}</span></div>`;
    }).join('');
}

// ========================================
// 欢迎界面
// ========================================

/** 各通道的欢迎配置 */
const CHANNEL_WELCOME = {
    main: {
        icon: 'fa-gamepad',
        title: '想做什么游戏？',
        desc: '一句话描述你的创意，AI 工作室马上动手',
        color: '#6366F1',
        suggestions: [
            { emoji: '🚀', label: '太空射击', prompt: '做一个太空射击小游戏，赛博朋克风格', desc: '操控飞船消灭外星入侵者' },
            { emoji: '🐍', label: '贪吃蛇', prompt: '做一个像素风格的贪吃蛇', desc: '经典像素风，吃豆变长' },
            { emoji: '🃏', label: '记忆翻牌', prompt: '做一个卡通风格的记忆翻牌', desc: '翻开配对，锻炼记忆力' },
        ],
        showTeam: true,
    },
    research: {
        icon: 'fa-lightbulb',
        title: '灵灵 · 调研',
        desc: '竞品拆解、用户洞察、玩法设计、数值框架，做之前先想清楚',
        color: '#F59E0B',
        capabilities: [
            { icon: 'fa-compass', text: '竞品分析 — 拆解市场上的热门玩法' },
            { icon: 'fa-puzzle-piece', text: '玩法设计 — 核心循环 / 系统框架 / 数值模型' },
            { icon: 'fa-map', text: '关卡策划 — 难度曲线 / 关卡编排 / 叙事线索' },
            { icon: 'fa-coins', text: '经济系统 — 货币 / 商店 / 成长体系设计' },
        ],
        suggestions: [
            { emoji: '🔍', label: '竞品分析', prompt: '帮我分析塔防类小游戏的主流玩法和盈利模式' },
            { emoji: '🧩', label: '玩法设计', prompt: '设计一个三消+RPG的混合玩法核心循环' },
            { emoji: '📊', label: '数值框架', prompt: '帮我搭建一个放置类游戏的经济数值框架' },
        ],
        showTeam: false,
    },
    art: {
        icon: 'fa-palette',
        title: '绘绘 · 美术',
        desc: '风格定义、素材生成、特效动画、UI/UX 设计，让你的游戏好看',
        color: '#EC4899',
        capabilities: [
            { icon: 'fa-brush', text: '风格定义 — 确定画风 / 配色方案 / 视觉语言' },
            { icon: 'fa-image', text: '素材生成 — AI 生成角色 / 场景 / UI 元素' },
            { icon: 'fa-wand-magic-sparkles', text: '特效动画 — 粒子效果 / 转场动画 / 反馈动效' },
            { icon: 'fa-mobile-screen', text: 'UI/UX — 界面布局 / 交互设计 / 适配优化' },
        ],
        suggestions: [
            { emoji: '🎨', label: '风格探索', prompt: '给我的太空射击游戏设计一套赛博朋克风格方案' },
            { emoji: '🖼️', label: '素材生成', prompt: '帮我生成一组卡通风格的怪物角色素材' },
            { emoji: '✨', label: '动效设计', prompt: '设计一套打击感强烈的技能释放特效方案' },
        ],
        showTeam: false,
    },
    sound: {
        icon: 'fa-headphones',
        title: '乐乐 · 音效',
        desc: 'BGM 创作、打击音效、环境音、氛围营造，让你的游戏好听',
        color: '#06B6D4',
        capabilities: [
            { icon: 'fa-music', text: 'BGM 设计 — 主题曲 / 场景氛围 / 循环音乐' },
            { icon: 'fa-volume-high', text: '音效制作 — 交互反馈 / 环境音 / 打击音效' },
            { icon: 'fa-sliders', text: '音频混缩 — 音量层级 / 空间感 / 频段平衡' },
            { icon: 'fa-ear-listen', text: '氛围营造 — 用声音讲述故事和增强沉浸感' },
        ],
        suggestions: [
            { emoji: '🎵', label: 'BGM 创作', prompt: '为我的像素冒险游戏创作一段轻松的探索 BGM' },
            { emoji: '💥', label: '打击音效', prompt: '设计一组爽快的近战打击音效方案' },
            { emoji: '🌊', label: '环境音', prompt: '帮我制作一套海底探险场景的环境音效' },
        ],
        showTeam: false,
    },
};

function renderWelcomeScreen(session) {
    if (!session) session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (!session) return;

    const ch = session.channel || session.id || 'main';

    // V37: 主线欢迎页 — 新手教学引导设计（教用户怎么表达想法）
    if (ch === 'main') {
        DOM.welcomeScreen.innerHTML = `
            <div class="welcome-hero-minimal">
                <div class="welcome-emoji-large">🎮</div>
                <div class="welcome-title-large">告诉我你的游戏创意</div>
                <div class="welcome-desc-minimal">不需要会编程，用自然语言描述就行</div>
            </div>
            <div class="welcome-tutorial">
                <div class="tutorial-step">
                    <div class="tutorial-step-num">1</div>
                    <div class="tutorial-step-body">
                        <div class="tutorial-step-title">描述你想要的游戏</div>
                        <div class="tutorial-step-desc">告诉我核心玩法、美术风格、主题，越具体越好</div>
                        <div class="tutorial-examples">
                            <span class="tutorial-example-pill" data-prompt="做一个像素风格的太空射击小游戏，玩家操控飞船左右移动并射击外星人，有3种敌人和Boss战">🚀 太空射击 + 像素风 + Boss战</span>
                            <span class="tutorial-example-pill" data-prompt="做一个赛博朋克风格的跑酷游戏，角色在霓虹城市屋顶奔跑跳跃，收集能量芯片，越跑越快">🏃 赛博跑酷 + 收集 + 加速</span>
                        </div>
                    </div>
                </div>
                <div class="tutorial-step">
                    <div class="tutorial-step-num">2</div>
                    <div class="tutorial-step-body">
                        <div class="tutorial-step-title">AI 工作室协作完成</div>
                        <div class="tutorial-step-desc">策划设计玩法 → 美术出素材规格 → 工程师写代码，全自动</div>
                    </div>
                </div>
                <div class="tutorial-step">
                    <div class="tutorial-step-num">3</div>
                    <div class="tutorial-step-body">
                        <div class="tutorial-step-title">预览 & 持续迭代</div>
                        <div class="tutorial-step-desc">右侧实时预览游戏，不满意就继续发消息修改</div>
                    </div>
                </div>
            </div>
            <div class="welcome-input-hint">
                <i class="fas fa-lightbulb"></i>
                <span>试试在下方输入：</span>
                <span class="hint-example">「做一个水果主题的三消小游戏，卡通风格，有连击特效」</span>
            </div>`;
    }

    DOM.welcomeScreen.style.display = 'flex';

    // 绑定教学示例 pill（点击填入输入框，不自动发送——让用户有机会修改）
    DOM.welcomeScreen.querySelectorAll('.tutorial-example-pill').forEach(el => {
        el.addEventListener('click', () => {
            DOM.chatInput.value = el.dataset.prompt;
            DOM.chatInput.focus();
            // 输入框高亮提示
            DOM.chatInput.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.4)';
            setTimeout(() => { DOM.chatInput.style.boxShadow = ''; }, 1500);
        });
    });
    // 绑定建议 pill（单独对话样式）
    DOM.welcomeScreen.querySelectorAll('.welcome-suggestion').forEach(el => {
        el.addEventListener('click', () => {
            DOM.chatInput.value = el.dataset.prompt;
            handleSend();
        });
    });
}

function hideWelcome() {
    if (DOM.welcomeScreen) DOM.welcomeScreen.style.display = 'none';
}

// ========================================
// 消息发送与显示
// ========================================
function addSessionMessage(msg) {
    const session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (session) session.messages.push(msg);
}

function addUserMessage(content, mentioned) {
    const msg = { type: 'user', isUser: true, content, time: getTimeStr(), mentioned: mentioned || [] };
    addSessionMessage(msg);
    appendUserMessageDOM(msg);
    saveChatHistory();
}

function addGroupMessage(agentId, content, extra, extraData, targetSessionId) {
    const msg = { agentId, content, time: getTimeStr(), extra, extraData };
    // v14 fix: 支持指定目标 session，默认走当前活跃 session
    const sid = targetSessionId || AppState.currentSessionId || 'main';
    const targetSession = AppState.sessions.find(s => s.id === sid) || getCurrentGroupSession();
    targetSession.messages.push(msg);
    if (AppState.currentSessionId === targetSession.id) {
        appendGroupMessageDOM(msg);
    } else {
        // 消息不在当前展示的 session —— 刷新侧边栏显示最新消息预览
        renderConvList();
    }
    saveChatHistory();
}

function addSystemMessage(text, targetSessionId) {
    const msg = { type: 'system', content: text, time: getTimeStr() };
    const sid = targetSessionId || AppState.currentSessionId;
    const session = AppState.sessions.find(s => s.id === sid);
    if (session) session.messages.push(msg);
    if (AppState.currentSessionId === sid) {
        // V42 fix: 成员面板模式下不追加系统消息到 DOM
        if (!AppState.activeMemberView) appendSystemMessageDOM(text);
    }
}

function getCurrentGroupSession() {
    return AppState.sessions.find(s => s.id === 'main' || s.id === 'group') || AppState.sessions[0];
}

/** 获取发起当前操作的 session ID（用于闭包捕获） */
function getCapturedSessionId() {
    return AppState.currentSessionId || 'main';
}

// ========================================
// 全局确认提醒 Toast 系统
// ========================================
let _toastTimer = null;

function showConfirmToast(agentName, sessionName, sessionId) {
    const toast = document.getElementById('globalConfirmToast');
    const text = document.getElementById('confirmToastText');
    const btn = document.getElementById('confirmToastBtn');
    const closeBtn = document.getElementById('confirmToastClose');
    if (!toast || !text) return;

    text.textContent = `${agentName} 在「${sessionName}」请求你确认方案`;
    toast.style.display = 'flex';
    toast.classList.add('toast-enter');

    // 自动消失 8 秒
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => hideConfirmToast(), 8000);

    // 点击查看 → 跳转到对应 session
    if (btn) {
        btn.onclick = () => {
            if (sessionId) switchSession(sessionId);
            hideConfirmToast();
        };
    }
    if (closeBtn) {
        closeBtn.onclick = () => hideConfirmToast();
    }
}

function hideConfirmToast() {
    const toast = document.getElementById('globalConfirmToast');
    if (toast) {
        toast.classList.remove('toast-enter');
        toast.style.display = 'none';
    }
    if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
}

/** 清除某 session 的待确认计数 */
function clearPendingConfirms(sessionId) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (session) {
        session._pendingConfirms = 0;
        renderConvList();
    }
}

// ========================================
// Markdown 渲染
// ========================================
// 配置 marked（如果可用）
if (typeof marked !== 'undefined') {
    // V41: 自定义 renderer，让链接在新窗口打开
    const renderer = new marked.Renderer();
    const _origLinkRenderer = renderer.link;
    renderer.link = function(href, title, text) {
        // marked v5+ 可能传对象参数
        if (typeof href === 'object') {
            const token = href;
            return `<a href="${token.href}" target="_blank" rel="noopener"${token.title ? ` title="${token.title}"` : ''}>${token.text}</a>`;
        }
        return `<a href="${href}" target="_blank" rel="noopener"${title ? ` title="${title}"` : ''}>${text}</a>`;
    };
    marked.setOptions({
        breaks: true,       // 换行符转 <br>
        gfm: true,          // GitHub Flavored Markdown
        headerIds: false,
        mangle: false,
        renderer: renderer,
    });
    console.log('[Markdown] marked.js loaded ✅');
} else {
    console.warn('[Markdown] marked.js NOT loaded, using built-in fallback');
}

function renderMarkdown(text) {
    if (!text) return '';

    // V29: 预处理 @image:filename 引用 → 转为 markdown 图片语法
    // 匹配 @image:xxx.png 或 `assets/xxx.png` 形式
    text = text.replace(/@image:([^\s\n]+\.(png|jpg|jpeg|webp|gif|svg))/gi, (_, filename) => {
        const projectId = AppState.currentProjectId;
        if (projectId) {
          return `![${filename}](${AppState.apiBaseUrl || ''}/projects/${
              projectId}/assets/${filename}?v=${Date.now()})`;
        }
        return `\`📎 ${filename}\``;
    });

    // 如果 marked 库可用，使用完整 Markdown 渲染
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        try {
            return marked.parse(text);
        } catch (e) {
            console.warn('[renderMarkdown] parse error, fallback to built-in:', e);
        }
    }
    // 内置 Markdown 渲染（不依赖外部库）
    return renderMarkdownBuiltin(text);
}

/**
 * 内置 Markdown 渲染器 —— 当 marked.js 加载失败时使用
 * 支持：标题(#)、加粗(**)、斜体(*)、行内代码(`)、代码块(```)、
 *       无序列表(-)、有序列表(1.)、链接、换行
 */
function renderMarkdownBuiltin(text) {
    if (!text) return '';
    let html = text;

    // 代码块 ```lang\n...\n```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    // 行内代码 `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 标题 # ~ ######
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // 加粗 **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // 斜体 *text*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // 链接 [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 无序列表 - item （连续行）
    html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // 有序列表 1. item
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // 引用 > text
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // 水平线
    html = html.replace(/^---+$/gm, '<hr>');

    // 换行
    html = html.replace(/\n/g, '<br>');

    // 清理多余的 <br> 在块级元素后
    html = html.replace(/<\/(h[1-6]|pre|ul|ol|blockquote|hr)><br>/g, '</$1>');
    html = html.replace(/<br><(h[1-6]|pre|ul|ol|blockquote|hr)/g, '<$1');

    return html;
}

function appendUserMessageDOM(msg) {
    hideWelcome();
    const el = document.createElement('div');
    el.className = 'message user';
    let mentionHTML = '';
    if (msg.mentioned && msg.mentioned.length > 0) {
        const tags = msg.mentioned.map(agentId => {
            const agent = AGENTS[agentId];
            return agent ? `<span class="mention-tag"><i class="fas ${agent.icon}"></i> @${getGroupDisplayName(agent.group)}</span>` : '';
        }).join(' ');
        mentionHTML = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px;justify-content:flex-end;">${tags}</div>`;
    }
    el.innerHTML = `<div class="message-avatar">U</div><div class="message-content"><div class="message-bubble">${mentionHTML}${escapeHTML(msg.content)}</div><div class="message-time">${msg.time}</div></div>`;
    DOM.chatMessages.appendChild(el);
    scrollToBottom();
}

// 跟踪最后一条消息的 DOM 元素，用于同 Agent 连续消息合并
let _lastMsgEl = null;
let _lastMsgAgentId = null;
let _lastMsgTime = 0;

const MERGE_WINDOW_MS = 8000; // 8 秒内同 Agent 消息合并

function appendGroupMessageDOM(msg) {
    // V42 fix: 成员信息面板模式下，不往 chatMessages 追加群聊消息（消息仍存入 session.messages）
    if (AppState.activeMemberView) return;
    hideWelcome();
    const agent = getAgent(msg.agentId);
    if (!agent) return;

    // B1: 获取该 Agent 的组信息
    const groupName = agent.group;
    const groupColor = getGroupColor(groupName);
    const groupIcon = getGroupIcon(groupName);
    const groupRep = getGroupRepAgent(groupName);

    let extraHTML = '';
    if (msg.extra === 'dispatch') extraHTML = renderDispatchCard(msg.extraData);
    else if (msg.extra === 'result') extraHTML = renderAgentResultCard(msg.extraData);
    else if (msg.extra === 'summary') extraHTML = renderSummaryCard();
    else if (msg.extra === 'status_inline') extraHTML = renderStatusInline(msg.extraData);
    else if (msg.extra === 'agent_workspace') extraHTML = renderAgentWorkspace(msg.extraData);
    else if (msg.extra === 'delivery_card') extraHTML = renderDeliveryCard(msg.extraData);
    else if (msg.extra === 'agent_summary') extraHTML = renderAgentSummaryCard(msg.extraData);
    else if (msg.extra === 'plan_confirm_inline') extraHTML = renderPlanConfirmInline();
    else if (msg.extra === 'req_picker') extraHTML = renderRequirementPicker(msg.extraData);
    else if (msg.extra === 'link_card') extraHTML = renderLinkCard(msg.extraData);
    else if (msg.extra === 'task_plan_card') extraHTML = renderTaskPlanCard(msg.extraData);
    // V31: 新增卡片类型
    else if (msg.extra === 'role_summary') extraHTML = renderRoleSummaryCardHTML(msg.extraData);
    else if (msg.extra === 'idle_invite') extraHTML = renderIdleInviteCardHTML(msg.extraData);
    else if (msg.extra === 'thread_archive') extraHTML = renderThreadArchiveCardHTML(msg.extraData);
    // V32: 素材画廊卡片
    else if (msg.extra === 'asset_gallery') extraHTML = renderAssetGalleryCardHTML(msg.extraData);

    const now = Date.now();
    const hasExtra = !!msg.extra;

    // 尝试合并：同组、无特殊卡片、时间间隔 < MERGE_WINDOW_MS
    if (!hasExtra && _lastMsgEl && _lastMsgAgentId === msg.agentId && (now - _lastMsgTime) < MERGE_WINDOW_MS) {
        const bubble = _lastMsgEl.querySelector('.message-bubble');
        if (bubble) {
            bubble.innerHTML += renderMarkdown(msg.content || '');
            _lastMsgTime = now;
            const timeEl = _lastMsgEl.querySelector('.message-time');
            if (timeEl) timeEl.textContent = msg.time;
            scrollToBottom();
            return;
        }
    }

    // 创建新消息气泡
    const el = document.createElement('div');
    el.className = 'message ai';

    // V34: 消息头只显示角色昵称，不暴露子Agent名
    const groupDispName = getGroupDisplayName(groupName);
    const agentLabel = groupDispName;
    const agentSubLabel = '';

    // B2: 消息折叠 → 摘要卡片（长文自动进评审区）
    // V29: 包含图片引用的消息不折叠（避免截断 @image:xxx）
    const hasImageRef = msg.content && (/@image:/i.test(msg.content) || /!\[.*\]\(.*\.(png|jpg|jpeg|webp|gif|svg)/i.test(msg.content));
    let bubbleContent = renderMarkdown(msg.content || '') + extraHTML;
    if (!hasExtra && !hasImageRef && msg.content && msg.content.length > MSG_COLLAPSE_THRESHOLD) {
        // 群里只展示摘要卡片
        bubbleContent = wrapWithCollapse(renderMarkdown(msg.content || ''), msg.content) + extraHTML;
        // 长文自动送入评审区
        const docTitle = `${getAgentDisplayName(msg.agentId)} · ${msg.time || ''}`;
        addDocToReview(docTitle, msg.content, msg.agentId);
    }

    el.innerHTML = `
        <div class="message-avatar group-avatar" style="background:${groupColor}22;color:${groupColor}" title="点击与${agent.name}对话" data-agent-click="${msg.agentId}">${getAgentAvatarHTML(msg.agentId)}</div>
        <div class="message-content">
            <div class="message-agent-name" style="color:${groupColor}">${agentLabel}${agentSubLabel}</div>
            <div class="message-bubble agent-${msg.agentId}">${bubbleContent}</div>
            <div class="message-time">${msg.time}</div>
        </div>`;

    // 记录用于合并
    if (!hasExtra) {
        _lastMsgEl = el;
        _lastMsgAgentId = msg.agentId;
        _lastMsgTime = now;
    } else {
        _lastMsgEl = null;
        _lastMsgAgentId = null;
    }

    // Agent 头像点击 → 进入聊天
    const avatarEl = el.querySelector('[data-agent-click]');
    if (avatarEl) {
        avatarEl.addEventListener('click', () => enterAgentChat(avatarEl.dataset.agentClick));
    }

    // B2: "查看全部"按钮 → 联动评审区，直接打开这个 agent 的 tab
    const collapseToggle = el.querySelector('.msg-collapse-toggle');
    if (collapseToggle && msg.content && msg.content.length > MSG_COLLAPSE_THRESHOLD) {
        collapseToggle.addEventListener('click', () => {
            const agentName = agent ? getAgentDisplayName(agent.id) : msg.agentId;
            const docTitle = `${agentName} · ${msg.time || ''}`;
            addDocToReview(docTitle, msg.content, msg.agentId);
            openReviewTab(`agent-${msg.agentId}`);
        });
    }

    // V34: 摘要卡片「讨论 ↗」按钮 → 打开角色看板对话
    const roleSummaryCard = el.querySelector('.role-summary-card');
    if (roleSummaryCard) {
        const discussBtn = roleSummaryCard.querySelector('[data-action="discuss"]');
        if (discussBtn) {
            discussBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gn = roleSummaryCard.dataset.groupName;
                if (gn) openMemberView(gn);
            });
        }
        const viewBtn = roleSummaryCard.querySelector('[data-action="view"]');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const aid = roleSummaryCard.dataset.agentId;
                if (aid) openReviewTab(`agent-${aid}`);
            });
        }
    }

    // V34: 空闲邀请卡片选项按钮 → 打开角色对话
    const inviteCard = el.querySelector('.idle-invite-card');
    if (inviteCard) {
        inviteCard.querySelectorAll('.iic-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gn = inviteCard.dataset.groupName;
                if (gn) {
                    openMemberView(gn);
                    // 自动填入选中的方向到输入框
                    setTimeout(() => {
                        if (DOM.chatInput && AppState.activeMemberView) {
                            DOM.chatInput.value = btn.textContent.trim();
                            DOM.chatInput.focus();
                        }
                    }, 200);
                }
            });
        });
        const skipBtn = inviteCard.querySelector('.iic-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                inviteCard.style.opacity = '0.5';
                inviteCard.style.pointerEvents = 'none';
            });
        }
    }

    // V31: 归档卡片交互
    const archiveCard = el.querySelector('.thread-archive-card');
    if (archiveCard) {
        const reopenBtn = archiveCard.querySelector('[data-action="reopen"]');
        if (reopenBtn) {
            reopenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gn = archiveCard.dataset.groupName;
                if (gn) openThread(gn);
            });
        }
    }

    // V32: 素材画廊卡片交互
    const galleryCard = el.querySelector('.asset-gallery-card');
    if (galleryCard) {
        const discussBtn = galleryCard.querySelector('[data-action="discuss"]');
        if (discussBtn) {
            discussBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gn = galleryCard.dataset.groupName;
                if (gn) openThread(gn);
            });
        }
        const viewBtn = galleryCard.querySelector('[data-action="view"]');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const aid = galleryCard.dataset.agentId;
                if (aid) openReviewTab(`agent-${aid}`);
            });
        }
        // 素材缩略图点击 → 在新标签预览
        galleryCard.querySelectorAll('.asg-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const filename = item.dataset.filename;
                if (filename && AppState.currentProjectId) {
                  const url = `${AppState.apiBaseUrl || ''}/projects/${
                      AppState.currentProjectId}/assets/${filename}`;
                  window.open(url, '_blank');
                }
            });
        });
    }

    // 交付卡片：操作闭环 + 空间下钻
    const deliveryCard = el.querySelector('.delivery-card');
    if (deliveryCard) {
        const agentId = msg.extraData?.agentId;

        // 采纳按钮
        const acceptBtn = deliveryCard.querySelector('[data-action="accept"]');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                acceptBtn.innerHTML = '<i class="fas fa-check-double"></i> 已采纳';
                acceptBtn.disabled = true;
                acceptBtn.style.opacity = '0.6';
                addGroupMessage('coordinator', `已采纳 ${msg.extraData?.title || ''} 的交付成果，素材已同步到资源库。`);
            });
        }

        // 打回按钮 → 展开反馈输入
        const rejectBtn = deliveryCard.querySelector('[data-action="reject"]');
        const rejectForm = deliveryCard.querySelector('.delivery-reject-form');
        if (rejectBtn && rejectForm) {
            rejectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                rejectForm.classList.toggle('show');
                if (rejectForm.classList.contains('show')) {
                    rejectForm.querySelector('input')?.focus();
                }
            });
            const rejectSend = rejectForm.querySelector('.delivery-reject-send');
            const rejectInput = rejectForm.querySelector('input');
            if (rejectSend && rejectInput) {
                const doReject = () => {
                    const feedback = rejectInput.value.trim() || '请重新调整';
                    rejectForm.classList.remove('show');
                    rejectInput.value = '';
                    addGroupMessage(agentId || 'coordinator', `收到修改意见：「${feedback}」，正在重新调整...`, 'status_inline', {
                        agentId: agentId || 'coordinator', status: 'working', pct: 10,
                        text: `根据反馈重新调整中...`,
                    });
                };
                rejectSend.addEventListener('click', (e) => { e.stopPropagation(); doReject(); });
                rejectInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); doReject(); }
                });
                rejectInput.addEventListener('click', (e) => e.stopPropagation());
            }
        }

        // 详细调整 → 空间下钻到 Agent 单聊
        const detailBtn = deliveryCard.querySelector('[data-action="detail"]');
        if (detailBtn && agentId) {
            detailBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                drillIntoAgent(agentId);
            });
        }

        // 卡片空白处点击 → 也下钻
        deliveryCard.addEventListener('click', () => {
            if (agentId) drillIntoAgent(agentId);
        });
    }

    const summaryCard = el.querySelector('.agent-summary-card');
    if (summaryCard && msg.extraData?.agentId) {
        summaryCard.addEventListener('click', () => drillIntoAgent(msg.extraData.agentId));
    }

    const pickerCard = el.querySelector('.req-picker-card');
    if (pickerCard && msg.extraData) {
        bindPickerInteraction(pickerCard, msg.extraData);
    }

    const linkCard = el.querySelector('.chat-link-card');
    if (linkCard && msg.extraData?.url) {
        linkCard.addEventListener('click', () => openWebview(msg.extraData.url, msg.extraData.title));
    }

    // ===== 确认提醒系统 =====
    const needsConfirm = msg.extra === 'plan_confirm_inline' || msg.extra === 'req_picker' || msg.extra === 'delivery_card';
    if (needsConfirm) {
        el.classList.add('msg-needs-confirm');
        const currentSession = AppState.sessions.find(s => s.id === AppState.currentSessionId);
        // 只在用户不在底部（看不到新消息）时弹 Toast
        const chatEl = DOM.chatMessages;
        const isNearBottom = chatEl && (chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight < 120);
        if (!isNearBottom) {
            showConfirmToast(getGroupDisplayName(agent.group), currentSession?.name || '群聊', AppState.currentSessionId);
        }
        // 更新 session 的待确认计数
        if (currentSession) {
            currentSession._pendingConfirms = (currentSession._pendingConfirms || 0) + 1;
            renderConvList();
        }
    }

    DOM.chatMessages.appendChild(el);
    scrollToBottom();
}

function appendSystemMessageDOM(text) {
    const el = document.createElement('div');
    el.className = 'system-message';
    el.innerHTML = `<span class="system-line"></span><span class="system-text">${text}</span><span class="system-line"></span>`;
    DOM.chatMessages.appendChild(el);
    scrollToBottom();
}

// ========================================
// 渲染卡片
// ========================================
function renderDispatchCard(data) {
    if (!data) return '';
    const items = data.tasks || [];
    const tasksHTML = items.map(item => `
        <div class="dispatch-task-item">
            <div class="dispatch-agent-dot ${item.agentId}"></div>
            <span class="dispatch-agent-name">${(getAgent(item.agentId) || {}).name || ''}</span>
            <span class="dispatch-task-desc">${item.desc}</span>
        </div>`).join('');
    return `<div class="agent-dispatch-card"><div class="dispatch-tasks">${tasksHTML}</div></div>`;
}

// 极简状态行（降噪后的进度汇报）
function renderStatusInline(data) {
    if (!data) return '';
    const agent = getAgent(data.agentId);
    const displayName = agent ? getAgentDisplayName(data.agentId) : '角色';
    const dotClass = data.status === 'working' ? 'working' : '';
    return `
        <div class="status-inline">
            <span class="status-inline-dot ${dotClass}" style="background:${agent?.color}"></span>
            <span class="status-inline-text">${data.text || displayName + ' 工作中'}</span>
            <span class="status-inline-pct" style="color:${agent?.color}">${data.pct}%</span>
            <div class="status-inline-bar"><div class="status-inline-bar-fill" style="width:${data.pct}%;background:${agent?.color}"></div></div>
        </div>`;
}

// Agent 工作台面板（单聊页面的详细展示）
function renderAgentWorkspace(data) {
    if (!data) return '';
    const agentId = data.agentId;
    const agent = getAgent(agentId);
    const task = getCurrentTask();
    if (!task || !agent) return '';

    const status = task.agentStatus[agentId] || 'idle';
    const pct = Math.round(task.agentProgress[agentId] || 0);
    const subtasks = task.agentSubtasks[agentId] || [];
    const detailLog = (task.agentDetailLog && task.agentDetailLog[agentId]) || [];
    const assets = (task.agentAssets && task.agentAssets[agentId]) || [];

    const statusLabel = status === 'done' ? '✅ 已完成' : status === 'working' ? '⏳ 进行中' : '💤 等待中';
    const statusClass = status === 'done' ? 'done' : status === 'working' ? 'working' : 'idle';

    // 子任务时间线
    const subtasksHTML = subtasks.map((st, i) => {
        const icon = st.status === 'done' ? 'fa-check-circle' : st.status === 'working' ? 'fa-spinner fa-spin' : 'fa-circle';
        const cls = st.status === 'done' ? 'done' : st.status === 'working' ? 'working' : 'pending';
        const log = detailLog[i];
        const detailText = log ? log.detail : st.detail;
        const timeText = log ? log.time : '';
        return `
            <div class="ws-task-item ${cls}">
                <div class="ws-task-icon"><i class="fas ${icon}"></i></div>
                <div class="ws-task-body">
                    <div class="ws-task-title">${st.name}</div>
                    <div class="ws-task-detail">${detailText}</div>
                    ${timeText ? `<div class="ws-task-time">${timeText}</div>` : ''}
                </div>
            </div>`;
    }).join('');

    // 产出素材列表
    let assetsHTML = '';
    if (assets.length > 0) {
        assetsHTML = `
            <div class="ws-section">
                <div class="ws-section-header">
                    <i class="fas fa-folder-open"></i>
                    <span>产出文件</span>
                    <span class="ws-section-count">${assets.length} 个</span>
                </div>
                <div class="ws-assets-grid">
                    ${assets.map(a => `<div class="ws-asset-item"><span class="ws-asset-name">${a}</span></div>`).join('')}
                </div>
            </div>`;
    }

    // 参数面板：Real API 模式下不展示硬编码参数（由 AI 动态决定）
    // 如果有文件变更，展示文件列表
    let paramsHTML = '';
    const fileChanges = (task.agentFileChanges && task.agentFileChanges[agentId]) || [];
    if (fileChanges.length > 0) {
        paramsHTML = `
            <div class="ws-section">
                <div class="ws-section-header"><i class="fas fa-code"></i><span>文件变更</span></div>
                <div class="ws-assets-grid">
                    ${fileChanges.map(f => `<div class="ws-asset-item"><span class="ws-asset-name">${f}</span></div>`).join('')}
                </div>
            </div>`;
    }

    return `
        <div class="agent-workspace-panel" data-ws-agent="${agentId}">
            <div class="ws-header">
                <div class="ws-header-info">
                    <div class="ws-avatar" style="background:${agent.color}22">${agent.emoji}</div>
                    <div class="ws-header-text">
                        <div class="ws-header-name">${agent.name} · 工作台</div>
                        <div class="ws-header-status ${statusClass}">${statusLabel} · ${pct}%</div>
                    </div>
                </div>
                <div class="ws-progress-ring">
                    <svg viewBox="0 0 36 36">
                        <path class="ws-ring-bg" d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="3"/>
                        <path class="ws-ring-fill" d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="${agent.color}" stroke-width="3" stroke-dasharray="${pct}, 100" stroke-linecap="round"/>
                    </svg>
                    <span class="ws-ring-text">${pct}%</span>
                </div>
            </div>

            <!-- B3: Agent 简介卡片 -->
            <div class="ws-section ws-profile-section">
                <div class="ws-profile-card">
                    <div class="ws-profile-role"><i class="fas ${agent.icon}"></i> ${agent.group} · ${agent.desc}</div>
                    <div class="ws-profile-tags">
                        <span class="ws-profile-tag">${agent.role === 'coder' ? '💻 编码' : agent.role === 'planner' ? '📋 策划' : agent.role === 'reviewer' ? '🔍 审核' : '🤖 调度'}</span>
                        <span class="ws-profile-tag">📂 ${agent.group}组</span>
                    </div>
                </div>
            </div>

            <div class="ws-section">
                <div class="ws-section-header">
                    <i class="fas fa-list-check"></i>
                    <span>任务进度</span>
                </div>
                <div class="ws-task-timeline">
                    ${subtasksHTML}
                </div>
            </div>

            ${assetsHTML}
            ${paramsHTML}

            <!-- B3: 完整输出查看（如果有历史消息） -->
            ${renderAgentFullOutput(agentId)}

            <div class="ws-footer">
                <span class="ws-footer-hint">💬 在下方输入框发送修改指令</span>
            </div>
        </div>`;
}

// B3: 渲染 Agent 的完整历史输出（从 group session messages 中提取）
function renderAgentFullOutput(agentId) {
    const groupSession = AppState.sessions.find(s => s.id === 'main' || s.id === 'group');
    if (!groupSession) return '';
    const agentMsgs = groupSession.messages.filter(m => m.agentId === agentId && m.content && m.content.length > 10);
    if (agentMsgs.length === 0) return '';
    return `
        <div class="ws-section ws-output-section">
            <div class="ws-section-header">
                <i class="fas fa-file-lines"></i>
                <span>历史输出</span>
                <span class="ws-section-count">${agentMsgs.length} 条</span>
            </div>
            <div class="ws-output-list">
                ${agentMsgs.slice(-5).map((m, i) => `
                    <div class="ws-output-item">
                        <div class="ws-output-time">${m.time || ''}</div>
                        <div class="ws-output-preview">${(m.content || '').slice(0, 120)}${(m.content || '').length > 120 ? '...' : ''}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

// 交付卡片（任务完成后的精简展示）— v2 真实预览 + 操作闭环
function renderDeliveryCard(data) {
    if (!data) return '';

    // 根据类型渲染不同的真实预览内容
    let previewHTML = '';
    if (data.type === 'art') {
        // 美术：真实微缩图片网格
        const thumbs =
            data.thumbs || [ '🚀', '👾', '🛸', '⭐', '💫', '🛡️', '💥', '🪙' ];
        const showThumbs = thumbs.slice(0, 4);
        previewHTML = `<div class="delivery-preview-grid">${showThumbs.map(t =>
            `<div class="preview-thumb">${t}</div>`
        ).join('')}</div>`;
    } else if (data.type === 'sound') {
        // 音效：迷你波形播放条
        const bars =
            Array.from({length : 24}, () => Math.floor(Math.random() * 28 + 8));
        previewHTML = `
            <button class="delivery-waveform-play"><i class="fas fa-play"></i></button>
            <div class="delivery-preview-waveform">${
            bars.map(h => `<div class="wave-bar" style="height:${h}px"></div>`)
                .join('')}</div>`;
    } else if (data.type === 'code') {
        // 代码：核心逻辑片段缩略
        previewHTML = `<div class="delivery-preview-code">
            <div class="code-line"><span class="code-keyword">class</span> <span class="code-func">GameEngine</span> {</div>
            <div class="code-line">  <span class="code-func">update</span>() {</div>
            <div class="code-line">    <span class="code-keyword">this</span>.player.<span class="code-func">move</span>();</div>
            <div class="code-line">    <span class="code-keyword">this</span>.<span class="code-func">checkCollision</span>();</div>
            <div class="code-line">    <span class="code-keyword">this</span>.<span class="code-func">render</span>(); }</div>
            <div class="code-line"><span class="code-comment">// Canvas 2D · 639行 · 60fps</span></div>
        </div>`;
    } else {
        previewHTML = `<div class="delivery-preview-grid"><div class="preview-thumb">${data.emoji || '📦'}</div></div>`;
    }

    // 工程师（代码）类型：自动应用，无需用户确认
    if (data.type === 'code') {
        return `
            <div class="delivery-card delivery-auto-applied" data-agent-drill="${data.agentId || ''}">
                <div class="delivery-card-preview" style="${data.previewBg ? 'background:' + data.previewBg : ''}">
                    ${previewHTML}
                    <div class="preview-hint"><span><i class="fas fa-expand"></i> 点击查看详情</span></div>
                </div>
                <div class="delivery-card-body">
                    <div class="delivery-card-info">
                        <div class="delivery-card-title"><span class="done-badge"><i class="fas fa-check"></i></span>${data.title}</div>
                        <div class="delivery-card-desc">${data.desc}</div>
                    </div>
                </div>
                <div class="delivery-card-applied">
                    <span class="applied-badge"><i class="fas fa-check-double"></i> 已自动应用到预览</span>
                    <button class="delivery-action-btn tertiary" data-action="detail"><i class="fas fa-code"></i> 查看代码</button>
                </div>
            </div>`;
    }

    return `
        <div class="delivery-card" data-agent-drill="${data.agentId || ''}">
            <div class="delivery-card-preview" style="${data.previewBg ? 'background:' + data.previewBg : ''}">
                ${previewHTML}
                <div class="preview-hint"><span><i class="fas fa-expand"></i> 点击查看详情</span></div>
            </div>
            <div class="delivery-card-body">
                <div class="delivery-card-info">
                    <div class="delivery-card-title"><span class="done-badge"><i class="fas fa-check"></i></span>${data.title}</div>
                    <div class="delivery-card-desc">${data.desc}</div>
                </div>
            </div>
            <div class="delivery-card-actions">
                <button class="delivery-action-btn primary" data-action="accept"><i class="fas fa-check"></i> 采纳并应用</button>
                <button class="delivery-action-btn secondary" data-action="reject"><i class="fas fa-rotate-left"></i> 打回重做</button>
                <button class="delivery-action-btn tertiary" data-action="detail"><i class="fas fa-gear"></i> 详细调整</button>
            </div>
            <div class="delivery-reject-form">
                <input type="text" placeholder="附上修改意见，如"颜色太暗了"" />
                <button class="delivery-reject-send"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>`;
}

function renderAgentResultCard(data) {
    if (!data) return '';
    return `
        <div class="agent-result-card">
            <div class="result-header"><div class="result-icon done"><i class="fas fa-check"></i></div><span class="result-title">${
        data.title || '任务完成'}</span></div>
            <div class="result-body">${data.body || ''}</div>
            ${
        data.tags
            ? `<div class="result-tags">${
                  data.tags.map(t => `<span class="result-tag">${t}</span>`)
                      .join('')}</div>`
            : ''}
        </div>`;
}

function renderSummaryCard() {
    return `<div class="summary-card"><div class="summary-icon"><i class="fas fa-check"></i></div><div class="summary-text">游戏已生成，可在预览区体验 <span>· 点击 Agent 头像查看详情</span></div></div>`;
}

function renderAgentSummaryCard(data) {
    if (!data) return '';
    const agent = getAgent(data.agentId);
    const statusIcon = data.status === 'done' ? 'fa-check' : 'fa-spinner fa-spin';
    const tagsHTML = (data.tags || []).map(t => `<span class="stag">${t}</span>`).join('');
    return `
        <div class="agent-summary-card" data-agent="${data.agentId}">
            <div class="agent-summary-header">
                <div class="summary-icon ${data.status}"><i class="fas ${statusIcon}"></i></div>
                <span class="summary-title">${data.title}</span>
                <span class="summary-pct" style="color:${agent?.color}">${data.pct}%</span>
            </div>
            <div class="agent-summary-body">${data.summary}</div>
            ${tagsHTML ? `<div class="agent-summary-tags">${tagsHTML}</div>` : ''}
            <div class="agent-summary-footer">点击查看 <i class="fas fa-chevron-right"></i></div>
        </div>`;
}

function renderPlanConfirmInline() {
    return `
        <div class="plan-confirm-inline">
            <button class="plan-confirm-inline-btn" onclick="confirmPlan()">
                <i class="fas fa-rocket"></i> 确认方案，开始制作
            </button>
            <div class="plan-confirm-inline-hint"><i class="fas fa-edit"></i>也可以直接在下方输入修改意见</div>
        </div>`;
}

function renderRequirementPicker(data) {
    if (!data) return '';
    const dimensions = data.dimensions || ['2D', '3D'];
    const styles = data.styles || ['像素', '卡通', '赛博朋克', '简约', '可爱', '复古'];
    let sectionsHTML = '';
    if (!data.hideDimension) {
        sectionsHTML += `<div class="req-picker-section"><div class="req-picker-label">🎮 游戏维度</div><div class="req-picker-options" data-group="dimension">${dimensions.map(d => `<button class="req-pick-chip" data-pick-type="dimension" data-pick-value="${d}">${d}</button>`).join('')}</div></div>`;
    }
    if (!data.hideStyle) {
        sectionsHTML += `<div class="req-picker-section"><div class="req-picker-label">🎨 视觉风格</div><div class="req-picker-options" data-group="style">${styles.map(s => `<button class="req-pick-chip" data-pick-type="style" data-pick-value="${s}">${s}</button>`).join('')}</div></div>`;
    }
    return `<div class="req-picker-card">${sectionsHTML}<button class="req-confirm-btn hidden" id="btnReqConfirm"><i class="fas fa-check"></i> 确认选择</button></div>`;
}

function renderLinkCard(data) {
    if (!data) return '';
    return `
        <div class="chat-link-card">
            <div class="link-icon"><i class="fas fa-globe"></i></div>
            <div class="link-info">
                <div class="link-title">${data.title || '查看网页'}</div>
                <div class="link-url">${data.url || ''}</div>
            </div>
            <div class="link-open"><i class="fas fa-external-link-alt"></i></div>
        </div>`;
}

function bindPickerInteraction(card, data) {
    const pickerData = { ...data };
    card.querySelectorAll('.req-pick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const type = chip.dataset.pickType;
            const value = chip.dataset.pickValue;
            chip.closest('.req-picker-options').querySelectorAll('.req-pick-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            if (type === 'dimension') pickerData.selectedDimension = value;
            if (type === 'style') pickerData.selectedStyle = value;
            const dimOK = pickerData.selectedDimension || pickerData.hideDimension;
            const styleOK = pickerData.selectedStyle || pickerData.hideStyle;
            const confirmBtn = card.querySelector('.req-confirm-btn');
            if (dimOK && styleOK) {
                confirmBtn.classList.remove('hidden');
                confirmBtn.classList.add('fade-in');
            }
        });
    });
    const confirmBtn = card.querySelector('.req-confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const dim = pickerData.selectedDimension || pickerData.prefilledDimension;
            const sty = pickerData.selectedStyle || pickerData.prefilledStyle;
            if (!dim || !sty) return;
            confirmRequirementPick(dim, sty, pickerData.gameType, pickerData.mentioned, pickerData.useRealAPI, pickerData.originalPrompt);
        });
    }
}

// ========================================
// 任务管理
// ========================================
function createTask(prompt) {
    // 动态初始化所有非 orchestrator Agent 的状态
    const execIds = getExecutionAgentIds();
    const task = {
        name: autoNameTask(prompt),
        status: 'running',
        phase: 'init',
        agentStatus: Object.fromEntries(execIds.map(id => [id, 'idle'])),
        agentProgress: Object.fromEntries(execIds.map(id => [id, 0])),
        agentSubtasks: Object.fromEntries(execIds.map(id => [id, []])),
        agentDetailLog: Object.fromEntries(execIds.map(id => [id, []])),
        agentAssets: Object.fromEntries(execIds.map(id => [id, []])),
        createdAt: Date.now(),
    };
    // 绑定到当前 session（per-session task）
    const currentSession = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (currentSession) {
        currentSession.task = task;
        currentSession._projectId = AppState.currentProjectId; // ② 同步 projectId
    }
    AppState.task = task; // 兼容：同时写全局
    DOM.projectTitle.textContent = task.name;
    DOM.projectStatus.className = 'project-status running';
    DOM.projectStatus.textContent = '执行中';
    DOM.projectStatus.style.display = 'inline-block';
    // 新任务重置阶段指示器（避免显示上一任务的阶段）
    const indicator = document.getElementById('phaseIndicator');
    if (indicator) indicator.style.display = 'none';
    renderConvList(); // 刷新侧边栏进度
    return task;
}

function getCurrentTask() {
    // per-session task：优先从当前 session 取，兼容全局 task
    const session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (session?.task) return session.task;
    return AppState.task;
}

/** 获取指定 session 的 task */
function getSessionTask(sessionId) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    return session?.task || null;
}

// ========================================
// 工作区面板切换 → 评审区 Tab 切换
// ========================================
function switchPanel(panelId) {
    AppState.activePanel = panelId;
    // 评审区 Tab 切换
    switchReviewTab(panelId);
}

function switchReviewTab(tabName) {
    if (!DOM.reviewTabs || !DOM.reviewContent) return;
    // Tab 按钮高亮
    DOM.reviewTabs.querySelectorAll('.review-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // 面板切换
    DOM.reviewContent.querySelectorAll('.review-pane').forEach(pane => {
        pane.classList.toggle('active', pane.dataset.pane === tabName);
    });
    // 隐藏欢迎态
    if (DOM.reviewWelcome && tabName) DOM.reviewWelcome.style.display = 'none';
}

function openWebview(url, title) {
    // 不再有单独 webview 面板，直接加载到预览区 iframe
    loadPreviewFromUrl(url);
}

function renderWebview(url) {
    // 旧版使用 webviewContainer，新版直接操作 previewContent 区域
    if (DOM.previewContent) {
        DOM.previewContent.innerHTML = `<iframe class="webview-frame" src="${url}" sandbox="allow-scripts allow-same-origin allow-popups" style="width:100%;height:100%;border:none;"></iframe>`;
    }
}

function loadPreviewFromUrl(url) {
    if (!DOM.previewContent) return;
    const placeholder = document.getElementById('previewPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    DOM.previewContent.innerHTML = `<iframe id="gamePreviewIframe" class="webview-frame" src="${url}" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" style="width:100%;height:100%;border:none;border-radius:0;"></iframe>`;
}

// ========================================
// 评审区 展开/折叠 + 动态 Tab 系统
// ========================================

// 已注册的评审 Tab 列表 [{id, icon, label, paneHTML}]
const _reviewTabRegistry = {};

function initReviewPanel() {
    // 折叠按钮（评审区内部）
    if (DOM.reviewCollapseBtn) {
        DOM.reviewCollapseBtn.addEventListener('click', () => toggleReviewPanel(false));
    }
    // 侧边栏「评审」按钮（已移到侧边栏 header 右上角）
    const btnReview = document.getElementById('btnReviewToggle');
    if (btnReview) {
        btnReview.addEventListener('click', () => {
            const isCollapsed = DOM.reviewPanel && DOM.reviewPanel.classList.contains('collapsed');
            toggleReviewPanel(isCollapsed);
        });
    }
}

/** 展开/折叠评审区 */
// ========================================
// Whiteboard — 白板方案卡片系统
// ========================================
const Whiteboard = {
    cards: [],

    /** 初始化白板（白板已内置在 HTML 的方案面板中） */
    init() {
        const wb = document.getElementById('whiteboardContainer');
        if (!wb) console.warn('[Whiteboard] container not found');
    },

    /** 清空白板 */
    clear() {
        this.cards = [];
        const area = document.getElementById('wbCardsArea');
        if (area) area.innerHTML = `
            <div class="whiteboard-empty" id="wbEmpty">
                <i class="fas fa-note-sticky"></i>
                <p>方案将以卡片形式展示在这里<br>发送游戏需求后，策划和美术会各自贴出方案</p>
            </div>`;
        this._updateCount();
    },

    /**
     * 添加一张方案卡片
     * @param {Object} opts
     */
    addCard(opts) {
        this.cards.push(opts);
        const area = document.getElementById('wbCardsArea');
        if (!area) { console.warn('[Whiteboard] wbCardsArea not found'); return; }

        // 隐藏空状态
        const empty = document.getElementById('wbEmpty');
        if (empty) empty.style.display = 'none';

        // 匹配对应 AI 角色
        const _typeMap = { plan: '策划', art: '美术', sound: '音效', assets: '策划' };
        const _cardType = opts.type || 'plan';
        const _cardGroupName = _typeMap[_cardType] || '策划';
        const _cardGroupInfo = AGENT_GROUPS[_cardGroupName] || {};
        const _cardNickname = _cardGroupInfo.nickname || _cardGroupName;
        const _canChat = _cardGroupInfo.canDirectChat !== false;

        const card = document.createElement('div');
        card.className = 'plan-card animate-in';
        card.style.setProperty('--card-accent', opts.accentColor || '#6366F1');
        card.dataset.cardId = opts.id;
        card.dataset.cardType = _cardType;
        card.dataset.groupName = _cardGroupName;

        // Tags HTML
        const tagsHtml = (opts.tags || []).map(t =>
            `<span class="plan-tag${t.highlight ? ' highlight' : ''}"><i class="${t.icon || 'fas fa-tag'}"></i> ${t.text}</span>`
        ).join('');

        // Sections HTML
        const sectionsHtml = (opts.sections || []).map(s => `
            <div class="plan-section">
                <div class="plan-section-title"><i class="${s.icon || 'fas fa-circle'}"></i> ${s.title}</div>
                <div class="plan-section-content">
                    <ul>${s.items.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="plan-card-header">
                <div class="plan-card-icon">${opts.icon || '📋'}</div>
                <div class="plan-card-meta">
                    <div class="plan-card-title">${opts.title}</div>
                    <div class="plan-card-subtitle">${opts.subtitle || ''}</div>
                </div>
                <button class="plan-card-toggle" title="展开/收起"><i class="fas fa-chevron-down"></i></button>
            </div>
            <div class="plan-card-tags">${tagsHtml}</div>
            <div class="plan-card-body">
                ${sectionsHtml}
                <div class="plan-card-actions">
                    <button class="plan-card-action-btn edit-btn" data-action="edit-card" title="编辑方案">
                        <i class="fas fa-pen-to-square"></i> 编辑
                    </button>
                    ${_canChat ? `<button class="plan-card-action-btn chat-btn" data-action="chat-agent" data-group="${_cardGroupName}" title="与${_cardNickname}详聊">
                        <i class="fas fa-comments"></i> 与${_cardNickname}详聊
                    </button>` : ''}
                    <button class="plan-card-action-btn publish-btn" data-action="republish" title="重新发布" style="display:none;">
                        <i class="fas fa-paper-plane"></i> 重新发布
                    </button>
                </div>
            </div>
        `;

        // Click to toggle expand
        card.addEventListener('click', (e) => {
            if (e.target.closest('.plan-card-body a')) return;
            if (e.target.closest('.plan-card-actions')) return;
            if (e.target.closest('.plan-card-body') && card.classList.contains('editing')) return;
            card.classList.toggle('expanded');
        });

        // 编辑按钮
        card.querySelector('[data-action="edit-card"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            _enterCardEditMode(card, opts);
        });
        // 与 AI 详聊按钮
        card.querySelector('[data-action="chat-agent"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const gn = e.currentTarget.dataset.group;
            if (gn) openMemberChat(gn);
        });
        // 重新发布按钮
        card.querySelector('[data-action="republish"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            _republishCard(card, opts);
        });

        area.appendChild(card);
        this._updateCount();

        // Auto-open plan board panel when first card arrives
        if (this.cards.length === 1) {
            toggleReviewPanel(true);
        }
    },

    _updateCount() {
        const el = document.getElementById('wbCardCount');
        if (el) el.textContent = this.cards.length ? `${this.cards.length} 张方案` : '';
    }
};

function toggleReviewPanel(show) {
    // 尝试从 DOM 缓存或直接查找
    const panel = DOM.reviewPanel || document.getElementById('reviewPanel');
    if (!panel) { console.warn('[toggleReviewPanel] panel not found'); return; }
    const leftHandle = DOM.resizeHandleLeft || document.getElementById('resizeHandleLeft');
    const chatPanel = DOM.chatPanel || document.getElementById('chatPanel');

    console.log('[toggleReviewPanel] show=', show, 'panel classList=', panel.classList.toString());

    if (show) {
        panel.classList.remove('collapsed');
        if (leftHandle) leftHandle.classList.remove('hidden');
        if (chatPanel) {
            chatPanel.style.flex = '';
            chatPanel.style.width = AppState._savedChatWidth || 'var(--chat-panel-width)';
        }
        AppState.reviewOpen = true;
    } else {
        panel.classList.add('collapsed');
        if (leftHandle) leftHandle.classList.add('hidden');
        if (chatPanel) {
            AppState._savedChatWidth = chatPanel.style.width || 'var(--chat-panel-width)';
            chatPanel.style.flex = '1';
            chatPanel.style.width = 'auto';
        }
        AppState.reviewOpen = false;
    }
    // 触发 resize 更新设备尺寸
    requestAnimationFrame(() => {
        const device = DEVICES[AppState.currentDevice];
        if (device) updateDeviceSize(device);
    });
}

/** 确保某个评审 Tab + 面板存在。如果不存在就动态创建。返回面板 DOM */
function ensureReviewPane(tabId, icon, label, createPaneContent) {
    // ★ 方案面板现在由卡片系统管理，不再创建旧式 Tab + pane
    // 如果是 agent 相关的 tab，跳过
    if (tabId && tabId.startsWith('agent-')) return null;
    if (!DOM.reviewTabs || !DOM.reviewContent) return null;

    // 已存在？直接返回
    let pane = DOM.reviewContent.querySelector(`.review-pane[data-pane="${tabId}"]`);
    if (pane) return pane;

    // Tab 标签：直接使用传入的 label（实际文件/内容名）
    let tabLabel = label || tabId;

    // 创建 Tab 按钮
    const btn = document.createElement('button');
    btn.className = 'review-tab';
    btn.dataset.tab = tabId;
    const iconHtml = icon ? `<i class="${icon}"></i> ` : '';
    const badgeHtml = icon ? `<span class="review-tab-badge" data-badge="${tabId}" style="display:none;">0</span>` : '';
    btn.innerHTML = `${iconHtml}${tabLabel} ${badgeHtml}<button class="review-tab-close" data-close-tab="${tabId}"><i class="fas fa-xmark"></i></button>`;
    btn.addEventListener('click', (e) => {
        if (e.target.closest('.review-tab-close')) return;
        switchReviewTab(tabId);
    });
    btn.querySelector('.review-tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeReviewTab(tabId);
    });
    DOM.reviewTabs.appendChild(btn);

    // 创建面板
    pane = document.createElement('div');
    pane.className = 'review-pane';
    pane.dataset.pane = tabId;
    if (createPaneContent) createPaneContent(pane);
    DOM.reviewContent.appendChild(pane);

    // 注册
    _reviewTabRegistry[tabId] = { id: tabId, icon, label: tabLabel };

    _updateReviewBadge();

    return pane;
}

/** 关闭某个评审 Tab */
function closeReviewTab(tabId) {
    if (!DOM.reviewTabs || !DOM.reviewContent) return;
    const tabBtn = DOM.reviewTabs.querySelector(`.review-tab[data-tab="${tabId}"]`);
    const pane = DOM.reviewContent.querySelector(`.review-pane[data-pane="${tabId}"]`);

    const wasActive = tabBtn && tabBtn.classList.contains('active');
    if (tabBtn) tabBtn.remove();
    if (pane) pane.remove();
    delete _reviewTabRegistry[tabId];

    // 如果关掉的是当前活跃 Tab，切到第一个
    if (wasActive) {
        const firstTab = DOM.reviewTabs.querySelector('.review-tab');
        if (firstTab) {
            switchReviewTab(firstTab.dataset.tab);
        } else {
            // 没有 Tab 了，显示欢迎态
            if (DOM.reviewWelcome) DOM.reviewWelcome.style.display = '';
        }
    }
    _updateReviewBadge();
}

/** 打开评审区并切到指定 Tab */
function openReviewTab(tabId) {
    toggleReviewPanel(true);
    switchReviewTab(tabId);
}

/** 更新评审 badge（tab 数量 + 侧边栏 dot） */
function _updateReviewBadge() {
    const count = Object.keys(_reviewTabRegistry).length;
    if (DOM.reviewBadge) {
        DOM.reviewBadge.textContent = count;
        DOM.reviewBadge.style.display = count > 0 ? '' : 'none';
    }
    // 更新侧边栏评审按钮上的 dot
    const dot = document.getElementById('reviewBadgeDot');
    if (dot) {
        dot.style.display = count > 0 ? 'block' : 'none';
    }
}

/**
 * V4: 评审区有新内容时，不自动弹出，改为红点+动效通知
 * - 更新 tab badge 数字
 * - 侧边栏评审按钮 pulse 动效
 * - 如果评审区已展开，自动切到对应 tab（不影响折叠状态）
 */
function notifyReviewUpdate(tabId) {
    // 1. 更新 tab badge
    updateReviewTabBadge(tabId, (parseInt(
        DOM.reviewTabs?.querySelector(`.review-tab-badge[data-badge="${tabId}"]`)?.textContent || '0'
    ) || 0) + 1);

    // 2. 侧边栏评审按钮 pulse 动效
    const reviewToggleBtn = document.getElementById('btnReviewToggle') || DOM.reviewCollapseBtn;
    if (reviewToggleBtn) {
        reviewToggleBtn.classList.add('review-btn-pulse');
        setTimeout(() => reviewToggleBtn.classList.remove('review-btn-pulse'), 2000);
    }

    // 3. 如果已展开，自动切到对应 tab（不改变折叠状态）
    if (AppState.reviewOpen) {
        switchReviewTab(tabId);
    }
}

/** 更新某个 Tab 上的数字 badge */
function updateReviewTabBadge(tabId, num) {
    if (!DOM.reviewTabs) return;
    const badge = DOM.reviewTabs.querySelector(`.review-tab-badge[data-badge="${tabId}"]`);
    if (badge) {
        badge.textContent = num;
        badge.style.display = num > 0 ? '' : 'none';
    }
}

// ========================================
// 看板（动态创建面板）
// ========================================

/** 确保看板面板存在 */
function _ensureKanbanPane() {
    return ensureReviewPane('kanban', 'fas fa-columns', '看板', (pane) => {
        pane.innerHTML = `
            <div class="kanban-board">
                <div class="kanban-lane" data-phase="brainstorm">
                    <div class="kanban-lane-header">
                        <span class="kanban-lane-icon">🧠</span>
                        <span class="kanban-lane-title">构思</span>
                        <span class="kanban-lane-count" data-count="brainstorm">0</span>
                    </div>
                    <div class="kanban-cards" data-lane="brainstorm"></div>
                </div>
                <div class="kanban-lane" data-phase="design">
                    <div class="kanban-lane-header">
                        <span class="kanban-lane-icon">📐</span>
                        <span class="kanban-lane-title">设计</span>
                        <span class="kanban-lane-count" data-count="design">0</span>
                    </div>
                    <div class="kanban-cards" data-lane="design"></div>
                </div>
                <div class="kanban-lane" data-phase="production">
                    <div class="kanban-lane-header">
                        <span class="kanban-lane-icon">🔨</span>
                        <span class="kanban-lane-title">制作</span>
                        <span class="kanban-lane-count" data-count="production">0</span>
                    </div>
                    <div class="kanban-cards" data-lane="production"></div>
                </div>
                <div class="kanban-lane" data-phase="review">
                    <div class="kanban-lane-header">
                        <span class="kanban-lane-icon">✅</span>
                        <span class="kanban-lane-title">审核</span>
                        <span class="kanban-lane-count" data-count="review">0</span>
                    </div>
                    <div class="kanban-cards" data-lane="review"></div>
                </div>
            </div>
            <div class="kanban-timeline">
                <div class="timeline-header">
                    <i class="fas fa-clock"></i> 时间线
                    <span class="timeline-elapsed" data-timeline-elapsed>0:00</span>
                </div>
                <div class="timeline-bars" data-timeline-bars></div>
            </div>`;
    });
}

function _getKanbanLane(phase) {
    const pane = _ensureKanbanPane();
    return pane ? pane.querySelector(`.kanban-cards[data-lane="${phase}"]`) : null;
}

function addKanbanCard(phase, cardData) {
    const lane = _getKanbanLane(phase);
    if (!lane) return;

    // 确保评审区可见并自动展开+切到看板
    toggleReviewPanel(true);
    switchReviewTab('kanban');

    const card = document.createElement('div');
    card.className = `kanban-card ${cardData.status || ''}`;
    card.dataset.agentId = cardData.agentId || '';

    const agent = getAgent(cardData.agentId);
    const agentName = agent ? agent.name : cardData.agentId;
    const agentEmoji = agent ? agent.emoji : '🤖';
    const agentColor = agent ? agent.color : '#6366F1';

    card.innerHTML = `
        <div class="kanban-card-header">
            <span class="kanban-card-agent" style="color:${agentColor}">${
        agentEmoji} ${agentName}</span>
            ${
        cardData.estimatedTime
            ? `<span class="kanban-card-time">${cardData.estimatedTime}</span>`
            : ''}
        </div>
        <div class="kanban-card-title">${escapeHTML(cardData.title || '')}</div>
        ${
        cardData.subtasks
            ? `<div class="kanban-card-subtasks">${
                  cardData.subtasks
                      .map(st => `<div class="kanban-subtask ${
                               st.done ? 'done' : ''}">
                <i class="fas ${
                               st.done
                                   ? 'fa-check-circle'
                                   : 'fa-circle'}"></i> ${escapeHTML(st.name)}
            </div>`).join('')}</div>`
            : ''}
    `;

    lane.appendChild(card);
    updateKanbanCount(phase);
}

function updateKanbanCount(phase) {
    const pane = DOM.reviewContent ? DOM.reviewContent.querySelector('.review-pane[data-pane="kanban"]') : null;
    if (!pane) return;
    const countEl = pane.querySelector(`.kanban-lane-count[data-count="${phase}"]`);
    const lane = pane.querySelector(`.kanban-cards[data-lane="${phase}"]`);
    if (countEl && lane) {
        countEl.textContent = lane.children.length;
    }
    // 更新看板 Tab badge（总卡片数）
    const totalCards = pane.querySelectorAll('.kanban-card').length;
    updateReviewTabBadge('kanban', totalCards);
}

function moveKanbanCard(agentId, fromPhase, toPhase) {
    const pane = DOM.reviewContent ? DOM.reviewContent.querySelector('.review-pane[data-pane="kanban"]') : null;
    if (!pane) return;
    const fromLane = pane.querySelector(`.kanban-cards[data-lane="${fromPhase}"]`);
    const toLane = pane.querySelector(`.kanban-cards[data-lane="${toPhase}"]`);
    if (!fromLane || !toLane) return;

    const card = fromLane.querySelector(`.kanban-card[data-agent-id="${agentId}"]`);
    if (card) {
        fromLane.removeChild(card);
        toLane.appendChild(card);
        updateKanbanCount(fromPhase);
        updateKanbanCount(toPhase);
    }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function clearKanban() {
    const pane = DOM.reviewContent ? DOM.reviewContent.querySelector('.review-pane[data-pane="kanban"]') : null;
    if (!pane) return;
    ['brainstorm', 'design', 'production', 'review'].forEach(phase => {
        const lane = pane.querySelector(`.kanban-cards[data-lane="${phase}"]`);
        if (lane) lane.innerHTML = '';
        updateKanbanCount(phase);
    });
}

// 时间线
let _timelineInterval = null;
function startKanbanTimeline() {
    _ensureKanbanPane();
    const startTime = Date.now();
    if (_timelineInterval) clearInterval(_timelineInterval);
    _timelineInterval = setInterval(() => {
        const el = DOM.reviewContent ? DOM.reviewContent.querySelector('[data-timeline-elapsed]') : null;
        if (!el) return;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopKanbanTimeline() {
    if (_timelineInterval) {
        clearInterval(_timelineInterval);
        _timelineInterval = null;
    }
}

function addTimelineBar(agentId, phase) {
    const bars = DOM.reviewContent ? DOM.reviewContent.querySelector('[data-timeline-bars]') : null;
    if (!bars) return;
    const agent = getAgent(agentId);
    if (!agent) return;

    const bar = document.createElement('div');
    bar.className = `timeline-bar timeline-bar-${phase}`;
    bar.dataset.agentId = agentId;
    bar.innerHTML = `
        <span class="timeline-bar-label">${agent.emoji} ${agent.name}</span>
        <div class="timeline-bar-fill" style="width:0%;background:${agent.color}"></div>
    `;
    bars.appendChild(bar);
}

function updateTimelineBar(agentId, pct) {
    const bars = DOM.reviewContent ? DOM.reviewContent.querySelector('[data-timeline-bars]') : null;
    if (!bars) return;
    const bar = bars.querySelector(`.timeline-bar[data-agent-id="${agentId}"]`);
    if (bar) {
        const fill = bar.querySelector('.timeline-bar-fill');
        if (fill) fill.style.width = Math.min(100, pct) + '%';
    }
}

// ========================================
// 对话列表初始化
// ========================================
function initConvList() {
    // V31: 渲染团队状态 + 子线程列表
    renderConvList();
}

// ========================================
// Agent 产出面板（每个 agent 独立 tab，平铺展示）
// ========================================

/**
 * 将 agent 产出添加到评审区 —— 每个 agent 独立一个 tab，平铺在顶部 tab 栏
 * 如果同一个 agent 多次产出，追加到同一个 tab 里
 */
function addDocToReview(title, content, agentId) {
    // ★ 不再创建旧式文档 Tab，改为送给卡片归类系统
    if (content && content.length > 100 && typeof PlanCardCollector !== 'undefined') {
        PlanCardCollector.addAgentOutput(agentId || 'coordinator', content);
    }
}

/**
 * 兼容旧调用：openReviewTab('docs') → 切到第一个 agent tab
 */
function _openFirstAgentTab() {
    if (!DOM.reviewTabs) return;
    const firstTab = DOM.reviewTabs.querySelector('.review-tab');
    if (firstTab) switchReviewTab(firstTab.dataset.tab);
}

// ========================================
// 设计画廊（归入 agent tab）
// ========================================
function addDesignToReview(imageUrl, title, agentId) {
    const agent = getAgent(agentId);
    const agentEmoji = agent ? agent.emoji : '🎨';
    const tabId = `agent-${agentId || 'art-director'}`;
    const tabLabel = `${agentEmoji} ${title || '设计稿'}`;

    const pane = ensureReviewPane(tabId, '', tabLabel, (p) => {
        p.innerHTML = `<div class="agent-review-viewer"></div>`;
    });
    if (!pane) return;
    // V4: 不自动弹出评审区，改为红点通知
    notifyReviewUpdate(tabId);

    const viewer = pane.querySelector('.agent-review-viewer');
    if (!viewer) return;

    // 确保画廊容器存在
    let gallery = viewer.querySelector('.design-gallery');
    if (!gallery) {
        gallery = document.createElement('div');
        gallery.className = 'design-gallery';
        gallery.style.display = 'grid';
        viewer.appendChild(gallery);
    }

    const thumb = document.createElement('div');
    thumb.className = 'design-gallery-item';
    thumb.innerHTML = `
        <div class="design-gallery-thumb" style="background-image:url(${imageUrl})"></div>
        <div class="design-gallery-info">${escapeHTML(title || '设计稿')}</div>`;
    thumb.addEventListener('click', () => {
        showImagePreview(imageUrl);
    });
    gallery.appendChild(thumb);
    switchReviewTab(tabId);
}

// ====================================
// V41: CodeBuddy API Key 弹窗
// ====================================

let _apiKeyOnSave = null;
let _apiKeyOnCancel = null;

function showApiKeyModal(onSave, onCancel) {
    const modal = document.getElementById('apiKeyModal');
    if (!modal) return;
    _apiKeyOnSave = onSave || null;
    _apiKeyOnCancel = onCancel || null;
    // 回填已有值
    const keyInput = document.getElementById('codebuddyApiKeyInput');
    const envInput = document.getElementById('codebuddyEnvInput');
    if (keyInput) keyInput.value = AppState.codebuddyApiKey || '';
    if (envInput) envInput.value = AppState.codebuddyEnv || '';
    modal.style.display = 'flex';
    if (keyInput) keyInput.focus();
}

function hideApiKeyModal(saved) {
    const modal = document.getElementById('apiKeyModal');
    if (modal) modal.style.display = 'none';
    if (saved && _apiKeyOnSave) _apiKeyOnSave();
    else if (!saved && _apiKeyOnCancel) _apiKeyOnCancel();
    _apiKeyOnSave = null;
    _apiKeyOnCancel = null;
}

function initApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (!modal) return;

    // 关闭按钮
    document.getElementById('btnCloseApiKey')?.addEventListener('click', () => hideApiKeyModal(false));

    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideApiKeyModal(false);
    });

    // 保存按钮
    document.getElementById('btnSaveApiKey')?.addEventListener('click', () => {
        const keyInput = document.getElementById('codebuddyApiKeyInput');
        const envInput = document.getElementById('codebuddyEnvInput');
        const apiKey = keyInput?.value?.trim() || '';
        const env = envInput?.value?.trim() || '';

        if (!apiKey) {
            keyInput?.classList.add('shake');
            setTimeout(() => keyInput?.classList.remove('shake'), 500);
            return;
        }

        // 保存到 AppState + localStorage
        AppState.codebuddyApiKey = apiKey;
        AppState.codebuddyEnv = env;
        localStorage.setItem('wecreat_codebuddy_api_key', apiKey);
        localStorage.setItem('wecreat_codebuddy_env', env);

        // 同步到后端 process.env
        fetch(`${AppState.apiBaseUrl}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codebuddyApiKey: apiKey, codebuddyEnv: env }),
        }).catch(err => console.warn('[WeCreat] Failed to sync API Key to backend:', err));

        console.log('[WeCreat] CodeBuddy API Key saved');

        hideApiKeyModal(true);
    });

    // 显示/隐藏密码
    document.getElementById('apiKeyToggleVis')?.addEventListener('click', () => {
        const input = document.getElementById('codebuddyApiKeyInput');
        const icon = document.querySelector('#apiKeyToggleVis i');
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            icon?.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon?.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
}


// 图片预览弹层
function showImagePreview(url) {
    const overlay = DOM.imagePreviewOverlay;
    if (!overlay) return;
    const img = document.getElementById('imagePreviewImg');
    if (img) img.src = url;
    overlay.style.display = 'flex';
}

// ========================================
// 音效列表（归入 agent tab）
// ========================================
function addAudioToReview(audioUrl, title, duration, agentId) {
    const agent = getAgent(agentId);
    const agentEmoji = agent ? agent.emoji : '🔊';
    const tabId = `agent-${agentId || 'sound-designer'}`;
    const tabLabel = `${agentEmoji} ${title || '音效'}`;

    const pane = ensureReviewPane(tabId, '', tabLabel, (p) => {
        p.innerHTML = `<div class="agent-review-viewer"></div>`;
    });
    if (!pane) return;
    // V4: 不自动弹出评审区，改为红点通知
    notifyReviewUpdate(tabId);

    const viewer = pane.querySelector('.agent-review-viewer');
    if (!viewer) return;

    // 确保音效列表容器存在
    let list = viewer.querySelector('.audio-list');
    if (!list) {
        list = document.createElement('div');
        list.className = 'audio-list';
        list.style.display = 'block';
        viewer.appendChild(list);
    }

    const item = document.createElement('div');
    item.className = 'audio-item';
    item.innerHTML = `
        <button class="audio-play-btn"><i class="fas fa-play"></i></button>
        <div class="audio-info">
            <div class="audio-name">${escapeHTML(title || '音效')}</div>
            <div class="audio-duration">${duration || '--:--'}</div>
        </div>
        <div class="audio-waveform"></div>`;

    const playBtn = item.querySelector('.audio-play-btn');
    let audio = null;
    playBtn.addEventListener('click', () => {
        if (!audio) audio = new Audio(audioUrl);
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            audio.onended = () => { playBtn.innerHTML = '<i class="fas fa-play"></i>'; };
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    list.appendChild(item);
    switchReviewTab(tabId);
}

// ========================================
// 代码 Diff（归入 agent tab）
// ========================================
function addCodeToReview(filename, lines, agentId) {
    const resolvedId = agentId || 'prototyper';
    const agent = getAgent(resolvedId);
    const agentEmoji = agent ? agent.emoji : '💻';
    const tabId = `agent-${resolvedId}`;
    const tabLabel = `${agentEmoji} ${filename || '代码'}`;

    const pane = ensureReviewPane(tabId, '', tabLabel, (p) => {
        p.innerHTML = `<div class="agent-review-viewer"></div>`;
    });
    if (!pane) return;
    // V4: 不自动弹出评审区，改为红点通知
    notifyReviewUpdate(tabId);

    const viewer = pane.querySelector('.agent-review-viewer');
    if (!viewer) return;

    // 确保代码容器存在
    let container = viewer.querySelector('.code-diff-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'code-diff-container';
        container.style.display = 'block';
        viewer.appendChild(container);
    }

    const card = document.createElement('div');
    card.className = 'code-file-card';
    card.innerHTML = `
        <div class="code-file-header">
            <i class="fas fa-file-code"></i> ${escapeHTML(filename)}
        </div>
        <div class="code-file-content">${
        lines
            .map(line => {
              const cls = line.startsWith('+')   ? 'added'
                          : line.startsWith('-') ? 'removed'
                                                 : '';
              return `<div class="code-line ${cls}">${escapeHTML(line)}</div>`;
            })
            .join('')}</div>`;
    container.appendChild(card);
    switchReviewTab(tabId);
}

// ========================================
// 顶部操作栏事件
// ========================================
function initTopbar() {
    document.querySelectorAll('.topbar-btn[data-tool]').forEach(btn => {
        const tool = btn.dataset.tool;

        btn.addEventListener('click', () => {
            if (tool === 'layout') {
                // 布局模式 toggle
                if (AppState.layoutMode) {
                    toggleLayoutMode(false);
                } else {
                    toggleLayoutMode(true);
                }
                return;
            }

            if (tool === 'skills') {
                toggleSkillsDrawer();
                return;
            }

            // 其他工具：退出布局模式
            if (AppState.layoutMode) toggleLayoutMode(false);
        });

        // 给预置工具也绑定右键菜单（布局、技能等）
        const toolName = btn.querySelector('span')?.textContent || tool;
        bindToolContextMenu(btn, toolName, tool, false);
    });

    // 版本抽屉按钮（在 topbar-right 中）
    document.getElementById('btnVersionsToggle')?.addEventListener('click', () => {
        toggleVersionsDrawer();
    });
}

// 版本抽屉 toggle
function toggleVersionsDrawer() {
    const drawer = document.getElementById('versionsDrawer');
    const btn = document.getElementById('btnVersionsToggle');
    if (!drawer) return;

    const isOpen = drawer.classList.contains('open');

    // 关闭其他抽屉
    if (!isOpen) closeSkillsDrawer();

    drawer.classList.toggle('open', !isOpen);
    btn?.classList.toggle('active', !isOpen);
}

function closeVersionsDrawer() {
    const drawer = document.getElementById('versionsDrawer');
    const btn = document.getElementById('btnVersionsToggle');
    if (drawer) drawer.classList.remove('open');
    if (btn) btn.classList.remove('active');
}

// 技能面板 toggle
function toggleSkillsDrawer() {
    const drawer = document.getElementById('skillsDrawer');
    const btn = document.querySelector('.topbar-btn[data-tool="skills"]');
    if (!drawer) return;

    const isOpen = drawer.classList.contains('open');

    // 关闭其他抽屉
    if (!isOpen) closeVersionsDrawer();

    drawer.classList.toggle('open', !isOpen);
    btn?.classList.toggle('active', !isOpen);
}

function closeSkillsDrawer() {
    const drawer = document.getElementById('skillsDrawer');
    const btn = document.querySelector('.topbar-btn[data-tool="skills"]');
    if (drawer) drawer.classList.remove('open');
    if (btn) btn.classList.remove('active');
}

// ========================================
// 布局模式
// ========================================
function toggleLayoutMode(enable) {
    AppState.layoutMode = enable;
    DOM.pixelOverlay.style.display = enable ? 'block' : 'none';

    // 浮动坐标面板（在预览区内）
    const floatingPanel = document.getElementById('layoutFloatingPanel');
    if (floatingPanel) floatingPanel.style.display = enable ? 'flex' : 'none';

    // 退出按钮 overlay
    const exitOverlay = document.getElementById('layoutExitOverlay');
    if (exitOverlay) exitOverlay.style.display = enable ? 'flex' : 'none';

    // 隐藏旧的底部 bar
    DOM.pixelCoordsBar.style.display = 'none';
    DOM.layoutModeToggle.style.display = 'none';

    if (enable) {
        initPixelCanvas();
        initLayoutParams(); // ★ 初始化画面参数分析
        document.querySelector('.topbar-btn[data-tool="layout"]')?.classList.add('active');
    } else {
        // 退出时重置 iframe 滤镜
        _resetIframeFilters();
        document.querySelector('.topbar-btn[data-tool="layout"]')?.classList.remove('active');
    }
}

function initPixelCanvas() {
    const canvas = DOM.pixelCanvas;
    const container = DOM.previewViewport;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const ctx = canvas.getContext('2d');
    drawPixelGrid(ctx, canvas.width, canvas.height);
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;

        // 获取设备屏幕在页面上的实际可见区域
        const screenEl = DOM.deviceScreen;
        if (!screenEl) return;
        const screenRect = screenEl.getBoundingClientRect();

        // 只允许点击设备屏幕区域内
        if (clickX < screenRect.left || clickX > screenRect.right ||
            clickY < screenRect.top || clickY > screenRect.bottom) {
            return; // 点击在屏幕之外，忽略
        }

        // 计算相对于设备屏幕的坐标（考虑 deviceFrame 的缩放）
        const device = DEVICES[AppState.currentDevice];
        let devW = device.width;
        let devH = device.height;
        if (AppState.isLandscape && device.type !== 'desktop') {
            [devW, devH] = [devH, devW];
        }

        // 屏幕实际显示尺寸 vs 设备逻辑尺寸
        const scaleX = devW / screenRect.width;
        const scaleY = devH / screenRect.height;

        const deviceX = Math.round((clickX - screenRect.left) * scaleX);
        const deviceY = Math.round((clickY - screenRect.top) * scaleY);

        // 画布上的标记坐标（用于可视化）
        const canvasX = Math.round(clickX - rect.left);
        const canvasY = Math.round(clickY - rect.top);

        AppState.layoutCoords.push({ x: deviceX, y: deviceY, canvasX, canvasY });
        drawCoordMark(ctx, canvasX, canvasY, AppState.layoutCoords.length);
        renderCoordsTags();
    };
}

function drawPixelGrid(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(7, 193, 96, 0.08)';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x < w; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    AppState.layoutCoords.forEach((c, i) => drawCoordMark(ctx, c.canvasX || c.x, c.canvasY || c.y, i + 1));
}

function drawCoordMark(ctx, x, y, idx) {
    ctx.strokeStyle = '#07C160';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12); ctx.stroke();
    ctx.fillStyle = '#07C160';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillText(`#${idx}`, x + 10, y - 10);
}

function renderCoordsTags() {
    // 更新浮动面板内的坐标列表
    const floatingTags = document.getElementById('layoutFloatingTags');
    const floatingCount = document.getElementById('layoutFloatingCount');
    if (floatingTags) {
      floatingTags.innerHTML =
          AppState.layoutCoords
              .map((c, i) => `<span class="layout-float-tag" data-idx="${
                       i}" title="点击移除">#${i + 1} (${c.x}, ${c.y})</span>`)
              .join('');
      floatingTags.querySelectorAll('.layout-float-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const idx = parseInt(tag.dataset.idx);
          AppState.layoutCoords.splice(idx, 1);
          const ctx = DOM.pixelCanvas.getContext('2d');
          drawPixelGrid(ctx, DOM.pixelCanvas.width, DOM.pixelCanvas.height);
          renderCoordsTags();
        });
      });
    }
    if (floatingCount) {
        floatingCount.textContent = AppState.layoutCoords.length > 0
            ? `${AppState.layoutCoords.length} 个坐标` : '点击屏幕标记坐标';
    }

    // 同时更新旧的 coordsTags（兼容）
    if (DOM.coordsTags) {
      DOM.coordsTags.innerHTML =
          AppState.layoutCoords
              .map((c, i) => `<span class="coord-tag" data-idx="${
                       i}" title="点击移除">#${i + 1} (${c.x}, ${c.y})</span>`)
              .join('');
    }
}

// ========================================
// 布局模式 — 画面参数分析 + 滤镜调节
// ========================================

/** 当前滤镜状态 */
const _layoutFilters = { brightness: 100, contrast: 100, saturate: 100 };

/** 初始化画面参数面板 */
function initLayoutParams() {
    // 显示 loading
    const loading = document.getElementById('layoutParamLoading');
    const brightnessRow = document.getElementById('layoutParamBrightness');
    const contrastRow = document.getElementById('layoutParamContrast');
    const saturateRow = document.getElementById('layoutParamSaturate');
    const colorsRow = document.getElementById('layoutParamColors');
    const infoRow = document.getElementById('layoutParamInfo');

    if (loading) loading.style.display = '';
    [brightnessRow, contrastRow, saturateRow, colorsRow, infoRow].forEach(el => { if (el) el.style.display = 'none'; });

    // 重置滤镜值
    _layoutFilters.brightness = 100;
    _layoutFilters.contrast = 100;
    _layoutFilters.saturate = 100;
    _updateFilterSliders();

    // 延迟分析（等 iframe 有内容）
    setTimeout(() => _analyzeScreenImage(), 500);

    // 绑定事件（只绑一次）
    if (!_layoutParamsInitialized) {
        _layoutParamsInitialized = true;

        // 亮度滑块
        document.getElementById('brightnessSlider')?.addEventListener('input', (e) => {
            _layoutFilters.brightness = parseInt(e.target.value);
            document.getElementById('brightnessValue').textContent = _layoutFilters.brightness + '%';
            _applyIframeFilters();
        });
        // 对比度滑块
        document.getElementById('contrastSlider')?.addEventListener('input', (e) => {
            _layoutFilters.contrast = parseInt(e.target.value);
            document.getElementById('contrastValue').textContent = _layoutFilters.contrast + '%';
            _applyIframeFilters();
        });
        // 饱和度滑块
        document.getElementById('saturateSlider')?.addEventListener('input', (e) => {
            _layoutFilters.saturate = parseInt(e.target.value);
            document.getElementById('saturateValue').textContent = _layoutFilters.saturate + '%';
            _applyIframeFilters();
        });

        // 重置按钮
        document.getElementById('btnResetBrightness')?.addEventListener('click', () => {
            _layoutFilters.brightness = 100;
            _updateFilterSliders();
            _applyIframeFilters();
        });
        document.getElementById('btnResetContrast')?.addEventListener('click', () => {
            _layoutFilters.contrast = 100;
            _updateFilterSliders();
            _applyIframeFilters();
        });
        document.getElementById('btnResetSaturate')?.addEventListener('click', () => {
            _layoutFilters.saturate = 100;
            _updateFilterSliders();
            _applyIframeFilters();
        });

        // 刷新按钮
        document.getElementById('btnRefreshParams')?.addEventListener('click', () => {
            const loading = document.getElementById('layoutParamLoading');
            if (loading) loading.style.display = '';
            setTimeout(() => _analyzeScreenImage(), 300);
        });
    }
}
let _layoutParamsInitialized = false;

/** 从 iframe 截图并分析画面参数 */
function _analyzeScreenImage() {
    const iframe = document.getElementById('gamePreviewIframe');
    const loading = document.getElementById('layoutParamLoading');
    const brightnessRow = document.getElementById('layoutParamBrightness');
    const contrastRow = document.getElementById('layoutParamContrast');
    const saturateRow = document.getElementById('layoutParamSaturate');
    const colorsRow = document.getElementById('layoutParamColors');
    const infoRow = document.getElementById('layoutParamInfo');

    try {
        let analysisCanvas = null;
        let width = 0, height = 0;

        if (iframe && iframe.contentWindow) {
            const iframeDoc = iframe.contentWindow.document;
            // 尝试从 iframe 内的 canvas 抓取
            const gameCanvas = iframeDoc?.querySelector('canvas');
            if (gameCanvas && gameCanvas.width > 0) {
                analysisCanvas = gameCanvas;
                width = gameCanvas.width;
                height = gameCanvas.height;
            }
        }

        if (!analysisCanvas) {
            // 没有 canvas，用默认值
            if (loading) loading.style.display = 'none';
            _showDefaultParams(brightnessRow, contrastRow, saturateRow, colorsRow, infoRow);
            return;
        }

        // 缩小采样（性能）
        const sampleCanvas = document.createElement('canvas');
        const sw = 80, sh = Math.round(80 * height / width);
        sampleCanvas.width = sw;
        sampleCanvas.height = sh;
        const sCtx = sampleCanvas.getContext('2d');
        sCtx.drawImage(analysisCanvas, 0, 0, sw, sh);

        const imageData = sCtx.getImageData(0, 0, sw, sh);
        const pixels = imageData.data;

        // 计算平均亮度
        let totalBrightness = 0;
        const colorMap = {};
        const pixelCount = pixels.length / 4;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
            // 感知亮度公式
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += lum;

            // 颜色量化（每 32 级）
            const qr = Math.round(r / 48) * 48;
            const qg = Math.round(g / 48) * 48;
            const qb = Math.round(b / 48) * 48;
            const key = `${qr},${qg},${qb}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        const avgBrightness = Math.round(totalBrightness / pixelCount);
        const brightnessPercent = Math.round((avgBrightness / 255) * 100);

        // 提取主要颜色（Top 6）
        const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([key, count]) => {
                const [r, g, b] = key.split(',').map(Number);
                return { r, g, b, count, hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}` };
            });

        // 显示结果
        if (loading) loading.style.display = 'none';
        if (brightnessRow) brightnessRow.style.display = '';
        if (contrastRow) contrastRow.style.display = '';
        if (saturateRow) saturateRow.style.display = '';
        if (colorsRow) {
            colorsRow.style.display = '';
            const swatchesEl = document.getElementById('layoutColorSwatches');
            if (swatchesEl) {
                swatchesEl.innerHTML = sortedColors.map(c => {
                    const pct = Math.round((c.count / pixelCount) * 100);
                    return `<div class="layout-color-swatch" style="background:${c.hex}" title="${c.hex} (${pct}%)">
                        <span class="layout-color-hex">${c.hex}</span>
                    </div>`;
                }).join('');
                // 点击色块复制颜色值
                swatchesEl.querySelectorAll('.layout-color-swatch').forEach(swatch => {
                    swatch.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const hex = swatch.querySelector('.layout-color-hex').textContent;
                        navigator.clipboard?.writeText(hex);
                        _showImportToast(`已复制颜色 ${hex}`);
                    });
                });
            }
        }
        if (infoRow) {
            infoRow.style.display = '';
            const brightnessLabel = brightnessPercent > 65 ? '明亮' : brightnessPercent > 35 ? '适中' : '偏暗';
            infoRow.innerHTML = `
                <span><i class="fas fa-display"></i> ${width}×${height}</span>
                <span><i class="fas fa-sun"></i> ${brightnessLabel} (${brightnessPercent}%)</span>
            `;
        }

    } catch (e) {
        console.warn('[layoutParams] analyze error:', e);
        if (loading) loading.style.display = 'none';
        _showDefaultParams(brightnessRow, contrastRow, saturateRow, colorsRow, infoRow);
    }
}

/** 无法分析时显示默认参数面板 */
function _showDefaultParams(brightnessRow, contrastRow, saturateRow, colorsRow, infoRow) {
    if (brightnessRow) brightnessRow.style.display = '';
    if (contrastRow) contrastRow.style.display = '';
    if (saturateRow) saturateRow.style.display = '';
    if (colorsRow) {
        colorsRow.style.display = '';
        const swatchesEl = document.getElementById('layoutColorSwatches');
        if (swatchesEl) swatchesEl.innerHTML = '<span class="layout-param-hint">加载游戏后可分析画面颜色</span>';
    }
    if (infoRow) {
        infoRow.style.display = '';
        infoRow.innerHTML = '<span><i class="fas fa-info-circle"></i> 请先加载游戏预览</span>';
    }
}

/** 更新滑块 UI 到当前滤镜值 */
function _updateFilterSliders() {
    const bs = document.getElementById('brightnessSlider');
    const cs = document.getElementById('contrastSlider');
    const ss = document.getElementById('saturateSlider');
    const bv = document.getElementById('brightnessValue');
    const cv = document.getElementById('contrastValue');
    const sv = document.getElementById('saturateValue');
    if (bs) bs.value = _layoutFilters.brightness;
    if (cs) cs.value = _layoutFilters.contrast;
    if (ss) ss.value = _layoutFilters.saturate;
    if (bv) bv.textContent = _layoutFilters.brightness + '%';
    if (cv) cv.textContent = _layoutFilters.contrast + '%';
    if (sv) sv.textContent = _layoutFilters.saturate + '%';
}

/** 应用滤镜到 iframe */
function _applyIframeFilters() {
    const iframe = document.getElementById('gamePreviewIframe');
    if (!iframe) return;
    const filters = [];
    if (_layoutFilters.brightness !== 100) filters.push(`brightness(${_layoutFilters.brightness}%)`);
    if (_layoutFilters.contrast !== 100) filters.push(`contrast(${_layoutFilters.contrast}%)`);
    if (_layoutFilters.saturate !== 100) filters.push(`saturate(${_layoutFilters.saturate}%)`);
    iframe.style.filter = filters.length > 0 ? filters.join(' ') : '';
}

/** 重置 iframe 滤镜 */
function _resetIframeFilters() {
    _layoutFilters.brightness = 100;
    _layoutFilters.contrast = 100;
    _layoutFilters.saturate = 100;
    const iframe = document.getElementById('gamePreviewIframe');
    if (iframe) iframe.style.filter = '';
    _updateFilterSliders();
}

function clearLayoutCoords() {
    AppState.layoutCoords = [];
    const ctx = DOM.pixelCanvas.getContext('2d');
    drawPixelGrid(ctx, DOM.pixelCanvas.width, DOM.pixelCanvas.height);
    renderCoordsTags();
}

function sendCoordsToChat() {
    if (AppState.layoutCoords.length === 0) return;
    const text = AppState.layoutCoords.map((c, i) => `#${i + 1}(${c.x},${c.y})`)
                     .join(' ');
    AppState.coordsRefText = text;
    DOM.coordsRefBar.style.display = 'flex';
    DOM.coordsRefText.textContent = `📌 ${text}`;
    DOM.chatInput.focus();
}

// ========================================
// 版本管理
// ========================================
function saveVersion(note) {
    const version = { id: generateId(), label: `v${AppState.versions.length + 1}`, note: note || '手动保存', time: new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }), timestamp: Date.now(), type: 'manual', snapshot: {} };
    AppState.versions.unshift(version);
    renderVersions();
}

function autoSaveVersion(note) {
    const version = { id: generateId(), label: `v${AppState.versions.length + 1}`, note: note || '自动保存', time: new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }), timestamp: Date.now(), type: 'auto', snapshot: {} };
    AppState.versions.unshift(version);
    renderVersions();
}

function renderVersions() {
    if (AppState.versions.length === 0) {
        DOM.versionsTimeline.innerHTML = `<div class="version-empty"><i class="fas fa-code-branch"></i><p>暂无版本记录</p><span>每次重要修改后保存版本，可随时回滚</span></div>`;
        return;
    }
    DOM.versionsTimeline.innerHTML = AppState.versions.map((v, i) => `
        <div class="version-item" data-version="${v.id}">
            <div class="version-dot ${i === 0 ? 'current' : 'past'}"></div>
            <div class="version-info">
                <div class="version-info-header">
                    <span class="version-label">${v.label} <span class="version-tag ${v.type}">${v.type === 'auto' ? '自动' : '手动'}</span></span>
                    <span class="version-time">${v.time}</span>
                </div>
                <div class="version-note">${v.note}</div>
                <div class="version-actions">
                    ${i > 0 ? `<button class="version-action-btn" data-action="rollback" data-version="${v.id}"><i class="fas fa-rotate-left"></i> 回滚</button>` : '<span style="font-size:11px;color:var(--primary);font-weight:500;">当前</span>'}
                    <button class="version-action-btn" data-action="preview" data-version="${v.id}"><i class="fas fa-eye"></i> 预览</button>
                </div>
            </div>
        </div>`).join('');

    DOM.versionsTimeline.querySelectorAll('.version-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const versionId = btn.dataset.version;
            if (action === 'rollback') rollbackToVersion(versionId);
        });
    });
}

function rollbackToVersion(versionId) {
    const idx = AppState.versions.findIndex(v => v.id === versionId);
    if (idx < 0) return;
    const version = AppState.versions[idx];
    autoSaveVersion('回滚前自动保存');
    addGroupMessage('coordinator', `⏪ 已回滚到 ${version.label}（${version.note}）`);
    addSystemMessage(`已回滚到 ${version.label}`);
}

// ========================================
// 弹窗管理
// ========================================
// V5: 新建会话弹窗已移除 — 保留签名兼容
function showNewSessionModal() { /* no-op */ }
function hideNewSessionModal() { /* no-op */ }

function bindNewSessionModal() { /* no-op */ }

// V5: 保留 createGroupConversation 签名兼容（不再被 UI 调用）
function createGroupConversation(name, agentIds, existingProjectId) {
    // no-op: V5 使用固定通道
}

function showSaveVersionModal() { DOM.saveVersionModal.style.display = 'flex'; }
function hideSaveVersionModal() { DOM.saveVersionModal.style.display = 'none'; }

// ========================================
// @提及 功能（输入@时弹出下拉列表）
// ========================================
function showMentionDropdown() {
    AppState.mentionActive = true;
    // V28: 只展示可单聊的角色组（与单聊频道对齐），小助手和工程师只在群聊中
    let html = '';
    let idx = 0;
    for (const [groupName, groupInfo] of Object.entries(AGENT_GROUPS)) {
        if (groupInfo.canDirectChat === false) continue; // 跳过不可单聊的组
        const mentionAvatarInner = groupInfo.avatar
            ? `<img src="${groupInfo.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
            : `<i class="fas ${groupInfo.icon}"></i>`;
        html += `<div class="mention-dropdown-item ${idx === 0 ? 'active' : ''}" data-agent-group="${groupName}" data-idx="${idx}">
            <div class="mention-avatar" style="background:${groupInfo.color}22;color:${groupInfo.color}">${mentionAvatarInner}</div>
            <div><div class="mention-name">${getGroupDisplayName(groupName)}</div><div class="mention-role">${groupInfo.desc}</div></div>
        </div>`;
        idx++;
    }
    DOM.mentionDropdown.innerHTML = html;
    DOM.mentionDropdown.style.display = 'block';

    DOM.mentionDropdown.querySelectorAll('.mention-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            selectMentionGroup(item.dataset.agentGroup);
            hideMentionDropdown();
        });
    });
}

function hideMentionDropdown() {
    AppState.mentionActive = false;
    DOM.mentionDropdown.style.display = 'none';
}

function selectMentionGroup(groupName) {
    const groupInfo = AGENT_GROUPS[groupName];
    if (!groupInfo) return;
    // 将输入框中的 @ 替换为 @角色组名
    let text = DOM.chatInput.value;
    const lastAt = text.lastIndexOf('@');
    if (lastAt >= 0) {
        text = text.substring(0, lastAt) + `@${groupName} `;
    } else {
        text += `@${groupName} `;
    }
    DOM.chatInput.value = text;
    DOM.chatInput.focus();

    // 将该组下所有 Agent 加入 mentionedAgents（后端需要细分 ID）
    const agentIds = getAgentIdsByGroup(groupName);
    agentIds.forEach(id => {
        if (!AppState.mentionedAgents.includes(id)) {
            AppState.mentionedAgents.push(id);
        }
    });
}

function selectMention(agentId) {
    const agent = getAgent(agentId);
    if (!agent) return;
    // 将输入框中的 @ 替换为 @AgentName
    let text = DOM.chatInput.value;
    const lastAt = text.lastIndexOf('@');
    if (lastAt >= 0) {
        text = text.substring(0, lastAt) + `@${agent.name} `;
    } else {
        text += `@${agent.name} `;
    }
    DOM.chatInput.value = text;
    DOM.chatInput.focus();

    if (!AppState.mentionedAgents.includes(agentId)) {
        AppState.mentionedAgents.push(agentId);
    }
}

function clearMentions() {
    AppState.mentionedAgents = [];
}

// ========================================
// 需求检测
// ========================================
function isRequirementClear(text) {
    const hasGameType = /贪吃蛇|射击|跑酷|消除|塔防|RPG|解谜|2048|翻牌|俄罗斯|冒险|跳跃|游戏/.test(text);
    return hasGameType;
}

function detectGameDimension(text) { return /3[dD]|三维|立体/.test(text) ? '3D' : /2[dD]|二维|平面/.test(text) ? '2D' : null; }
function detectGameStyle(text) {
  const styles = [
    '像素', '卡通', '写实', '赛博朋克', '霓虹', '复古', '可爱', '简约', '扁平',
    '暗黑', '科幻'
  ];
  for (const s of styles) {
    if (text.includes(s))
      return s;
  }
    return null;
}

// ========================================
// 发送消息
// ========================================
function handleSend() {
    const text = DOM.chatInput.value.trim();
    if (!text) return;
    // ★ 成员聊天模式：发送消息到对应角色（包括通过特殊入口进入的工程师）
    if (AppState.activeMemberView) {
        const groupInfo = AGENT_GROUPS[AppState.activeMemberView];
        if (groupInfo && (groupInfo.canDirectChat || AppState.activeMemberView === '工程师')) {
            sendMemberMessage();
            return;
        }
    }
    // Per-session 并行：只检查当前 session 的生成锁
    const session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (!session) return;
    if (session._isGenerating) {
        // V42e: 插话模式 — 检查 @mention 的 agent 是否空闲，空闲则直接追加任务
        const task = getCurrentTask();
        if (task && AppState.useRealAPI && AppState.currentProjectId) {
            // 预解析 @mention
            const _mentionRegex = /@(\S+)/g;
            let _m;
            const _mentioned = [];
            while ((_m = _mentionRegex.exec(text)) !== null) {
                const name = _m[1];
                // 匹配 agent name 或 group nickname
                const agent = Object.values(AGENTS).find(a => a.name === name);
                if (agent) _mentioned.push(agent.id);
                // 匹配 group nickname → 取该 group 下所有 agent
                const group = Object.entries(AGENT_GROUPS).find(([, g]) => g.nickname === name);
                if (group) {
                    Object.keys(AGENTS).filter(aid => AGENTS[aid].group === group[0]).forEach(aid => {
                        if (!_mentioned.includes(aid)) _mentioned.push(aid);
                    });
                }
            }

            // 检查是否有空闲的目标 agent
            const idleTargets = _mentioned.filter(aid => {
                const st = task.agentStatus?.[aid];
                return !st || st === 'idle';
            });

            if (idleTargets.length > 0) {
                // 插话模式：直接发送，不排队
                DOM.chatInput.value = '';
                DOM.chatInput.style.height = 'auto';
                addUserMessage(text, idleTargets);
                addSystemMessage(`💡 插话模式 — ${idleTargets.map(aid => AGENTS[aid]?.name || aid).join('、')} 空闲，直接追加任务`);
                console.log(`[handleSend] interrupt mode: idle agents ${idleTargets.join(',')}, sending directly`);

                // 标记这些 agent 为 working
                idleTargets.forEach(aid => {
                    task.agentStatus[aid] = 'working';
                    task.agentSubtasks[aid] = [];
                    task.agentProgress[aid] = 0;
                });
                // 更新角色状态
                for (const aid of idleTargets) {
                    const agent = AGENTS[aid];
                    if (agent) AppState.roleStates[agent.group] = 'working';
                }
                refreshTeamAndMemberView();

                // 用 Collab agent chat（如果只有1个目标）或 multi-agent
                if (AppState.currentMode === 'collab' && idleTargets.length === 1) {
                    realCollabAgentChat(text, idleTargets[0]);
                } else {
                    // 构造新的 SSE 请求（追加任务）
                    const encodedPrompt = encodeURIComponent(text);
                    const projectId = AppState.currentProjectId;
                    const agentParam = idleTargets.join(',');
                    const sseUrl = `${AppState.apiBaseUrl}/api/generate/${projectId}?prompt=${encodedPrompt}&agents=${agentParam}&provider=${AppState.modelProvider}&interrupt=true`;
                    const es = new EventSource(sseUrl);
                    // 复用现有 SSE 事件处理（简化版：只处理 agent_message 和 status）
                    es.addEventListener('agent_message', (e) => {
                        try {
                            const data = JSON.parse(e.data);
                            const aid = data.agentId || idleTargets[0];
                            const content = data.content || '';
                            if (content.trim()) addGroupMessage(aid, content);
                            _extractAndUpdateSubtask(task, aid, content);
                            updateGlobalProgress();
                        } catch (err) { /* ignore */ }
                    });
                    es.addEventListener('status', (e) => {
                        try {
                            const data = JSON.parse(e.data);
                            if (data.phase === 'completed' || data.phase === 'done') {
                                idleTargets.forEach(aid => {
                                    task.agentStatus[aid] = 'done';
                                    task.agentProgress[aid] = 100;
                                });
                                updateGlobalProgress();
                                refreshTeamAndMemberView();
                                es.close();
                            }
                        } catch (err) { /* ignore */ }
                    });
                    es.addEventListener('error', () => { es.close(); });
                }
                return;
            }
        }

        // 无空闲 agent → 原排队逻辑
        if (!session._pendingMessages) session._pendingMessages = [];
        session._pendingMessages.push(text);
        DOM.chatInput.value = '';
        DOM.chatInput.style.height = 'auto';
        addSystemMessage(`💬 已排队，当前任务完成后自动处理`);
        console.log(`[handleSend] session ${session.id} busy, queued: "${text.substring(0, 50)}..."`);
        return;
    }

    // 解析文本中的 @mention
    const mentionRegex = /@(\S+)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        const name = match[1];
        const agent = Object.values(AGENTS).find(a => a.name === name);
        if (agent && !AppState.mentionedAgents.includes(agent.id)) {
            AppState.mentionedAgents.push(agent.id);
        }
    }

    const mentioned = [...AppState.mentionedAgents];
    let fullText = text;
    // 构建上下文前缀：素材引用 + 坐标引用
    const contextParts = [];
    if (AppState.attachedAssets.length > 0) {
        const assetNames = AppState.attachedAssets.map(a => a.name).join(', ');
        contextParts.push(`素材: ${assetNames}`);
    }
    if (AppState.coordsRefText) {
        contextParts.push(`坐标: ${AppState.coordsRefText}`);
    }
    // V30: 引用上下文（来自单聊频道）
    if (AppState._pendingQuote) {
        const q = AppState._pendingQuote;
        contextParts.push(`引用来自「${q.source}」: ${q.content}`);
    }
    if (contextParts.length > 0) {
        fullText = `[${contextParts.join(' · ')}] ${text}`;
    }

    DOM.chatInput.value = '';
    DOM.chatInput.style.height = 'auto';
    DOM.chatInput.placeholder = '描述你想要的游戏... 输入 @ 指定Agent';
    clearMentions();
    clearAssetTokens();
    clearImageAttachments();
    AppState.coordsRefText = '';
    DOM.coordsRefBar.style.display = 'none';
    // V30: 清除引用
    if (AppState._pendingQuote) {
        AppState._pendingQuote = null;
        hideQuoteReferenceBar();
    }

    // session 已在函数开头声明
    if (!session) return;

    if (session.type === 'group') {
        if (!AppState.task) createTask(text);
        if (AppState.useRealAPI) {
            if (AppState.currentMode === 'collab') {
                // Collab Mode: @Agent 直接对话走 session 上下文
                if (mentioned.length === 1 && AppState.currentProjectId) {
                    realCollabAgentChat(fullText, mentioned[0]);
                } else if (AppState.sessionState?.orchestration?.waitingForUser) {
                    realCollabRespond(fullText);
                } else {
                    realCollabStart(fullText, mentioned);
                }
            } else {
                // Quick Mode: 先走选择题，选完后再调 Real API
                showRequirementPickerThenGenerate(fullText, mentioned);
            }
        } else {
            simulateMultiAgentGeneration(fullText, mentioned);
        }
    } else {
        // 单聊频道：完全独立的任务系统
        addUserMessage(fullText);
        if (AppState.useRealAPI) {
            // 用 session.agents[0] 作为对话角色（role 已在 _mkSession 中设好）
            const agentId = session.role || session.agents[0];
            if (agentId) {
                session.role = agentId; // 确保 role 有值
                realSingleAgentChat(session, fullText);
            }
        } else {
            simulateAgentReply(session);
        }
    }
}

// 单 Agent 真实 API 对话
async function realSingleAgentChat(session, prompt) {
    const agentId = session.role;
    if (!agentId) return;
    const _sessionId = session.id; // 闭包捕获

    // V29: 单聊频道用 session._projectId（独立于主对话的 AppState.currentProjectId）
    if (!session._projectId) {
        try {
            const res = await fetch(`${AppState.apiBaseUrl}/api/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${session.name || '对话'}` }) });
            if (res.ok) {
                const data = await res.json();
                session._projectId = data.projectId;
            }
        } catch (e) {
            const msg = { agentId, content: `❌ 无法连接后端: ${e.message}`, time: getTimeStr() };
            session.messages.push(msg);
            if (AppState.currentSessionId === session.id) appendGroupMessageDOM(msg);
            return;
        }
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const projectId = session._projectId || AppState.currentProjectId;
    const sseUrl = `${AppState.apiBaseUrl}/api/generate/${projectId}?prompt=${encodedPrompt}&agentId=${agentId}&provider=${AppState.modelProvider}`;
    // Per-session: 关闭该 session 旧的 EventSource
    const oldES = getSessionEventSource(_sessionId);
    if (oldES) { oldES.close(); }
    const eventSource = new EventSource(sseUrl);
    setSessionEventSource(_sessionId, eventSource);
    setSessionGenerating(_sessionId, true);

    let streamContent = '';
    let streamEl = null;   // 流式消息气泡
    let streamMsgRef = null; // session.messages 中的引用（用于最终更新）
    let _startTime = Date.now();

    // V30: 过滤噪音 agent_message（方案已输出/正在连接/收到任务 等状态消息不显示）
    const _singleNoisePatterns = [
        /方案已输出/,
        /正在连接/,
        /收到任务/,
        /AI\s*开始输出/,
        /任务完成/,
        /连接\s*Adams/i,
    ];

    // 辅助：创建或更新流式消息气泡
    function _ensureStreamBubble() {
        if (streamEl) return;
        const msg = { agentId, content: streamContent || '...', time: getTimeStr() };
        streamMsgRef = msg;
        session.messages.push(msg);
        if (AppState.currentSessionId === session.id) {
            appendGroupMessageDOM(msg);
            const msgs = DOM.chatMessages.querySelectorAll('.message.ai');
            streamEl = msgs[msgs.length - 1]?.querySelector('.message-bubble');
        }
    }

    // 核心：stream_delta → 流式渲染实际内容
    eventSource.addEventListener('stream_delta', (e) => {
        try {
            const data = JSON.parse(e.data);
            const delta = data.delta || '';
            if (data.done) return; // 流结束信号，忽略
            if (!delta) return;

            streamContent += delta;
            _ensureStreamBubble();

            if (streamEl) {
                streamEl.innerHTML = renderMarkdown(streamContent);
                scrollToBottom();
            }
        } catch {
        }
    });

    // agent_message → 只显示非噪音的实质消息（如素材生成提示）
    eventSource.addEventListener('agent_message', (e) => {
        try {
            const data = JSON.parse(e.data);
            const content = data.content || '';
            if (!content.trim()) return;
            // 过滤噪音
            if (_singleNoisePatterns.some(p => p.test(content))) return;

            // 如果还没有 stream 内容（后端可能不走 stream_delta），则作为主要内容
            if (!streamContent) {
                streamContent = content;
                _ensureStreamBubble();
                if (streamEl) {
                    streamEl.innerHTML = renderMarkdown(streamContent);
                    scrollToBottom();
                }
            } else {
                // 已有 stream 内容，追加到新消息
                const msg = { agentId, content, time: getTimeStr() };
                session.messages.push(msg);
                if (AppState.currentSessionId === session.id) appendGroupMessageDOM(msg);
            }
        } catch {
        }
    });

    eventSource.addEventListener('status', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.phase === 'completed') {
                const agentInfo = getAgent(agentId);
                if (agentInfo && agentInfo.role === 'coder' && projectId) {
                    loadPreviewIframe(projectId);
                }
            }
        } catch {
        }
    });

    eventSource.addEventListener('done', () => {
        eventSource.close();
        setSessionEventSource(_sessionId, null);
        setSessionGenerating(_sessionId, false);
        updateInputPlaceholder();
        // 更新 session.messages 中的最终内容（用于后续引用）
        if (streamMsgRef && streamContent) {
            streamMsgRef.content = streamContent;
        }
        processSessionPendingMessages(_sessionId);
    });
    eventSource.onerror = () => {
        eventSource.close();
        setSessionEventSource(_sessionId, null);
        setSessionGenerating(_sessionId, false);
        updateInputPlaceholder();
        if (!streamContent) {
            const msg = { agentId, content: '⚠️ 连接中断', time: getTimeStr() };
            session.messages.push(msg);
            if (AppState.currentSessionId === session.id) appendGroupMessageDOM(msg);
        }
    };
}

async function simulateAgentReply(session) {
    await delay(1000);
    const msg = { agentId: session.role || 'coordinator', content: `收到你的消息！作为${session.name}，我正在分析你的需求...`, time: getTimeStr() };
    session.messages.push(msg);
    if (AppState.currentSessionId === session.id) appendGroupMessageDOM(msg);
}

// ========================================
// 任务清单卡片渲染（按6组合并展示，隐藏具体agent）
// ========================================

// 预计时间估算（基于角色类型）
const GROUP_ESTIMATED_TIME = {
    '小助手': '~10s',
    '策划': '~30s',
    '美术': '~45s',
    '音效': '~30s',
    '工程师': '~60s',
};

function renderTaskPlanCard(data) {
    const { agents_needed = [], agent_tasks = {}, game_name = '', game_type = '' } = data;

    // 按组聚合 agent 任务
    const groupTasks = {}; // { groupName: { agents: [{id, task}], status: 'pending' } }

    // coordinator → 小助手组（已完成）
    groupTasks['小助手'] = {
        agents: [{ id: 'coordinator', task: agent_tasks.coordinator || '需求分析与任务编排' }],
        status: 'done',
    };

    agents_needed.forEach(aid => {
        const agent = getAgent(aid);
        if (!agent) return;
        const groupName = agent.group || '工程师';
        if (!groupTasks[groupName]) {
            groupTasks[groupName] = { agents: [], status: 'pending' };
        }
        const taskDesc = agent_tasks[aid] || agent_tasks[agent.id] || agent.desc;
        groupTasks[groupName].agents.push({ id: agent.id, task: taskDesc });
    });

    let html = `<div class="task-plan-card" id="taskPlanCard">
        <div class="task-plan-header">
            <span class="task-plan-title">📋 任务清单</span>
            <span class="task-plan-game">${escapeHTML(game_name || '游戏')}</span>
        </div>
        <div class="task-plan-agents">`;

    for (const [groupName, groupData] of Object.entries(groupTasks)) {
        const groupInfo = AGENT_GROUPS[groupName];
        if (!groupInfo) continue;
        const groupColor = groupInfo.color;
        const groupIcon = groupInfo.icon;
        const estimatedTime = GROUP_ESTIMATED_TIME[groupName] || '';
        const statusClass = groupData.status === 'done' ? 'done' : 'pending';
        const statusIcon = groupData.status === 'done' ? '✅' : '⏳';

        // 子任务列表（每个 agent 的任务描述）
        const subtasksHTML = groupData.agents.map(a => {
            const isDone = groupData.status === 'done';
            return `<div class="task-plan-subtask ${isDone ? 'done' : ''}" data-agent-id="${a.id}" id="taskSubtask_${a.id}">
                <i class="fas ${isDone ? 'fa-check-circle' : 'fa-circle'} task-subtask-icon"></i>
                <span class="task-subtask-text">${escapeHTML(a.task)}</span>
            </div>`;
        }).join('');

        html += `<div class="task-plan-agent ${statusClass}" data-group-name="${groupName}">
            <div class="task-plan-agent-header">
                <div class="task-plan-agent-left">
                    <span class="task-plan-group-icon" style="color:${groupColor}"><i class="fas ${groupIcon}"></i></span>
                    <span class="task-plan-agent-name">${groupName}</span>
                    ${estimatedTime ? `<span class="task-plan-est-time">${estimatedTime}</span>` : ''}
                </div>
                <span class="task-plan-agent-status" id="taskGroupStatus_${groupName.replace(/\s/g, '_')}">${statusIcon}</span>
            </div>
            <div class="task-plan-subtasks">${subtasksHTML}</div>
        </div>`;
    }

    html += `</div></div>`;
    return html;
}

// 更新任务清单卡片中某个 agent 的状态（映射到组级别）
function updateTaskPlanStatus(agentId, status) {
    // 更新子任务 UI
    const subtaskEl = document.getElementById(`taskSubtask_${agentId}`);
    if (subtaskEl) {
        const icon = subtaskEl.querySelector('.task-subtask-icon');
        const text = subtaskEl.querySelector('.task-subtask-text');
        if (status === 'skip' || status === 'skipped') {
            subtaskEl.style.display = 'none';
        } else if (status === 'done') {
            subtaskEl.className = 'task-plan-subtask done';
            if (icon) icon.className = 'fas fa-check-circle task-subtask-icon';
        } else if (status === 'working') {
            subtaskEl.className = 'task-plan-subtask working';
            if (icon) icon.className = 'fas fa-spinner fa-spin task-subtask-icon';
        } else if (status === 'error') {
            subtaskEl.className = 'task-plan-subtask error';
            if (icon) icon.className = 'fas fa-times-circle task-subtask-icon';
        }
    }

    // 查找该 agent 所在的组
    const agent = getAgent(agentId);
    if (!agent) return;
    const groupName = agent.group;
    if (!groupName) return;

    // 更新组状态（基于组内所有可见子任务的状态）
    const groupEl = document.querySelector(`.task-plan-agent[data-group-name="${groupName}"]`);
    if (!groupEl) return;

    const visibleSubtasks = groupEl.querySelectorAll('.task-plan-subtask:not([style*="display: none"])');
    const allDone = Array.from(visibleSubtasks).every(el => el.classList.contains('done'));
    const anyWorking = Array.from(visibleSubtasks).some(el => el.classList.contains('working'));
    const anyError = Array.from(visibleSubtasks).some(el => el.classList.contains('error'));

    const groupStatusEl = groupEl.querySelector('.task-plan-agent-status');
    if (groupStatusEl) {
        if (anyError) {
            groupStatusEl.textContent = '❌';
            groupEl.className = `task-plan-agent error`;
            groupEl.dataset.groupName = groupName;
        } else if (allDone && visibleSubtasks.length > 0) {
            groupStatusEl.textContent = '✅';
            groupEl.className = `task-plan-agent done`;
            groupEl.dataset.groupName = groupName;
        } else if (anyWorking) {
            groupStatusEl.textContent = '🔄';
            groupEl.className = `task-plan-agent working`;
            groupEl.dataset.groupName = groupName;
        }
    }

    // 如果组内所有子任务都被 skip，隐藏整组
    const allHidden =
        groupEl.querySelectorAll('.task-plan-subtask').length > 0 &&
        groupEl.querySelectorAll(
                   '.task-plan-subtask:not([style*="display: none"])')
                .length === 0;
    if (allHidden) {
        groupEl.style.display = 'none';
    }
}

// ========================================
// 作品管理
// ========================================
const ProjectManager = {
  projects : [],
  isOpen : false,

  async load() {
    try {
      const res = await fetch(`${AppState.apiBaseUrl}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        this.projects = data.projects || [];
      }
    } catch (e) {
      console.warn('[ProjectManager] load failed:', e);
    }
  },

  async create(name) {
    try {
      const res = await fetch(`${AppState.apiBaseUrl}/api/projects`, {
        method : 'POST',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({name}),
      });
      if (res.ok) {
        const data = await res.json();
        await this.load();
        return data.projectId;
      }
    } catch (e) {
      console.warn('[ProjectManager] create failed:', e);
    }
    return null;
  },

  async remove(projectId) {
    try {
      await fetch(`${AppState.apiBaseUrl}/api/projects/${projectId}`,
                  {method : 'DELETE'});
      await this.load();
    } catch (e) {
      console.warn('[ProjectManager] delete failed:', e);
    }
  },

  async rename(projectId, name) {
    try {
      await fetch(`${AppState.apiBaseUrl}/api/projects/${projectId}`, {
        method : 'PATCH',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({name}),
      });
      await this.load();
    } catch (e) {
      console.warn('[ProjectManager] rename failed:', e);
    }
  },

  switchTo(projectId) {
    AppState.currentProjectId = projectId;
    const proj = this.projects.find(p => p.id === projectId);
    if (proj) {
      DOM.projectTitle.textContent = proj.name;
      // 只有已有游戏的项目才加载预览，新项目保持空白
      if (proj.hasGame) {
        loadPreviewIframe(projectId);
      } else {
        resetPreviewToDemo();
      }
    }
    // 重置任务状态
    AppState.task = null;
    DOM.projectStatus.style.display = 'none';
    updateGlobalProgress();
    // 切换项目时重置聊天区（V39: 用 renderChatMessages 完整清空DOM）
    initDefaultSession();
    renderChatHeader(AppState.sessions[0]);
    renderChatMessages(AppState.sessions[0]); // 先清空DOM显示欢迎页
    renderChatTabs();
    // 从持久化恢复聊天历史
    loadChatHistory(projectId);
    // 清空素材坞假数据
    clearAssetDock();
    // V38: 加载项目素材
    loadProjectAssets();
    this.close();
  },

  toggle() { this.isOpen ? this.close() : this.open(); },

  async open() {
    await this.load();
    this.isOpen = true;
    this.render();
  },

  close() {
    this.isOpen = false;
    const panel = document.getElementById('projectListPanel');
    if (panel)
      panel.remove();
  },

  render() {
    let panel = document.getElementById('projectListPanel');
    if (panel)
      panel.remove();

    panel = document.createElement('div');
    panel.id = 'projectListPanel';
    panel.className = 'project-list-panel';

    let html = `
            <div class="project-list-header">
                <span>🎮 我的作品</span>
                <button class="project-list-new-btn" id="btnNewProject">+ 新建</button>
            </div>
            <div class="project-list-items">`;

    if (this.projects.length === 0) {
      html +=
          `<div class="project-list-empty">还没有作品，发送消息开始创作吧！</div>`;
    } else {
      this.projects.forEach(p => {
        const isActive = p.id === AppState.currentProjectId;
        const date = p.createdAt
                         ? new Date(p.createdAt).toLocaleDateString('zh-CN', {
                             month : 'short',
                             day : 'numeric',
                             hour : '2-digit',
                             minute : '2-digit'
                           })
                         : '';
        html += `<div class="project-list-item ${
            isActive ? 'active' : ''}" data-project-id="${p.id}">
                    <div class="project-list-item-info">
                        <span class="project-list-item-name">${
            p.name || '未命名'}</span>
                        <span class="project-list-item-date">${date}</span>
                    </div>
                    <div class="project-list-item-actions">
                        ${
            p.hasGame ? '<span class="project-list-item-badge">🎮</span>' : ''}
                        <button class="project-list-item-delete" data-delete-id="${
            p.id}" title="删除">×</button>
                    </div>
                </div>`;
      });
    }

    html += `</div>`;
    panel.innerHTML = html;

    // 插入到 topbar-logo 旁边
    const logo = document.querySelector('.topbar-logo');
    if (logo) {
      logo.parentElement.insertBefore(panel, logo.nextSibling);
    } else {
      document.body.appendChild(panel);
    }

    // 事件绑定
    panel.querySelector('#btnNewProject')
        ?.addEventListener('click', async () => {
          // V39: 创建新游戏 → 直接进入空白聊天，不需要弹窗取名
          const projectId = await this.create('新作品');
          if (projectId) {
            AppState.currentProjectId = projectId;
            DOM.projectTitle.textContent = '新作品';
            resetPreviewToDemo();
            // 重置任务状态
            AppState.task = null;
            DOM.projectStatus.style.display = 'none';
            updateGlobalProgress();
            // V42 fix: 关闭成员面板/素材视图
            if (AppState.activeMemberView) {
                AppState.activeMemberView = null;
                const inputWrapper = document.querySelector('.chat-input-wrapper');
                if (inputWrapper) inputWrapper.style.display = '';
            }
            if (AppState.activeAssetView) AppState.activeAssetView = false;
            // 重置聊天区
            initDefaultSession();
            renderChatMessages(AppState.sessions[0]); // 清空DOM+显示欢迎页
            renderChatHeader(AppState.sessions[0]);
            renderChatTabs();
            // V42 fix: 清空输入框
            if (DOM.chatInput) {
                DOM.chatInput.value = '';
                DOM.chatInput.placeholder = '描述你想要的游戏... 输入 @ 指定Agent';
            }
            clearMentions();
            clearAssetTokens();
            clearImageAttachments();
            // V42 fix: 清空评审区（保留白板容器）
            if (DOM.reviewContent) {
                DOM.reviewContent.innerHTML = '';
                DOM.reviewContent.innerHTML = `<div class="whiteboard-container" id="whiteboardContainer"><div id="wbCardsArea"><div class="whiteboard-empty" id="wbEmpty"><i class="fas fa-note-sticky"></i><p>方案将以卡片形式展示在这里<br>发送游戏需求后，策划和美术会各自贴出方案</p></div></div></div>`;
            }
            if (DOM.reviewTabs) DOM.reviewTabs.innerHTML = '<button class="plan-board-tab active" data-tab="plans" id="planBoardTabPlans"><i class="fas fa-clipboard-list"></i> 方案</button>';
            if (DOM.reviewWelcome) DOM.reviewWelcome.style.display = '';
            // 清空素材坞
            clearAssetDock();
            // V38: 重置素材
            AppState.projectAssets = [];
            renderSidebarAssetEntry();
            this.close();
          }
        });

    panel.querySelectorAll('.project-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.project-list-item-delete'))
          return;
        const pid = item.dataset.projectId;
        if (pid)
          this.switchTo(pid);
      });
    });

    panel.querySelectorAll('.project-list-item-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const pid = btn.dataset.deleteId;
        if (pid && confirm('确定删除这个作品？')) {
          await this.remove(pid);
          if (pid === AppState.currentProjectId) {
            AppState.currentProjectId = null;
            resetPreviewToDemo();
          }
          this.render();
        }
      });
    });

    // 点击外部关闭
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!panel.contains(e.target) && !e.target.closest('.topbar-logo')) {
          this.close();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 100);
  },
};

// ========================================
// POST SSE 基础设施（Collab Mode 需要 POST 请求的 SSE 流）
// EventSource 只支持 GET，POST SSE 需要 fetch + ReadableStream
// ========================================

/**
 * 发起 POST 请求并以 SSE 方式读取流式响应
 * @param {string} url - 请求 URL
 * @param {object} body - POST body (会被 JSON.stringify)
 * @param {object} handlers - { onEvent(eventName, data), onError(err), onDone() }
 * @param {AbortController} [abortController] - 可选，用于取消
 * @returns {Promise<void>}
 */
async function fetchSSE(url, body, handlers, abortController) {
    const controller = abortController || new AbortController();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => 'Unknown error');
            if (handlers.onError) handlers.onError(new Error(`HTTP ${response.status}: ${errText}`));
            if (handlers.onDone) handlers.onDone();
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // BUG 4.1 fix: 正确的 SSE 解析状态机
        let currentEvent = 'message';
        let dataLines = []; // 收集多行 data（SSE 规范允许多行 data:）

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // 按行处理，保留最后一个不完整行在 buffer 中
            let lastNewline = buffer.lastIndexOf('\n');
            if (lastNewline === -1) continue; // 没有完整行，继续读

            const complete = buffer.substring(0, lastNewline + 1);
            buffer = buffer.substring(lastNewline + 1);

            const lines = complete.split('\n');

            for (const line of lines) {
                if (line.startsWith('event: ')) {
                    currentEvent = line.slice(7).trim();
                } else if (line.startsWith('data: ')) {
                    dataLines.push(line.slice(6));
                } else if (line === '' && dataLines.length > 0) {
                    // 空行 = 消息边界，分发事件
                    const fullData = dataLines.join('\n');
                    dataLines = [];
                    try {
                        const parsed = JSON.parse(fullData);
                        if (handlers.onEvent) handlers.onEvent(currentEvent, parsed);
                    } catch {
                        if (handlers.onEvent) handlers.onEvent(currentEvent, fullData);
                    }
                    currentEvent = 'message';
                }
                // 忽略注释行(以:开头)和空白行(无 data 累积时)
            }
        }

        // 处理 buffer 中残留的最后一条消息（流结束时可能没有尾部空行）
        if (dataLines.length > 0) {
            const fullData = dataLines.join('\n');
            try {
                const parsed = JSON.parse(fullData);
                if (handlers.onEvent) handlers.onEvent(currentEvent, parsed);
            } catch {
                if (handlers.onEvent) handlers.onEvent(currentEvent, fullData);
            }
        }

        if (handlers.onDone) handlers.onDone();
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('[fetchSSE] Request aborted');
        } else {
            if (handlers.onError) handlers.onError(err);
        }
        // 确保异常路径下也调用 onDone，防止 AbortController/isGenerating 泄漏
        if (handlers.onDone) handlers.onDone();
    }
}

// ========================================
// Real API 生成流程（Multi-Agent 编排）
// ========================================
// Real API 前置选择题流程
// ========================================

/**
 * Real API Quick Mode: 先弹选择题，选完后再调 Real API 获取方案
 */
async function showRequirementPickerThenGenerate(prompt, mentioned) {
    const _originSessionId = getCapturedSessionId();
    setSessionGenerating(_originSessionId, true);
    addUserMessage(prompt, mentioned);

    const gameType = prompt.includes('贪吃蛇') ? '贪吃蛇'
                     : prompt.includes('射击') ? '太空射击'
                     : prompt.includes('翻牌') ? '记忆翻牌'
                     : prompt.includes('跑酷') ? '跑酷'
                     : '小游戏';

    const detectedDim = detectGameDimension(prompt);
    const detectedStyle = detectGameStyle(prompt);

    await delay(500);
    addGroupMessage('coordinator', `🔍 **正在分析需求...**\n\n检测到游戏类型: ${gameType}`, undefined, undefined, _originSessionId);

    await delay(800);
    // 弹出选择题
    addGroupMessage('coordinator', `请确认游戏的基本参数：`, undefined, undefined, _originSessionId);
    await delay(300);
    addGroupMessage('coordinator', '', 'req_picker', {
        gameType,
        dimensions: ['2D', '3D'],
        styles: ['像素', '卡通', '赛博朋克', '简约', '可爱', '复古'],
        hideDimension: !!detectedDim,
        hideStyle: !!detectedStyle,
        prefilledDimension: detectedDim,
        prefilledStyle: detectedStyle,
        mentioned,
        // ★ 标记为 Real API 模式，confirmRequirementPick 会据此调用 realMultiAgentGeneration
        useRealAPI: true,
        originalPrompt: prompt,
    });

    // 选择题弹出后，暂停 generating 状态（等用户确认后再恢复）
    setSessionGenerating(_originSessionId, false);
}

// ========================================
async function realMultiAgentGeneration(prompt, mentioned) {
    // v14 fix: 闭包捕获发起请求的 sessionId，所有回调都用这个
    const _originSessionId = getCapturedSessionId();
    setSessionGenerating(_originSessionId, true);
    addUserMessage(prompt, mentioned);

    // ★ 初始化白板卡片系统，准备接收 AI 生成的方案卡片
    Whiteboard.init();
    Whiteboard.clear();
    PlanCardCollector.reset();

    await delay(300);
    if (!getSessionGenerating(_originSessionId)) return;

    const task = getCurrentTask();
    if (!task) { setSessionGenerating(_originSessionId, false); return; }
    task.phase = 'agents_working';

    // 初始化 task 中已注册的所有 agent 状态（由 createTask 动态生成）
    Object.keys(task.agentStatus).forEach(aid => {
        task.agentStatus[aid] = 'idle';
        task.agentSubtasks[aid] = [];
        task.agentProgress[aid] = 0;
    });
    updateGlobalProgress();

    // 阶段1: 复用已有项目 或 创建新项目
    try {
        if (AppState.currentProjectId) {
            // 已有项目，复用——这样修 bug 场景不会丢失上下文
            console.log(`[realMultiAgent] 复用已有项目: ${AppState.currentProjectId}`);
        } else {
            const createRes = await fetch(`${AppState.apiBaseUrl}/api/projects`, { method: 'POST' });
            if (!createRes.ok) throw new Error('创建项目失败');
            const { projectId } = await createRes.json();
            AppState.currentProjectId = projectId;
            console.log(`[realMultiAgent] 创建新项目: ${AppState.currentProjectId}`);
        }
    } catch (e) {
        addGroupMessage('coordinator', `❌ 无法连接后端服务: ${e.message}\n\n请确保后端已启动:\n\`cd server && node index.js\``, undefined, undefined, _originSessionId);
        setSessionGenerating(_originSessionId, false);
        return;
    }

    await delay(300);
    if (!getSessionGenerating(_originSessionId)) return;

    // 阶段2: 连接 SSE（不再硬编码编排方案，等 coordinator 分析后动态展示）
    addGroupMessage('coordinator', '🎬 **正在分析你的需求...**', undefined, undefined, _originSessionId);

    const encodedPrompt = encodeURIComponent(prompt);
    const sseUrl = `${AppState.apiBaseUrl}/api/orchestrate/${AppState.currentProjectId}?prompt=${encodedPrompt}&provider=${AppState.modelProvider}`;

    // Per-session: 关闭该 session 旧的 EventSource
    const oldES = getSessionEventSource(_originSessionId);
    if (oldES) { oldES.close(); }
    const eventSource = new EventSource(sseUrl);
    setSessionEventSource(_originSessionId, eventSource);

    // --- SSE 事件处理 ---

    // 记录本次编排实际需要的 agent（由 orchestrate_plan 动态设置）
    let activeAgents = ['coordinator', ...Object.keys(task.agentStatus)]; // 默认全部，收到 plan 后更新

    // V4: 意图分类事件（V39: 不展示系统消息）
    eventSource.addEventListener('intent_classifying', () => {
        console.log('[WeCreat] intent_classifying');
    });

    eventSource.addEventListener('intent_classified', (e) => {
        try {
            const data = JSON.parse(e.data);
            console.log(`[WeCreat] intent: ${data.intent} — ${data.reason || ''}`);
        } catch { /* ignore */ }
    });

    // V4: Checkpoint 等待/结果事件（V39: 不显示系统消息，避免用户看到自动化流程细节）
    eventSource.addEventListener('checkpoint_waiting', () => {
        console.log('[WeCreat] checkpoint_waiting');
    });

    eventSource.addEventListener('checkpoint_result', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.action === 'proceed') {
                AppState.progressExpanded = true;
                updateGlobalProgress();
            }
        } catch { /* ignore */ }
    });

    // 编排方案（coordinator 解析后的智能分配）
    eventSource.addEventListener('orchestrate_plan', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.agents_needed) {
                // 保存 plan data 到 task 供进度面板使用
                task.planData = data;

                // 解析 agent ID（兼容旧版 artist/sound/engineer）
                const resolvedNeeded = data.agents_needed.map(id => resolveAgentId(id) || id);
                activeAgents = ['coordinator', ...resolvedNeeded];
                // 标记不在 agents_needed 中的 agent 为 skipped
                Object.keys(task.agentStatus).forEach(aid => {
                    if (!resolvedNeeded.includes(aid)) {
                        task.agentStatus[aid] = 'skipped';
                        task.agentProgress[aid] = -1;
                    }
                });

                // 更新项目名称
                if (data.game_name) {
                    DOM.projectTitle.textContent = data.game_name;
                    task.name = data.game_name;
                    // 更新后端元信息
                    if (AppState.currentProjectId) {
                      fetch(`${AppState.apiBaseUrl}/api/projects/${
                                AppState.currentProjectId}`,
                            {
                              method : 'PATCH',
                              headers : {'Content-Type' : 'application/json'},
                              body : JSON.stringify({name : data.game_name}),
                            })
                          .catch(() => {});
                    }
                }

                // V4: 快速路由模式下简化消息
                if (data.fast_route) {
                    const intentLabels = { 'tweak': '微调', 'bugfix': '修 Bug' };
                    const label = intentLabels[data.intent] || '快速处理';
                    addGroupMessage('coordinator', `🚀 **${label}模式** — 直接交给工程师处理`, undefined, undefined, _originSessionId);
                    AppState.progressExpanded = true;
                    updateGlobalProgress();
                    renderConvList();
                    return;
                }

                // V4: Checkpoint 确认卡片（feature/new_game 暂停等用户确认）
                // V29: Quick 模式下自动确认，不弹卡片
                if (data.checkpoint) {
                    if (AppState.currentMode === 'quick') {
                        // Quick 模式 → 自动确认，直接开始制作（V39: 不展示系统消息）
                        sendCheckpointConfirm('proceed');
                        AppState.progressExpanded = true;
                    } else {
                        // Collab 模式 → 展示确认卡片
                        renderCheckpointCard(data, resolvedNeeded, _originSessionId);
                    }
                    updateGlobalProgress();
                    renderConvList();
                    return; // 等后续执行
                }

                // 发简要总结消息（不再发大的任务清单卡片）
                const agentCount = resolvedNeeded.length;
                const groupNames = [...new Set(resolvedNeeded.map(aid => {
                    const ag = getAgent(aid);
                    return ag ? ag.group : '';
                }).filter(Boolean))];
                const summaryMsg = `✅ 任务已分配！**${data.game_name || '游戏'}** 将由 ${groupNames.join('、')} 共 ${agentCount} 位专家协作完成。\n\n📋 在下方任务面板查看详细进度 ↓`;
                addGroupMessage('coordinator', summaryMsg, undefined, undefined, _originSessionId);

                // 自动展开进度面板
                AppState.progressExpanded = true;

                updateGlobalProgress();
                renderConvList();
            }
        } catch (err) { /* ignore */ }
    });

    // Agent 跳过事件
    eventSource.addEventListener('agent_skip', (e) => {
        try {
            const data = JSON.parse(e.data);
            const agentId = data.agentId;
            if (agentId) {
                task.agentStatus[agentId] = 'skipped';
                task.agentProgress[agentId] = -1; // 跳过，不是 100%
                updateTaskPlanStatus(agentId, 'skip'); // 同步隐藏任务清单卡片中的该 Agent
                updateGlobalProgress();
            }
        } catch (err) { /* ignore */ }
    });

    // V39: 素材生成进度卡片 —— 显示总数/分别进度/缩略图

    eventSource.addEventListener('asset_gen_start', (e) => {
        try {
            const data = JSON.parse(e.data);
            const agentId = data.agentId || 'art-director';
            const total = data.total || 0;
            const assets = data.assets || [];

            // 创建素材生成进度卡片
            hideWelcome();
            const el = document.createElement('div');
            el.className = 'message ai';
            const groupName = getAgent(agentId)?.group || '美术';
            const groupColor = getGroupColor(groupName);
            el.innerHTML = `
                <div class="message-avatar group-avatar" style="background:${groupColor}22;color:${groupColor}">${getAgentAvatarHTML(agentId)}</div>
                <div class="message-content">
                    <div class="message-agent-name" style="color:${groupColor}">${getGroupDisplayName(groupName)}</div>
                    <div class="message-bubble agent-${agentId}">
                        <div class="asset-gen-card" data-total="${total}">
                            <div class="asg-gen-header">
                                <span class="asg-gen-title">🎨 AI 素材生成</span>
                                <span class="asg-gen-progress-text">0/${total}</span>
                            </div>
                            <div class="asg-gen-bar"><div class="asg-gen-bar-fill" style="width:0%"></div></div>
                            <div class="asg-gen-grid">
                                ${assets.map((a, i) => `
                                    <div class="asg-gen-item pending" data-index="${i}" data-name="${escapeHTML(a.name)}">
                                        <div class="asg-gen-thumb"><i class="fas fa-image"></i></div>
                                        <div class="asg-gen-name" title="${escapeHTML(a.name)}">${escapeHTML(a.name.length > 14 ? a.name.slice(0, 12) + '...' : a.name)}</div>
                                        <div class="asg-gen-status">⏳ 等待</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="message-time">${getTimeStr()}</div>
                </div>`;
            DOM.chatMessages.appendChild(el);
            AppState.assetGenCardEl = el.querySelector('.asset-gen-card');
            scrollToBottom();
        } catch (err) { console.warn('[asset_gen_start]', err); }
    });

    eventSource.addEventListener('asset_gen_progress', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (!AppState.assetGenCardEl) return;
            const total = parseInt(AppState.assetGenCardEl.dataset.total) || 1;
            const index = data.index || 0;
            const filename = data.filename || '';
            const success = data.success;

            // 更新进度条
            const progressPct = Math.round((index / total) * 100);
            const barFill = AppState.assetGenCardEl.querySelector('.asg-gen-bar-fill');
            if (barFill) barFill.style.width = `${progressPct}%`;
            const progressText = AppState.assetGenCardEl.querySelector('.asg-gen-progress-text');
            if (progressText) progressText.textContent = `${index}/${total}`;

            // 更新对应素材项
            const items = AppState.assetGenCardEl.querySelectorAll('.asg-gen-item');
            const targetItem = Array.from(items).find(it => it.dataset.name === filename) || items[index - 1];
            if (targetItem) {
                targetItem.className = `asg-gen-item ${success ? 'done' : 'failed'}`;
                const statusEl = targetItem.querySelector('.asg-gen-status');
                if (statusEl) statusEl.textContent = success ? `✅ ${data.size_kb || ''}KB` : '❌ 失败';
                // 成功的显示缩略图
                if (success) {
                    const thumbEl = targetItem.querySelector('.asg-gen-thumb');
                    if (thumbEl && AppState.currentProjectId) {
                      const url = `${AppState.apiBaseUrl || ''}/projects/${
                          AppState.currentProjectId}/assets/${filename}?v=${
                          Date.now()}`;
                      thumbEl.innerHTML = `<img src="${url}" alt="${
                          escapeHTML(filename)}" loading="lazy" />`;
                    }
                }
            }
            scrollToBottom();
        } catch (err) { console.warn('[asset_gen_progress]', err); }
    });

    eventSource.addEventListener('asset_gen_done', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (!AppState.assetGenCardEl) return;

            // 更新进度条到100%
            const barFill = AppState.assetGenCardEl.querySelector('.asg-gen-bar-fill');
            if (barFill) barFill.style.width = '100%';
            const progressText = AppState.assetGenCardEl.querySelector('.asg-gen-progress-text');
            if (progressText) progressText.textContent = `✅ ${data.success}/${data.total} 完成`;

            // 更新标题
            const title = AppState.assetGenCardEl.querySelector('.asg-gen-title');
            if (title) {
                title.textContent = data.failed > 0 ? `🎨 素材生成完成（${data.failed}张失败）` : '🎨 素材生成完成';
            }
            AppState.assetGenCardEl = null;
            scrollToBottom();

            // V38: 刷新项目素材
            loadProjectAssets();
        } catch (err) { console.warn('[asset_gen_done]', err); }
    });

    // V37 核心修复: 流式输出改为 per-agent 独立状态（修复并行 planner 输出互相覆盖的 Bug）
    // 之前 _streamCardEl/_streamReviewEl/_streamFullContent 是全局共享的，
    // 多个 planner 并行时 stream_delta 交错到达会导致内容互相覆盖、文档为空。
    const _streamStates = new Map(); // agentId → { cardEl, reviewEl, fullContent }

    eventSource.addEventListener('stream_delta', (e) => {
        try {
            const data = JSON.parse(e.data);
            const agentId = data.agentId || 'coordinator';
            const delta = data.delta || '';
            const done = data.done || false;

            // 获取或创建该 agent 的流式状态
            if (!_streamStates.has(agentId)) {
                _streamStates.set(agentId, { cardEl: null, reviewEl: null, fullContent: '' });
            }
            const st = _streamStates.get(agentId);

            if (done) {
                // 流式结束——保存到 session
                if (st.fullContent) {
                    const targetSession = AppState.sessions.find(s => s.id === _originSessionId) || getCurrentGroupSession();
                    if (targetSession) {
                        targetSession.messages.push({
                            agentId: agentId,
                            content: st.fullContent,
                            time: getTimeStr(),
                        });
                        saveChatHistory();
                    }

                    // ★ Real API 卡片：将 AI 输出解析为白板方案卡片
                    const resolvedId = resolveAgentId(agentId) || agentId;
                    // 对所有 Agent 的实质方案输出（>200字）生成卡片
                    if (st.fullContent.length > 200) {
                        parseAgentOutputToCard(resolvedId, st.fullContent);
                    }
                }
                // 更新聊天卡片
                const _hasImageRef = /@image:/i.test(st.fullContent) || /!\[.*\]\(.*\.(png|jpg|jpeg|webp|gif|svg)/i.test(st.fullContent);
                if (st.cardEl && st.fullContent) {
                    // ★ 长文本（>200字）已生成为方案卡片，聊天区只显示简短提示
                    if (st.fullContent.length > 200 && !_hasImageRef) {
                        const resolvedName = getAgentDisplayName(resolveAgentId(agentId) || agentId);
                        const cardBody = st.cardEl.querySelector('.stream-card-body');
                        if (cardBody) {
                            cardBody.innerHTML = `
                                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                                    <i class="fas fa-clipboard-check" style="color:var(--primary);font-size:14px;"></i>
                                    <span style="font-size:13px;color:var(--text-primary);font-weight:500;">${resolvedName}方案已就绪</span>
                                </div>
                                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">
                                    方案已整理为卡片，请在右侧方案面板查看
                                </div>`;
                        }
                        const badge = st.cardEl.querySelector('.stream-status-badge');
                        if (badge) {
                            badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
                            badge.className = 'stream-status-badge done';
                        }
                    } else if (st.fullContent.length <= MSG_COLLAPSE_THRESHOLD || _hasImageRef) {
                        // 短回复：直接替换为完整 Markdown 渲染
                        const bubble = st.cardEl.closest('.message-bubble') || st.cardEl.querySelector('.stream-card-body');
                        if (bubble) {
                            bubble.innerHTML = renderMarkdown(st.fullContent);
                        }
                        const badge = st.cardEl.querySelector('.stream-status-badge');
                        if (badge) {
                            badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
                            badge.className = 'stream-status-badge done';
                        }
                    } else {
                        const points = extractSummaryPoints(st.fullContent);
                        const pointsHTML = points.map(p => `<li>${escapeHTML(p)}</li>`).join('');
                        const wordCount = st.fullContent.length;
                        const headingCount = (st.fullContent.match(/^#+\s/gm) || []).length;
                        let statsText = `${wordCount}字`;
                        if (headingCount > 0) statsText += ` · ${headingCount}个章节`;
                        const cardBody = st.cardEl.querySelector('.stream-card-body');
                        if (cardBody) {
                            cardBody.innerHTML = `
                                <div class="msg-summary-points"><ul>${pointsHTML}</ul></div>
                                <div class="msg-summary-meta"><i class="fas fa-file-lines"></i> ${statsText}</div>
                                <button class="msg-collapse-toggle" onclick="openReviewTab('agent-${agentId}')">
                                    <i class="fas fa-arrow-up-right-from-square"></i> 在评审区查看完整方案
                                </button>`;
                        }
                        const badge = st.cardEl.querySelector('.stream-status-badge');
                        if (badge) {
                            badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
                            badge.className = 'stream-status-badge done';
                        }
                    }
                }
                // 清理该 agent 的流式状态
                _streamStates.delete(agentId);
                return;
            }

            if (!delta.trim()) return;
            st.fullContent += delta;

            if (!st.cardEl) {
                // 创建聊天里的消息气泡（带"生成中"状态）— V39: 用 Markdown 实时渲染
                const agent = AGENTS[agentId];
                if (!agent) return;
                hideWelcome();
                const el = document.createElement('div');
                el.className = 'message ai';
                el.innerHTML = `
                    <div class="message-avatar ${agentId}" title="${getAgentDisplayName(agentId)}" data-agent-click="${agentId}">${getAgentAvatarHTML(agentId)}</div>
                    <div class="message-content">
                        <div class="message-agent-name ${agentId}">${getAgentDisplayName(agentId)}</div>
                        <div class="message-bubble agent-${agentId}">
                            <div class="stream-summary-card">
                                <div class="stream-status-badge generating"><i class="fas fa-spinner fa-spin"></i> 生成中...</div>
                                <div class="stream-card-body">
                                    <div class="stream-preview-text">${renderMarkdown(st.fullContent)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="message-time">${getTimeStr()}</div>
                    </div>`;
                const avatarEl = el.querySelector('[data-agent-click]');
                if (avatarEl) avatarEl.addEventListener('click', () => enterAgentChat(avatarEl.dataset.agentClick));
                DOM.chatMessages.appendChild(el);
                st.cardEl = el.querySelector('.stream-summary-card');
                _lastMsgEl = el;
                _lastMsgAgentId = agentId;
                _lastMsgTime = Date.now();

                // ★ 不再创建旧式文档 Tab，方案内容统一由卡片系统展示
                // （旧代码：addDocToReview → 创建 review-pane Tab）
            } else {
                // V39: 实时 Markdown 渲染（不再截断为 120 字纯文本）
                const previewEl = st.cardEl.querySelector('.stream-preview-text');
                if (previewEl) {
                    previewEl.innerHTML = renderMarkdown(st.fullContent);
                }
                // 实时更新评审区完整内容
                if (st.reviewEl) {
                    st.reviewEl.innerHTML = renderMarkdown(st.fullContent);
                }
            }
            scrollToBottom();
        } catch (err) { console.warn('[stream_delta error]', err); }
    });

    // 编排阶段变更
    eventSource.addEventListener('orchestrate_phase', (e) => {
        try {
            const data = JSON.parse(e.data);
            const phase = data.phase;
            const message = data.message || '';

            if (phase === 'coordinator') {
                task.agentStatus.coordinator = 'working';
                task.agentProgress.coordinator = 0;
                addSystemMessage('🤖 小蓝正在分析你的需求...', _originSessionId);
                // V37: coordinator 工作时就展开进度面板
                AppState.progressExpanded = true;
            } else if (phase === 'parallel') {
                task.agentStatus.coordinator = 'done';
                task.agentProgress.coordinator = 100;
                // 激活所有在 activeAgents 中且角色为 planner 的 agent
                const startedGroups = new Set();
                activeAgents.forEach(aid => {
                    if (aid === 'coordinator') return;
                    const agent = getAgent(aid);
                    if (agent && agent.role === 'planner' && task.agentStatus[aid] !== 'skipped') {
                        task.agentStatus[aid] = 'working';
                        task.agentProgress[aid] = 0;
                        if (agent.group) startedGroups.add(agent.group);
                    }
                });
                if (startedGroups.size > 0) {
                    const names = [...startedGroups].map(g => {
                        const gi = AGENT_GROUPS[g];
                        return gi?.nickname ? `${gi.nickname}(${g})` : g;
                    }).join('、');
                    addSystemMessage(`📋 方案已拆解！${names} 开始并行设计...`, _originSessionId);
                }
            } else if (phase === 'engineer' || phase === 'coder') {
                // 把 planner agent 标记完成，激活 coder agent
                const coderGroups = new Set();
                activeAgents.forEach(aid => {
                    if (aid === 'coordinator') return;
                    const agent = getAgent(aid);
                    if (!agent) return;
                    if (agent.role === 'planner' && task.agentStatus[aid] === 'working') {
                        task.agentStatus[aid] = 'done';
                        task.agentProgress[aid] = 100;
                    }
                    if (agent.role === 'coder' && task.agentStatus[aid] !== 'skipped') {
                        task.agentStatus[aid] = 'working';
                        task.agentProgress[aid] = 0;
                        if (agent.group) coderGroups.add(agent.group);
                    }
                });
                if (coderGroups.size > 0) {
                    addSystemMessage(`🔧 设计阶段完成，码哥(工程师)开始编码实现...`, _originSessionId);
                }
            } else if (phase === 'done') {
                activeAgents.forEach(aid => {
                    if (task.agentStatus[aid] !== 'skipped') {
                        task.agentStatus[aid] = 'done';
                        task.agentProgress[aid] = 100;
                    }
                });
                addSystemMessage('🎉 全部角色任务已完成！', _originSessionId);
            }

            // 更新任务清单卡片状态
            if (phase === 'coordinator') {
                updateTaskPlanStatus('coordinator', 'working');
            } else if (phase === 'parallel') {
                updateTaskPlanStatus('coordinator', 'done');
                activeAgents.forEach(aid => {
                    if (aid === 'coordinator') return;
                    const agent = getAgent(aid);
                    if (agent && agent.role === 'planner' && task.agentStatus[aid] !== 'skipped') {
                        updateTaskPlanStatus(aid, 'working');
                    }
                });
            } else if (phase === 'engineer' || phase === 'coder') {
                activeAgents.forEach(aid => {
                    if (aid === 'coordinator') return;
                    const agent = getAgent(aid);
                    if (!agent) return;
                    if (agent.role === 'planner') {
                        updateTaskPlanStatus(aid, task.agentStatus[aid] === 'skipped' ? 'skip' : 'done');
                    }
                    if (agent.role === 'coder' && task.agentStatus[aid] !== 'skipped') {
                        updateTaskPlanStatus(aid, 'working');
                    }
                });
            } else if (phase === 'done') {
                activeAgents.forEach(aid => {
                    if (aid !== 'coordinator') {
                        updateTaskPlanStatus(aid, task.agentStatus[aid] === 'skipped' ? 'skip' : 'done');
                    }
                });
            }
            console.log(`[WeCreat phase] ${phase}: ${message}`);
            // Quick Mode 也更新阶段指示器
            if (phase === 'coordinator') updatePhaseIndicator('brainstorm');
            else if (phase === 'parallel') updatePhaseIndicator('design');
            else if (phase === 'engineer' || phase === 'coder') updatePhaseIndicator('production');
            else if (phase === 'done') updatePhaseIndicator('production');
            updateGlobalProgress();
        } catch (err) { /* ignore */ }
    });

    // Agent 完成总结
    eventSource.addEventListener('agent_summary', (e) => {
        try {
            const data = JSON.parse(e.data);
            const agentId = resolveAgentId(data.agentId) || data.agentId || 'coordinator';
            const summary = data.summary || '';
            if (summary) {
                addGroupMessage(agentId, summary, undefined, undefined, _originSessionId);
            }
        } catch (err) { /* ignore */ }
    });

    eventSource.addEventListener('status', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.phase === 'completed') {
                addGroupMessage('coordinator', `✅ ${data.message}`, undefined, undefined, _originSessionId);
                loadPreviewIframe(AppState.currentProjectId);

                activeAgents.forEach(aid => {
                    // 不覆盖已经标记为 error 的 agent
                    if (task.agentStatus[aid] === 'working') {
                        task.agentStatus[aid] = 'done';
                        task.agentProgress[aid] = 100;
                        updateTaskPlanStatus(aid, 'done');
                    }
                });
                task.phase = 'done';
                setSessionGenerating(_originSessionId, false);
                updateInputPlaceholder();
                updateGlobalProgress();
                processSessionPendingMessages(_originSessionId);
            } else if (data.phase === 'error') {
                addGroupMessage('coordinator', `❌ ${data.message}`, undefined, undefined, _originSessionId);
                task.phase = 'error';
                setSessionGenerating(_originSessionId, false);
                updateInputPlaceholder();
                updateGlobalProgress();
            }
            // 不再把每个 status 都显示到聊天区（减少噪音）
        } catch (err) { /* ignore */ }
    });

    // 过滤掉纯状态性消息（连接中、开始工作等），只显示有实质内容的消息
    const _agentNames = Object.values(AGENTS).map(a => a.name).join('|');
    const STATUS_NOISE_PATTERNS = [
        /^.{0,3}连接\s*Adams/i,
        /^.{0,3}收到任务/,
        /^.{0,3}AI\s*开始输出/,
        new RegExp(`^.{0,3}(${_agentNames})方案已输出`),
        new RegExp(`^.{0,3}(${_agentNames})正在连接`),
        /正在分析需求/,
        /正在设计架构/,
        /方案设计完成/,
        /开始编写代码\.{3}$/,
        /正在生成:\s*`/,
    ];

    eventSource.addEventListener('agent_message', (e) => {
        try {
            const data = JSON.parse(e.data);
            const agentId = resolveAgentId(data.agentId) || data.agentId || 'coordinator';
            const content = data.content || '';

            // 过滤状态噪音——不打到聊天区，但更新进度面板
            const isNoise = STATUS_NOISE_PATTERNS.some(p => p.test(content));
            if (!isNoise && content.trim()) {
                addGroupMessage(agentId, content, undefined, undefined, _originSessionId);
            } else if (content.trim()) {
                // 噪音消息不打聊天区，但更新进度面板的状态文字
                console.log(`[WeCreat] progress update: [${agentId}] ${content.slice(0, 50)}`);
            }

            if (task.agentStatus[agentId] === 'idle') {
                task.agentStatus[agentId] = 'working';
                task.agentSubtasks[agentId] = [];
                task.agentProgress[agentId] = 0;
            }

            _extractAndUpdateSubtask(task, agentId, content);
            updateGlobalProgress();
        } catch (err) { /* ignore */ }
    });

    // 非 engineer agent 的完整输出（方案已出，但可能还有素材生成等后处理）
    eventSource.addEventListener('agent_output', (e) => {
        try {
            const data = JSON.parse(e.data);
            const agentId = resolveAgentId(data.agentId) || data.agentId || 'coordinator';
            // 不直接标 done——后续可能还有素材生成等步骤
            // 标 95% 表示方案已完成，等 status.completed 或 orchestrate_phase=done 才最终标 done
            if (task.agentProgress[agentId] < 95) {
                task.agentProgress[agentId] = 95;
            }
            updateTaskPlanStatus(agentId, 'working');
            updateGlobalProgress();
        } catch (err) { /* ignore */ }
    });

    eventSource.addEventListener('progress', (e) => {
        try {
            const data = JSON.parse(e.data);
            const pct = data.percent || 0;
            const agentId = resolveAgentId(data.agentId) || data.agentId || 'coordinator';

            task.agentProgress[agentId] = pct;

            const subtasks = task.agentSubtasks[agentId] || [];
            if (subtasks.length > 0) {
                const completedCount = Math.floor(pct / 100 * subtasks.length);
                subtasks.forEach((st, i) => {
                    if (i < completedCount) st.status = 'done';
                    else if (i === completedCount && pct < 100) st.status = 'working';
                    else if (pct >= 100) st.status = 'done';
                    else st.status = 'pending';
                });
            }
            updateGlobalProgress();
        } catch (err) { /* ignore */ }
    });

    eventSource.addEventListener('file_changed', (e) => {
        try {
            const data = JSON.parse(e.data);
            console.log('[WeCreat] File changed:', data.filepath);
            if (data.filepath) {
                if (!task.agentFileChanges) task.agentFileChanges = {};
                const fileAgent = resolveAgentId(data.agentId) || 'prototyper';
                if (!task.agentFileChanges[fileAgent]) task.agentFileChanges[fileAgent] = [];
                const files = task.agentFileChanges[fileAgent];
                if (!files.includes(data.filepath)) {
                    files.push(data.filepath);
                }

                // V29: 素材文件自动添加到素材坞 + 评审区
                const fp = data.filepath;
                const ext = fp.split('.').pop().toLowerCase();
                const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
                if (isImage && fp.startsWith('assets/')) {
                    const filename = fp.split('/').pop();
                    const projectId = AppState.currentProjectId;
                    const thumbUrl =
                        projectId ? `${AppState.apiBaseUrl || ''}/projects/${
                                        projectId}/${fp}?v=${Date.now()}`
                                  : null;
                    // 添加到素材坞
                    addAssetToGrid(filename, thumbUrl);
                    // 添加到评审区（美术 tab）
                    const artAgentId = data.agentId || 'art-director';
                    addDesignToReview(thumbUrl, filename, artAgentId);
                }

                updateGlobalProgress();
            }
        } catch (err) { /* ignore */ }
    });

    eventSource.addEventListener('error_msg', (e) => {
        try {
            const data = JSON.parse(e.data);
            const errorAgentId = data.agentId ? (resolveAgentId(data.agentId) || data.agentId) : null;
            addGroupMessage('coordinator', `❌ 错误: ${data.message}`, undefined, undefined, _originSessionId);
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
            task.phase = 'error';

            // 标记出错的 agent 或所有 working 的 agent 为 error
            if (errorAgentId && task.agentStatus[errorAgentId]) {
                task.agentStatus[errorAgentId] = 'error';
                updateTaskPlanStatus(errorAgentId, 'error');
            } else {
                // 没有指定哪个 agent 出错，把所有 working 的标为 error
                activeAgents.forEach(aid => {
                    if (task.agentStatus[aid] === 'working') {
                        task.agentStatus[aid] = 'error';
                        updateTaskPlanStatus(aid, 'error');
                    }
                });
            }
            updateGlobalProgress();
        } catch (err) { /* ignore */ }
    });

    // 不再把每条 log 都显示到聊天区（太吵了）
    eventSource.addEventListener('log', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.text) {
                console.log('[WeCreat log]', data.text);
            }
        } catch (err) { /* ignore */ }
    });

    eventSource.addEventListener('done', () => {
        eventSource.close();
        setSessionEventSource(_originSessionId, null);
    });

    eventSource.onerror = (e) => {
        console.error('[WeCreat SSE] Connection error:', e);
        if (getSessionGenerating(_originSessionId)) {
            addGroupMessage('coordinator', '⚠️ 与后端的连接中断，请检查服务状态', undefined, undefined, _originSessionId);
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
        }
        eventSource.close();
        setSessionEventSource(_originSessionId, null);
    };
}

// ========================================
// Collab Mode 生成流程
// ========================================

/**
 * Collab Mode: 启动协作会话
 * POST /api/sessions/:projectId/start → SSE 流
 */
async function realCollabStart(prompt, mentioned) {
    const _originSessionId = getCapturedSessionId();
    setSessionGenerating(_originSessionId, true);
    addUserMessage(prompt, mentioned);

    await delay(300);
    if (!getSessionGenerating(_originSessionId)) return;

    const task = getCurrentTask();
    if (!task) { setSessionGenerating(_originSessionId, false); return; }
    task.phase = 'agents_working';

    // 创建或复用项目
    try {
        if (!AppState.currentProjectId) {
            const createRes = await fetch(`${AppState.apiBaseUrl}/api/projects`, { method: 'POST' });
            if (!createRes.ok) throw new Error('创建项目失败');
            const { projectId } = await createRes.json();
            AppState.currentProjectId = projectId;
            console.log(`[collabStart] 创建新项目: ${projectId}`);
        } else {
            console.log(`[collabStart] 复用已有项目: ${AppState.currentProjectId}`);
        }
    } catch (e) {
        addGroupMessage('coordinator', `❌ 无法连接后端服务: ${e.message}\n\n请确保后端已启动：\n\`cd server && node index.js\``, undefined, undefined, _originSessionId);
        setSessionGenerating(_originSessionId, false);
        return;
    }

    addGroupMessage('coordinator', '🎬 **Collab 模式：正在分析你的需求...**\n协作会话已开启，小助手将给出方案供你确认。', undefined, undefined, _originSessionId);
    updatePhaseIndicator('brainstorm');

    // Per-session: abort 旧 controller
    const oldCtrl = getSessionAbortController(_originSessionId);
    if (oldCtrl) { oldCtrl.abort(); }
    const controller = new AbortController();
    setSessionAbortController(_originSessionId, controller);

    const url = `${AppState.apiBaseUrl}/api/sessions/${AppState.currentProjectId}/start`;

    // 流式卡片状态
    let _streamCardEl = null;
    let _streamReviewEl = null;
    let _streamContent = '';

    await fetchSSE(url, { prompt, provider: AppState.modelProvider }, {
        onEvent(eventName, data) {
            if (!getSessionGenerating(_originSessionId)) return;

            if (eventName === 'session_state') {
                // 同步 Session State
                AppState.sessionState = data;
                handleSessionStateUpdate(data, _originSessionId);
            } else if (eventName === 'stream_delta') {
                // coordinator 流式文本
                const delta = data.delta || '';
                const done = data.done || false;

                if (done) {
                    if (_streamCardEl && _streamContent) {
                        // 保存完整内容到发起请求的 session
                        const targetSession = AppState.sessions.find(s => s.id === _originSessionId) || getCurrentGroupSession();
                        if (targetSession) {
                            targetSession.messages.push({
                                agentId: 'coordinator',
                                content: _streamContent,
                                time: getTimeStr(),
                            });
                            saveChatHistory();
                        }
                        // 短文本直接显示完整内容，长文本显示摘要+评审区链接
                        if (_streamContent.length <= MSG_COLLAPSE_THRESHOLD) {
                            const bubble = _streamCardEl.closest('.message-bubble') || _streamCardEl.querySelector('.stream-card-body');
                            if (bubble) {
                                bubble.innerHTML = renderMarkdown(_streamContent);
                            }
                            const badge = _streamCardEl.querySelector('.stream-status-badge');
                            if (badge) {
                                badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
                                badge.className = 'stream-status-badge done';
                            }
                        } else {
                            const points = extractSummaryPoints(_streamContent);
                            const pointsHTML = points.map(p => `<li>${escapeHTML(p)}</li>`).join('');
                            const wordCount = _streamContent.length;
                            let statsText = `${wordCount}字`;
                            const headingCount = (_streamContent.match(/^#+\s/gm) || []).length;
                            if (headingCount > 0) statsText += ` · ${headingCount}个章节`;
                            const cardBody = _streamCardEl.querySelector('.stream-card-body');
                            if (cardBody) {
                                cardBody.innerHTML = `
                                    <div class="msg-summary-points"><ul>${pointsHTML}</ul></div>
                                    <div class="msg-summary-meta"><i class="fas fa-file-lines"></i> ${statsText}</div>
                                    <button class="msg-collapse-toggle" onclick="openReviewTab('agent-coordinator')">
                                        <i class="fas fa-arrow-up-right-from-square"></i> 在评审区查看完整方案
                                    </button>`;
                            }
                            const badge = _streamCardEl.querySelector('.stream-status-badge');
                            if (badge) {
                                badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
                                badge.className = 'stream-status-badge done';
                            }
                        }
                    }
                    _streamCardEl = null;
                    _streamReviewEl = null;
                    _streamContent = '';
                    return;
                }

                if (!delta.trim()) return;
                _streamContent += delta;

                if (!_streamCardEl) {
                    const agent = AGENTS['coordinator'];
                    hideWelcome();
                    const el = document.createElement('div');
                    el.className = 'message ai';
                    el.innerHTML = `
                        <div class="message-avatar coordinator" title="${getAgentDisplayName('coordinator')}" data-agent-click="coordinator">${getAgentAvatarHTML('coordinator')}</div>
                        <div class="message-content">
                            <div class="message-agent-name coordinator">${getAgentDisplayName('coordinator')}</div>
                            <div class="message-bubble agent-coordinator">
                                <div class="stream-summary-card">
                                    <div class="stream-status-badge generating"><i class="fas fa-spinner fa-spin"></i> 生成中...</div>
                                    <div class="stream-card-body">
                                        <div class="stream-preview-text">${renderMarkdown(_streamContent)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="message-time">${getTimeStr()}</div>
                        </div>`;
                    const avatarEl = el.querySelector('[data-agent-click]');
                    if (avatarEl) avatarEl.addEventListener('click', () => enterAgentChat('coordinator'));
                    DOM.chatMessages.appendChild(el);
                    _streamCardEl = el.querySelector('.stream-summary-card');

                    // 评审区实时更新
                    const docTitle = `${getAgentDisplayName('coordinator')} · 方案`;
                    addDocToReview(docTitle, _streamContent, 'coordinator');
                    const pane = DOM.reviewContent?.querySelector('.review-pane[data-pane="agent-coordinator"]');
                    if (pane) _streamReviewEl = pane.querySelector('.agent-review-section:last-child');
                } else {
                    // V39: 实时 Markdown 渲染
                    const previewEl = _streamCardEl.querySelector('.stream-preview-text');
                    if (previewEl) {
                        previewEl.innerHTML = renderMarkdown(_streamContent);
                    }
                    if (_streamReviewEl) {
                        _streamReviewEl.innerHTML = renderMarkdown(_streamContent);
                    }
                }
                scrollToBottom();
            } else if (eventName === 'agent_message') {
                const agentId = resolveAgentId(data.agentId) || data.agentId || 'coordinator';
                const content = data.content || '';
                if (content.trim()) {
                    addGroupMessage(agentId, content, undefined, undefined, _originSessionId);
                }
            } else if (eventName === 'agent_registry') {
                // Agent 注册表，前端已内置，忽略
            } else if (eventName === 'error_msg') {
                addGroupMessage('coordinator', `❌ ${data.message}`, undefined, undefined, _originSessionId);
                setSessionGenerating(_originSessionId, false);
                updateInputPlaceholder();
            } else if (eventName === 'done') {
                // 流结束
            }
        },
        onError(err) {
            addGroupMessage('coordinator', `❌ 协作会话启动失败: ${err.message}`, undefined, undefined, _originSessionId);
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
        },
        onDone() {
            setSessionAbortController(_originSessionId, null);
            // 无论是否 waitingForUser，都重置生成锁让输入框可用
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
            console.log('[collabStart] SSE stream ended');
            processSessionPendingMessages(_originSessionId);
        },
    }, controller);
}

/**
 * Collab Mode: 用户回复/确认
 * POST /api/sessions/:projectId/respond → SSE 流
 */
async function realCollabRespond(response, agentId) {
    const _originSessionId = getCapturedSessionId();
    setSessionGenerating(_originSessionId, true);

    // Per-session: abort 旧 controller
    const oldCtrl = getSessionAbortController(_originSessionId);
    if (oldCtrl) { oldCtrl.abort(); }
    const controller = new AbortController();
    setSessionAbortController(_originSessionId, controller);

    const url = `${AppState.apiBaseUrl}/api/sessions/${AppState.currentProjectId}/respond`;
    const task = getCurrentTask();

    await fetchSSE(url, { response, agentId, provider: AppState.modelProvider }, {
        onEvent(eventName, data) {
            if (!getSessionGenerating(_originSessionId)) return;

            if (eventName === 'session_state') {
                AppState.sessionState = data;
                handleSessionStateUpdate(data, _originSessionId);
            } else if (eventName === 'orchestrate_phase') {
                // 和 Quick Mode 一样的阶段管理
                const phase = data.phase;
                if (phase === 'parallel' && data.agents) {
                    data.agents.forEach(aid => {
                        if (task && task.agentStatus) {
                            task.agentStatus[aid] = 'working';
                            task.agentProgress[aid] = 0;
                        }
                    });
                    const labels = data.agents.map(a => {
                        const agent = getAgent(a);
                        return agent ? `${agent.emoji}${agent.name}` : a;
                    });
                    addGroupMessage('coordinator', `🔄 ${labels.join(' + ')} 正在工作中...`, undefined, undefined, _originSessionId);
                } else if (phase === 'done') {
                    addGroupMessage('coordinator', '✅ 当前阶段全部 Agent 完成！', undefined, undefined, _originSessionId);
                }
                // Collab Mode 也更新阶段指示器
                if (phase === 'parallel') updatePhaseIndicator('design');
                else if (phase === 'done') updatePhaseIndicator('production');
                updateGlobalProgress();
            } else if (eventName === 'stream_delta') {
                // 复用流式渲染（简化版，直接追加消息）
                const delta = data.delta || '';
                const done = data.done || false;
                if (!done && delta.trim()) {
                    addGroupMessage(data.agentId || 'coordinator', delta, undefined, undefined, _originSessionId);
                }
            } else if (eventName === 'agent_message') {
                const aid = resolveAgentId(data.agentId) || data.agentId || 'coordinator';
                const content = data.content || '';
                if (content.trim()) addGroupMessage(aid, content, undefined, undefined, _originSessionId);
            } else if (eventName === 'agent_summary') {
                const aid = resolveAgentId(data.agentId) || data.agentId || 'coordinator';
                if (data.summary) addGroupMessage(aid, data.summary, undefined, undefined, _originSessionId);
            } else if (eventName === 'error_msg') {
                addGroupMessage('coordinator', `❌ ${data.message}`, undefined, undefined, _originSessionId);
                setSessionGenerating(_originSessionId, false);
                updateInputPlaceholder();
            } else if (eventName === 'done') {
                // 流结束
            }
        },
        onError(err) {
            addGroupMessage('coordinator', `❌ 协作回复失败: ${err.message}`, undefined, undefined, _originSessionId);
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
        },
        onDone() {
            setSessionAbortController(_originSessionId, null);
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
            console.log('[collabRespond] SSE stream ended');
            processSessionPendingMessages(_originSessionId);
        },
    }, controller);
}

/**
 * 处理 Session State 更新 — 渲染交互 UI
 * 当后端发送 session_state 且 waitingForUser=true 时，显示确认/选项卡片
 */
function handleSessionStateUpdate(state, targetSessionId) {
    if (!state) return;

    // 更新阶段进度指示器
    if (state.phase) {
        updatePhaseIndicator(state.phase);
    }

    console.log(`[collabSession] phase=${state.phase}, waiting=${state.orchestration?.waitingForUser}`);

    // 如果在等用户确认，且目标 session 是当前展示的 session，才渲染交互卡片
    if (state.orchestration?.waitingForUser && state.orchestration?.pendingQuestion) {
        const pq = state.orchestration.pendingQuestion;
        const sid = targetSessionId || AppState.currentSessionId || 'main';
        if (sid === AppState.currentSessionId) {
            renderCollabConfirmCard(pq);
        } else {
            // 不是当前 session —— 更新侧边栏红点提醒
            const targetSession = AppState.sessions.find(s => s.id === sid);
            if (targetSession) {
                targetSession._pendingConfirms = (targetSession._pendingConfirms || 0) + 1;
                renderConvList();
            }
        }
    }
}

/**
 * 阶段进度指示器 — brainstorm → design → production → polish
 * 显示在任务进度面板 header 右侧
 */
const PHASE_CONFIG = {
  brainstorm : {label : '💡 头脑风暴', color : '#F59E0B', order : 0},
  design : {label : '🎨 方案设计', color : '#EC4899', order : 1},
  production : {label : '🔧 制作中', color : '#10B981', order : 2},
  polish : {label : '✨ 打磨优化', color : '#6366F1', order : 3},
};

function updatePhaseIndicator(phase) {
    // v12f: 不再显示策划中/制作中的阶段指示器
    const indicator = document.getElementById('phaseIndicator');
    if (indicator) indicator.style.display = 'none';
}

/**
 * Collab Mode: @Agent 直接对话（走 session 上下文）
 * POST /api/sessions/:projectId/agent/:agentId → SSE 流
 */
async function realCollabAgentChat(message, agentId) {
    const _originSessionId = getCapturedSessionId();
    setSessionGenerating(_originSessionId, true);
    addUserMessage(message, [agentId]);

    const agent = getAgent(agentId);
    addGroupMessage(agentId, `💬 正在思考...`, undefined, undefined, _originSessionId);

    // Per-session: abort 旧 controller
    const oldCtrl = getSessionAbortController(_originSessionId);
    if (oldCtrl) { oldCtrl.abort(); }
    const controller = new AbortController();
    setSessionAbortController(_originSessionId, controller);

    const url = `${AppState.apiBaseUrl}/api/sessions/${AppState.currentProjectId}/agent/${agentId}`;

    let _streamCardEl = null;
    let _streamReviewEl = null;
    let _streamContent = '';

    await fetchSSE(url, { message, provider: AppState.modelProvider }, {
        onEvent(eventName, data) {
            if (!getSessionGenerating(_originSessionId)) return;

            if (eventName === 'stream_delta') {
                const delta = data.delta || '';
                const done = data.done || false;

                if (done) {
                    if (_streamContent) {
                        const targetSession = AppState.sessions.find(s => s.id === _originSessionId) || getCurrentGroupSession();
                        if (targetSession) {
                            targetSession.messages.push({
                                agentId: agentId,
                                content: _streamContent,
                                time: getTimeStr(),
                            });
                            saveChatHistory();
                        }
                    }
                    // 短文本（<300字）直接显示完整内容，长文本显示摘要
                    if (_streamCardEl && _streamContent) {
                        if (_streamContent.length <= MSG_COLLAPSE_THRESHOLD) {
                            // 短回复：直接替换为完整内容
                            const bubble = _streamCardEl.closest('.message-bubble');
                            if (bubble) {
                                bubble.innerHTML = renderMarkdown(_streamContent);
                            }
                        } else {
                            const points = extractSummaryPoints(_streamContent);
                            const pointsHTML = points.map(p => `<li>${escapeHTML(p)}</li>`).join('');
                            const statsText = `${_streamContent.length}字`;
                            const cardBody = _streamCardEl.querySelector('.stream-card-body');
                            if (cardBody) {
                                cardBody.innerHTML = `
                                    <div class="msg-summary-points"><ul>${pointsHTML}</ul></div>
                                    <div class="msg-summary-meta"><i class="fas fa-file-lines"></i> ${statsText}</div>
                                    <button class="msg-collapse-toggle" onclick="openReviewTab('agent-${agentId}')">
                                        <i class="fas fa-arrow-up-right-from-square"></i> 在评审区查看完整内容
                                    </button>`;
                            }
                            const badge = _streamCardEl.querySelector('.stream-status-badge');
                            if (badge) {
                                badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
                                badge.className = 'stream-status-badge done';
                            }
                        }
                    }
                    _streamCardEl = null;
                    _streamReviewEl = null;
                    _streamContent = '';
                    return;
                }

                if (!delta.trim()) return;
                _streamContent += delta;

                if (!_streamCardEl) {
                    // 移除"正在思考"的占位消息
                    const msgs = DOM.chatMessages.querySelectorAll('.message.ai');
                    const lastMsg = msgs[msgs.length - 1];
                    if (lastMsg && lastMsg.querySelector('.message-bubble')?.textContent.includes('正在思考')) {
                        lastMsg.remove();
                    }

                    hideWelcome();
                    const el = document.createElement('div');
                    el.className = 'message ai';
                    el.innerHTML = `
                        <div class="message-avatar ${agentId}" title="${getAgentDisplayName(agentId)}" data-agent-click="${agentId}">${getAgentAvatarHTML(agentId)}</div>
                        <div class="message-content">
                            <div class="message-agent-name ${agentId}">${getAgentDisplayName(agentId)}</div>
                            <div class="message-bubble agent-${agentId}">
                                <div class="stream-summary-card">
                                    <div class="stream-status-badge generating"><i class="fas fa-spinner fa-spin"></i> 回复生成中...</div>
                                    <div class="stream-card-body">
                                        <div class="stream-preview-text">${escapeHTML(_streamContent.slice(0, 80))}...</div>
                                    </div>
                                </div>
                            </div>
                            <div class="message-time">${getTimeStr()}</div>
                        </div>`;
                    const avatarEl = el.querySelector('[data-agent-click]');
                    if (avatarEl) avatarEl.addEventListener('click', () => enterAgentChat(agentId));
                    DOM.chatMessages.appendChild(el);
                    _streamCardEl = el.querySelector('.stream-summary-card');

                    // 长文也在评审区创建实时 tab
                    const docTitle = `${getAgentDisplayName(agentId)} · 回复`;
                    addDocToReview(docTitle, _streamContent, agentId);
                    const pane = DOM.reviewContent?.querySelector(`.review-pane[data-pane="agent-${agentId}"]`);
                    if (pane) _streamReviewEl = pane.querySelector('.agent-review-section:last-child');
                } else {
                    const previewEl = _streamCardEl.querySelector('.stream-preview-text');
                    if (previewEl) {
                        previewEl.textContent = _streamContent.slice(0, 120).replace(/\n/g, ' ') + '...';
                    }
                    if (_streamReviewEl) {
                        _streamReviewEl.innerHTML = renderMarkdown(_streamContent);
                    }
                }
                scrollToBottom();
            } else if (eventName === 'agent_message') {
                const aid = resolveAgentId(data.agentId) || agentId;
                const content = data.content || '';
                if (content.trim()) addGroupMessage(aid, content, undefined, undefined, _originSessionId);
            } else if (eventName === 'error_msg') {
                addGroupMessage(agentId, `❌ ${data.message}`, undefined, undefined, _originSessionId);
                setSessionGenerating(_originSessionId, false);
                updateInputPlaceholder();
            }
        },
        onError(err) {
            addGroupMessage(agentId, `❌ 对话失败: ${err.message}`, undefined, undefined, _originSessionId);
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
        },
        onDone() {
            setSessionAbortController(_originSessionId, null);
            setSessionGenerating(_originSessionId, false);
            updateInputPlaceholder();
            console.log(`[collabAgentChat] @${agentId} done`);
            processSessionPendingMessages(_originSessionId);
        },
    }, controller);
}

/**
 * 渲染 Collab 确认卡片（选项按钮 + 自由输入）
 */
function renderCollabConfirmCard(pendingQuestion) {
    const { question, options, agentId } = pendingQuestion;
    const agent = getAgent(agentId) || getAgent('coordinator') || AGENTS['coordinator'];

    hideWelcome();
    const cardEl = document.createElement('div');
    cardEl.className = 'message ai collab-confirm-wrapper';

    const optionBtns =
        (options || [])
            .map((opt, i) => `<button class="collab-option-btn" data-option="${
                     i}">${opt}</button>`)
            .join('');

    cardEl.innerHTML = `
        <div class="message-avatar ${agentId || 'coordinator'}" title="${agent.name}">${getAgentAvatarHTML(agentId || 'coordinator')}</div>
        <div class="message-content">
            <div class="message-agent-name ${agentId || 'coordinator'}">${agent.name}</div>
            <div class="collab-confirm-card">
                <div class="collab-confirm-question">${question}</div>
                <div class="collab-confirm-options">${optionBtns}</div>
                <div class="collab-confirm-custom">
                    <input type="text" class="collab-custom-input" placeholder="或者输入你的想法...">
                    <button class="collab-custom-send"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <div class="message-time">${getTimeStr()}</div>
        </div>`;

    // 绑定选项按钮事件
    cardEl.querySelectorAll('.collab-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const optText = btn.textContent;
            // 禁用所有按钮（防重复点击）
            cardEl.querySelectorAll('.collab-option-btn').forEach(b => {
                b.disabled = true;
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
            // 隐藏自定义输入
            const customRow = cardEl.querySelector('.collab-confirm-custom');
            if (customRow) customRow.style.display = 'none';
            // 发送用户选择
            addUserMessage(optText);
            realCollabRespond(optText);
        });
    });

    // 绑定自定义输入事件
    const customInput = cardEl.querySelector('.collab-custom-input');
    const customSend = cardEl.querySelector('.collab-custom-send');
    const doCustomSend = () => {
        const text = customInput.value.trim();
        if (!text) return;
        // 禁用所有选项按钮
        cardEl.querySelectorAll('.collab-option-btn').forEach(b => b.disabled = true);
        customInput.disabled = true;
        customSend.disabled = true;
        addUserMessage(text);
        realCollabRespond(text);
    };
    customSend?.addEventListener('click', doCustomSend);
    customInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); doCustomSend(); }
    });

    DOM.chatMessages.appendChild(cardEl);
    scrollToBottom();
}

/**
 * V4: 渲染 Checkpoint 确认卡片（Quick Mode orchestrate_plan 中 checkpoint=true 时）
 * 展示 coordinator 的编排方案摘要，让用户确认后再开始执行
 */
function renderCheckpointCard(planData, resolvedAgents, targetSessionId) {
    const agent = getAgent('coordinator') || AGENTS['coordinator'];
    const gameName = planData.game_name || '游戏项目';
    const intentLabels = {
        'feature': '✨ 新功能',
        'new_game': '🎮 全新项目',
    };
    const intentLabel = intentLabels[planData.intent] || planData.intent;

    // 构建 agent 任务列表
    const agentTasks = planData.agent_tasks || {};
    const taskListHTML = resolvedAgents.map(aid => {
        const ag = getAgent(aid);
        if (!ag) return '';
        const taskDesc = agentTasks[aid] || '';
        const shortDesc = taskDesc.length > 60 ? taskDesc.slice(0, 57) + '...' : taskDesc;
        return `<div class="checkpoint-agent-row">
            <span class="checkpoint-agent-avatar">${getAgentAvatarHTML(aid)}</span>
            <span class="checkpoint-agent-name">${ag.name}</span>
            <span class="checkpoint-agent-task">${escapeHTML(shortDesc)}</span>
        </div>`;
    }).filter(Boolean).join('');

    hideWelcome();
    const cardEl = document.createElement('div');
    cardEl.className = 'message ai checkpoint-wrapper';

    cardEl.innerHTML = `
        <div class="message-avatar coordinator" title="${agent.name}">${getAgentAvatarHTML('coordinator')}</div>
        <div class="message-content">
            <div class="message-agent-name coordinator">${agent.name}</div>
            <div class="checkpoint-card">
                <div class="checkpoint-header">
                    <span class="checkpoint-intent-tag">${intentLabel}</span>
                    <span class="checkpoint-game-name">${escapeHTML(gameName)}</span>
                </div>
                <div class="checkpoint-brief">以下是我的编排方案，请确认后开始制作：</div>
                <div class="checkpoint-agent-list">${taskListHTML}</div>
                <div class="checkpoint-actions">
                    <button class="checkpoint-btn confirm"><i class="fas fa-play"></i> 开始制作</button>
                    <button class="checkpoint-btn adjust"><i class="fas fa-pen"></i> 我想调整</button>
                </div>
            </div>
            <div class="message-time">${getTimeStr()}</div>
        </div>`;

    // 绑定 "开始制作" 按钮
    const confirmBtn = cardEl.querySelector('.checkpoint-btn.confirm');
    const adjustBtn = cardEl.querySelector('.checkpoint-btn.adjust');

    confirmBtn?.addEventListener('click', () => {
        // 禁用按钮
        confirmBtn.disabled = true;
        adjustBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> 已确认，制作中...';
        cardEl.querySelector('.checkpoint-card')?.classList.add('confirmed');

        // 发送确认信号给后端
        sendCheckpointConfirm('proceed');

        // 展开进度面板
        AppState.progressExpanded = true;
        updateGlobalProgress();
        addSystemMessage('✅ 方案已确认，正在制作...', targetSessionId);
    });

    // 绑定 "我想调整" 按钮
    adjustBtn?.addEventListener('click', () => {
        // 禁用按钮
        confirmBtn.disabled = true;
        adjustBtn.disabled = true;
        adjustBtn.innerHTML = '<i class="fas fa-pen"></i> 请在下方输入调整意见';
        cardEl.querySelector('.checkpoint-card')?.classList.add('adjusting');

        // 发送调整信号给后端（暂停当前执行）
        sendCheckpointConfirm('adjust');

        // 聚焦输入框让用户输入调整意见
        DOM.chatInput?.focus();
        DOM.chatInput.placeholder = '输入你想调整的内容...';
        addSystemMessage('✏️ 请输入你想调整的内容，我会重新编排方案', targetSessionId);
    });

    DOM.chatMessages.appendChild(cardEl);
    scrollToBottom();
}

/**
 * V4: 发送 Checkpoint 确认信号给后端
 * @param {'proceed'|'adjust'} action
 */
async function sendCheckpointConfirm(action) {
    if (!AppState.currentProjectId) return;
    try {
        await fetch(`${AppState.apiBaseUrl}/api/orchestrate/${AppState.currentProjectId}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        });
    } catch (err) {
        console.warn('[checkpoint] Confirm failed:', err.message);
    }
}

/**
 * 从 Session State 获取当前 Agent 对话的上下文
 */
async function fetchSessionState() {
    if (!AppState.currentProjectId) return null;
    try {
        const res = await fetch(`${AppState.apiBaseUrl}/api/sessions/${AppState.currentProjectId}/state`);
        if (res.ok) {
            const data = await res.json();
            AppState.sessionState = data.session;
            return data.session;
        }
    } catch (e) {
        console.warn('[fetchSessionState] Error:', e.message);
    }
    return null;
}

/**
 * 从 agent_message 内容中动态提取子任务，更新进度面板
 * 不硬编码任何游戏类型 —— 纯粹从消息文本中提取
 */
function _extractAndUpdateSubtask(task, agentId, content) {
    if (!content) return;

    const subtasks = task.agentSubtasks[agentId] || [];

    // 提取模式：📝 正在写入: `xxx` → 子任务 "写入 xxx"
    // 📖 正在读取: `xxx` → 子任务 "读取 xxx"  
    // ⚡ 执行命令: `xxx` → 子任务 "执行 xxx"
    // 🔧/📝/✅ 等 emoji 开头的 → 作为子任务标题

    let taskName = '';
    let taskDetail = '';

    const writeMatch = content.match(/📝\s*正在写入:\s*`([^`]+)`/);
    const readMatch = content.match(/📖\s*正在读取:\s*`([^`]+)`/);
    const cmdMatch = content.match(/⚡\s*执行命令:\s*`([^`]+)`/);

    if (writeMatch) {
        taskName = '写入文件';
        taskDetail = writeMatch[1];
    } else if (readMatch) {
        taskName = '读取文件';
        taskDetail = readMatch[1];
    } else if (cmdMatch) {
        taskName = '执行命令';
        taskDetail = cmdMatch[1].slice(0, 40);
    } else {
        // 提取 emoji 开头的有意义消息作为子任务
        const emojiMatch = content.match(/^([🔧📝✅🚀📋🎮⚙️🎨🔊📖⚡🏗️💡🎯])\s*(.{2,30})/);
        if (emojiMatch) {
            // 截取到第一个换行或 30 字符
            const rawName = emojiMatch[2].split('\n')[0].trim();
            if (rawName.length >= 2) {
                taskName = rawName.slice(0, 20);
                taskDetail = '';
            }
        }
    }

    if (!taskName) return;

    // 避免重复：如果最后一个子任务的 name 和 detail 完全一样，跳过
    const last = subtasks[subtasks.length - 1];
    if (last && last.name === taskName && last.detail === taskDetail) return;

    // 标记之前所有 working 的为 done
    subtasks.forEach(st => { if (st.status === 'working') st.status = 'done'; });

    // 添加新的正在进行的子任务
    subtasks.push({ name: taskName, detail: taskDetail, status: 'working' });
    task.agentSubtasks[agentId] = subtasks;
}

/**
 * 在预览区加载生成的游戏（iframe 方式）
 */
function loadPreviewIframe(projectId) {
    const previewContent = DOM.previewContent;
    if (!previewContent) return;

    // 隐藏空白占位
    const placeholder = document.getElementById('previewPlaceholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    // 移除已有 loading overlay
    const existingLoading = document.getElementById('previewLoading');
    if (existingLoading) existingLoading.remove();

    // 显示 loading 状态
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'previewLoading';
    loadingOverlay.className = 'preview-loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="preview-loading-spinner"></div>
        <span class="preview-loading-text">正在加载游戏预览...</span>
    `;
    previewContent.appendChild(loadingOverlay);

    // 创建或复用 iframe
    let iframe = document.getElementById('gamePreviewIframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'gamePreviewIframe';
        iframe.className = 'game-preview-iframe';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
        previewContent.appendChild(iframe);
    }

    // iframe 加载完成 → 移除 loading、淡入、注入错误监听
    iframe.style.opacity = '0';
    iframe.onload = () => {
        const loading = document.getElementById('previewLoading');
        if (loading) loading.remove();
        iframe.style.transition = 'opacity 0.3s ease';
        iframe.style.opacity = '1';
        // A1: 注入错误监听脚本
        injectErrorListenerToIframe(iframe);
        // v21: 自动截取封面图（延迟等游戏渲染首屏）
        captureGameThumbnail(iframe, projectId);
    };

    // 设置 src
    // BUG 7.1 fix: 加 cache-bust 时间戳避免加载旧版游戏
    const previewUrl = `${AppState.apiBaseUrl}/projects/${
        projectId}/index.html?v=${Date.now()}`;
    iframe.src = previewUrl;
    AppState.previewUrl = previewUrl;
}

/**
 * v21: 自动截取游戏封面图
 * 延迟等待游戏渲染首屏，然后从 iframe 内的 canvas 抓取截图上传后端
 */
function captureGameThumbnail(iframe, projectId) {
    if (!iframe || !projectId) return;
    // 延迟 2 秒等游戏渲染完首屏（菜单/标题画面）
    setTimeout(() => {
        try {
            const iframeDoc = iframe.contentWindow?.document;
            if (!iframeDoc) return;

            // 优先抓取 canvas 元素
            const canvas = iframeDoc.querySelector('canvas');
            if (canvas && canvas.width > 0 && canvas.height > 0) {
                let dataUrl;
                try {
                    dataUrl = canvas.toDataURL('image/png');
                } catch (e) {
                    console.warn('[v21] canvas.toDataURL failed (tainted?):', e.message);
                    return;
                }
                if (!dataUrl || dataUrl === 'data:,') return;

                // 压缩到合理尺寸（缩放到 400px 宽）
                const thumbCanvas = document.createElement('canvas');
                const thumbWidth = 400;
                const scale = thumbWidth / canvas.width;
                thumbCanvas.width = thumbWidth;
                thumbCanvas.height = Math.round(canvas.height * scale);
                const ctx = thumbCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
                const thumbDataUrl = thumbCanvas.toDataURL('image/png');

                // 上传到后端
                fetch(`${AppState.apiBaseUrl}/api/projects/${
                          projectId}/thumbnail`,
                      {
                        method : 'POST',
                        headers : {'Content-Type' : 'application/json'},
                        body : JSON.stringify({dataUrl : thumbDataUrl}),
                      })
                    .then(res => {
                      if (res.ok)
                        console.log(
                            `[v21] Thumbnail captured for ${projectId}`);
                    })
                    .catch(() => {});
                return;
            }

            // 如果没有 canvas，尝试用 html2canvas 风格的方式截取整个 body
            // 这里用一个 fallback：创建一个临时 canvas 绘制 iframe 内容
            // 但由于同源限制，需要 allow-same-origin sandbox
            // 如果 iframe 内有多个 canvas（如 Phaser 游戏），取最大的那个
            const allCanvases = iframeDoc.querySelectorAll('canvas');
            if (allCanvases.length > 0) {
                let biggest = allCanvases[0];
                for (const c of allCanvases) {
                    if (c.width * c.height > biggest.width * biggest.height) biggest = c;
                }
                try {
                    const dataUrl = biggest.toDataURL('image/png');
                    if (dataUrl && dataUrl !== 'data:,') {
                        const thumbCanvas = document.createElement('canvas');
                        const thumbWidth = 400;
                        const scale = thumbWidth / biggest.width;
                        thumbCanvas.width = thumbWidth;
                        thumbCanvas.height = Math.round(biggest.height * scale);
                        const ctx = thumbCanvas.getContext('2d');
                        ctx.drawImage(biggest, 0, 0, thumbCanvas.width, thumbCanvas.height);
                        fetch(`${AppState.apiBaseUrl}/api/projects/${
                                  projectId}/thumbnail`,
                              {
                                method : 'POST',
                                headers : {'Content-Type' : 'application/json'},
                                body : JSON.stringify({
                                  dataUrl : thumbCanvas.toDataURL('image/png')
                                }),
                              })
                            .catch(() => {});
                    }
                } catch {
                }
            }
        } catch (e) {
            console.warn('[v21] captureGameThumbnail error:', e.message);
        }
    }, 2000);
}

/**
 * 刷新预览区 iframe
 */
function refreshPreviewIframe() {
    const iframe = document.getElementById('gamePreviewIframe');
    if (iframe && iframe.src) {
        // 显示刷新动画
        iframe.style.opacity = '0.5';
        iframe.style.transition = 'opacity 0.15s ease';

        iframe.onload = () => {
            iframe.style.transition = 'opacity 0.3s ease';
            iframe.style.opacity = '1';
            // A1: 刷新后重新注入错误监听
            injectErrorListenerToIframe(iframe);
            // v21: 刷新后也重新截取封面图
            if (AppState.currentProjectId) {
                captureGameThumbnail(iframe, AppState.currentProjectId);
            }
        };

        // 加时间戳破缓存
        const base = iframe.src.split('?')[0];
        iframe.src = base + '?t=' + Date.now();
        return true;
    }
    return false;
}

/**
 * 回到空白占位状态（关闭 iframe 预览）
 */
function resetPreviewToDemo() {
    const iframe = document.getElementById('gamePreviewIframe');
    if (iframe) iframe.remove();
    const loading = document.getElementById('previewLoading');
    if (loading) loading.remove();

    const placeholder = document.getElementById('previewPlaceholder');
    if (placeholder) {
        placeholder.style.display = '';
    }
    AppState.previewUrl = null;
}

// ========================================
// A1: iframe 错误捕获 + 错误面板 + 一键修复
// ========================================

function injectErrorListenerToIframe(iframe) {
    try {
        const iframeDoc = iframe.contentWindow;
        if (!iframeDoc) return;
        // 清空之前的错误
        AppState.previewErrors = [];
        updateErrorIndicator();

        // 注入 onerror
        iframeDoc.onerror = function(message, source, lineno, colno, error) {
          const errInfo = {
            type : 'error',
            message : String(message),
            source : source ? source.split('/').pop() : '',
            line : lineno,
            col : colno,
            stack : error?.stack || '',
            time : new Date().toLocaleTimeString(
                'zh-CN',
                {hour : '2-digit', minute : '2-digit', second : '2-digit'}),
          };
          addPreviewError(errInfo);
          return false;
        };

        // 注入 unhandledrejection
        iframeDoc.onunhandledrejection = function(event) {
          const errInfo = {
            type : 'promise',
            message : String(event.reason?.message || event.reason ||
                             'Unhandled Promise Rejection'),
            source : '',
            line : 0,
            col : 0,
            stack : event.reason?.stack || '',
            time : new Date().toLocaleTimeString(
                'zh-CN',
                {hour : '2-digit', minute : '2-digit', second : '2-digit'}),
          };
          addPreviewError(errInfo);
        };

        // 拦截 console.error
        const originalConsoleError = iframeDoc.console.error;
        iframeDoc.console.error = function(...args) {
          const errInfo = {
            type : 'console',
            message : args.map(a => typeof a === 'object' ? JSON.stringify(a)
                                                          : String(a))
                          .join(' '),
            source : '',
            line : 0,
            col : 0,
            stack : '',
            time : new Date().toLocaleTimeString(
                'zh-CN',
                {hour : '2-digit', minute : '2-digit', second : '2-digit'}),
          };
          addPreviewError(errInfo);
          originalConsoleError.apply(this, args);
        };
    } catch (e) {
        // 跨域 iframe 无法注入，忽略
        console.warn('[A1] Cannot inject error listener:', e.message);
    }
}

function addPreviewError(errInfo) {
    // 去重：同一 message 5 秒内不重复
    const isDup = AppState.previewErrors.some(e => e.message === errInfo.message && (Date.now() - (e._ts || 0)) < 5000);
    if (isDup) return;
    errInfo._ts = Date.now();
    AppState.previewErrors.push(errInfo);
    updateErrorIndicator();
    if (AppState.errorPanelOpen) renderErrorPanel();
}

function updateErrorIndicator() {
    const count = AppState.previewErrors.length;
    if (DOM.errorIndicator) {
        DOM.errorIndicator.style.display = count > 0 ? 'flex' : 'none';
    }
    if (DOM.errorCount) {
        DOM.errorCount.textContent = count;
    }
}

function toggleErrorPanel() {
    AppState.errorPanelOpen = !AppState.errorPanelOpen;
    if (DOM.errorPanel) {
        DOM.errorPanel.style.display = AppState.errorPanelOpen ? 'flex' : 'none';
    }
    if (AppState.errorPanelOpen) renderErrorPanel();
}

function renderErrorPanel() {
    if (!DOM.errorPanelList) return;
    if (AppState.previewErrors.length === 0) {
        DOM.errorPanelList.innerHTML = '<div class="error-panel-empty"><i class="fas fa-check-circle"></i> 没有错误</div>';
        return;
    }
    DOM.errorPanelList.innerHTML = AppState.previewErrors.map((err, i) => `
        <div class="error-panel-item" data-error-idx="${i}">
            <div class="error-item-header">
                <span class="error-type-badge ${err.type}">${err.type === 'error' ? 'Error' : err.type === 'promise' ? 'Promise' : 'Console'}</span>
                <span class="error-time">${err.time}</span>
            </div>
            <div class="error-message">${escapeHTML(err.message).slice(0, 200)}</div>
            ${err.source ? `<div class="error-source">${err.source}${err.line ? ':' + err.line : ''}</div>` : ''}
            <div class="error-item-actions">
                <button class="error-fix-btn" data-fix-idx="${i}"><i class="fas fa-wrench"></i> 群聊修复</button>
                <button class="error-fix-mage-btn" data-fix-idx="${i}"><i class="fas fa-code"></i> 找码哥</button>
            </div>
        </div>
    `).join('');
    // 绑定群聊修复按钮
    DOM.errorPanelList.querySelectorAll('.error-fix-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.fixIdx);
            sendErrorToFix(idx);
        });
    });
    // 绑定找码哥按钮
    DOM.errorPanelList.querySelectorAll('.error-fix-mage-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.fixIdx);
            sendErrorToMage(idx);
        });
    });
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sendErrorToFix(idx) {
    const err = AppState.previewErrors[idx];
    if (!err) return;
    const fixPrompt = `🐛 预览区报错，请修复：\n\n**错误信息**: ${err.message}\n${err.source ? `**文件**: ${err.source}:${err.line}` : ''}${err.stack ? `\n**调用栈**:\n\`\`\`\n${err.stack.slice(0, 500)}\n\`\`\`` : ''}`;

    // 自动填入并发送
    DOM.chatInput.value = fixPrompt;
    DOM.chatInput.style.height = 'auto';
    DOM.chatInput.style.height = Math.min(DOM.chatInput.scrollHeight, 100) + 'px';
    DOM.chatInput.focus();
    // 自动关闭错误面板
    AppState.errorPanelOpen = false;
    if (DOM.errorPanel) DOM.errorPanel.style.display = 'none';
    // 自动触发发送
    DOM.btnSend.click();
}

function sendAllErrorsToFix() {
    if (AppState.previewErrors.length === 0) return;
    const errList =
        AppState.previewErrors
            .map((err, i) =>
                     `${i + 1}. **${err.type}**: ${err.message.slice(0, 100)}${
                         err.source ? ` (${err.source}:${err.line})` : ''}`)
            .join('\n');
    const fixPrompt = `🐛 预览区共 ${AppState.previewErrors.length} 个错误，请逐一修复：\n\n${errList}`;

    // 自动填入并发送
    DOM.chatInput.value = fixPrompt;
    DOM.chatInput.style.height = 'auto';
    DOM.chatInput.style.height = Math.min(DOM.chatInput.scrollHeight, 100) + 'px';
    DOM.chatInput.focus();
    AppState.errorPanelOpen = false;
    if (DOM.errorPanel) DOM.errorPanel.style.display = 'none';
    // 自动触发发送
    DOM.btnSend.click();
}

/** 单条错误 → 跳转码哥聊天页修复 */
function sendErrorToMage(idx) {
    const err = AppState.previewErrors[idx];
    if (!err) return;
    const fixPrompt = `🐛 预览区报错，请修复：\n\n**错误信息**: ${err.message}\n${err.source ? `**文件**: ${err.source}:${err.line}` : ''}${err.stack ? `\n**调用栈**:\n\`\`\`\n${err.stack.slice(0, 500)}\n\`\`\`` : ''}`;

    // 关闭错误面板
    AppState.errorPanelOpen = false;
    if (DOM.errorPanel) DOM.errorPanel.style.display = 'none';

    // 进入码哥聊天页并带上错误信息
    openEngineerChat(fixPrompt);
}

/** 全部错误 → 跳转码哥聊天页修复 */
function sendAllErrorsToMage() {
    if (AppState.previewErrors.length === 0) return;
    const errList = AppState.previewErrors
        .map((err, i) => `${i + 1}. **${err.type}**: ${err.message.slice(0, 100)}${err.source ? ` (${err.source}:${err.line})` : ''}`)
        .join('\n');
    const fixPrompt = `🐛 预览区共 ${AppState.previewErrors.length} 个错误，请逐一修复：\n\n${errList}`;

    // 关闭错误面板
    AppState.errorPanelOpen = false;
    if (DOM.errorPanel) DOM.errorPanel.style.display = 'none';

    openEngineerChat(fixPrompt);
}

/** 打开码哥（工程师）聊天页面 */
function openEngineerChat(prefillPrompt) {
    const groupName = '工程师';
    const groupInfo = AGENT_GROUPS[groupName];
    if (!groupInfo) return;

    if (AppState.activeAssetView) AppState.activeAssetView = false;
    AppState.activeMemberView = groupName;

    const nickname = groupInfo.nickname || groupName;
    const state = AppState.roleStates[groupName] || 'idle';
    const stateLabel = state === 'working' ? '工作中' : state === 'done' ? '已完成' : '待命中';
    const stateClass = state === 'working' ? 'working' : state === 'done' ? 'done' : 'idle';

    // 更新 header
    if (DOM.chatPanelTitle) {
        const avatarHTML = groupInfo.avatar
            ? `<img src="${groupInfo.avatar}" class="mp-header-avatar" />`
            : `<span class="mp-header-avatar-fb" style="background:${groupInfo.color}"><i class="fas ${groupInfo.icon}" style="color:#fff;font-size:11px;"></i></span>`;
        DOM.chatPanelTitle.innerHTML = `${avatarHTML}<div class="mp-header-text"><span class="mp-header-name">${escapeHTML(nickname)}</span><span class="mp-header-role">${escapeHTML(groupInfo.personality || groupInfo.desc)}</span></div><span class="mp-header-state ${stateClass}"><span class="mp-state-dot ${stateClass}"></span>${stateLabel}</span>`;
    }

    // 显示输入框
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    if (inputWrapper) inputWrapper.style.display = '';
    if (DOM.chatInput) {
        DOM.chatInput.placeholder = `跟${nickname}说要修改什么... Enter 发送`;
    }

    // 渲染码哥聊天页
    renderEngineerChatView(prefillPrompt);
    renderConvList();
}

/** 渲染码哥聊天页面：顶部所有方案卡片（可点选）+ 错误摘要 + 聊天区 */
function renderEngineerChatView(prefillPrompt) {
    const container = DOM.chatMessages;
    if (!container) return;
    container.innerHTML = '';

    const groupInfo = AGENT_GROUPS['工程师'];
    const nickname = groupInfo?.nickname || '码哥';

    // ===== 1. 所有方案卡片（可点选不符合的部分） =====
    const cardTypes = [
        { key: 'plan', icon: '📋', title: '策划方案', color: '#F59E0B' },
        { key: 'art', icon: '🎨', title: '美术方案', color: '#EC4899' },
        { key: 'sound', icon: '🎵', title: '音效方案', color: '#06B6D4' },
        { key: 'assets', icon: '📦', title: '资产清单', color: '#8B5CF6' },
    ];

    let cardsHTML = '';
    for (const ct of cardTypes) {
        // 优先从 PlanCardCollector 读，空则从 Whiteboard fallback
        let bucket = PlanCardCollector['_' + ct.key] || [];
        if (bucket.length === 0 && Whiteboard.cards && Whiteboard.cards.length > 0) {
            const wbCard = Whiteboard.cards.find(c => c.type === ct.key);
            if (wbCard && wbCard.sections) {
                bucket = wbCard.sections.map(s => ({ title: s.title || '', items: (s.items || []).slice() }));
            }
        }
        if (bucket.length === 0) continue;

        const sectionsHTML = bucket.map(s => {
            const itemsHTML = s.items.slice(0, 10).map((item, idx) =>
                `<div class="eng-card-item" data-card-type="${ct.key}" data-section="${escapeHTML(s.title)}" data-item-idx="${idx}" data-item-text="${escapeHTML(item)}" title="点击标记为不符合">
                    <i class="fas fa-circle eng-card-item-dot"></i>
                    <span>${escapeHTML(item)}</span>
                </div>`
            ).join('');
            return `<div class="eng-card-section">
                <div class="eng-card-section-title">${escapeHTML(s.title)}</div>
                ${itemsHTML}
            </div>`;
        }).join('');

        cardsHTML += `
            <div class="eng-plan-card" data-card-type="${ct.key}">
                <div class="eng-plan-card-header" style="--eng-card-color:${ct.color}">
                    <span class="eng-plan-card-icon">${ct.icon}</span>
                    <span class="eng-plan-card-title">${ct.title}</span>
                    <button class="eng-plan-card-toggle"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="eng-plan-card-body" style="display:none;">${sectionsHTML}</div>
            </div>`;
    }

    // ===== 2. 错误摘要（如果有） =====
    let errorsHTML = '';
    if (AppState.previewErrors.length > 0) {
        const errItems = AppState.previewErrors.slice(0, 5).map((err, i) =>
            `<div class="eng-error-item">
                <span class="eng-error-badge">${err.type === 'error' ? '❌' : '⚠️'}</span>
                <span class="eng-error-text">${escapeHTML(err.message.slice(0, 80))}</span>
                ${err.source ? `<span class="eng-error-source">${err.source}:${err.line || ''}</span>` : ''}
            </div>`
        ).join('');
        errorsHTML = `
            <div class="eng-errors-card">
                <div class="eng-errors-header">
                    <i class="fas fa-bug"></i>
                    <span>当前 ${AppState.previewErrors.length} 个报错</span>
                </div>
                ${errItems}
            </div>`;
    }

    // ===== 3. 聊天消息 =====
    const session = getCurrentGroupSession();
    const groupAgentIds = Object.keys(AGENTS).filter(aid => AGENTS[aid].group === '工程师');
    let chatMessagesHTML = '';
    if (session) {
        const relevantMsgs = session.messages.filter(msg => {
            if (msg.isUser || msg.type === 'user') {
                return msg.mentioned?.some(aid => groupAgentIds.includes(aid)) ||
                       (msg.content && (msg.content.includes(`@${nickname}`) || msg.content.includes('@工程师')));
            }
            return groupAgentIds.includes(msg.agentId);
        }).slice(-15);

        chatMessagesHTML = relevantMsgs.map(msg => {
            if (msg.isUser || msg.type === 'user') {
                return `<div class="mc-msg mc-msg-user">
                    <div class="mc-msg-content">${escapeHTML(msg.content || '')}</div>
                    <div class="mc-msg-time">${msg.time || ''}</div>
                </div>`;
            }
            const agent = getAgent(msg.agentId);
            return `<div class="mc-msg mc-msg-ai">
                <div class="mc-msg-avatar" style="background:${groupInfo.color}22;color:${groupInfo.color}">
                    ${groupInfo.avatar ? `<img src="${groupInfo.avatar}" />` : `<i class="fas ${groupInfo.icon}"></i>`}
                </div>
                <div class="mc-msg-body">
                    <div class="mc-msg-content">${renderMarkdown(msg.content || '')}</div>
                    <div class="mc-msg-time">${msg.time || ''}</div>
                </div>
            </div>`;
        }).join('');
    }

    // ===== 4. 提示引导 =====
    const guideHTML = !chatMessagesHTML && !prefillPrompt ? `
        <div class="mc-empty-chat">
            <div class="mc-empty-avatar" style="background:${groupInfo.color}22">
                ${groupInfo.avatar ? `<img src="${groupInfo.avatar}" />` : `<i class="fas ${groupInfo.icon}" style="color:${groupInfo.color};font-size:28px;"></i>`}
            </div>
            <div class="mc-empty-name">${escapeHTML(nickname)}</div>
            <div class="mc-empty-desc">${escapeHTML(groupInfo.personality || '')}</div>
        </div>
        <div class="mc-suggestions">
            <div class="mc-suggestions-title"><i class="fas fa-lightbulb"></i> 点击上方卡片中不符合的条目，或直接输入</div>
            <button class="mc-suggestion-chip" data-prompt="@码哥 游戏运行时有卡顿，帮我优化一下性能"><span class="mc-suggestion-emoji">🚀</span><span class="mc-suggestion-text">性能优化</span></button>
            <button class="mc-suggestion-chip" data-prompt="@码哥 游戏有个bug，帮我看看"><span class="mc-suggestion-emoji">🐛</span><span class="mc-suggestion-text">修复 Bug</span></button>
            <button class="mc-suggestion-chip" data-prompt="@码哥 帮我把方案里的设计都实现到代码里"><span class="mc-suggestion-emoji">🔧</span><span class="mc-suggestion-text">落地方案</span></button>
        </div>` : '';

    container.innerHTML = `
        <div class="engineer-chat-container">
            ${cardsHTML ? `<div class="eng-cards-strip">
                <div class="eng-cards-strip-title"><i class="fas fa-clipboard-list"></i> 点击卡片条目标记不符合的地方</div>
                ${cardsHTML}
            </div>` : ''}
            ${errorsHTML}
            <div class="mc-chat-area" id="engChatArea">
                ${chatMessagesHTML}
                ${guideHTML}
            </div>
        </div>`;

    // ===== 绑定事件 =====

    // 卡片展开/收起
    container.querySelectorAll('.eng-plan-card-header').forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const icon = header.querySelector('i');
            if (body) {
                const show = body.style.display === 'none';
                body.style.display = show ? '' : 'none';
                if (icon) icon.className = show ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            }
        });
    });

    // ★ 点选卡片条目 → 自动填入聊天框
    container.querySelectorAll('.eng-card-item').forEach(item => {
        item.addEventListener('click', () => {
            const cardType = item.dataset.cardType;
            const section = item.dataset.section;
            const text = item.dataset.itemText;
            const _cardTitleMap = { plan: '策划方案', art: '美术方案', sound: '音效方案', assets: '资产清单' };
            const cardTitle = _cardTitleMap[cardType] || '方案';

            // 标记选中态
            item.classList.toggle('selected');

            // 收集所有已选中的条目
            const selectedItems = container.querySelectorAll('.eng-card-item.selected');
            if (selectedItems.length === 0) {
                if (DOM.chatInput) DOM.chatInput.value = '';
                return;
            }

            // 生成修改指令
            const parts = [];
            selectedItems.forEach(sel => {
                const ct = _cardTitleMap[sel.dataset.cardType] || '方案';
                const st = sel.dataset.section;
                const tx = sel.dataset.itemText;
                parts.push(`「${ct} - ${st}」的"${tx}"`);
            });

            const prompt = `@码哥 ${parts.join('、')}不符合预期效果，请重新修改`;
            if (DOM.chatInput) {
                DOM.chatInput.value = prompt;
                DOM.chatInput.focus();
            }
        });
    });

    // 建议话题
    container.querySelectorAll('.mc-suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (DOM.chatInput) {
                DOM.chatInput.value = chip.dataset.prompt;
                DOM.chatInput.focus();
            }
        });
    });

    // 如果有预填内容（从错误面板来的），自动填入
    if (prefillPrompt && DOM.chatInput) {
        DOM.chatInput.value = `@码哥 ${prefillPrompt}`;
        DOM.chatInput.focus();
    }
}

function clearPreviewErrors() {
    AppState.previewErrors = [];
    updateErrorIndicator();
    renderErrorPanel();
}

// ========================================
// A2: 图片生成 API 接入（iChat Gemini）
// ========================================
async function generateImage(prompt, options = {}) {
    if (!AppState.currentProjectId) return null;
    try {
        const res = await fetch(`${AppState.apiBaseUrl}/api/projects/${AppState.currentProjectId}/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, ...options }),
        });
        if (!res.ok) {
            const errText = await res.text();
            console.warn('[A2] Generate image failed:', errText);
            return null;
        }
        const data = await res.json();
        return data; // { url, filename, path }
    } catch (e) {
        console.warn('[A2] Generate image error:', e.message);
        return null;
    }
}

// ========================================
// A3: 图片输入支持（对话发图 + 粘贴截图）
// ========================================

function addImageAttachment(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        AppState.imageAttachments.push({ name: file.name, base64, file });
        renderImageAttachPreview();
    };
    reader.readAsDataURL(file);
}

function removeImageAttachment(idx) {
    AppState.imageAttachments.splice(idx, 1);
    renderImageAttachPreview();
}

function clearImageAttachments() {
    AppState.imageAttachments = [];
    renderImageAttachPreview();
}

function renderImageAttachPreview() {
    const container = DOM.imageAttachPreview;
    if (!container) return;
    if (AppState.imageAttachments.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'flex';
    container.innerHTML = AppState.imageAttachments.map((img, i) => `
        <div class="image-attach-item" data-idx="${i}">
            <img src="${img.base64}" alt="${img.name}" class="image-attach-thumb">
            <button class="image-attach-remove" data-remove-idx="${i}"><i class="fas fa-xmark"></i></button>
        </div>
    `).join('');
    container.querySelectorAll('.image-attach-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeImageAttachment(parseInt(btn.dataset.removeIdx));
        });
    });
}

// ========================================
// A4: 素材上传到项目目录
// ========================================
async function uploadAssetToProject(file) {
    if (!AppState.currentProjectId) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await fetch(`${AppState.apiBaseUrl}/api/projects/${AppState.currentProjectId}/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data; // { filename, url, path }
    } catch (e) {
        console.warn('[A4] Upload asset error:', e);
        return null;
    }
}

// ========================================
// B1: 前端角色合并展示工具
// ========================================

// 获取 agentId 对应的前端展示组
function getGroupForAgent(agentId) {
    const agent = getAgent(agentId);
    return agent ? agent.group : '小助手';
}

// 获取组的代表 Agent（第一个）
function getGroupRepAgent(groupName) {
    const agents = Object.values(AGENTS).filter(a => a.group === groupName);
    return agents[0] || AGENTS['coordinator'];
}

// 获取组的颜色
function getGroupColor(groupName) {
    return AGENT_GROUPS[groupName]?.color || '#6366F1';
}

// 获取组的图标
function getGroupIcon(groupName) {
    return AGENT_GROUPS[groupName]?.icon || 'fa-robot';
}

// ========================================
// V31: 新增卡片渲染函数
// ========================================

/** V31: 角色摘要卡片 HTML（角色完成产出时在主群聊展示） */
function renderRoleSummaryCardHTML(data) {
    if (!data) return '';
    const agent = AGENTS[data.agentId];
    const groupName = agent?.group || '小助手';
    const groupInfo = AGENT_GROUPS[groupName];
    const nickname = groupInfo?.nickname || groupName;
    const color = groupInfo?.color || '#6366F1';
    const avatarImg = groupInfo?.avatar ? `<img src="${groupInfo.avatar}" alt="${nickname}" />` : `<span style="font-size:18px;">🤖</span>`;
    const statusLabel = data.status === 'done' ? '✅ 已完成' : '🔄 进行中';
    const statusClass = data.status === 'done' ? 'done' : 'working';
    const summary = data.summary || '';

    return `<div class="role-summary-card" data-group-name="${groupName}" data-agent-id="${data.agentId}">
        <div class="rsc-header">
            <div class="rsc-avatar">${avatarImg}</div>
            <div class="rsc-name" style="color:${color}">${nickname} · ${agent?.name || ''}</div>
            <div class="rsc-status ${statusClass}">${statusLabel}</div>
        </div>
        <div class="rsc-body">${renderMarkdown(summary)}</div>
        <div class="rsc-actions">
            <button class="rsc-btn" data-action="view"><i class="fas fa-eye"></i> 查看产出</button>
            ${groupInfo?.canDirectChat !== false ? `<button class="rsc-btn primary" data-action="discuss"><i class="fas fa-comments"></i> 讨论 ↗</button>` : ''}
        </div>
    </div>`;
}

/** V31: 空闲邀请卡片 HTML（角色空闲时主动在主群聊邀请讨论） */
function renderIdleInviteCardHTML(data) {
    if (!data) return '';
    const groupInfo = AGENT_GROUPS[data.groupName];
    if (!groupInfo) return '';
    const nickname = groupInfo.nickname || data.groupName;
    const avatarImg = groupInfo.avatar ? `<img src="${groupInfo.avatar}" alt="${nickname}" />` : `<span style="font-size:18px;">🤖</span>`;

    const optionsHTML = (data.options || []).map(opt => {
        const emoji = opt.emoji || '💡';
        return `<button class="iic-option-btn">${emoji} ${escapeHTML(opt.label || opt)}</button>`;
    }).join('');

    return `<div class="idle-invite-card" data-group-name="${data.groupName}">
        <div class="iic-header">
            <div class="iic-avatar">${avatarImg}</div>
            <div class="iic-name">${nickname}</div>
            <div class="iic-tag">💤 空闲</div>
        </div>
        <div class="iic-text">${escapeHTML(data.text || '')}</div>
        ${optionsHTML ? `<div class="iic-options">${optionsHTML}</div>` : ''}
        <button class="iic-skip-btn">跳过，等主线完成再说</button>
    </div>`;
}

/** V31: 子线程归档卡片 HTML（子线程关闭后在主群聊展示结论） */
function renderThreadArchiveCardHTML(data) {
    if (!data) return '';
    const groupInfo = AGENT_GROUPS[data.groupName];
    const nickname = data.nickname || groupInfo?.nickname || data.groupName;
    return `<div class="thread-archive-card" data-group-name="${data.groupName}">
        <div class="tac-header"><i class="fas fa-check-circle"></i> 与${escapeHTML(nickname)}的讨论已结束</div>
        <div class="tac-body">${renderMarkdown(data.summary || '')}</div>
        <div class="tac-actions">
            <button class="tac-btn" data-action="reopen"><i class="fas fa-redo"></i> 重新讨论</button>
        </div>
    </div>`;
}

/** V32: 素材画廊卡片 HTML（合并所有素材到一张卡片 + 图片网格预览） */
function renderAssetGalleryCardHTML(data) {
    if (!data) return '';
    const agent = AGENTS[data.agentId];
    const groupName = agent?.group || '美术';
    const groupInfo = AGENT_GROUPS[groupName];
    const nickname = groupInfo?.nickname || groupName;
    const color = groupInfo?.color || '#EC4899';
    const avatarImg = groupInfo?.avatar ? `<img src="${groupInfo.avatar}" alt="${nickname}" />` : `<span style="font-size:18px;">🎨</span>`;
    const statusLabel = data.status === 'done' ? '✅ 全部完成' : `🔄 生成中 (${data.assets?.length || 0}张)`;
    const statusClass = data.status === 'done' ? 'done' : 'working';

    const projectId = AppState.currentProjectId;
    const baseUrl = AppState.apiBaseUrl || '';

    const gridItems = (data.assets || []).map(asset => {
        const filename = asset.name || asset;
        const size = asset.size || '';
        const isImage = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(filename);
        let thumbContent = `<span style="font-size:20px;">📦</span>`;
        if (isImage && projectId) {
          const url = `${baseUrl}/projects/${projectId}/assets/${filename}?v=${
              Date.now()}`;
          thumbContent = `<img src="${url}" alt="${
              escapeHTML(filename)}" loading="lazy" />`;
        }
        return `<div class="asg-item" data-filename="${escapeHTML(filename)}" title="${escapeHTML(filename)}${size ? ' (' + size + ')' : ''}">
            <div class="asg-thumb">${thumbContent}</div>
            <div class="asg-name">${escapeHTML(filename.length > 16 ? filename.slice(0, 14) + '...' : filename)}</div>
            ${size ? `<div class="asg-size">${escapeHTML(size)}</div>` : ''}
        </div>`;
    }).join('');

    return `<div class="asset-gallery-card" data-group-name="${groupName}" data-agent-id="${data.agentId}">
        <div class="asg-header">
            <div class="asg-avatar">${avatarImg}</div>
            <div class="asg-info">
                <div class="asg-title" style="color:${color}">${nickname} · 素材交付</div>
                <div class="asg-summary">${escapeHTML(data.summary || '')}</div>
            </div>
            <div class="rsc-status ${statusClass}">${statusLabel}</div>
        </div>
        <div class="asg-grid">${gridItems}</div>
        <div class="rsc-actions">
            <button class="rsc-btn" data-action="view"><i class="fas fa-eye"></i> 查看全部素材</button>
            ${groupInfo?.canDirectChat !== false ? `<button class="rsc-btn primary" data-action="discuss"><i class="fas fa-comments"></i> 讨论 ↗</button>` : ''}
        </div>
    </div>`;
}

// ========================================
// B2: 消息折叠（超过 300 字 → 结构化分段展示）
// ========================================
const MSG_COLLAPSE_THRESHOLD = 300;

/** 从 raw text 自动提取 3-5 行摘要要点 */
function extractSummaryPoints(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const points = [];
    for (const line of lines) {
        // 优先提取标题 / 列表项 / 粗体句子
        if (line.startsWith('#') || line.startsWith('-') || line.startsWith('*') || line.startsWith('•') || /^\d+[\.\)、]/.test(line)) {
            const clean = line.replace(/^[#\-\*•\d\.\)、\s]+/, '').replace(/\*\*/g, '').trim();
            if (clean.length > 2 && clean.length < 80) points.push(clean);
        }
        if (points.length >= 4) break;
    }
    // 如果没提取到足够要点，取前 3 行
    if (points.length < 2) {
        const fallback = lines.slice(0, 3).map(l => l.replace(/^[#\-\*•\d\.\)、\s]+/, '').replace(/\*\*/g, '').trim()).filter(l => l.length > 2);
        return fallback.slice(0, 3);
    }
    return points.slice(0, 4);
}

/** 将长文按 markdown 标题拆分为多段 */
function splitByHeadings(rawText) {
    const lines = rawText.split('\n');
    const sections = [];
    let currentTitle = '';
    let currentIcon = '📋';
    let currentLines = [];

    // 标题→图标映射
    const iconMap = {
        '游戏': '🎮', '玩法': '🎮', '核心': '🎮', '创意': '💡',
        '设计': '🎨', '美术': '🎨', '视觉': '🎨', 'UI': '📱',
        '音效': '🎵', '音频': '🎵', '音乐': '🎵',
        '代码': '💻', '技术': '💻', '架构': '🏗️', '实现': '⚙️', '工程': '⚙️',
        '测试': '🔍', '质量': '🔍', '审核': '✅',
        '进度': '📊', '时间': '⏱️', '计划': '📋', '总结': '📝',
        '关卡': '🗺️', '系统': '⚙️', '经济': '💰', '叙事': '📖', '故事': '📖',
    };

    function getIconForTitle(title) {
        for (const [keyword, icon] of Object.entries(iconMap)) {
            if (title.includes(keyword)) return icon;
        }
        return '📋';
    }

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
        if (headingMatch) {
            // 存储之前的段
            if (currentLines.length > 0 || currentTitle) {
                sections.push({ title: currentTitle, icon: currentIcon, content: currentLines.join('\n').trim() });
            }
            currentTitle = headingMatch[2].replace(/\*\*/g, '').trim();
            currentIcon = getIconForTitle(currentTitle);
            currentLines = [];
        } else {
            currentLines.push(line);
        }
    }
    // 最后一段
    if (currentLines.length > 0 || currentTitle) {
        sections.push({ title: currentTitle, icon: currentIcon, content: currentLines.join('\n').trim() });
    }

    return sections;
}

/**
 * 消息分层：长文自动按标题分段展示
 * 每段可独立展开/收起，第一段默认展开
 */
function wrapWithCollapse(html, rawText) {
    if (!rawText || rawText.length <= MSG_COLLAPSE_THRESHOLD) return html;

    const collapsedId =
        'collapse_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

    // 统计信息
    const wordCount = rawText.length;
    const headingCount = (rawText.match(/^#+\s/gm) || []).length;
    const listCount = (rawText.match(/^[\-\*•]\s/gm) || []).length;
    let statsText = `${wordCount}字`;
    if (headingCount > 0) statsText += ` · ${headingCount}个章节`;
    if (listCount > 0) statsText += ` · ${listCount}项`;

    // 统一用摘要卡片模式：提取要点 + "查看完整方案"按钮（完整内容在评审区）
    const points = extractSummaryPoints(rawText);
    const pointsHTML = points.map(p => `<li>${escapeHTML(p)}</li>`).join('');
    return `<div class="msg-summary-card" id="${collapsedId}">
        <div class="msg-summary-points"><ul>${pointsHTML}</ul></div>
        <div class="msg-summary-meta"><i class="fas fa-file-lines"></i> ${statsText}</div>
        <button class="msg-collapse-toggle" data-collapse-id="${collapsedId}" data-mode="collapsed">
            <i class="fas fa-arrow-up-right-from-square"></i> 在评审区查看完整方案
        </button>
    </div>`;
}

/** 切换方案分段的展开/收起 */
function toggleMsgSection(sectionId) {
    const card = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!card) return;
    const body = card.querySelector('.msg-section-body');
    const chevron = card.querySelector('.msg-section-chevron');
    const preview = card.querySelector('.msg-section-preview');
    const isExpanded = card.classList.contains('expanded');

    if (isExpanded) {
        card.classList.remove('expanded');
        body.style.display = 'none';
        chevron.className = 'fas fa-chevron-down msg-section-chevron';
        if (preview) preview.style.display = '';
    } else {
        card.classList.add('expanded');
        body.style.display = '';
        chevron.className = 'fas fa-chevron-up msg-section-chevron';
        if (preview) preview.style.display = 'none';
    }
}

// ========================================
// 仿真生成流程
// ========================================
async function simulateMultiAgentGeneration(prompt, mentioned) {
    const _originSessionId = getCapturedSessionId();
    setSessionGenerating(_originSessionId, true);
    addUserMessage(prompt, mentioned);

    await delay(800);
    if (!getSessionGenerating(_originSessionId)) return;

    const gameType = prompt.includes('贪吃蛇') ? '贪吃蛇'
                     : prompt.includes('射击') ? '太空射击'
                     : prompt.includes('翻牌') ? '记忆翻牌'
                     : prompt.includes('跑酷') ? '跑酷'
                                               : '小游戏';

    const task = getCurrentTask();
    task.phase = 'plan_confirm';
    const subtaskDefs = getAgentSubtasks();
    // 兼容：subtaskDefs 可能用旧 key (artist/sound/engineer) 或新 key
    const legacySubtaskMap = { 'art-director': 'artist', 'sound-designer': 'sound', 'prototyper': 'engineer' };
    ['art-director', 'sound-designer', 'prototyper'].forEach(aid => {
      const legacyKey = legacySubtaskMap[aid] || aid;
      const defs = subtaskDefs[aid] || subtaskDefs[legacyKey] || [];
      task.agentSubtasks[aid] = defs.map(st => ({...st, status : 'pending'}));
    });

    const detectedDim = detectGameDimension(prompt);
    const detectedStyle = detectGameStyle(prompt);

    // 阶段1: 需求分析
    const dimText = detectedDim || '2D';
    const styleText = detectedStyle || '像素';
    addGroupMessage('coordinator', `🔍 **正在分析需求...**\n\n检测到游戏类型: ${gameType}\n维度: ${dimText}\n风格: ${styleText}风格`);

    await delay(1500);
    if (!getSessionGenerating(_originSessionId)) return;

    // 阶段2: 弹出选择题让用户确认维度和风格
    addGroupMessage('coordinator', `请确认一下游戏的基本参数：`);
    await delay(500);
    addGroupMessage('coordinator', '', 'req_picker', {
        gameType,
        dimensions : [ '2D', '3D' ],
        styles : [ '像素', '卡通', '赛博朋克', '简约', '可爱', '复古' ],
        hideDimension : !!detectedDim,
        hideStyle : !!detectedStyle,
        prefilledDimension : detectedDim,
        prefilledStyle : detectedStyle,
        mentioned,
    });
}

// ========================================
// AI 输出 → 白板卡片归类系统
// ========================================

/**
 * 收集所有 Agent 输出，统一归类到四张固定卡片
 */
const PlanCardCollector = {
    // 累积的原始内容
    _rawContents: [],
    // 四类归类桶
    _plan: [],     // 策划相关（玩法、角色、关卡、数值、道具、操控）
    _art: [],      // 美术相关（风格、配色、UI、动画、特效）
    _sound: [],    // 音效相关（BGM、SFX、音频）
    _assets: [],   // 资产清单（素材列表、产出清单、文件列表）
    _cardsCreated: false,

    reset() {
        this._rawContents = [];
        this._plan = [];
        this._art = [];
        this._sound = [];
        this._assets = [];
        this._cardsCreated = false;
    },

    /**
     * 接收一个 Agent 的完整输出，解析并归类
     */
    addAgentOutput(agentId, content) {
        this._rawContents.push({ agentId, content });
        this._classifyContent(content);
        this._renderCards();
    },

    /**
     * 把内容按段落/标题分类到四个桶
     */
    _classifyContent(text) {
        const lines = text.split('\n');
        let currentCategory = null; // 'plan' | 'art' | 'sound' | 'assets'
        let currentTitle = '';
        let currentItems = [];

        const flush = () => {
            if (currentTitle && currentItems.length > 0) {
                const bucket = this._getBucket(currentCategory);
                bucket.push({ title: currentTitle, items: [...currentItems] });
            }
            currentItems = [];
        };

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // 检测标题行
            const titleMatch = trimmed.match(/^#{1,3}\s+(.+)/) ||
                               trimmed.match(/^\*\*(.+?)\*\*\s*$/) ||
                               trimmed.match(/^(?:\d+[\.\)、]|[一二三四五六七八九十]+[、\.])\s*\*?\*?(.+?)\*?\*?\s*$/);

            if (titleMatch) {
                flush();
                currentTitle = (titleMatch[1] || '').replace(/\*\*/g, '').trim();
                currentCategory = this._guessCategory(currentTitle);
            } else if (currentTitle) {
                let itemText = trimmed
                    .replace(/^[-•*]\s+/, '')
                    .replace(/^\d+[\.\)]\s+/, '')
                    .replace(/\*\*/g, '')
                    .trim();
                if (itemText.length > 2) {
                    currentItems.push(itemText);
                }
            } else {
                // 没有标题的内容，根据关键词猜测分类
                const cat = this._guessCategoryFromLine(trimmed);
                if (cat) {
                    currentCategory = cat;
                    currentTitle = currentTitle || this._defaultTitle(cat);
                }
                let itemText = trimmed.replace(/^[-•*]\s+/, '').replace(/\*\*/g, '').trim();
                if (itemText.length > 2) {
                    currentItems.push(itemText);
                }
            }
        }
        flush();
    },

    _guessCategory(title) {
        const t = title.toLowerCase();
        if (/音效|音频|bgm|sfx|音乐|声音|sound/.test(t)) return 'sound';
        if (/美术|视觉|风格|配色|ui|界面|画面|设计稿|色彩|动画|特效|粒子/.test(t)) return 'art';
        if (/资产|素材|清单|产出|交付|文件|资源|asset/.test(t)) return 'assets';
        // 默认归策划
        return 'plan';
    },

    _guessCategoryFromLine(line) {
        const t = line.toLowerCase();
        if (/bgm|sfx|音效|音乐/.test(t)) return 'sound';
        if (/配色|色彩|像素|卡通|ui|hud/.test(t)) return 'art';
        if (/资产|素材|sprite|png|jpg/.test(t)) return 'assets';
        return null;
    },

    _defaultTitle(cat) {
        return { plan: '游戏设计', art: '美术风格', sound: '音效设计', assets: '资产清单' }[cat] || '其他';
    },

    _getBucket(cat) {
        if (cat === 'sound') return this._sound;
        if (cat === 'art') return this._art;
        if (cat === 'assets') return this._assets;
        return this._plan;
    },

    /**
     * 渲染/更新四张固定卡片
     */
    _renderCards() {
        // ★ 直接操作 reviewContent DOM，确保容器存在
        const reviewContent = document.getElementById('reviewContent');
        if (!reviewContent) { console.warn('[PlanCardCollector] reviewContent not found'); return; }

        // 确保白板容器存在
        let area = document.getElementById('wbCardsArea');
        if (!area) {
            reviewContent.innerHTML = `<div class="whiteboard-container" id="whiteboardContainer"><div id="wbCardsArea"></div></div>`;
            area = document.getElementById('wbCardsArea');
        }
        if (!area) return;

        // 清空旧卡片
        area.innerHTML = '';

        const cardConfigs = [
            {
                id: 'plan-card', type: 'plan', icon: '📋',
                title: '策划方案', subtitle: '玩法 · 角色 · 关卡 · 数值',
                accentColor: '#F59E0B', bucket: this._plan,
            },
            {
                id: 'art-card', type: 'art', icon: '🎨',
                title: '美术方案', subtitle: '风格 · 配色 · UI · 动画',
                accentColor: '#EC4899', bucket: this._art,
            },
            {
                id: 'sound-card', type: 'sound', icon: '🎵',
                title: '音效方案', subtitle: 'BGM · SFX · 音频',
                accentColor: '#06B6D4', bucket: this._sound,
            },
            {
                id: 'assets-card', type: 'assets', icon: '📦',
                title: '资产清单', subtitle: '素材 · 产出物 · 交付件',
                accentColor: '#8B5CF6', bucket: this._assets,
            },
        ];

        let cardsAdded = 0;
        for (const cfg of cardConfigs) {
            if (cfg.bucket.length === 0) continue;

            const sections = cfg.bucket.map(s => ({
                icon: guessSectionIcon(s.title),
                title: s.title,
                items: s.items.slice(0, 12),
            }));

            const tags = this._extractTags(cfg.bucket, cfg.type);

            const tagsHtml = tags.map(t =>
                `<span class="plan-tag${t.highlight ? ' highlight' : ''}"><i class="${t.icon || 'fas fa-tag'}"></i> ${t.text}</span>`
            ).join('');

            const sectionsHtml = sections.map(s => `
                <div class="plan-section">
                    <div class="plan-section-title"><i class="${s.icon || 'fas fa-circle'}"></i> ${s.title}</div>
                    <div class="plan-section-content">
                        <ul>${s.items.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>
                </div>
            `).join('');

            // 匹配对应 AI 角色
            const _cardAgentMap = { plan: '策划', art: '美术', sound: '音效', assets: '策划' };
            const _cardGroupName = _cardAgentMap[cfg.type] || '策划';
            const _cardGroupInfo = AGENT_GROUPS[_cardGroupName] || {};
            const _cardNickname = _cardGroupInfo.nickname || _cardGroupName;
            const _canChat = _cardGroupInfo.canDirectChat !== false;

            const card = document.createElement('div');
            card.className = 'plan-card animate-in';
            card.dataset.cardType = cfg.type;
            card.dataset.groupName = _cardGroupName;
            card.style.setProperty('--card-accent', cfg.accentColor);
            card.innerHTML = `
                <div class="plan-card-header">
                    <div class="plan-card-icon">${cfg.icon}</div>
                    <div class="plan-card-meta">
                        <div class="plan-card-title">${cfg.title}</div>
                        <div class="plan-card-subtitle">${cfg.subtitle} · AI 生成</div>
                    </div>
                    <button class="plan-card-toggle" title="展开/收起"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="plan-card-tags">${tagsHtml}</div>
                <div class="plan-card-body">
                    ${sectionsHtml}
                    <div class="plan-card-actions">
                        <button class="plan-card-action-btn edit-btn" data-action="edit-card" title="编辑方案">
                            <i class="fas fa-pen-to-square"></i> 编辑
                        </button>
                        ${_canChat ? `<button class="plan-card-action-btn chat-btn" data-action="chat-agent" data-group="${_cardGroupName}" title="与${_cardNickname}详聊">
                            <i class="fas fa-comments"></i> 与${_cardNickname}详聊
                        </button>` : ''}
                        <button class="plan-card-action-btn publish-btn" data-action="republish" title="重新发布" style="display:none;">
                            <i class="fas fa-paper-plane"></i> 重新发布
                        </button>
                    </div>
                </div>
            `;
            // 展开/收起
            card.addEventListener('click', (e) => {
                if (e.target.closest('.plan-card-body a')) return;
                if (e.target.closest('.plan-card-actions')) return;
                if (e.target.closest('.plan-card-body') && card.classList.contains('editing')) return;
                card.classList.toggle('expanded');
            });
            // 编辑按钮
            card.querySelector('[data-action="edit-card"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                _enterCardEditMode(card, cfg);
            });
            // 与 AI 详聊按钮
            card.querySelector('[data-action="chat-agent"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const gn = e.currentTarget.dataset.group;
                if (gn) openMemberChat(gn);
            });
            // 重新发布按钮
            card.querySelector('[data-action="republish"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                _republishCard(card, cfg);
            });
            area.appendChild(card);
            cardsAdded++;
        }

        // 没有卡片则显示空状态
        if (cardsAdded === 0) {
            area.innerHTML = `<div class="whiteboard-empty" id="wbEmpty"><i class="fas fa-note-sticky"></i><p>方案将以卡片形式展示在这里<br>发送游戏需求后，策划和美术会各自贴出方案</p></div>`;
        }

        // 自动展开方案面板
        if (cardsAdded > 0) {
            const panel = document.getElementById('reviewPanel');
            if (panel && panel.classList.contains('collapsed')) {
                toggleReviewPanel(true);
            }
        }

        if (!this._cardsCreated && Whiteboard.cards.length > 0) {
            this._cardsCreated = true;
        }
    },

    _extractTags(bucket, type) {
        const tags = [];
        const allText = bucket.map(s => s.items.join(' ')).join(' ').toLowerCase();

        // 风格标签
        const styles = ['像素', '卡通', '写实', '赛博朋克', '霓虹', '简约', '可爱', '复古'];
        for (const s of styles) {
            if (allText.includes(s)) { tags.push({ icon: 'fas fa-palette', text: s + '风', highlight: true }); break; }
        }
        if (/3d|三维/.test(allText)) tags.push({ icon: 'fas fa-cube', text: '3D' });
        else if (/2d|二维/.test(allText)) tags.push({ icon: 'fas fa-cube', text: '2D' });

        // 类型特征
        if (type === 'plan') {
            if (/道具/.test(allText)) tags.push({ icon: 'fas fa-star', text: '道具系统' });
            if (/boss/i.test(allText)) tags.push({ icon: 'fas fa-skull', text: 'BOSS战' });
        } else if (type === 'art') {
            if (/粒子|特效/.test(allText)) tags.push({ icon: 'fas fa-wand-magic-sparkles', text: '特效' });
        } else if (type === 'assets') {
            const count = bucket.reduce((n, s) => n + s.items.length, 0);
            tags.push({ icon: 'fas fa-images', text: `${count}项素材` });
        }
        return tags;
    },
};

/** 进入卡片编辑模式：section 内容变为可编辑 textarea */
function guessSectionIcon(title) {
    const t = (title || '').toLowerCase();
    if (/玩法|核心|游戏/.test(t)) return 'fas fa-gamepad';
    if (/角色|人物|敌人/.test(t)) return 'fas fa-users';
    if (/关卡|地图|场景/.test(t)) return 'fas fa-map';
    if (/美术|视觉|风格|配色/.test(t)) return 'fas fa-palette';
    if (/ui|界面|菜单/.test(t)) return 'fas fa-mobile-screen';
    if (/音效|音频|bgm|音乐/.test(t)) return 'fas fa-music';
    if (/动画|特效|粒子/.test(t)) return 'fas fa-wand-magic-sparkles';
    if (/数值|经济|系统/.test(t)) return 'fas fa-gears';
    if (/道具|物品|装备/.test(t)) return 'fas fa-star';
    if (/操控|控制|输入/.test(t)) return 'fas fa-hand-pointer';
    if (/素材|资产|文件/.test(t)) return 'fas fa-images';
    return 'fas fa-circle';
}

/** 进入卡片编辑模式：section 内容变为可编辑 textarea */
function _enterCardEditMode(cardEl, cfg) {
    if (cardEl.classList.contains('editing')) return;
    // 确保卡片展开
    if (!cardEl.classList.contains('expanded')) cardEl.classList.add('expanded');
    cardEl.classList.add('editing');

    // 把 plan-section-content 中的 <ul>/<li> 改为 textarea
    cardEl.querySelectorAll('.plan-section').forEach(section => {
        const contentEl = section.querySelector('.plan-section-content');
        if (!contentEl) return;
        const items = Array.from(contentEl.querySelectorAll('li')).map(li => li.textContent.trim());
        const textarea = document.createElement('textarea');
        textarea.className = 'plan-section-textarea';
        textarea.value = items.join('\n');
        textarea.rows = Math.max(3, items.length);
        contentEl.innerHTML = '';
        contentEl.appendChild(textarea);
        textarea.addEventListener('click', (e) => e.stopPropagation());
    });

    // 标题也可编辑
    const titleEl = cardEl.querySelector('.plan-card-title');
    if (titleEl) {
        titleEl.contentEditable = 'true';
        titleEl.classList.add('editable');
    }

    // 显示重新发布按钮，隐藏编辑按钮
    const editBtn = cardEl.querySelector('[data-action="edit-card"]');
    const publishBtn = cardEl.querySelector('[data-action="republish"]');
    if (editBtn) editBtn.style.display = 'none';
    if (publishBtn) publishBtn.style.display = '';
}

/** 退出编辑模式并重新发布 */
function _republishCard(cardEl, cfg) {
    cardEl.classList.remove('editing');

    // 收集编辑后的内容
    const sections = [];
    cardEl.querySelectorAll('.plan-section').forEach(section => {
        const titleEl = section.querySelector('.plan-section-title');
        const textarea = section.querySelector('.plan-section-textarea');
        if (titleEl && textarea) {
            const items = textarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const title = titleEl.textContent.trim();
            sections.push({ title, items });

            // 恢复 textarea → ul/li
            const contentEl = section.querySelector('.plan-section-content');
            if (contentEl) {
                contentEl.innerHTML = `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
        }
    });

    // 标题不可编辑
    const titleEl = cardEl.querySelector('.plan-card-title');
    if (titleEl) {
        titleEl.contentEditable = 'false';
        titleEl.classList.remove('editable');
    }

    // 更新 PlanCardCollector 的桶数据
    const cardType = cardEl.dataset.cardType;
    if (cardType && PlanCardCollector['_' + cardType]) {
        PlanCardCollector['_' + cardType] = sections.map(s => ({
            title: s.title,
            items: s.items,
        }));
    }

    // 切换按钮显示
    const editBtn = cardEl.querySelector('[data-action="edit-card"]');
    const publishBtn = cardEl.querySelector('[data-action="republish"]');
    if (editBtn) editBtn.style.display = '';
    if (publishBtn) publishBtn.style.display = 'none';

    // Toast 提示
    _showImportToast('方案已更新发布');
}

/** 打开团队成员的聊天页面（带卡片 + 聊天框） */
function openMemberChat(groupName) {
    const groupInfo = AGENT_GROUPS[groupName];
    if (!groupInfo) return;

    // 关闭素材视图
    if (AppState.activeAssetView) AppState.activeAssetView = false;

    AppState.activeMemberView = groupName;
    const nickname = groupInfo.nickname || groupName;
    const state = AppState.roleStates[groupName] || 'idle';
    const stateLabel = state === 'working' ? '工作中' : state === 'done' ? '已完成' : '待命中';
    const stateClass = state === 'working' ? 'working' : state === 'done' ? 'done' : 'idle';

    // 更新 header
    if (DOM.chatPanelTitle) {
        const avatarHTML = groupInfo.avatar
            ? `<img src="${groupInfo.avatar}" class="mp-header-avatar" />`
            : `<span class="mp-header-avatar-fb" style="background:${groupInfo.color}"><i class="fas ${groupInfo.icon}" style="color:#fff;font-size:11px;"></i></span>`;
        DOM.chatPanelTitle.innerHTML = `${avatarHTML}<div class="mp-header-text"><span class="mp-header-name">${escapeHTML(nickname)}</span><span class="mp-header-role">${escapeHTML(groupInfo.personality || groupInfo.desc)}</span></div><span class="mp-header-state ${stateClass}"><span class="mp-state-dot ${stateClass}"></span>${stateLabel}</span>`;
    }

    // ★ 显示输入框（聊天模式）
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    if (inputWrapper) inputWrapper.style.display = '';
    if (DOM.chatInput) {
        DOM.chatInput.placeholder = `跟${nickname}说点什么... Enter 发送`;
    }

    // 渲染成员聊天页面
    renderMemberChatView(groupName);
    renderConvList();
}

/** 渲染成员聊天页面：顶部对应卡片 + 聊天消息 + 建议话题 */
function renderMemberChatView(groupName) {
    const container = DOM.chatMessages;
    if (!container) return;
    container.innerHTML = '';

    const groupInfo = AGENT_GROUPS[groupName];
    if (!groupInfo) return;
    const nickname = groupInfo.nickname || groupName;

    // ===== 1. 对应的方案卡片（如果有） =====
    const _cardTypeMap = { '策划': 'plan', '美术': 'art', '音效': 'sound' };
    const cardType = _cardTypeMap[groupName];
    let cardHTML = '';
    if (cardType) {
        // 优先从 PlanCardCollector 读，空则从 Whiteboard.cards fallback
        let bucket = PlanCardCollector['_' + cardType] || [];
        if (bucket.length === 0 && Whiteboard.cards && Whiteboard.cards.length > 0) {
            const wbCard = Whiteboard.cards.find(c => c.type === cardType);
            if (wbCard && wbCard.sections) {
                bucket = wbCard.sections.map(s => ({ title: s.title || '', items: (s.items || []).slice() }));
            }
        }
        if (bucket.length > 0) {
            const sectionsHTML = bucket.map(s => `
                <div class="mc-card-section">
                    <div class="mc-card-section-title">${escapeHTML(s.title)}</div>
                    <ul>${s.items.slice(0, 8).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
                    ${s.items.length > 8 ? `<div class="mc-card-more">+ ${s.items.length - 8} 项更多</div>` : ''}
                </div>
            `).join('');

            const _cardIconMap = { plan: '📋', art: '🎨', sound: '🎵' };
            const _cardTitleMap = { plan: '策划方案', art: '美术方案', sound: '音效方案' };

            cardHTML = `
                <div class="mc-plan-card" data-card-type="${cardType}">
                    <div class="mc-plan-card-header">
                        <span class="mc-plan-card-icon">${_cardIconMap[cardType] || '📋'}</span>
                        <span class="mc-plan-card-title">${_cardTitleMap[cardType] || '方案'}</span>
                        <button class="mc-plan-card-toggle"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="mc-plan-card-body" style="display:none;">${sectionsHTML}</div>
                </div>`;
        }
    }

    // ===== 2. 聊天消息区 =====
    // 从 session.messages 中提取该角色相关的消息
    const session = getCurrentGroupSession();
    const groupAgentIds = Object.keys(AGENTS).filter(aid => AGENTS[aid].group === groupName);
    let chatMessagesHTML = '';
    if (session) {
        const relevantMsgs = session.messages.filter(msg => {
            if (msg.isUser || msg.type === 'user') {
                // 用户消息：检查是否 @了这个角色
                return msg.mentioned?.some(aid => groupAgentIds.includes(aid)) ||
                       (msg.content && msg.content.includes(`@${nickname}`)) ||
                       (msg.content && msg.content.includes(`@${groupName}`));
            }
            return groupAgentIds.includes(msg.agentId);
        }).slice(-20); // 最近 20 条

        chatMessagesHTML = relevantMsgs.map(msg => {
            if (msg.isUser || msg.type === 'user') {
                return `<div class="mc-msg mc-msg-user">
                    <div class="mc-msg-content">${escapeHTML(msg.content || '')}</div>
                    <div class="mc-msg-time">${msg.time || ''}</div>
                </div>`;
            }
            const agent = getAgent(msg.agentId);
            return `<div class="mc-msg mc-msg-ai">
                <div class="mc-msg-avatar" style="background:${groupInfo.color}22;color:${groupInfo.color}">
                    ${groupInfo.avatar ? `<img src="${groupInfo.avatar}" />` : `<i class="fas ${groupInfo.icon}"></i>`}
                </div>
                <div class="mc-msg-body">
                    <div class="mc-msg-content">${renderMarkdown(msg.content || '')}</div>
                    <div class="mc-msg-time">${msg.time || ''}</div>
                </div>
            </div>`;
        }).join('');
    }

    // ===== 3. 建议话题（如果没有聊天消息） =====
    const suggestions = _getMemberIdleSuggestions(groupName);
    const suggestionsHTML = chatMessagesHTML ? '' : `
        <div class="mc-suggestions">
            <div class="mc-suggestions-title"><i class="fas fa-lightbulb"></i> 你可以问${nickname}</div>
            ${suggestions.map(s => `
                <button class="mc-suggestion-chip" data-prompt="${escapeHTML(s.prompt)}">
                    <span class="mc-suggestion-emoji">${s.emoji}</span>
                    <span class="mc-suggestion-text">${escapeHTML(s.label)}</span>
                </button>
            `).join('')}
        </div>`;

    container.innerHTML = `
        <div class="member-chat-container" data-group="${groupName}">
            ${cardHTML}
            <div class="mc-chat-area">
                ${chatMessagesHTML || `<div class="mc-empty-chat">
                    <div class="mc-empty-avatar" style="background:${groupInfo.color}22">
                        ${groupInfo.avatar ? `<img src="${groupInfo.avatar}" />` : `<i class="fas ${groupInfo.icon}" style="color:${groupInfo.color};font-size:28px;"></i>`}
                    </div>
                    <div class="mc-empty-name">${escapeHTML(nickname)}</div>
                    <div class="mc-empty-desc">${escapeHTML(groupInfo.personality || groupInfo.desc || '')}</div>
                </div>`}
                ${suggestionsHTML}
            </div>
        </div>`;

    // 绑定卡片展开/收起
    container.querySelector('.mc-plan-card-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const body = container.querySelector('.mc-plan-card-body');
        const icon = e.currentTarget.querySelector('i');
        if (body) {
            const show = body.style.display === 'none';
            body.style.display = show ? '' : 'none';
            if (icon) icon.className = show ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    });
    container.querySelector('.mc-plan-card-header')?.addEventListener('click', () => {
        container.querySelector('.mc-plan-card-toggle')?.click();
    });

    // 绑定建议话题 → 填入输入框
    container.querySelectorAll('.mc-suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (DOM.chatInput) {
                DOM.chatInput.value = chip.dataset.prompt;
                DOM.chatInput.focus();
            }
        });
    });
}

/**
 * 将 AI Agent 的输出收集并归类到四张卡片
 */
function parseAgentOutputToCard(agentId, content) {
    if (!content || content.length < 100) return;
    PlanCardCollector.addAgentOutput(agentId, content);
}

async function confirmRequirementPick(dim, style, gameType, mentioned, useRealAPI, originalPrompt) {
    addSystemMessage(`已确认：${dim} · ${style}风格`);
    const gt = gameType || '小游戏';

    // 初始化白板
    Whiteboard.init();
    Whiteboard.clear();

    // ★ Real API 模式：把维度和风格加到 prompt 里，调 Real API 获取方案（不生成游戏）
    if (useRealAPI && originalPrompt) {
        const enhancedPrompt = `${originalPrompt}\n\n游戏参数：${dim}，${style}风格，游戏类型：${gt}`;
        // 调用 Real API，卡片会通过 stream_delta done 自动生成
        realMultiAgentGeneration(enhancedPrompt, mentioned || []);
        return;
    }

    // ★ 仿真模式：使用预设卡片内容

    // 策划方案卡片
    addGroupMessage('coordinator', `📋 **策划正在撰写方案...**`);
    await delay(1200);

    addGroupMessage('coordinator', `✅ **策划方案已就绪** — 请查看方案面板`);
    Whiteboard.addCard({
        id: 'plan-' + Date.now(),
        type: 'plan',
        icon: '📋',
        title: `${gt} — 策划方案`,
        subtitle: '策划 · 灵灵',
        accentColor: '#F59E0B',
        tags: [
            { icon: 'fas fa-gamepad', text: gt, highlight: true },
            { icon: 'fas fa-cube', text: dim },
            { icon: 'fas fa-palette', text: style + '风格' },
            { icon: 'fas fa-heart', text: '3条命' },
            { icon: 'fas fa-chart-line', text: '难度递增' },
            { icon: 'fas fa-bolt', text: '道具系统' },
        ],
        sections: [
            {
                icon: 'fas fa-crosshairs',
                title: '核心玩法',
                items: [
                    '玩家操控角色完成核心挑战，累积分数',
                    '存活时间越长，难度递增（每30秒速度+10%）',
                    '3次生命机会，挑战最高分记录',
                ]
            },
            {
                icon: 'fas fa-users',
                title: '角色设计',
                items: [
                    '🚀 主角 — 速度 6px/帧，碰撞 32×32',
                    '👾 小型敌人 — 血量1，分值10，移动快',
                    '🛸 中型敌人 — 血量2，分值20，移动中',
                    '💀 BOSS — 血量5，分值50，移动慢',
                ]
            },
            {
                icon: 'fas fa-star',
                title: '道具系统',
                items: [
                    '⭐ 护盾 — 免疫一次伤害',
                    '💊 回复 — 恢复1点生命',
                    '⚡ 强化 — 双倍火力10秒',
                ]
            },
        ]
    });

    await delay(1200);

    // 美术方案卡片
    addGroupMessage('coordinator', `📋 策划方案已交付美术和音效，各团队开始并行工作...`);
    await delay(1000);

    addGroupMessage('coordinator', `🎨 **美术方案已就绪** — 请查看方案面板`);
    await delay(400);
    Whiteboard.addCard({
        id: 'art-' + Date.now(),
        type: 'art',
        icon: '🎨',
        title: `${gt} — 美术方案`,
        subtitle: '美术 · 绘绘',
        accentColor: '#EC4899',
        tags: [
            { icon: 'fas fa-palette', text: style + '风', highlight: true },
            { icon: 'fas fa-expand', text: dim },
            { icon: 'fas fa-moon', text: '霓虹配色' },
            { icon: 'fas fa-wand-magic-sparkles', text: '粒子特效' },
            { icon: 'fas fa-images', text: '12+ 素材' },
        ],
        sections: [
            {
                icon: 'fas fa-eye',
                title: '整体风格',
                items: [
                    `${style}风${dim}画面，16:9 宽屏适配`,
                    '霓虹配色主题：深蓝背景 + 荧光色点缀',
                    '粒子特效：爆炸、尾焰、星空背景',
                ]
            },
            {
                icon: 'fas fa-layer-group',
                title: 'UI 设计',
                items: [
                    `开始界面 — ${style}风 LOGO + 开始按钮`,
                    'HUD — 左上角生命 / 右上角分数',
                    '结束界面 — 最终得分 + 再来一局',
                ]
            },
            {
                icon: 'fas fa-box-open',
                title: '美术资产清单',
                items: [
                    '角色素材 ×5',
                    'UI 素材 ×8',
                    '特效素材 ×3',
                ]
            },
        ]
    });

    await delay(800);

    // 音效方案卡片
    addGroupMessage('coordinator', `🎵 **音效方案已就绪** — 请查看方案面板`);
    await delay(400);
    Whiteboard.addCard({
        id: 'sound-' + Date.now(),
        type: 'sound',
        icon: '🎵',
        title: `${gt} — 音效方案`,
        subtitle: '音效 · 悦悦',
        accentColor: '#06B6D4',
        tags: [
            { icon: 'fas fa-music', text: '8-bit电子', highlight: true },
            { icon: 'fas fa-drum', text: 'BGM×2' },
            { icon: 'fas fa-volume-high', text: 'SFX×8' },
        ],
        sections: [
            {
                icon: 'fas fa-music',
                title: '背景音乐',
                items: [
                    '主菜单BGM：氛围感电子音乐',
                    '战斗BGM：8-bit电子风格，节奏紧凑',
                ]
            },
            {
                icon: 'fas fa-volume-high',
                title: '交互音效',
                items: [
                    '射击音效：激光射击声',
                    '爆炸音效：敌机击毁爆破',
                    '得分音效：金币拾取反馈',
                    '失败音效：低沉警告声',
                ]
            },
        ]
    });

    await delay(800);

    // 推荐资产包卡片
    addGroupMessage('coordinator', `📦 **推荐资产包已就绪** — 请查看方案面板`);
    await delay(400);
    Whiteboard.addCard({
        id: 'assets-' + Date.now(),
        type: 'assets',
        icon: '📦',
        title: `${gt} — 推荐资产包`,
        subtitle: '资产库 · 智能匹配',
        accentColor: '#8B5CF6',
        tags: [
            { icon: 'fas fa-palette', text: style + '风', highlight: true },
            { icon: 'fas fa-cube', text: dim },
            { icon: 'fas fa-images', text: '18+ 素材' },
            { icon: 'fas fa-check-circle', text: '风格统一' },
        ],
        sections: [
            {
                icon: 'fas fa-rocket',
                title: '角色素材',
                items: [
                    '🚀 玩家主角 ×1 — Sprite Sheet 含行走/攻击/死亡帧',
                    '👾 小型敌人 A/B ×2 — 含移动动画',
                    '🛸 中型敌人 ×1 — 含攻击特效',
                    '💀 BOSS ×1 — 含多阶段动画',
                ]
            },
            {
                icon: 'fas fa-mountain-sun',
                title: '场景与背景',
                items: [
                    '🌌 滚动背景 ×1 — 可无缝平铺',
                    '✨ 星云/装饰粒子 ×3',
                    '🏔️ 前景/中景图层 ×2 — 视差滚动',
                ]
            },
            {
                icon: 'fas fa-burst',
                title: '特效与 UI',
                items: [
                    '💥 爆炸动画 ×2 — 8帧 Sprite Sheet',
                    '🔫 子弹/轨迹 ×3 — 含发光效果',
                    '🛡️ 护盾光效 ×1',
                    '🎯 HUD 组件 — 血条/分数/按钮 ×6',
                ]
            },
            {
                icon: 'fas fa-volume-high',
                title: '配套音效',
                items: [
                    '🔊 射击音效 ×2',
                    '💣 爆炸音效 ×3',
                    '⭐ 得分/拾取音效 ×2',
                    '🎵 BGM ×1 — 循环背景音乐',
                ]
            },
        ]
    });

    // 方案确认消息
    await delay(600);
    addGroupMessage('coordinator', `✅ **所有方案已就绪！** 请在右侧方案面板查看并确认`, 'plan_confirm_inline');

    // ★ 同步仿真卡片数据到 PlanCardCollector 的桶（让码哥聊天页能读取到）
    _syncWhiteboardToPlanCollector();
}

/** 将 Whiteboard 中的仿真卡片数据同步到 PlanCardCollector 的分类桶 */
function _syncWhiteboardToPlanCollector() {
    PlanCardCollector.reset();
    Whiteboard.cards.forEach(card => {
        const type = card.type || 'plan';
        const bucket = PlanCardCollector['_' + type];
        if (!bucket) return;
        (card.sections || []).forEach(s => {
            bucket.push({
                title: s.title || '',
                items: (s.items || []).slice(),
            });
        });
    });
}

window.confirmPlan = async function() {
  clearPendingConfirms(AppState.currentSessionId);
  addSystemMessage('方案已确认，Agent 团队开始工作');
  autoSaveVersion('开始制作前自动保存');

  // 任务分发卡片
  addGroupMessage(
      'coordinator', `🚀 **任务已分发给 Agent 团队**

各 Agent 正在并行工作，实时进度可在页面顶部进度条查看

━━━━━━━━━━━━━━━━━━━━━━

**📋 任务分配**

👩‍🎨 **美术师**
• 设计视觉风格与配色方案
• 绘制角色精灵、UI组件
• 制作动画序列与粒子特效

🎧 **音效师**  
• 确定音效风格（8-bit电子风）
• 制作背景音乐（主菜单+战斗）
• 制作交互音效（射击、爆炸、得分）

👨‍💻 **工程师**
• 搭建游戏框架与场景系统
• 实现角色操控与射击系统
• 开发敌人AI与碰撞检测
• 接入计分系统与数据存储

━━━━━━━━━━━━━━━━━━━━━━

💡 点击页面顶部进度条可展开查看详细进度
💡 点击各 Agent 头像可进入单聊查看工作日志`,
      'dispatch', {
        tasks : [
          {
            agentId : 'art-director',
            desc : '视觉风格设计 → 角色绘制 → UI设计 → 动效制作'
          },
          {
            agentId : 'sound-designer',
            desc : '音效风格定义 → BGM制作 → SFX制作 → 混音优化'
          },
          {
            agentId : 'prototyper',
            desc : '框架搭建 → 操控系统 → 敌人系统 → 计分存储 → 性能优化'
          },
        ]
      });

  const task = getCurrentTask();
  if (!task) {
    setSessionGenerating(AppState.currentSessionId, false);
    return;
  }
  task.phase = 'agents_working';
  updateGlobalProgress();

  await delay(300);
  if (!getSessionGenerating(AppState.currentSessionId))
    return;

  await simulateAgentsWorking(task);
};

async function simulateAgentsWorking(task) {
    const agentIds = ['art-director', 'sound-designer', 'prototyper'];

    // 初始化详细日志（用于单聊页面展示）— 逐个 key 补齐，防止部分缺失
    if (!task.agentDetailLog) task.agentDetailLog = {};
    if (!task.agentAssets) task.agentAssets = {};
    for (const aid of agentIds) {
        if (!task.agentDetailLog[aid]) task.agentDetailLog[aid] = [];
        if (!task.agentAssets[aid]) task.agentAssets[aid] = [];
    }

    // 启动所有 Agent
    for (const aid of agentIds) {
        task.agentStatus[aid] = 'working';
    }
    // V31→V32: 更新角色状态（实时刷新侧边栏）
    AppState.roleStates['美术'] = 'working';
    AppState.roleStates['音效'] = 'working';
    AppState.roleStates['工程师'] = 'working';
    refreshTeamAndMemberView();
    insertStatusDivider('绘绘、乐乐、码哥 正在并行工作...');
    updateGlobalProgress();

    // 各阶段详细进展（存入 detailLog 供单聊查看）
    const detailLogs = {
      'art-director' : [
        {
          pct : 20,
          title : '🔍 确定视觉风格',
          detail : `**视觉风格定义**
• 主题: 暗色霓虹太空风
• 配色方案: 深蓝(#0a0e27)背景 + 青色(#00f5ff)/紫色(#bf00ff)霓虹点缀
• 像素尺寸: 32×32px 基础单位
• 参考作品: Celeste + Hyper Light Drifter

**设计原则**
• 统一像素密度,避免混搭
• 高对比度确保可读性
• 动态元素用亮色突出`,
          assets : []
        },
        {
          pct : 40,
          title : '🎨 绘制游戏角色',
          detail : `**角色设计完成**

🚀 **玩家战机** (32×32px)
• 主体: 青色流线型机身
• 引擎: 紫色尾焰动画
• 帧数: 静态 + 移动 2帧

👾 **敌机系列**
• 敌机A(小型): 红色三角 · 16×16px
• 敌机B(中型): 橙色菱形 · 24×24px  
• 敌机C(BOSS): 紫色六边形 · 48×48px

💫 **子弹系统**
• 玩家子弹: 青色激光 · 4×16px
• 敌机子弹: 红色光球 · 8×8px

✅ 共计 5 个角色精灵`,
          assets : [
            '🚀 飞船_主色.png', '🚀 飞船_移动.png', '👾 敌机A_小型.png',
            '🛸 敌机B_中型.png', '👾 敌机C_BOSS.png', '💫 子弹_玩家.png',
            '🔴 子弹_敌机.png'
          ]
        },
        {
          pct : 60,
          title : '🖼️ 设计UI组件',
          detail : `**UI 系统完成**

🎮 **开始界面**
• LOGO: 像素风"SPACE SHOOTER"标题
• 开始按钮: 霓虹边框 + hover 发光效果
• 背景: 星空粒子动画

📊 **HUD界面**
• 生命条: 3个心形图标(满/半/空)
• 得分板: 像素数字字体 · 右上角
• 暂停按钮: 透明度50% · 不遮挡视线

🏆 **结束界面**
• 最终得分: 大号像素数字居中
• 最高分: 金色标记
• 按钮: 再来一局 / 返回菜单

✅ 共计 8 个UI元素`,
          assets : [
            '🎮 LOGO_标题.png', '🎮 开始按钮.png', '📊 得分板_背景.png',
            '❤️ 生命条_满.png', '❤️ 生命条_半.png', '❤️ 生命条_空.png',
            '⏸️ 暂停按钮.png', '🏆 结算面板.png'
          ]
        },
        {
          pct : 80,
          title : '✨ 制作动效与粒子',
          detail : `**特效系统完成**

💥 **爆炸序列帧**
• 小型爆炸: 4帧 × 32×32px
• 中型爆炸: 6帧 × 48×48px
• BOSS爆炸: 8帧 × 64×64px
• 循环: 播放1次自动销毁

🔥 **尾焰动画**
• 飞船尾焰: 3帧循环 · 像素化
• 颜色渐变: 紫色→青色→透明
• 位置: 随飞船移动实时渲染

⭐ **粒子系统**
• 星空背景: 50个随机星点 · 缓慢漂移
• 得分粒子: 金色闪光 · 拾取时触发
• 护盾光环: 半透明青色波纹

✅ 共计 3 组动画序列`,
          assets : [
            '💥 爆炸_小型.png', '💥 爆炸_中型.png', '💥 爆炸_BOSS.png',
            '🔥 尾焰_序列帧.png', '⭐ 粒子_星空.png', '💫 粒子_得分.png',
            '🛡️ 特效_护盾.png'
          ]
        },
        {
          pct : 100,
          title : '📦 输出设计资产包',
          detail : `**资产打包完成**

📁 **素材清单** (共 25 张)
• 角色精灵: 7 张 PNG
• UI 组件: 8 张 PNG  
• 动画序列: 7 张 PNG
• 粒子特效: 3 张 PNG

⚙️ **技术规格**
• 分辨率: 2x 高清(适配 Retina)
• 格式: PNG-24 (透明通道)
• 命名: 规范化英文命名
• 总大小: 1.2MB (已压缩)

✅ 所有素材已导出并打包
📦 assets_pack_v1.zip 已就绪`,
          assets : [ '📦 assets_pack_v1.zip (25张素材)' ]
        },
      ],
      'sound-designer' : [
        {
          pct : 20,
          title : '🎵 确定音效风格',
          detail : `**音效风格定义**

🎹 **整体风格**: 8-bit 电子复古风
• 参考: Celeste + Cuphead + Undertale
• 乐器: 方波 + 锯齿波 + 正弦波
• 节奏: 快节奏电子鼓点

🎚️ **音色设计原则**
• BGM: 复古芯片音乐(Chiptune)
• SFX: 短促有力的电子音效
• 动态: 重要事件音效更响亮

🎯 **情感基调**
• 主菜单: 神秘探索感
• 战斗中: 紧张刺激感
• 得分时: 成就满足感`,
          assets : []
        },
        {
          pct : 40,
          title : '🎧 制作背景音乐',
          detail : `**BGM 制作完成**

🎵 **主菜单 BGM**
• 时长: 48秒(无缝循环)
• 节拍: 120 BPM
• 乐器: 方波主旋律 + 锯齿波和声
• 风格: 氛围电子 · 神秘探索
• 文件: menu_bgm.mp3 (1.2MB)

🎵 **战斗 BGM**
• 时长: 60秒(无缝循环)
• 节拍: 140 BPM (更紧张)
• 乐器: 快节奏鼓点 + 急促旋律
• 风格: 8-bit 电子 · 战斗激昂
• 文件: battle_bgm.mp3 (1.5MB)

✅ 2 首背景音乐已完成`,
          assets :
              [ '🎵 menu_bgm.mp3 (48s循环)', '🎵 battle_bgm.mp3 (60s循环)' ]
        },
        {
          pct : 60,
          title : '🔊 制作交互音效',
          detail : `**SFX 音效完成**

🔫 **射击音效**
• 玩家射击: laser_shoot.wav (0.2s)
• 敌机射击: enemy_shoot.wav (0.15s)
• 频率: 2000Hz → 500Hz 下降

💥 **爆炸音效** (3 种)
• 小型爆炸: explosion_small.wav (0.3s)
• 中型爆炸: explosion_medium.wav (0.5s)
• BOSS爆炸: explosion_boss.wav (1.0s)

🪙 **得分音效**
• 得分: score_pickup.wav (0.2s)
• 连击: combo_bonus.wav (0.3s)
• 频率: 1000Hz → 2000Hz 上升

⚡ **道具音效**
• 护盾: shield_up.wav (0.4s)
• 回血: heal.wav (0.3s)
• 强化: powerup.wav (0.5s)

✅ 共计 10 个交互音效`,
          assets : [
            '🔫 laser_shoot.wav', '🔫 enemy_shoot.wav',
            '💥 explosion_small.wav', '💥 explosion_medium.wav',
            '💥 explosion_boss.wav', '🪙 score_pickup.wav',
            '🪙 combo_bonus.wav', '⚡ shield_up.wav', '💊 heal.wav',
            '⚡ powerup.wav'
          ]
        },
        {
          pct : 80,
          title : '🎚️ 音频混音优化',
          detail : `**混音与优化完成**

📊 **音量归一化**
• BGM: -12dB (背景氛围)
• SFX: -6dB (清晰可辨)
• 爆炸: -3dB (强调冲击)
• 动态范围压缩至 12dB

🗜️ **压缩优化**
• 格式转换: 
  - BGM → MP3 (128kbps)
  - SFX → WAV (16-bit)
• 文件大小优化: 减少 40%
• 加载速度提升: 2.3MB → 1.4MB

🎧 **音质检查**
• 无爆音/失真
• 循环点无缝衔接
• 左右声道平衡

✅ 混音报告已生成`,
          assets : [ '📊 混音报告.md', '🎯 音频配置.json' ]
        },
        {
          pct : 100,
          title : '✅ 全部音频就绪',
          detail : `**音频资产打包完成**

📁 **最终清单** (共 12 个文件)

🎵 **背景音乐** (2 个)
• menu_bgm.mp3 (48s)
• battle_bgm.mp3 (60s)

🔊 **交互音效** (10 个)
• 射击音效 × 2
• 爆炸音效 × 3
• 得分音效 × 2
• 道具音效 × 3

⚙️ **技术规格**
• 总大小: 2.7MB (已压缩)
• 格式: MP3 + WAV 混合
• 采样率: 44.1kHz
• 位深度: 16-bit

✅ 所有音频已打包
📦 audio_pack_v1.zip 已就绪`,
          assets : [ '📦 audio_pack_v1.zip (12个音频)' ]
        },
      ],
      'prototyper' : [
        {
          pct : 20,
          title : '🏗️ 搭建游戏框架',
          detail : `**游戏架构搭建完成**

📁 **项目结构**
\`\`\`
game/
├── index.html      # 入口文件
├── engine.js       # 游戏引擎核心
├── scenes.js       # 场景管理
├── game.js         # 主游戏逻辑
└── utils.js        # 工具函数
\`\`\`

⚙️ **核心系统**
• **场景管理器**: MenuScene → GameScene → GameOverScene
• **游戏循环**: requestAnimationFrame 60fps
• **渲染器**: Canvas 2D 双缓冲
• **资源加载器**: 批量预加载 + 进度条

🔧 **工具函数**
• getRandomInt(min, max)
• checkCollision(rect1, rect2)
• distance(x1, y1, x2, y2)

✅ 基础框架已搭建完成`,
          assets :
              [ '📄 index.html', '📄 engine.js', '📄 scenes.js', '📄 utils.js' ]
        },
        {
          pct : 40,
          title : '🎮 实现角色操控',
          detail : `**玩家控制系统完成**

🕹️ **输入管理** (input.js)
• 键盘控制: WASD / 方向键
• 鼠标控制: 点击射击
• 触控适配: 虚拟摇杆 + 射击按钮
• 按键映射表已配置

🚀 **玩家类** (player.js)
\`\`\`javascript
class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 80;
    this.speed = 6;
    this.lives = 3;
    this.shootCooldown = 0;
  }
  
  update() { /* 移动逻辑 */ }
  shoot() { /* 射击逻辑 */ }
  render() { /* 渲染逻辑 */ }
}
\`\`\`

⚡ **射击系统**
• 冷却时间: 300ms
• 子弹速度: 10px/帧
• 子弹池: 对象池管理(避免频繁创建)
• 碰撞检测: AABB 矩形碰撞

✅ 玩家可操控移动和射击`,
          assets : [ '📄 input.js', '📄 player.js', '📄 bullet.js' ]
        },
        {
          pct : 60,
          title : '👾 敌人与碰撞系统',
          detail : `**敌人系统完成**

👾 **敌机类** (enemy.js)
\`\`\`javascript
class Enemy {
  constructor(type) {
    this.type = type; // 'small' | 'medium' | 'boss'
    this.hp = ENEMY_TYPES[type].hp;
    this.speed = ENEMY_TYPES[type].speed;
    this.score = ENEMY_TYPES[type].score;
  }
  
  update() { /* AI 移动逻辑 */ }
  shoot() { /* 敌机射击 */ }
  explode() { /* 爆炸效果 */ }
}
\`\`\`

🤖 **AI 行为**
• 生成规则: 每 1.5s 生成一波
• 移动模式: 
  - 小型: 直线下落
  - 中型: S 形走位
  - BOSS: 追踪玩家
• 射击概率: 20%/帧

💥 **碰撞检测** (collision.js)
• AABB 算法: 矩形碰撞检测
• 分区优化: 网格划分减少计算量
• 碰撞回调: 触发爆炸/扣血/得分

✅ 敌人系统和碰撞检测已完成`,
          assets : [ '📄 enemy.js', '📄 collision.js', '📄 explosion.js' ]
        },
        {
          pct : 80,
          title : '📊 计分与排行系统',
          detail : `**计分系统完成**

📊 **得分管理** (score.js)
\`\`\`javascript
class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.highScore = localStorage.getItem('highScore') || 0;
    this.combo = 0;
    this.comboTimer = 0;
  }
  
  addScore(points) {
    this.currentScore += points * (1 + this.combo * 0.1);
    this.combo++;
    this.updateHighScore();
  }
  
  updateHighScore() {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      localStorage.setItem('highScore', this.highScore);
    }
  }
}
\`\`\`

🏆 **连击系统**
• 连击窗口: 2秒内击杀敌机
• 连击加成: 每次连击 +10% 得分
• 最高连击显示

💾 **数据持久化**
• localStorage 存储最高分
• 玩家进度保存
• 音量设置记忆

🎨 **UI 显示** (ui.js)
• 实时得分: 右上角像素数字
• 生命条: 左上角心形图标
• 连击数: 屏幕中央提示

✅ 计分和排行系统已完成`,
          assets : [ '📄 score.js', '📄 ui.js', '📄 storage.js' ]
        },
        {
          pct : 100,
          title : '🚀 适配与性能优化',
          detail : `**性能优化完成**

📱 **多机型适配**
• 响应式画布: 
  \`\`\`javascript
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  \`\`\`
• 移动端触控: 虚拟摇杆 + 射击按钮
• 横竖屏适配: 自动调整布局

⚡ **性能优化**
• **对象池**: 
  - 子弹池(100个)
  - 敌机池(30个)
  - 爆炸池(20个)
  避免频繁创建/销毁对象

• **碰撞分区**:
  将画布划分为 16 个网格
  只检测同一网格内的碰撞
  性能提升 60%

• **渲染优化**:
  - 离屏 Canvas 缓存
  - 只渲染可视区域
  - requestAnimationFrame 降帧

📊 **性能数据**
• FPS: 稳定 60fps
• 内存占用: < 50MB
• 首次加载: 1.2s (含素材)

✅ 全机型适配优化完成
🎮 游戏已可正常运行`,
          assets : [ '📄 game.js (639行)', '📄 config.json', '📄 README.md' ]
        },
      ],
    };

    // 工程师在群聊播报的关键节点（只播报 40% 和 80% 两个里程碑）
    const engineerGroupMilestones = {
        40: '✅ **角色操控系统已完成**\n\n• 玩家可移动、射击\n• 碰撞检测就绪\n• 对象池管理子弹',
        80: '✅ **核心玩法已完成**\n\n• 敌人AI生成\n• 计分系统接入\n• 数据持久化\n• 全机型适配就绪',
    };

    const steps = [20, 40, 60, 80, 100];
    for (const pct of steps) {
        await delay(300);
        if (!getSessionGenerating(AppState.currentSessionId)) return;

        for (const aid of agentIds) {
            task.agentProgress[aid] = pct;
            const subtasks = task.agentSubtasks[aid];
            const doneCount = Math.floor(pct / 100 * subtasks.length);
            subtasks.forEach((st, i) => {
                if (i < doneCount) st.status = 'done';
                else if (i === doneCount) st.status = 'working';
                else st.status = 'pending';
            });

            // 记录详细日志（所有 agent 都记录，供单聊查看）
            const logEntry = detailLogs[aid]?.find(l => l.pct === pct);
            if (logEntry) {
                task.agentDetailLog[aid].push({
                    ...logEntry,
                    time: getTimeStr(),
                });
                // 累积素材列表
                if (logEntry.assets.length > 0) {
                    task.agentAssets[aid].push(...logEntry.assets);
                }
            }
        }

        // 群聊只播报工程师的关键里程碑
        if (engineerGroupMilestones[pct]) {
            addGroupMessage('prototyper', '', 'status_inline', {
                agentId: 'prototyper',
                status: 'working',
                pct: pct,
                text: engineerGroupMilestones[pct],
            });
        }

        // V33: 每步刷新角色状态面板 + 成员详情页
        refreshTeamAndMemberView();
        updateGlobalProgress();
        scrollToBottom();
    }

    // 所有任务完成
    for (const aid of agentIds) {
        task.agentStatus[aid] = 'done';
        task.agentProgress[aid] = 100;
        task.agentSubtasks[aid].forEach(st => st.status = 'done');
    }

    task.status = 'completed';
    task.phase = 'completed';
    setSessionGenerating(AppState.currentSessionId, false);
    updateInputPlaceholder();
    processSessionPendingMessages(AppState.currentSessionId);
    DOM.projectStatus.className = 'project-status completed';
    DOM.projectStatus.textContent = '已完成';

    updateGlobalProgress();
    autoSaveVersion('游戏生成完成');

    // V33: 更新角色状态为 done 并实时刷新（含成员详情页）
    for (const gn of Object.keys(AGENT_GROUPS)) {
        AppState.roleStates[gn] = 'done';
    }
    refreshTeamAndMemberView();

    await delay(100);

    // V32: 简洁完成播报（一行）+ 3个角色摘要卡片
    addGroupMessage('coordinator', '🎉 **游戏制作完成！** 太空射击游戏已就绪，可在预览区体验。点击下方卡片查看各角色详细产出 👇');

    await delay(100);

    insertRoleSummaryCard('prototyper', '游戏代码交付 · Canvas 2D · 639行 · 60fps · 已应用到预览区', 'done');

    await delay(100);

    // V32: 美术用素材画廊卡片
    insertAssetGalleryCard('art-director', '美术素材交付 · 25张 · 霓虹风格 · 2x高清', [
        { name: 'bg_game.png', size: '1080KB', url: null },
        { name: 'char_player.png', size: '45KB', url: null },
        { name: 'char_enemy_a.png', size: '32KB', url: null },
        { name: 'char_enemy_b.png', size: '38KB', url: null },
        { name: 'ui_logo.png', size: '120KB', url: null },
        { name: 'ui_score.png', size: '65KB', url: null },
        { name: 'fx_explosion.png', size: '55KB', url: null },
        { name: 'fx_bullet.png', size: '28KB', url: null },
    ], 'done');

    await delay(100);

    insertRoleSummaryCard('sound-designer', '音效资产交付 · 2首BGM + 10个音效 · 8-bit电子风 · 2.7MB', 'done');

    await delay(100);

    // V33: 空闲邀请演示
    AppState.roleStates['音效'] = 'idle';
    refreshTeamAndMemberView();
    insertIdleInvite('音效', '游戏做好了！我听了一下BGM，觉得战斗音乐可以再调调。趁大家都完事了，要不要聊聊音效优化？', [
        { emoji: '🎬', label: '增加动态层次' },
        { emoji: '🎸', label: '加入吉他solo' },
        { emoji: '🌌', label: '更有氛围感' },
    ]);

    showGamePreview();

    // ★ 仿真模式：模拟几个运行时错误 + 弹出完成提示（含"找码哥"入口）
    await delay(200);
    _simulatePreviewErrors();
    _showSimulationCompleteCard();
}

function showGamePreview() {
    // 保持画布内的演示场景不变
}

/** 仿真模式模拟几个预览报错 */
function _simulatePreviewErrors() {
    AppState.previewErrors = [];
    const mockErrors = [
        { type: 'error', message: "Uncaught TypeError: Cannot read properties of undefined (reading 'x')", source: 'game.js', line: 142, col: 18, stack: "at Enemy.update (game.js:142:18)\nat GameLoop.tick (game.js:67:12)", time: getTimeStr() },
        { type: 'error', message: "Uncaught RangeError: Maximum call stack size exceeded", source: 'game.js', line: 203, col: 5, stack: "at CollisionSystem.check (game.js:203:5)\nat CollisionSystem.check (game.js:210:8)", time: getTimeStr() },
        { type: 'console', message: "Warning: Audio context not allowed to start. User gesture required.", source: '', line: 0, col: 0, stack: '', time: getTimeStr() },
    ];
    mockErrors.forEach(err => {
        err._ts = Date.now();
        AppState.previewErrors.push(err);
    });
    updateErrorIndicator();
}

/** 仿真模式完成后弹出提示卡片（带错误摘要 + 找码哥按钮） */
function _showSimulationCompleteCard() {
    const errorCount = AppState.previewErrors.length;
    const errSummary = errorCount > 0
        ? `发现 ${errorCount} 个运行时问题，可以找码哥修复`
        : '运行正常，没有发现错误';

    hideWelcome();
    const el = document.createElement('div');
    el.className = 'message ai';
    el.innerHTML = `
        <div class="message-avatar group-avatar" style="background:#10B98122;color:#10B981">${getAgentAvatarHTML('prototyper')}</div>
        <div class="message-content">
            <div class="message-agent-name" style="color:#10B981">${getGroupDisplayName('工程师')}</div>
            <div class="message-bubble agent-prototyper">
                <div class="sim-complete-card">
                    <div class="sim-complete-header">
                        <i class="fas fa-flag-checkered"></i>
                        <span>游戏已生成完毕</span>
                    </div>
                    ${errorCount > 0 ? `
                    <div class="sim-complete-errors">
                        <div class="sim-complete-error-header">
                            <i class="fas fa-bug"></i> ${errSummary}
                        </div>
                        ${AppState.previewErrors.slice(0, 3).map(err => `
                            <div class="sim-complete-error-item">
                                <span class="sim-error-badge">${err.type === 'error' ? '❌' : '⚠️'}</span>
                                <span class="sim-error-text">${escapeHTML(err.message.slice(0, 60))}</span>
                            </div>
                        `).join('')}
                    </div>` : `
                    <div class="sim-complete-ok">
                        <i class="fas fa-check-circle"></i> ${errSummary}
                    </div>`}
                    <div class="sim-complete-actions">
                        ${errorCount > 0 ? `<button class="sim-complete-btn primary" id="simBtnFindMage"><i class="fas fa-code"></i> 找码哥修复</button>` : ''}
                        <button class="sim-complete-btn" id="simBtnViewErrors"><i class="fas fa-bug"></i> 查看报错 (${errorCount})</button>
                        <button class="sim-complete-btn" id="simBtnOpenMage"><i class="fas fa-comments"></i> 跟码哥聊聊</button>
                    </div>
                </div>
            </div>
            <div class="message-time">${getTimeStr()}</div>
        </div>`;

    DOM.chatMessages.appendChild(el);
    scrollToBottom();

    // 绑定按钮
    el.querySelector('#simBtnFindMage')?.addEventListener('click', () => sendAllErrorsToMage());
    el.querySelector('#simBtnViewErrors')?.addEventListener('click', () => toggleErrorPanel());
    el.querySelector('#simBtnOpenMage')?.addEventListener('click', () => openEngineerChat());
}

function pauseCurrentTask() {
    const sessionId = AppState.currentSessionId;
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (!session?._isGenerating) return;

    // 停止当前 session 的生成
    setSessionGenerating(sessionId, false);
    AppState.isPaused = true;

    // 关闭当前 session 的 EventSource
    const es = getSessionEventSource(sessionId);
    if (es) { es.close(); setSessionEventSource(sessionId, null); }

    // 中止当前 session 的 AbortController
    const ctrl = getSessionAbortController(sessionId);
    if (ctrl) { ctrl.abort(); setSessionAbortController(sessionId, null); }

    addGroupMessage('coordinator', '⏸️ 任务已暂停。');
    updateInputPlaceholder();
    updateGlobalProgress();
}

// ========================================
// 拖拽调整面板宽度（三栏双 handle）
// ========================================
function initResize() {
    const PANEL_MIN = 200;  // 所有可拖拽面板统一最小宽度
    const HANDLE_W = 6;     // handle 宽度
    const SIDEBAR_W = 220;   // conv-sidebar 宽度

    let activeHandle = null; // 'left' | 'right'
    let startX = 0;
    let startChatW = 0;
    let startPreviewW = 0;

    function getAvailableWidth() {
        // 总宽度减去 sidebar 和两个 handle
        return window.innerWidth - SIDEBAR_W - HANDLE_W * 2;
    }

    function onMouseDown(which, e) {
        activeHandle = which;
        startX = e.clientX;
        startChatW = DOM.chatPanel.offsetWidth;
        startPreviewW = DOM.previewPanel.offsetWidth;
        document.body.classList.add('resizing');
        (which === 'left' ? DOM.resizeHandleLeft : DOM.resizeHandleRight).classList.add('active');
        e.preventDefault();
    }

    if (DOM.resizeHandleLeft) {
        DOM.resizeHandleLeft.addEventListener('mousedown', (e) => onMouseDown('left', e));
    }
    if (DOM.resizeHandleRight) {
        DOM.resizeHandleRight.addEventListener('mousedown', (e) => onMouseDown('right', e));
    }

    document.addEventListener('mousemove', (e) => {
        if (!activeHandle) return;
        const available = getAvailableWidth();
        const reviewOpen = AppState.reviewOpen;

        if (activeHandle === 'left') {
            const diff = e.clientX - startX;
            let chatW = startChatW + diff;
            // 限制: chat 最小 PANEL_MIN, 且不能挤压右边 panels 到低于 PANEL_MIN
            const rightPanelsMin = reviewOpen ? PANEL_MIN + PANEL_MIN : PANEL_MIN;
            chatW = Math.max(PANEL_MIN, Math.min(chatW, available - rightPanelsMin));
            DOM.chatPanel.style.width = chatW + 'px';
        } else {
            const diff = startX - e.clientX;
            let previewW = startPreviewW + diff;
            // 限制: preview 最小 PANEL_MIN, 且不能挤压左边 panels 到低于 PANEL_MIN
            const leftPanelsMin = reviewOpen ? PANEL_MIN + PANEL_MIN : PANEL_MIN;
            previewW = Math.max(PANEL_MIN, Math.min(previewW, available - leftPanelsMin));
            DOM.previewPanel.style.width = previewW + 'px';
        }

        requestAnimationFrame(() => {
            const device = DEVICES[AppState.currentDevice];
            if (device) updateDeviceSize(device);
        });
    });

    document.addEventListener('mouseup', () => {
        if (!activeHandle) return;
        (activeHandle === 'left' ? DOM.resizeHandleLeft : DOM.resizeHandleRight)?.classList.remove('active');
        activeHandle = null;
        document.body.classList.remove('resizing');
        const device = DEVICES[AppState.currentDevice];
        if (device) updateDeviceSize(device);
    });
}

// ========================================
// 文件上传
// ========================================
function handleFileUpload(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            // A3: 图片文件 → 显示缩略图预览到附件区
            addImageAttachment(file);
        }
        // 旧逻辑：所有文件都显示药丸
        AppState.uploadedFiles.push(file);
        const pill = document.createElement('span');
        pill.className = 'uploaded-file-pill';
        const isImage = file.type.startsWith('image/');
        pill.innerHTML = `<i class="fas ${isImage ? 'fa-image' : 'fa-file'}"></i>${file.name}<button class="remove-file"><i class="fas fa-xmark"></i></button>`;
        pill.querySelector('.remove-file').addEventListener('click', () => {
            AppState.uploadedFiles = AppState.uploadedFiles.filter(f => f !== file);
            pill.remove();
        });
        DOM.uploadedFiles.appendChild(pill);

        // A4: 自动上传到项目目录
        if (AppState.currentProjectId) {
            uploadAssetToProject(file).then(result => {
                if (result) {
                    console.log(`[A4] Uploaded: ${result.filename}`);
                    // 更新素材坞
                    addAssetToGrid(result.filename, file.type.startsWith('image/') ? result.url : null);
                }
            });
        }
    });
}

// A4: 动态添加素材到素材坞
function addAssetToGrid(filename, thumbUrl) {
    const grid = document.getElementById('assetDockGrid');
    if (!grid) return;
    const uploadBtn = grid.querySelector('.asset-dock-item.upload');
    const item = document.createElement('div');
    item.className = 'asset-dock-item used';
    item.draggable = true;
    item.dataset.asset = filename;
    const ext = filename.split('.').pop().toLowerCase();
    const isImage =
        [ 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg' ].includes(ext);
    item.innerHTML = `
        <div class="asset-status-dot"></div>
        <div class="asset-thumb" ${isImage && thumbUrl ? `style="background-image:url(${thumbUrl});background-size:cover;"` : `style="background:#2d2d3e;"`}>${isImage ? '' : '📦'}</div>
        <span>${filename.length > 10 ? filename.slice(0, 10) + '...' : filename}</span>
    `;
    if (uploadBtn) grid.insertBefore(item, uploadBtn);
    else grid.appendChild(item);
    updateAssetSubtitle();
    // V38: 同步刷新素材管理视图
    loadProjectAssets();
}

// ========================================
// 自定义工具管理
// ========================================
function showAddToolDropdown() {
    // 关闭已有的
    const existing = document.querySelector('.add-tool-dropdown');
    if (existing) { existing.remove(); return; }

    const btn = document.getElementById('btnAddTool');
    const rect = btn.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'add-tool-dropdown';
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 4) + 'px';
    dropdown.style.left = rect.left + 'px';

    dropdown.innerHTML = `
        <div class="add-tool-title">添加工具</div>
        <div class="add-tool-item" data-tool-id="eyedropper" data-tool-name="吸色器" data-tool-icon="fa-eye-dropper">
            <i class="fas fa-eye-dropper"></i>
            <span>吸色器</span>
        </div>
        <div class="add-tool-separator"></div>
        <div class="add-tool-item add-tool-custom" data-tool-id="custom">
            <i class="fas fa-wand-magic-sparkles"></i>
            <span>创建自定义工具...</span>
            <span class="add-tool-hint">AI 帮你开发</span>
        </div>
    `;

    document.body.appendChild(dropdown);

    // 点击工具项
    dropdown.querySelectorAll('.add-tool-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const toolId = item.dataset.toolId;
            if (toolId === 'custom') {
                openCustomToolSession();
            } else {
                addCustomToolToBar(item.dataset.toolName, item.dataset.toolIcon, toolId);
            }
            dropdown.remove();
        });
    });

    // 点击外部关闭
    setTimeout(() => {
        document.addEventListener('click', function closeAddTool(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeAddTool);
            }
        });
    }, 10);
}

// 新开"自定义工具"聊天窗口
function openCustomToolSession() {
    // 检查是否已有自定义工具会话
    let session = AppState.sessions.find(s => s.id === 'custom-tool-session');
    if (!session) {
        session = {
            id: 'custom-tool-session',
            type: 'agent',
            role: 'coordinator',
            name: '自定义工具',
            icon: 'fa-wand-magic-sparkles',
            color: '#8B5CF6',
            desc: 'AI 帮你开发专属工具',
            messages: [{
                agentId: 'coordinator',
                content: `🧩 **自定义工具工坊**\n\n你可以描述想要的工具功能，我来帮你开发并保存到工具栏。\n\n比如：\n• "做一个自动对齐的网格工具"\n• "做一个一键生成配色方案的工具"\n• "做一个碰撞区域可视化工具"\n\n💡 描述你的需求，我马上开始！`,
                time: getTimeStr(),
            }],
        };
        AppState.sessions.push(session);
    }

    renderChatTabs();
    switchSession(session.id);

    // 新 Tab 闪烁提示（让用户注意到新窗口）
    setTimeout(() => {
        const tab = document.querySelector(`.chat-tab[data-session="custom-tool-session"]`);
        if (tab) {
            tab.classList.add('tab-new-highlight');
            setTimeout(() => tab.classList.remove('tab-new-highlight'), 2500);
        }
    }, 100);
}

function addCustomToolToBar(name, icon, id) {
    const container = document.getElementById('topbarCustomTools');
    const addBtn = document.getElementById('btnAddTool');
    // 检查是否已存在
    if (container.querySelector(`[data-custom-tool="${id}"]`)) {
        return;
    }

    const btn = document.createElement('button');
    btn.className = 'topbar-btn';
    btn.dataset.customTool = id;
    btn.title = name;
    btn.innerHTML = `<i class="fas ${icon}"></i><span>${name}</span>`;
    btn.addEventListener('click', () => {
        addGroupMessage('coordinator', `🔧 ${name}工具已激活（功能开发中）`);
    });
    // 右键菜单
    bindToolContextMenu(btn, name, id, true);
    container.insertBefore(btn, addBtn);
}

// 工具按钮右键菜单（支持移出固定 / 移除）
function bindToolContextMenu(btn, toolName, toolId, isCustom) {
    btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showToolContextMenu(e.clientX, e.clientY, btn, toolName, toolId, isCustom);
    });
}

function showToolContextMenu(x, y, btnEl, toolName, toolId, isCustom) {
    // 关闭已有菜单
    closeToolContextMenu();

    const menu = document.createElement('div');
    menu.className = 'tool-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.zIndex = '9999';

    const isPinned = !btnEl.classList.contains('tool-unpinned');

    menu.innerHTML = `
        <div class="tool-ctx-item" data-action="unpin">
            <i class="fas ${isPinned ? 'fa-thumbtack-slash' : 'fa-thumbtack'}"></i>
            <span>${isPinned ? '移出固定位置' : '固定到工具栏'}</span>
        </div>
        <div class="tool-ctx-separator"></div>
        <div class="tool-ctx-item danger" data-action="remove">
            <i class="fas fa-trash-can"></i>
            <span>移除工具</span>
        </div>
    `;

    document.body.appendChild(menu);

    // 防止超出屏幕
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';

    // 操作处理
    menu.querySelectorAll('.tool-ctx-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;

            if (action === 'unpin') {
                if (isPinned) {
                    // 移出固定位置 → 按钮变为未固定态（半透明 + 标记）
                    btnEl.classList.add('tool-unpinned');
                    btnEl.title = toolName + '（未固定）';
                    // 动画反馈
                    btnEl.style.transform = 'scale(0.9)';
                    setTimeout(() => { btnEl.style.transform = ''; }, 200);
                } else {
                    // 重新固定
                    btnEl.classList.remove('tool-unpinned');
                    btnEl.title = toolName;
                    btnEl.style.transform = 'scale(1.1)';
                    setTimeout(() => { btnEl.style.transform = ''; }, 200);
                }
            } else if (action === 'remove') {
                // 移除动画
                btnEl.style.transition = 'all 0.25s ease';
                btnEl.style.transform = 'scale(0)';
                btnEl.style.opacity = '0';
                setTimeout(() => {
                    btnEl.remove();
                    // 如果是预置工具（布局/技能），同时关闭相关面板
                    if (toolId === 'layout') toggleLayoutMode(false);
                    if (toolId === 'skills') closeSkillsDrawer();
                }, 250);
            }

            closeToolContextMenu();
        });
    });

    // 点击外部关闭
    setTimeout(() => {
        document.addEventListener('click', function _closeCtx(e) {
            if (!menu.contains(e.target)) {
                closeToolContextMenu();
                document.removeEventListener('click', _closeCtx);
            }
        });
    }, 10);
}

function closeToolContextMenu() {
    document.querySelectorAll('.tool-context-menu').forEach(m => m.remove());
}

// ========================================
// 技能面板交互
// ========================================
function initSkillsPanel() {
    // 分类切换
    document.querySelectorAll('.skill-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.skill-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 安装/卸载按钮
    document.querySelectorAll('.skill-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isInstalled = btn.classList.contains('installed');
            if (isInstalled) {
                btn.classList.remove('installed');
                btn.textContent = '安装';
                const skillName = btn.closest('.skill-item')?.querySelector('.skill-name')?.textContent;
                addGroupMessage('coordinator', `🔌 已卸载技能：${skillName || '未知'}`);
            } else {
                btn.classList.add('installed');
                btn.textContent = '已启用';
                const skillName = btn.closest('.skill-item')?.querySelector('.skill-name')?.textContent;
                addGroupMessage('coordinator', `✅ 已安装并启用技能：${skillName || '未知'}`);
            }
        });
    });

    // 技能项悬停时「已启用」→「卸载」
    document.querySelectorAll('.skill-item').forEach(item => {
        const btn = item.querySelector('.skill-toggle-btn');
        if (!btn) return;
        item.addEventListener('mouseenter', () => {
            if (btn.classList.contains('installed')) btn.textContent = '卸载';
        });
        item.addEventListener('mouseleave', () => {
            if (btn.classList.contains('installed')) btn.textContent = '已启用';
        });
    });
}

// ========================================
// 初始化
// ========================================
function init() {
    initDOM();
    initDefaultSession();
    initTopbar();
    initResize();
    initDeviceSimulator();
    initAssetDock();
    initSidebarAssetEntry();  // V38: 素材管理系统
    initConvList();
    initReviewPanel();

    // 评审区默认折叠 → 隐藏左 handle + chat-panel 占满
    if (DOM.resizeHandleLeft && !AppState.reviewOpen) {
        DOM.resizeHandleLeft.classList.add('hidden');
    }
    if (DOM.chatPanel && !AppState.reviewOpen) {
        DOM.chatPanel.style.flex = '1';
        DOM.chatPanel.style.width = 'auto';
    }

    // 渲染初始UI
    renderChatHeader(AppState.sessions[0]);
    renderWelcomeScreen(AppState.sessions[0]);
    renderVersions();
    renderConvList();

    // 事件绑定
    DOM.btnSend.addEventListener('click', handleSend);
    DOM.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    DOM.chatInput.addEventListener('input', () => {
        DOM.chatInput.style.height = 'auto';
        DOM.chatInput.style.height = Math.min(DOM.chatInput.scrollHeight, 100) + 'px';
        const text = DOM.chatInput.value;
        if (text.endsWith('@')) {
            showMentionDropdown();
        } else if (AppState.mentionActive && !text.includes('@')) {
            hideMentionDropdown();
        }
    });

    // 滚动到底部时自动隐藏「有新消息」提示
    if (DOM.chatMessages) {
        DOM.chatMessages.addEventListener('scroll', () => {
            const el = DOM.chatMessages;
            const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
            if (isNearBottom) {
                _hideNewMsgIndicator();
            }
        });
    }

    DOM.btnPause.addEventListener('click', pauseCurrentTask);
    DOM.btnUpload.addEventListener('click', () => DOM.fileInput.click());
    DOM.fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files));

    // V39: 项目标题点击修改
    DOM.projectTitle.style.cursor = 'pointer';
    DOM.projectTitle.addEventListener('click', () => {
        if (!AppState.currentProjectId) return;
        const currentName = DOM.projectTitle.textContent;
        const newName = prompt('修改作品名称：', currentName);
        if (newName && newName.trim() && newName !== currentName) {
            DOM.projectTitle.textContent = newName.trim();
            ProjectManager.rename(AppState.currentProjectId, newName.trim());
            if (AppState.task) AppState.task.name = newName.trim();
        }
    });

    // 新建会话（改为使用弹窗按钮 btnNewConv 在 initConvList 中绑定）
    document.getElementById('btnCloseNewSession')?.addEventListener('click', hideNewSessionModal);

    // 空间下钻返回按钮
    document.getElementById('chatBackBtn')?.addEventListener('click', drillBackToGroup);

    // V31: 子线程面板事件绑定
    document.getElementById('threadCloseBtn')?.addEventListener('click', closeThread);
    document.getElementById('threadSendBtn')?.addEventListener('click', sendThreadMessage);
    const threadInput = document.getElementById('threadInput');
    if (threadInput) {
        threadInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendThreadMessage();
            }
        });
        threadInput.addEventListener('input', () => {
            threadInput.style.height = 'auto';
            threadInput.style.height = Math.min(threadInput.scrollHeight, 120) + 'px';
        });
    }

    // 刷新预览
    document.getElementById('btnRefreshPreview')?.addEventListener('click', () => {
        const btn = document.getElementById('btnRefreshPreview');
        // 旋转动画反馈
        if (btn) {
            btn.classList.add('spinning');
            setTimeout(() => btn.classList.remove('spinning'), 600);
        }

        if (refreshPreviewIframe()) {
            // iframe 模式下刷新成功
        } else {
            addGroupMessage('coordinator', '🔄 当前没有可刷新的游戏预览');
        }
    });

    // API 模式开关
    const apiToggle = document.getElementById('apiModeToggle');
    const apiLabel = document.getElementById('apiModeLabel');
    if (apiToggle) {
        // 同步初始状态
        apiToggle.checked = AppState.useRealAPI;
        if (apiLabel) {
            apiLabel.textContent = AppState.useRealAPI ? 'Real API' : '仿真模式';
            if (AppState.useRealAPI) apiLabel.classList.add('active');
        }
        apiToggle.addEventListener('change', () => {
            AppState.useRealAPI = apiToggle.checked;
            if (apiLabel) {
                apiLabel.textContent = apiToggle.checked ? 'Real API' : '仿真模式';
                if (apiToggle.checked) {
                    apiLabel.classList.add('active');
                } else {
                    apiLabel.classList.remove('active');
                }
            }
            console.log('[WeCreat] API mode:', apiToggle.checked ? 'REAL' : 'SIMULATE');
        });
    }

    // Quick/Collab 模式切换
    const modeBtnQuick = document.getElementById('modeBtnQuick');
    const modeBtnCollab = document.getElementById('modeBtnCollab');
    if (modeBtnQuick && modeBtnCollab) {
        function setMode(mode) {
            AppState.currentMode = mode;
            modeBtnQuick.classList.toggle('active', mode === 'quick');
            modeBtnCollab.classList.toggle('active', mode === 'collab');
            // 更新输入框提示
            if (mode === 'collab') {
                DOM.chatInput.placeholder = '描述你想要的游戏，进入多轮协作... 输入 @ 指定Agent';
                DOM.inputHintText.textContent = 'Collab 模式：多轮协作 · 可逐步确认方案';
            } else {
                DOM.chatInput.placeholder = '描述你想要的游戏，AI 工作室协作帮你实现... 输入 @ 指定Agent';
                DOM.inputHintText.textContent = 'Enter 发送 · Shift+Enter 换行 · @ 指定Agent';
            }
            console.log('[WeCreat] Mode:', mode);
        }
        modeBtnQuick.addEventListener('click', () => setMode('quick'));
        modeBtnCollab.addEventListener('click', () => setMode('collab'));
    }

    // V38: 模型选择器
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        // 同步初始状态
        modelSelect.value = AppState.modelProvider;
        modelSelect.addEventListener('change', () => {
            const newVal = modelSelect.value;
            AppState.modelProvider = newVal;
            console.log('[WeCreat] Model provider:', AppState.modelProvider);
            // V41: 切到 CodeBuddy 时，如果有 API Key 就同步到后端
            if (newVal === 'codebuddy' && AppState.codebuddyApiKey) {
                fetch(`${AppState.apiBaseUrl}/api/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        codebuddyApiKey: AppState.codebuddyApiKey,
                        codebuddyEnv: AppState.codebuddyEnv,
                    }),
                }).catch(() => {});
            }
        });
    }

    // V41: API Key 弹窗逻辑
    initApiKeyModal();

    // V41: 页面加载时，如果已有 CodeBuddy API Key，自动同步到后端
    if (AppState.codebuddyApiKey) {
        fetch(`${AppState.apiBaseUrl}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codebuddyApiKey: AppState.codebuddyApiKey,
                codebuddyEnv: AppState.codebuddyEnv,
            }),
        }).catch(() => {});
    }

    // 全屏预览
    document.getElementById('btnFullscreen')?.addEventListener('click', () => {
        DOM.fullscreenModal.style.display = 'flex';
        const fullscreenContent = document.getElementById('fullscreenContent');

        // 如果有 iframe 预览，在全屏中也用 iframe
        const existingIframe = document.getElementById('gamePreviewIframe');
        if (existingIframe && existingIframe.src) {
            fullscreenContent.innerHTML = `<iframe class="fullscreen-game-iframe" src="${existingIframe.src}" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>`;
        } else {
            fullscreenContent.innerHTML = DOM.previewContent.innerHTML;
        }
    });
    document.getElementById('btnExitFullscreen')?.addEventListener('click', () => {
        DOM.fullscreenModal.style.display = 'none';
        document.getElementById('fullscreenContent').innerHTML = '';
    });

    // 布局模式
    document.getElementById('btnLayoutToggle')?.addEventListener('click', () => toggleLayoutMode(!AppState.layoutMode));
    document.getElementById('btnClearCoords')?.addEventListener('click', clearLayoutCoords);
    document.getElementById('btnSendCoords')?.addEventListener('click', sendCoordsToChat);

    // 布局浮动面板按钮
    document.getElementById('btnFloatClear')?.addEventListener('click', clearLayoutCoords);
    document.getElementById('btnFloatSend')?.addEventListener('click', () => {
        sendCoordsToChat();
        toggleLayoutMode(false);
    });

    // 布局退出按钮
    document.getElementById('btnExitLayout')?.addEventListener('click', () => {
        toggleLayoutMode(false);
    });
    document.getElementById('btnRemoveRef')?.addEventListener('click', () => {
        AppState.coordsRefText = '';
        DOM.coordsRefBar.style.display = 'none';
    });
    // V30: 引用条关闭
    document.getElementById('btnRemoveQuote')?.addEventListener('click', () => {
        AppState._pendingQuote = null;
        hideQuoteReferenceBar();
    });

    // 版本管理（抽屉模式）
    document.getElementById('btnSaveVersion')?.addEventListener('click', showSaveVersionModal);
    document.getElementById('btnCloseVersions')?.addEventListener('click', closeVersionsDrawer);
    document.getElementById('btnCloseSaveVersion')?.addEventListener('click', hideSaveVersionModal);
    document.getElementById('btnConfirmSaveVersion')?.addEventListener('click', () => {
        const note = document.getElementById('versionNote')?.value || '';
        saveVersion(note);
        hideSaveVersionModal();
        document.getElementById('versionNote').value = '';
        addGroupMessage('coordinator', `💾 版本已保存：${note || '手动保存'}`);
    });

    // 技能面板
    document.getElementById('btnCloseSkills')?.addEventListener('click', closeSkillsDrawer);
    initSkillsPanel();

    // 图片预览
    DOM.imagePreviewOverlay?.addEventListener('click', (e) => {
        // V38: 忽略信息栏和操作按钮的点击
        if (e.target.closest('.asset-info-bar') || e.target.closest('.asset-nav-btn') || e.target.closest('.asset-audio-preview')) return;
        DOM.imagePreviewOverlay.style.display = 'none';
        // V38: 执行素材预览清理
        if (DOM.imagePreviewOverlay._closeHandler) {
            DOM.imagePreviewOverlay._closeHandler();
        }
    });

    // 弹窗关闭
    [DOM.newSessionModal, DOM.fullscreenModal, DOM.saveVersionModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
    });

    // 发布
    document.getElementById('btnPublish')?.addEventListener('click', () => {
        addGroupMessage('coordinator', '🚀 正在准备发布...请确认版本信息。');
    });

    // 添加自定义工具
    document.getElementById('btnAddTool')?.addEventListener('click', () => {
        showAddToolDropdown();
    });

    // V40: 进度面板已移到侧边栏，不再需要展开/收起按钮

    // 自动检测后端健康状态
    checkBackendHealth();

    // v17: 初始化 Dashboard（精简一屏布局）
    Dashboard.init();

    // 品牌 logo 点击 → 返回首页
    document.querySelector('.topbar-logo')?.addEventListener('click', (e) => {
        e.stopPropagation();
        Dashboard.exitToHome();
    });

    // v11: A1 错误面板按钮
    if (DOM.errorIndicator) {
        DOM.errorIndicator.addEventListener('click', toggleErrorPanel);
    }
    document.getElementById('btnFixAllErrors')?.addEventListener('click', sendAllErrorsToFix);
    document.getElementById('btnSendToMage')?.addEventListener('click', sendAllErrorsToMage);
    document.getElementById('btnClearErrors')?.addEventListener('click', clearPreviewErrors);
    document.getElementById('btnCloseErrorPanel')?.addEventListener('click', () => {
        AppState.errorPanelOpen = false;
        if (DOM.errorPanel) DOM.errorPanel.style.display = 'none';
    });

    // v11: A3 Cmd+V 粘贴截图
    DOM.chatInput.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) addImageAttachment(file);
                break;
            }
        }
    });

    // 页面加载时清空素材坞假数据
    clearAssetDock();
}

// ========================================
// 恢复最近项目
// ========================================
async function restoreLastProject() {
    try {
        const res = await fetch(`${AppState.apiBaseUrl}/api/projects`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
            const lastProject = data.projects[0]; // 按创建时间倒序，第一个就是最近的
            AppState.currentProjectId = lastProject.id;
            DOM.projectTitle.textContent = lastProject.name;
            // 如果有游戏，加载预览
            if (lastProject.hasGame) {
                loadPreviewIframe(lastProject.id);
            }
            // 恢复聊天历史
            await loadChatHistory(lastProject.id);
            // V38: 加载项目素材
            loadProjectAssets();

            // ====== Session 恢复：尝试检测 Collab 会话状态 ======
            // 不依赖 lastProject.mode/phase（可能不存在于项目列表 API 响应中）
            // 直接尝试 fetchSessionState，404 会安全返回 null
            const session = await fetchSessionState();
            if (session && session.mode === 'collab') {
                // 恢复 Collab 模式 UI
                AppState.currentMode = 'collab';
                const modeBtnQuick = document.getElementById('modeBtnQuick');
                const modeBtnCollab = document.getElementById('modeBtnCollab');
                if (modeBtnQuick) modeBtnQuick.classList.remove('active');
                if (modeBtnCollab) modeBtnCollab.classList.add('active');
                DOM.chatInput.placeholder = '描述你想要的游戏，进入多轮协作... 输入 @ 指定Agent';
                DOM.inputHintText.textContent = 'Collab 模式：多轮协作 · 可逐步确认方案';

                // 恢复阶段指示器
                updatePhaseIndicator(session.phase);

                // 如果在等待用户确认，显示确认卡片
                if (session.orchestration?.waitingForUser && session.orchestration?.pendingQuestion) {
                    handleSessionStateUpdate(session);
                }
                console.log(`[restore] Collab session restored: phase=${session.phase}, waiting=${session.orchestration?.waitingForUser}`);
            }
        }
    } catch (e) {
        console.warn('[WeCreat] restore last project failed:', e);
    }
}

// ========================================
// 后端健康检测
// ========================================
async function checkBackendHealth() {
    try {
        const res = await fetch(`${AppState.apiBaseUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            console.log('[WeCreat] ✅ 后端服务正常');
            AppState.backendOnline = true;
        } else {
            throw new Error('status ' + res.status);
        }
    } catch (e) {
        console.warn('[WeCreat] ⚠️ 后端未启动:', e.message);
        AppState.backendOnline = false;
        if (AppState.useRealAPI) {
            showBackendOfflineHint();
        }
    }
}

function showBackendOfflineHint() {
    const session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (session && session.type === 'group') {
      addGroupMessage('coordinator',
                      '⚠️ **后端服务未启动**\n\n' +
                          'Real API 模式需要后端支持，请在终端执行：\n\n' +
                          '```bash\ncd ' +
                          window.location.pathname.replace('/index.html', '') +
                          '/server && node index.js\n```\n\n' +
                          '或运行一键启动脚本：`./start.sh`\n\n' +
                          '💡 也可以切换到「仿真模式」体验 UI 交互。');
    }
}

// ========================================
// Dashboard v18 — 团队内嵌 + 社区作品 + 全部作品页
// ========================================
const Dashboard = {
    /** 是否当前显示 Dashboard */
    active: true,

    /** 首页最多展示作品数 */
    MAX_PREVIEW: 4,

    /** DOM 引用 */
    get dashView() { return document.getElementById('dashboardView'); },
    get workView() { return document.getElementById('workspaceView'); },

    /** 初始化 Dashboard */
    init() {
        this.renderStats();
        this.renderCommunity();
        this.loadAndRenderProjects();
        this.bindEvents();
        this.bindCommunityEvents();
    },

    /** 获取时间问候语（自然版，不带 emoji） */
    getGreeting() {
        const h = new Date().getHours();
        let g;
        if (h < 6) g = '夜深了，还在搞创作？';
        else if (h < 9) g = '早上好';
        else if (h < 12) g = '上午好';
        else if (h < 14) g = '中午好';
        else if (h < 18) g = '下午好';
        else if (h < 22) g = '晚上好';
        else g = '夜深了，还在搞创作？';
        return g + '，创作者 👋';
    },

    /** 随机创意鸡汤 — 每条带角色署名 */
    _CREATIVE_QUOTES: [
        // 小蓝（助手/暖心鼓励型）
        { text: '今天想做点什么好玩的？我帮你把想法变成现实 ✨', from: '小蓝', emoji: '🤖' },
        { text: '昨天你离完成又近了一步，今天继续？', from: '小蓝', emoji: '🤖' },
        { text: '灵感来了就动手，别等它溜走——我随时在', from: '小蓝', emoji: '🤖' },
        { text: '做游戏最难的一步是打开编辑器，但你已经来了 🎉', from: '小蓝', emoji: '🤖' },
        { text: '想到什么跟我说，哪怕只是一句话的想法也行', from: '小蓝', emoji: '🤖' },
        // 灵灵（策划/思考型）
        { text: '每个好游戏，都从一个「要是能……」开始', from: '灵灵', emoji: '🔍' },
        { text: '先做减法，留下的才是核心玩法', from: '灵灵', emoji: '🔍' },
        { text: '别设计玩家"应该"怎么玩，观察他们"想"怎么玩', from: '灵灵', emoji: '🔍' },
        { text: '三分钟能学会、三十分钟停不下来——这就对了', from: '灵灵', emoji: '🔍' },
        { text: '好的关卡设计是：玩家觉得自己很聪明', from: '灵灵', emoji: '🔍' },
        // 绘绘（美术/感性型）
        { text: '配色不知道怎么选？先用让你心情好的颜色 🎨', from: '绘绘', emoji: '🎨' },
        { text: '玩家记住的不是画面精度，是你用色彩讲的故事', from: '绘绘', emoji: '🎨' },
        { text: '风格统一比单张精美重要十倍', from: '绘绘', emoji: '🎨' },
        { text: '写 100 行代码不如先画 1 张草图', from: '绘绘', emoji: '🎨' },
        { text: '画面是玩家的第一印象——让它说「来玩我」', from: '绘绘', emoji: '🎨' },
        // 乐乐（音效/活泼型）
        { text: '一个好的音效，能让点击变成享受 🎵', from: '乐乐', emoji: '🎵' },
        { text: '试试关掉声音玩你的游戏——感受到区别了吗？', from: '乐乐', emoji: '🎵' },
        { text: '背景音乐决定情绪，音效决定手感', from: '乐乐', emoji: '🎵' },
        { text: '好的游戏音效让人想戴上耳机玩', from: '乐乐', emoji: '🎵' },
        // 码哥（工程/务实型）
        { text: '别等完美方案，先做个能玩的原型', from: '码哥', emoji: '💻' },
        { text: '先让自己玩得开心，再考虑别人', from: '码哥', emoji: '💻' },
        { text: '能跑的代码 > 完美的设计文档', from: '码哥', emoji: '💻' },
        { text: '做一个让朋友喊「再来一局」的东西', from: '码哥', emoji: '💻' },
        { text: '好创意不怕小，怕不敢开始', from: '码哥', emoji: '💻' },
        { text: 'Bug 是功能的另一种形态——前提是你知道它在哪 😏', from: '码哥', emoji: '💻' },
    ],
    getRandomQuote() {
        const q = this._CREATIVE_QUOTES[Math.floor(Math.random() * this._CREATIVE_QUOTES.length)];
        return q;
    },

    /** 根据项目数量更新布局 */
    updateLayout(projects) {
        const text = document.getElementById('dashGreetingText');
        if (text) text.textContent = this.getGreeting();
        const q = this.getRandomQuote();
        const quote = document.getElementById('dashQuoteText');
        if (quote) quote.textContent = q.text;
        const projectsSection = document.getElementById('dashProjects');
        if (projectsSection) projectsSection.style.display = 'block';
    },

    /** V5: 渲染个人数据 Stats Bar */
    renderStats() {
        // Mock 数据（后续接入真实 API）
        const published = (ProjectManager.projects || []).filter(p => p.hasGame).length;
        const tokenTotal = 10000;
        const tokenUsed = 1230;
        const tokenRemaining = tokenTotal - tokenUsed;
        const players = '1.2k';

        // 已发布
        const valPub = document.getElementById('statPublishedVal');
        if (valPub) valPub.textContent = published;
        // Token 进度条
        const pct = Math.round((tokenRemaining / tokenTotal) * 100);
        const barFill = document.getElementById('tokenBarFill');
        if (barFill) barFill.style.width = pct + '%';
        const tokenText = document.getElementById('tokenValueText');
        if (tokenText) tokenText.innerHTML = `⚡ ${tokenRemaining.toLocaleString()} <small>/ ${tokenTotal.toLocaleString()}</small>`;
        // 玩家
        const valPlayers = document.getElementById('statPlayersVal');
        if (valPlayers) valPlayers.textContent = players;
    },

    // 保留向后兼容
    renderTeam() { this.renderStats(); },

    /** 社区帖子丰富 mock 数据 */
    COMMUNITY_POSTS: [
        {
            id: 'post_001', type: 'showcase', title: '用 AI 30 分钟做了一个塔防游戏',
            author: { name: 'Alex', avatar: '🧑‍💻' }, content: '# 用 AI 30 分钟做了一个塔防游戏\n\n第一次用 WeCreat，效果超出预期...\n\n## 核心玩法\n- 3 种防御塔，可升级\n- 10 波敌人，Boss 关卡\n- 经济系统：击杀获金币\n\n## 心得\n先让 AI 出原型，再自己微调数值，效率拉满。',
            thumbnail: null, tags: ['塔防', '新手友好'], likes: 342, comments: 28, views: 1200,
            bg: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', emoji: '🏰',
            gameUrl: 'https://example.com/games/tower-defense/', gameName: '30分钟塔防',
            commentList: [
                { id: 'c1', author: { name: 'Miko', avatar: '👩‍🎨' }, content: '这个思路太妙了！请问素材是怎么生成的？', likes: 12, time: '2小时前', replies: [{ id: 'c1r1', author: { name: 'Alex', avatar: '🧑‍💻' }, content: '用的 AI 生成 + rembg 抠图', likes: 5, time: '1小时前' }] },
                { id: 'c2', author: { name: '码农小王', avatar: '👨‍💻' }, content: '30分钟也太快了吧，我做了三天...', likes: 8, time: '3小时前', replies: [] },
                { id: 'c3', author: { name: 'Beat', avatar: '🎵' }, content: '已经试玩了！Boss关卡设计得不错，就是后几波有点难', likes: 15, time: '5小时前', replies: [{ id: 'c3r1', author: { name: 'Alex', avatar: '🧑‍💻' }, content: '哈哈后面确实有点难，准备出个平衡补丁', likes: 3, time: '4小时前' }] },
            ]
        },
        {
            id: 'post_002', type: 'tutorial', title: 'Phaser 3 踩坑指南：从零到上架',
            author: { name: 'Miko', avatar: '👩‍🎨' }, content: '# Phaser 3 踩坑指南\n\n分享我做像素猫咪跑酷时遇到的所有坑...\n\n## 坑1：tweens.timeline 废弃\n3.80+ 用 `tweens.chain()` 替代\n\n## 坑2：音频自动播放\n必须用户交互后才能播放，加个「点击开始」按钮。\n\n## 坑3：大图导致加载失败\n5MB+ PNG 会炸 WebGL 纹理，背景图缩到 750px 宽 + JPEG(q=90) 即可。',
            thumbnail: null, tags: ['Phaser', '教程'], likes: 218, comments: 15, views: 890,
            bg: 'linear-gradient(135deg,#f093fb,#f5576c)', emoji: '📚',
            commentList: [
                { id: 'c4', author: { name: 'Beat', avatar: '🎵' }, content: '音频那个坑我也踩过，感谢分享！', likes: 6, time: '1天前', replies: [] },
                { id: 'c5', author: { name: '小甜', avatar: '🍭' }, content: '坑3太真实了，我的背景图5.3MB直接白屏...', likes: 11, time: '2天前', replies: [{ id: 'c5r1', author: { name: 'Miko', avatar: '👩‍🎨' }, content: 'sips --resampleWidth 750 一行命令解决 😄', likes: 4, time: '1天前' }] },
            ]
        },
        {
            id: 'post_003', type: 'showcase', title: '糖果消消乐：纯代码画的 UI 也能好看',
            author: { name: '小甜', avatar: '🍭' }, content: '# 糖果消消乐\n\n不用任何美术素材，纯代码画出来的糖果消消乐。\n\n## 技巧\n- 三层法画糖果按钮（底色+高光+阴影）\n- 渐变背景光晕营造氛围\n- 浮动粒子装饰增加活力\n\n减法比加法重要，简洁卡片优于复杂堆砌。', thumbnail: null,
            tags: ['消除', '纯代码'], likes: 189, comments: 9, views: 650,
            bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', emoji: '🍬',
            gameUrl: 'https://example.com/games/candy-crush/', gameName: '糖果消消乐',
            commentList: [
                { id: 'c6', author: { name: 'Tank', avatar: '🎮' }, content: '纯代码这么好看？真厉害', likes: 5, time: '6小时前', replies: [] },
            ]
        },
        {
            id: 'post_004', type: 'discussion', title: '大家觉得 AI 生成游戏的上限在哪？',
            author: { name: 'Tank', avatar: '🎮' }, content: '聊一个开放话题：用 AI 辅助做游戏，你觉得目前最大的瓶颈是什么？\n\n我觉得素材是最大瓶颈，代码反而容易...', thumbnail: null,
            tags: ['讨论', 'AI'], likes: 156, comments: 42, views: 2100,
            bg: 'linear-gradient(135deg,#2d3436,#636e72)', emoji: '💬',
            commentList: [
                { id: 'c7', author: { name: 'Alex', avatar: '🧑‍💻' }, content: '同意，素材管道比代码难10倍', likes: 18, time: '1天前', replies: [{ id: 'c7r1', author: { name: 'Racer', avatar: '🏎️' }, content: '+1 我做赛车游戏光音效就搞了两天', likes: 6, time: '20小时前' }] },
                { id: 'c8', author: { name: 'Racer', avatar: '🏎️' }, content: '我觉得是数值平衡，AI 不太会调', likes: 9, time: '2天前', replies: [] },
                { id: 'c9', author: { name: 'Miko', avatar: '👩‍🎨' }, content: '动画！AI生成序列帧完全不可用，帧间一致性为零', likes: 14, time: '2天前', replies: [{ id: 'c9r1', author: { name: 'Alex', avatar: '🧑‍💻' }, content: '序列帧只能用代码实现帧间变化，静态图让AI生成', likes: 7, time: '1天前' }] },
            ]
        },
        {
            id: 'post_005', type: 'tutorial', title: 'AI 素材管道搭建：从生成到去背到压缩',
            author: { name: 'Beat', avatar: '🎵' }, content: '# AI 素材管道全流程\n\n1. AI 生成（纯白底）\n2. rembg 去背\n3. flood fill 清理白边\n4. Python 统一画布\n5. sips 压缩 JPEG\n\n## 关键经验\n- 全局白色阈值去背会误杀内部白色元素\n- flood fill 从四角向内外扩才安全\n- AI 生成多张图尺寸不一致是常态，第一步就要统一画布', thumbnail: null,
            tags: ['素材', '教程'], likes: 127, comments: 11, views: 780,
            bg: 'linear-gradient(135deg,#667eea,#764ba2)', emoji: '🛠️',
            commentList: [
                { id: 'c10', author: { name: 'Tank', avatar: '🎮' }, content: 'flood fill 那个 tip 救了我一命！之前白色文字总被误杀', likes: 9, time: '3天前', replies: [] },
            ]
        },
        {
            id: 'post_006', type: 'showcase', title: '复古赛车：音效全部用 Python 合成',
            author: { name: 'Racer', avatar: '🏎️' }, content: '# 复古赛车\n\n引擎声、漂移声、碰撞声全部用 numpy + scipy 合成，零素材依赖。\n\n## 音效合成方案\n- 引擎声：锯齿波 + 低通滤波 + 频率调制\n- 漂移声：白噪声 + 带通滤波\n- 碰撞声：短促正弦衰减 + 噪声混合', thumbnail: null,
            tags: ['竞速', '音效'], likes: 98, comments: 7, views: 430,
            bg: 'linear-gradient(135deg,#f12711,#f5af19)', emoji: '🏎️',
            gameUrl: 'https://example.com/games/retro-racer/', gameName: '复古赛车',
            commentList: [
                { id: 'c11', author: { name: 'Beat', avatar: '🎵' }, content: '用代码合成音效这个思路太棒了！比到处找音效库方便多了', likes: 7, time: '4天前', replies: [] },
            ]
        },
        {
            id: 'post_007', type: 'showcase', title: '像素猫咪跑酷：3 天做完的全流程',
            author: { name: 'Miko', avatar: '👩‍🎨' }, content: '# 像素猫咪跑酷\n\n从立项到上架，完整记录3天的开发过程。\n\n## Day 1：核心玩法\n自动跑酷 + 跳跃 + 双段跳\n\n## Day 2：美术打磨\nAI 生成背景 + 角色帧动画用代码实现\n\n## Day 3：内容填充\n关卡配置 + 金币系统 + 成就', thumbnail: null,
            tags: ['跑酷', '全流程'], likes: 276, comments: 19, views: 1560,
            bg: 'linear-gradient(135deg,#43e97b,#38f9d7)', emoji: '🐱',
            gameUrl: 'https://example.com/games/pixel-cat/', gameName: '像素猫咪跑酷',
            commentList: [
                { id: 'c12', author: { name: '码农小王', avatar: '👨‍💻' }, content: '3天从零到上架，这效率我酸了', likes: 11, time: '5天前', replies: [] },
                { id: 'c13', author: { name: 'Tank', avatar: '🎮' }, content: '猫咪好可爱！双段跳手感很好', likes: 8, time: '4天前', replies: [] },
            ]
        },
        {
            id: 'post_008', type: 'discussion', title: '你们做游戏用什么引擎？为什么？',
            author: { name: '小甜', avatar: '🍭' }, content: '投票贴！大家用的什么引擎？\n\n1. Phaser 3\n2. 原生 Canvas\n3. Babylon.js\n4. 其他\n\n我个人偏好原生 Canvas，轻量可控。', thumbnail: null,
            tags: ['讨论', '引擎'], likes: 203, comments: 55, views: 3200,
            bg: 'linear-gradient(135deg,#fa709a,#fee140)', emoji: '🗳️',
            commentList: [
                { id: 'c14', author: { name: 'Alex', avatar: '🧑‍💻' }, content: 'Phaser 3，生态成熟', likes: 22, time: '1周前', replies: [{ id: 'c14r1', author: { name: 'Miko', avatar: '👩‍🎨' }, content: '同 Phaser，但 tweens.timeline 废弃这个坑太恶心了', likes: 10, time: '6天前' }] },
                { id: 'c15', author: { name: 'Beat', avatar: '🎵' }, content: '原生 Canvas 2D，不想多引一个库', likes: 15, time: '1周前', replies: [] },
                { id: 'c16', author: { name: 'Tank', avatar: '🎮' }, content: 'Babylon.js，3D 游戏首选', likes: 8, time: '5天前', replies: [] },
            ]
        },
    ],

    /** 当前社区 Tab */
    _currentCommTab: 'hot',

    /** 渲染社区帖子列表 */
    renderCommunity(tab) {
        if (tab) this._currentCommTab = tab;
        const currentTab = this._currentCommTab || 'hot';
        const grid = document.getElementById('dashCommunityGrid');
        if (!grid) return;
        grid.innerHTML = '';

        // 过滤
        let posts = [...this.COMMUNITY_POSTS];
        if (currentTab === 'tutorial') posts = posts.filter(p => p.type === 'tutorial');
        else if (currentTab === 'discussion') posts = posts.filter(p => p.type === 'discussion');
        else if (currentTab === 'latest') posts = posts.sort((a, b) => (b.views || 0) - (a.views || 0));
        else posts = posts.sort((a, b) => (b.likes || 0) - (a.likes || 0)); // hot = by likes

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'dash-community-card';
            card.dataset.postId = post.id;
            const typeIcon = { showcase: '🎮', tutorial: '📚', discussion: '💬' }[post.type] || '📝';
            const typeLabel = { showcase: '作品', tutorial: '教程', discussion: '讨论' }[post.type] || '';
            card.innerHTML = `
                <div class="dash-community-thumb" style="background:${post.bg};">
                    <span class="dash-community-tag">${typeIcon} ${typeLabel}</span>
                    <span style="font-size:42px;">${post.emoji}</span>
                </div>
                <div class="dash-community-body">
                    <div class="dash-community-name">${post.title}</div>
                    <div class="dash-community-tags">${post.tags.map(t => `<span class="comm-tag">${t}</span>`).join('')}</div>
                    <div class="dash-community-info">
                        <span class="dash-community-author">${post.author.avatar} ${post.author.name}</span>
                        <span class="dash-community-likes"><i class="fas fa-heart"></i> ${post.likes} <i class="fas fa-comment" style="margin-left:6px;"></i> ${post.comments}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => this.openPostDetail(post));
            grid.appendChild(card);
        });

        // 更新 Tab 激活状态
        document.querySelectorAll('.comm-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === currentTab);
        });
    },

    /** 打开帖子详情页 */
    openPostDetail(post) {
        const detail = document.getElementById('dashPostDetail');
        if (!detail) return;

        // 保存当前帖子引用（用于评论发送等）
        this._currentPost = post;

        // 填充正文
        const main = document.getElementById('postDetailMain');
        if (main) {
            // 试玩区域（仅 showcase 类型且有 gameUrl）
            const playSection = (post.type === 'showcase' && post.gameUrl) ? `
                <div class="post-play-section">
                    <div class="post-play-header">
                        <span class="post-play-icon">🎮</span>
                        <span class="post-play-title">试玩「${post.gameName || post.title}」</span>
                    </div>
                    <div class="post-play-frame-wrap">
                        <iframe class="post-play-frame" src="${post.gameUrl}" sandbox="allow-scripts allow-same-origin allow-popups" loading="lazy"></iframe>
                        <div class="post-play-overlay" id="postPlayOverlay">
                            <button class="post-play-start-btn" id="postPlayStartBtn">
                                <i class="fas fa-play"></i> 开始试玩
                            </button>
                            <span class="post-play-hint">点击按钮加载游戏</span>
                        </div>
                    </div>
                    <div class="post-play-actions">
                        <button class="post-play-fullscreen" id="postPlayFullscreen"><i class="fas fa-expand"></i> 全屏</button>
                        <span class="post-play-credit">由 ${post.author.avatar} ${post.author.name} 开发</span>
                    </div>
                </div>
            ` : '';

            main.innerHTML = `
                <div class="post-detail-cover" style="background:${post.bg};">
                    <span style="font-size:64px;">${post.emoji}</span>
                </div>
                <h1 class="post-detail-title">${post.title}</h1>
                <div class="post-detail-meta">
                    <span class="post-detail-author">${post.author.avatar} ${post.author.name}</span>
                    <span class="post-detail-date">2026-04-01</span>
                    <span class="post-detail-views"><i class="fas fa-eye"></i> ${post.views}</span>
                </div>
                <div class="post-detail-tags">${post.tags.map(t => `<span class="comm-tag">${t}</span>`).join('')}</div>
                ${playSection}
                <div class="post-detail-content">${typeof marked !== 'undefined' ? marked.parse(post.content || '') : (post.content || '').replace(/\n/g, '<br>')}</div>
            `;

            // 绑定试玩按钮事件
            const startBtn = document.getElementById('postPlayStartBtn');
            const overlay = document.getElementById('postPlayOverlay');
            if (startBtn && overlay) {
                startBtn.addEventListener('click', () => {
                    overlay.style.display = 'none';
                });
            }
            const fullscreenBtn = document.getElementById('postPlayFullscreen');
            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', () => {
                    const iframe = main.querySelector('.post-play-frame');
                    if (iframe?.requestFullscreen) iframe.requestFullscreen();
                    else if (iframe?.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
                });
            }
        }

        // 填充评论
        const commentCount = document.getElementById('postCommentCount');
        if (commentCount) commentCount.textContent = post.comments || 0;
        const likeCount = document.getElementById('postLikeCount');
        if (likeCount) likeCount.textContent = post.likes || 0;
        const commentsList = document.getElementById('postCommentsList');
        if (commentsList) {
            commentsList.innerHTML = '';
            (post.commentList || []).forEach(c => {
                const el = document.createElement('div');
                el.className = 'post-comment-item';
                const repliesHTML = (c.replies || []).map(r => `
                    <div class="post-comment-reply">
                        <div class="comment-reply-header">
                            <span class="comment-author">${r.author.avatar} ${r.author.name}</span>
                            <span class="comment-time">${r.time || ''}</span>
                        </div>
                        <span class="comment-text">${r.content}</span>
                        <div class="comment-actions">
                            <span class="comment-likes"><i class="far fa-heart"></i> ${r.likes}</span>
                            <span class="comment-reply-btn"><i class="far fa-comment"></i> 回复</span>
                        </div>
                    </div>
                `).join('');
                el.innerHTML = `
                    <div class="comment-main">
                        <div class="comment-header">
                            <span class="comment-author">${c.author.avatar} ${c.author.name}</span>
                            <span class="comment-time">${c.time || ''}</span>
                        </div>
                        <div class="comment-text">${c.content}</div>
                        <div class="comment-actions">
                            <span class="comment-likes"><i class="far fa-heart"></i> ${c.likes}</span>
                            <span class="comment-reply-btn"><i class="far fa-comment"></i> 回复</span>
                        </div>
                    </div>
                    ${repliesHTML ? `<div class="comment-replies">${repliesHTML}</div>` : ''}
                `;
                commentsList.appendChild(el);
            });
            if ((post.commentList || []).length === 0) {
                commentsList.innerHTML = '<div class="comment-empty">暂无评论，来说两句？</div>';
            }
        }

        detail.style.display = 'block';
        detail.scrollTop = 0;
    },

    /** 关闭帖子详情页 */
    closePostDetail() {
        const detail = document.getElementById('dashPostDetail');
        if (!detail) return;
        detail.style.animation = 'slideOutRight 0.25s ease forwards';
        setTimeout(() => {
            detail.style.display = 'none';
            detail.style.animation = '';
        }, 250);
    },

    /** 绑定社区事件 */
    bindCommunityEvents() {
        // Tab 切换
        document.querySelectorAll('.comm-tab').forEach(btn => {
            btn.addEventListener('click', () => this.renderCommunity(btn.dataset.tab));
        });
        // 帖子详情返回
        document.getElementById('postDetailBack')?.addEventListener('click', () => this.closePostDetail());
        // 评论发送
        document.getElementById('postCommentSend')?.addEventListener('click', () => {
            const input = document.getElementById('postCommentInput');
            if (input?.value?.trim()) {
                // Mock：添加到评论列表
                const commentsList = document.getElementById('postCommentsList');
                const emptyEl = commentsList?.querySelector('.comment-empty');
                if (emptyEl) emptyEl.remove();
                const el = document.createElement('div');
                el.className = 'post-comment-item';
                el.innerHTML = `
                    <div class="comment-main">
                        <span class="comment-author">🧑 我</span>
                        <div class="comment-text">${escapeHTML(input.value.trim())}</div>
                        <span class="comment-likes"><i class="far fa-heart"></i> 0</span>
                    </div>
                `;
                commentsList?.appendChild(el);
                input.value = '';
            }
        });
        // 点赞按钮
        document.getElementById('postLikeBtn')
            ?.addEventListener('click', function() {
              const icon = this.querySelector('i');
              if (icon.classList.contains('far')) {
                icon.className = 'fas fa-heart';
                icon.style.color = '#F43F5E';
              } else {
                icon.className = 'far fa-heart';
                icon.style.color = '';
              }
            });
    },

    /** 加载项目列表并渲染卡片 */
    async loadAndRenderProjects() {
        await ProjectManager.load();
        this.renderProjects(ProjectManager.projects);
    },

    /** 渲染我的作品（无创建卡，创建入口保留在头卡CTA） */
    renderProjects(projects) {
        const grid = document.getElementById('dashProjectsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        // 更新布局
        this.updateLayout(projects);

        if (projects && projects.length > 0) {
            // 单行展示前 MAX_PREVIEW 个
            const preview = projects.slice(0, this.MAX_PREVIEW);
            preview.forEach(p => {
                grid.appendChild(this._createProjectCard(p));
            });

            // 查看全部按钮 — 有多余作品时显示
            const viewAllBtn = document.getElementById('dashViewAllBtn');
            if (viewAllBtn) {
                viewAllBtn.textContent = '';
                viewAllBtn.innerHTML = `全部 ${projects.length} 个作品 <i class="fas fa-chevron-right"></i>`;
                viewAllBtn.style.display = projects.length > 1 ? '' : 'none';
            }
        } else {
            const viewAllBtn = document.getElementById('dashViewAllBtn');
            if (viewAllBtn) viewAllBtn.style.display = 'none';
        }
    },

    /** 渲染全部作品页 */
    renderAllProjects(projects) {
        const grid = document.getElementById('dashAllGrid');
        if (!grid) return;
        grid.innerHTML = '';

        if (projects && projects.length > 0) {
            projects.forEach(p => {
                grid.appendChild(this._createProjectCard(p));
            });
        }

        // 末尾虚线新建卡
        const addCard = document.createElement('div');
        addCard.className = 'dash-project-add';
        addCard.innerHTML = `<i class="fas fa-plus"></i><span>新建作品</span>`;
        addCard.addEventListener('click', () => this.showNewProjectModal());
        grid.appendChild(addCard);
    },

    /** 创建单个作品卡片 DOM */
    _createProjectCard(p) {
        const card = document.createElement('div');
        card.className = 'dash-project-card';
        card.dataset.projectId = p.id;
        const date = p.createdAt
            ? new Date(p.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
            : '';
        const statusClass = p.hasGame ? 'has-game' : 'draft';
        const statusText = p.hasGame ? '🎮 可运行' : '📝 草稿';
        // v21: 优先使用截图封面
        const thumbUrl = p.thumbnail ? `${AppState.apiBaseUrl}${p.thumbnail}` : null;
        const thumbContent = thumbUrl
            ? `<img class="dash-project-thumb-img" src="${thumbUrl}" alt="封面" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <span class="dash-project-thumb-icon" style="display:none;">${p.hasGame ? '<i class="fas fa-gamepad"></i>' : '<i class="fas fa-file-lines"></i>'}</span>`
            : `<span class="dash-project-thumb-icon">${p.hasGame ? '<i class="fas fa-gamepad"></i>' : '<i class="fas fa-file-lines"></i>'}</span>`;
        card.innerHTML = `
            <div class="dash-project-thumb">
                ${thumbContent}
            </div>
            <div class="dash-project-body">
                <div class="dash-project-name">${p.name || '未命名'}</div>
                <div class="dash-project-meta">
                    <span class="dash-project-date">${date}</span>
                    <span class="dash-project-status ${statusClass}">${statusText}</span>
                </div>
            </div>
            <div class="dash-project-actions">
                <button class="dash-proj-delete-btn" data-delete-id="${p.id}" title="删除"><i class="fas fa-trash"></i></button>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.dash-proj-delete-btn')) return;
            this.enterWorkspace(p.id);
        });
        card.querySelector('.dash-proj-delete-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`确定删除「${p.name || '未命名'}」？`)) {
                await ProjectManager.remove(p.id);
                await this.loadAndRenderProjects();
                // 也刷新全部作品页（如果打开着）
                const allPage = document.getElementById('dashAllProjects');
                if (allPage && allPage.style.display !== 'none') {
                    this.renderAllProjects(ProjectManager.projects);
                }
            }
        });
        return card;
    },

    /** 绑定 Dashboard 事件 */
    bindEvents() {
        // 品牌头卡创建按钮
        document.getElementById('dashHeroCta')?.addEventListener('click', () => this.showNewProjectModal());
        // 返回首页
        document.getElementById('btnBackHome')?.addEventListener('click', () => this.exitToHome());
        // 查看全部作品
        document.getElementById('dashViewAllBtn')?.addEventListener('click', () => this.showAllProjects());
        // 全部作品页返回（使用 mousedown 确保可靠触发）
        const backBtn = document.getElementById('dashAllBack');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideAllProjects();
            });
        }
        // 全部作品页新建
        document.getElementById('dashAllNewBtn')?.addEventListener('click', () => this.showNewProjectModal());
    },

    /** 打开全部作品页 */
    showAllProjects() {
        const allPage = document.getElementById('dashAllProjects');
        if (!allPage) return;
        this.renderAllProjects(ProjectManager.projects);
        allPage.style.display = 'block';
    },

    /** 关闭全部作品页 */
    hideAllProjects() {
        const allPage = document.getElementById('dashAllProjects');
        if (allPage) allPage.style.display = 'none';
    },

    /** V39: 直接创建新作品并进入（不弹窗取名） */
    async showNewProjectModal() {
        const projectId = await ProjectManager.create('新作品');
        if (projectId) {
            this.enterWorkspace(projectId, '新作品', true);
        }
    },

    /** 进入创作工作台 */
    enterWorkspace(projectId, projectName, isNewProject = false) {
        // 设置当前项目
        AppState.currentProjectId = projectId;
        const proj = ProjectManager.projects.find(p => p.id === projectId);
        if (proj) {
            DOM.projectTitle.textContent = proj.name;
            if (proj.hasGame) {
                loadPreviewIframe(projectId);
            } else {
                resetPreviewToDemo();
            }
        } else if (projectName) {
            DOM.projectTitle.textContent = projectName;
            resetPreviewToDemo();
        }

        // 重置任务状态
        AppState.task = null;
        DOM.projectStatus.style.display = 'none';
        updateGlobalProgress();

        // V42 fix: 彻底清空聊天上下文（修复新建作品后旧消息残留）
        // 1. 关闭成员面板 / 素材视图（如果打开着）
        if (AppState.activeMemberView) {
            AppState.activeMemberView = null;
            const inputWrapper = document.querySelector('.chat-input-wrapper');
            if (inputWrapper) inputWrapper.style.display = '';
        }
        if (AppState.activeAssetView) {
            AppState.activeAssetView = false;
        }

        // 2. 重建 session（messages 清空、SSE 流中断）
        initDefaultSession();

        // 3. 清空聊天 DOM（用 renderChatMessages 彻底清空+显示欢迎页）
        renderChatMessages(AppState.sessions[0]);
        renderChatHeader(AppState.sessions[0]);
        renderChatTabs();

        // 4. 恢复输入框状态
        if (DOM.chatInput) {
            DOM.chatInput.value = '';
            DOM.chatInput.placeholder = '描述你想要的游戏... 输入 @ 指定Agent';
        }
        clearMentions();
        clearAssetTokens();
        clearImageAttachments();

        // 5. 清空评审区（保留白板容器）
        if (DOM.reviewContent) {
            DOM.reviewContent.innerHTML = '';
            DOM.reviewContent.innerHTML = `<div class="whiteboard-container" id="whiteboardContainer"><div id="wbCardsArea"><div class="whiteboard-empty" id="wbEmpty"><i class="fas fa-note-sticky"></i><p>方案将以卡片形式展示在这里<br>发送游戏需求后，策划和美术会各自贴出方案</p></div></div></div>`;
        }
        if (DOM.reviewTabs) DOM.reviewTabs.innerHTML = '<button class="plan-board-tab active" data-tab="plans" id="planBoardTabPlans"><i class="fas fa-clipboard-list"></i> 方案</button>';
        if (DOM.reviewWelcome) DOM.reviewWelcome.style.display = '';

        // V36: 只有切换已有项目才加载聊天历史，新建项目保持空白
        if (!isNewProject) {
            loadChatHistory(projectId);
        }
        clearAssetDock();
        // V38: 加载项目素材
        AppState.projectAssets = [];
        renderSidebarAssetEntry();
        loadProjectAssets();

        // 关闭全部作品页（如果打开着）
        this.hideAllProjects();

        // 视图切换动画
        this.active = false;
        const dash = this.dashView;
        const work = this.workView;
        if (dash) {
            dash.classList.add('view-exit');
            setTimeout(() => {
                dash.style.display = 'none';
                dash.classList.remove('view-exit');
            }, 320);
        }
        if (work) {
            setTimeout(() => {
                work.style.display = 'flex';
                work.classList.add('view-enter');
                setTimeout(() => work.classList.remove('view-enter'), 350);
            }, 200);
        }
    },

    /** 返回首页 */
    exitToHome() {
        this.active = true;
        const dash = this.dashView;
        const work = this.workView;
        if (work) work.style.display = 'none';
        if (dash) {
            dash.style.display = '';
            dash.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // 刷新项目列表
        this.loadAndRenderProjects();
    },
};

document.addEventListener('DOMContentLoaded', init);
