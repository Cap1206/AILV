"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
// Express のセットアップ
const app = (0, express_1.default)();
// ルートパスのハンドラーを追加
app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});
// HTTPサーバーと Socket.io の紐づけ
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    }
});
// Socket.io のイベント待受
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // クライアント側から 'message' イベントを受け取る例
    socket.on('message', (msg) => {
        console.log(`Message from ${socket.id}: ${msg}`);
        // 受信したメッセージを接続中の全クライアントにブロードキャスト
        io.emit('message', msg);
    });
    // クライアント切断
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});
// サーバー起動
const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
