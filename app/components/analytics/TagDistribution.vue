<template>
  <div ref="chartContainer" class="w-full h-full"/>
</template>

<script setup lang="ts">
import type { Todo, Tag } from "../../../types/todo";
import type { TooltipItem } from "chart.js";

const props = defineProps<{
  tasks: Todo[];
  tags: Tag[];
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chart: any = null;

// タグ別にタスクをカウント
const getTagCounts = () => {
  const counts: Record<string, { count: number; color: string }> = {};

  // タグをカウント
  props.tasks.forEach((task) => {
    if (task.tags && task.tags.length > 0) {
      task.tags.forEach((tag) => {
        if (!counts[tag.id]) {
          counts[tag.id] = {
            count: 0,
            color: tag.color || "#3b82f6", // デフォルト色
          };
        }
        counts[tag.id]!.count++;
      });
    }
  });

  // 上位10タグのみに絞る
  const sortedTags = Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  return sortedTags.reduce(
    (result, [id, data]) => {
      const tag = props.tags.find((t) => t.id === id);
      if (tag) {
        result[tag.name] = data;
      }
      return result;
    },
    {} as Record<string, { count: number; color: string }>,
  );
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
      Legend,
    );

    const tagCounts = getTagCounts();
    const ctx = document.createElement("canvas");
    chartContainer.value.appendChild(ctx);

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(tagCounts),
        datasets: [
          {
            data: Object.values(tagCounts).map((data) => data.count),
            backgroundColor: Object.values(tagCounts).map((data) => data.color),
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
                return `タスク数: ${value}`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0, // 整数のみ表示
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Chart.jsの読み込みに失敗しました:", error);
  }
};

// タスクやタグが更新されたらグラフを更新
watch(
  [() => props.tasks, () => props.tags],
  () => {
    if (chart) {
      const tagCounts = getTagCounts();
      chart.data.labels = Object.keys(tagCounts);
      chart.data.datasets[0].data = Object.values(tagCounts).map(
        (data) => data.count,
      );
      chart.data.datasets[0].backgroundColor = Object.values(tagCounts).map(
        (data) => data.color,
      );
      chart.update();
    }
  },
  { deep: true },
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
