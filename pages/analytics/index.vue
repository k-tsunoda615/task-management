<template>
  <CommonNavigation :title="'アナリティクスビュー'" />
  <div>
    <UCard class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">タスク分析ダッシュボード</h2>
          <div class="flex gap-2">
            <!-- 期間フィルター -->
            <select
              v-model="selectedPeriod"
              class="w-40 rounded border border-gray-300 appearance-none px-3 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="today">今日</option>
              <option value="7days">過去7日間</option>
              <option value="30days">過去30日間</option>
              <option value="all">すべて</option>
            </select>
          </div>
        </div>
      </template>
      <div class="analytics-summary grid grid-cols-1 md:grid-cols-3 gap-4">
        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600">
              {{ totalTasks }}
            </div>
            <div class="text-sm text-gray-500">実施タスク数</div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <div
              v-if="showCompletedTasks"
              class="text-2xl font-bold text-green-600"
            >
              {{ completedTasks }}
            </div>
            <div v-else class="text-2xl font-bold text-gray-400">--</div>
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
      <AnalyticsStatusDistribution :tasks="filteredTasks" />
    </UCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- タスク時間分析 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">タスク時間分析</h3>
        </template>
        <div class="h-64">
          <AnalyticsTimeDistribution :tasks="filteredTasks" />
        </div>
      </UCard>

      <!-- タグ別タスク分布 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">タグ別タスク分布</h3>
        </template>
        <div class="h-64">
          <AnalyticsTagDistribution :tasks="filteredTasks" :tags="tags" />
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
                <div
                  class="text-sm font-medium text-gray-900 flex items-center"
                >
                  <NuxtLink
                    :to="`/note/${task.id}`"
                    class="group hover:text-primary-600 hover:underline transition-colors flex items-center"
                  >
                    <UIcon
                      name="i-heroicons-document-text"
                      class="mr-2 w-4 h-4 text-gray-400 group-hover:text-primary-600"
                    />
                    {{ task.title }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs rounded-full flex items-center w-fit"
                  :class="getStatusClasses(task.status)"
                >
                  <UIcon
                    :name="getStatusIconName(task.status)"
                    class="mr-1 w-4 h-4"
                    :class="getStatusIconClass(task.status)"
                  />
                  {{ getStatusLabel(task.status) }}
                </span>
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
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  STATUS_COLORS,
} from "../../utils/constants";
import { formatTime } from "../../utils/time";
import type { Todo } from "../../types/todo";
import AnalyticsStatusDistribution from "../../components/analytics/StatusDistribution.vue";
import AnalyticsTagDistribution from "../../components/analytics/TagDistribution.vue";
import AnalyticsTimeDistribution from "../../components/analytics/TimeDistribution.vue";

definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

// ストアのインスタンス化
const todoStore = useTodoStore();
const tagStore = useTagStore();

// 期間選択のオプション
const selectedPeriod = ref("7days");
const showCompletedTasks = ref(false); // 完了タスク表示/非表示

// タスクとタグのデータ取得
const tasks = ref<Todo[]>([]);
const tags = computed(() => tagStore.tags);

// 選択された期間とフィルターでタスクをフィルタリング
const filteredTasks = computed(() => {
  // まずは期間でフィルタリング
  const period = selectedPeriod.value;
  let periodFilteredTasks;

  // 「すべて」の場合は全件表示
  if (period === "all") {
    periodFilteredTasks = tasks.value;
  } else {
    // 期間に応じた日時の設定
    const targetDate = new Date();
    let daysToSubtract = 0;

    switch (period) {
      case "today":
        // 今日の0時
        targetDate.setHours(0, 0, 0, 0);
        break;
      case "7days":
        // 7日前
        daysToSubtract = 7;
        break;
      case "30days":
        // 30日前
        daysToSubtract = 30;
        break;
      default:
        periodFilteredTasks = tasks.value; // 想定外の値は全件
    }

    // 日数を引く場合
    if (daysToSubtract > 0) {
      targetDate.setDate(targetDate.getDate() - daysToSubtract);
      targetDate.setHours(0, 0, 0, 0);
    }

    // 期間でフィルタリング
    periodFilteredTasks = tasks.value.filter(
      (task) => task.updated_at && new Date(task.updated_at) >= targetDate
    );
  }

  // プライベート/パブリックフィルターを適用（サイドバーの状態を利用）
  let privateFilteredTasks = periodFilteredTasks;
  if (todoStore.taskFilter === "private") {
    privateFilteredTasks = periodFilteredTasks.filter(
      (task) => task.is_private === true
    );
  } else if (todoStore.taskFilter === "public") {
    privateFilteredTasks = periodFilteredTasks.filter(
      (task) => task.is_private === false
    );
  }

  // 次に完了フラグでフィルタリング
  if (!showCompletedTasks.value) {
    return privateFilteredTasks.filter((task) => !task.is_finished);
  }

  return privateFilteredTasks;
});

// 集計データ
const totalTasks = computed(() => filteredTasks.value.length);
const completedTasks = computed(
  () => filteredTasks.value.filter((task) => task.is_finished).length
);
const totalTimeSpent = computed(() =>
  filteredTasks.value.reduce((sum, task) => {
    const time = Array.isArray(task.total_time)
      ? task.total_time[0] || 0
      : task.total_time || 0;
    return sum + time;
  }, 0)
);

// 最近のタスク
const recentTasks = computed(() => {
  return [...filteredTasks.value]
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

  // 完了タスク表示状態を復元
  const savedCompletedTasksState = localStorage.getItem("showCompletedTasks");
  if (savedCompletedTasksState !== null) {
    showCompletedTasks.value = savedCompletedTasksState === "true";
  }

  // 完了タスク表示切り替えイベントを監視
  window.addEventListener("completedTasksVisibilityToggle", (event: any) => {
    showCompletedTasks.value = event.detail.showCompletedTasks;
  });

  // プライベート/パブリックフィルター変更を監視
  watch(
    () => todoStore.taskFilter,
    () => {
      // ストアのフィルターが変更されたら、データを再フィルタリング
      console.log(
        "Todoストアのフィルターが変更されました:",
        todoStore.taskFilter
      );
    }
  );

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

// ステータスクラスを取得（他のページと同じ表示に）
const getStatusClasses = (status: string) => {
  const statusStyle = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (statusStyle) {
    return `${statusStyle.bg} ${statusStyle.border}`;
  }
  return "bg-white/80 border border-gray-300";
};

// ステータスアイコン名を取得
const getStatusIconName = (status: string) => {
  const statusStyle = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (statusStyle) {
    return statusStyle.iconName;
  }
  return "i-heroicons-question-mark-circle";
};

// ステータスアイコンクラスを取得
const getStatusIconClass = (status: string) => {
  const statusStyle = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (statusStyle) {
    return statusStyle.icon;
  }
  return "text-gray-500";
};
</script>
