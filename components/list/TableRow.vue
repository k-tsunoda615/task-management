<template>
  <tr class="hover:bg-gray-50" :data-id="todo.id">
    <!-- ドラッグハンドル -->
    <td class="px-2 py-3 text-center cursor-move handle align-middle">
      <UIcon name="i-heroicons-bars-2" class="text-gray-400 w-4 h-4" />
    </td>

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
    <td class="px-4 py-3">
      <USelectMenu
        v-if="isEditingStatus"
        v-model="editedStatus"
        :options="statusOptions"
        size="sm"
        class="w-32"
        @close="saveStatus"
        @update:modelValue="saveStatus"
      />
      <span
        v-else
        class="px-2 py-1 text-xs rounded-full flex items-center w-fit cursor-pointer hover:opacity-80"
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
    <td class="px-4 py-3">
      <div v-if="isEditingTags" class="flex flex-wrap gap-1 items-center">
        <UButton
          size="xs"
          color="gray"
          variant="ghost"
          @click="saveTagsEdit"
          icon="i-heroicons-check"
          class="ml-1"
        />
        <USelectMenu
          v-model="editedTags"
          :options="availableTags"
          multiple
          size="sm"
          placeholder="タグを選択"
          class="w-48"
        />
      </div>
      <div
        v-else
        class="flex flex-wrap gap-1 cursor-pointer"
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
          class="w-4 h-4 text-gray-400 ml-1"
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
</script>

<style scoped>
/* 重複するスタイルはTable.vueに移動しました */
</style>
