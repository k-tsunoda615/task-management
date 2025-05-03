<template>
  <div>
    <!-- 現在計測中のタスク表示 -->
    <Transition name="slide">
      <div
        v-if="currentTimingTodo"
        class="mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div class="font-medium text-gray-900">
              {{ currentTimingTodo.title }}
            </div>
            <div class="text-sm text-blue-600 font-medium">
              {{ formatTime(currentTotalTime) }}
            </div>
          </div>
        </div>
        <UButton
          color="red"
          variant="soft"
          size="sm"
          @click="stopTiming(currentTimingTodo)"
          icon="i-heroicons-pause"
        >
          停止
        </UButton>
      </div>
    </Transition>

    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Task Board</h1>
      <UButton
        @click="openNewTaskModal"
        icon="i-heroicons-plus"
        color="primary"
        variant="soft"
      >
        新しいタスク
      </UButton>
    </div>

    <!-- サイドバーコンポーネントにイベントを追加 -->
    <TheSidebar @toggle-layout="toggleLayout" />

    <!-- PC表示: 上段：PriorityとNext Up（3:2の比率） -->
    <div class="hidden md:grid gap-4 mb-4" :class="getLayoutClass()">
      <!-- Priority -->
      <div :class="getPriorityClass()">
        <div
          class="rounded-lg bg-gray-50/50 border border-gray-100 p-4 h-full flex flex-col"
        >
          <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
            <UIcon name="i-heroicons-inbox" class="w-5 h-5 text-gray-500" />
            Priority
          </h2>
          <div class="flex-1 min-h-[300px]">
            <draggable
              v-model="todosByStatus.todo"
              :group="{ name: 'todos' }"
              item-key="id"
              class="h-full min-h-[inherit] space-y-3"
              data-status="todo"
              :animation="200"
              ghost-class="opacity-50"
              :class="{
                'border-2 border-dashed border-gray-200 rounded-lg p-4':
                  todosByStatus.todo.length === 0,
              }"
              @change="handleDragChange"
              @start="handleDragStart"
              @end="handleDragEnd"
            >
              <template #item="{ element }">
                <TodoCard
                  :todo="element"
                  :showTimerBar="showTimerBar"
                  :timerLoading="timerButtonLoading === element.id"
                  @edit="openEditModal"
                  @start-timing="startTiming"
                  @stop-timing="stopTiming"
                />
              </template>
              <template #footer>
                <div
                  v-if="todosByStatus.todo.length === 0"
                  class="text-gray-500 text-sm text-center"
                >
                  タスクがありません
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <!-- Next Up -->
      <div :class="getNextUpClass()">
        <div class="rounded-lg bg-blue-50/50 border border-blue-100 p-4 h-full">
          <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-500" />
            Next Up
          </h2>
          <draggable
            v-model="todosByStatus.inProgress"
            :group="{ name: 'todos' }"
            item-key="id"
            class="space-y-3"
            data-status="inProgress"
            :animation="200"
            ghost-class="opacity-50"
            @change="handleDragChange"
          >
            <template #item="{ element }">
              <TodoCard
                :todo="element"
                :showTimerBar="showTimerBar"
                :timerLoading="timerButtonLoading === element.id"
                @edit="openEditModal"
                @start-timing="startTiming"
                @stop-timing="stopTiming"
              />
            </template>
          </draggable>
          <div
            v-if="todosByStatus.inProgress.length === 0"
            class="text-gray-500 text-sm text-center mt-2"
          >
            タスクがありません
          </div>
        </div>
      </div>
    </div>

    <!-- モバイル表示: 1カラムレイアウト -->
    <div class="block md:hidden space-y-4">
      <!-- Priority -->
      <div class="rounded-lg bg-gray-50/50 border border-gray-100 p-4">
        <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
          <UIcon name="i-heroicons-inbox" class="w-5 h-5 text-gray-500" />
          Priority
        </h2>
        <draggable
          v-model="todosByStatus.todo"
          :group="{ name: 'todos' }"
          item-key="id"
          class="space-y-3"
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
              :timerLoading="timerButtonLoading === element.id"
              @edit="openEditModal"
              @start-timing="startTiming"
              @stop-timing="stopTiming"
            />
          </template>
        </draggable>
        <div
          v-if="todosByStatus.todo.length === 0"
          class="text-gray-500 text-sm text-center mt-2"
        >
          タスクがありません
        </div>
      </div>

      <!-- Next Up -->
      <div class="rounded-lg bg-blue-50/50 border border-blue-100 p-4">
        <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
          <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-500" />
          Next Up
        </h2>
        <draggable
          v-model="todosByStatus.inProgress"
          :group="{ name: 'todos' }"
          item-key="id"
          class="space-y-3"
          data-status="inProgress"
          :animation="200"
          ghost-class="opacity-50"
          @change="handleDragChange"
        >
          <template #item="{ element }">
            <TodoCard
              :todo="element"
              :showTimerBar="showTimerBar"
              :timerLoading="timerButtonLoading === element.id"
              @edit="openEditModal"
              @start-timing="startTiming"
              @stop-timing="stopTiming"
            />
          </template>
        </draggable>
        <div
          v-if="todosByStatus.inProgress.length === 0"
          class="text-gray-500 text-sm text-center mt-2"
        >
          タスクがありません
        </div>
      </div>
    </div>

    <!-- PC/モバイル共通: 下段：Archived -->
    <div class="rounded-lg bg-green-50/50 border border-green-100 p-4 mt-4">
      <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
        <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" />
        Archived
      </h2>
      <draggable
        v-model="todosByStatus.done"
        :group="{ name: 'todos' }"
        item-key="id"
        class="space-y-3"
        data-status="done"
        :animation="200"
        ghost-class="opacity-50"
        @change="handleDragChange"
      >
        <template #item="{ element }">
          <TodoCard
            :todo="element"
            :showTimerBar="showTimerBar"
            :timerLoading="timerButtonLoading === element.id"
            @edit="openEditModal"
            @start-timing="startTiming"
            @stop-timing="stopTiming"
          />
        </template>
      </draggable>
      <div
        v-if="todosByStatus.done.length === 0"
        class="text-gray-500 text-sm text-center mt-2"
      >
        タスクがありません
      </div>
    </div>

    <!-- 新規タスクモーダル -->
    <TaskCreateModal
      :show="showNewTaskModal"
      :newTodo="newTodo"
      :timeInput="timeInput"
      :tagStore="tagStore"
      :isCreating="isCreating"
      :newTagName="newTagName"
      @close="showNewTaskModal = false"
      @create="createTodo"
      @add-tag="addTag"
      @toggle-tag="toggleTagOnNewTodo"
      @validate-time="validateTimeInput"
      @update:newTodoTitle="(val) => (newTodo.title = val)"
      @update:newTodoMemo="(val) => (newTodo.memo = val)"
      @update:newTodoStatus="(val) => (newTodo.status = val)"
      @update:newTodoIsPrivate="(val) => (newTodo.is_private = val)"
      @update:timeInput="(val) => (timeInput = val)"
      @update:newTagName="(val) => (newTagName = val)"
    />

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
            <h3 class="text-lg font-medium text-gray-900">タスクを編集</h3>
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              size="sm"
              @click="confirmDeleteTodo"
              title="タスクを削除"
              class="hover:bg-red-50"
            />
          </div>
        </template>
        <form @submit.prevent="updateTodo" class="space-y-4">
          <UFormGroup label="タイトル">
            <UInput v-model="editingTodo.title" required />
          </UFormGroup>
          <UFormGroup label="メモ">
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
                variant="soft"
                @click="showPreviewModal = true"
                icon="i-heroicons-eye"
              >
                プレビュー
              </UButton>
            </div>
          </UFormGroup>
          <div class="flex gap-4">
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
          <UFormGroup label="合計時間 (hh:mm:ss)">
            <div class="flex items-center gap-2">
              <UInput
                v-model="editTimeInput"
                placeholder="00:00:00"
                @input="validateTimeInput"
                :disabled="editingTodo.is_timing"
              />
              <UTooltip
                v-if="editingTodo.is_timing"
                text="計測中は時間を編集できません"
              >
                <UIcon
                  name="i-heroicons-information-circle"
                  class="text-blue-500"
                />
              </UTooltip>
            </div>
          </UFormGroup>
          <UFormGroup label="タグ">
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in tagStore.tags"
                  :key="tag.id"
                  :style="{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color || '#3b82f6',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '0.75rem',
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0.75rem',
                    lineHeight: '1.25',
                    opacity: editingTodo.tags.some((t) => t.id === tag.id)
                      ? 1
                      : 0.5,
                    cursor: 'pointer',
                  }"
                  class="transition-all duration-200 hover:opacity-100"
                  @click="
                    () => {
                      if (editingTodo.tags.some((t) => t.id === tag.id)) {
                        editingTodo.tags = editingTodo.tags.filter(
                          (t) => t.id !== tag.id
                        );
                      } else {
                        editingTodo.tags.push(tag);
                      }
                    }
                  "
                >
                  {{ tag.name }}
                </UBadge>
              </div>
              <div class="flex gap-2">
                <UInput
                  v-model="newTagName"
                  placeholder="新しいタグ名"
                  size="sm"
                  class="flex-1"
                />
                <UButton
                  size="sm"
                  color="primary"
                  variant="soft"
                  @click="addTag"
                >
                  追加
                </UButton>
              </div>
            </div>
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
              <h3 class="text-lg font-medium text-gray-900">プレビュー</h3>
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

    <DeleteConfirmModal
      :show="showDeleteConfirmModal"
      :editingTodo="editingTodo"
      @close="showDeleteConfirmModal = false"
      @delete="deleteCurrentTodo"
    />
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "@/stores/todo";
import { useTagStore } from "@/stores/tag";
import draggable from "vuedraggable";
import { marked } from "marked";
import { useEventBus } from "@vueuse/core";
import type { Todo, Tag } from "@/types/todo";
import TheSidebar from "@/components/sidebar/TheSidebar.vue";
import TaskCreateModal from "../modals/TaskCreateModal.vue";
import DeleteConfirmModal from "../modals/DeleteConfirmModal.vue";
import {
  formatTime,
  parseTimeToSeconds,
  validateTimeInput as validateTimeInputUtil,
} from "@/utils/time";
import { darkenColor } from "@/utils/color";
import { useTaskTimer } from "@/composables/useTaskTimer";

const todoStore = useTodoStore();
const tagStore = useTagStore();
const showNewTaskModal = ref(false);
const showEditModal = ref(false);
const showPreviewModal = ref(false);
const showDeleteConfirmModal = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const trashEventBus = useEventBus("trash-drop");

// タイマー関連の状態
const {
  timerInterval,
  startTime,
  currentTotalTime,
  startTimerForTodo,
  stopTimer,
  extractTotalTime,
} = useTaskTimer();
const showTimerBar = ref(true);
const currentTimingTodo = ref<Todo | null>(null);

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
  is_private: false,
  total_time: 0,
  is_timing: false,
  tags: [] as { id: string; name: string; color?: string }[],
});

const editingTodo = ref({
  id: "",
  title: "",
  memo: "",
  status: "未対応",
  is_private: false,
  total_time: 0,
  is_timing: false,
  tags: [] as { id: string; name: string; color?: string }[],
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

// ボタンのローディング状態を管理
const timerButtonLoading = ref<string | null>(null);

// タグ追加用
const newTagName = ref("");
const addTag = async () => {
  const name = newTagName.value.trim();
  if (!name) return;
  // 既存タグに同名があれば追加しない
  if (tagStore.tags.some((t: Tag) => t.name === name)) {
    newTagName.value = "";
    return;
  }
  // Supabaseに追加
  const { data, error } = await tagStore.createTag({ name });
  if (!error && data) {
    newTagName.value = "";
  }
};

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

  // レイアウトを読み込む
  // const savedLayout = localStorage.getItem("todoLayout") as LayoutType;
  // if (savedLayout) {
  //   currentLayout.value = savedLayout;
  // }
});

// 編集モーダルを開く
const openEditModal = (todo: Todo) => {
  editingTodo.value = {
    id: todo.id,
    title: todo.title,
    status: todo.status,
    memo: todo.memo || "",
    is_private: todo.is_private || false,
    total_time: extractTotalTime(todo.total_time),
    is_timing: todo.is_timing || false,
    tags: todo.tags ? [...todo.tags] : [],
  };
  editTimeInput.value = formatTime(extractTotalTime(todo.total_time));
  showEditModal.value = true;
};

// 新規Todo作成
const createTodo = async () => {
  if (!newTodo.value.title) return;
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
  const totalTimeSeconds = parseTimeToSeconds(timeInput.value);
  isCreating.value = true;
  try {
    await todoStore.createTodo({
      title: newTodo.value.title,
      memo: newTodo.value.memo,
      status: newTodo.value.status,
      is_private: newTodo.value.is_private,
      sort_order: minSortOrder,
      total_time: [totalTimeSeconds],
      is_timing: false,
      tags: newTodo.value.tags,
    });
    showNewTaskModal.value = false;
    newTodo.value = {
      title: "",
      memo: "",
      status: "未対応",
      is_private: false,
      total_time: 0,
      is_timing: false,
      tags: [],
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
  let totalTimeSeconds = editingTodo.value.is_timing
    ? currentTotalTime.value
    : parseTimeToSeconds(editTimeInput.value);
  const updateData: Partial<Todo> = {
    ...editingTodo.value,
    total_time: [totalTimeSeconds],
    tags: editingTodo.value.tags,
  };
  isUpdating.value = true;
  try {
    await todoStore.updateTodo(updateData);
    showEditModal.value = false;
    useToast().add({
      title: "更新完了",
      description: "タスクを更新しました",
      color: "green",
    });
  } catch (error) {
    console.error("Todo更新エラー:", error);
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
    await todoStore.updateTodo({
      id: todo.id,
      title: todo.title,
      memo: todo.memo,
      status: mappedStatus,
      sort_order: currentSortOrder,
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

    await Promise.all(updatePromises);

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

// タイミング開始
const startTiming = async (todo: Todo) => {
  // 既に計測中のタスクがある場合は停止
  if (currentTimingTodo.value && currentTimingTodo.value.id !== todo.id) {
    console.log("別のタスクが計測中なので停止します");
    await stopTiming(currentTimingTodo.value);
  }

  // 即座にUI更新
  currentTimingTodo.value = { ...todo };
  currentTotalTime.value = extractTotalTime(todo.total_time);
  startTime.value = Date.now();

  try {
    // バックグラウンドで更新
    await todoStore.updateTodo({
      id: todo.id,
      is_timing: true,
      total_time: [currentTotalTime.value],
    });

    // タイマーを開始
    startTimerForTodo(todo);

    // 成功メッセージ
    useToast().add({
      title: "計測開始",
      description: `「${todo.title}」の計測を開始しました`,
      color: "blue",
    });
  } catch (error) {
    // エラー時は状態を元に戻す
    currentTimingTodo.value = null;
    currentTotalTime.value = 0;
    startTime.value = null;

    useToast().add({
      title: "エラー",
      description: "タイマーの開始に失敗しました",
      color: "red",
    });
  }
};

// タイミング停止
const stopTiming = async (todo: Todo) => {
  // 現在の時間を保存
  const finalTime = currentTotalTime.value;

  // 即座にUI更新
  stopTimer();
  const prevTodo = currentTimingTodo.value;
  currentTimingTodo.value = null;

  try {
    // バックグラウンドで更新
    await todoStore.updateTodo({
      id: todo.id,
      is_timing: false,
      total_time: [finalTime],
    });

    useToast().add({
      title: "計測停止",
      description: `「${todo.title}」の計測を停止しました (${formatTime(finalTime)})`,
      color: "green",
    });
  } catch (error) {
    // エラー時は状態を元に戻す
    currentTimingTodo.value = prevTodo;
    startTimerForTodo(todo);

    useToast().add({
      title: "エラー",
      description: "タイマーの停止に失敗しました",
      color: "red",
    });
  }
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

// 時間入力の検証
const validateTimeInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  if (value && !validateTimeInputUtil(value)) {
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

// レイアウトに関する関数
const getLayoutClass = () => {
  switch (currentLayout.value) {
    case "4-1":
      return "grid-cols-5";
    case "3-2":
      return "grid-cols-5";
    case "1-1":
      return "grid-cols-2";
    case "1-col":
      return "flex flex-col";
    default:
      return "grid-cols-5";
  }
};

const getPriorityClass = () => {
  switch (currentLayout.value) {
    case "4-1":
      return "col-span-4";
    case "3-2":
      return "col-span-3";
    case "1-1":
      return "col-span-1";
    case "1-col":
      return "w-full mb-4";
    default:
      return "col-span-3";
  }
};

const getNextUpClass = () => {
  switch (currentLayout.value) {
    case "4-1":
      return "col-span-1";
    case "3-2":
      return "col-span-2";
    case "1-1":
      return "col-span-1";
    case "1-col":
      return "w-full";
    default:
      return "col-span-2";
  }
};

const getLayoutTooltip = () => {
  const labels = {
    "4-1": "レイアウト: 4:1",
    "3-2": "レイアウト: 3:2",
    "1-1": "レイアウト: 1:1",
    "1-col": "レイアウト: 1列",
  };
  return labels[currentLayout.value];
};

type LayoutType = "4-1" | "3-2" | "1-1" | "1-col";

// レイアウト状態の管理
const currentLayout = ref<LayoutType>("3-2");

// レイアウトを切り替える
const toggleLayout = () => {
  const layouts: LayoutType[] = ["4-1", "3-2", "1-1", "1-col"];
  const currentIndex = layouts.indexOf(currentLayout.value);
  const nextIndex = (currentIndex + 1) % layouts.length;
  currentLayout.value = layouts[nextIndex];
  // ローカルストレージに保存
  localStorage.setItem("todoLayout", currentLayout.value);
};

// 色を暗くするユーティリティ関数
function darkenColor(hex: string, amount = 0.2) {
  // hex: #RRGGBB
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

// タグのON/OFF切り替え用関数を追加
const toggleTagOnNewTodo = (tag: Tag) => {
  const idx = newTodo.value.tags.findIndex((t: Tag) => t.id === tag.id);
  if (idx !== -1) {
    newTodo.value.tags = newTodo.value.tags.filter((t: Tag) => t.id !== tag.id);
  } else {
    newTodo.value.tags.push(tag);
  }
};
</script>

<style scoped>
/* スライドアニメーション */
.slide-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
  opacity: 1;
  margin-bottom: 1.5rem;
}

.slide-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
  overflow: hidden;
}
</style>
