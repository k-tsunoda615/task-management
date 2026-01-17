import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { H3Event } from "h3";

type AdminUserMetricsRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  todo_count: number | null;
  storage_bytes: number | null;
};

/**
 * 管理者専用のユーザー利用状況サマリー API
 * - 現在ログイン中のユーザーが app_admins に登録されているか確認
 * - admin_user_metrics ビューを service role で読み取り、JSON を返す
 */
export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient(event);

  // 現在のセッションユーザーを取得
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  // app_admins に登録されているかチェック
  const { data: adminRow, error: adminError } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    throw createError({
      statusCode: 500,
      statusMessage: adminError.message ?? "Failed to verify admin permissions",
    });
  }

  if (!adminRow) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const { data, error } = await supabase
    .from("admin_user_metrics")
    .select("user_id, email, display_name, todo_count, storage_bytes")
    .order("storage_bytes", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message ?? "Failed to fetch admin metrics",
    });
  }

  const rows = (data ?? []) as AdminUserMetricsRow[];

  return rows.map((row) => ({
    id: row.user_id,
    email: row.email,
    displayName: row.display_name ?? "未設定",
    todoCount: row.todo_count ?? 0,
    storageBytes: row.storage_bytes ?? 0,
  }));
});
