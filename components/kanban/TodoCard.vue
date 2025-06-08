<template>
  <div
    class="group bg-white rounded-[6px] p-4 hover:shadow-md transition-all duration-200 relative"
    :class="[
      todo.is_timing
        ? 'bg-blue-100 border border-blue-500'
        : 'border border-gray-200',
    ]"
    draggable="true"
    :data-status="todo.status"
    :data-todo-id="todo.id"
    @dragstart="handleDragStart"
  >
    <div class="flex items-start">
      <div class="flex-1 min-w-0">
        <!-- タイトル -->
        <div class="flex items-center mb-2">
          <UIcon
            v-if="todo.is_private"
            name="i-heroicons-lock-closed"
            class="text-gray-400 w-4 h-4 flex-shrink-0 mr-1.5"
          />
          <NuxtLink
            :to="`/note/${todo.id}`"
            class="font-medium text-gray-900 truncate hover:text-primary-600 hover:underline transition-colors"
          >
            {{ todo.title }}
          </NuxtLink>
        </div>

        <!-- タグ -->
        <div
          v-if="showTagBar && todo.tags && todo.tags.length > 0"
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
      <div
        class="ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
      >
        <NuxtLink
          :to="`/note/${todo.id}`"
          class="text-gray-500 hover:text-primary-600 transition-colors"
        >
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-document-text"
            size="xs"
            class="hover:bg-gray-100"
          />
        </NuxtLink>
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
        {{ todo.is_timing ? "計測中..." : formatTime(todo.total_time || 0) }}
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
import type { TaskStatus } from "../../utils/constants";
import { formatTime } from "../../utils/time";

const props = defineProps({
  todo: {
    type: Object as PropType<{
      id: string;
      title: string;
      status: TaskStatus;
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
  showTagBar: {
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

  // markedのレンダラーをカスタマイズ
  const renderer = new marked.Renderer();
  // リンクをカスタマイズ：すべてのリンクをtarget="_blank"で開く
  renderer.link = ({
    href,
    title,
    text,
  }: {
    href: string;
    title?: string | null | undefined;
    text: string;
  }) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ""}>${text}</a>`;
  };

  // レンダラーを適用
  marked.setOptions({ renderer });

  return marked(props.todo.memo);
});

// タイミング開始 - イベント伝播を明示的に停止
const startTiming = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("start-timing", props.todo);

  // 画面上部にスクロール
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// タイミング停止 - イベント伝播を明示的に停止
const stopTiming = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("stop-timing", props.todo);
};

// 色を暗くするユーティリティ関数
// function darkenColor(hex: string, amount = 0.2) {
//   let c = hex.replace("#", "");
//   if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
//   const num = parseInt(c, 16);
//   let r = (num >> 16) & 0xff;
//   let g = (num >> 8) & 0xff;
//   let b = num & 0xff;
//   r = Math.max(0, Math.floor(r * (1 - amount)));
//   g = Math.max(0, Math.floor(g * (1 - amount)));
//   b = Math.max(0, Math.floor(b * (1 - amount)));
//   return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
// }
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
