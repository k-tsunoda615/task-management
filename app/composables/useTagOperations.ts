import { useTagStore } from "../../stores/tags";
import type { Tag } from "../../types/todo";

/**
 * タグ管理 UI の操作をシンプルに保つ。
 * @description 入力状態と CRUD 操作をまとめて提供する。
 * @returns {object} タグ操作に必要な state と関数群。
 */
export const useTagOperations = () => {
  const tagStore = useTagStore();
  const newTagName = ref("");
  const newTagColor = ref("#3b82f6");

  onMounted(async () => {
    await tagStore.fetchTags();
  });

  /**
   * 新規タグの追加ロジックを一箇所に閉じる。
   * @description 入力値を検証し、タグを作成して状態をリセットする。
   * @returns {Promise<void>} 作成処理の完了。
   */
  const addTag = async () => {
    const name = newTagName.value.trim();
    const color = newTagColor.value;
    if (!name) return;
    if (tagStore.tags.some((t: Tag) => t.name === name)) {
      newTagName.value = "";
      newTagColor.value = "#3b82f6";
      return;
    }
    const { data, error } = await tagStore.createTag({ name, color });
    if (!error && data) {
      newTagName.value = "";
      newTagColor.value = "#3b82f6";
    }
  };

  /**
   * タグ削除の導線を統一する。
   * @description 確認ダイアログを挟み、タグを削除する。
   * @param {string} tagId - 削除対象のタグ ID。
   * @returns {Promise<void>} 削除処理の完了。
   */
  const deleteTag = async (tagId: string) => {
    if (!confirm("このタグを削除しますか？")) return;
    await tagStore.deleteTag(tagId);
  };

  /**
   * タグ更新を一貫したバリデーションで行う。
   * @description 入力を整形し、ストア経由で更新する。
   * @param {object} tagData - 更新対象のタグ情報。
   * @returns {Promise<void>} 更新処理の完了。
   */
  const updateTag = async (tagData: {
    id: string;
    name: string;
    color: string;
  }) => {
    if (!tagData.id || !tagData.name.trim()) return;

    await tagStore.updateTag(tagData.id, {
      name: tagData.name.trim(),
      color: tagData.color,
    });
  };

  return {
    tagStore,
    newTagName,
    newTagColor,
    addTag,
    deleteTag,
    updateTag,
  };
};
