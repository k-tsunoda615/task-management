import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリの場所
  testDir: "./tests",

  // 並列実行しないテストファイルの設定
  fullyParallel: true,

  // CI環境でのみテストが失敗した場合の再試行設定
  forbidOnly: !!process.env.CI,

  // CI環境でのテスト再試行回数
  retries: process.env.CI ? 2 : 0,

  // 並列実行するワーカー数
  workers: process.env.CI ? 1 : undefined,

  // レポーターの設定
  reporter: [
    ["html", { open: "never" }],
    ["line"],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  // 全テストで共通の設定
  use: {
    // ベースURL（Nuxtアプリケーションが実行されるURL）
    baseURL: "http://localhost:3000",

    // スクリーンショットの設定
    screenshot: "only-on-failure",

    // ビデオ録画の設定
    video: "retain-on-failure",

    // トレースの設定（デバッグ用）
    trace: "retain-on-failure",
  },

  // プロジェクト設定（異なるブラウザでのテスト）
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // モバイルブラウザのテスト（必要に応じてコメントアウト）
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // ローカル開発サーバーの設定
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
