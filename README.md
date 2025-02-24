# AI Liver Project

このドキュメントは、AI Liver Project の概要と技術仕様をまとめたものです。

## プロジェクト構造

```
ai-liver-project/
├── backend/             # バックエンドサーバー
│   ├── server.ts       # メインサーバーファイル
│   ├── package.json    # バックエンド依存関係
│   └── tsconfig.json   # TypeScript設定
└── frontend/           # フロントエンドアプリケーション
    ├── src/
    │   └── app/
    │       ├── live/   # ライブコメント機能（メイン実装）
    │       └── pages/  # 従来のページコンポーネント
    ├── public/         # 静的アセット
    └── package.json    # フロントエンド依存関係
```

## 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 15.1.7
- **言語**: TypeScript 5.x
- **主要ライブラリ**:
  - React 19.0.0
  - React DOM 19.0.0
  - Socket.IO Client 4.8.1
- **スタイリング**: Tailwind CSS 3.4.1
- **開発ツール**:
  - ESLint 9.x
  - PostCSS 8.x

### バックエンド

- **ランタイム**: Node.js
- **言語**: TypeScript 4.9.5
- **主要ライブラリ**:
  - Express 4.18.2
  - Socket.IO 4.5.3
- **開発ツール**:
  - ts-node 10.9.1
  - TypeScript 関連型定義パッケージ

## 主要コンポーネントの説明

### バックエンドサーバー (backend/server.ts)

- Express.js と Socket.IO を使用した WebSocket サーバー
- ポート 3001 でリッスン
- CORS を有効化し、すべてのオリジンからのアクセスを許可
- 主な機能:
  - WebSocket 接続の確立と管理
  - コメントの受信とブロードキャスト
  - ギフトの受信とブロードキャスト
  - 入室イベントの管理とブロードキャスト
  - 接続/切断イベントのログ記録

### ライブコメントページ (frontend/src/app/live/page.tsx)

- Next.js のクライアントコンポーネント
- Socket.IO を使用したリアルタイム通信
- 主な機能:
  - WebSocket サーバーとの接続状態管理
  - ユーザー名設定と入室通知
  - コメント送信機能
  - ギフト送信機能
  - タイムライン表示（コメント、ギフト、入室通知）
- UI 機能:
  - コメント送信フォーム
  - ギフト送信ボタン（ピンク色のアクセント）
  - 統合タイムライン表示
    - 通常コメント
    - ギフト（特別表示）
    - 入室通知（グレー、イタリック体）

### レガシーライブページ (frontend/src/app/pages/live.tsx)

- 基本的な Socket.IO 接続テスト用コンポーネント
- 接続状態の表示のみを行う
- 新しい実装（app/live/page.tsx）への移行前の参照用

## WebSocket イベント仕様

### サーバーイベント

- `connection`: クライアント接続時
- `disconnect`: クライアント切断時
- `comment`: コメント受信時
  - パラメータ: `{ userName: string; text: string }`
- `gift`: ギフト受信時
  - パラメータ: `{ userName: string; giftType: string }`
- `join`: ユーザー入室時
  - パラメータ: `{ userName: string }`

### クライアントイベント

- `newComment`: 新規コメント受信時
  - データ: `{ userName: string; text: string }`
- `newGift`: 新規ギフト受信時
  - データ: `{ userName: string; giftType: string }`
- `userJoined`: ユーザー入室通知
  - データ: `{ message: string }`

## 現在の課題と改善要件

### ユーザー名設定と入室フローの改善

現状の実装では：

- ライブページでユーザー名入力時に入室ログが表示される
- ユーザー名入力フォームがライブページに存在する

改善要件：

1. アクセス時に最初にユーザー名を設定
2. ユーザー名設定後に Live ページへ入室
3. Live ページアクセス時点で入室ログを表示
4. Live ページからユーザー名入力フォームを削除

## 実装方針の提案

### 1. ユーザー名設定ページの新設

```typescript
// frontend/src/app/page.tsx（またはsetup/page.tsx）
- ユーザー名入力フォーム
- LocalStorageまたはグローバルステート（Zustand/Jotai等）でユーザー名を保存
- 入力完了後にLiveページへリダイレクト
```

### 2. グローバルなユーザー状態管理

```typescript
// 状態管理の例（Zustandを使用する場合）
interface UserStore {
  userName: string;
  setUserName: (name: string) => void;
}

const useUserStore = create<UserStore>((set) => ({
  userName: "",
  setUserName: (name) => set({ userName: name }),
}));
```

### 3. Live ページの改修

```typescript
// frontend/src/app/live/page.tsx
-ユーザー名入力フォームの削除 -
  コンポーネントマウント時にストアからユーザー名を取得 -
  接続確立時に自動的にjoinイベントを発行;
```

### 4. ミドルウェアによるアクセス制御

```typescript
// frontend/src/middleware.ts
- ユーザー名が未設定の場合、Liveページへのアクセスを
  セットアップページへリダイレクト
```

## 注意事項

- フロントエンドは Turbopack を使用して開発サーバーを起動します
- バックエンドサーバーは全ネットワークインターフェースでリッスンします（0.0.0.0）
- WebSocket 接続は websocket トランスポートのみを使用します
- ギフト機能は現在「プチギフト」のみ実装されています
- ユーザー名の永続化方法（LocalStorage vs グローバルステート）は
  要件に応じて選択してください
