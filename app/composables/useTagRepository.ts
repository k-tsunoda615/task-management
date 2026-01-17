/**
 * タグの CRUD を集約し、UI からの参照窓口を一本化する。
 * @description Supabase の tags テーブルに対する取得/作成/更新/削除 API を返す。
 * @returns {object} タグ操作用の関数群。
 */
export const useTagRepository = () => {
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  /**
   * タグ一覧を一貫した形で取得する。
   * @description useAsyncData で tags を取得し、順序で並べ替える。
   * @returns {ReturnType<typeof useAsyncData>} tags の配列を含む取得結果。
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
      },
    );
  };

  /**
   * UI からの新規タグ作成を統一する。
   * @description tags に insert し、キャッシュを無効化する。
   * @param {object} tag - 作成対象のタグ情報。
   * @returns {Promise<{ data: unknown; error: null }>} 作成結果。
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
   * タグ更新処理を一箇所にまとめる。
   * @description tags の指定行を更新し、キャッシュを無効化する。
   * @param {string} tagId - 更新対象のタグ ID。
   * @param {object} updates - 更新するフィールド。
   * @returns {Promise<{ data: unknown; error: null }>} 更新結果。
   */
  const updateTag = async (
    tagId: string,
    updates: { name?: string; color?: string; sort_order?: number },
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
   * タグ削除を一貫した手順で行う。
   * @description tags の指定行を削除し、キャッシュを無効化する。
   * @param {string} tagId - 削除対象のタグ ID。
   * @returns {Promise<boolean>} 成功時 true。
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
};
