# CLAUDE.md - タスク管理アプリ実装ガイドライン

## プロジェクト概要

Nuxt 4 (Vue 3) + Supabase によるタスク管理 SPA。カンバンボード・リスト・アナリティクスの3ビューでタスクを管理し、タイムトラッキング・タグ管理・AI チャットを備える。

## 技術スタック

- **フレームワーク**: Nuxt 4.2 (Vue 3.5) / TypeScript strict モード
- **状態管理**: Pinia 2.1
- **バックエンド**: Supabase (Auth / PostgreSQL / Storage / Edge Functions)
- **UI**: Nuxt UI 2 + Tailwind CSS 3.4 + Heroicons
- **AI**: Google Gemini API (`@google/genai`)
- **テスト**: Playwright (E2E)
- **パッケージマネージャ**: Yarn Berry 4.6.0

## ディレクトリ構成

```
task-management/
├── app/
│   ├── components/       # Vue コンポーネント (機能別サブフォルダ)
│   │   ├── ai/           # AI チャット関連
│   │   ├── analytics/    # チャート・統計表示
│   │   ├── auth/         # ログイン・サインアップフォーム
│   │   ├── common/       # ヘッダー・フッター・ナビゲーション
│   │   ├── kanban/       # カンバンボード・カード
│   │   ├── list/         # リストビュー・テーブル
│   │   ├── lp/           # ランディングページ
│   │   ├── modals/       # モーダルダイアログ群
│   │   └── note/         # タスク詳細ページ
│   ├── composables/      # Composition API (ビジネスロジック)
│   ├── layouts/          # Nuxt レイアウト (board.vue)
│   ├── middleware/        # ルートミドルウェア (auth.ts)
│   ├── pages/            # ファイルベースルーティング
│   ├── plugins/          # Nuxt プラグイン (analytics, timer-guard)
│   ├── utils/            # ユーティリティ関数・定数
│   └── assets/css/       # グローバルスタイル
├── server/api/           # Nitro サーバー API エンドポイント
├── stores/               # Pinia ストア (tasks.ts, tags.ts)
├── types/                # TypeScript 型定義
├── tests/                # Playwright E2E テスト
├── doc/                  # ドキュメント
├── public/               # 静的アセット
└── supabase/functions/   # Edge Functions
```

## コマンド一覧

```bash
yarn dev              # 開発サーバー起動
yarn build            # プロダクションビルド
yarn lint             # ESLint 実行
yarn test:e2e         # Playwright E2E テスト実行
yarn test:e2e:ui      # Playwright UI モード
yarn analyze          # バンドル解析
```

## アーキテクチャパターン

### レイヤー構成

```
Pages → Components → Composables → Pinia Store → Repository (Composable) → Supabase Client
```

1. **Pages**: ルーティングとレイアウト指定のみ。ビジネスロジックは持たない
2. **Components**: UI 表示とユーザーインタラクション。ストアやComposableを呼び出す
3. **Composables**: ビジネスロジックの中核。Supabase との通信もここに集約
4. **Pinia Store**: アプリケーション状態の一元管理。Repository composable を通じて DB 操作
5. **Server API**: Nitro サーバーで動作するバックエンド API (Gemini API プロキシ等)

### Repository パターン

DB アクセスは composable に閉じ込める:

- `useTaskRepository()` — Todo の CRUD、アセット操作、ソート順更新
- `useTagRepository()` — Tag の CRUD
- `useAdminMetricsRepository()` — 管理者メトリクス取得

### Store パターン

Pinia ストアは Options API スタイルで記述:

```typescript
// stores/tasks.ts
export const useTodoStore = defineStore("todo", {
  state: () => ({ todos: [] as Todo[], isLoaded: false, isLoading: false }),
  getters: { todosByVisibility(): Todo[] { ... } },
  actions: { async fetchTodos() { ... }, async createTodo() { ... } },
});
```

- ストアアクションは必ず Repository composable を経由して DB 操作する
- ローカル状態の楽観的更新 + エラー時のフォールバックを実装
- 内部メソッドは `_` プレフィックスで命名 (`_updateLocalTodo`, `_appendAsset` 等)

### Composable パターン

```typescript
// app/composables/useXxx.ts
export const useXxx = () => {
  // Supabase クライアント取得
  const client = useSupabaseClient();
  const user = useSupabaseUser();
  // メソッド定義
  return { method1, method2 };
};
```

## データモデル

### 主要な型 (`types/todo.ts`)

```typescript
type Todo = {
  id: string;
  title: string;
  status: TaskStatus;          // "priority" | "next" | "archived"
  memo?: string;               // Markdown 対応
  sort_order?: number;         // 100 刻み
  is_private?: boolean;
  is_finished?: boolean;
  user_id?: string;
  updated_at?: string;
  total_time?: number;         // 累積作業秒数
  is_timing?: boolean;         // タイマー稼働中フラグ
  tags?: Tag[];
  assets?: TodoAsset[];
};

type Tag = { id: string; name: string; color?: string; sort_order: number; };
type TodoAsset = { id: string; todo_id: string; file_name: string; storage_path: string; mime_type: string; size: number; };
```

### ステータス定義 (`app/utils/constants.ts`)

```typescript
const TASK_STATUS = { PRIORITY: "priority", NEXT: "next", ARCHIVED: "archived" } as const;
type TaskStatus = "priority" | "next" | "archived";
```

### Supabase テーブル

| テーブル | 概要 |
|----------|------|
| `todos` | タスク本体。RLS で `user_id` フィルタ |
| `tags` | タグ定義。色・ソート順を保持 |
| `todo_tags` | タスク-タグ中間テーブル |
| `todo_assets` | 添付ファイルメタデータ |
| `task-assets` (Storage) | 添付ファイル実体の格納バケット |

## 実装規約

### TypeScript

- strict モード有効。`any` の使用は避ける
- 型定義は `types/` ディレクトリに集約
- `as const` を活用した定数定義パターン

### Vue コンポーネント

- `<script setup lang="ts">` を使用
- コンポーネントは機能別サブフォルダで整理
- Props/Emits は TypeScript の型で定義
- テンプレート内のロジックは最小限にし、computed や composable に移譲

### スタイル

- Tailwind CSS ユーティリティクラスを優先
- ダークモードは `class` 戦略 (`dark:` プレフィックス)
- カスタムカラーは `tailwind.config.ts` の CSS 変数で管理

### エラーハンドリング

- Repository 層で Supabase エラーをキャッチし、ストア層で re-throw
- ユーザー向けエラーは `useToast()` で通知
- 認証エラーは `mapAuthErrorToMessage()` で日本語メッセージに変換

### ソート順 (sort_order)

- 100 刻みで初期値を設定
- ドラッグ&ドロップ時は前後のアイテムの中間値を計算
- 隙間がなくなった場合は全体を再番号付け (`recalculateAllOrders`)

### 認証

- Supabase Auth を使用 (Email/Password, Anonymous, Google OAuth)
- `app/middleware/auth.ts` でルートガード
- 匿名ユーザーから永続ユーザーへのアップグレードフローあり
- 認証操作は `useAuthService()` composable に集約

### イベント計測

- Google Tag Manager (`dataLayer`) 経由で GA4 に送信
- タスク操作・タイマー・レイアウト変更・検索等を計測
- 計測関数は `app/utils/analytics.ts` に集約

## 環境変数

| 変数 | 用途 |
|------|------|
| `NUXT_SUPABASE_URL` | Supabase プロジェクト URL |
| `NUXT_SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `NUXT_GEMINI_API_KEY` | Google Gemini API キー |
| `NUXT_PUBLIC_GTM_ID` | Google Tag Manager ID |
| `NUXT_PUBLIC_TODO_REFRESH_INTERVAL_MS` | 自動リフレッシュ間隔 (デフォルト: 1800000ms) |
| `NUXT_SUPABASE_CALLBACK_URL` | OAuth コールバック URL |

## ルーティング

| パス | 認証 | レイアウト | 概要 |
|------|------|-----------|------|
| `/` | 不要 | default | トップページ / リダイレクト |
| `/auth` | 不要 | default | ログイン・新規登録 |
| `/confirm` | 不要 | default | メール確認コールバック |
| `/board` | 必要 | board | カンバンボード |
| `/list` | 必要 | board | リストビュー |
| `/analytics` | 必要 | board | アナリティクス |
| `/note/[id]` | 必要 | board | タスク詳細 |
| `/admin` | 必要 | board | 管理者ダッシュボード |
| `/lp`, `/lp/a`, `/lp/b` | 不要 | default | ランディングページ |

## 言語

- UI テキスト・エラーメッセージ・コメントはすべて **日本語**
- コード中の変数名・関数名は **英語**

## 既知の制約・注意点

- ESLint v9 の設定ファイル (`eslint.config.js`) が未整備で `yarn lint` が正常動作しない場合がある
- `todo.total_time` は DB 側で `integer[]` と `integer` が混在する可能性あり。クライアント側で `normalizeTodo()` により数値に正規化している
- Supabase Edge Functions (`supabase/functions/`) は定義ディレクトリのみでコード未実装のものあり
- `/note/:id` でタスクが見つからない場合のエラーハンドリングが不完全
