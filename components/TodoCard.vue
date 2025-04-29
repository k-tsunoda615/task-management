<template>
  <div
    class="bg-white rounded-lg shadow p-4 relative cursor-move"
    draggable="true"
    @dragstart="handleDragStart"
    :class="{ 'border-2 border-blue-500': todo.is_timing }"
  >
    <!-- プライベートインジケーター -->
    <div
      v-if="todo.is_private"
      class="absolute bottom-0 right-2 text-green-500"
      title="プライベート"
    >
      <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
    </div>
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <!-- 合計時間表示 -->
        <div
          v-if="todo.total_time !== undefined"
          class="mb-2 text-sm text-gray-600 flex items-center"
        >
          <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-1" />
          {{ formatTime(todo.total_time) }}
          <UButton
            v-if="!todo.is_timing"
            color="blue"
            variant="ghost"
            size="xs"
            icon="i-heroicons-play"
            class="ml-2"
            @click.stop="startTiming"
          />
          <UButton
            v-else
            color="red"
            variant="ghost"
            size="xs"
            icon="i-heroicons-pause"
            class="ml-2"
            @click.stop="stopTiming"
          />
        </div>
        <h3 class="font-bold border-b border-gray-200 pb-1 mb-3">
          {{ todo.title }}
        </h3>
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
          @click="$emit('edit', todo)"
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
    }>,
    required: true,
  },
});

const emit = defineEmits(["edit", "start-timing", "stop-timing"]);

const todoStore = useTodoStore();
const toast = useToast();

const editTodo = () => {
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

// タイミング開始
const startTiming = (event: Event) => {
  event.stopPropagation();
  emit("start-timing", props.todo);
};

// タイミング停止
const stopTiming = (event: Event) => {
  event.stopPropagation();
  emit("stop-timing", props.todo);
};
</script>
