import { defineStore } from "pinia";
import type { Tag } from "../types/todo";

export const useTagStore = defineStore("tag", {
  state: () => ({
    tags: [] as Tag[],
    isLoaded: false,
  }),
  getters: {
    totalTagCount(): number {
      return this.tags.length;
    },
    sortedTags(): Tag[] {
      return [...this.tags].sort((a, b) => a.sort_order - b.sort_order);
    },
  },
  actions: {
    async fetchTags() {
      this.isLoaded = false;
      const client = useSupabaseClient();
      try {
        const { data: tags, error } = await client
          .from("tags")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        this.tags = tags || [];
        this.isLoaded = true;
      } catch (error) {
        console.error("Tagの取得中にエラーが発生しました:", error);
        throw error;
      }
    },
    async createTag(tag: { name: string; color?: string; user_id?: string }) {
      const client = useSupabaseClient();
      const user = useSupabaseUser();

      // まず同じ名前のタグが存在するか確認
      const existingTag = this.tags.find((t) => t.name === tag.name);
      if (existingTag) {
        // 既存のタグが見つかった場合はそれを返す
        return { data: existingTag, error: null };
      }

      // 最大のsort_orderを取得
      const maxSortOrder = this.tags.reduce(
        (max, t) => Math.max(max, t.sort_order || 0),
        0,
      );

      // 存在しない場合は新規作成
      const { data, error } = await client
        .from("tags")
        .insert({
          name: tag.name,
          user_id: tag.user_id || user.value?.id,
          color: tag.color || "#3b82f6",
          sort_order: maxSortOrder + 100, // 100ずつ増やして余裕を持たせる
        })
        .select()
        .single();
      if (error) throw error;
      await this.fetchTags();
      return { data, error };
    },
    async updateTag(
      tagId: string,
      updates: { name?: string; color?: string; sort_order?: number },
    ) {
      const client = useSupabaseClient();
      const { data, error } = await client
        .from("tags")
        .update(updates)
        .eq("id", tagId)
        .select()
        .single();
      if (error) throw error;
      await this.fetchTags();
      return { data, error };
    },
    async updateTagOrder(tagId: string, newOrder: number) {
      return this.updateTag(tagId, { sort_order: newOrder });
    },
    async deleteTag(tagId: string) {
      const client = useSupabaseClient();
      const { error } = await client.from("tags").delete().eq("id", tagId);
      if (error) throw error;
      await this.fetchTags();
    },
  },
});
