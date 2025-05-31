<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { TASK_STATUS, TASK_STATUS_LABELS } from "../../utils/constants";
import type { Todo } from "../../types/todo";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

const props = defineProps<{
  tasks: Todo[];
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chart: any = null;

// ステータスの色を取得
const getStatusColor = (status: string) => {
  switch (status) {
    case TASK_STATUS.PRIORITY:
      return "#ef4444"; // red-500
    case TASK_STATUS.NEXT:
      return "#3b82f6"; // blue-500
    case TASK_STATUS.ARCHIVED:
      return "#22c55e"; // green-500
    default:
      return "#94a3b8"; // slate-400
  }
};

// ステータス別にタスクをカウント
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

// グラフの初期化
const initChart = async () => {
  if (!chartContainer.value) return;

  try {
    // Chart.jsの動的インポート
    const { Chart, DoughnutController, ArcElement, Tooltip, Legend } =
      await import("chart.js");

    // Chart.jsコンポーネントの登録
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const statusCounts = getStatusCounts();
    const ctx = document.createElement("canvas");
    chartContainer.value.appendChild(ctx);

    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCounts).map(
          (status) =>
            TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS]
        ),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: Object.keys(statusCounts).map(getStatusColor),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: {
                size: 12,
              },
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<"doughnut">) => {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
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
    console.error("Chart.jsの読み込みに失敗しました:", error);
  }
};

// タスクが更新されたらグラフを更新
watch(
  () => props.tasks,
  () => {
    if (chart) {
      const statusCounts = getStatusCounts();
      chart.data.datasets[0].data = Object.values(statusCounts);
      chart.update();
    }
  },
  { deep: true }
);

// コンポーネントのマウント時にグラフを初期化
onMounted(() => {
  initChart();
});

// コンポーネントのアンマウント時にグラフを破棄
onUnmounted(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});
</script>
