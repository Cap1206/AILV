// pages/live.tsx
import { useState, useEffect } from 'react';
// socket.io-client v4 以上を想定
import io, { Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';
const newSocket = io(SERVER_URL);

export default function LivePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // サーバーに接続する
    const newSocket = io(SERVER_URL, {
      // CORSエラー回避などのためにトランスポート指定
      transports: ['websocket'],
      // withCredentials: true, などのオプションを指定可能
    });

    // state に保存しておいて、イベントリスナをセットできるようにする
    setSocket(newSocket);

    // 接続成功時
    newSocket.on('connect', () => {
      console.log('Connected to server!', newSocket.id);
      setIsConnected(true);
    });

    // 切断時
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server.');
      setIsConnected(false);
    });

    // コンポーネントがアンマウントされたらソケット切断
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Socket.io Connection Status</h1>
      {isConnected ? (
        <p style={{ color: 'green' }}>Connected!</p>
      ) : (
        <p style={{ color: 'red' }}>Disconnected</p>
      )}
    </div>
  );
}