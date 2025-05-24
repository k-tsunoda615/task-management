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
    <div class="border rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap">
          <TableHeader
            :sortColumn="sortColumn"
            :sortDirection="sortDirection"
            :select-all="selectAll"
            @sort="sortBy"
            @toggleSelectAll="toggleSelectAll"
          />
          <tbody class="bg-white divide-y divide-gray-200">
            <TableRow
              v-for="todo in filteredAndSortedTodos"
              :key="todo.id"
              :todo="todo"
              :is-selected="selectedTodos.includes(todo.id)"
              @toggleSelect="toggleSelect"
            />
            <tr v-if="filteredAndSortedTodos.length === 0">
              <td
                colspan="7"
                class="px-4 py-8 text-center text-sm text-gray-500"
              >
                表示するタスクがありません
              </td>
            </tr>
          </tbody>
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
import { ref, computed, onMounted, watch } from "vue";
import { useTodoStore } from "../../stores/todo";
import { TASK_STATUS } from "../../utils/constants";
import type { Todo } from "../../types/todo";
import TableHeader from "./TableHeader.vue";
import TableRow from "./TableRow.vue";
import TableActions from "./TableActions.vue";
import { formatTime, extractTotalTime } from "./TableUtils";

// Pinia ストアからTodo一覧を取得
const todoStore = useTodoStore();

// フィルターとソートの状態
const searchQuery = ref("");
const statusFilter = ref("");
const privateFilter = ref<boolean | null>(null);
const sortColumn = ref("status");
const sortDirection = ref<"asc" | "desc">("asc");
const selectedTodos = ref<string[]>([]);
const selectAll = ref(false);
const showDeleteModal = ref(false);
const isDeleting = ref(false);

// コンポーネントマウント時にTodoデータを取得
onMounted(async () => {
  if (!todoStore.isLoaded) {
    await todoStore.fetchTodos();
  }

  // サイドバーの公開設定フィルタリングと連携
  updatePrivateFilterFromStore();

  // ストアのtaskFilterが変更されたときに連携する
  watch(() => todoStore.taskFilter, updatePrivateFilterFromStore);
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

// フィルタリングとソートを適用したTodo一覧を計算
const filteredAndSortedTodos = computed(() => {
  // 検索とフィルターを適用
  let result = todoStore.todos.filter((todo) => {
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

    return matchesSearch && matchesStatus && matchesPrivate;
  });

  // ソートを適用
  return result.sort((a, b) => {
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
});

// 合計時間を計算
const totalTime = computed(() => {
  return filteredAndSortedTodos.value.reduce((sum, todo) => {
    // extractTotalTimeを使用して時間を取得
    return sum + extractTotalTime(todo.total_time);
  }, 0);
});

// ソートの切り替え
function sortBy(column: string) {
  if (sortColumn.value === column) {
    // 同じカラムの場合は昇順/降順を切り替え
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    // 新しいカラムの場合
    sortColumn.value = column;
    if (column === "updated_at") {
      // 日付は降順がデフォルト
      sortDirection.value = "desc";
    } else {
      // その他は昇順がデフォルト
      sortDirection.value = "asc";
    }
  }
}
</script>
