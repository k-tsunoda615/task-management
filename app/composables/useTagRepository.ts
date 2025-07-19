export function useTagRepository() {
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  /**
   * 全タグを取得する（キャッシュ付き）
   */
  const fetchAllTags = () => {
    return useAsyncData(
      "tags",
      async () => {
        try {
          const { data: tags, error } = await client
            .from("tags")
            .select("*")
            .order("sort_order", { ascending: true });

          if (error) throw error;

          return tags || [];
        } catch (error) {
          console.error("Tagの取得中にエラーが発生しました:", error);
          throw error;
        }
      },
      {
        server: false, // クライアントサイドのみで実行（認証が必要なため）
      }
    );
  };

  /**
   * 新しいタグを作成する
   */
  const createTag = async (tag: {
    name: string;
    color?: string;
    user_id?: string;
    sort_order?: number;
  }) => {
    try {
      const { data, error } = await client
        .from("tags")
        .insert({
          name: tag.name,
          user_id: tag.user_id || user.value?.id,
          color: tag.color || "#3b82f6",
          sort_order: tag.sort_order || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // キャッシュを無効化
      await refreshCookie("tags");

      return { data, error: null };
    } catch (error) {
      console.error("Tag作成中にエラー:", error);
      throw error;
    }
  };

  /**
   * タグを更新する
   */
  const updateTag = async (
    tagId: string,
    updates: { name?: string; color?: string; sort_order?: number }
  ) => {
    try {
      const { data, error } = await client
        .from("tags")
        .update(updates)
        .eq("id", tagId)
        .select()
        .single();

      if (error) throw error;

      // キャッシュを無効化
      await refreshCookie("tags");

      return { data, error: null };
    } catch (error) {
      console.error("Tag更新中にエラー:", error);
      throw error;
    }
  };

  /**
   * タグを削除する
   */
  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await client.from("tags").delete().eq("id", tagId);

      if (error) throw error;

      // キャッシュを無効化
      await refreshCookie("tags");

      return true;
    } catch (error) {
      console.error("Tag削除中にエラー:", error);
      throw error;
    }
  };

  return {
    fetchAllTags,
    createTag,
    updateTag,
    deleteTag,
  };
}
