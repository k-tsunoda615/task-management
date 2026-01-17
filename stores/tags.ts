import { defineStore } from "pinia";
import type { Tag } from "../types/todo";
import { useTagRepository } from "../app/composables/useTagRepository";

export const useTagStore = defineStore("tag", {
  state: () => ({
    tags: [] as Tag[],
    isLoaded: false,
    isLoading: false,
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
      try {
        const tagRepository = useTagRepository();
        const {
          data: tags,
          pending,
          error,
        } = await tagRepository.fetchAllTags();

        this.isLoading = pending.value;

        if (error.value) {
          console.error("Tagの取得中にエラーが発生しました:", error.value);
          throw error.value;
        }

        if (tags.value) {
          this.tags = tags.value;
          this.isLoaded = true;
        }
      } catch (error) {
        console.error("Tagの取得中にエラーが発生しました:", error);
        throw error;
      }
    },
    async createTag(tag: { name: string; color?: string; user_id?: string }) {
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

      try {
        const tagRepository = useTagRepository();
        const { data, error } = await tagRepository.createTag({
          ...tag,
          sort_order: maxSortOrder + 100, // 100ずつ増やして余裕を持たせる
        });

        if (error) throw error;

        await this.fetchTags();
        return { data, error };
      } catch (error) {
        console.error("Tag作成中にエラー:", error);
        throw error;
      }
    },
    async updateTag(
      tagId: string,
      updates: { name?: string; color?: string; sort_order?: number },
    ) {
      try {
        const tagRepository = useTagRepository();
        const { data, error } = await tagRepository.updateTag(tagId, updates);

        if (error) throw error;

        await this.fetchTags();
        return { data, error };
      } catch (error) {
        console.error("Tag更新中にエラー:", error);
        throw error;
      }
    },
    async updateTagOrder(tagId: string, newOrder: number) {
      return this.updateTag(tagId, { sort_order: newOrder });
    },
    async deleteTag(tagId: string) {
      try {
        const tagRepository = useTagRepository();
        await tagRepository.deleteTag(tagId);
        await this.fetchTags();
      } catch (error) {
        console.error("Tag削除中にエラー:", error);
        throw error;
      }
    },
  },
});
