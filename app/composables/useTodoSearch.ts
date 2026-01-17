import type { Todo } from "../../types/todo";

/**
 * UI 側で検索ロジックを散らさない。
 * @description タスク配列をクエリ/タグでフィルタする。
 * @param {Ref<Todo[]>} todosRef - 対象となるタスク配列。
 * @param {Ref<string>} queryRef - 検索クエリ。
 * @param {Ref<string | null>} [tagIdRef] - フィルタ対象のタグ ID。
 * @returns {object} 検索済みタスクの computed。
 */
export const useTodoSearch = (
  todosRef: Ref<Todo[]>,
  queryRef: Ref<string>,
  tagIdRef?: Ref<string | null>,
) => {
  const searchedTodos = computed(() => {
    const query = queryRef.value.trim().toLowerCase();
    const tagId = tagIdRef?.value || null;
    return todosRef.value.filter((todo) => {
      // タグIDで絞り込み
      if (tagId && !(todo.tags || []).some((tag) => tag.id === tagId)) {
        return false;
      }
      // キーワード検索
      if (!query) return true;
      const inTitle = todo.title?.toLowerCase().includes(query);
      const inMemo = todo.memo?.toLowerCase().includes(query);
      return inTitle || inMemo;
    });
  });
  return { searchedTodos };
};
