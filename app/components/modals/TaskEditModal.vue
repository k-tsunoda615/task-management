<template>
  <UModal
    v-model="show"
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
            title="タスクを削除"
            class="hover:bg-red-50"
            @click="$emit('confirmDelete')"
          />
        </div>
      </template>
      <form class="space-y-4" @submit.prevent="$emit('update')">
        <UFormGroup label="タイトル">
          <UInput
            :model-value="editingTodo?.title"
            required
            @update:model-value="$emit('update:editingTodoTitle', $event)"
          >
            <template #trailing>
              <UTooltip text="メモからAI生成">
                <UButton
                  v-if="editingTodo?.memo"
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
          <div class="space-y-2">
            <UTextarea
              :model-value="editingTodo?.memo"
              :rows="15"
              class="font-mono text-sm"
              :ui="{ base: 'min-h-[300px] resize-y' }"
              @update:model-value="$emit('update:editingTodoMemo', $event)"
            />
            <UButton
              size="sm"
              variant="soft"
              icon="i-heroicons-eye"
              @click.prevent="$emit('showPreview')"
            >
              プレビュー
            </UButton>
          </div>
        </UFormGroup>
        <div class="flex gap-4">
          <UFormGroup label="ステータス" class="flex-1">
            <USelect
              :model-value="editingTodo?.status"
              :options="[
                { label: 'Priority', value: '未対応' },
                { label: 'Next', value: '対応中' },
                { label: 'Archived', value: '完了' },
              ]"
              @update:model-value="$emit('update:editingTodoStatus', $event)"
            />
          </UFormGroup>
          <UFormGroup class="flex-1">
            <UCheckbox
              :model-value="editingTodo?.is_private"
              label="Private"
              @update:model-value="$emit('update:editingTodoIsPrivate', $event)"
            />
          </UFormGroup>
        </div>
        <UFormGroup label="合計時間 (hh:mm:ss)">
          <div class="flex items-center gap-2">
            <UInput
              :model-value="editTimeInput"
              placeholder="00:00:00"
              :disabled="editingTodo?.is_timing"
              @input="$emit('validateTime', $event)"
            />
            <UTooltip
              v-if="editingTodo?.is_timing"
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
                  opacity: editingTodo?.tags?.some((t: Tag) => t.id === tag.id)
                    ? 1
                    : 0.5,
                  cursor: 'pointer',
                }"
                class="transition-all duration-200 hover:opacity-100"
                @click="$emit('toggleTag', tag)"
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
            :loading="isUpdating"
            @click="$emit('update')"
          >
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
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="prose prose-sm max-w-none min-h-[300px] overflow-y-auto max-h-[60vh]"
            v-html="parsedPreviewMemo"
          />
          <!-- eslint-enable vue/no-v-html -->
          <template #footer>
            <div class="flex justify-end">
              <UButton variant="ghost" @click="$emit('closePreview')">
                閉じる
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Tag } from "../../../types/todo";

// AI Title Generation
import { useAITitleGenerator } from "../../composables/useAITitleGenerator";
const { isGenerating, generateTitle } = useAITitleGenerator();

const handleGenerateTitle = async () => {
  // @ts-ignore
  if (!props.editingTodo?.memo) return;
  // @ts-ignore
  const title = await generateTitle(props.editingTodo.memo);
  if (title) {
    emit("update:editingTodoTitle", title);
  }
};

const props = defineProps({
  show: Boolean,
  editingTodo: Object,
  editTimeInput: String,
  tagStore: Object,
  isUpdating: Boolean,
  showPreviewModal: Boolean,
  parsedPreviewMemo: String,
});
const emit = defineEmits([
  "close",
  "update",
  "toggleTag",
  "validateTime",
  "showPreview",
  "closePreview",
  "confirmDelete",
  "update:editingTodoTitle",
  "update:editingTodoMemo",
  "update:editingTodoStatus",
  "update:editingTodoIsPrivate",
]);
</script>
