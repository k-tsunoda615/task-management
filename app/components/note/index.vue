<template>
  <div v-if="task" class="note-container">
    <!-- 戻るボタンと削除ボタン -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-2">
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

      <UButton
        color="red"
        variant="ghost"
        icon="i-heroicons-trash"
        class="hover:bg-red-50"
        @click="showDeleteModal = true"
      >
        タスクを削除
      </UButton>
    </div>

    <!-- タイマー部分 - 上部に固定 -->
    <div class="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-700">経過時間</h3>
        <div class="flex gap-3">
          <UButton
            v-if="!isTimerRunning"
            color="green"
            :disabled="isTaskCompleted"
            class="px-4"
            @click="startTimer"
          >
            <UIcon name="i-heroicons-play" class="mr-1" />
            開始
          </UButton>
          <UButton v-else color="amber" class="px-4" @click="stopTimer">
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
        >
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
        />
      </div>
      <div
        v-else
        class="mt-4 bg-white border border-green-200 p-6 rounded-lg overflow-auto max-h-[90vh]"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div class="markdown-prose" v-html="renderedMarkdown" />
        <!-- eslint-enable vue/no-v-html -->
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
    <!-- 削除確認モーダル -->
    <DeleteConfirmModal
      v-model:show="showDeleteModal"
      :editing-todo="task"
      @close="showDeleteModal = false"
      @delete="handleDelete"
    />
  </div>
  <div v-else class="flex justify-center items-center h-64">
    <USpinner size="lg" />
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../../../stores/tasks";
import { TASK_STATUS_LABELS } from "../../utils/constants";
import { useTaskTimer } from "../../composables/useTaskTimer";
import { formatTime } from "../../utils/time";
import type { Todo, TodoAsset } from "../../../types/todo";
import AnalogTimer from "../kanban/AnalogTimer.vue";
import AssetManager from "./AssetManager.vue";
import DeleteConfirmModal from "../modals/DeleteConfirmModal.vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps<{
  taskId: string;
}>();

const todoStore = useTodoStore();
const task = ref<Todo | null>(null);
const editedTask = ref<Partial<Todo>>({});
const isLoading = ref(true);
const showDeleteModal = ref(false);

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

/**
 * 前の画面へ戻る。
 * @description 戻れない場合はボードへ遷移する。
 * @returns {void} なし。
 */
const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  return navigateTo("/board");
};

// タスクの取得
/**
 * タスクを取得する。
 * @description ストアから対象タスクを取得し状態を更新する。
 * @returns {Promise<void>} 取得処理の完了。
 */
const fetchTask = async () => {
  if (!props.taskId) return;
  isLoading.value = true;
  try {
    if (!todoStore.isLoaded) {
      await todoStore.fetchTodos();
    }

    let foundTask = todoStore.todos.find((t) => t.id === props.taskId);
    if (!foundTask) {
      await todoStore.refreshTodo(props.taskId);
      foundTask = todoStore.todos.find((t) => t.id === props.taskId);
    }

    if (foundTask) {
      task.value = foundTask;
      editedTask.value = { ...foundTask };

      // 時間の初期化
      currentTime.value = extractTotalTime(foundTask.total_time);
    } else {
      console.error("タスクが見つかりません:", props.taskId);
      // エラー処理（リダイレクトなど）
    }
  } catch (error) {
    console.error("タスク取得エラー:", error);
  } finally {
    isLoading.value = false;
  }
};

// タスクの更新
/**
 * タスクを更新する。
 * @description 指定フィールドを更新し、トーストを表示する。
 * @param {string} field - 更新するフィールド名。
 * @returns {Promise<void>} 更新処理の完了。
 */
const updateTask = async (field: string) => {
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
      // @ts-expect-error dynamic field assignment relies on runtime keys
      editedTask.value[fieldKey] = task.value[fieldKey];
    }
  }
};

// タイマー開始
/**
 * タイマーを開始する。
 * @description タスクの現在時間を同期し計測を開始する。
 * @returns {void} なし。
 */
const startTimer = () => {
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
};

// タイマー停止
/**
 * タイマーを停止する。
 * @description 計測時間を保存し状態を更新する。
 * @returns {Promise<void>} 停止処理の完了。
 */
const stopTimer = async () => {
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
};

/**
 * 添付アップロード完了を反映する。
 * @description ローカルの添付一覧に反映する。
 * @param {TodoAsset} asset - 追加された添付情報。
 * @returns {void} なし。
 */
const handleAssetUploaded = (asset: TodoAsset) => {
  if (!task.value) return;
  const currentAssets = task.value.assets ? [...task.value.assets] : [];
  const existingIndex = currentAssets.findIndex((item) => item.id === asset.id);
  if (existingIndex !== -1) {
    currentAssets[existingIndex] = asset;
  } else {
    currentAssets.push(asset);
  }
  task.value.assets = currentAssets;
};

/**
 * 添付削除を反映する。
 * @description ローカルの添付一覧から削除する。
 * @param {string} assetId - 削除対象の添付 ID。
 * @returns {void} なし。
 */
const handleAssetDeleted = (assetId: string) => {
  if (!task.value) return;
  const currentAssets = task.value.assets || [];
  task.value.assets = currentAssets.filter((asset) => asset.id !== assetId);
};

// タスク削除
/**
 * タスクを削除する。
 * @description 削除後にボードへ遷移する。
 * @returns {Promise<void>} 削除処理の完了。
 */
const handleDelete = async () => {
  const router = useRouter();
  if (!task.value) return;

  try {
    await todoStore.deleteTodo(task.value.id);
    useToast().add({
      title: "削除完了",
      description: "タスクを削除しました",
      color: "green",
    });
    router.push("/board");
  } catch (error) {
    console.error("タスク削除エラー:", error);
    useToast().add({
      title: "エラー",
      description: "削除に失敗しました",
      color: "red",
    });
  } finally {
    showDeleteModal.value = false;
  }
};

// タスクIDが変わったら再取得
watch(
  () => [props.taskId, todoStore.todos.length],
  () => {
    fetchTask();
  },
  { immediate: true }
);

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
</style>
