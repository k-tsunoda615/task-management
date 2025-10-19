export function useProfileRepository() {
  const client = useSupabaseClient();

  const fetchProfiles = () =>
    useAsyncData("profiles", async () => {
      const { data, error } = await client
        .from("profiles")
        .select(
          "id, email, display_name, username, full_name, account_type, is_anonymous, created_at, inserted_at, updated_at, last_login_at"
        )
        .order("updated_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return data ?? [];
    }, {
      server: false,
    });

  return {
    fetchProfiles,
  };
}
