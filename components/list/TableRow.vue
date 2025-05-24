<template>
  <tr class="hover:bg-gray-50">
    <td class="px-4 py-3 text-center">
      <UCheckbox
        v-model="selected"
        @change="$emit('toggleSelect', todo.id, selected)"
      />
    </td>
    <td class="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
      {{ todo.title }}
    </td>
    <td class="px-4 py-3">
      <span
        class="px-2 py-1 text-xs rounded-full flex items-center w-fit"
        :class="statusColor.bg + ' ' + statusColor.border"
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
    <td class="px-4 py-3">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="tag in todo.tags"
          :key="tag.id"
          class="px-2 py-0.5 text-xs rounded-full text-white"
          :style="{ backgroundColor: tag.color }"
        >
          {{ tag.name }}
        </span>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { TASK_STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import type { Todo } from "../../types/todo";
import { formatTime, formatDate } from "./TableUtils";

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

defineEmits(["toggleSelect"]);

const selected = ref(props.isSelected);

// 選択状態を外部から更新されたときに反映する
watch(
  () => props.isSelected,
  (newValue) => {
    selected.value = newValue;
  }
);

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
