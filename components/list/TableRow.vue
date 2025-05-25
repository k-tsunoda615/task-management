<template>
  <tr class="hover:bg-gray-50" :data-id="todo.id">
    <!-- ドラッグハンドル -->
    <!-- <td class="px-2 py-3 text-center cursor-move handle align-middle">
      <UIcon name="i-heroicons-bars-2" class="text-gray-400 w-4 h-4" />
    </td> -->

    <!-- タイトル - 編集可能 -->
    <td class="px-4 py-3 text-sm text-gray-900 max-w-xs">
      <UInput
        v-if="isEditingTitle"
        v-model="editedTitle"
        size="sm"
        class="w-full"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        @keyup.escape="cancelTitleEdit"
        ref="titleInput"
      />
      <div
        v-else
        class="truncate cursor-pointer hover:text-primary-500"
        @click="startTitleEdit"
      >
        {{ todo.title }}
      </div>
    </td>

    <!-- ステータス - 編集可能 -->
    <td class="px-4 py-3 relative">
      <div
        v-if="isEditingStatus"
        class="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2"
      >
        <div class="flex justify-between items-center mb-2 border-b pb-1">
          <span class="text-sm font-medium">ステータス変更</span>
          <UButton
            size="xs"
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            class="ml-1"
            @click="isEditingStatus = false"
          />
        </div>
        <div class="flex flex-col gap-1 mb-1">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            :class="
              editedStatus === option.value
                ? 'bg-primary-50 text-primary-700'
                : ''
            "
            @click="selectAndSaveStatus(option.value)"
          >
            <UIcon
              :name="getStatusIcon(option.value)"
              class="w-4 h-4"
              :class="getStatusIconClass(option.value)"
            />
            {{ option.label }}
          </button>
        </div>
      </div>
      <span
        v-else
        class="px-2 py-1 text-xs rounded-full flex items-center w-fit cursor-pointer hover:opacity-80 transition-colors"
        :class="statusColor.bg + ' ' + statusColor.border"
        @click="startStatusEdit"
      >
        <UIcon
          :name="statusColor.iconName"
          :class="statusColor.icon + ' mr-1 w-4 h-4'"
        />
        {{ statusLabel }}
      </span>
    </td>

    <td class="px-4 py-3 text-sm">
      <span v-if="todo.is_private" class="text-pink-600 flex items-center">
        <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 mr-1" />
        プライベート
      </span>
      <span v-else class="text-blue-600 flex items-center">
        <UIcon name="i-heroicons-eye" class="w-4 h-4 mr-1" />
        パブリック
      </span>
    </td>

    <td class="px-4 py-3 text-sm">
      {{ formattedTime }}
    </td>

    <td class="px-4 py-3 text-sm text-gray-600">
      {{ formattedDate }}
    </td>

    <!-- タグ - 編集可能 -->
    <td class="px-4 py-3 relative">
      <div
        v-if="isEditingTags"
        class="absolute z-50 left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[280px]"
      >
        <div class="flex justify-between items-center mb-2 border-b pb-2">
          <span class="text-sm font-medium">タグを選択</span>
          <div class="flex gap-1">
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              @click="saveTagsEdit"
              icon="i-heroicons-check"
              :disabled="editedTags.length === 0"
            />
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              @click="isEditingTags = false"
              icon="i-heroicons-x-mark"
            />
          </div>
        </div>

        <div class="mb-3">
          <div class="flex flex-wrap gap-1 mb-2">
            <span
              v-for="tagId in editedTags"
              :key="tagId"
              class="px-2 py-0.5 text-xs rounded-full text-white flex items-center gap-1"
              :style="{ backgroundColor: getTagColor(tagId) }"
            >
              {{ getTagName(tagId) }}
              <UIcon
                name="i-heroicons-x-mark"
                class="w-3 h-3 cursor-pointer"
                @click="removeTag(tagId)"
              />
            </span>
          </div>

          <div class="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
            <button
              v-for="tag in availableTags"
              :key="tag.value"
              class="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors"
              :class="editedTags.includes(tag.value) ? 'bg-primary-50' : ''"
              @click="toggleTag(tag.value)"
            >
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: getTagColor(tag.value) }"
              ></div>
              {{ tag.label }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-wrap gap-1 cursor-pointer group"
        @click="startTagsEdit"
      >
        <span
          v-for="tag in todo.tags"
          :key="tag.id"
          class="px-2 py-0.5 text-xs rounded-full text-white"
          :style="{ backgroundColor: tag.color }"
        >
          {{ tag.name }}
        </span>
        <UIcon
          v-if="todo.tags && todo.tags.length > 0"
          name="i-heroicons-pencil-square"
          class="w-4 h-4 text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <UIcon
          v-else
          name="i-heroicons-plus-circle"
          class="w-4 h-4 text-gray-400"
        />
      </div>
    </td>

    <!-- チェックボックスを右端に移動 -->
    <td class="px-4 py-3 text-center">
      <UCheckbox
        v-model="selected"
        @change="$emit('toggleSelect', todo.id, selected)"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  STATUS_COLORS,
} from "../../utils/constants";
import type { Todo } from "../../types/todo";
import { formatTime, formatDate } from "./TableUtils";
import { useTodoStore } from "../../stores/todo";
import { useTagStore } from "../../stores/tag";

const props = defineProps({
  todo: {
    type: Object as () => Todo,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggleSelect", "updateTodo", "updateTodoOrder"]);

const selected = ref(props.isSelected);
const todoStore = useTodoStore();
const tagStore = useTagStore();

// 編集状態の管理
const isEditingTitle = ref(false);
const isEditingStatus = ref(false);
const isEditingTags = ref(false);
const editedTitle = ref(props.todo.title);
const editedStatus = ref(props.todo.status);
const editedTags = ref(props.todo.tags?.map((tag) => tag.id) || []);
const titleInput = ref<HTMLInputElement | null>(null);

// ステータスオプションを作成
const statusOptions = computed(() => {
  return Object.entries(TASK_STATUS).map(([key, value]) => ({
    label: TASK_STATUS_LABELS[value as keyof typeof TASK_STATUS_LABELS] || key,
    value: value,
  }));
});

// 利用可能なタグのリスト
const availableTags = computed(() => {
  return tagStore.tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
    icon: "i-heroicons-tag", // タグにはアイコン属性がないのでデフォルトを使用
  }));
});

// 選択状態を外部から更新されたときに反映する
watch(
  () => props.isSelected,
  (newValue) => {
    selected.value = newValue;
  }
);

// タイトル編集を開始
function startTitleEdit() {
  editedTitle.value = props.todo.title;
  isEditingTitle.value = true;
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus();
    }
  });
}

// タイトル編集を保存
function saveTitle() {
  if (
    editedTitle.value.trim() !== "" &&
    editedTitle.value !== props.todo.title
  ) {
    emit("updateTodo", {
      id: props.todo.id,
      title: editedTitle.value.trim(),
    });
  }
  isEditingTitle.value = false;
}

// タイトル編集をキャンセル
function cancelTitleEdit() {
  editedTitle.value = props.todo.title;
  isEditingTitle.value = false;
}

// ステータス編集を開始
function startStatusEdit() {
  editedStatus.value = props.todo.status;
  isEditingStatus.value = true;
}

// ステータス編集を保存
function saveStatus() {
  if (editedStatus.value !== props.todo.status) {
    console.log("ステータス更新:", editedStatus.value); // デバッグ用
    emit("updateTodo", {
      id: props.todo.id,
      status: editedStatus.value,
    });
  }
  isEditingStatus.value = false;
}

// タグ編集を開始
function startTagsEdit() {
  editedTags.value = props.todo.tags?.map((tag) => tag.id) || [];
  isEditingTags.value = true;
}

// タグ編集を保存
function saveTagsEdit() {
  if (
    !arraysEqual(editedTags.value, props.todo.tags?.map((tag) => tag.id) || [])
  ) {
    // 選択されたタグIDに基づいて、実際のタグオブジェクトをタグストアから取得
    const selectedTags = editedTags.value
      .map((tagId) => {
        const foundTag = tagStore.tags.find((tag) => tag.id === tagId);
        if (foundTag) {
          return {
            id: foundTag.id,
            name: foundTag.name,
            color: foundTag.color || "#888888",
          };
        }
        return null;
      })
      .filter((tag) => tag !== null);

    emit("updateTodo", {
      id: props.todo.id,
      tags: selectedTags,
    });
  }
  isEditingTags.value = false;
}

// 配列が等しいかチェック
function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

// ステータスラベルを計算
const statusLabel = computed(() => {
  return (
    TASK_STATUS_LABELS[props.todo.status as keyof typeof TASK_STATUS_LABELS] ||
    props.todo.status
  );
});

// ステータスの色を計算
const statusColor = computed(() => {
  return (
    STATUS_COLORS[props.todo.status as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.priority
  );
});

// 時間をフォーマット
const formattedTime = computed(() => {
  return formatTime(Number(props.todo.total_time) || 0);
});

// 日付をフォーマット
const formattedDate = computed(() => {
  return formatDate(props.todo.updated_at);
});

// ステータスアイコンを計算
function getStatusIcon(status: TaskStatus | string) {
  switch (status) {
    case TASK_STATUS.PRIORITY:
      return "i-heroicons-exclamation-circle";
    case TASK_STATUS.NEXT:
      return "i-heroicons-clock";
    case TASK_STATUS.ARCHIVED:
      return "i-heroicons-archive-box";
    default:
      return "i-heroicons-question-mark-circle";
  }
}

function getStatusIconClass(status: TaskStatus | string) {
  switch (status) {
    case TASK_STATUS.PRIORITY:
      return "text-yellow-400";
    case TASK_STATUS.NEXT:
      return "text-blue-400";
    case TASK_STATUS.ARCHIVED:
      return "text-gray-400";
    default:
      return "text-gray-400";
  }
}

// タグの色を計算
function getTagColor(tagId: string) {
  const tag = tagStore.tags.find((tag) => tag.id === tagId);
  return tag?.color || "#888888";
}

function getTagName(tagId: string) {
  const tag = tagStore.tags.find((tag) => tag.id === tagId);
  return tag?.name || "未命名タグ";
}

function removeTag(tagId: string) {
  editedTags.value = editedTags.value.filter((id) => id !== tagId);
}

function toggleTag(tagId: string) {
  if (editedTags.value.includes(tagId)) {
    editedTags.value = editedTags.value.filter((id) => id !== tagId);
  } else {
    editedTags.value.push(tagId);
  }
}

function selectAndSaveStatus(status: TaskStatus) {
  editedStatus.value = status;
  saveStatus();
}
</script>

<style scoped>
/* 重複するスタイルはTable.vueに移動しました */
</style>
