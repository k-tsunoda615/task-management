<template>
  <div
    class="flex flex-col lg:flex-row gap-12 items-center justify-around max-w-[750px] mx-auto"
  >
    <!-- 完了率グラフ -->
    <div
      v-show="showCompletedTasks"
      class="flex flex-col items-center justify-center"
    >
      <div
        ref="completionChartContainer"
        class="max-w-[220px] max-h-[220px]"
      />
      <div class="text-base font-medium text-gray-600 mt-4">完了率</div>
      <div class="text-3xl font-bold text-green-600">{{ completionRate }}%</div>
    </div>

    <!-- ステータス分布グラフ -->
    <div class="flex flex-col items-center justify-center">
      <div ref="statusChartContainer" class="max-w-[300px] max-h-[300px]"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  STATUS_COLORS,
} from "../../utils/constants";
import type { Todo } from "../../../types/todo";
import type { TooltipItem } from "chart.js";

const props = defineProps<{
  tasks: Todo[];
}>();

const statusChartContainer = ref<HTMLElement | null>(null);
const completionChartContainer = ref<HTMLElement | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let statusChart: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let completionChart: any = null;
const showCompletedTasks = ref(false);

/**
 * 完了タスク表示の切り替えを反映する。
 * @description カスタムイベントから表示状態を更新する。
 * @param {Event} event - 完了タスク表示切替イベント。
 * @returns {void} なし。
 */
const handleCompletedTasksVisibilityToggle = (event: Event) => {
  const detail = (event as CustomEvent<{ showCompletedTasks: boolean }>).detail;
  if (typeof detail?.showCompletedTasks === "boolean") {
    showCompletedTasks.value = detail.showCompletedTasks;
  }
};

// 完了タスク表示状態をlocalStorageから取得
onMounted(() => {
  const savedCompletedTasksState = localStorage.getItem("showCompletedTasks");
  if (savedCompletedTasksState !== null) {
    showCompletedTasks.value = savedCompletedTasksState === "true";
  }
});

/**
 * ステータスに対応する色を取得する。
 * @description STATUS_COLORS の icon クラスから色を推定する。
 * @param {string} status - ステータス値。
 * @returns {string} 表示色（HEX）。
 */
const getStatusColor = (status: string) => {
  const statusStyle = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (!statusStyle) return "#94a3b8"; // デフォルト色

  // iconプロパティからCSS変数の色を抽出（text-green-500 → green-500の色）
  const colorClass = statusStyle.icon.split("-");
  const colorName = colorClass[colorClass.length - 2];
  const colorShade = colorClass[colorClass.length - 1];

  switch (colorName) {
    case "green":
      return colorShade === "500" ? "#22c55e" : "#86efac";
    case "blue":
      return colorShade === "500" ? "#3b82f6" : "#93c5fd";
    case "gray":
      return colorShade === "500" ? "#64748b" : "#94a3b8";
    default:
      return "#94a3b8"; // デフォルト色
  }
};

/**
 * 完了/未完了のタスク数を集計する。
 * @description 完了フラグで件数を分けて返す。
 * @returns {{ finished: number; unfinished: number }} 集計結果。
 */
const getCompletionCounts = () => {
  const finished = props.tasks.filter((task) => task.is_finished).length;
  const unfinished = props.tasks.length - finished;
  return { finished, unfinished };
};

// 完了率を計算
const completionRate = computed(() => {
  if (props.tasks.length === 0) return 0;
  const { finished } = getCompletionCounts();
  return Math.round((finished / props.tasks.length) * 100);
});

/**
 * ステータス別のタスク数を集計する。
 * @description priority/next/archived の件数を返す。
 * @returns {Record<string, number>} ステータス別件数。
 */
const getStatusCounts = () => {
  const counts = {
    [TASK_STATUS.PRIORITY]: 0,
    [TASK_STATUS.NEXT]: 0,
    [TASK_STATUS.ARCHIVED]: 0,
  };

  props.tasks.forEach((task) => {
    if (counts[task.status as keyof typeof counts] !== undefined) {
      counts[task.status as keyof typeof counts]++;
    }
  });

  return counts;
};

/**
 * グラフ共通のオプションを生成する。
 * @description doughnut チャートの共通設定を返す。
 * @returns {object} Chart.js オプション。
 */
const getCommonChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%", // ドーナツの厚みを調整
    plugins: {
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        boxPadding: 6,
      },
    },
  };
};

/**
 * ステータス分布グラフを初期化する。
 * @description Chart.js を遅延ロードしてグラフを描画する。
 * @returns {Promise<void>} 初期化の完了。
 */
const initStatusChart = async () => {
  if (!statusChartContainer.value) return;

  try {
    // Chart.jsの動的インポート
    const { Chart, DoughnutController, ArcElement, Tooltip, Legend } =
      await import("chart.js");

    // Chart.jsコンポーネントの登録
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const statusCounts = getStatusCounts();
    const ctx = document.createElement("canvas");
    statusChartContainer.value.appendChild(ctx);

    const commonOptions = getCommonChartOptions();

    statusChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCounts).map(
          (status) =>
            TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS],
        ),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: Object.keys(statusCounts).map(getStatusColor),
            borderWidth: 1,
            borderColor: "#ffffff",
            hoverBorderWidth: 2,
            hoverBorderColor: "#ffffff",
            borderRadius: 3, // 角を少し丸くする
          },
        ],
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          legend: {
            position: "bottom",
            labels: {
              font: {
                size: 12,
                family: "'Noto Sans JP', sans-serif",
              },
              usePointStyle: true, // 丸いマーカーに
              padding: 15,
              boxWidth: 8,
            },
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context: TooltipItem<"doughnut">) => {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                const percentage =
                  total > 0 ? Math.round(((value as number) / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("ステータスチャートの読み込みに失敗しました:", error);
  }
};

/**
 * 完了率グラフを初期化する。
 * @description Chart.js を遅延ロードしてグラフを描画する。
 * @returns {Promise<void>} 初期化の完了。
 */
const initCompletionChart = async () => {
  if (!completionChartContainer.value) return;

  try {
    // Chart.jsの動的インポート
    const { Chart, DoughnutController, ArcElement, Tooltip, Legend } =
      await import("chart.js");

    // Chart.jsコンポーネントの登録
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const { finished, unfinished } = getCompletionCounts();
    const ctx = document.createElement("canvas");
    completionChartContainer.value.appendChild(ctx);

    const commonOptions = getCommonChartOptions();

    completionChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["完了", "未完了"],
        datasets: [
          {
            data: [finished, unfinished],
            backgroundColor: ["#22c55e", "#f1f5f9"], // 完了:緑、未完了:薄いグレー
            borderWidth: 0,
            hoverBorderWidth: 2,
            hoverBorderColor: "#ffffff",
            borderRadius: 3, // 角を少し丸くする
          },
        ],
      },
      options: {
        ...commonOptions,
        cutout: "75%", // 完了率はドーナツの穴を少し大きく
        plugins: {
          ...commonOptions.plugins,
          legend: {
            display: false, // 凡例を非表示
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context: TooltipItem<"doughnut">) => {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                const percentage =
                  total > 0 ? Math.round(((value as number) / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("完了率チャートの読み込みに失敗しました:", error);
  }
};

// タスクが更新されたらグラフを更新
watch(
  () => props.tasks,
  () => {
    // ステータスチャートの更新
    if (statusChart) {
      const statusCounts = getStatusCounts();
      statusChart.data.datasets[0].data = Object.values(statusCounts);
      statusChart.update();
    }

    // 完了率チャートの更新
    if (completionChart) {
      const { finished, unfinished } = getCompletionCounts();
      completionChart.data.datasets[0].data = [finished, unfinished];
      completionChart.update();
    }
  },
  { deep: true },
);

// コンポーネントのマウント時にグラフを初期化
onMounted(() => {
  initStatusChart();
  initCompletionChart();

  // 完了タスク表示切り替えイベントを監視
  window.addEventListener(
    "completedTasksVisibilityToggle",
    handleCompletedTasksVisibilityToggle,
  );
});

// コンポーネントのアンマウント時にグラフを破棄
onUnmounted(() => {
  if (statusChart) {
    statusChart.destroy();
    statusChart = null;
  }
  if (completionChart) {
    completionChart.destroy();
    completionChart = null;
  }

  // イベントリスナーを削除
  window.removeEventListener(
    "completedTasksVisibilityToggle",
    handleCompletedTasksVisibilityToggle,
  );
});
</script>
