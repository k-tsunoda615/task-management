<template>
  <div
    class="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 relative"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <div class="flex items-start">
      <div class="flex-1 min-w-0">
        <!-- タイトル -->
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-medium text-gray-900 truncate">{{ todo.title }}</h3>
          <UIcon
            v-if="todo.is_private"
            name="i-heroicons-lock-closed"
            class="text-gray-400 w-4 h-4"
          />
        </div>

        <!-- タグ -->
        <div
          v-if="todo.tags && todo.tags.length > 0"
          class="flex flex-wrap gap-1.5 mb-2"
        >
          <UBadge
            v-for="tag in todo.tags"
            :key="tag.id"
            :style="{
              backgroundColor: `${tag.color}15`,
              color: tag.color || '#3b82f6',
              border: 'none',
              fontWeight: '500',
              fontSize: '0.75rem',
              borderRadius: '0.375rem',
              padding: '0.25rem 0.5rem',
              lineHeight: '1',
            }"
            class="transition-all duration-200 hover:bg-opacity-25"
          >
            {{ tag.name }}
          </UBadge>
        </div>

        <!-- メモ -->
        <div
          v-if="todo.memo"
          class="mt-2 text-sm prose prose-sm prose-gray max-h-[20em] w-full overflow-y-auto pr-2 break-all"
          v-html="parsedMemo"
        />
      </div>

      <!-- アクションボタン -->
      <div class="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          size="xs"
          class="hover:bg-gray-100"
          @click="editTodo"
        />
      </div>
    </div>

    <!-- タイマー表示 -->
    <div
      v-if="showTimerBar"
      class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"
    >
      <div class="flex items-center text-sm text-gray-500">
        <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-1.5" />
        {{ formatTime(todo.total_time || 0) }}
      </div>
      <div class="flex items-center gap-1">
        <UButton
          v-if="!todo.is_timing"
          color="gray"
          variant="ghost"
          icon="i-heroicons-play"
          size="xs"
          :loading="timerLoading"
          class="hover:bg-gray-100"
          @click="startTiming"
        />
        <UButton
          v-else
          color="red"
          variant="ghost"
          icon="i-heroicons-pause"
          size="xs"
          :loading="timerLoading"
          class="hover:bg-red-100"
          @click="stopTiming"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../../stores/todo";
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
.prose :deep(p) {
  margin: 0.5em 0;
  color: #4b5563;
  line-height: 1.5;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.prose :deep(li) {
  margin: 0.25em 0;
}

.prose :deep(a) {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px solid #93c5fd;
}

.prose :deep(a:hover) {
  border-bottom-color: #2563eb;
}

.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.875em;
}

.prose :deep(pre) {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
}
</style>
