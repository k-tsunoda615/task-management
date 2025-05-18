<template>
  <div>
    <!-- 現在計測中のタスク表示 -->
    <Transition name="slide">
      <div
        v-if="currentTimingTodo && showTimerBar"
        class="mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div class="flex flex-col md:flex-row items-center gap-3">
          <!-- アナログ時計風タイマー -->
          <AnalogTimer :seconds="currentTotalTime" :size="240" />
          <div>
            <div class="font-medium text-gray-900">
              {{ currentTimingTodo.title }}
            </div>
          </div>
        </div>
        <UButton
          color="green"
          variant="solid"
          size="sm"
          @click="stopTiming(currentTimingTodo)"
          icon="i-heroicons-pause"
        >
          停止
        </UButton>
      </div>
    </Transition>

    <!-- <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Task Board</h1>
    </div> -->
    <!-- 検索ボックスとタグプルダウンを横並びで配置 -->
    <div
      class="mb-4 flex flex-col md:flex-row items-end md:items-center justify-end gap-2"
    >
      <UInput
        v-model="searchQuery"
        placeholder="タスクを検索... (タイトル・メモ)"
        class="w-full md:max-w-md"
        clearable
      />
      <USelect
        v-model="selectedTagId"
        :options="tagOptions"
        placeholder="タグで絞り込み"
        class="w-full md:w-48"
        clearable
      />
    </div>

    <!-- サイドバーコンポーネントにイベントを追加 -->
    <TheSidebar
      @toggle-layout="toggleLayout"
      @open-new-task-modal="openNewTaskModal"
    />

    <!-- PC表示: 上段：PriorityとNext Up（3:2の比率） -->
    <div class="hidden md:grid gap-4 mb-4" :class="getLayoutClass()">
      <!-- Priority -->
      <div :class="getPriorityClass()">
        <div
          class="rounded-lg p-4 h-full flex flex-col"
          :class="{
            [STATUS_COLORS[TASK_STATUS.PRIORITY].bg]: true,
            [STATUS_COLORS[TASK_STATUS.PRIORITY].border]: true,
          }"
        >
          <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
            <UIcon
              :name="STATUS_COLORS[TASK_STATUS.PRIORITY].iconName"
              class="w-5 h-5"
              :class="STATUS_COLORS[TASK_STATUS.PRIORITY].icon"
            />
            {{ TASK_STATUS_LABELS[TASK_STATUS.PRIORITY] }}
          </h2>
          <div class="flex-1 min-h-[300px]">
            <draggable
              v-model="todosByStatus[TASK_STATUS.PRIORITY]"
              :group="{ name: 'todos', pull: true, put: true }"
              item-key="id"
              class="h-full min-h-[inherit] space-y-3"
              data-status="priority"
              :animation="200"
              ghost-class="ghost-card"
              drag-class="drag-item"
              chosen-class="chosen-item"
              :key="'priority-container'"
              :class="{
                'border-2 border-dashed border-gray-200 rounded-lg p-4':
                  todosByStatus[TASK_STATUS.PRIORITY].length === 0,
              }"
              @change="handleDragChange"
              @start="handleDragStart"
              @end="handleDragEnd"
            >
              <template #item="{ element }">
                <TodoCard
                  :todo="element"
                  :showTimerBar="showTimerBar"
                  :showTagBar="showTagBar"
                  :timerLoading="timerButtonLoading === element.id"
                  @edit="openEditModal"
                  @start-timing="startTiming"
                  @stop-timing="stopTiming"
                />
              </template>
              <template #footer>
                <div
                  v-if="todosByStatus[TASK_STATUS.PRIORITY].length === 0"
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
        <div
          class="rounded-lg p-4 h-full"
          :class="{
            [STATUS_COLORS[TASK_STATUS.NEXT].bg]: true,
            [STATUS_COLORS[TASK_STATUS.NEXT].border]: true,
          }"
        >
          <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
            <UIcon
              :name="STATUS_COLORS[TASK_STATUS.NEXT].iconName"
              class="w-5 h-5"
              :class="STATUS_COLORS[TASK_STATUS.NEXT].icon"
            />
            {{ TASK_STATUS_LABELS[TASK_STATUS.NEXT] }}
          </h2>
          <draggable
            v-model="todosByStatus[TASK_STATUS.NEXT]"
            :group="{ name: 'todos', pull: true, put: true }"
            item-key="id"
            class="space-y-3"
            data-status="next"
            :animation="200"
            ghost-class="ghost-card"
            drag-class="drag-item"
            chosen-class="chosen-item"
            :key="'next-container'"
            @change="handleDragChange"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template #item="{ element }">
              <TodoCard
                :todo="element"
                :showTimerBar="showTimerBar"
                :showTagBar="showTagBar"
                :timerLoading="timerButtonLoading === element.id"
                @edit="openEditModal"
                @start-timing="startTiming"
                @stop-timing="stopTiming"
              />
            </template>
          </draggable>
          <div
            v-if="todosByStatus[TASK_STATUS.NEXT].length === 0"
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
      <div
        class="rounded-lg p-4"
        :class="{
          [STATUS_COLORS[TASK_STATUS.PRIORITY].bg]: true,
          [STATUS_COLORS[TASK_STATUS.PRIORITY].border]: true,
        }"
      >
        <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
          <UIcon
            :name="STATUS_COLORS[TASK_STATUS.PRIORITY].iconName"
            class="w-5 h-5"
            :class="STATUS_COLORS[TASK_STATUS.PRIORITY].icon"
          />
          {{ TASK_STATUS_LABELS[TASK_STATUS.PRIORITY] }}
        </h2>
        <draggable
          v-model="todosByStatus[TASK_STATUS.PRIORITY]"
          :group="{ name: 'todos', pull: true, put: true }"
          item-key="id"
          class="space-y-3"
          data-status="priority"
          :animation="200"
          ghost-class="ghost-card"
          drag-class="drag-item"
          chosen-class="chosen-item"
          :key="'priority-container'"
          @change="handleDragChange"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <TodoCard
              :todo="element"
              :showTimerBar="showTimerBar"
              :showTagBar="showTagBar"
              :timerLoading="timerButtonLoading === element.id"
              @edit="openEditModal"
              @start-timing="startTiming"
              @stop-timing="stopTiming"
            />
          </template>
        </draggable>
        <div
          v-if="todosByStatus[TASK_STATUS.PRIORITY].length === 0"
          class="text-gray-500 text-sm text-center mt-2"
        >
          タスクがありません
        </div>
      </div>

      <!-- Next Up -->
      <div
        class="rounded-lg p-4"
        :class="{
          [STATUS_COLORS[TASK_STATUS.NEXT].bg]: true,
          [STATUS_COLORS[TASK_STATUS.NEXT].border]: true,
        }"
      >
        <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
          <UIcon
            :name="STATUS_COLORS[TASK_STATUS.NEXT].iconName"
            class="w-5 h-5"
            :class="STATUS_COLORS[TASK_STATUS.NEXT].icon"
          />
          {{ TASK_STATUS_LABELS[TASK_STATUS.NEXT] }}
        </h2>
        <draggable
          v-model="todosByStatus[TASK_STATUS.NEXT]"
          :group="{ name: 'todos', pull: true, put: true }"
          item-key="id"
          class="space-y-3"
          data-status="next"
          :animation="200"
          ghost-class="ghost-card"
          drag-class="drag-item"
          chosen-class="chosen-item"
          :key="'next-container'"
          @change="handleDragChange"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <TodoCard
              :todo="element"
              :showTimerBar="showTimerBar"
              :showTagBar="showTagBar"
              :timerLoading="timerButtonLoading === element.id"
              @edit="openEditModal"
              @start-timing="startTiming"
              @stop-timing="stopTiming"
            />
          </template>
        </draggable>
        <div
          v-if="todosByStatus[TASK_STATUS.NEXT].length === 0"
          class="text-gray-500 text-sm text-center mt-2"
        >
          タスクがありません
        </div>
      </div>
    </div>

    <!-- PC/モバイル共通: 下段：Archived -->
    <div
      class="rounded-lg p-4 mt-4"
      :class="{
        [STATUS_COLORS[TASK_STATUS.ARCHIVED].bg]: true,
        [STATUS_COLORS[TASK_STATUS.ARCHIVED].border]: true,
      }"
    >
      <h2 class="mb-4 font-medium text-gray-900 flex items-center gap-2">
        <UIcon
          :name="STATUS_COLORS[TASK_STATUS.ARCHIVED].iconName"
          class="w-5 h-5"
          :class="STATUS_COLORS[TASK_STATUS.ARCHIVED].icon"
        />
        {{ TASK_STATUS_LABELS[TASK_STATUS.ARCHIVED] }}
      </h2>
      <draggable
        v-model="todosByStatus[TASK_STATUS.ARCHIVED]"
        :group="{ name: 'todos', pull: true, put: true }"
        item-key="id"
        class="space-y-3"
        data-status="archived"
        :animation="200"
        ghost-class="ghost-card"
        drag-class="drag-item"
        chosen-class="chosen-item"
        :key="'archived-container'"
        @change="handleDragChange"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <TodoCard
            :todo="element"
            :showTimerBar="showTimerBar"
            :showTagBar="showTagBar"
            :timerLoading="timerButtonLoading === element.id"
            @edit="openEditModal"
            @start-timing="startTiming"
            @stop-timing="stopTiming"
          />
        </template>
      </draggable>
      <div
        v-if="todosByStatus[TASK_STATUS.ARCHIVED].length === 0"
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
              <USelect v-model="editingTodo.status" :options="statusOptions" />
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

    <div
      :class="[
        'fixed bottom-6 right-4 z-50 md:hidden',
        isMobile ? 'block' : 'hidden',
      ]"
    >
      <UButton
        color="primary"
        variant="solid"
        size="lg"
        class="rounded-full shadow"
        @click="openNewTaskModal"
      >
        <UIcon name="i-heroicons-plus-circle" class="w-8 h-8" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../../stores/todo";
import { useTagStore } from "../../stores/tag";
import draggable from "vuedraggable";
import { marked } from "marked";
import { useEventBus } from "@vueuse/core";
import type { Todo, Tag } from "../../types/todo";
import TheSidebar from "../common/Sidebar.vue";
import TaskCreateModal from "../modals/TaskCreateModal.vue";
import DeleteConfirmModal from "../modals/DeleteConfirmModal.vue";
import TodoCard from "../kanban/TodoCard.vue";
import { validateTimeInput as validateTimeInputUtil } from "../../utils/time";
import { useTaskTimer } from "../../composables/useTaskTimer";
import {
  TASK_STATUS,
  STATUS_COLORS,
  STATUS_ORDER,
  TASK_STATUS_LABELS,
} from "../../utils/constants";
import type { TaskStatus } from "../../utils/constants";
import { ref, onMounted, onUnmounted } from "vue";
import { useTodoSearch } from "../../composables/useTodoSearch";
// アナリティクス用のユーティリティをインポート
import {
  trackTimerStarted,
  trackTimerStopped,
  trackTaskStatusChanged,
  trackTaskCreated,
  trackTaskUpdated,
  trackTaskDeleted,
  trackLayoutChanged,
  trackSearch,
  trackTagFiltered,
} from "../../utils/analytics";
import AnalogTimer from "./AnalogTimer.vue";

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
const showTagBar = ref(true);
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

interface NewTodo {
  title: string;
  memo: string;
  status: TaskStatus;
  is_private: boolean;
  total_time: number;
  is_timing: boolean;
  tags: Tag[];
}

interface EditingTodo {
  id: string;
  title: string;
  memo: string;
  status: TaskStatus;
  is_private: boolean;
  total_time: number;
  is_timing: boolean;
  tags: Tag[];
}

const newTodo = ref<NewTodo>({
  title: "",
  memo: "",
  status: TASK_STATUS.PRIORITY,
  is_private: false,
  total_time: 0,
  is_timing: false,
  tags: [] as Tag[],
});

const editingTodo = ref<EditingTodo>({
  id: "",
  title: "",
  memo: "",
  status: TASK_STATUS.PRIORITY,
  is_private: false,
  total_time: 0,
  is_timing: false,
  tags: [] as Tag[],
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

// ステータス別のTodoを管理するreactiveな状態（新構造）
const todosByStatus = reactive({
  [TASK_STATUS.PRIORITY]: [] as Todo[],
  [TASK_STATUS.NEXT]: [] as Todo[],
  [TASK_STATUS.ARCHIVED]: [] as Todo[],
} as Record<TaskStatus, Todo[]>);

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

const searchQuery = ref("");
const selectedTagId = ref<string>("");

// タグ選択肢を生成
const tagOptions = computed(() => [
  { value: "", label: "すべてのタグ" },
  ...tagStore.tags.map((tag) => ({ value: tag.id, label: tag.name })),
]);

const { searchedTodos } = useTodoSearch(
  computed(() => todoStore.todosByVisibility),
  searchQuery,
  computed(() => selectedTagId.value || null)
);

// updateTodosByStatusを検索結果で分類するよう修正
const updateTodosByStatus = () => {
  // ドラッグ中は再分類をスキップ
  if (isDragging.value) return;
  // 一旦クリア
  todosByStatus[TASK_STATUS.PRIORITY] = [];
  todosByStatus[TASK_STATUS.NEXT] = [];
  todosByStatus[TASK_STATUS.ARCHIVED] = [];
  // 検索結果で再分類
  searchedTodos.value.forEach((todo: Todo) => {
    if (todo.status === TASK_STATUS.PRIORITY) {
      todosByStatus[TASK_STATUS.PRIORITY].push(todo);
    } else if (todo.status === TASK_STATUS.NEXT) {
      todosByStatus[TASK_STATUS.NEXT].push(todo);
    } else if (todo.status === TASK_STATUS.ARCHIVED) {
      todosByStatus[TASK_STATUS.ARCHIVED].push(todo);
    } else {
      todosByStatus[TASK_STATUS.PRIORITY].push(todo);
    }
  });
  // 各リストをsort_orderでソート
  todosByStatus[TASK_STATUS.PRIORITY].sort(
    (a: Todo, b: Todo) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  todosByStatus[TASK_STATUS.NEXT].sort(
    (a: Todo, b: Todo) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  todosByStatus[TASK_STATUS.ARCHIVED].sort(
    (a: Todo, b: Todo) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  // 計測中のタスクを確認
  const timingTodo = searchedTodos.value.find((todo: Todo) => todo.is_timing);
  if (timingTodo) {
    currentTimingTodo.value = timingTodo;
    if (!timerInterval.value) {
      startTimerForTodo(timingTodo, () => {});
    }
  } else if (currentTimingTodo.value && !timingTodo) {
    stopTimer(currentTimingTodo.value);
    currentTimingTodo.value = null;
  }
};

// 検索クエリが変わったら再分類
watch(
  () => [searchedTodos.value, todoStore.taskFilter],
  () => {
    if (isUpdatingRef.value) return;
    updateTodosByStatus();
    // 計測中のタスクを確認
    const timingTodo = searchedTodos.value.find((todo: Todo) => todo.is_timing);
    if (timingTodo) {
      currentTimingTodo.value = timingTodo;
      currentTotalTime.value = extractTotalTime(timingTodo.total_time);
      if (!timerInterval.value) {
        startTimerForTodo(timingTodo, () => {});
      }
    }
  },
  { deep: true }
);

const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.matchMedia("(max-width: 767px)").matches;
};
checkMobile();
window.addEventListener("resize", checkMobile);
onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
defineExpose({ isMobile });

// コンポーネントがマウントされたときの処理
onMounted(() => {
  // タイマー表示切り替えイベントを監視する関数を定義
  const handleTimerVisibilityToggle = (event: any) => {
    showTimerBar.value = event.detail.showTimer;
  };

  // タグ表示切り替えイベントを監視する関数を定義
  const handleTagVisibilityToggle = (event: any) => {
    showTagBar.value = event.detail.showTagBar;
  };

  // イベントリスナーを追加
  window.addEventListener("timerVisibilityToggle", handleTimerVisibilityToggle);
  window.addEventListener("tagVisibilityToggle", handleTagVisibilityToggle);

  // コンポーネントがアンマウントされたときにイベントリスナーを削除
  onUnmounted(() => {
    window.removeEventListener(
      "timerVisibilityToggle",
      handleTimerVisibilityToggle
    );
    window.removeEventListener(
      "tagVisibilityToggle",
      handleTagVisibilityToggle
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

  // 初期タグ表示状態を設定
  const savedTagBarState = localStorage.getItem("showTagBar");
  if (savedTagBarState !== null) {
    showTagBar.value = savedTagBarState === "true";
  }

  // 初期データの取得
  const fetchInitialData = async () => {
    try {
      await todoStore.fetchTodos();
      await tagStore.fetchTags();

      // サンプルデータの初期化はメインページで行うため、ここでは行わない
      // 重複呼び出しを防止するため削除
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
  editingTodo.value = {
    id: todo.id,
    title: todo.title,
    status: todo.status,
    memo: todo.memo || "",
    is_private: todo.is_private || false,
    total_time: extractTotalTime(todo.total_time),
    is_timing: todo.is_timing || false,
    tags: todo.tags || [],
  };
  editTimeInput.value = formatTime(editingTodo.value.total_time);
  showEditModal.value = true;
};

// 新規Todo作成
const createTodo = async () => {
  if (!newTodo.value.title) return;
  let minSortOrder = 0;

  // 修正: statusMapを使わず、直接TASK_STATUSを使用する
  const currentStatus = newTodo.value.status as TaskStatus;

  // todosByStatus[currentStatus]が存在するかチェック
  if (todosByStatus[currentStatus] && todosByStatus[currentStatus].length > 0) {
    minSortOrder =
      Math.min(
        ...todosByStatus[currentStatus].map((t: Todo) => t.sort_order || 0)
      ) - 100;
  }

  const totalTimeSeconds = parseTimeToSeconds(timeInput.value);
  isCreating.value = true;
  try {
    const newTaskData = {
      title: newTodo.value.title,
      memo: newTodo.value.memo,
      status: newTodo.value.status,
      is_private: newTodo.value.is_private,
      sort_order: minSortOrder,
      total_time: [totalTimeSeconds],
      is_timing: false,
      tags: newTodo.value.tags,
    };

    const result = await todoStore.createTodo(newTaskData);

    // アナリティクスイベント送信
    if (result && result.id) {
      trackTaskCreated(
        result.id,
        newTaskData.status,
        newTaskData.tags.length > 0,
        newTaskData.is_private
      );
    }

    showNewTaskModal.value = false;
    newTodo.value = {
      title: "",
      memo: "",
      status: TASK_STATUS.PRIORITY,
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

    // アナリティクスイベント送信
    trackTaskUpdated(updateData.id!, updateData.status!);

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

// ドラッグ&ドロップ時の処理を更新
const handleDragChange = async (evt: any) => {
  console.log("ドラッグイベント:", evt); // デバッグ用

  // ドラッグを正しく処理するためのフラグをセット
  isDragging.value = true;

  // ドラッグ&ドロップの種類を特定
  const dragType = evt.added ? "added" : evt.moved ? "moved" : null;
  if (!dragType) {
    isDragging.value = false;
    return;
  }

  const todo = evt[dragType].element;
  const newIndex = evt[dragType].newIndex;
  const oldStatus = todo.status; // 移動前のステータスを保存

  // 移動先のリストを特定
  let newStatus: TaskStatus = TASK_STATUS.PRIORITY; // デフォルト値
  let targetList: Todo[] = [];

  try {
    // 複数の方法を組み合わせてステータスを特定する
    if (evt.added) {
      // 異なるリストへの移動の場合

      // 方法1: コンポーネント階層からステータスを特定
      const toComponent = evt.to?.__vueParentComponent?.parent;
      if (toComponent) {
        const containerName = toComponent.vnode?.key || "";

        // コンテナ名からステータスを特定
        if (containerName.includes("priority")) {
          newStatus = TASK_STATUS.PRIORITY;
        } else if (containerName.includes("next")) {
          newStatus = TASK_STATUS.NEXT;
        } else if (containerName.includes("archived")) {
          newStatus = TASK_STATUS.ARCHIVED;
        }
      }

      // 方法2: data-status属性からステータスを特定 (フォールバック)
      if (newStatus === TASK_STATUS.PRIORITY && evt.to) {
        const dataStatus = evt.to.getAttribute("data-status");
        if (dataStatus === "priority") {
          newStatus = TASK_STATUS.PRIORITY;
        } else if (dataStatus === "next") {
          newStatus = TASK_STATUS.NEXT;
        } else if (dataStatus === "archived") {
          newStatus = TASK_STATUS.ARCHIVED;
        }
      }

      // 方法3: リスト内のアイテム位置からステータスを特定 (さらなるフォールバック)
      if (newStatus === TASK_STATUS.PRIORITY) {
        if (todosByStatus[TASK_STATUS.PRIORITY].find((t) => t.id === todo.id)) {
          newStatus = TASK_STATUS.PRIORITY;
        } else if (
          todosByStatus[TASK_STATUS.NEXT].find((t) => t.id === todo.id)
        ) {
          newStatus = TASK_STATUS.NEXT;
        } else if (
          todosByStatus[TASK_STATUS.ARCHIVED].find((t) => t.id === todo.id)
        ) {
          newStatus = TASK_STATUS.ARCHIVED;
        }
      }

      console.log(`ステータス変更: ${todo.status} -> ${newStatus}`);

      // 常にステータスを更新
      todo.status = newStatus;
      targetList = todosByStatus[newStatus];
    } else if (evt.moved) {
      // 同じリスト内の移動の場合は現在のステータスを使用
      newStatus = todo.status;
      targetList = todosByStatus[newStatus];
    }

    console.log(
      "新しいステータス:",
      newStatus,
      "ターゲットリスト:",
      targetList
    );

    if (!todo || !targetList) {
      console.error("必要な情報が見つかりません", {
        todo,
        newStatus,
        targetList,
        evt,
      });
      isDragging.value = false;
      return;
    }

    // 更新中フラグをセット
    isUpdatingRef.value = true;

    // 現在のUIの順序を保持するためにディープコピーを作成
    const originalState = {
      [TASK_STATUS.PRIORITY]: [...todosByStatus[TASK_STATUS.PRIORITY]],
      [TASK_STATUS.NEXT]: [...todosByStatus[TASK_STATUS.NEXT]],
      [TASK_STATUS.ARCHIVED]: [...todosByStatus[TASK_STATUS.ARCHIVED]],
    };

    // sort_orderを再計算（直接リストの順序を使用）
    const updatedTodos = targetList.map((t: Todo, index: number) => {
      return {
        ...t,
        sort_order: index * 100, // 大きな間隔で設定（0, 100, 200, ...）
      };
    });

    // 現在のTodoの順序を設定
    const currentSortOrder =
      updatedTodos.find((t: Todo) => t.id === todo.id)?.sort_order || 0;
    todo.sort_order = currentSortOrder;

    // バックグラウンドで更新処理を実行
    try {
      // 変更されたTodoのステータスと順序を更新
      const updateData = {
        id: todo.id,
        status: todo.status,
        sort_order: currentSortOrder,
      };

      console.log("Todoを更新:", updateData);

      // ステータスが変更された場合はイベントを送信
      if (oldStatus !== newStatus) {
        trackTaskStatusChanged(todo.id, oldStatus, newStatus);
      }

      // 確実にステータスが更新されるようにする
      await todoStore.updateTodo(updateData);

      // 他のTodoの順序を一括更新
      console.log(`${updatedTodos.length - 1}個のTodoの順序を更新`);

      const otherTodos = updatedTodos.filter((t: Todo) => t.id !== todo.id);

      if (otherTodos.length > 0) {
        const updatePromises = otherTodos.map((t: Todo) =>
          todoStore.updateTodoOrder({
            id: t.id,
            sort_order: t.sort_order ?? 0,
          })
        );

        await Promise.all(updatePromises);
      }

      // 更新の成功メッセージ
      useToast().add({
        title: "更新完了",
        description: "タスクを移動しました",
        color: "green",
      });

      // すぐにドラッグフラグを解除（保存は成功したため）
      isDragging.value = false;

      // 少し時間を空けてから更新フラグを解除
      setTimeout(() => {
        // fetchTodosをスキップしてローカルの状態を優先
        isUpdatingRef.value = false;
      }, 300);
    } catch (error) {
      console.error("Todo更新エラー:", error);

      // エラー時は元の状態に戻す
      todosByStatus[TASK_STATUS.PRIORITY] = originalState[TASK_STATUS.PRIORITY];
      todosByStatus[TASK_STATUS.NEXT] = originalState[TASK_STATUS.NEXT];
      todosByStatus[TASK_STATUS.ARCHIVED] = originalState[TASK_STATUS.ARCHIVED];

      useToast().add({
        title: "エラー",
        description: "タスクの移動に失敗しました",
        color: "red",
      });

      // フラグを解除
      isUpdatingRef.value = false;
      isDragging.value = false;
    }
  } catch (error) {
    console.error("ドラッグ処理エラー:", error);
    useToast().add({
      title: "エラー",
      description: "タスクの移動処理に失敗しました",
      color: "red",
    });
    // 更新フラグを解除
    isUpdatingRef.value = false;
    isDragging.value = false;
  }
};

// コンテナからステータスを抽出するヘルパー関数
const extractStatusFromContainer = (container: any): TaskStatus => {
  // コンテナのクラスやデータ属性などから判断
  if (!container) return TASK_STATUS.PRIORITY;

  const dataStatus = container.getAttribute?.("data-status");
  if (dataStatus === "priority") return TASK_STATUS.PRIORITY;
  if (dataStatus === "next") return TASK_STATUS.NEXT;
  if (dataStatus === "archived") return TASK_STATUS.ARCHIVED;

  // その他のプロパティからの判断
  const classList = container.classList || [];
  const classString = Array.from(classList).join(" ");

  if (classString.includes("priority")) return TASK_STATUS.PRIORITY;
  if (classString.includes("next")) return TASK_STATUS.NEXT;
  if (classString.includes("archived")) return TASK_STATUS.ARCHIVED;

  // デフォルト値
  return TASK_STATUS.PRIORITY;
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
    startTimerForTodo(todo, () => {});

    // アナリティクスイベント送信
    trackTimerStarted(todo.id, todo.title);

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
  stopTimer(todo);
  const prevTodo = currentTimingTodo.value;
  currentTimingTodo.value = null;

  try {
    // バックグラウンドで更新
    await todoStore.updateTodo({
      id: todo.id,
      is_timing: false,
      total_time: [finalTime],
    });

    // アナリティクスイベント送信
    trackTimerStopped(todo.id, todo.title, finalTime);

    useToast().add({
      title: "計測停止",
      description: `「${todo.title}」の計測を停止しました (${formatTime(finalTime)})`,
      color: "green",
    });
  } catch (error) {
    // エラー時は状態を元に戻す
    currentTimingTodo.value = prevTodo;
    startTimerForTodo(todo, () => {});

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

  updateInList(todosByStatus[TASK_STATUS.PRIORITY]);
  updateInList(todosByStatus[TASK_STATUS.NEXT]);
  updateInList(todosByStatus[TASK_STATUS.ARCHIVED]);
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

    // アナリティクスイベント送信
    trackTaskDeleted(todoId);

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

  // アナリティクスイベント送信
  trackLayoutChanged(currentLayout.value);

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

// ステータス選択肢のコンピューティッドプロパティを追加
const statusOptions = computed(() => {
  return Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
});

// 検索とタグフィルターの変更を監視してイベントを送信
watch(searchQuery, (newQuery, oldQuery) => {
  if (newQuery && newQuery !== oldQuery && newQuery.length > 2) {
    // 検索結果数を取得するため少し遅延させる
    setTimeout(() => {
      trackSearch(newQuery, searchedTodos.value.length);
    }, 300);
  }
});

watch(selectedTagId, (newTagId, oldTagId) => {
  if (newTagId && newTagId !== oldTagId) {
    const selectedTag = tagStore.tags.find((tag) => tag.id === newTagId);
    if (selectedTag) {
      // 検索結果数を取得するため少し遅延させる
      setTimeout(() => {
        trackTagFiltered(
          newTagId,
          selectedTag.name,
          searchedTodos.value.length
        );
      }, 300);
    }
  }
});
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

/* ドラッグ＆ドロップ関連のスタイル */
.ghost-card {
  background-color: #f3f4f6;
  border: 1px dashed #d1d5db;
  opacity: 0.6;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.drag-item {
  opacity: 0.8;
  transform: rotate(2deg);
}

.chosen-item {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.fixed-bottom-fab {
  position: fixed;
  bottom: 1rem;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: center;
  z-index: 50;
}
</style>
