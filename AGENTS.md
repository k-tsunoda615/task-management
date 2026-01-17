# Codex コンテキスト

## プロジェクト概要

- タスク管理の Nuxt 4 (Vue 3)。カンバン/リスト/アナリティクス/ノート画面を提供。
- 認証 + Postgres は Supabase、クライアント状態は Pinia ストアで管理。
- UI は Tailwind + Nuxt UI、E2E は Playwright。

## 主要コマンド

- dev: `yarn dev`
- build: `yarn build`
- preview: `yarn preview`
- lint: `yarn lint`
- e2e: `yarn test:e2e`

## リポジトリ構成

- `app/`: Nuxt アプリ (pages, components, composables, layouts, middleware, plugins, utils)
- `stores/`: Pinia ストア (`tasks.ts`, `tags.ts`)
- `supabase/`: Supabase 設定 + Edge Functions
- `tests/`: Playwright E2E テスト
- `doc/specification.md`: 詳細仕様/アーキテクチャ

## ディレクトリ構成

- `app/components/`: 画面/機能単位のフォルダ分割。`admin`, `ai`, `analytics`, `auth`, `common`, `kanban`, `list`, `lp`, `modals`, `note` が並び、各フォルダ内は Vue コンポーネント単位で分割する。ユーティリティは例外的に `list/TableUtils.ts` のように同居させる。
- `app/composables/`: `use*` で統一。責務は単機能に絞り、用途別に分割する（例: Supabase リポジトリ層 `useTaskRepository`/`useTagRepository`、UI ロジック `useTaskTimer`、同期 `useTodoSync`、検索 `useTodoSearch`、AI 連携 `useAITitleGenerator`、オンボーディング `useOnboardingSetup`、認証 `useAuthService`）。
- `server/api/`: Nuxt サーバー API のエンドポイント。外部 API (Gemini) と管理用データ取得に限定し、認可/権限チェックをここで完結させる。`server/utils` は共通処理置き場として拡張余地あり。

## ディレクトリ構成ルール

- `app/components/`: 画面機能ごとのフォルダに置き、1ファイル=1コンポーネントを原則とする。補助ロジックは同フォルダに `*.ts` で同居可。
- `app/composables/`: 単一責務の関数単位で分割し、I/O が明確な API だけを公開する。UI 依存とデータ取得を混在させない。
- `server/api/`: ルート単位で 1 ファイル。外部サービス呼び出しや権限チェックはここに閉じ、フロントからは原則 `useFetch` で呼び出す。

## API fetch ルール

- クライアントから直接 Supabase に触れる処理は `app/composables/*Repository.ts` に集約する。
- 外部 API や権限チェックが必要な処理は `server/api/*` に閉じる。フロントは原則 `useFetch` で呼ぶ。
- 取得系は `useAsyncData` を使い、`server: false` など実行環境を明示する。
- エラーは `createError` か明示的なメッセージに揃え、UI 側で一貫して扱える形にする。
- 依存の増加を避け、同じ API に対する重複 fetch はストア/キャッシュで統合する。

## 実装ベストプラクティス

- 「多機能で汎用的なユーティリティ」を先に作らない。用途が固まった時点で最小限の責務で実装する。
- 1ファイルで複数の責務を抱えない。分割は「利用者が2箇所以上ある時」に行う。
- UI ロジックとデータ取得を混ぜない。UI 側は composable の API を呼ぶだけにする。
- 型は既存の `types/` と `app/utils/` を優先して使い、重複定義を避ける。

## コメントルール

- ロジック系の関数には JSDoc 形式で意図を残す。テンプレートは次を使用する。

```ts
/**
 * {関数の役割}
 * @description {詳細な挙動や副作用の説明}
 * @param {引数名} - {説明}
 * @param {引数名} - {説明}（デフォルト: {値}）
 * @returns {{型}} {戻り値の概要}
 */
```

## 実装統一ルール (JS/TS)

- 関数定義はすべてアロー関数で統一する（コンポーネント、Composables、Utils、API ハンドラーを含む）。`function` キーワードは禁止。
- 型定義は `type` を使用する。`interface` は禁止。命名は PascalCase、プロパティには可能な限り説明コメントを付与する。
- Vue 3.5+ の書き方に合わせる。Props は Reactive Props Destructuring を使う。
- Emits は call-signature 形式の `defineEmits` を使う。

例:

```ts
type Props = {
  /** タイトル表示用 */
  title?: string;
};

const { title = "Default" } = defineProps<Props>();

const emit = defineEmits<{
  (e: "submit", payload: { id: string }): void;
}>();

const fetchTasks = async (): Promise<void> => {
  // ...
};
```

## リファクタリング指針

- 重複処理、長い関数、条件分岐が増えた箇所は小さく切り出す。
- 実装が膨らんだら「用途別 composable」か「画面単位コンポーネント」へ寄せる。
- 既存 API の互換を保つ。破壊的変更が必要なら新旧を並行させて段階移行する。

## コアドメイン

- Todo (タスク): title, memo, status, tags, timing fields, sort order
- Tag: name, color, sort order
- ステータス値: `priority`, `next`, `archived`

## データ/連携メモ

- Supabase テーブル: `todos`, `tags`, `todo_tags` (詳細は `doc/specification.md`)。
- 匿名ユーザーが永続ユーザーに昇格できる認証フロー。
- GTM dataLayer 経由でイベント送信。

## 実装の約束

- CRUD 同期は `stores/tasks.ts` + `app/composables/useTaskRepository.ts`。
- タイマーは `app/composables/useTaskTimer.ts`。
- 共通定数は `app/utils/constants.ts`。
