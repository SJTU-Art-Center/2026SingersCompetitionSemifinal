const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// 静态提供头像目录
app.use('/avatar', express.static(UPLOADS_DIR));

// 接收Base64图片并保存
app.post('/api/uploadAvatar', (req, res) => {
  const { id, base64 } = req.body;

  if (!base64 || !id) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const fileName = `avatar_${id}_${Date.now()}.png`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, base64Data, 'base64');

    // 返回对应的相对 URL 给前端
    res.json({ url: `/avatar/${fileName}` });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据
function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      adminRound: 0, // 后台当前比赛轮次 (0: 赛前设置, 1: 30进18, 1.5: 挑选对手, 2: 16人PK, 3: 大魔王返场, 4: 终极补位)
      screenRound: 0, // 大屏当前比赛轮次
      currentGroup: 1, // 第一轮当前展示/打分的组别
      pickingChallengerId: null, // 正在挑选对手的挑战者ID
      players: Array.from({ length: 30 }).map((_, i) => ({
        id: i + 1,
        name: `选手 ${i + 1}`,
        avatar: `https://i.pravatar.cc/150?u=${i + 1}`, // 随机头像
        group: Math.floor(i / 5) + 1, // 1~6组，每组5人
        score: 0,
        status: 'default', // default: 默认, top2: 大魔王, top3_10: 擂主, top11_18: 挑战者, eliminated: 淘汰, pending: 待定, advanced: 晋级, resurrected: 复活
        pkAgainst: null, // PK对手ID
      })),
      pkMatches: [], // {p1, p2, winner}
      demonKingScore: 0,
      selectedDemonKingId: null,
      activeDemonKingId: null,
      demonKingAvgScore: 0,
      dkScoreSubmitted: false,
      screenMatchIndex: 0, // 第二轮: 大屏正在展示的PK对战索引
      finalStageIndex: 1,
      screenFinalStageIndex: 1,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

let gameState = initData();

function saveState() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(gameState, null, 2));
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // 发送当前全量状态给新连接的客户端
  socket.emit('stateSync', gameState);

  // 前端主动请求同步（解决路由切换时错过事件的问题）
  socket.on('requestState', () => {
    socket.emit('stateSync', gameState);
  });

  // 接收状态更新并广播
  socket.on('updateState', (newState) => {
    gameState = newState;
    saveState();
    io.emit('stateSync', gameState);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
