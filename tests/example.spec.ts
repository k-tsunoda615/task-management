import { test, expect } from "@playwright/test";

test.describe("タスク管理アプリ", () => {
  test("ホームページが正常に読み込まれる", async ({ page }) => {
    // ホームページにアクセス
    await page.goto("/");

    // ページタイトルを確認
    await expect(page).toHaveTitle(/タスク管理アプリ/);

    // メインコンテンツが表示されることを確認
    await expect(page.locator("body")).toBeVisible();
  });
});
