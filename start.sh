#!/bin/bash
# WeCreat 一键启动脚本
# 用法:
#   ./start.sh           — 使用 .env 中的 NODE_ENV（默认 production）
#   ./start.sh online    — 线上环境 (production, polaris)
#   ./start.sh local     — 本地环境 (development, office)

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ---- Resolve environment from argument ----
ENV_ARG="$1"
if [ "$ENV_ARG" = "online" ]; then
    export NODE_ENV=production
elif [ "$ENV_ARG" = "local" ]; then
    export NODE_ENV=development
fi
# If no argument, NODE_ENV will be read from .env by dotenv

# ---- Read PORT from .env ----
ENV_PORT=$(grep -E '^PORT=' .env 2>/dev/null | cut -d'=' -f2)
PORT=${ENV_PORT:-3001}

# ---- Display ----
if [ "$NODE_ENV" = "development" ]; then
    ENV_LABEL="🏠 本地 (office)"
else
    ENV_LABEL="☁️  线上 (polaris)"
fi

echo ""
echo "  ╔══════════════════════════════╗"
echo "  ║     🎮 WeCreat 启动中...     ║"
echo "  ╚══════════════════════════════╝"
echo ""
echo -e "  环境: ${GREEN}${ENV_LABEL}${NC}"
echo -e "  端口: ${GREEN}${PORT}${NC}"
echo ""

# 检查后端是否已经在运行
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端已在运行 (端口 $PORT)${NC}"
    echo -e "   打开 ${GREEN}http://localhost:$PORT${NC} 即可使用"
    echo ""
    exit 0
fi

# 检查 node_modules
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📦 首次运行，安装依赖...${NC}"
    cd server && npm install && cd ..
fi

# 检查 Python openai 包
if ! python3 -c "import openai" 2>/dev/null; then
    echo -e "${YELLOW}🐍 安装 Python openai 包...${NC}"
    pip3 install openai -q
fi

# iChat Gemini 图片生成（可选，不配也不影响基础功能）
if [ -z "$ICHAT_APPID" ]; then
    echo -e "${YELLOW}⚠️  ICHAT_APPID 未设置，图片生成将不可用${NC}"
    echo -e "   设置方式: export ICHAT_APPID=xxx ICHAT_APPKEY=xxx"
fi

# 后台启动后端
echo -e "${YELLOW}🚀 启动后端服务...${NC}"
cd server
NODE_ENV="${NODE_ENV:-}" nohup node index.js > ../wecreat.log 2>&1 &
SERVER_PID=$!
cd ..

# 等待服务就绪
for i in {1..10}; do
    sleep 1
    if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端启动成功！PID: $SERVER_PID${NC}"
        echo -e "   打开 ${GREEN}http://localhost:$PORT${NC} 即可使用"
        echo -e "   日志: wecreat.log"
        echo ""
        exit 0
    fi
    echo "   等待启动... ($i/10)"
done

echo -e "${RED}❌ 启动超时，请检查 wecreat.log${NC}"
exit 1
