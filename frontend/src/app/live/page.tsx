'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface Comment {
  userName: string;
  text: string;
}

interface Gift {
  userName: string;
  giftType: string;
}

interface JoinMessage {
  message: string;
}

type TimelineItem = Comment | Gift | JoinMessage;

// クライアントサイドでのみ実行されるように関数化
function getServerUrl() {
  if (typeof window === 'undefined') return '';
  
  // window.location.hostnameを使用してクライアントのホストを取得
  const host = window.location.hostname;
  return `http://${host}:3001`;
}

export default function LivePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<TimelineItem[]>([]);

  useEffect(() => {
    // クライアントサイドでのみSocket.IOを初期化
    if (typeof window !== 'undefined') {
      const newSocket = io(getServerUrl(), {
        transports: ['websocket'],
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server!', newSocket.id);
        setIsConnected(true);
        // ユーザー名が設定されている場合のみjoinイベントを送信
        if (userName.trim()) {
          newSocket.emit('join', { userName: userName.trim() });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server.');
        setIsConnected(false);
      });

      newSocket.on('newComment', (comment: Comment) => {
        setComments(prev => [...prev, comment]);
      });

      newSocket.on('newGift', (gift: Gift) => {
        setComments(prev => [...prev, gift]);
      });

      newSocket.on('userJoined', (joinMessage: JoinMessage) => {
        setComments(prev => [...prev, joinMessage]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  // ユーザー名が変更されたときにjoinイベントを送信
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUserName = e.target.value;
    setUserName(newUserName);
    
    if (socket && newUserName.trim() && isConnected) {
      socket.emit('join', { userName: newUserName.trim() });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !userName.trim() || !commentText.trim()) return;

    const comment = {
      userName: userName.trim(),
      text: commentText.trim(),
    };

    socket.emit('comment', comment);
    setCommentText('');
  };

  const handleGift = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!socket || !userName.trim()) return;

    const gift = {
      userName: userName.trim(),
      giftType: 'プチギフト'
    };

    console.log('Sending gift:', gift);
    socket.emit('gift', gift);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Live Comments</h1>
      <div style={{ marginBottom: '20px' }}>
        {isConnected ? (
          <p style={{ color: 'green' }}>Connected!</p>
        ) : (
          <p style={{ color: 'red' }}>Disconnected</p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={userName}
            onChange={handleUserNameChange}
            placeholder="ユーザー名"
            style={{ padding: '5px', marginRight: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="コメントを入力"
            style={{ padding: '5px', marginRight: '10px' }}
          />
          <button 
            type="submit" 
            disabled={!isConnected || !userName.trim() || !commentText.trim()}
            style={{ padding: '5px 10px' }}
          >
            送信
          </button>
        </div>
      </form>

      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={handleGift}
          disabled={!isConnected || !userName.trim()}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#ff69b4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ギフトを贈る
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
        <h2>コメント一覧</h2>
        {comments.map((comment, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            {'text' in comment ? (
              <div style={{ marginBottom: '10px' }}>
                <strong>{comment.userName}:</strong> {comment.text}
              </div>
            ) : 'giftType' in comment ? (
              <div style={{ 
                marginBottom: '10px',
                color: '#ff69b4',
                fontWeight: 'bold'
              }}>
                {comment.userName}がプチギフトを贈りました
              </div>
            ) : (
              <div style={{
                marginBottom: '10px',
                color: '#808080',
                fontStyle: 'italic'
              }}>
                {comment.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
