<template>
  <div class="relative w-full">
    <!-- フィルターとソートオプション -->
    <TableActions
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      :selectedCount="selectedTodos.length"
      @deleteTodos="deleteSelectedTodos"
    />

    <!-- メインテーブル -->
    <div class="rounded-[6px] border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap">
          <TableHeader
            :sortColumn="sortColumn"
            :sortDirection="sortDirection"
            :select-all="selectAll"
            @sort="sortBy"
            @toggleSelectAll="toggleSelectAll"
          />
          <draggable
            v-model="draggedTodos"
            tag="tbody"
            handle=".handle"
            :animation="200"
            class="bg-white divide-y divide-gray-200"
            @change="handleDragChange"
            @start="handleDragStart"
            @end="handleDragEnd"
            :group="{ name: 'todos', pull: true, put: true }"
            item-key="id"
            ghost-class="ghost-card"
            chosen-class="chosen-item"
            drag-class="drag-item"
            :delay="50"
            :delayOnTouchOnly="true"
            :fallbackTolerance="5"
            :force-fallback="true"
          >
            <template #item="{ element }">
              <TableRow
                :todo="element"
                :is-selected="selectedTodos.includes(element.id)"
                @toggleSelect="toggleSelect"
                @updateTodo="updateTodo"
                @closeAllEditors="closeAllEditors"
              />
            </template>
            <template #footer v-if="filteredAndSortedTodos.length === 0">
              <tr>
                <td
                  colspan="7"
                  class="px-4 py-8 text-center text-sm text-gray-500"
                >
                  表示するタスクがありません
                </td>
              </tr>
            </template>
          </draggable>
        </table>
      </div>
    </div>

    <!-- 合計時間表示 -->
    <div class="mt-4 text-right text-sm text-gray-600">
      合計時間: {{ formatTime(totalTime) }}
    </div>

    <!-- ローディングインジケーター -->
    <div
      v-if="!todoStore.isLoaded"
      class="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="text-center">
        <USpinner size="lg" class="mb-4" />
        <p class="text-gray-600">読み込み中...</p>
      </div>
    </div>

    <!-- 削除確認モーダル -->
    <UModal v-model="showDeleteModal">
      <div class="p-4">
        <h3 class="text-lg font-medium mb-2">タスクの削除</h3>
        <p class="mb-4">
          選択した
          {{ selectedTodos.length }}
          件のタスクを削除します。この操作は元に戻せません。
        </p>
        <div class="flex justify-end gap-2">
          <UButton color="gray" @click="showDeleteModal = false"
            >キャンセル</UButton
          >
          <UButton
            color="red"
            @click="confirmDelete"
            :loading="isDeleting"
            :disabled="isDeleting"
          >
            削除
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useTodoStore } from "../../../stores/tasks";
import { useTagStore } from "../../../stores/tags";
import { TASK_STATUS } from "../../utils/constants";
import type { Todo } from "../../../types/todo";
import TableHeader from "./TableHeader.vue";
import TableRow from "./TableRow.vue";
import TableActions from "./TableActions.vue";
import { formatTime, extractTotalTime } from "./TableUtils";
import draggable from "vuedraggable";
import { calculateNewOrders } from "../../utils/todoUtils";

// Pinia ストアからTodo一覧を取得
const todoStore = useTodoStore();
const tagStore = useTagStore();

// フィルターとソートの状態
const searchQuery = ref("");
const statusFilter = ref("");
const privateFilter = ref<boolean | null>(null);
const showCompletedTasks = ref(false);
const sortColumn = ref("sort_order");
const sortDirection = ref<"asc" | "desc" | "none">("none");
const selectedTodos = ref<string[]>([]);
const selectAll = ref(false);
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const isDragging = ref(false);
const isUpdating = ref(false);

// ドラッグ中に使用する内部状態を追加
const internalDraggedTodos = ref<Todo[]>([]);
const isInternalDragActive = ref(false);

// コンポーネントマウント時にTodoデータを取得
onMounted(async () => {
  if (!todoStore.isLoaded) {
    await todoStore.fetchTodos();
  }

  // タグデータを取得
  if (!tagStore.isLoaded) {
    await tagStore.fetchTags();
  }

  // サイドバーの公開設定フィルタリングと連携
  updatePrivateFilterFromStore();

  // ストアのtaskFilterが変更されたときに連携する
  watch(() => todoStore.taskFilter, updatePrivateFilterFromStore);

  // 完了タスク表示状態を復元
  const savedCompletedTasksState = localStorage.getItem("showCompletedTasks");
  if (savedCompletedTasksState !== null) {
    showCompletedTasks.value = savedCompletedTasksState === "true";
  }

  // 完了タスク表示切り替えイベントを監視
  window.addEventListener("completedTasksVisibilityToggle", (event: any) => {
    showCompletedTasks.value = event.detail.showCompletedTasks;
  });

  // クリーンアップ
  onUnmounted(() => {
    window.removeEventListener(
      "completedTasksVisibilityToggle",
      (event: any) => {
        showCompletedTasks.value = event.detail.showCompletedTasks;
      }
    );
  });
});

// ストアのtaskFilterからprivateFilterを更新
function updatePrivateFilterFromStore() {
  if (todoStore.taskFilter === "all") {
    privateFilter.value = null;
  } else if (todoStore.taskFilter === "private") {
    privateFilter.value = true;
  } else if (todoStore.taskFilter === "public") {
    privateFilter.value = false;
  }
}

// 全選択の切り替え
function toggleSelectAll(value: boolean) {
  selectAll.value = value;
  if (value) {
    selectedTodos.value = filteredAndSortedTodos.value.map((todo) => todo.id);
  } else {
    selectedTodos.value = [];
  }
}

// 個別選択の切り替え
function toggleSelect(id: string, selected: boolean) {
  if (selected) {
    selectedTodos.value.push(id);
  } else {
    selectedTodos.value = selectedTodos.value.filter((todoId) => todoId !== id);
  }

  // 全選択状態を更新
  selectAll.value =
    selectedTodos.value.length === filteredAndSortedTodos.value.length &&
    filteredAndSortedTodos.value.length > 0;
}

// 選択したタスクの削除
function deleteSelectedTodos() {
  if (selectedTodos.value.length === 0) return;
  showDeleteModal.value = true;
}

// 削除の確認
async function confirmDelete() {
  if (selectedTodos.value.length === 0) return;

  const selectedCount = selectedTodos.value.length;
  try {
    isDeleting.value = true;
    const idsToDelete = [...selectedTodos.value]; // 配列のコピーを作成

    // 削除処理を実行
    for (const id of idsToDelete) {
      await todoStore.deleteTodo(id);
    }

    // 選択状態をリセット
    selectedTodos.value = [];
    selectAll.value = false;
    showDeleteModal.value = false;

    console.log(`${selectedCount}件のタスクを削除しました`);
  } catch (error) {
    console.error("削除中にエラーが発生しました:", error);
  } finally {
    isDeleting.value = false;
  }
}

// ドラッグ可能なTodo一覧
const draggedTodos = computed<Todo[]>({
  get: (): Todo[] => {
    // ドラッグ中は内部状態を返す（ちらつき防止のため）
    if (isInternalDragActive.value) {
      return internalDraggedTodos.value;
    }
    return filteredAndSortedTodos.value;
  },
  set: (value: Todo[]): void => {
    console.log("draggedTodos.set:", value.length);
    // ドラッグ開始時に内部状態を更新
    internalDraggedTodos.value = [...value];
    // ドラッグ中フラグを設定
    isInternalDragActive.value = true;
  },
});

// フィルタリングとソートを適用したTodo一覧を計算
const filteredAndSortedTodos = computed<Todo[]>(() => {
  // 検索とフィルターを適用
  let result = todoStore.todos.filter((todo: Todo) => {
    // テキスト検索
    const matchesSearch =
      searchQuery.value === "" ||
      todo.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (todo.memo &&
        todo.memo.toLowerCase().includes(searchQuery.value.toLowerCase()));

    // ステータスフィルター
    const matchesStatus =
      statusFilter.value === "" || todo.status === statusFilter.value;

    // プライベートフィルター
    const matchesPrivate =
      privateFilter.value === null || todo.is_private === privateFilter.value;

    // 完了タスクフィルター
    const matchesCompletedState = showCompletedTasks.value || !todo.is_finished;

    return (
      matchesSearch && matchesStatus && matchesPrivate && matchesCompletedState
    );
  });

  // ソートを適用（デフォルトは常にsort_orderの昇順）
  if (sortColumn.value === "" || sortDirection.value === "none") {
    // デフォルトはsort_orderの昇順
    result = result.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } else {
    // 他のカラムでソート
    result = result.sort((a, b) => {
      let valueA: any = a[sortColumn.value as keyof Todo];
      let valueB: any = b[sortColumn.value as keyof Todo];

      // ステータスの場合は特別な順序を適用
      if (sortColumn.value === "status") {
        const statusOrder = {
          [TASK_STATUS.PRIORITY]: 0,
          [TASK_STATUS.NEXT]: 1,
          [TASK_STATUS.ARCHIVED]: 2,
        };
        valueA = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
        valueB = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
      }

      // タグの場合は特別な処理を行う
      if (sortColumn.value === "tags") {
        // タグ名の配列を取得
        const tagsA =
          a.tags
            ?.map((tag) => tag.name)
            .sort()
            .join(",") || "";
        const tagsB =
          b.tags
            ?.map((tag) => tag.name)
            .sort()
            .join(",") || "";

        if (sortDirection.value === "asc") {
          return tagsA.localeCompare(tagsB);
        } else {
          return tagsB.localeCompare(tagsA);
        }
      }

      // タイトルなど文字列の場合
      if (typeof valueA === "string" && typeof valueB === "string") {
        if (sortDirection.value === "asc") {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }

      // 日付文字列の場合
      if (sortColumn.value === "updated_at") {
        const dateA = valueA ? new Date(valueA).getTime() : 0;
        const dateB = valueB ? new Date(valueB).getTime() : 0;
        return sortDirection.value === "asc" ? dateA - dateB : dateB - dateA;
      }

      // 数値や真偽値の場合
      if (sortDirection.value === "asc") {
        return (valueA || 0) - (valueB || 0);
      } else {
        return (valueB || 0) - (valueA || 0);
      }
    });
  }

  // ドラッグ中でなければ内部状態も更新
  if (!isInternalDragActive.value) {
    internalDraggedTodos.value = [...result];
  }

  return result;
});

// ドラッグの開始ハンドラを追加
function handleDragStart() {
  console.log("ドラッグ開始");
  // 内部ドラッグ状態をアクティブに
  isInternalDragActive.value = true;
  // グローバルフラグも設定
  isDragging.value = true;
}

// ドラッグの終了ハンドラを追加
function handleDragEnd() {
  console.log("ドラッグ終了 - 成功時は状態はhandleDragChangeで処理済み");
  // ドラッグ変更がなかった場合のみここでフラグをリセット
  if (isInternalDragActive.value) {
    isInternalDragActive.value = false;
    isDragging.value = false;
  }
}

// ドラッグ変更のハンドラ
async function handleDragChange(evt: any) {
  console.log("ドラッグ変更イベント:", JSON.stringify(evt, null, 2));

  // ドラッグ&ドロップの種類を特定（moved: 同じリスト内の移動）
  if (evt.moved) {
    const { element: todo, newIndex, oldIndex } = evt.moved;

    console.log(`Todoの移動: ID=${todo.id}, ${oldIndex} -> ${newIndex}`);

    if (oldIndex === newIndex) {
      // 変更なしの場合は内部状態をリセットして終了
      isInternalDragActive.value = false;
      isDragging.value = false;
      return;
    }

    // 更新中フラグをセット
    isUpdating.value = true;

    // 現在のUIの順序を保持するためにディープコピーを作成（ロールバック用）
    const originalTodos = [...todoStore.todos];
    const originalInternalState = [...internalDraggedTodos.value];

    try {
      // ドラッグ中のちらつき防止のために、ローカルでのソート順序を即時反映
      // 移動された要素のsort_orderを事前に更新（UI表示優先）
      const tempSortedList = [...internalDraggedTodos.value].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );

      // 簡易的な一時的sort_orderの計算（表示用）
      let tempSortOrder = 0;
      if (newIndex === 0) {
        tempSortOrder = (tempSortedList[0]?.sort_order || 100) - 10;
      } else if (newIndex >= tempSortedList.length - 1) {
        tempSortOrder =
          (tempSortedList[tempSortedList.length - 1]?.sort_order || 0) + 10;
      } else {
        const prevItem = tempSortedList[newIndex - 1];
        const nextItem = tempSortedList[newIndex];
        tempSortOrder = Math.floor(
          ((prevItem?.sort_order || 0) + (nextItem?.sort_order || 0)) / 2
        );
      }

      // UIで使用する内部状態を先に更新（表示ちらつき防止）
      const todoIndex = internalDraggedTodos.value.findIndex(
        (t) => t.id === todo.id
      );
      if (todoIndex !== -1) {
        internalDraggedTodos.value[todoIndex].sort_order = tempSortOrder;
      }

      // 新しいソート順を計算（バックグラウンドで実行）
      const { mainTodoUpdate, otherTodosUpdates } = calculateNewOrders(
        todo,
        newIndex,
        internalDraggedTodos.value // 内部状態を使用
      );

      // 移動したTodoのローカルの順序を更新（即時UI反映）
      const mainIndex = todoStore.todos.findIndex(
        (t) => t.id === mainTodoUpdate.id
      );
      if (mainIndex !== -1) {
        todoStore.todos[mainIndex].sort_order = mainTodoUpdate.sort_order;
      }

      // メインのTodoのサーバー更新
      await todoStore.updateTodoOrder({
        id: mainTodoUpdate.id,
        sort_order: mainTodoUpdate.sort_order,
      });

      console.log("メインTodo更新完了:", mainTodoUpdate);

      // 他のTodoの順序も一括更新
      if (otherTodosUpdates.length > 0) {
        console.log(`${otherTodosUpdates.length}個のTodoの順序を更新`);

        // ローカルStoreを先に更新（即時UI反映）
        otherTodosUpdates.forEach((update) => {
          const index = todoStore.todos.findIndex((t) => t.id === update.id);
          if (index !== -1) {
            todoStore.todos[index].sort_order = update.sort_order || 0;
          }
        });

        // 内部配列も更新して表示を一貫させる
        otherTodosUpdates.forEach((update) => {
          const index = internalDraggedTodos.value.findIndex(
            (t) => t.id === update.id
          );
          if (index !== -1) {
            internalDraggedTodos.value[index].sort_order =
              update.sort_order || 0;
          }
        });

        // サーバーに一括更新
        const updatePromises = otherTodosUpdates.map((updateData) =>
          todoStore.updateTodoOrder({
            id: updateData.id,
            sort_order: updateData.sort_order || 0,
          })
        );

        await Promise.all(updatePromises);
      }

      console.log("サーバー更新完了");

      // 更新の成功メッセージ
      useToast().add({
        title: "更新完了",
        description: "タスクの順序を更新しました",
        color: "green",
      });
    } catch (error) {
      console.error("更新エラー:", error);

      // エラー時は元の状態に戻す
      todoStore.todos = originalTodos;
      internalDraggedTodos.value = originalInternalState;

      useToast().add({
        title: "エラー",
        description: "タスクの移動に失敗しました",
        color: "red",
      });
    } finally {
      // 処理完了後、少し遅延してから内部状態をリセット
      setTimeout(() => {
        isInternalDragActive.value = false;
        isDragging.value = false;
        isUpdating.value = false;
      }, 100); // 遅延を少し長めに
    }
  } else if (evt.added) {
    // 他のリストからの追加も処理（必要に応じて実装）
    console.log("他のリストからの追加:", evt.added);
    // 処理完了後すぐに内部状態をリセットしない（ドラッグ操作中のため）
  } else {
    // その他の変更の場合は内部状態をリセット
    setTimeout(() => {
      isInternalDragActive.value = false;
      isDragging.value = false;
    }, 100); // 遅延を少し長めに
  }
}

// Todoを更新
async function updateTodo(updatedData: Partial<Todo>) {
  try {
    console.log("TodoRow からの更新データ:", updatedData);

    // タグが含まれている場合、正しい形式で保存されるようにする
    if (updatedData.tags) {
      console.log("タグの更新処理:", updatedData.tags);
    }

    const result = await todoStore.updateTodo(updatedData);

    // 更新が成功したらトースト表示
    useToast().add({
      title: "更新完了",
      description: "タスクを更新しました",
      color: "green",
    });

    return result;
  } catch (error) {
    console.error("タスクの更新中にエラーが発生しました:", error);

    // エラー時にはトースト表示
    useToast().add({
      title: "エラー",
      description: "タスクの更新に失敗しました",
      color: "red",
    });

    throw error;
  }
}

// 合計時間を計算
const totalTime = computed(() => {
  return filteredAndSortedTodos.value.reduce((sum: number, todo: Todo) => {
    // extractTotalTimeを使用して時間を取得
    return sum + extractTotalTime(todo.total_time);
  }, 0);
});

// ソートの切り替え
function sortBy(column: string) {
  // ドラッグ中は何もしない
  if (isInternalDragActive.value || isDragging.value) return;

  if (sortColumn.value === column) {
    // 同じカラムの場合は「降順→昇順→オーダーナンバー（デフォルト）」の順で切り替え
    if (sortDirection.value === "desc") {
      sortDirection.value = "asc";
    } else if (sortDirection.value === "asc") {
      // デフォルト（オーダーナンバー）に戻す
      sortColumn.value = "";
      sortDirection.value = "none";
    } else {
      sortDirection.value = "desc";
    }
  } else {
    // 新しいカラムの場合
    sortColumn.value = column;
    // 最初は降順から始める
    sortDirection.value = "desc";
  }
}

// すべての編集状態を閉じる関数
function closeAllEditors() {
  // 全てのTableRowコンポーネントに通知するためのイベントバスを使う方法もあります
  // 単純な実装として、イベントをブロードキャストします
  const tableRows = document.querySelectorAll("tbody tr");
  tableRows.forEach((row) => {
    // Vue componentインスタンスへのアクセス方法がないため、
    // カスタムイベントでDOM経由で通知
    row.dispatchEvent(new CustomEvent("close-editors", { bubbles: true }));
  });
}
</script>

<style>
/* ドラッグ＆ドロップ関連のスタイル */
/* .ghost-card {
  background-color: #f3f4f6;
  border: 1px dashed #d1d5db;
  opacity: 0.6;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: none !important;
}

.drag-item {
  opacity: 0.8;
  background-color: #f9fafb;
  transform: rotate(1deg) scale(1.02);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 20;
  transition: transform 0.3s ease;
  cursor: grabbing;
  will-change: transform;
}

.chosen-item {
  background-color: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 15;
  transition: all 0.3s ease;
} */

/* ドラッグハンドルのスタイル */
/* .handle {
  cursor: grab;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  height: 100%;
  user-select: none;
}
.handle:hover {
  color: #6366f1;
}
.handle:active {
  cursor: grabbing;
} */

/* アニメーション効果 */
/* .sortable-drag {
  transition: transform 0.3s ease;
  will-change: transform;
}
.sortable-ghost {
  transition: all 0.3s ease;
  opacity: 0.5;
} */

/* ドラッグ中のテーブル行スタイル */
/* tr.is-dragging {
  background-color: #f9fafb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  will-change: transform;
} */

/* ドラッグ可能なテーブル行にホバー効果を追加 */
/* tbody tr {
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
}

tbody tr:hover .handle {
  color: #6366f1;
} */
</style>
