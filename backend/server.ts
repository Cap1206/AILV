import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Express のセットアップ
const app = express();

// ルートパスのハンドラーを追加
app.get('/', (req, res) => {
  res.send('Server is running successfully!');
});

// HTTPサーバーと Socket.io の紐づけ
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true, // すべてのオリジンを許可
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
});

// Socket.io のイベント待受
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // コメントを受信したら全クライアントにブロードキャスト
  socket.on('comment', (comment: { userName: string; text: string }) => {
    console.log(`Comment from ${socket.id}:`, comment);
    io.emit('newComment', comment);
  });

  // ギフトを受信したら全クライアントにブロードキャスト
  socket.on('gift', (gift: { userName: string; giftType: string }) => {
    console.log(`Gift from ${socket.id}:`, gift);
    io.emit('newGift', gift);
  });

  // クライアント切断
  // 入室イベントを受信したら全クライアントにブロードキャスト
  socket.on('join', (payload: { userName: string }) => {
    console.log(`User joined ${socket.id}:`, payload);
    io.emit('userJoined', { message: `${payload.userName}が入室しました` });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// サーバー起動（すべてのネットワークインターフェースでリッスン）
const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
