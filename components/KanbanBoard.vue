<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold font-en-title">Task Board</h1>
      <UButton @click="openNewTaskModal" icon="i-heroicons-plus">
        新しいタスク
      </UButton>
    </div>

    <!-- 現在計測中のタスク表示 -->
    <div
      v-if="currentTimingTodo"
      class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between"
    >
      <div class="flex items-center">
        <UIcon name="i-heroicons-clock" class="w-5 h-5 mr-2 text-blue-500" />
        <div>
          <div class="font-semibold">{{ currentTimingTodo.title }}</div>
          <div class="text-sm text-blue-700">
            {{ formatTime(currentTotalTime) }}
          </div>
        </div>
      </div>
      <UButton
        color="red"
        size="sm"
        @click="stopCurrentTiming"
        icon="i-heroicons-pause"
      >
        停止
      </UButton>
    </div>

    <!-- PC表示: 上段：PriorityとNext Up（3:2の比率） -->
    <div class="hidden md:grid grid-cols-5 gap-4 mb-4">
      <!-- Priority - 3/5の幅 -->
      <div class="col-span-3">
        <div class="rounded-lg bg-gray-100 p-4 h-full">
          <h2 class="mb-3 font-semibold text-gray-700">
            <UIcon name="i-heroicons-inbox" class="mr-1 align-middle" />
            Priority
          </h2>
          <draggable
            v-model="todosByStatus.todo"
            :group="{ name: 'todos' }"
            item-key="id"
            class="space-y-2"
            data-status="todo"
            :animation="200"
            ghost-class="opacity-50"
            @change="handleDragChange"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template #item="{ element }">
              <TodoCard
                :todo="element"
                :showTimerBar="showTimerBar"
                @edit="openEditModal"
                @start-timing="startTiming"
                @stop-timing="stopTiming"
              />
            </template>
          </draggable>
          <div
            v-if="todosByStatus.todo.length === 0"
            class="text-gray-500 text-sm p-2"
          >
            タスクがありません
          </div>
        </div>
      </div>

      <!-- Next Up - 2/5の幅 -->
      <div class="col-span-2">
        <div class="rounded-lg bg-blue-50 p-4 h-full">
          <h2 class="mb-3 font-semibold text-blue-700">
            <UIcon name="i-heroicons-clock" class="mr-1 align-middle" />
            Next Up
          </h2>
          <draggable
            v-model="todosByStatus.inProgress"
            :group="{ name: 'todos' }"
            item-key="id"
            class="space-y-2"
            data-status="inProgress"
            :animation="200"
            ghost-class="opacity-50"
            @change="handleDragChange"
          >
            <template #item="{ element }">
              <TodoCard
                :todo="element"
                :showTimerBar="showTimerBar"
                @edit="openEditModal"
                @start-timing="startTiming"
                @stop-timing="stopTiming"
              />
            </template>
          </draggable>
          <div
            v-if="todosByStatus.inProgress.length === 0"
            class="text-gray-500 text-sm p-2"
          >
            タスクがありません
          </div>
        </div>
      </div>
    </div>

    <!-- モバイル表示: 1カラムレイアウト -->
    <div class="block md:hidden space-y-4">
      <!-- Priority -->
      <div class="rounded-lg bg-gray-100 p-4">
        <h2 class="mb-3 font-semibold text-gray-700">
          <UIcon name="i-heroicons-inbox" class="mr-1 align-middle" />
          Priority
        </h2>
        <draggable
          v-model="todosByStatus.todo"
          :group="{ name: 'todos' }"
          item-key="id"
          class="space-y-2"
          data-status="todo"
          :animation="200"
          ghost-class="opacity-50"
          @change="handleDragChange"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <TodoCard
              :todo="element"
              :showTimerBar="showTimerBar"
              @edit="openEditModal"
              @start-timing="startTiming"
              @stop-timing="stopTiming"
            />
          </template>
        </draggable>
        <div
          v-if="todosByStatus.todo.length === 0"
          class="text-gray-500 text-sm p-2"
        >
          タスクがありません
        </div>
      </div>

      <!-- Next Up -->
      <div class="rounded-lg bg-blue-50 p-4">
        <h2 class="mb-3 font-semibold text-blue-700">
          <UIcon name="i-heroicons-clock" class="mr-1 align-middle" />
          Next Up
        </h2>
        <draggable
          v-model="todosByStatus.inProgress"
          :group="{ name: 'todos' }"
          item-key="id"
          class="space-y-2"
          data-status="inProgress"
          :animation="200"
          ghost-class="opacity-50"
          @change="handleDragChange"
        >
          <template #item="{ element }">
            <TodoCard
              :todo="element"
              :showTimerBar="showTimerBar"
              @edit="openEditModal"
              @start-timing="startTiming"
              @stop-timing="stopTiming"
            />
          </template>
        </draggable>
        <div
          v-if="todosByStatus.inProgress.length === 0"
          class="text-gray-500 text-sm p-2"
        >
          タスクがありません
        </div>
      </div>
    </div>

    <!-- PC/モバイル共通: 下段：Archived -->
    <div class="rounded-lg bg-green-50 p-4 mt-4">
      <h2 class="mb-3 font-semibold text-green-700">
        <UIcon name="i-heroicons-check-circle" class="mr-1 align-middle" />
        Archived
      </h2>
      <draggable
        v-model="todosByStatus.done"
        :group="{ name: 'todos' }"
        item-key="id"
        class="space-y-2"
        data-status="done"
        :animation="200"
        ghost-class="opacity-50"
        @change="handleDragChange"
      >
        <template #item="{ element }">
          <TodoCard
            :todo="element"
            :showTimerBar="showTimerBar"
            @edit="openEditModal"
            @start-timing="startTiming"
            @stop-timing="stopTiming"
          />
        </template>
      </draggable>
      <div
        v-if="todosByStatus.done.length === 0"
        class="text-gray-500 text-sm p-2"
      >
        タスクがありません
      </div>
    </div>

    <!-- 新規タスクモーダル -->
    <UModal v-model="showNewTaskModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">新しいタスク</h3>
        </template>
        <form @submit.prevent="createTodo">
          <UFormGroup label="タイトル" class="mt-4">
            <UInput v-model="newTodo.title" required />
          </UFormGroup>
          <UFormGroup label="メモ" class="mt-4">
            <UTextarea v-model="newTodo.memo" />
          </UFormGroup>
          <UFormGroup label="ステータス" class="mt-4">
            <USelect
              v-model="newTodo.status"
              :options="[
                { label: 'Priority', value: '未対応' },
                { label: 'Next Up', value: '対応中' },
                { label: 'Archived', value: '完了' },
              ]"
            />
          </UFormGroup>
          <UFormGroup class="mt-4">
            <UCheckbox v-model="newTodo.is_private" label="Private" />
          </UFormGroup>
          <UFormGroup label="合計時間 (hh:mm:ss)" class="mt-4">
            <UInput
              v-model="timeInput"
              placeholder="00:00:00"
              @input="validateTimeInput"
            />
          </UFormGroup>
        </form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showNewTaskModal = false">
              キャンセル
            </UButton>
            <UButton color="primary" @click="createTodo" :loading="isCreating">
              作成
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- 編集タスクモーダル -->
    <UModal
      v-model="showEditModal"
      :ui="{
        container: 'items-start my-20',
        width: 'max-w-4xl',
        height: 'min-h-[300px]',
      }"
    >
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">タスクを編集</h3>
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              size="sm"
              @click="confirmDeleteTodo"
              title="タスクを削除"
            />
          </div>
        </template>
        <form @submit.prevent="updateTodo">
          <UFormGroup label="タイトル" class="mt-4">
            <UInput v-model="editingTodo.title" required />
          </UFormGroup>
          <UFormGroup label="メモ" class="mt-4">
            <div class="space-y-2">
              <UTextarea
                v-model="editingTodo.memo"
                :rows="15"
                class="font-mono text-sm"
                :ui="{
                  base: 'min-h-[300px] resize-y',
                }"
              />
              <UButton
                size="sm"
                variant="ghost"
                @click="showPreviewModal = true"
                icon="i-heroicons-eye"
              >
                プレビュー
              </UButton>
            </div>
          </UFormGroup>
          <div class="flex gap-4 mt-4">
            <UFormGroup label="ステータス" class="flex-1">
              <USelect
                v-model="editingTodo.status"
                :options="[
                  { label: 'Priority', value: '未対応' },
                  { label: 'Next', value: '対応中' },
                  { label: 'Archived', value: '完了' },
                ]"
              />
            </UFormGroup>
            <UFormGroup class="flex-1">
              <UCheckbox v-model="editingTodo.is_private" label="Private" />
            </UFormGroup>
          </div>
          <UFormGroup label="合計時間 (hh:mm:ss)" class="mt-4">
            <UInput
              v-model="editTimeInput"
              placeholder="00:00:00"
              @input="validateTimeInput"
            />
          </UFormGroup>
        </form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showEditModal = false">
              キャンセル
            </UButton>
            <UButton color="primary" @click="updateTodo" :loading="isUpdating">
              更新
            </UButton>
          </div>
        </template>

        <!-- プレビューモーダル -->
        <UModal
          v-if="showPreviewModal"
          v-model="showPreviewModal"
          :ui="{
            container: 'items-start my-20',
            width: 'max-w-4xl',
            wrapper: 'z-[60]',
            overlay: { base: 'bg-gray-950/75' },
          }"
        >
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">プレビュー</h3>
            </template>
            <div
              class="prose prose-sm max-w-none min-h-[300px] overflow-y-auto max-h-[60vh]"
              v-html="parsedPreviewMemo"
            />
            <template #footer>
              <div class="flex justify-end">
                <UButton variant="ghost" @click="showPreviewModal = false">
                  閉じる
                </UButton>
              </div>
            </template>
          </UCard>
        </UModal>
      </UCard>
    </UModal>

    <!-- 削除確認モーダル -->
    <UModal v-model="showDeleteConfirmModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">タスクの削除</h3>
        </template>
        <p>「{{ editingTodo.title }}」を削除してもよろしいですか？</p>
        <p class="text-sm text-gray-500 mt-2">この操作は元に戻せません。</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showDeleteConfirmModal = false">
              キャンセル
            </UButton>
            <UButton color="red" @click="deleteCurrentTodo"> 削除する </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../stores/todo";
import draggable from "vuedraggable";
import { marked } from "marked";
import { useEventBus } from "@vueuse/core";
import type { Todo } from "../types/todo";

const todoStore = useTodoStore();
const showNewTaskModal = ref(false);
const showEditModal = ref(false);
const showPreviewModal = ref(false);
const showDeleteConfirmModal = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const trashEventBus = useEventBus("trash-drop");

// タイマー関連の状態
const showTimerBar = ref(true);
const currentTimingTodo = ref<Todo | null>(null);
const currentTotalTime = ref(0);
const timerInterval = ref<number | null>(null);
const startTime = ref<number | null>(null);

// 時間入力フィールド
const timeInput = ref("00:00:00");
const editTimeInput = ref("00:00:00");

// 新規タスクモーダルを開く時に現在のフィルター状態に基づいて初期値を設定
const openNewTaskModal = () => {
  // フィルターがプライベートの場合はチェックを入れる
  newTodo.value.is_private = todoStore.taskFilter === "private";
  timeInput.value = "00:00:00";
  showNewTaskModal.value = true;
};

const newTodo = ref({
  title: "",
  memo: "",
  status: "未対応",
  task_id: "",
  is_private: false,
  total_time: 0,
  is_timing: false,
});

const editingTodo = ref({
  id: "",
  title: "",
  memo: "",
  status: "未対応",
  task_id: "",
  is_private: false,
  total_time: 0,
  is_timing: false,
});

// プレビュー用のマークダウンパース
const parsedPreviewMemo = computed(() => {
  return marked(editingTodo.value.memo || "");
});

// 日付フォーマット関数
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "不明";
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

// 時間文字列（hh:mm:ss）を秒数に変換
const parseTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;

  // 時間形式（hh:mm:ss）の正規表現
  const timeRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;
  const match = timeStr.match(timeRegex);

  if (!match) {
    // 正規表現にマッチしない場合は、単純に:で分割して変換を試みる
    const parts = timeStr.split(":").map((part) => parseInt(part, 10));
    if (
      parts.length === 3 &&
      !isNaN(parts[0]) &&
      !isNaN(parts[1]) &&
      !isNaN(parts[2])
    ) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    console.warn("不正な時間形式:", timeStr);
    return 0;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);

  return hours * 3600 + minutes * 60 + seconds;
};

// ステータスの日本語と英語のマッピング
const statusMap = {
  未対応: "todo",
  対応中: "inProgress",
  完了: "done",
};

// 逆マッピング（英語から日本語へ）
const reverseStatusMap = {
  todo: "未対応",
  inProgress: "対応中",
  done: "完了",
};

// ステータス別のTodoを管理するreactiveな状態
const todosByStatus = reactive({
  todo: [] as Todo[],
  inProgress: [] as Todo[],
  done: [] as Todo[],
});

// 更新中フラグ
const isUpdatingRef = ref(false);
// ドラッグ中フラグ
const isDragging = ref(false);

// Todoの状態が変更されたときに再分類する
const updateTodosByStatus = () => {
  console.log("現在のTodos:", todoStore.filteredTodos);

  // ドラッグ中は再分類をスキップ
  if (isDragging.value) return;

  // 一旦クリア
  todosByStatus.todo = [];
  todosByStatus.inProgress = [];
  todosByStatus.done = [];

  // 再分類
  todoStore.filteredTodos.forEach((todo: Todo) => {
    if (todo.status === "未対応") {
      todosByStatus.todo.push(todo);
    } else if (todo.status === "対応中") {
      todosByStatus.inProgress.push(todo);
    } else if (todo.status === "完了") {
      todosByStatus.done.push(todo);
    } else {
      // デフォルトは未対応に入れる
      console.log(`不明なステータス "${todo.status}" のTodoがあります:`, todo);
      todosByStatus.todo.push(todo);
    }
  });

  // 各リストをsort_orderでソート
  todosByStatus.todo.sort(
    (a: Todo, b: Todo) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  todosByStatus.inProgress.sort(
    (a: Todo, b: Todo) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  todosByStatus.done.sort(
    (a: Todo, b: Todo) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  // 計測中のタスクを確認
  const timingTodo = todoStore.filteredTodos.find(
    (todo: Todo) => todo.is_timing
  );

  if (timingTodo) {
    console.log("計測中のタスクを検出:", timingTodo);
    currentTimingTodo.value = timingTodo;

    // タイマーが動いていない場合は開始
    if (!timerInterval.value) {
      console.log("タイマーを再開します");
      startTimerForTodo(timingTodo);
    }
  } else if (currentTimingTodo.value && !timingTodo) {
    // 計測中のタスクがなくなった場合はタイマーを停止
    console.log("計測中のタスクがなくなったのでタイマーを停止します");
    stopTimer();
    currentTimingTodo.value = null;
  }
};

// todoStoreのtodosが変更されたときに再分類を実行
watch(
  () => [todoStore.filteredTodos, todoStore.taskFilter],
  () => {
    // 更新中は再分類をスキップ
    if (isUpdatingRef.value) return;
    updateTodosByStatus();

    // 計測中のタスクを確認
    const timingTodo = todoStore.filteredTodos.find(
      (todo: Todo) => todo.is_timing
    );
    if (timingTodo) {
      currentTimingTodo.value = timingTodo;
      currentTotalTime.value = extractTotalTime(timingTodo.total_time);
      if (!timerInterval.value) {
        startTimerForTodo(timingTodo);
      }
    }
  },
  { deep: true }
);

// コンポーネントがマウントされたときの処理
onMounted(() => {
  // タイマー表示切り替えイベントを監視する関数を定義
  const handleTimerVisibilityToggle = (event: any) => {
    showTimerBar.value = event.detail.showTimer;
  };

  // イベントリスナーを追加
  window.addEventListener("timerVisibilityToggle", handleTimerVisibilityToggle);

  // コンポーネントがアンマウントされたときにイベントリスナーを削除
  onUnmounted(() => {
    window.removeEventListener(
      "timerVisibilityToggle",
      handleTimerVisibilityToggle
    );

    // タイマーを停止
    if (timerInterval.value) {
      cancelAnimationFrame(timerInterval.value);
    }
  });

  // 初期タイマー表示状態を設定
  const savedTimerState = localStorage.getItem("showTimer");
  if (savedTimerState !== null) {
    showTimerBar.value = savedTimerState === "true";
  }

  // 初期データの取得
  const fetchInitialData = async () => {
    try {
      await todoStore.fetchTodos();
    } catch (error) {
      console.error("Todoの取得に失敗しました:", error);
      useToast().add({
        title: "エラー",
        description: "タスクの取得に失敗しました",
        color: "red",
      });
    }
  };

  fetchInitialData();
  updateTodosByStatus();

  // ゴミ箱へのドロップイベントを監視
  trashEventBus.on((todoId) => {
    if (confirm("このタスクを削除しますか？")) {
      deleteTodo(todoId as string);
    }
  });
});

// 編集モーダルを開く
const openEditModal = (todo: Todo) => {
  // 必須フィールドを持つオブジェクトを作成
  editingTodo.value = {
    id: todo.id,
    title: todo.title,
    status: todo.status,
    memo: todo.memo || "",
    task_id: todo.task_id || null,
    is_private: todo.is_private || false,
    total_time: extractTotalTime(todo.total_time),
    is_timing: todo.is_timing || false,
  };

  // 時間表示を更新
  editTimeInput.value = formatTime(extractTotalTime(todo.total_time));
  showEditModal.value = true;

  // デバッグ用
  console.log("編集モーダルを開きました:", {
    todo,
    extractedTime: extractTotalTime(todo.total_time),
    formattedTime: editTimeInput.value,
  });
};

// 新規Todo作成
const createTodo = async () => {
  if (!newTodo.value.title) return;

  // 同じステータスのTodoの最小sort_orderを取得
  let minSortOrder = 0;
  const statusKey =
    statusMap[newTodo.value.status as keyof typeof statusMap] || "todo";
  if (todosByStatus[statusKey as keyof typeof todosByStatus].length > 0) {
    minSortOrder =
      Math.min(
        ...todosByStatus[statusKey as keyof typeof todosByStatus].map(
          (t: Todo) => t.sort_order || 0
        )
      ) - 100;
  }

  // 時間文字列を秒数に変換
  const totalTimeSeconds = parseTimeToSeconds(timeInput.value);

  isCreating.value = true;
  try {
    await todoStore.createTodo({
      title: newTodo.value.title,
      memo: newTodo.value.memo,
      status: newTodo.value.status,
      task_id: newTodo.value.task_id,
      is_private: newTodo.value.is_private,
      sort_order: minSortOrder, // 最小値より小さい値を設定して先頭に表示
      total_time: [totalTimeSeconds], // 配列として送信
      is_timing: false,
    });

    showNewTaskModal.value = false;
    newTodo.value = {
      title: "",
      memo: "",
      status: "未対応",
      task_id: "",
      is_private: false,
      total_time: 0,
      is_timing: false,
    };
    timeInput.value = "00:00:00";
  } catch (error) {
    console.error("Todo作成エラー:", error);
  } finally {
    isCreating.value = false;
  }
};

// Todo更新
const updateTodo = async () => {
  if (!editingTodo.value.title) return;

  // 時間文字列を秒数に変換
  const totalTimeSeconds = parseTimeToSeconds(editTimeInput.value);
  console.log(
    "変換された時間（秒）:",
    totalTimeSeconds,
    "元の入力:",
    editTimeInput.value
  );

  // 更新するデータを準備
  const updateData = {
    ...editingTodo.value,
    // task_idが空文字列の場合はnullを設定
    task_id:
      editingTodo.value.task_id === "" ? null : editingTodo.value.task_id,
    total_time: [totalTimeSeconds], // 配列として送信
  };

  console.log("更新データ:", updateData);

  isUpdating.value = true;
  try {
    await todoStore.updateTodo(updateData);
    showEditModal.value = false;
    // 成功メッセージを表示
    useToast().add({
      title: "更新完了",
      description: "タスクを更新しました",
      color: "green",
    });
  } catch (error) {
    console.error("Todo更新エラー:", error);
    // エラーメッセージを表示
    useToast().add({
      title: "エラー",
      description: "更新に失敗しました",
      color: "red",
    });
  } finally {
    isUpdating.value = false;
  }
};

// ドラッグ&ドロップ時の処理
const handleDragChange = async (evt: any) => {
  console.log("ドラッグイベント:", evt); // デバッグ用

  // ドラッグ開始時のフラグ設定
  isDragging.value = true;

  // ドラッグ&ドロップの種類を特定
  const dragType = evt.added ? "added" : evt.moved ? "moved" : null;
  if (!dragType) return;

  const todo = evt[dragType].element;
  const newIndex = evt[dragType].newIndex;

  // 移動先のリストを特定
  let newStatus = "todo"; // デフォルト値
  let targetList = todosByStatus.todo;

  if (evt.added) {
    // 追加された場合は、追加先のインデックスから判断
    if (todosByStatus.inProgress.find((t: Todo) => t.id === todo.id)) {
      newStatus = "inProgress";
      targetList = todosByStatus.inProgress;
    } else if (todosByStatus.done.find((t: Todo) => t.id === todo.id)) {
      newStatus = "done";
      targetList = todosByStatus.done;
    }
  } else if (evt.moved) {
    // 移動の場合は、移動先のリストから判断
    if (todosByStatus.inProgress.find((t: Todo) => t.id === todo.id)) {
      newStatus = "inProgress";
      targetList = todosByStatus.inProgress;
    } else if (todosByStatus.done.find((t: Todo) => t.id === todo.id)) {
      newStatus = "done";
      targetList = todosByStatus.done;
    }
  }

  if (!todo || !newStatus) {
    console.error("必要な情報が見つかりません", { todo, newStatus, evt });
    isDragging.value = false;
    return;
  }

  // ステータスマッピング
  const statusMapping = {
    todo: "未対応",
    inProgress: "対応中",
    done: "完了",
  };

  const mappedStatus = statusMapping[newStatus as keyof typeof statusMapping];
  if (!mappedStatus) {
    console.error("不正なステータス:", newStatus);
    isDragging.value = false;
    return;
  }

  // 更新中フラグをセット
  isUpdatingRef.value = true;

  // 直接リストの順序を使用（すでにドラッグ後の順序になっている）
  const updatedTodos = targetList.map((t: Todo, index: number) => {
    return {
      ...t,
      sort_order: index * 100, // 大きな間隔で設定（0, 100, 200, ...）
    };
  });

  // 対象のTodoのステータスと順序を更新
  if (todo.status !== mappedStatus) {
    todo.status = mappedStatus;
  }

  // 現在のTodoの順序を設定
  const currentSortOrder =
    updatedTodos.find((t: Todo) => t.id === todo.id)?.sort_order || 0;
  todo.sort_order = currentSortOrder;

  // 他のTodoの順序も更新
  updatedTodos.forEach((t: Todo) => {
    if (t.id !== todo.id) {
      const originalTodo = targetList.find(
        (original: Todo) => original.id === t.id
      );
      if (originalTodo) {
        originalTodo.sort_order = t.sort_order;
      }
    }
  });

  // ドラッグ終了フラグを設定
  setTimeout(() => {
    isDragging.value = false;
  }, 50);

  // バックグラウンドで更新処理を実行
  try {
    // まず現在のTodoのステータスと順序を更新
    todoStore
      .updateTodo({
        id: todo.id,
        title: todo.title,
        memo: todo.memo,
        task_id: todo.task_id,
        is_private: todo.is_private,
        status: mappedStatus,
        sort_order: currentSortOrder,
      })
      .catch((error: any) => {
        console.error("Todo更新エラー:", error);
      });

    // 他のTodoの順序を一括更新
    const updatePromises = updatedTodos
      .filter((t: Todo) => t.id !== todo.id)
      .map((t: Todo) =>
        todoStore.updateTodoOrder({
          id: t.id,
          sort_order: t.sort_order ?? 0,
        })
      );

    Promise.all(updatePromises).catch((error: any) => {
      console.error("Todo順序更新エラー:", error);
    });

    // 5秒後に静かに再同期（オプション）
    setTimeout(() => {
      todoStore.fetchTodos().catch((error: any) => {
        console.error("Todo再取得エラー:", error);
      });
      // 更新フラグを解除（遅延して）
      isUpdatingRef.value = false;
    }, 5000);

    if (evt.added) {
      useToast().add({
        title: "更新完了",
        description: "タスクを移動しました",
        color: "green",
      });
    }
  } catch (error) {
    console.error("Todo更新エラー:", error);
    useToast().add({
      title: "エラー",
      description: "タスクの移動に失敗しました",
      color: "red",
    });
    // 更新フラグを解除
    isUpdatingRef.value = false;
    isDragging.value = false;
    // エラー時は状態を再同期
    updateTodosByStatus();
  }
};

// タイマー開始
const startTiming = async (todo: Todo) => {
  console.log("タイマー開始リクエスト:", todo);

  // 既に計測中のタスクがある場合は停止
  if (currentTimingTodo.value && currentTimingTodo.value.id !== todo.id) {
    console.log("別のタスクが計測中なので停止します");
    await stopTiming(currentTimingTodo.value);
  }

  try {
    // タスクのis_timingフラグを更新
    const updatedTodo = {
      id: todo.id,
      is_timing: true,
    };

    await todoStore.updateTodo(updatedTodo);

    // タイマーを開始
    startTimerForTodo(todo);

    // 成功メッセージ
    useToast().add({
      title: "計測開始",
      description: `「${todo.title}」の計測を開始しました`,
      color: "blue",
    });
  } catch (error) {
    console.error("タイマー開始エラー:", error);
    useToast().add({
      title: "エラー",
      description: "タイマーの開始に失敗しました",
      color: "red",
    });
  }
};

// タイマーを開始する
const startTimerForTodo = (todo: Todo) => {
  console.log("タイマー開始:", todo);

  // 現在のタスクを設定
  currentTimingTodo.value = { ...todo }; // オブジェクトをコピーして参照を切る
  currentTotalTime.value = extractTotalTime(todo.total_time);

  // 開始時間を記録
  startTime.value = Date.now();

  // 既存のタイマーがあれば停止
  if (timerInterval.value) {
    console.log("既存のタイマーを停止");
    cancelAnimationFrame(timerInterval.value);
    timerInterval.value = null;
  }

  // 新しいタイマーを開始
  console.log("新しいタイマーを開始");

  const updateTimer = () => {
    if (!startTime.value || !currentTimingTodo.value) {
      console.log("タイマー条件が満たされないため停止");
      return;
    }

    // 経過時間を計算（ミリ秒から秒に変換）
    const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000);

    // 合計時間を更新
    const newTotalTime = extractTotalTime(todo.total_time) + elapsedSeconds;
    if (currentTotalTime.value !== newTotalTime) {
      currentTotalTime.value = newTotalTime;

      // todoリスト内の該当するタスクも更新する（表示を更新するため）
      updateTimingTodoInLists(
        currentTimingTodo.value.id,
        currentTotalTime.value
      );

      // デバッグ用
      if (elapsedSeconds % 5 === 0) {
        console.log("タイマー更新:", currentTotalTime.value);
      }

      // 1分ごとにバックグラウンドで保存
      if (elapsedSeconds % 60 === 0 && elapsedSeconds > 0) {
        updateTimerInBackground();
      }
    }

    // 次のフレームをリクエスト
    timerInterval.value = requestAnimationFrame(updateTimer);
  };

  // タイマー開始
  timerInterval.value = requestAnimationFrame(updateTimer);
  console.log("タイマー開始完了");
};

// todoリスト内の計測中のタスクを更新する
const updateTimingTodoInLists = (
  todoId: string,
  newTotalTime: number,
  isTimingValue = true
) => {
  // 各リスト内のタスクを検索して更新
  const updateInList = (list: Todo[]) => {
    const index = list.findIndex((t) => t.id === todoId);
    if (index !== -1) {
      // 新しいオブジェクトを作成して置き換え（リアクティブな更新のため）
      list[index] = {
        ...list[index],
        total_time: newTotalTime,
        is_timing: isTimingValue,
      };
    }
  };

  updateInList(todosByStatus.todo);
  updateInList(todosByStatus.inProgress);
  updateInList(todosByStatus.done);
};

// タイマー停止
const stopTiming = async (todo: Todo) => {
  console.log("タイマー停止リクエスト:", todo);

  // タイマーを停止して最終時間を取得
  stopTimer();

  try {
    // 更新するデータを準備
    const finalTime = currentTotalTime.value;
    console.log("タイマー停止処理: 更新するtodo:", todo.id, "時間:", finalTime);

    // タスクのis_timingフラグと合計時間を更新
    const updatedTodo = {
      id: todo.id,
      is_timing: false,
      total_time: [finalTime], // 配列として送信
    };

    // サーバーにデータを保存
    const result = await todoStore.updateTodo(updatedTodo);
    console.log("タイマー停止: サーバーへの保存完了", result);

    // todoリスト内のタスクも更新
    updateTimingTodoInLists(todo.id, finalTime, false);

    // 成功メッセージ
    useToast().add({
      title: "計測停止",
      description: `「${todo.title}」の計測を停止しました (${formatTime(finalTime)})`,
      color: "green",
    });

    // 現在計測中のタスクをクリア
    currentTimingTodo.value = null;

    // 最新のデータを再取得
    await todoStore.fetchTodos();
  } catch (error) {
    console.error("タイマー停止エラー:", error);
    useToast().add({
      title: "エラー",
      description: "タイマーの停止に失敗しました",
      color: "red",
    });
  }
};

// 現在計測中のタスクを停止
const stopCurrentTiming = () => {
  console.log("現在計測中のタスクを停止します");
  if (currentTimingTodo.value) {
    console.log("停止対象:", currentTimingTodo.value);
    stopTiming(currentTimingTodo.value);
  } else {
    console.warn("計測中のタスクがありません");
  }
};

// タイマーを停止する
const stopTimer = () => {
  console.log("タイマー停止処理開始");

  if (timerInterval.value) {
    console.log("アニメーションフレームをキャンセル:", timerInterval.value);
    cancelAnimationFrame(timerInterval.value);
    timerInterval.value = null;
  }

  // タイマーが動いていた場合は最終的な時間を保存
  if (currentTimingTodo.value && startTime.value) {
    const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000);
    console.log("経過時間:", elapsedSeconds, "秒");
    currentTotalTime.value =
      extractTotalTime(currentTimingTodo.value.total_time) + elapsedSeconds;
    startTime.value = null;
  }

  console.log("タイマー停止処理完了");
};

// バックグラウンドでタイマー情報を更新
const updateTimerInBackground = async () => {
  if (!currentTimingTodo.value) return;

  try {
    await todoStore.updateTodo({
      id: currentTimingTodo.value.id,
      total_time: [currentTotalTime.value], // 配列として送信
      is_timing: true,
    });
  } catch (error) {
    console.error("タイマー情報の更新に失敗:", error);
  }
};

// Todo削除関数
const deleteTodo = async (todoId: string) => {
  try {
    await todoStore.deleteTodo(todoId);
    useToast().add({
      title: "削除完了",
      description: "タスクを削除しました",
      color: "green",
    });
  } catch (error) {
    console.error("削除エラー:", error);
    useToast().add({
      title: "エラー",
      description: "タスクの削除に失敗しました",
      color: "red",
    });
  }
};

// ドラッグ開始時のハンドラ
const handleDragStart = () => {
  isDragging.value = true;
};

// ドラッグ終了時のハンドラ
const handleDragEnd = () => {
  // 少し遅延させてドラッグ終了を処理
  setTimeout(() => {
    isDragging.value = false;
  }, 50);
};

// total_timeから数値を抽出するヘルパー関数
const extractTotalTime = (time: number | number[] | undefined): number => {
  if (Array.isArray(time) && time.length > 0) {
    return time[0];
  }
  return typeof time === "number" ? time : 0;
};

// 時間入力の検証
const validateTimeInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // 時間形式（hh:mm:ss）の正規表現
  const timeRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;

  if (value && !timeRegex.test(value)) {
    // 形式が正しくない場合は警告を表示
    useToast().add({
      title: "入力エラー",
      description: "時間は hh:mm:ss 形式で入力してください",
      color: "yellow",
    });
  }
};

// 削除確認モーダルを開く
const confirmDeleteTodo = () => {
  if (editingTodo.value && editingTodo.value.id) {
    showDeleteConfirmModal.value = true;
  }
};

// 削除確認モーダルで削除を確認したときの処理
const deleteCurrentTodo = async () => {
  if (editingTodo.value && editingTodo.value.id) {
    try {
      await deleteTodo(editingTodo.value.id);
      // 削除後にモーダルを閉じる
      showDeleteConfirmModal.value = false;
      showEditModal.value = false;
    } catch (error) {
      console.error("タスク削除エラー:", error);
    }
  }
};
</script>
