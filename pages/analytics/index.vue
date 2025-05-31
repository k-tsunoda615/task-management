<template>
  <div class="analytics-container">
    <UCard class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">タスク分析ダッシュボード</h2>
          <div class="flex gap-2">
            <USelectMenu
              v-model="selectedPeriod"
              :options="periodOptions"
              placeholder="期間を選択"
              class="w-40"
            />
          </div>
        </div>
      </template>
      <div class="analytics-summary grid grid-cols-1 md:grid-cols-3 gap-4">
        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600">
              {{ totalTasks }}
            </div>
            <div class="text-sm text-gray-500">合計タスク数</div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ completedTasks }}
            </div>
            <div class="text-sm text-gray-500">完了タスク数</div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">
              {{ formatTime(totalTimeSpent) }}
            </div>
            <div class="text-sm text-gray-500">合計作業時間</div>
          </div>
        </UCard>
      </div>
    </UCard>

    <!-- タスクステータス分布 -->
    <UCard class="mb-6">
      <template #header>
        <h3 class="text-lg font-bold">ステータス別タスク分布</h3>
      </template>
      <div class="h-64">
        <AnalyticsStatusDistribution :tasks="tasks" />
      </div>
    </UCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- タスク時間分析 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">タスク時間分析</h3>
        </template>
        <div class="h-64">
          <AnalyticsTimeDistribution :tasks="tasks" />
        </div>
      </UCard>

      <!-- タグ別タスク分布 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">タグ別タスク分布</h3>
        </template>
        <div class="h-64">
          <AnalyticsTagDistribution :tasks="tasks" :tags="tags" />
        </div>
      </UCard>
    </div>

    <!-- 最近のアクティビティ -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-bold">最近のアクティビティ</h3>
      </template>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                タスク
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ステータス
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                作業時間
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                最終更新
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="task in recentTasks" :key="task.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ task.title }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getStatusColor(task.status)"
                  :variant="getStatusVariant(task.status)"
                  class="text-xs font-medium"
                >
                  {{ getStatusLabel(task.status) }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatTime(task.total_time || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(task.updated_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../../stores/todo";
import { useTagStore } from "../../stores/tag";
import { TASK_STATUS, TASK_STATUS_LABELS } from "../../utils/constants";
import { formatTime } from "../../utils/time";
import type { Todo } from "../../types/todo";
import AnalyticsStatusDistribution from "../../components/analytics/StatusDistribution.vue";
import AnalyticsTagDistribution from "../../components/analytics/TagDistribution.vue";
import AnalyticsTimeDistribution from "../../components/analytics/TimeDistribution.vue";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

// ストアのインスタンス化
const todoStore = useTodoStore();
const tagStore = useTagStore();

// 期間選択のオプション
const periodOptions = [
  { label: "過去7日間", value: "7days" },
  { label: "過去30日間", value: "30days" },
  { label: "すべて", value: "all" },
];
const selectedPeriod = ref("7days");

// タスクとタグのデータ取得
const tasks = ref<Todo[]>([]);
const tags = computed(() => tagStore.tags);

// 集計データ
const totalTasks = computed(() => tasks.value.length);
const completedTasks = computed(
  () =>
    tasks.value.filter((task) => task.status === TASK_STATUS.ARCHIVED).length
);
const totalTimeSpent = computed(() =>
  tasks.value.reduce((sum, task) => {
    const time = Array.isArray(task.total_time)
      ? task.total_time[0] || 0
      : task.total_time || 0;
    return sum + time;
  }, 0)
);

// 最近のタスク
const recentTasks = computed(() => {
  return [...tasks.value]
    .sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);
});

// データロード
onMounted(async () => {
  await Promise.all([todoStore.fetchTodos(), tagStore.fetchTags()]);

  tasks.value = todoStore.todos;
});

// 日付フォーマット
const formatDate = (dateString?: string) => {
  if (!dateString) return "不明";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ステータス関連のユーティリティ
const getStatusLabel = (status: string) => {
  return (
    TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] || status
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case TASK_STATUS.PRIORITY:
      return "red";
    case TASK_STATUS.NEXT:
      return "blue";
    case TASK_STATUS.ARCHIVED:
      return "green";
    default:
      return "gray";
  }
};

const getStatusVariant = (status: string) => {
  return status === TASK_STATUS.PRIORITY ? "solid" : "soft";
};
</script>

<style scoped>
.analytics-container {
  padding: 1.5rem;
}
</style>
