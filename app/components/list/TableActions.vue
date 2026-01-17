<template>
  <div class="mb-4 flex flex-wrap gap-2 justify-between items-center">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-if="selectedCount > 0"
        color="red"
        size="sm"
        icon="i-heroicons-trash"
        class="mr-2"
        @click="$emit('deleteTodos')"
      >
        {{ selectedCount }}件を削除
      </UButton>

      <USelect
        v-model="localStatusFilter"
        :options="statusOptions"
        placeholder="ステータス"
        size="sm"
        class="w-32"
      />
    </div>

    <div class="w-full md:w-auto mt-2 md:mt-0">
      <UInput
        v-model="localSearchQuery"
        placeholder="タスクを検索..."
        trailing-icon="i-heroicons-magnifying-glass-20-solid"
        class="w-full md:w-64"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { TASK_STATUS, TASK_STATUS_LABELS } from "../../utils/constants";

const props = defineProps({
  selectedCount: {
    type: Number,
    default: 0,
  },
  searchQuery: {
    type: String,
    default: "",
  },
  statusFilter: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:searchQuery",
  "update:statusFilter",
  "deleteTodos",
]);

// ローカルの状態
const localSearchQuery = ref(props.searchQuery);
const localStatusFilter = ref(props.statusFilter);

// 検索クエリの変更を親コンポーネントに伝える
watch(localSearchQuery, (newValue) => {
  emit("update:searchQuery", newValue);
});

// ステータスフィルターの変更を親コンポーネントに伝える
watch(localStatusFilter, (newValue) => {
  emit("update:statusFilter", newValue);
});

// ステータスオプションを作成
const statusOptions = computed(() => {
  return [
    { label: "すべて", value: "" },
    {
      label: TASK_STATUS_LABELS[TASK_STATUS.PRIORITY],
      value: TASK_STATUS.PRIORITY,
    },
    { label: TASK_STATUS_LABELS[TASK_STATUS.NEXT], value: TASK_STATUS.NEXT },
    {
      label: TASK_STATUS_LABELS[TASK_STATUS.ARCHIVED],
      value: TASK_STATUS.ARCHIVED,
    },
  ];
});
</script>
