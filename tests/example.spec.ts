import { test, expect } from "@playwright/test";

test.describe("タスク管理アプリ", () => {
  test("ページが読み込まれる", async ({ page }) => {
    // ホームページにアクセス
    await page.goto("/");

    // ページが正常に読み込まれることを確認
    await page.waitForLoadState("networkidle");

    // HTMLが表示されることを確認
    await expect(page.locator("html")).toBeVisible();

    // ページタイトルが設定されていることを確認
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("認証ページが表示される", async ({ page }) => {
    // 認証ページにアクセス
    await page.goto("/auth");

    // ページが正常に読み込まれることを確認
    await page.waitForLoadState("networkidle");

    // bodyが表示されることを確認
    await expect(page.locator("body")).toBeVisible();
  });
});
