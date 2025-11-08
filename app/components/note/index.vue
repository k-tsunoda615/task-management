<template>
  <div v-if="task" class="note-container">
    <!-- 戻るボタン -->
    <div class="mb-6 flex items-center justify-between">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-arrow-small-left"
        class="hover:bg-gray-100"
        @click="goBack"
      >
        戻る
      </UButton>
      <UTooltip v-if="assetCount > 0" text="添付ファイル">
        <UBadge
          color="primary"
          variant="soft"
          size="sm"
          class="flex items-center gap-1"
        >
          <UIcon name="i-heroicons-paper-clip" class="w-4 h-4" />
          {{ assetCount }}
        </UBadge>
      </UTooltip>
    </div>

    <!-- タイマー部分 - 上部に固定 -->
    <div class="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-700">経過時間</h3>
        <div class="flex gap-3">
          <UButton
            v-if="!isTimerRunning"
            color="green"
            @click="startTimer"
            :disabled="isTaskCompleted"
            class="px-4"
          >
            <UIcon name="i-heroicons-play" class="mr-1" />
            開始
          </UButton>
          <UButton v-else color="amber" @click="stopTimer" class="px-4">
            <UIcon name="i-heroicons-pause" class="mr-1" />
            停止
          </UButton>
        </div>
      </div>
      <div class="flex items-center justify-center py-3">
        <div class="timer-container relative">
          <AnalogTimer :seconds="currentTime" :size="160" />
          <div class="mt-2 text-center text-sm text-gray-500">
            {{ formattedTotalTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- タイトル、ステータス、完了フラグ -->
    <div class="mb-6">
      <!-- タイトル編集 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >タイトル</label
        >
        <input
          v-model="editedTask.title"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
          @change="updateTask('title')"
        />
      </div>

      <!-- ステータスと完了フラグ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >ステータス</label
          >
          <select
            v-model="editedTask.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
            @change="updateTask('status')"
          >
            <option
              v-for="(label, status) in TASK_STATUS_LABELS"
              :key="status"
              :value="status"
            >
              {{ label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >完了</label
          >
          <div class="flex items-center h-[42px]">
            <UCheckbox
              v-model="editedTask.is_finished"
              @change="updateTask('is_finished')"
            />
            <span class="ml-2">{{
              editedTask.is_finished ? "完了" : "未完了"
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <AssetManager
      :todo-id="task.id"
      :assets="task.assets || []"
      :is-disabled="isTaskCompleted"
      @uploaded="handleAssetUploaded"
      @deleted="handleAssetDeleted"
    />

    <!-- メモ (Markdown) -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">メモ</label>
      <div class="flex gap-2">
        <UButton
          :color="memoViewMode === 'edit' ? 'primary' : 'gray'"
          :variant="memoViewMode === 'edit' ? 'soft' : 'ghost'"
          class="px-3 py-1 text-sm"
          icon="i-heroicons-pencil-square"
          @click="memoViewMode = 'edit'"
        >
          Markdown
        </UButton>
        <UButton
          :color="memoViewMode === 'preview' ? 'primary' : 'gray'"
          :variant="memoViewMode === 'preview' ? 'soft' : 'ghost'"
          class="px-3 py-1 text-sm"
          icon="i-heroicons-eye"
          @click="memoViewMode = 'preview'"
        >
          プレビュー
        </UButton>
      </div>

      <div v-if="memoViewMode === 'edit'" class="mt-4">
        <textarea
          v-model="editedTask.memo"
          class="w-full h-[500px] px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 font-mono text-sm"
          placeholder="Markdownでメモを入力できます..."
          @change="updateTask('memo')"
        ></textarea>
      </div>
      <div
        v-else
        class="mt-4 bg-white border border-green-200 p-6 rounded-lg overflow-auto h-[500px]"
      >
        <div class="prose prose-sm max-w-none" v-html="renderedMarkdown"></div>
      </div>
    </div>

    <!-- 最終更新日時 -->
    <div class="text-right text-sm text-gray-500">
      最終更新: {{ formattedUpdateDate }}
    </div>
    <!-- 戻るボタン -->
    <div class="mb-6 flex items-center justify-between">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-arrow-small-left"
        class="hover:bg-gray-100"
        @click="goBack"
      >
        戻る
      </UButton>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-64">
    <USpinner size="lg" />
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../../../stores/tasks";
import { TASK_STATUS, TASK_STATUS_LABELS } from "../../utils/constants";
import { useTaskTimer } from "../../composables/useTaskTimer";
import { formatTime } from "../../utils/time";
import type { Todo, TodoAsset } from "../../../types/todo";
import AnalogTimer from "../kanban/AnalogTimer.vue";
import AssetManager from "./AssetManager.vue";
import { marked } from "marked";
// @ts-ignore
import DOMPurify from "dompurify";

const props = defineProps<{
  taskId: string;
}>();

const todoStore = useTodoStore();
const task = ref<Todo | null>(null);
const editedTask = ref<Partial<Todo>>({});
const isLoading = ref(true);

const memoViewMode = ref<"edit" | "preview">("edit");
const assetCount = computed(() => task.value?.assets?.length || 0);

// タイマー関連
const {
  startTimerForTodo,
  stopTimer: timerStop,
  extractTotalTime,
} = useTaskTimer();
const isTimerRunning = ref(false);
const currentTime = ref(0);

// 完了状態の計算プロパティ
const isTaskCompleted = computed(() => {
  return editedTask.value.is_finished === true;
});

// Markdownレンダリング
const renderedMarkdown = computed(() => {
  if (!editedTask.value.memo) return "";
  const html = marked(editedTask.value.memo, { breaks: true, gfm: true });
  return DOMPurify.sanitize(html as string, {
    ALLOWED_TAGS: [
      "a",
      "b",
      "i",
      "u",
      "s",
      "code",
      "pre",
      "br",
      "p",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class", "style"],
  });
});

// 総時間のフォーマット
const formattedTotalTime = computed(() => {
  return formatTime(currentTime.value);
});

// 更新日時のフォーマット
const formattedUpdateDate = computed(() => {
  if (!task.value?.updated_at) return "不明";
  const date = new Date(task.value.updated_at);
  return date.toLocaleString("ja-JP");
});

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  return navigateTo("/board");
};

// タスクの取得
async function fetchTask() {
  isLoading.value = true;
  try {
    if (!todoStore.isLoaded) {
      await todoStore.fetchTodos();
    }

    const foundTask = todoStore.todos.find((t) => t.id === props.taskId);
    if (foundTask) {
      task.value = foundTask;
      editedTask.value = { ...foundTask };

      // 時間の初期化
      currentTime.value = extractTotalTime(task.value.total_time);
    } else {
      console.error("タスクが見つかりません:", props.taskId);
      // エラー処理（リダイレクトなど）
    }
  } catch (error) {
    console.error("タスク取得エラー:", error);
  } finally {
    isLoading.value = false;
  }
}

// タスクの更新
async function updateTask(field: string) {
  if (!task.value) return;

  try {
    const updateData: Partial<Todo> = {
      id: task.value.id,
      [field]: editedTask.value[field as keyof typeof editedTask.value],
    };

    await todoStore.updateTodo(updateData);
    useToast().add({
      title: "更新完了",
      description: "タスクを更新しました",
      color: "green",
    });
  } catch (error) {
    console.error("タスク更新エラー:", error);
    useToast().add({
      title: "エラー",
      description: "更新に失敗しました",
      color: "red",
    });
    // エラー時は元の値に戻す
    if (task.value && field in task.value) {
      const fieldKey = field as keyof typeof task.value;
      // @ts-ignore
      editedTask.value[fieldKey] = task.value[fieldKey];
    }
  }
}

// タイマー開始
function startTimer() {
  if (!task.value) return;

  // タイマー開始前に、タスクの最新の時間を取得して設定
  // これにより、タイマー停止後に再開した場合も連続した計測が可能
  console.log("タイマー開始前:", {
    current: currentTime.value,
    taskTotal: task.value.total_time,
    extractedTotal: extractTotalTime(task.value.total_time),
  });

  if (task.value.total_time !== currentTime.value) {
    task.value.total_time = currentTime.value;
    console.log("タスクの時間を更新:", currentTime.value);
  }

  isTimerRunning.value = true;
  startTimerForTodo(task.value, (total) => {
    currentTime.value = total;
  });
}

// タイマー停止
async function stopTimer() {
  if (!task.value) return;
  isTimerRunning.value = false;
  timerStop(task.value);

  // 総時間をサーバーに保存
  try {
    console.log("タイマー停止時:", {
      current: currentTime.value,
      taskTotal: task.value.total_time,
    });

    // total_timeは配列として保存する必要がある
    const updateData: Partial<Todo> = {
      id: task.value.id,
      total_time: [currentTime.value], // 配列として保存
    };
    await todoStore.updateTodo(updateData);

    // ローカルのタスクも更新
    if (task.value) {
      task.value.total_time = currentTime.value; // ローカルでは数値のまま
    }

    console.log(`タイマー停止: ${currentTime.value}秒を保存しました`);
  } catch (error) {
    console.error("時間の保存に失敗しました:", error);
  }
}

function handleAssetUploaded(asset: TodoAsset) {
  if (!task.value) return;
  const currentAssets = task.value.assets ? [...task.value.assets] : [];
  const existingIndex = currentAssets.findIndex((item) => item.id === asset.id);
  if (existingIndex !== -1) {
    currentAssets[existingIndex] = asset;
  } else {
    currentAssets.push(asset);
  }
  task.value.assets = currentAssets;
}

function handleAssetDeleted(assetId: string) {
  if (!task.value) return;
  const currentAssets = task.value.assets || [];
  task.value.assets = currentAssets.filter((asset) => asset.id !== assetId);
}

// タスクIDが変わったら再取得
watch(() => props.taskId, fetchTask, { immediate: true });

// 現在の時間が変わったらタスクの時間も更新（ただし、タイマー実行中は除く）
watch(currentTime, (newVal) => {
  if (task.value && !isTimerRunning.value) {
    console.log("watch currentTime:", {
      newVal,
      isRunning: isTimerRunning.value,
    });
    task.value.total_time = newVal;
  }
});

// クリーンアップ
onBeforeUnmount(() => {
  if (isTimerRunning.value && task.value) {
    stopTimer();
  }
});
</script>

<style scoped>
.note-container {
  max-width: 1200px;
  margin: 0 auto;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.prose) {
  max-width: 100%;
  margin: 0 auto;
  color: #657b83;
  font-family:
    "Inter",
    "Hiragino Sans",
    "Noto Sans JP",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  line-height: 1.8;
  letter-spacing: 0.005em;
}

:deep(.prose > p) {
  margin-top: 1.1em;
  margin-bottom: 1.3em;
  color: #586e75;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3) {
  font-family:
    "Inter",
    "Hiragino Sans",
    "Noto Sans JP",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-weight: 700;
  color: #002b36;
  line-height: 1.25;
  letter-spacing: 0.02em;
}

:deep(.prose h1) {
  font-size: 24px;
  margin-top: 1.6em;
  margin-bottom: 1.2em;
  font-family:
    "Hiragino Mincho ProN", "YuMincho", "Noto Serif JP", "Times New Roman",
    serif;
  letter-spacing: 0.03em;
}

:deep(.prose h2) {
  font-size: 22px;
  margin-top: 2.2em;
  margin-bottom: 0.95em;
  padding-left: 0.65em;
  border-left: 3px solid rgba(147, 161, 161, 0.6);
}

:deep(.prose h3) {
  font-size: 18px;
  margin-top: 1.8em;
  margin-bottom: 0.7em;
  color: #073642;
}

:deep(.prose ul),
:deep(.prose ol) {
  padding-left: 1.75rem;
  margin: 1.1em 0 1.5em;
}

:deep(.prose ul > li),
:deep(.prose ol > li) {
  padding-left: 0.5em;
  margin-bottom: 0.45em;
  color: #586e75;
}

:deep(.prose ul > li::marker) {
  color: #586e75;
}

:deep(.prose ol > li::marker) {
  color: #586e75;
  font-weight: 600;
}

:deep(.prose code) {
  color: #cb4b16;
  background: #eee8d5;
  padding: 0.2em 0.5em;
  border-radius: 0.4rem;
  font-size: 0.92em;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

:deep(.prose > pre) {
  background: #002b36;
  border-radius: 0.9rem;
  padding: 1.35rem;
  margin: 1.6rem -0.5rem;
  box-shadow: 0 18px 40px rgba(0, 43, 54, 0.35);
  color: #fdf6e3;
  font-size: 0.95rem;
  border: 1px solid rgba(147, 161, 161, 0.25);
}

:deep(.prose pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

:deep(.prose blockquote) {
  background: #fef3c7;
  border-left: 4px solid #b58900;
  border-radius: 0 0.5rem 0.5rem 0;
  padding: 1rem 1.25rem;
  font-style: italic;
  color: #855d12;
  margin: 1.5rem 0;
}

:deep(.prose hr) {
  margin: 2.5rem 0;
  border: none;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(38, 139, 210, 0.45),
    transparent
  );
}

:deep(.prose a) {
  color: #268bd2;
  text-decoration: none;
  border-bottom: 1px solid rgba(38, 139, 210, 0.4);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

:deep(.prose a:hover) {
  color: #2aa198;
  border-bottom-color: rgba(42, 161, 152, 0.6);
  background: rgba(38, 139, 210, 0.08);
}

:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  overflow: hidden;
  border-radius: 0.85rem;
  border: 1px solid rgba(147, 161, 161, 0.35);
  background: #fffdf7;
  box-shadow:
    inset 0 0 0 1px rgba(147, 161, 161, 0.35),
    0 12px 25px rgba(147, 161, 161, 0.15);
}

:deep(.prose th),
:deep(.prose td) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(147, 161, 161, 0.35);
  border-right: 1px solid rgba(147, 161, 161, 0.25);
}

:deep(.prose th) {
  background: linear-gradient(135deg, #eee8d5, #fdf6e3);
  font-weight: 600;
  color: #073642;
  text-transform: uppercase;
  font-size: 0.82rem;
  letter-spacing: 0.05em;
}

:deep(.prose tbody tr:nth-child(odd)) {
  background-color: rgba(253, 246, 227, 0.65);
}

:deep(.prose tbody tr:nth-child(even)) {
  background-color: rgba(238, 232, 213, 0.75);
}

:deep(.prose tbody tr:hover) {
  background-color: rgba(42, 161, 152, 0.08);
}
</style>
