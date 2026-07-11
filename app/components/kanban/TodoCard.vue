<template>
  <div
    class="group bg-white dark:bg-gray-800 rounded-card p-4 shadow-card hover:shadow-card-hover hover:-translate-y-px transition-all duration-200 relative"
    :class="[
      { 'opacity-50 grayscale': todo.is_finished },
      todo.is_timing ? 'ring-1 ring-calm-400 bg-calm-50 dark:bg-calm-950' : '',
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
            class="font-medium text-gray-900 dark:text-gray-100 truncate hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors"
          >
            {{ todo.title }}
          </NuxtLink>
          <UTooltip
            v-if="todo.assets && todo.assets.length > 0"
            text="添付ファイルあり"
          >
            <UBadge
              color="primary"
              variant="soft"
              size="xs"
              class="ml-2 flex items-center gap-1"
            >
              <UIcon name="i-heroicons-paper-clip" class="w-3 h-3" />
              {{ todo.assets.length }}
            </UBadge>
          </UTooltip>
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
              backgroundColor: 'transparent',
              color: tag.color || '#3474f0',
              boxShadow: `inset 0 0 0 1px ${tag.color || '#3474f0'}55`,
              border: 'none',
              fontWeight: '600',
              fontSize: '0.6875rem',
              borderRadius: '999px',
              padding: '0.2rem 0.55rem',
              lineHeight: '1',
            }"
          >
            {{ tag.name }}
          </UBadge>
        </div>
      </div>

      <!-- アクションボタン -->
      <div
        class="ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
      >
        <NuxtLink
          :to="`/note/${todo.id}`"
          class="text-gray-500 hover:text-primary-600 transition-colors"
        >
          <UTooltip text="詳細へ移動">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-up-right"
              size="xs"
              class="hover:bg-gray-100"
            />
          </UTooltip>
        </NuxtLink>
        <UTooltip text="編集モーダルを表示">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-pencil-square"
            size="xs"
            class="hover:bg-gray-100"
            @click="editTodo"
          />
        </UTooltip>
      </div>
    </div>

    <!-- タイマー表示 -->
    <div v-if="showTimerBar" class="flex items-center justify-between">
      <div class="flex items-center text-sm text-gray-500 tnum">
        <UIcon
          name="i-heroicons-clock"
          class="w-4 h-4 mr-1.5"
          :class="{ 'text-calm-500': todo.is_timing }"
        />
        {{ todo.is_timing ? "計測中..." : formatTime(todo.total_time || 0) }}
      </div>

      <div class="flex items-center gap-1">
        <UTooltip :text="!todo.is_timing ? 'タイマー開始' : 'タイマー停止'">
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
        </UTooltip>
      </div>
    </div>
    <!-- メモ -->
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="todo.memo"
      class="rounded-lg p-2 mt-2 text-sm markdown-prose max-h-[20em] w-full overflow-y-auto pr-2 break-all"
      v-html="parsedMemo"
    />
    <!-- eslint-enable vue/no-v-html -->
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import DOMPurify from "dompurify";
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
      is_finished?: boolean;
      total_time?: number;
      is_timing?: boolean;
      tags?: { id: string; name: string; color?: string }[];
      assets?: { id: string }[];
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

/**
 * タスク編集を開始する。
 * @description クリックイベントを停止し、編集イベントを送る。
 * @param {Event} event - クリックイベント。
 * @returns {void} なし。
 */
const editTodo = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("edit", props.todo);
};

// ドラッグ開始時にTodoのIDをデータ転送オブジェクトに設定

/**
 * ドラッグ開始時にデータを設定する。
 * @description DataTransfer に Todo ID を設定する。
 * @param {any} event - ドラッグイベント。
 * @returns {void} なし。
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const handleDragStart = (event: any) => {
  event.dataTransfer.setData("todoId", props.todo.id);
  event.dataTransfer.effectAllowed = "move";
};

// メモをマークダウンとしてパース
const parsedMemo = computed(() => {
  if (!props.todo.memo) return "";

  const html = marked(props.todo.memo, { breaks: true, gfm: true });
  return DOMPurify.sanitize(html as string, {
    ALLOWED_TAGS: [
      "a",
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "em",
      "i",
      "strong",
      "ul",
      "ol",
      "li",
      "b",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "br",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class", "style"],
  });
});

/**
 * タイミング開始を通知する。
 * @description イベント伝播を止めて開始イベントを送る。
 * @param {Event} event - クリックイベント。
 * @returns {void} なし。
 */
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

/**
 * タイミング停止を通知する。
 * @description イベント伝播を止めて停止イベントを送る。
 * @param {Event} event - クリックイベント。
 * @returns {void} なし。
 */
const stopTiming = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit("stop-timing", props.todo);
};
</script>
