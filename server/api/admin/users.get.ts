import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { H3Event } from "h3";

type AdminUserMetricsRow = {
  /** ユーザー ID */
  user_id: string;
  /** メールアドレス */
  email: string | null;
  /** 表示名 */
  display_name: string | null;
  /** Todo 件数 */
  todo_count: number | null;
  /** 使用ストレージ容量 */
  storage_bytes: number | null;
};

/**
 * 管理者向けユーザー利用状況のレスポンス。
 */
type AdminUserMetricsResponse = {
  /** ユーザー ID */
  id: string;
  /** メールアドレス */
  email: string | null;
  /** 表示名 */
  displayName: string;
  /** Todo 件数 */
  todoCount: number;
  /** 使用ストレージ容量 */
  storageBytes: number;
};

/**
 * 管理者専用のユーザー利用状況サマリー API。
 * @description 管理者権限を検証し、メトリクスビューを返す。
 * @param {H3Event} event - H3 のリクエストイベント。
 * @returns {Promise<AdminUserMetricsResponse[]>} メトリクス一覧。
 */
const handler = async (
  event: H3Event,
): Promise<AdminUserMetricsResponse[]> => {
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
};

export default defineEventHandler(handler);
