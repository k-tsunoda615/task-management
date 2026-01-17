<template>
  <UModal
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
  >
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">新しいタスク</h3>
      </template>
      <form class="space-y-4" @submit.prevent="$emit('create')">
        <UFormGroup label="タイトル">
          <UInput
            :model-value="newTodo?.title"
            required
            :ui="{ icon: { trailing: { pointer: '' } } }"
            @update:model-value="$emit('update:newTodoTitle', $event)"
          >
            <template #trailing>
              <UTooltip text="メモからAI生成" :shortcuts="['⌘', 'G']">
                <UButton
                  v-if="newTodo?.memo"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-sparkles"
                  :padded="false"
                  :loading="isGenerating"
                  @click="handleGenerateTitle"
                />
              </UTooltip>
            </template>
          </UInput>
        </UFormGroup>
        <UFormGroup label="メモ">
          <UTextarea
            :model-value="newTodo?.memo"
            @update:model-value="$emit('update:newTodoMemo', $event)"
          />
        </UFormGroup>
        <UFormGroup label="ステータス">
          <USelect
            :model-value="newTodo?.status"
            :options="statusOptions"
            @update:model-value="$emit('update:newTodoStatus', $event)"
          />
        </UFormGroup>
        <UFormGroup>
          <UCheckbox
            :model-value="newTodo?.is_private"
            label="Private"
            @update:model-value="$emit('update:newTodoIsPrivate', $event)"
          />
        </UFormGroup>
        <UFormGroup label="合計時間 (hh:mm:ss)">
          <UInput
            :model-value="timeInput"
            placeholder="00:00:00"
            @update:model-value="$emit('update:timeInput', $event)"
            @input="$emit('validate-time', $event)"
          />
        </UFormGroup>
        <UFormGroup label="タグ">
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in tagStore?.tags"
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
                  opacity: newTodo?.tags?.some((t: Tag) => t.id === tag.id)
                    ? 1
                    : 0.5,
                  cursor: 'pointer',
                }"
                class="transition-all duration-200 hover:opacity-100"
                @click="$emit('toggle-tag', tag)"
              >
                {{ tag.name }}
              </UBadge>
            </div>
          </div>
        </UFormGroup>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="$emit('close')">
            キャンセル
          </UButton>
          <UButton
            color="primary"
            :loading="isCreating"
            @click="$emit('create')"
          >
            作成
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Tag } from "../../../types/todo";
import { TASK_STATUS_LABELS } from "../../utils/constants";
import { computed } from "vue";

// AI Title Generation
import { useAITitleGenerator } from "../../composables/useAITitleGenerator";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  newTodo: {
    type: Object,
    default: null,
  },
  timeInput: {
    type: String,
    default: "",
  },
  tagStore: {
    type: Object,
    default: null,
  },
  isCreating: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  "close",
  "create",
  "toggle-tag",
  "validate-time",
  "update:timeInput",
  "update:newTagName",
  "update:show",
  "update:newTodoTitle",
  "update:newTodoMemo",
  "update:newTodoStatus",
  "update:newTodoIsPrivate",
]);

// ステータス選択用のオプション
const statusOptions = computed(() => {
  return Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
});
const { isGenerating, generateTitle } = useAITitleGenerator();

const handleGenerateTitle = async () => {
  if (!props.newTodo?.memo) return;
  const title = await generateTitle(props.newTodo.memo);
  if (title) {
    emit("update:newTodoTitle", title);
  }
};
</script>
