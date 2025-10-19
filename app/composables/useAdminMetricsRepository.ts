export function useAdminMetricsRepository() {
  const client = useSupabaseClient();

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
}
