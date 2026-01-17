/**
 * 管理者向けメトリクス取得を再利用しやすくする。
 * @description admin_user_metrics の取得 API を提供する。
 * @returns {object} 管理メトリクス取得関数。
 */
export const useAdminMetricsRepository = () => {
  const client = useSupabaseClient();

  /**
   * 管理画面で必要なメトリクス取得を統一する。
   * @description admin_user_metrics を取得して整形する。
   * @returns {ReturnType<typeof useAsyncData>} メトリクス配列を含む取得結果。
   */
  const fetchAdminMetrics = () =>
    useAsyncData(
      "admin-user-metrics",
      async () => {
        const { data, error } = await client
          .from("admin_user_metrics")
          .select("user_id, email, display_name, todo_count, storage_bytes")
          .order("storage_bytes", { ascending: false })
          .limit(100);

        if (error) {
          throw error;
        }

        return (
          data?.map((row) => ({
            id: row.user_id,
            email: row.email,
            displayName: row.display_name ?? "未設定",
            todoCount: row.todo_count ?? 0,
            storageBytes: row.storage_bytes ?? 0,
          })) ?? []
        );
      },
      {
        server: false,
      },
    );

  return {
    fetchAdminMetrics,
  };
};
