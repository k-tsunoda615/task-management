import type { Todo } from "../../types/todo";

/**
 * タスク検索用composable
 * @param todosRef - タスク配列（ref/computed）
 * @param queryRef - 検索クエリ（ref）
 * @param tagIdRef - 選択中のタグID（ref, nullなら全件）
 */
export function useTodoSearch(
  todosRef: Ref<Todo[]>,
  queryRef: Ref<string>,
  tagIdRef?: Ref<string | null>,
) {
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
}
