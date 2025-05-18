<template>
  <div class="todo-table-container">
    <!-- フィルターとソートオプション -->
    <div class="mb-4 flex flex-wrap gap-2 justify-between items-center">
      <div class="flex flex-wrap gap-2">
        <!-- ステータスフィルター -->
        <!-- <USelectMenu v-model="statusFilter" class="md:w-40 w-full">
          <template #trigger>
            <UButton
              color="gray"
              variant="soft"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              class="w-full"
            >
              <span v-if="statusFilter === ''">全てのステータス</span>
              <span v-else>{{ getStatusLabel(statusFilter) }}</span>
            </UButton>
          </template>
          <USelectOption value="">全てのステータス</USelectOption>
          <USelectOption
            v-for="status in Object.keys(TASK_STATUS)"
            :key="status"
            :value="TASK_STATUS[status]"
          >
            {{ getStatusLabel(TASK_STATUS[status]) }}
          </USelectOption>
        </USelectMenu> -->

        <!-- プライベートフィルター -->
        <!-- <USelectMenu v-model="privateFilter" class="md:w-40 w-full">
          <template #trigger>
            <UButton
              color="gray"
              variant="soft"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              class="w-full"
            >
              <span v-if="privateFilter === null">公開設定</span>
              <span v-else-if="privateFilter === true">プライベート</span>
              <span v-else>パブリック</span>
            </UButton>
          </template>
          <USelectOption :value="null">全て</USelectOption>
          <USelectOption :value="true">プライベート</USelectOption>
          <USelectOption :value="false">パブリック</USelectOption>
        </USelectMenu> -->
      </div>

      <div class="w-full md:w-auto mt-2 md:mt-0">
        <UInput
          v-model="searchQuery"
          placeholder="タスクを検索..."
          trailing-icon="i-heroicons-magnifying-glass-20-solid"
          class="w-full md:w-64"
        />
      </div>
    </div>

    <!-- メインテーブル -->
    <div class="border rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('title')"
              >
                <div class="flex items-center">
                  タイトル
                  <UIcon
                    :name="getSortIcon('title')"
                    class="inline ml-1 w-4 h-4"
                    :class="
                      sortColumn === 'title'
                        ? 'text-primary-500'
                        : 'text-gray-300'
                    "
                  />
                </div>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('status')"
              >
                <div class="flex items-center">
                  ステータス
                  <UIcon
                    :name="getSortIcon('status')"
                    class="inline ml-1 w-4 h-4"
                    :class="
                      sortColumn === 'status'
                        ? 'text-primary-500'
                        : 'text-gray-300'
                    "
                  />
                </div>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('is_private')"
              >
                <div class="flex items-center">
                  公開設定
                  <UIcon
                    :name="getSortIcon('is_private')"
                    class="inline ml-1 w-4 h-4"
                    :class="
                      sortColumn === 'is_private'
                        ? 'text-primary-500'
                        : 'text-gray-300'
                    "
                  />
                </div>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('total_time')"
              >
                <div class="flex items-center">
                  合計時間
                  <UIcon
                    :name="getSortIcon('total_time')"
                    class="inline ml-1 w-4 h-4"
                    :class="
                      sortColumn === 'total_time'
                        ? 'text-primary-500'
                        : 'text-gray-300'
                    "
                  />
                </div>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('updated_at')"
              >
                <div class="flex items-center">
                  更新日時
                  <UIcon
                    :name="getSortIcon('updated_at')"
                    class="inline ml-1 w-4 h-4"
                    :class="
                      sortColumn === 'updated_at'
                        ? 'text-primary-500'
                        : 'text-gray-300'
                    "
                  />
                </div>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                タグ
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                アクション
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="todo in filteredAndSortedTodos"
              :key="todo.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                {{ todo.title }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs rounded-full flex items-center w-fit"
                  :class="
                    getStatusColor(todo.status).bg +
                    ' ' +
                    getStatusColor(todo.status).border
                  "
                >
                  <UIcon
                    :name="getStatusColor(todo.status).iconName"
                    :class="getStatusColor(todo.status).icon + ' mr-1 w-4 h-4'"
                  />
                  {{ getStatusLabel(todo.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span
                  v-if="todo.is_private"
                  class="text-pink-600 flex items-center"
                >
                  <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 mr-1" />
                  プライベート
                </span>
                <span v-else class="text-blue-600 flex items-center">
                  <UIcon name="i-heroicons-eye" class="w-4 h-4 mr-1" />
                  パブリック
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                {{ formatTime(todo.total_time) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ formatDate(todo.updated_at) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in todo.tags"
                    :key="tag.id"
                    class="px-2 py-0.5 text-xs rounded-full text-white"
                    :style="{ backgroundColor: tag.color }"
                  >
                    {{ tag.name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex items-center space-x-2">
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-pencil-square"
                    size="xs"
                    title="編集"
                  />
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-eye"
                    size="xs"
                    title="詳細"
                  />
                </div>
              </td>
            </tr>
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
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../../stores/todo";
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  STATUS_COLORS,
} from "../../utils/constants";
import type { Todo } from "../../types/todo";

// Pinia ストアからTodo一覧を取得
const todoStore = useTodoStore();

// フィルターとソートの状態
const searchQuery = ref("");
const statusFilter = ref("");
const privateFilter = ref<boolean | null>(null);
const sortColumn = ref("updated_at");
const sortDirection = ref<"asc" | "desc">("desc");

// コンポーネントマウント時にTodoデータを取得
onMounted(async () => {
  if (!todoStore.isLoaded) {
    await todoStore.fetchTodos();
  }
});

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

// ソートの切り替え
function sortBy(column: string) {
  if (sortColumn.value === column) {
    // 同じカラムの場合は昇順/降順を切り替え
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    // 新しいカラムの場合はそのカラムで降順にする
    sortColumn.value = column;
    sortDirection.value = "desc";
  }
}

// ステータスのラベルを取得
function getStatusLabel(status: string) {
  return (
    TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] || status
  );
}

// ステータスの色を取得
function getStatusColor(status: string) {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS[TASK_STATUS.PRIORITY]
  );
}

// 時間をフォーマット (秒 -> HH:MM:SS)
function formatTime(totalSeconds: number | undefined): string {
  if (totalSeconds === undefined) return "00:00:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

// 日付をフォーマット
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 24時間以内の場合は相対時間で表示
  if (diff < 24 * 60 * 60 * 1000) {
    if (diff < 60 * 60 * 1000) {
      // 1時間以内
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}分前`;
    } else {
      // 24時間以内
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}時間前`;
    }
  } else {
    // それ以外は日付で表示
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  }
}

// ソートアイコンの取得
function getSortIcon(column: string): string {
  if (sortColumn.value !== column) {
    return "i-heroicons-arrows-up-down";
  }
  return sortDirection.value === "asc"
    ? "i-heroicons-arrow-up"
    : "i-heroicons-arrow-down";
}
</script>

<style scoped>
.todo-table-container {
  width: 100%;
  position: relative;
}
</style>
