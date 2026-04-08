/**
 * WeCreat v17 - Dashboard 精简一屏布局 + 视图切换
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
    status : ['正在整理待办清单', '刚泡好一杯美式', '随时待命', '在复盘昨天的项目']
  },
  '策划' : {
    icon : 'fa-lightbulb',
    color : '#F59E0B',
    desc : '玩法设计 · 系统策划',
    avatar : 'avatars/avatar_planner.png',
    nickname : '灵灵',
    personality : '脑洞无限，把创意变成可落地的方案',
    status : ['正在翻游戏设计文档', '又想到一个新玩法', '在分析竞品数据', '画了一下午流程图']
  },
  '美术' : {
    icon : 'fa-palette',
    color : '#EC4899',
    desc : '视觉设计 · 画面表现',
    avatar : 'avatars/avatar_artist.png',
    nickname : '绘绘',
    personality : '像素级审美，让每帧画面都有表现力',
    status : ['刚调完一组配色', '在研究新的画风', '正在 P 图中...', '盯着参考图发呆']
  },
  '音效' : {
    icon : 'fa-music',
    color : '#06B6D4',
    desc : '音频设计 · 氛围营造',
    avatar : 'avatars/avatar_sound.png',
    nickname : '乐乐',
    personality : '用声音讲故事，每个交互都有灵魂',
    status : ['戴着耳机调音色', '在合成新的打击感', '正在听参考曲', '刚做完一段 BGM']
  },
  '工程师' : {
    icon : 'fa-code',
    color : '#10B981',
    desc : '架构编码 · 性能优化',
    avatar : 'avatars/avatar_engineer.png',
    nickname : '码哥',
    personality : '代码洁癖，不只是能跑还要跑得漂亮',
    status : ['正在 debug 中...', '重构了一段老代码', '在写单元测试', '刚合了一个 PR']
  },
  '审核' : {
    icon : 'fa-shield-halved',
    color : '#8B5CF6',
    desc : '质量把关 · 体验走查',
    avatar : 'avatars/avatar_qa.png',
    nickname : '查查',
    personality : '上线前最后一道防线，Bug 别想溜',
    status : ['正在走查体验流程', '记录了 3 个待修问题', '在写测试用例', '刚跑完一轮回归']
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

  // 布局模式
  layoutMode : false,
  layoutCoords : [],
  coordsRefText : '',

  // 版本管理
  versions : [],

  // 评审区（默认隐藏）
  reviewOpen : false,

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
  useRealAPI : true,       // 开关：true=真实API, false=仿真
  currentProjectId : null, // 当前项目ID
  apiBaseUrl :
      window.location.pathname.startsWith('/zoi')
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
    DOM.taskProgressBar = document.getElementById('taskProgressBar');
    DOM.taskProgressAgents = document.getElementById('taskProgressAgents');

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
function initAssetDock() {
    DOM.assetDockToggle.addEventListener('click', () => {
        AppState.assetDockOpen = !AppState.assetDockOpen;
        DOM.assetDockPanel.classList.toggle('show', AppState.assetDockOpen);
        DOM.assetDockToggle.classList.toggle('active', AppState.assetDockOpen);
    });

    DOM.assetDockClose.addEventListener('click', () => {
        AppState.assetDockOpen = false;
        DOM.assetDockPanel.classList.remove('show');
        DOM.assetDockToggle.classList.remove('active');
    });

    // 分类切换
    document.querySelectorAll('.asset-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.asset-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 上传按钮
    document.getElementById('assetUploadBtn')?.addEventListener('click', () => {
        DOM.fileInput.click();
    });

    // 素材点击联动
    document.querySelectorAll('.asset-dock-item.used').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.asset-replace-btn')) return;
            selectAssetInList(item.dataset.asset);
        });
    });

    // 替换按钮
    document.querySelectorAll('.asset-replace-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.fileInput.click();
        });
    });

    // 清理未使用素材
    document.getElementById('btnCleanupAssets')?.addEventListener('click', () => {
        document.querySelectorAll('.asset-dock-item.unused').forEach(item => {
            item.style.transition = 'all 0.3s';
            item.style.transform = 'scale(0)';
            item.style.opacity = '0';
            setTimeout(() => item.remove(), 300);
        });
        const cleanup = document.getElementById('assetDockCleanup');
        if (cleanup) {
            setTimeout(() => { cleanup.classList.remove('show'); }, 400);
        }
        updateAssetSubtitle();
    });
}

// 打开素材坞并选中某个素材
function openAssetDockAndSelect(assetId) {
    // 确保素材坞打开
    if (!AppState.assetDockOpen) {
        AppState.assetDockOpen = true;
        DOM.assetDockPanel.classList.add('show');
        DOM.assetDockToggle.classList.add('active');
    }
    selectAssetInList(assetId);
}

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
// 对话列表管理（左侧聊天列表，微信风格）
// ========================================
function renderConvList() {
    const groups = AppState.sessions.filter(s => s.type === 'group');

    // 侧边栏聊天列表
    if (DOM.convGroupItems) {
        DOM.convGroupItems.innerHTML = '';
        groups.forEach(session => {
            // 每个 session 用自己的 task（per-session），兼容全局 task
            const sessionTask = session.task || (session.id === AppState.currentSessionId ? AppState.task : null);
            DOM.convGroupItems.appendChild(createConvSidebarItem(session, sessionTask));
        });
    }

    // 更新对话面板标题
    const currentSession = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (DOM.chatPanelTitle && currentSession) {
        DOM.chatPanelTitle.textContent = currentSession.name || '创作工坊';
    }
}

/** 生成群聊头像：根据成员组合生成微信风格九宫格 / 单角色头像 */
function generateConvAvatarHTML(session) {
    const agents = session.agents || [];
    // 默认全员群
    if (session.id === 'group' || agents.length === 0) {
        // 全员群：用渐变底色 + 🎮
        return `<div class="conv-item-avatar conv-avatar-all" style="background:linear-gradient(135deg, #07C160, #06AD56);">🎮</div>`;
    }
    // 单角色群：直接用该角色头像
    if (agents.length === 1) {
        const agent = getAgent(agents[0]);
        const groupInfo = agent ? AGENT_GROUPS[agent.group] : null;
        if (groupInfo?.avatar) {
            return `<div class="conv-item-avatar conv-avatar-single"><img src="${groupInfo.avatar}" alt="${agent.group}" /></div>`;
        }
        return `<div class="conv-item-avatar" style="background:${agent?.color || '#6366F1'}22;color:${agent?.color || '#6366F1'}">${agent?.emoji || '💬'}</div>`;
    }
    // 多角色群：用第一个角色的头像 + 人数角标（九宫格太小图片糊掉）
    const seenGroups = new Set();
    let firstGroupInfo = null;
    for (const aid of agents) {
        const agent = getAgent(aid);
        if (!agent) continue;
        if (!seenGroups.has(agent.group)) {
            seenGroups.add(agent.group);
            if (!firstGroupInfo) {
                firstGroupInfo = AGENT_GROUPS[agent.group];
            }
        }
    }
    const count = seenGroups.size;
    if (firstGroupInfo?.avatar) {
        return `<div class="conv-item-avatar conv-avatar-single" style="position:relative;">
            <img src="${firstGroupInfo.avatar}" alt="" />
            <span class="conv-avatar-count">${count}</span>
        </div>`;
    }
    return `<div class="conv-item-avatar conv-avatar-all" style="background:linear-gradient(135deg, ${firstGroupInfo?.color || '#6366F1'}, ${firstGroupInfo?.color || '#6366F1'}88);">
        <span style="font-size:14px;">👥</span>
        <span class="conv-avatar-count">${count}</span>
    </div>`;
}

function createConvSidebarItem(session, task) {
    const item = document.createElement('div');
    item.className = 'conv-sidebar-item' + (session.id === AppState.currentSessionId ? ' active' : '');
    item.dataset.convId = session.id;

    // 计算进度摘要（读取该 session 自己的 task）
    const sessionTask = session.task || (session.id === AppState.currentSessionId ? task : null);
    let previewText = '';
    let progressTag = '';
    if (sessionTask) {
        const agentIds = Object.keys(sessionTask.agentStatus || {}).filter(id => id !== 'coordinator');
        const activeIds = agentIds.filter(id => sessionTask.agentStatus[id] !== 'idle' && sessionTask.agentStatus[id] !== 'skipped');
        const doneCount = activeIds.filter(id => sessionTask.agentStatus[id] === 'done').length;
        const errorPhase = sessionTask.phase === 'error';

        if (errorPhase) {
            progressTag = '<span class="progress-tag error">出错</span>';
        } else if (activeIds.length > 0 && doneCount >= activeIds.length) {
            progressTag = '<span class="progress-tag done">✅ 完成</span>';
        } else if (activeIds.length > 0) {
            const pct = Math.round(activeIds.reduce((sum, id) => sum + (sessionTask.agentProgress[id] || 0), 0) / activeIds.length);
            progressTag = `<span class="progress-tag">🔄 ${pct}%</span>`;
        }

        if (sessionTask.name) {
            previewText = sessionTask.name;
        }
    }

    // 未读确认消息红点
    const pendingConfirm = (session._pendingConfirms || 0) > 0;
    const unreadDot = pendingConfirm ? '<span class="conv-unread-dot"></span>' : '';

    // 最近消息摘要
    const lastMsg = session.messages?.[session.messages.length - 1];
    const msgPreview =
        lastMsg ? (lastMsg.content || '').replace(/[#*`\n]/g, '').slice(0, 30)
                : '暂无消息';
    const timeStr = lastMsg?.time || '';

    if (!previewText) previewText = msgPreview;

    item.innerHTML = `
        ${generateConvAvatarHTML(session)}
        ${unreadDot}
        <div class="conv-item-body">
            <div class="conv-item-top">
                <span class="conv-item-name">${escapeHTML(session.name || '群聊')}</span>
                <span class="conv-item-time">${timeStr}</span>
            </div>
            <div class="conv-item-preview">${progressTag || escapeHTML(previewText)}</div>
        </div>`;

    item.addEventListener('click', () => {
        switchSession(session.id);
    });

    return item;
}

// 向后兼容：旧代码可能调 renderChatTabs
function renderChatTabs() { renderConvList(); }

function closeSessionTab(sessionId) {
    if (sessionId === 'group') return; // 群聊不能关闭
    const idx = AppState.sessions.findIndex(s => s.id === sessionId);
    if (idx < 0) return;

    AppState.sessions.splice(idx, 1);
    if (AppState.currentSessionId === sessionId) {
        switchSession('group');
    }
    renderChatTabs();
}

// ========================================
// 会话管理
// ========================================
function initDefaultSession() {
    const groupSession = {
        id: 'group',
        type: 'group',
        name: '创作工坊',
        icon: 'fa-users',
        color: '#07C160',
        messages: [],
        agentMessages: { artist: [], sound: [], engineer: [] },
        task: null,            // per-session task
        _pendingConfirms: 0,   // 待确认消息计数
        // per-session 状态（隔离不同群聊）
        _projectId: null,
        _sessionState: null,
        _mode: 'quick',
        _isGenerating: false,
        _abortController: null,
        _reviewOpen: false,     // ③ per-session 评审区状态
    };
    AppState.sessions = [groupSession];
    AppState.currentSessionId = 'group';

    // 清理 Collab 状态（切换/新建项目时防止状态泄漏）
    resetCollabState();
}

/**
 * 重置 Collab 相关状态 — 切换/新建项目时调用
 */
function resetCollabState() {
    // 1. 中断进行中的 SSE 流
    if (AppState.collabAbortController) {
        AppState.collabAbortController.abort();
        AppState.collabAbortController = null;
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
        DOM.chatInput.placeholder = '描述你想要的游戏，AI 团队协作帮你实现... 输入 @ 指定Agent';
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
        const groupSession = AppState.sessions.find(s => s.id === 'group');
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
            const groupSession = AppState.sessions.find(s => s.id === 'group');
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

function enterAgentChat(agentId) { /* no-op: 私聊已移除 */ }

// 空间下钻：已移除私聊功能，保留兼容
function drillIntoAgent(agentId) { /* no-op */ }

// 从单聊切换回群聊（已无私聊，保留兼容）
function drillBackToGroup() {
    switchSession('group');
}

function switchSession(sessionId) {
    // ② 保存当前 session 的运行状态
    const prevSession = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (prevSession) {
        prevSession._projectId = AppState.currentProjectId;
        prevSession._sessionState = AppState.sessionState;
        prevSession._mode = AppState.currentMode;
        prevSession._isGenerating = AppState.isGenerating;
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

    // 更新模式按钮 UI
    const modeBtnQuick = document.getElementById('modeBtnQuick');
    const modeBtnCollab = document.getElementById('modeBtnCollab');
    if (modeBtnQuick) modeBtnQuick.classList.toggle('active', AppState.currentMode === 'quick');
    if (modeBtnCollab) modeBtnCollab.classList.toggle('active', AppState.currentMode === 'collab');
    // 更新暂停按钮
    DOM.btnPause.style.display = AppState.isGenerating ? 'flex' : 'none';

    renderChatHeader(session);
    renderChatMessages(session);
    renderChatTabs();

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
    session.messages.forEach(msg => {
        // 兼容两种用户消息标志：type === 'user' 或 isUser === true（聊天历史格式）
        if (msg.type === 'user' || msg.isUser) {
            appendUserMessageDOM(msg);
        } else if (msg.type === 'system') {
            appendSystemMessageDOM(msg.content);
        } else {
            appendGroupMessageDOM(msg);
        }
    });
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
    if (!task || AppState.currentView !== 'group') {
        DOM.taskProgressBar.style.display = 'none';
        return;
    }

    const agentIds = Object.keys(task.agentStatus || {}).filter(id => id !== 'coordinator');
    const hasActivity = agentIds.some(id => task.agentStatus[id] !== 'idle');
    if (!hasActivity) {
        DOM.taskProgressBar.style.display = 'none';
        return;
    }

    DOM.taskProgressBar.style.display = 'block';

    // 按组聚合（包含所有有 agents_needed 的组，不过滤 idle）
    const groupProgress = {};
    const neededAgents = task.planData?.agents_needed || [];

    // 先从 planData 建基础组
    neededAgents.forEach(aid => {
        const agent = AGENTS[aid];
        if (!agent) return;
        const gn = agent.group;
        if (!groupProgress[gn]) {
            groupProgress[gn] = { agents: [], totalPct: 0, count: 0, allDone: true, anyWorking: false, anyError: false, anyIdle: false, subtasks: [], taskDesc: '' };
        }
        groupProgress[gn].agents.push(aid);
        groupProgress[gn].count++;
        const st = task.agentStatus[aid] || 'idle';
        const pct = task.agentProgress[aid] || 0;
        groupProgress[gn].totalPct += pct;
        if (st !== 'done') groupProgress[gn].allDone = false;
        if (st === 'working') groupProgress[gn].anyWorking = true;
        if (st === 'error') groupProgress[gn].anyError = true;
        if (st === 'idle') groupProgress[gn].anyIdle = true;
        // 收集任务描述
        if (task.planData?.agent_tasks?.[aid]) {
            groupProgress[gn].taskDesc = task.planData.agent_tasks[aid];
        }
        const subtasks = task.agentSubtasks[aid] || [];
        groupProgress[gn].subtasks.push(...subtasks);
    });

    // 补充非 planData 但有活动的 agent
    agentIds.forEach(agentId => {
        const agent = AGENTS[agentId];
        if (!agent) return;
        const st = task.agentStatus[agentId];
        if (st === 'skipped') return;
        const gn = agent.group;
        if (groupProgress[gn]?.agents?.includes(agentId)) return; // 已在 plan 中
        if (st === 'idle') return; // 不在 plan 中且 idle 的跳过
        if (!groupProgress[gn]) {
            groupProgress[gn] = { agents: [], totalPct: 0, count: 0, allDone: true, anyWorking: false, anyError: false, anyIdle: false, subtasks: [], taskDesc: '' };
        }
        groupProgress[gn].agents.push(agentId);
        groupProgress[gn].count++;
        groupProgress[gn].totalPct += (task.agentProgress[agentId] || 0);
        if (st !== 'done') groupProgress[gn].allDone = false;
        if (st === 'working') groupProgress[gn].anyWorking = true;
        if (st === 'error') groupProgress[gn].anyError = true;
    });

    // ===== 全局完成判断：所有组都 done 才算完成 =====
    const allGroups = Object.values(groupProgress);
    const allGroupsDone = allGroups.length > 0 && allGroups.every(gp => gp.allDone);
    const anyGroupError = allGroups.some(gp => gp.anyError);
    const overallPct = allGroups.length > 0
        ? Math.round(allGroups.reduce((sum, gp) => sum + (gp.count > 0 ? gp.totalPct / gp.count : 0), 0) / allGroups.length)
        : 0;

    // 顶部摘要
    const summaryEl = document.getElementById('tpHeaderSummary');
    if (summaryEl) {
        if (anyGroupError) {
            summaryEl.textContent = `出错 ❌`;
            summaryEl.style.color = '#DC2626';
        } else if (allGroupsDone) {
            summaryEl.textContent = '全部完成 ✅';
            summaryEl.style.color = 'var(--status-success)';
        } else {
            summaryEl.textContent = `${overallPct}%`;
            summaryEl.style.color = '';
        }
    }

    // 收折时的摘要 pills
    const collapsedRow = document.getElementById('tpCollapsedRow');
    if (collapsedRow) {
        collapsedRow.style.display = AppState.progressExpanded ? 'none' : 'flex';
        if (!AppState.progressExpanded) {
            const pills = Object.entries(groupProgress).map(([groupName, gp]) => {
                const groupInfo = AGENT_GROUPS[groupName];
                if (!groupInfo) return '';
                const pct = gp.count > 0 ? Math.round(gp.totalPct / gp.count) : 0;
                const dotCls = gp.allDone ? 'done' : gp.anyWorking ? 'working' : 'idle';
                return `<div class="tp-collapsed-pill" data-agent="${gp.agents[0] || ''}">
                    <span class="tp-collapsed-dot ${dotCls}" style="background:${groupInfo.color}"></span>
                    <span class="tp-collapsed-text">${groupInfo.nickname || groupName}</span>
                    ${gp.allDone ? '<i class="fas fa-check" style="color:var(--status-success);font-size:9px"></i>' : gp.anyIdle ? '<span class="tp-collapsed-pct">等待</span>' : `<span class="tp-collapsed-pct">${pct}%</span>`}
                </div>`;
            }).filter(Boolean).join('');
            collapsedRow.innerHTML = pills;
            collapsedRow.querySelectorAll('.tp-collapsed-pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (pill.dataset.agent) drillIntoAgent(pill.dataset.agent);
                });
            });
        }
    }

    // ===== 展开时：合并任务清单 + 圆圈进度 =====
    const body = document.getElementById('taskProgressBody');
    if (body) {
        body.style.display = AppState.progressExpanded ? 'block' : 'none';
    }

    // 移除旧的独立 planCard（合并进统一面板）
    const oldPlanCard = document.getElementById('tpPlanCard');
    if (oldPlanCard) oldPlanCard.remove();

    // 渲染合并后的统一任务列表（2×3 grid）
    DOM.taskProgressAgents.innerHTML = Object.entries(groupProgress).map(([groupName, gp]) => {
        const groupInfo = AGENT_GROUPS[groupName];
        if (!groupInfo) return '';
        const pct = gp.count > 0 ? Math.round(gp.totalPct / gp.count) : 0;
        const avatarHTML =
            groupInfo.avatar
                ? `<img src="${
                      groupInfo
                          .avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
                : `<i class="fas ${groupInfo.icon}"></i>`;

        // 紧凑圆圈进度
        const circleSize = 24;
        const strokeWidth = 2.5;
        const radius = (circleSize - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const dashOffset = circumference - (pct / 100) * circumference;

        let statusHTML;
        if (gp.anyError) {
            statusHTML = `<i class="fas fa-times-circle" style="color:#DC2626;font-size:14px;"></i>`;
        } else if (gp.allDone) {
            statusHTML = `<i class="fas fa-check-circle" style="color:var(--status-success);font-size:14px;"></i>`;
        } else if (gp.anyIdle && !gp.anyWorking) {
            statusHTML = `<span style="font-size:9px;color:var(--text-tertiary);font-weight:600;">等待</span>`;
        } else {
          statusHTML = `<div class="tp-circle-wrap">
                <svg width="${circleSize}" height="${
              circleSize}" class="tp-circle-svg">
                    <circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${
              radius}" fill="none" stroke="var(--border-lighter)" stroke-width="${
              strokeWidth}" />
                    <circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${
              radius}" fill="none" stroke="${groupInfo.color}" stroke-width="${
              strokeWidth}" 
                        stroke-dasharray="${
              circumference}" stroke-dashoffset="${
              dashOffset}" stroke-linecap="round"
                        transform="rotate(-90 ${circleSize / 2} ${
              circleSize /
              2})" style="transition:stroke-dashoffset 0.5s ease;" />
                </svg>
                <span class="tp-circle-text">${pct}%</span>
            </div>`;
        }

        // 任务描述行
        const taskDesc = gp.taskDesc || (gp.subtasks.length > 0 ? gp.subtasks.map(st => st.name).join('、') : '');
        const descHTML = taskDesc ? `<div class="tp-task-desc">${escapeHTML(taskDesc)}</div>` : '';
        const estimatedTime = GROUP_ESTIMATED_TIME[groupName] || '';

        return `
            <div class="task-progress-item" data-agent="${gp.agents[0] || ''}" title="${getGroupDisplayName(groupName)} · ${groupInfo.personality || groupInfo.desc}">
                <div class="tp-item-header">
                    <div class="tp-avatar" style="background:${groupInfo.color}22">${avatarHTML}</div>
                    <div class="tp-info">
                        <div class="tp-name-row">
                            <span class="tp-name">${getGroupDisplayName(groupName)}</span>
                            ${statusHTML}
                        </div>
                        ${estimatedTime ? `<div style="font-size:9px;color:var(--text-tertiary);font-family:monospace;">${estimatedTime}</div>` : ''}
                        ${descHTML}
                    </div>
                </div>
            </div>`;
    }).join('');

    // 点击 item 进入 Agent 聊天
    DOM.taskProgressAgents.querySelectorAll('.task-progress-item').forEach(item => {
        item.addEventListener('click', () => drillIntoAgent(item.dataset.agent));
    });
}

// ========================================
// 欢迎界面
// ========================================
function renderWelcomeScreen(session) {
    if (!session) session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
    if (!session) return;

    // 团队工位面板 HTML
    const teamStationsHTML = Object.entries(AGENT_GROUPS).map(([groupName, groupInfo]) => {
        const avatarHTML = groupInfo.avatar
            ? `<img src="${groupInfo.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
            : `<i class="fas ${groupInfo.icon}" style="color:${groupInfo.color};"></i>`;
        return `<div class="team-station">
            <div class="team-station-avatar" style="background:${groupInfo.color}12;border:2px solid ${groupInfo.color}25">${avatarHTML}</div>
            <div class="team-station-name">${groupName} ${groupInfo.nickname || groupName}</div>
            <div class="team-station-desc">${groupInfo.personality || ''}</div>
        </div>`;
    }).join('');

    DOM.welcomeScreen.innerHTML = `
        <div class="welcome-hero">
            <div class="welcome-icon"><i class="fas fa-gamepad"></i></div>
            <div class="welcome-title">WeCreat</div>
            <div class="welcome-desc">描述你的创意，AI 团队帮你实现</div>
        </div>
        <div class="welcome-suggestions">
            <div class="welcome-suggestion" data-prompt="做一个太空射击小游戏">🚀 太空射击</div>
            <div class="welcome-suggestion" data-prompt="做一个像素风格的贪吃蛇">🐍 贪吃蛇</div>
            <div class="welcome-suggestion" data-prompt="做一个卡通风格的记忆翻牌">🃏 记忆翻牌</div>
        </div>
        <div class="team-stations-panel">
            <div class="team-stations-title">你的 AI 创作团队</div>
            <div class="team-stations-grid">${teamStationsHTML}</div>
        </div>`;

    DOM.welcomeScreen.style.display = 'flex';

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
    const sid = targetSessionId || AppState.currentSessionId || 'group';
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
        appendSystemMessageDOM(text);
    }
}

function getCurrentGroupSession() {
    return AppState.sessions.find(s => s.id === 'group') || AppState.sessions[0];
}

/** 获取发起当前操作的 session ID（用于闭包捕获） */
function getCapturedSessionId() {
    return AppState.currentSessionId || 'group';
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
    marked.setOptions({
        breaks: true,       // 换行符转 <br>
        gfm: true,          // GitHub Flavored Markdown
        headerIds: false,
        mangle: false,
    });
    console.log('[Markdown] marked.js loaded ✅');
} else {
    console.warn('[Markdown] marked.js NOT loaded, using built-in fallback');
}

function renderMarkdown(text) {
    if (!text) return '';
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

    // B1: 消息头统一用「角色 昵称」格式
    const isGroupRep = agent.id === groupRep.id;
    const groupDispName = getGroupDisplayName(groupName);
    const agentLabel = isGroupRep ? groupDispName : `${groupDispName} · ${agent.name}`;
    const agentSubLabel = isGroupRep ? '' : `<span class="msg-sub-agent">${agent.name}</span>`;

    // B2: 消息折叠 → 摘要卡片（长文自动进评审区）
    let bubbleContent = renderMarkdown(msg.content || '') + extraHTML;
    if (!hasExtra && msg.content && msg.content.length > MSG_COLLAPSE_THRESHOLD) {
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
    const dotClass = data.status === 'working' ? 'working' : '';
    return `
        <div class="status-inline">
            <span class="status-inline-dot ${dotClass}" style="background:${agent?.color}"></span>
            <span class="status-inline-text">${data.text || agent?.name + ' 工作中'}</span>
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
    const groupSession = AppState.sessions.find(s => s.id === 'group');
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
            confirmRequirementPick(dim, sty, pickerData.gameType, pickerData.mentioned);
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
function toggleReviewPanel(show) {
    if (!DOM.reviewPanel) return;
    const leftHandle = DOM.resizeHandleLeft;

    if (show) {
        DOM.reviewPanel.classList.remove('collapsed');
        // 展开时恢复左 handle（分隔对话和评审区）
        if (leftHandle) leftHandle.classList.remove('hidden');
        // 恢复 chat-panel 固定宽度模式
        DOM.chatPanel.style.flex = '';
        DOM.chatPanel.style.width = AppState._savedChatWidth || 'var(--chat-panel-width)';
        AppState.reviewOpen = true;
    } else {
        DOM.reviewPanel.classList.add('collapsed');
        // 折叠时隐藏左 handle（对话面板通过右 handle 和预览区分隔）
        if (leftHandle) leftHandle.classList.add('hidden');
        // 保存当前宽度，然后让 chat-panel flex:1 填满评审区空出的空间
        AppState._savedChatWidth = DOM.chatPanel.style.width || 'var(--chat-panel-width)';
        DOM.chatPanel.style.flex = '1';
        DOM.chatPanel.style.width = 'auto';
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
    // 「新建群聊」按钮绑定（现在在 conv-sidebar 中）
    const btnNewConv = document.getElementById('btnNewConv');
    if (btnNewConv) {
        btnNewConv.addEventListener('click', showNewSessionModal);
    }
    // 首次渲染
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
    const agent = getAgent(agentId);
    const agentEmoji = agent ? agent.emoji : '📄';
    const tabId = `agent-${agentId || 'unknown'}`;

    // Tab 名用 title（实际文件/内容名）而非角色名
    const tabLabel = `${agentEmoji} ${title || '文档'}`;

    const pane = ensureReviewPane(tabId, '', tabLabel, (p) => {
        p.innerHTML = `<div class="agent-review-viewer"></div>`;
    });
    if (!pane) return;
    // V4: 不自动弹出评审区，改为红点通知
    notifyReviewUpdate(tabId);

    // 追加内容到 viewer（同一 agent 可能多次产出）
    const viewer = pane.querySelector('.agent-review-viewer');
    if (!viewer) return;

    // 如果已有内容，加分隔线
    if (viewer.children.length > 0) {
        const divider = document.createElement('hr');
        divider.className = 'agent-review-divider';
        viewer.appendChild(divider);
    }

    // 渲染内容
    const section = document.createElement('div');
    section.className = 'agent-review-section';
    section.innerHTML = renderMarkdown(content);
    viewer.appendChild(section);
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
        document.querySelector('.topbar-btn[data-tool="layout"]')?.classList.add('active');
    } else {
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
function showNewSessionModal() { DOM.newSessionModal.style.display = 'flex'; bindNewSessionModal(); }
function hideNewSessionModal() { DOM.newSessionModal.style.display = 'none'; }

function bindNewSessionModal() {
    let selectedGroups = []; // 选中的角色组名

    const roleGrid = document.getElementById('roleGrid');
    const convGroupName = document.getElementById('convGroupName');

    // V4: 加载已有项目列表到下拉选择器
    const projectSelector = document.getElementById('projectSelector');
    if (projectSelector) {
        // 保留第一个"新建项目"选项，清空其余
        while (projectSelector.options.length > 1) projectSelector.remove(1);
        // 异步加载项目
        ProjectManager.load().then(() => {
            ProjectManager.projects.forEach(proj => {
                const opt = document.createElement('option');
                opt.value = proj.id;
                opt.textContent = `📁 ${proj.name || proj.id}`;
                projectSelector.appendChild(opt);
            });
        });
    }

    // 角色组多选（6 组）— 展示昵称 + 一句话简介
    let groupRoleHTML = '';
    for (const [groupName, groupInfo] of Object.entries(AGENT_GROUPS)) {
        const avatarInner = groupInfo.avatar
            ? `<img src="${groupInfo.avatar}" alt="${groupName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
            : `<i class="fas ${groupInfo.icon}" style="color:#fff;font-size:18px;"></i>`;
        const nicknameHTML = groupInfo.nickname ? `<span class="role-nickname">${groupInfo.nickname}</span>` : '';
        groupRoleHTML += `<div class="role-card" data-group="${groupName}">
            <div class="role-avatar" style="background:${groupInfo.color};">${avatarInner}</div>
            <div class="role-card-info">
                <span class="role-card-name">${groupName} ${nicknameHTML}</span>
                <div class="role-personality">${groupInfo.personality || groupInfo.desc}</div>
            </div>
        </div>`;
    }
    if (roleGrid) {
        roleGrid.innerHTML = groupRoleHTML;
        roleGrid.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('selected');
                const group = card.dataset.group;
                if (card.classList.contains('selected')) {
                    if (!selectedGroups.includes(group)) selectedGroups.push(group);
                } else {
                    selectedGroups = selectedGroups.filter(g => g !== group);
                }
            });
        });
    }

    // 创建按钮
    document.getElementById('btnCreateSession').onclick = () => {
        // 自动根据选中角色组生成群名
        let name = convGroupName?.value?.trim();
        if (!name) {
            if (selectedGroups.length === 0) {
                name = '创作工坊';
            } else if (selectedGroups.length === 1) {
                name = `和${selectedGroups[0]}聊聊`;
            } else if (selectedGroups.length <= 3) {
                name = selectedGroups.join(' & ');
            } else {
                name = `${selectedGroups.slice(0, 2).join('、')} 等${selectedGroups.length}人`;
            }
        }
        // V4: 获取选中的项目 ID
        const selectedProjectId = projectSelector?.value || null;
        // 将选中的角色组展开为具体 Agent IDs
        const agentIds = selectedGroups.flatMap(g => getAgentIdsByGroup(g));
        createGroupConversation(name, agentIds, selectedProjectId);
        hideNewSessionModal();
        renderConvList();
    };
}

// 创建群聊会话
function createGroupConversation(name, agentIds, existingProjectId) {
    const id = 'grp_' + generateId();
    const session = {
        id,
        type: 'group',
        name,
        icon: 'fa-users',
        color: '#6366F1',
        messages: [],
        agents: agentIds,
        task: null,            // per-session task
        _pendingConfirms: 0,   // 待确认消息计数
        // per-session 状态（隔离不同群聊）
        _projectId: existingProjectId || null, // V4: 可关联已有项目
        _sessionState: null,
        _mode: 'quick',
        _isGenerating: false,
        _abortController: null,
        _reviewOpen: false,
    };
    AppState.sessions.push(session);
    switchSession(id);
}

function showSaveVersionModal() { DOM.saveVersionModal.style.display = 'flex'; }
function hideSaveVersionModal() { DOM.saveVersionModal.style.display = 'none'; }

// ========================================
// @提及 功能（输入@时弹出下拉列表）
// ========================================
function showMentionDropdown() {
    AppState.mentionActive = true;
    // 按 6 个角色组合并展示（不暴露 22 个细分 Agent）
    let html = '';
    let idx = 0;
    for (const [groupName, groupInfo] of Object.entries(AGENT_GROUPS)) {
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
    const hasDimension = /2[dD]|3[dD]|二维|三维/.test(text);
    const hasStyle = /像素|卡通|写实|赛博|霓虹|复古|可爱|简约|扁平|暗黑|科幻/.test(text);
    const hasGameType = /贪吃蛇|射击|跑酷|消除|塔防|RPG|解谜|2048|翻牌|俄罗斯|冒险|跳跃/.test(text);
    return hasGameType && (hasDimension || hasStyle);
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
    // BUG 1.1 fix: 防止并发生成——如果正在生成中，忽略新的发送请求
    if (AppState.isGenerating) {
        console.warn('[handleSend] 已在生成中，忽略重复发送');
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

    const session = AppState.sessions.find(s => s.id === AppState.currentSessionId);
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
                realMultiAgentGeneration(fullText, mentioned);
            }
        } else {
            simulateMultiAgentGeneration(fullText, mentioned);
        }
    } else {
        addUserMessage(fullText);
        if (AppState.useRealAPI && session.role) {
            realSingleAgentChat(session, fullText);
        } else {
            simulateAgentReply(session);
        }
    }
}

// 单 Agent 真实 API 对话
async function realSingleAgentChat(session, prompt) {
    const agentId = session.role;
    if (!agentId) return;

    // 确保有项目 ID
    if (!AppState.currentProjectId) {
        try {
            const res = await fetch(`${AppState.apiBaseUrl}/api/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '对话项目' }) });
            if (res.ok) {
                const data = await res.json();
                AppState.currentProjectId = data.projectId;
            }
        } catch (e) {
            const msg = { agentId, content: `❌ 无法连接后端: ${e.message}`, time: getTimeStr() };
            session.messages.push(msg);
            if (AppState.currentSessionId === session.id) appendGroupMessageDOM(msg);
            return;
        }
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const sseUrl = `${AppState.apiBaseUrl}/api/generate/${AppState.currentProjectId}?prompt=${encodedPrompt}&agentId=${agentId}`;
    // BUG 2.3 fix: 关闭旧的 EventSource + 存入 AppState 以便 pauseCurrentTask 清理
    if (AppState.eventSource) {
        AppState.eventSource.close();
        AppState.eventSource = null;
    }
    const eventSource = new EventSource(sseUrl);
    AppState.eventSource = eventSource;
    AppState.isGenerating = true;

    let streamContent = '';
    let streamEl = null;

    eventSource.addEventListener('agent_message', (e) => {
        try {
            const data = JSON.parse(e.data);
            const content = data.content || '';
            if (!content.trim()) return;

            streamContent += (streamContent ? '\n' : '') + content;

            if (!streamEl) {
                const msg = { agentId, content: streamContent, time: getTimeStr() };
                session.messages.push(msg);
                if (AppState.currentSessionId === session.id) {
                    appendGroupMessageDOM(msg);
                    // 获取刚添加的元素用于后续更新
                    const msgs = DOM.chatMessages.querySelectorAll('.message.ai');
                    streamEl = msgs[msgs.length - 1]?.querySelector('.message-bubble');
                }
            } else {
                streamEl.innerHTML = renderMarkdown(streamContent);
                scrollToBottom();
            }
        } catch {
        }
    });

    eventSource.addEventListener('status', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.phase === 'completed') {
                // 如果是 coder 类 agent（工程师组），加载预览
                const agentInfo = getAgent(agentId);
                if (agentInfo && agentInfo.role === 'coder' && AppState.currentProjectId) {
                    loadPreviewIframe(AppState.currentProjectId);
                }
            }
        } catch {
        }
    });

    eventSource.addEventListener('done', () => {
        eventSource.close();
        AppState.eventSource = null;
        AppState.isGenerating = false;
    });
    eventSource.onerror = () => {
        eventSource.close();
        AppState.eventSource = null;
        AppState.isGenerating = false;
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
    '审核': '~15s',
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
      console.warn('[ProjectManager] load failed, keeping local data:', e);
      // Keep existing local projects when API is unavailable
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
      console.warn('[ProjectManager] create failed, using local fallback:', e);
    }
    // Local fallback: create project in memory when API is unavailable
    const localId = 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const newProj = { id: localId, name: name || '新作品', hasGame: false, createdAt: new Date().toISOString() };
    this.projects.push(newProj);
    return localId;
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
    // 切换项目时重置聊天区
    initDefaultSession();
    renderChatHeader(AppState.sessions[0]);
    renderWelcomeScreen(AppState.sessions[0]);
    renderChatTabs();
    // 从持久化恢复聊天历史
    loadChatHistory(projectId);
    // 清空素材坞假数据
    clearAssetDock();
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
          const name = prompt('作品名称：') || '新作品';
          const projectId = await this.create(name);
          if (projectId) {
            AppState.currentProjectId = projectId;
            DOM.projectTitle.textContent = name;
            resetPreviewToDemo();
            // 重置任务状态
            AppState.task = null;
            DOM.projectStatus.style.display = 'none';
            updateGlobalProgress();
            // 重置聊天区
            initDefaultSession();
            renderChatHeader(AppState.sessions[0]);
            renderWelcomeScreen(AppState.sessions[0]);
            renderChatTabs();
            // 清空素材坞
            clearAssetDock();
            this.close();
            addGroupMessage('coordinator',
                            `📁 新作品「${name}」已创建，开始创作吧！`);
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
async function realMultiAgentGeneration(prompt, mentioned) {
    // v14 fix: 闭包捕获发起请求的 sessionId，所有回调都用这个
    const _originSessionId = getCapturedSessionId();
    AppState.isGenerating = true;
    DOM.btnPause.style.display = 'flex';
    addUserMessage(prompt, mentioned);

    await delay(300);
    if (!AppState.isGenerating) return;

    const task = getCurrentTask();
    if (!task) { AppState.isGenerating = false; DOM.btnPause.style.display = 'none'; return; }
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
        AppState.isGenerating = false;
        DOM.btnPause.style.display = 'none';
        return;
    }

    await delay(300);
    if (!AppState.isGenerating) return;

    // 阶段2: 连接 SSE（不再硬编码编排方案，等 coordinator 分析后动态展示）
    addGroupMessage('coordinator', '🎬 **正在分析你的需求...**', undefined, undefined, _originSessionId);

    const encodedPrompt = encodeURIComponent(prompt);
    const sseUrl = `${AppState.apiBaseUrl}/api/orchestrate/${AppState.currentProjectId}?prompt=${encodedPrompt}`;

    // BUG 1.2 fix: 先关闭旧的 EventSource 连接，防止泄漏
    if (AppState.eventSource) {
        AppState.eventSource.close();
        AppState.eventSource = null;
    }
    const eventSource = new EventSource(sseUrl);
    AppState.eventSource = eventSource;

    // --- SSE 事件处理 ---

    // 记录本次编排实际需要的 agent（由 orchestrate_plan 动态设置）
    let activeAgents = ['coordinator', ...Object.keys(task.agentStatus)]; // 默认全部，收到 plan 后更新

    // V4: 意图分类事件
    eventSource.addEventListener('intent_classifying', () => {
        addSystemMessage('⚡ 正在快速分析请求类型...', _originSessionId);
    });

    eventSource.addEventListener('intent_classified', (e) => {
        try {
            const data = JSON.parse(e.data);
            const intentLabels = {
                'tweak': '🔧 微调模式',
                'bugfix': '🐛 修 Bug 模式',
                'feature': '✨ 新功能模式',
                'new_game': '🎮 全新项目模式',
            };
            const label = intentLabels[data.intent] || data.intent;
            addSystemMessage(`${label} — ${data.reason || ''}`, _originSessionId);
        } catch { /* ignore */ }
    });

    // V4: Checkpoint 等待/结果事件
    eventSource.addEventListener('checkpoint_waiting', () => {
        addSystemMessage('⏳ 等待确认编排方案...', _originSessionId);
    });

    eventSource.addEventListener('checkpoint_result', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.action === 'proceed') {
                addSystemMessage('✅ 方案已确认，团队开始工作！', _originSessionId);
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
                if (data.checkpoint) {
                    renderCheckpointCard(data, resolvedNeeded, _originSessionId);
                    updateGlobalProgress();
                    renderConvList();
                    return; // 等用户确认后再展开进度面板
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

    // Coordinator 流式输出——聊天里展示摘要卡片，评审区实时展示完整内容
    let _streamCardEl = null;    // 聊天里的摘要卡片元素
    let _streamReviewEl = null;  // 评审区的内容展示元素
    let _streamFullContent = ''; // 已累积的完整文本

    eventSource.addEventListener('stream_delta', (e) => {
        try {
            const data = JSON.parse(e.data);
            const agentId = data.agentId || 'coordinator';
            const delta = data.delta || '';
            const done = data.done || false;

            if (done) {
                // 流式结束——保存到 session
                if (_streamFullContent) {
                    const targetSession = AppState.sessions.find(s => s.id === _originSessionId) || getCurrentGroupSession();
                    if (targetSession) {
                        targetSession.messages.push({
                            agentId: agentId,
                            content: _streamFullContent,
                            time: getTimeStr(),
                        });
                        saveChatHistory();
                    }
                }
                // 更新聊天卡片——短文本直接显示完整内容，长文本显示摘要+评审区链接
                if (_streamCardEl && _streamFullContent) {
                    if (_streamFullContent.length <= MSG_COLLAPSE_THRESHOLD) {
                        // 短回复：直接替换为完整 Markdown 渲染
                        const bubble = _streamCardEl.closest('.message-bubble') || _streamCardEl.querySelector('.stream-card-body');
                        if (bubble) {
                            bubble.innerHTML = renderMarkdown(_streamFullContent);
                        }
                        const badge = _streamCardEl.querySelector('.stream-status-badge');
                        if (badge) {
                            badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
                            badge.className = 'stream-status-badge done';
                        }
                    } else {
                        const points = extractSummaryPoints(_streamFullContent);
                        const pointsHTML = points.map(p => `<li>${escapeHTML(p)}</li>`).join('');
                        const wordCount = _streamFullContent.length;
                        const headingCount = (_streamFullContent.match(/^#+\s/gm) || []).length;
                        let statsText = `${wordCount}字`;
                        if (headingCount > 0) statsText += ` · ${headingCount}个章节`;
                        const cardBody = _streamCardEl.querySelector('.stream-card-body');
                        if (cardBody) {
                            cardBody.innerHTML = `
                                <div class="msg-summary-points"><ul>${pointsHTML}</ul></div>
                                <div class="msg-summary-meta"><i class="fas fa-file-lines"></i> ${statsText}</div>
                                <button class="msg-collapse-toggle" onclick="openReviewTab('agent-${agentId}')">
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
                _streamFullContent = '';
                return;
            }

            if (!delta.trim()) return;
            _streamFullContent += delta;

            if (!_streamCardEl) {
                // 创建聊天里的摘要卡片（带"生成中"状态）
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
                                <div class="stream-status-badge generating"><i class="fas fa-spinner fa-spin"></i> 方案生成中...</div>
                                <div class="stream-card-body">
                                    <div class="stream-preview-text">${escapeHTML(_streamFullContent.slice(0, 80))}...</div>
                                </div>
                            </div>
                        </div>
                        <div class="message-time">${getTimeStr()}</div>
                    </div>`;
                const avatarEl = el.querySelector('[data-agent-click]');
                if (avatarEl) avatarEl.addEventListener('click', () => enterAgentChat(avatarEl.dataset.agentClick));
                DOM.chatMessages.appendChild(el);
                _streamCardEl = el.querySelector('.stream-summary-card');
                _lastMsgEl = el;
                _lastMsgAgentId = agentId;
                _lastMsgTime = Date.now();

                // 同时在评审区创建实时更新 tab
                const docTitle = `${getAgentDisplayName(agentId)} · 方案`;
                addDocToReview(docTitle, _streamFullContent, agentId);
                const tabId = `agent-${agentId}`;
                const pane = DOM.reviewContent?.querySelector(`.review-pane[data-pane="${tabId}"]`);
                if (pane) {
                    _streamReviewEl = pane.querySelector('.agent-review-section:last-child');
                }
            } else {
                // 更新聊天卡片的预览文字
                const previewEl = _streamCardEl.querySelector('.stream-preview-text');
                if (previewEl) {
                    const previewText = _streamFullContent.slice(0, 120).replace(/\n/g, ' ');
                    previewEl.textContent = previewText + '...';
                }
                // 实时更新评审区完整内容
                if (_streamReviewEl) {
                    _streamReviewEl.innerHTML = renderMarkdown(_streamFullContent);
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
                AppState.isGenerating = false;
                DOM.btnPause.style.display = 'none';
                updateGlobalProgress();
            } else if (data.phase === 'error') {
                addGroupMessage('coordinator', `❌ ${data.message}`, undefined, undefined, _originSessionId);
                task.phase = 'error';
                AppState.isGenerating = false;
                DOM.btnPause.style.display = 'none';
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
            const agentId = data.agentId || 'coordinator';
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
                updateGlobalProgress();
            }
        } catch (err) { /* ignore */ }
    });

    eventSource.addEventListener('error_msg', (e) => {
        try {
            const data = JSON.parse(e.data);
            const errorAgentId = data.agentId ? (resolveAgentId(data.agentId) || data.agentId) : null;
            addGroupMessage('coordinator', `❌ 错误: ${data.message}`, undefined, undefined, _originSessionId);
            AppState.isGenerating = false;
            DOM.btnPause.style.display = 'none';
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
        AppState.eventSource = null;
    });

    eventSource.onerror = (e) => {
        console.error('[WeCreat SSE] Connection error:', e);
        if (AppState.isGenerating) {
            addGroupMessage('coordinator', '⚠️ 与后端的连接中断，请检查服务状态', undefined, undefined, _originSessionId);
            AppState.isGenerating = false;
            DOM.btnPause.style.display = 'none';
        }
        eventSource.close();
        AppState.eventSource = null;
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
    AppState.isGenerating = true;
    DOM.btnPause.style.display = 'flex';
    addUserMessage(prompt, mentioned);

    const _originSessionId = getCapturedSessionId();
    await delay(300);
    if (!AppState.isGenerating) return;

    const task = getCurrentTask();
    if (!task) { AppState.isGenerating = false; DOM.btnPause.style.display = 'none'; return; }
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
        AppState.isGenerating = false;
        DOM.btnPause.style.display = 'none';
        return;
    }

    addGroupMessage('coordinator', '🎬 **Collab 模式：正在分析你的需求...**\n协作会话已开启，小助手将给出方案供你确认。', undefined, undefined, _originSessionId);
    updatePhaseIndicator('brainstorm');

    // BUG 1.3 fix: 先 abort 旧的 controller 再创建新的
    if (AppState.collabAbortController) {
        AppState.collabAbortController.abort();
    }
    const controller = new AbortController();
    AppState.collabAbortController = controller;

    const url = `${AppState.apiBaseUrl}/api/sessions/${AppState.currentProjectId}/start`;

    // 流式卡片状态
    let _streamCardEl = null;
    let _streamReviewEl = null;
    let _streamContent = '';

    await fetchSSE(url, { prompt }, {
        onEvent(eventName, data) {
            if (!AppState.isGenerating) return;

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
                                    <div class="stream-status-badge generating"><i class="fas fa-spinner fa-spin"></i> 方案生成中...</div>
                                    <div class="stream-card-body">
                                        <div class="stream-preview-text">${escapeHTML(_streamContent.slice(0, 80))}...</div>
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
                const agentId = resolveAgentId(data.agentId) || data.agentId || 'coordinator';
                const content = data.content || '';
                if (content.trim()) {
                    addGroupMessage(agentId, content, undefined, undefined, _originSessionId);
                }
            } else if (eventName === 'agent_registry') {
                // Agent 注册表，前端已内置，忽略
            } else if (eventName === 'error_msg') {
                addGroupMessage('coordinator', `❌ ${data.message}`, undefined, undefined, _originSessionId);
                AppState.isGenerating = false;
                DOM.btnPause.style.display = 'none';
            } else if (eventName === 'done') {
                // 流结束
            }
        },
        onError(err) {
            addGroupMessage('coordinator', `❌ 协作会话启动失败: ${err.message}`, undefined, undefined, _originSessionId);
            AppState.isGenerating = false;
            DOM.btnPause.style.display = 'none';
        },
        onDone() {
            AppState.collabAbortController = null;
            // BUG 1.4 fix: 如果等待用户响应，重置 isGenerating 让输入框可用
            // 如果不是 waitingForUser，也重置以防死锁
            if (AppState.sessionState?.orchestration?.waitingForUser || !AppState.isGenerating) {
                AppState.isGenerating = false;
            } else {
                // stream 异常结束没有设置等待状态，也要重置避免死锁
                AppState.isGenerating = false;
            }
            DOM.btnPause.style.display = 'none';
            console.log('[collabStart] SSE stream ended');
        },
    }, controller);
}

/**
 * Collab Mode: 用户回复/确认
 * POST /api/sessions/:projectId/respond → SSE 流
 */
async function realCollabRespond(response, agentId) {
    AppState.isGenerating = true;
    DOM.btnPause.style.display = 'flex';

    const _originSessionId = getCapturedSessionId();

    // BUG 1.3 fix: 先 abort 旧的 controller
    if (AppState.collabAbortController) {
        AppState.collabAbortController.abort();
    }
    const controller = new AbortController();
    AppState.collabAbortController = controller;

    const url = `${AppState.apiBaseUrl}/api/sessions/${AppState.currentProjectId}/respond`;
    const task = getCurrentTask();

    await fetchSSE(url, { response, agentId }, {
        onEvent(eventName, data) {
            if (!AppState.isGenerating) return;

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
                AppState.isGenerating = false;
                DOM.btnPause.style.display = 'none';
            } else if (eventName === 'done') {
                // 流结束
            }
        },
        onError(err) {
            addGroupMessage('coordinator', `❌ 协作回复失败: ${err.message}`, undefined, undefined, _originSessionId);
            AppState.isGenerating = false;
            DOM.btnPause.style.display = 'none';
        },
        onDone() {
            AppState.collabAbortController = null;
            DOM.btnPause.style.display = 'none';
            console.log('[collabRespond] SSE stream ended');
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
        const sid = targetSessionId || AppState.currentSessionId || 'group';
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
    AppState.isGenerating = true;
    DOM.btnPause.style.display = 'flex';
    addUserMessage(message, [agentId]);

    const _originSessionId = getCapturedSessionId();

    const agent = getAgent(agentId);
    addGroupMessage(agentId, `💬 正在思考...`, undefined, undefined, _originSessionId);

    // BUG 1.3 fix: 先 abort 旧的 controller
    if (AppState.collabAbortController) {
        AppState.collabAbortController.abort();
    }
    const controller = new AbortController();
    AppState.collabAbortController = controller;

    const url = `${AppState.apiBaseUrl}/api/sessions/${AppState.currentProjectId}/agent/${agentId}`;

    let _streamCardEl = null;
    let _streamReviewEl = null;
    let _streamContent = '';

    await fetchSSE(url, { message }, {
        onEvent(eventName, data) {
            if (!AppState.isGenerating) return;

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
                AppState.isGenerating = false;
                DOM.btnPause.style.display = 'none';
            }
        },
        onError(err) {
            addGroupMessage(agentId, `❌ 对话失败: ${err.message}`, undefined, undefined, _originSessionId);
            AppState.isGenerating = false;
            DOM.btnPause.style.display = 'none';
        },
        onDone() {
            AppState.collabAbortController = null;
            AppState.isGenerating = false;
            DOM.btnPause.style.display = 'none';
            console.log(`[collabAgentChat] @${agentId} done`);
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
    const previewUrl = `${AppState.apiBaseUrl}/preview/${projectId}/index.html?v=${Date.now()}`;
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
                fetch(`${AppState.apiBaseUrl}/api/projects/${projectId}/thumbnail`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dataUrl: thumbDataUrl }),
                }).then(res => {
                    if (res.ok) console.log(`[v21] Thumbnail captured for ${projectId}`);
                }).catch(() => {});
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
                        fetch(`${AppState.apiBaseUrl}/api/projects/${projectId}/thumbnail`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dataUrl: thumbCanvas.toDataURL('image/png') }),
                        }).catch(() => {});
                    }
                } catch {}
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
            <button class="error-fix-btn" data-fix-idx="${i}"><i class="fas fa-wrench"></i> 发送修复</button>
        </div>
    `).join('');
    // 绑定单条修复按钮
    DOM.errorPanelList.querySelectorAll('.error-fix-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.fixIdx);
            sendErrorToFix(idx);
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
    AppState.isGenerating = true;
    DOM.btnPause.style.display = 'flex';
    addUserMessage(prompt, mentioned);

    await delay(800);
    if (!AppState.isGenerating) return;

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

    const requirementClear = isRequirementClear(prompt);
    const detectedDim = detectGameDimension(prompt);
    const detectedStyle = detectGameStyle(prompt);

    if (requirementClear) {
        const dimText = detectedDim || '2D';
        const styleText = detectedStyle || '像素';

        // 阶段1: 需求分析
        addGroupMessage('coordinator', `🔍 **正在分析需求...**\n\n检测到游戏类型: ${gameType}\n维度: ${dimText}\n风格: ${styleText}风格`);

        await delay(1500);
        if (!AppState.isGenerating) return;

        // 阶段2: 详细策划方案
        const planContent = `📋 **策划方案已就绪**

🎮 **${gameType}** · ${dimText} · ${styleText}风格

━━━━━━━━━━━━━━━━━━━━━━

**一、核心玩法设计**

🎯 **游戏目标**
• 玩家操控战机击落敌机,累积分数
• 存活时间越长,难度递增
• 3次生命机会,挑战最高分记录

🕹️ **操控方式**
• 方向键/WASD: 控制战机移动
• 空格键/鼠标左键: 发射子弹
• P键: 暂停游戏

⚡ **核心机制**
• 子弹冷却: 0.3秒射击间隔
• 敌机生成: 每1.5秒刷新一波
• 难度曲线: 每30秒敌机速度+10%

━━━━━━━━━━━━━━━━━━━━━━

**二、角色与关卡设计**

🚀 **玩家战机**
• 移动速度: 6px/帧
• 碰撞体积: 32×32px
• 初始生命: 3点

👾 **敌机类型**
① 小型敌机: 血量1 · 移动快 · 分值10
② 中型敌机: 血量2 · 移动中 · 分值20
③ BOSS敌机: 血量5 · 移动慢 · 分值50

💥 **道具系统**
• ⭐ 护盾: 免疫一次伤害
• 💊 回复: 恢复1点生命
• ⚡ 强化: 双倍火力10秒

━━━━━━━━━━━━━━━━━━━━━━

**三、视觉风格方案**

🎨 **整体风格**
• ${styleText}风${dimText}画面,16:9宽屏适配
• 霓虹配色主题: 深蓝背景+荧光色点缀
• 粒子特效: 爆炸、尾焰、星空背景

🖼️ **UI设计**
• 开始界面: ${styleText}风LOGO + 开始按钮
• HUD界面: 左上角生命/右上角分数
• 结束界面: 最终得分 + 再来一局

━━━━━━━━━━━━━━━━━━━━━━

**四、音效设计方案**

🎵 **背景音乐**
• 主菜单BGM: 氛围感电子音乐
• 战斗BGM: 8-bit电子风格,节奏紧凑

🔊 **交互音效**
• 射击音效: 激光射击声
• 爆炸音效: 敌机击毁爆破
• 得分音效: 金币拾取反馈
• 失败音效: 低沉警告声

━━━━━━━━━━━━━━━━━━━━━━

**五、技术方案**

💻 **渲染引擎**
• Canvas 2D API
• 60fps流畅渲染
• 双缓冲防闪烁

📱 **适配方案**
• 响应式画布: 自适应屏幕尺寸
• 移动端适配: 触控操作支持
• 性能优化: 对象池+碰撞分区

💾 **数据存储**
• localStorage: 最高分持久化
• JSON配置: 游戏参数可调

━━━━━━━━━━━━━━━━━━━━━━

**六、预估产出**

✨ **完整可玩游戏**
• 完整游戏循环: 开始→游戏→结束
• 完整交互逻辑: 菜单/暂停/重开

🎨 **美术资产包** (12+)
• 角色: 战机×1 + 敌机×3 + 子弹×1
• UI: LOGO×1 + 按钮×3 + 图标×4
• 特效: 爆炸粒子×1 + 背景星空×1

🎵 **音效资产包** (10)
• BGM: 2首 (菜单+战斗)
• SFX: 8个 (射击×2 + 爆炸×3 + 音效×3)

💻 **代码交付**
• 核心代码: 639行
• 模块化架构: 场景管理、对象池
• 注释完整: 关键逻辑说明`;

        addGroupMessage('coordinator', planContent, 'plan_confirm_inline');
    } else {
        addGroupMessage('coordinator', `确认一下需求「${gameType}」，请选择：`);
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
}

function confirmRequirementPick(dim, style, gameType, mentioned) {
    addSystemMessage(`已确认：${dim} · ${style}风格`);
    addGroupMessage('coordinator', `📋 **策划方案已就绪**\n\n🎮 ${gameType || '小游戏'} · ${dim} · ${style}风格\n\n✨ 核心玩法设计完成\n🎨 视觉风格方案确定\n🔊 音效风格规划完成\n💻 技术方案已确认`, 'plan_confirm_inline');
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
    AppState.isGenerating = false;
    DOM.btnPause.style.display = 'none';
    return;
  }
  task.phase = 'agents_working';
  updateGlobalProgress();

  await delay(1200);
  if (!AppState.isGenerating)
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
        await delay(1800);
        if (!AppState.isGenerating) return;

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
    AppState.isGenerating = false;
    DOM.btnPause.style.display = 'none';
    DOM.projectStatus.className = 'project-status completed';
    DOM.projectStatus.textContent = '已完成';

    updateGlobalProgress();
    autoSaveVersion('游戏生成完成');

    await delay(800);

    // 完成消息：精简，引导用户查看详细
    addGroupMessage('coordinator', `🎉 **游戏生成完成！**

🎮 太空射击游戏已就绪，可在左侧预览区立即体验

━━━━━━━━━━━━━━━━━━━━━━

**📦 交付清单**

👨‍💻 **工程师**
• 完整游戏代码 (639行)
• 已自动应用到预览区

👩‍🎨 **美术师**  
• 25张游戏素材
• 霓虹风格 · 2x高清

🎧 **音效师**
• 2首BGM + 10个音效
• 8-bit 电子风格

━━━━━━━━━━━━━━━━━━━━━━

💡 点击下方交付卡片查看详情，或进入各 Agent 单聊查看完整工作日志`);

    await delay(400);

    // 交付卡片 — 工程师代码自动应用
    addGroupMessage('prototyper', '', 'delivery_card', {
        agentId: 'prototyper', type: 'code', emoji: '💻',
        previewBg: 'linear-gradient(135deg, #1a2332, #0d1117)',
        title: '游戏代码交付', desc: 'Canvas 2D · 639行 · 60fps流畅 · 已自动应用',
    });

    await delay(300);

    // 美术和音效只给交付卡片，不再有中间进度刷屏
    addGroupMessage('art-director', '', 'delivery_card', {
      agentId : 'art-director',
      type : 'art',
      emoji : '🎨',
      thumbs : [ '🚀', '👾', '🛸', '⭐', '💫', '🛡️', '💥', '🪙' ],
      previewBg : 'linear-gradient(135deg, #1a1a2e, #302b63)',
      title : '美术设计交付',
      desc : '25张素材 · 霓虹风格 · 2x高清 · 适配多机型',
    });

    await delay(300);

    addGroupMessage('sound-designer', '', 'delivery_card', {
        agentId: 'sound-designer', type: 'sound', emoji: '🎵',
        previewBg: 'linear-gradient(135deg, #0c2233, #1a3a4b)',
        title: '音效资产交付', desc: '2首BGM + 10个音效 · 8-bit电子风 · 2.7MB',
    });

    showGamePreview();
}

function showGamePreview() {
    // 保持画布内的演示场景不变
}

function pauseCurrentTask() {
    if (AppState.isGenerating) {
        AppState.isGenerating = false;
        AppState.isPaused = true;
        DOM.btnPause.style.display = 'none';
        // Quick Mode: 关闭 EventSource
        if (AppState.eventSource) {
            AppState.eventSource.close();
            AppState.eventSource = null;
        }
        // Collab Mode: abort POST SSE
        if (AppState.collabAbortController) {
            AppState.collabAbortController.abort();
            AppState.collabAbortController = null;
        }
        addGroupMessage('coordinator', '⏸️ 任务已暂停。');
        updateGlobalProgress();
    }
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

    // Wrap workspace init in try-catch so Dashboard always initializes
    try {
    initTopbar();
    initResize();
    initDeviceSimulator();
    initAssetDock();
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
    if (DOM.btnSend) DOM.btnSend.addEventListener('click', handleSend);
    if (DOM.chatInput) {
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
    }

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

    // 新建会话（改为使用弹窗按钮 btnNewConv 在 initConvList 中绑定）
    document.getElementById('btnCloseNewSession')?.addEventListener('click', hideNewSessionModal);

    // 空间下钻返回按钮
    document.getElementById('chatBackBtn')?.addEventListener('click', drillBackToGroup);

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
                DOM.chatInput.placeholder = '描述你想要的游戏，AI 团队协作帮你实现... 输入 @ 指定Agent';
                DOM.inputHintText.textContent = 'Enter 发送 · Shift+Enter 换行 · @ 指定Agent';
            }
            console.log('[WeCreat] Mode:', mode);
        }
        modeBtnQuick.addEventListener('click', () => setMode('quick'));
        modeBtnCollab.addEventListener('click', () => setMode('collab'));
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
    DOM.imagePreviewOverlay?.addEventListener('click', () => {
        DOM.imagePreviewOverlay.style.display = 'none';
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

    // 进度面板展开/收起
    const tpHeader = document.getElementById('taskProgressHeader');
    const tpToggleBtn = document.getElementById('tpToggleBtn');
    if (tpHeader) {
        tpHeader.addEventListener('click', toggleProgressPanel);
    }
    if (tpToggleBtn) {
        tpToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProgressPanel();
        });
    }

    // 自动检测后端健康状态
    checkBackendHealth();

    } catch(e) { console.error('[WeCreat] workspace init error (non-fatal):', e); }

    // v17: 初始化 Dashboard（精简一屏布局）— MUST run even if workspace init fails
    try { Dashboard.init(); } catch(e) { console.error('[WeCreat] Dashboard.init error:', e); }

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

    /** 社区精选 mock 数据 */
    COMMUNITY_ITEMS: [
        { name: '太空射击大作战', author: 'Alex', likes: 342, emoji: '🚀', bg: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', tag: '射击' },
        { name: '像素猫咪跑酷', author: 'Miko', likes: 218, emoji: '🐱', bg: 'linear-gradient(135deg,#f093fb,#f5576c)', tag: '跑酷' },
        { name: '糖果消消乐', author: '小甜', likes: 189, emoji: '🍬', bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', tag: '消除' },
        { name: '坦克大战2026', author: 'Tank', likes: 156, emoji: '🎮', bg: 'linear-gradient(135deg,#2d3436,#636e72)', tag: '策略' },
        { name: '音乐节拍挑战', author: 'Beat', likes: 127, emoji: '🎵', bg: 'linear-gradient(135deg,#667eea,#764ba2)', tag: '音游' },
        { name: '复古赛车狂飙', author: 'Racer', likes: 98, emoji: '🏎️', bg: 'linear-gradient(135deg,#f12711,#f5af19)', tag: '竞速' },
    ],

    /** DOM 引用 */
    get dashView() { return document.getElementById('dashboardView'); },
    get workView() { return document.getElementById('workspaceView'); },

    /** 初始化 Dashboard */
    init() {
        this.renderTeam();
        this.renderCommunity();
        this.loadAndRenderProjects();
        this.bindEvents();
    },

    /** 获取时间问候语（自然版，不带 emoji） */
    getGreeting() {
        const h = new Date().getHours();
        if (h < 6) return '夜深了，还在搞创作？';
        if (h < 9) return '早上好';
        if (h < 12) return '上午好';
        if (h < 14) return '中午好';
        if (h < 18) return '下午好';
        if (h < 22) return '晚上好';
        return '夜深了，还在搞创作？';
    },

    /** 随机创意鸡汤 */
    _CREATIVE_QUOTES: [
        '今天想做点什么好玩的？',
        '每个好游戏，都从一个「要是能……」开始',
        '别等完美方案，先做个能玩的原型',
        '玩家记住的不是画面，是感受',
        '写 100 行代码不如先画 1 张草图',
        '好创意不怕小，怕不敢开始',
        '做游戏最难的一步：打开编辑器',
        '先让自己玩得开心，再考虑别人',
        '灵感来了就动手，别等它溜走',
        '做一个让朋友喊「再来一局」的东西',
        '三分钟能学会、三十分钟停不下来——这就对了',
        '先做减法，留下的才是核心玩法',
    ],
    getRandomQuote() {
        return this._CREATIVE_QUOTES[Math.floor(Math.random() * this._CREATIVE_QUOTES.length)];
    },

    /** 根据项目数量更新布局 */
    updateLayout(projects) {
        const text = document.getElementById('dashGreetingText');
        if (text) text.textContent = this.getGreeting();
        const quote = document.getElementById('dashQuoteText');
        if (quote) quote.textContent = this.getRandomQuote();
        const projectsSection = document.getElementById('dashProjects');
        if (projectsSection) projectsSection.style.display = 'block';
    },

    /** 渲染 AI 团队成员卡片（带简介 + 在线状态 + 此刻动态） */
    renderTeam() {
        const container = document.getElementById('dashTeamGrid');
        if (!container) return;
        container.innerHTML = '';
        Object.entries(AGENT_GROUPS).forEach(([name, info]) => {
            const card = document.createElement('div');
            card.className = 'dash-hero-role-card';
            card.style.setProperty('--role-color', info.color);
            const statusList = info.status || [];
            const statusText = statusList[Math.floor(Math.random() * statusList.length)] || '';
            card.innerHTML = `
                <div class="role-avatar-wrap">
                    <img class="dash-hero-role-avatar" src="${info.avatar}" alt="${name}" onerror="this.style.display='none'">
                    <span class="role-online-dot"></span>
                </div>
                <div class="role-text-area">
                    <span class="dash-hero-role-name">${info.nickname || name}</span>
                    <span class="dash-hero-role-desc">${info.desc}</span>
                    <span class="dash-hero-role-status">${statusText}</span>
                </div>
            `;
            container.appendChild(card);
        });
    },

    /** 渲染社区精选 */
    renderCommunity() {
        const grid = document.getElementById('dashCommunityGrid');
        if (!grid) return;
        grid.innerHTML = '';
        this.COMMUNITY_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dash-community-card';
            card.innerHTML = `
                <div class="dash-community-thumb" style="background:${item.bg};">
                    <span class="dash-community-tag">${item.tag}</span>
                    <span style="font-size:42px;">${item.emoji}</span>
                </div>
                <div class="dash-community-body">
                    <div class="dash-community-name">${item.name}</div>
                    <div class="dash-community-info">
                        <span class="dash-community-author">${item.author}</span>
                        <span class="dash-community-likes"><i class="fas fa-heart"></i> ${item.likes}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
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

    /** 显示新建作品弹窗 */
    showNewProjectModal() {
        // 移除旧弹窗
        document.querySelector('.dash-new-project-modal')?.remove();
        const overlay = document.createElement('div');
        overlay.className = 'dash-new-project-modal';
        overlay.innerHTML = `
            <div class="modal-box">
                <h3>🎮 新建作品</h3>
                <input type="text" id="dashNewProjInput" placeholder="给你的游戏起个名字" autofocus>
                <div class="modal-actions">
                    <button class="btn-cancel" id="dashNewProjCancel">取消</button>
                    <button class="btn-confirm" id="dashNewProjConfirm">创建</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('dashNewProjInput');
        const confirmBtn = document.getElementById('dashNewProjConfirm');
        const cancel = document.getElementById('dashNewProjCancel');

        // 点遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        cancel.addEventListener('click', () => overlay.remove());
        confirmBtn.addEventListener('click', async () => {
            const name = input.value.trim() || '新作品';
            overlay.remove();
            const projectId = await ProjectManager.create(name);
            if (projectId) {
                this.enterWorkspace(projectId, name);
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirmBtn.click();
        });
        setTimeout(() => input.focus(), 50);
    },

    /** 进入创作工作台 */
    enterWorkspace(projectId, projectName) {
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
        // 切换项目时重置聊天区
        initDefaultSession();
        renderChatHeader(AppState.sessions[0]);
        renderWelcomeScreen(AppState.sessions[0]);
        renderChatTabs();
        loadChatHistory(projectId);
        clearAssetDock();

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