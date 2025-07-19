<template>
  <div class="analog-timer">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- 時計盤（背景） -->
      <circle :cx="center" :cy="center" :r="radius" fill="#f8fafc" />
      <!-- 常にグレーの円弧（全周） -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="'#d1d5db'"
        :stroke-width="arcWidth"
        :opacity="0.5"
      />
      <!-- 1周目の色付き部分円弧（初週も含む） -->
      <path
        v-if="percentInLap > 0"
        :d="arcPathForLap(1, percentInLap)"
        :stroke="getLapColor(1, percentInLap)"
        :stroke-width="arcWidth"
        fill="none"
        stroke-linecap="round"
        :opacity="0.7"
      />
      <!-- 2周目以降は全周を色付きで重ねる -->
      <template v-if="lapCount > 0">
        <template v-for="lap in lapCount" :key="lap">
          <path
            :d="arcPathForLap(lap + 1, 1)"
            :stroke="getLapColor(lap + 1, 1)"
            :stroke-width="arcWidth"
            fill="none"
            stroke-linecap="round"
            :opacity="0.7"
          />
        </template>
      </template>
      <!-- 中央の経過時間テキスト -->
      <text
        :x="center"
        :y="center + textOffset"
        text-anchor="middle"
        :font-size="fontSize"
        font-weight="bold"
        fill="#222"
      >
        {{ formattedTime }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  seconds: number;
  size?: number;
}>();

const size = props.size || 160;
const center = size / 2;
const arcWidth = 5; // ミニマルな太さ
const radius = center - arcWidth - 8; // 円弧とテキストが重ならないように調整

// 経過時間を分単位で取得
const minutes = computed(() => Math.floor(props.seconds / 60));
const seconds = computed(() => props.seconds % 60);

// 周回数と現在の周の進捗
const lapCount = computed(() => Math.floor(props.seconds / 3600));
const percentInLap = computed(() => (props.seconds % 3600) / 3600);

// グラデーション色（グリーン→オレンジ→レッドを繰り返す）
function getLapColor(lap: number, percent: number) {
  if (percent < 0.5) {
    // 0-30分: グリーン→オレンジ
    return interpolateColor("#22c55e", "#fb923c", percent / 0.5);
  } else {
    // 30-60分: オレンジ→レッド
    return interpolateColor("#fb923c", "#ef4444", (percent - 0.5) / 0.5);
  }
}

function interpolateColor(color1: string, color2: string, ratio: number) {
  // #rrggbb → [r,g,b]
  const hexToRgb = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const rgbToHex = (rgb: number[]) =>
    "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const rgb = rgb1.map((v, i) => Math.round(v + (rgb2[i] || 0 - v) * ratio));
  return rgbToHex(rgb);
}

// 各周の円弧パス
function arcPathForLap(lap: number, percent: number) {
  if (percent <= 0) return "";
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + percent * 2 * Math.PI;
  const x1 = center + radius * Math.cos(startAngle);
  const y1 = center + radius * Math.sin(startAngle);
  const x2 = center + radius * Math.cos(endAngle);
  const y2 = center + radius * Math.sin(endAngle);
  const largeArc = percent > 0.5 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// 経過時間のフォーマット（hh:mm:ss）
const formattedTime = computed(() => {
  const h = Math.floor(props.seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((props.seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (props.seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
});

// テキストサイズと位置の調整（100分超で小さく）
const fontSize = computed(() => {
  return minutes.value >= 100 ? 22 : 32;
});
const textOffset = computed(() => {
  return minutes.value >= 100 ? 8 : 12;
});
</script>

<style scoped>
.analog-timer {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
