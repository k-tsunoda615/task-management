# 仕様書

## 1. 概要

- Nuxt 4 (Vue 3) を用いたシングルページアプリケーション (SPA)。
- Supabase をバックエンド (認証 + Postgres + Edge Functions) として利用し、Pinia ストアで状態管理。
- タスクをカンバン/リスト/アナリティクスの 3 形態で可視化し、タイムトラッキングやタグ管理をサポートする。
- Google Tag Manager を経由したイベントトラッキング、Playwright による E2E テストを備える。

## 2. 用語

| 用語           | 説明                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| Todo           | タスクエンティティ。タイトル、メモ、ステータス、タグ、計測時間を保持する。    |
| Tag            | タスクに付与できるラベル。色・表示順を持つ。                                  |
| ステータス     | `priority` (重要), `next` (次にやる), `archived` (完了/保留)。                |
| ゲストユーザー | Supabase の匿名認証でログインしたユーザー。メール登録前でもタスク操作が可能。 |
| 永続ユーザー   | メール + パスワードでサインインする通常ユーザー。                             |
| Onboarding     | 初回ログイン時に自動作成されるサンプルタスク/タグの投入処理。                 |

## 3. システム構成

```
[Browser SPA]
  ├─ Nuxt 4 アプリ (Vue, Pinia, @nuxt/ui, Tailwind)
  │    ├─ ストア (tasks, tags)
  │    ├─ Supabase クライアント (@nuxtjs/supabase)
  │    └─ Google Tag Manager dataLayer
  │
  └─ Supabase (認証 + Postgres + Edge Functions)
       ├─ Auth (Email+Password, Anonymous, OAuth Google)
       ├─ Postgres テーブル: todos, tags, todo_tags
       └─ Edge Functions (auto-confirm-email, cleanup-anonymous-data, cron)
```

- 主要モジュール: `@nuxt/ui`, `@nuxtjs/supabase`, `@pinia/nuxt`, `@vueuse/nuxt`。
- CSS: Tailwind CSS + `tailwindcss-animate` + `@tailwindcss/typography`。
- タスク管理は `stores/tasks.ts` と `app/composables/useTaskRepository.ts` の組み合わせで実装。

## 4. 開発環境と依存ライブラリ

| 区分                 | 内容                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ランタイム           | Node.js 18 以降 (Nuxt 4 要件)。                                                                                                |
| パッケージマネージャ | Yarn Berry (v4.6.0)。                                                                                                          |
| 主な依存             | `vue@3.5`, `nuxt@4.1`, `pinia@2.1`, `@nuxt/ui@2`, `@supabase/supabase-js@2.49`, `vuedraggable@4`, `chart.js@4`, `dayjs@1.11`。 |
| 開発依存             | `@playwright/test`, `@nuxt/test-utils`, `eslint@9`, `@typescript-eslint/*`, `prettier@3`。                                     |
| UI コンポーネント    | Nuxt UI, Tailwind, Heroicons。                                                                                                 |

## 5. 機能一覧

| 機能              | 要件概要                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| 認証              | メール/パスワード登録、匿名ログイン、Google OAuth、メール確認。                                |
| カンバン (Board)  | ステータス列間のドラッグ&ドロップ、タグ/タイマー表示切替、レイアウト変更、タイムトラッキング。 |
| リスト (List)     | ソート、検索、タグ/ステータス/公開設定フィルタ、ドラッグで並び替え、一括削除。                 |
| アナリティクス    | 期間別フィルタ、ステータス分布、タグ分布、作業時間チャート、最近アクティビティ。               |
| 管理ダッシュボード | Supabase ビュー `admin_user_metrics` から取得したユーザー表示名・メール・ToDo件数・ストレージ使用量を一覧表示。 |
| タスク詳細 (Note) | Markdown メモ編集、タイマー開始/停止、ステータス更新、完了フラグ。                             |
| タグ管理          | サイドバーから作成/更新/削除、ドラッグで順序変更。                                             |
| Onboarding        | 初回ログイン時にサンプルタグ/タスクを投入。                                                    |
| タイムガード      | タイマー稼働中のページ離脱を防止するグローバルナビゲーションガード。                           |
| イベント計測      | dataLayer を通じたページビュー・タスク操作イベント送信。                                       |

## 6. 画面・ページ要件

| ルート                          | 目的 / 主な要件                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                             | 認証済みなら `/board` へリダイレクト。`CommonHeader`/`Auth`/`CommonFooter` を表示。                                                              |
| `/auth`                         | ログイン/新規登録/ゲストログインフォーム。タブ切替、パスワードリセットモーダル。匿名ユーザーの本登録アップグレードを考慮。                       |
| `/confirm`                      | Supabase からのメール確認用。匿名→永続アップグレード時のパスワード設定フォームを提供。                                                           |
| `/board`                        | カンバン UI。ステータス列 (`priority`, `next`, `archived`)、タグ/タイマー表示切替、タスク編集モーダル、サイドバー (タグ管理・フィルタ・ゴミ箱)。 |
| `/list`                         | テーブルビュー。列ソート、ドラッグで並び替え、チェックボックスで一括操作、合計時間表示。                                                         |
| `/analytics`                    | 期間フィルタ、ステータス分布 (Chart.js), 時間分布, タグ分布, 最近アクティビティテーブル。完了タスク表示切替に連動。                              |
| `/admin`                        | Supabase `admin_user_metrics` ビューから取得した利用状況サマリーを表示するダッシュボード。                          |
| `/note/:id`                     | タスク詳細。タイトル/ステータス/完了フラグ編集、Markdown プレビュー、タイマー。タスク不存在時のエラーハンドリング TODO。                         |
| `/lp/a`, `/lp/b`                | ランディングページ (A/B)。共通ヘッダー/フッター上で内容差分を実装可能。                                                                          |
| `/analytics`, `/list`, `/board` | いずれも `layout: "board"` を使用、サイドバー共有。                                                                                              |

## 7. ワークフロー

### 認証フロー

1. ユーザーは `/auth` でログイン/新規登録/匿名ログインを選択。
2. 新規登録は Supabase Auth を用いてメール送信。`/confirm` が callback。匿名ユーザーはメール確認後、パスワード設定で永続化。
3. 認証状態は `app/middleware/auth.ts` でガード。未ログインは `/auth` に、ログイン済みは `/board` に誘導。

### タスクライフサイクル

1. `Sidebar` から新規タスク作成モーダル (コンポーネント未掲載) を起動。
2. `useTaskRepository.createTodo` が Supabase `todos` と `todo_tags` を作成し、Pinia ストアを更新。
3. カンバン/リスト/アナリティクスは `stores/tasks.ts` の `todos` を共通利用。
4. ドラッグ&ドロップで `updateTodo` / `updateTodoOrder` が呼ばれ、`sort_order` を再計算、Supabase 更新。
5. タスク削除は `deleteTodo` で `todo_tags` → `todos` の順に削除。
6. タイムトラッキングは `useTaskTimer` + `TodoCard`/`Note` で `total_time` を秒単位管理し終了時に Supabase 更新。

### タグ管理フロー

1. サイドバーの「タグ編集」で `TagManageModal` (未参照) を開き、`useTagStore` 経由で CRUD。
2. `tags` テーブルは `sort_order` に 100 刻みを採用、`todo_tags` 中間テーブルでタスクと連携。

## 8. データモデル

### Supabase テーブル (推定)

- **todos**
  | カラム | 型 | 説明 |
  | ------ | -- | ---- |
  | id | uuid | 主キー。|
  | title | text | タスクタイトル。必須。|
  | memo | text | Markdown メモ。|
  | status | text | `priority` / `next` / `archived`。|
  | sort_order | integer | 表示順 (100 刻み)。|
  | is_private | boolean | 公開/非公開。|
  | is_finished | boolean | 完了フラグ。|
  | total_time | integer[] / integer | 累積作業時間 (秒)。クライアントでは数値に正規化。|
  | is_timing | boolean | 現在計測中か。|
  | user_id | uuid | 所有ユーザー。|
  | updated_at | timestamptz | 更新日時。クライアントが都度上書き。|

- **tags**
  | カラム | 型 | 説明 |
  | ------ | -- | ---- |
  | id | uuid | 主キー。|
  | name | text | タグ名。|
  | color | text | 16 進カラーコード。|
  | user_id | uuid | 所有ユーザー。|
  | sort_order | integer | 表示順。|

- **todo_tags**
  | カラム | 型 | 説明 |
  | ------ | -- | ---- |
  | id | uuid | 主キー (Supabase 側)。|
  | todo_id | uuid | 紐付くタスク ID。|
  | tag_id | uuid | 紐付くタグ ID。|

### フロントエンド型定義

- `types/todo.ts` に `Todo`, `Tag`。`total_time` は `number | number[]` を許容。
- ステータス定義と表示ラベルは `app/utils/constants.ts` に集約。

## 9. 状態管理と主要コンポーネント

- Pinia ストア
  - `useTodoStore`：タスク一覧取得/作成/更新/削除/並び替え、フィルタ状態 (`taskFilter`) を保持。
  - `useTagStore`：タグの取得/作成/更新/削除/並び替え。
- Composable
  - `useTaskRepository`：Supabase との通信層。`useAsyncData` を用いたキャッシュ戦略。
  - `useTaskTimer`：requestAnimationFrame ベースのタイマー制御とブラウザタイトル更新。
  - `useOnboardingSetup`：初回ログイン時のサンプル投入。
  - `useAuthService`：サインイン/サインアップ/ゲストログイン API をラップ。共通エラーメッセージは `mapAuthErrorToMessage`。
- プラグイン
  - `timer-guard.global.ts`：タイマー稼働中に他ページ遷移をブロック。
  - `analytics.ts`：`page:finish` フックで GA4 へページビュー送信。

## 10. 外部サービス・連携

| サービス                | 利用目的                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Supabase                | 認証 (Email/Password, Anonymous, OAuth), Postgres, Edge Functions。                               |
| Supabase Edge Functions | `auto-confirm-email`, `cleanup-anonymous-data`, `cron` (ディレクトリのみ。中身実装は別途要確認)。 |
| Google Tag Manager      | `GT-` ID を `NUXT_PUBLIC_GTM_ID` で設定し dataLayer イベントを送信。                              |
| Playwright              | ブラウザ E2E テスト。                                                                             |

## 11. テストと品質

- **E2E**：`yarn test:e2e` (`playwright test`)。`tests/example.spec.ts` に初期テスト。
- **Lint**：`yarn lint` を用意。ただし ESLint v9 形式 (`eslint.config.js`) 未整備のためエラーが発生する。移行作業が必要。
- **型チェック**：TypeScript strict モード (Nuxt 設定)。
- **推奨追加**：コンポーネント単位テスト (`@nuxt/test-utils`)、ストア単体テスト。

## 12. CI/CD

- 現状リポジトリにワークフロー定義 (.github/workflows) は無し。
- 推奨パイプライン例：
  1. `yarn install --immutable`
  2. Lint (`yarn lint`) と型チェック (`yarn nuxi typecheck`)
  3. Playwright テスト (`yarn test:e2e`)
  4. Nuxt ビルド (`yarn build`)
  5. Supabase Edge Functions のデプロイ (必要に応じ `supabase functions deploy`)
- 環境ごとの Supabase プロジェクト/キー管理と Secret 設定が必要。

## 13. 運用・監視

- ページビュー、タスク操作イベントを GTM → Google Analytics で計測。
- 重要イベント (タスク作成/更新/削除、タイマー開始/停止、検索、レイアウト変更、タグフィルタ) を dataLayer に投入。
- アプリ内部では利用状況ログを `console.log` で出力。必要に応じてモニタリング基盤へリダイレクトする改善余地あり。

## 14. セキュリティと認証

- Supabase Auth のセッション情報を `useSupabaseUser` で取得し、`auth` ミドルウェアでガード。
- `/auth` へのアクセスはログイン済みユーザーでは `/board` へリダイレクト。
- 匿名ユーザーのアップグレード時にメール確認リンク・パスワード設定フローを提供。
- タスク・タグの CRUD はサーバー側 Row Level Security (RLS) を前提とする。ポリシー整備は Supabase 側で実施。
- タイマー実行中にページ遷移させない確認ダイアログでデータ損失を防止。

## 15. 環境変数

| 変数                         | 用途                                           | スコープ              |
| ---------------------------- | ---------------------------------------------- | --------------------- |
| `NUXT_SUPABASE_URL`          | Supabase プロジェクト URL。                    | サーバー/クライアント |
| `NUXT_SUPABASE_ANON_KEY`     | Supabase 匿名キー。                            | サーバー/クライアント |
| `NUXT_PUBLIC_GTM_ID`         | Google Tag Manager ID。                        | 公開                  |
| `NUXT_SUPABASE_CALLBACK_URL` | OAuth リダイレクト先 (public runtime config)。 | 公開                  |
| `VITE_SUPABASE_URL`          | Edge Function 呼び出し用 URL。                 | ビルド時              |

## 16. 既知の課題・改善アイデア

- ESLint v9 用設定ファイルが無いため `yarn lint` が失敗する。`eslint.config.js` への移行が必要。
- Supabase Edge Functions フォルダにコードが存在しない。仕様に沿って実装または削除の判断が必要。
- `todo.total_time` を数値に正規化しているが、DB 側は配列か単一値かが曖昧。スキーマ統一が望まれる。
- `/note/:id` でタスク未取得時のリカバリ (404 や通知) が未実装。
- GA イベント送信失敗時のフォールバックやブラウザ互換テストは今後の検討事項。

---

本仕様書は `task-management-app` リポジトリの現行実装 (Nuxt 4 + Supabase) を対象とし、機能拡張時は随時更新してください。
