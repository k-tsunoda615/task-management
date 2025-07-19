import {
  TASK_STATUS,
  LEGACY_STATUS_MAPPING,
  DB_STATUS_MAPPING,
} from "./constants";
import type { TaskStatus } from "./constants";
import type { Todo } from "../../types/todo";

/**
 * ステータスを正規化するヘルパー関数
 */
export function normalizeStatus(status: string): TaskStatus {
  if (Object.keys(LEGACY_STATUS_MAPPING).includes(status)) {
    return LEGACY_STATUS_MAPPING[status as keyof typeof LEGACY_STATUS_MAPPING];
  }
  // マッピングにない場合はデフォルト値を返す
  return TASK_STATUS.PRIORITY;
}

/**
 * Todoデータを正規化する関数
 */
export function normalizeTodo(todo: Record<string, unknown>): Todo {
  // ステータスを新しい形式に正規化
  if (!todo.status) {
    todo.status = TASK_STATUS.PRIORITY;
  } else {
    // レガシーステータスを新しい形式に変換
    todo.status = normalizeStatus(todo.status as string);
  }

  if (todo.total_time !== undefined) {
    todo.total_time = Array.isArray(todo.total_time)
      ? (todo.total_time[0] as number)
      : todo.total_time;
  }

  // タグの正規化
  todo.tags = Array.isArray(todo.todo_tags)
    ? todo.todo_tags.map((tt: { tag: unknown }) => tt.tag).filter(Boolean)
    : [];

  return todo as Todo;
}

/**
 * DBへの保存用にTodoデータを変換する関数
 */
export function convertTodoForDB(todo: Partial<Todo>): Record<string, unknown> {
  const dbData = { ...todo };

  // tags属性を除外
  delete dbData.tags;

  // ステータスをDB形式に変換
  if (todo.status) {
    const dbStatus = DB_STATUS_MAPPING[todo.status as TaskStatus];
    return {
      ...dbData,
      status: dbStatus,
      // 更新時間を現在に設定（更新日時が常に正しく記録されるように）
      updated_at: new Date().toISOString(),
    };
  }

  return {
    ...dbData,
    // 更新時間を現在に設定（常に更新されるように）
    updated_at: new Date().toISOString(),
  };
}

/**
 * ドラッグ＆ドロップ操作後のTodoリストのsort_orderを更新するユーティリティ
 * @param todo 移動したTodo
 * @param newIndex 新しいインデックス
 * @param targetList 移動先のリスト
 * @returns 更新対象のTodoと必要な他のTodoのsort_order更新情報
 */
export function calculateNewOrders(
  todo: Todo,
  newIndex: number,
  targetList: Todo[]
) {
  console.log("calculateNewOrders実行:", {
    todoId: todo.id,
    newIndex,
    targetListLength: targetList.length,
  });

  // リストを一度ソートして順序を確保
  const sortedList = [...targetList].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  // 順序値が同じアイテムが複数あるかチェック（バグ検出）
  const hasDuplicateOrders = hasDuplicateSortOrders(sortedList);

  // 新しい位置のsort_orderを計算
  let newSortOrder: number;
  let otherTodosUpdates: { id: string; sort_order: number }[] = [];

  // 順序の重複があるか、アイテムが多い場合は全体を再計算
  if (hasDuplicateOrders || targetList.length > 10) {
    console.log(
      "重複したsort_orderが見つかったか、アイテム数が多いため全体を再計算"
    );

    // 移動後の新しい順序でリストを再構築
    const reorderedList = [...sortedList];

    // 移動元のアイテムを一度削除
    const movedItemIndex = reorderedList.findIndex(
      (item) => item.id === todo.id
    );
    if (movedItemIndex !== -1) {
      reorderedList.splice(movedItemIndex, 1);
    }

    // 新しい位置に挿入
    reorderedList.splice(newIndex, 0, todo);

    // 全てのアイテムに新しいsort_orderを割り当て（100単位）
    otherTodosUpdates = reorderedList.map((item, index) => ({
      id: item.id,
      sort_order: (index + 1) * 100,
    }));

    // 移動したアイテムのsort_orderを取得
    const mainUpdate = otherTodosUpdates.find((item) => item.id === todo.id);
    newSortOrder = mainUpdate ? mainUpdate.sort_order : (newIndex + 1) * 100;

    // メインアイテムは別途更新するので、otherTodosUpdatesからは削除
    otherTodosUpdates = otherTodosUpdates.filter((item) => item.id !== todo.id);
  } else {
    // 通常の計算ロジック（少数のアイテムで順序の重複がない場合）
    if (targetList.length === 0) {
      // リストが空の場合は最初の要素として設定
      newSortOrder = 100;
    } else if (newIndex === 0) {
      // 先頭に移動する場合
      const firstItemOrder = sortedList[0]?.sort_order || 100;
      newSortOrder = Math.max(0, firstItemOrder - 100);
    } else if (newIndex >= targetList.length - 1) {
      // 最後に移動する場合
      const lastItemOrder = sortedList[sortedList.length - 1]?.sort_order || 0;
      newSortOrder = lastItemOrder + 100;
    } else {
      // 間に移動する場合は前後のアイテムの間の値を設定
      const prevItem = sortedList[newIndex - 1];
      const nextItem = sortedList[newIndex];
      const prevOrder = prevItem?.sort_order || 0;
      const nextOrder = nextItem?.sort_order || prevOrder + 200;

      // 前後の差が1以下になった場合は全体を再計算
      if (nextOrder - prevOrder <= 1) {
        console.log("前後の差が小さすぎるため全体を再計算");
        return calculateNewOrders(todo, newIndex, targetList);
      }

      newSortOrder = Math.floor((prevOrder + nextOrder) / 2);
    }
  }

  console.log(`新しいsort_order: ${newSortOrder}（${newIndex}番目に配置）`);

  // 移動したTodoの更新データ
  const mainTodoUpdate = {
    id: todo.id,
    sort_order: newSortOrder,
  };

  return {
    mainTodoUpdate,
    otherTodosUpdates,
  };
}

/**
 * リスト内にsort_orderの重複があるかチェックする関数
 */
function hasDuplicateSortOrders(list: Todo[]): boolean {
  const orderCounts = new Map<number, number>();

  for (const item of list) {
    const order = item.sort_order || 0;
    orderCounts.set(order, (orderCounts.get(order) || 0) + 1);
  }

  // 重複がある場合はtrueを返す
  return Array.from(orderCounts.values()).some((count) => count > 1);
}

/**
 * 単一のTodoのsort_orderだけを更新する簡易バージョン
 * @param todo 移動したTodo
 * @param newIndex 新しいインデックス
 * @returns 更新すべきTodoの情報
 */
export function calculateSimpleOrder(todo: Todo, newIndex: number) {
  // 単純に新しいインデックスに1000を掛けた値を使用
  const newSortOrder = (newIndex + 1) * 1000; // 1000, 2000, 3000, ...

  return {
    id: todo.id,
    sort_order: newSortOrder,
  };
}

/**
 * 必要に応じて全アイテムの順序を再計算する
 * 注意: この関数は通常は必要ないが、順序が混乱した場合のリセット用
 * @param todos Todoリスト
 * @param status 対象のステータス
 * @returns 更新すべきTodoの配列 (id, sort_orderのみ)
 */
export function recalculateAllOrders(todos: Todo[], status: TaskStatus) {
  // ステータスでフィルタリングしてから順序を再計算
  const filteredTodos = todos
    .filter((todo) => todo.status === status)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // 各アイテムの順序を100単位で設定
  return filteredTodos.map((todo, index) => ({
    id: todo.id,
    sort_order: index * 100,
  }));
}
