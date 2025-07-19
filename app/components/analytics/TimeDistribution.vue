<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import type { Todo } from "../../types/todo";
import { formatTime } from "../../utils/time";
import type { TooltipItem } from "chart.js";

const props = defineProps<{
  tasks: Todo[];
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chart: any = null;

// タスクの時間を抽出
const getTaskTimeData = () => {
  // 時間データを持つタスクのみ抽出
  const tasksWithTime = props.tasks
    .filter((task) => {
      const time = Array.isArray(task.total_time)
        ? task.total_time[0] || 0
        : task.total_time || 0;
      return time > 0;
    })
    .sort((a, b) => {
      const timeA = Array.isArray(a.total_time)
        ? a.total_time[0] || 0
        : a.total_time || 0;
      const timeB = Array.isArray(b.total_time)
        ? b.total_time[0] || 0
        : b.total_time || 0;
      return timeB - timeA; // 降順ソート
    })
    .slice(0, 10); // 上位10件に絞る

  return {
    titles: tasksWithTime.map((task) => {
      // タイトルが長い場合は省略
      return task.title.length > 20
        ? task.title.substring(0, 20) + "..."
        : task.title;
    }),
    times: tasksWithTime.map((task) => {
      return Array.isArray(task.total_time)
        ? task.total_time[0] || 0
        : task.total_time || 0;
    }),
  };
};

// グラフの初期化
const initChart = async () => {
  if (!chartContainer.value) return;

  try {
    // Chart.jsの動的インポート
    const {
      Chart,
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
    } = await import("chart.js");

    // Chart.jsコンポーネントの登録
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend
    );

    const { titles, times } = getTaskTimeData();
    const ctx = document.createElement("canvas");
    chartContainer.value.appendChild(ctx);

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: titles,
        datasets: [
          {
            label: "作業時間",
            data: times,
            backgroundColor: "#60a5fa", // blue-400
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y", // 横棒グラフ
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<"bar">) => {
                const value = context.raw || 0;
                return `作業時間: ${formatTime(value as number)}`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function (tickValue: number | string) {
                // 目盛りに時間表示を使用
                return formatTime(Number(tickValue));
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
      const { titles, times } = getTaskTimeData();
      chart.data.labels = titles;
      chart.data.datasets[0].data = times;
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
