<template>
  <div
    class="bg-white rounded-lg shadow p-4 relative"
    :class="{ 'border-2 border-blue-500': todo.is_timing }"
  >
    <!-- ドラッグハンドル - ドラッグ操作をここに限定 -->
    <div
      class="absolute top-0 left-0 w-full h-8 cursor-move opacity-0"
      draggable="true"
      @dragstart="handleDragStart"
    ></div>

    <!-- プライベートインジケーター -->
    <div
      v-if="todo.is_private"
      class="absolute bottom-1 right-6 text-green-500"
      title="プライベート"
    >
      <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
    </div>

    <div class="flex justify-between items-start">
      <div class="flex-1">
        <!-- 合計時間表示 -->
        <div
          v-if="showTimerBar === true"
          class="mb-2 text-sm text-gray-600 flex items-center"
        >
          <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-1" />
          {{ formatTime(todo.total_time || 0) }}
          <UButton
            v-if="!todo.is_timing"
            color="blue"
            variant="ghost"
            size="xs"
            icon="i-heroicons-play"
            class="ml-2 z-10"
            :loading="timerLoading"
            @click="startTiming"
          />
          <UButton
            v-else
            color="red"
            variant="ghost"
            size="xs"
            icon="i-heroicons-pause"
            class="ml-2 z-10"
            :loading="timerLoading"
            @click="stopTiming"
          />
        </div>
        <h3 class="font-bold border-b border-gray-200 pb-1 mb-1">
          {{ todo.title }}
        </h3>
        <!-- タグ表示 -->
        <div
          v-if="todo.tags && todo.tags.length > 0"
          class="mb-2 flex flex-wrap gap-1"
        >
          <UBadge
            v-for="tag in todo.tags"
            :key="tag.id"
            :style="{
              backgroundColor: 'transparent',
              color: tag.color || '#3b82f6',
              border: `1px solid ${darkenColor(tag.color || '#3b82f6', 0.2)}`,
              fontWeight: 'normal',
              fontSize: '0.75em',
              borderRadius: '9999px',
              padding: '0.15em 0.7em',
              transition: 'box-shadow 0.2s, opacity 0.2s',
              cursor: 'pointer',
              textDecoration: 'none',
            }"
            class="tag-modern tag-modal"
            size="xs"
            >{{ tag.name }}</UBadge
          >
        </div>
        <div
          v-if="todo.memo"
          class="mt-1 text-sm prose prose-sm prose-gray max-h-[20em] w-full overflow-y-auto pr-2 break-all"
          v-html="parsedMemo"
        />
      </div>
      <div class="flex items-center ml-4">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          size="xs"
          class="z-10"
          @click="editTodo"
        />
      </div>
    </div>
    <!-- sort_order表示 -->
    <!-- <div class="mt-2 text-xs text-gray-400">
      順序: {{ todo.sort_order !== undefined ? todo.sort_order : "なし" }}
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../stores/todo";
import { marked } from "marked";
import type { PropType } from "vue";

const props = defineProps({
  todo: {
    type: Object as PropType<{
      id: string;
      title: string;
      status: string;
      memo?: string;
      task_id?: string;
      is_private?: boolean;
      total_time?: number | number[];
      is_timing?: boolean;
      tags?: { id: string; name: string; color?: string }[];
    }>,
    required: true,
  },
  showTimerBar: {
    type: Boolean,
    default: true,
  },
  timerLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["edit", "start-timing", "stop-timing"]);

const todoStore = useTodoStore();
const toast = useToast();

const editTodo = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("edit", props.todo);
};

// ドラッグ開始時にTodoのIDをデータ転送オブジェクトに設定
const handleDragStart = (event: any) => {
  event.dataTransfer.setData("todoId", props.todo.id);
  event.dataTransfer.effectAllowed = "move";
};

// メモをマークダウンとしてパース
const parsedMemo = computed(() => {
  if (!props.todo.memo) return "";
  return marked(props.todo.memo);
});

// 時間のフォーマット関数（秒数を hh:mm:ss 形式に変換）
const formatTime = (seconds: number | number[]) => {
  // 配列の場合は最初の要素を使用
  let totalSeconds = 0;
  if (Array.isArray(seconds) && seconds.length > 0) {
    totalSeconds = seconds[0];
  } else if (typeof seconds === "number") {
    totalSeconds = seconds;
  }

  if (totalSeconds === undefined) return "00:00:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
};

// タイミング開始 - イベント伝播を明示的に停止
const startTiming = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("start-timing", props.todo);
};

// タイミング停止 - イベント伝播を明示的に停止
const stopTiming = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("stop-timing", props.todo);
};

// 色を暗くするユーティリティ関数
function darkenColor(hex: string, amount = 0.2) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
</script>

<style scoped>
/* ボタンのクリック領域を拡大 */
.u-button {
  position: relative;
}

.u-button::after {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  z-index: 1;
}

.tag-modern.tag-modal:hover {
  opacity: 1 !important;
}
</style>
