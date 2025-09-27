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
            @click="$emit('confirmDelete')"
            title="タスクを削除"
            class="hover:bg-red-50"
          />
        </div>
      </template>
      <form @submit.prevent="$emit('update')" class="space-y-4">
        <UFormGroup label="タイトル">
          <UInput
            :model-value="editingTodo?.title"
            @update:model-value="$emit('update:editingTodoTitle', $event)"
            required
          />
        </UFormGroup>
        <UFormGroup label="メモ">
          <div class="space-y-2">
            <UTextarea
              :model-value="editingTodo?.memo"
              @update:model-value="$emit('update:editingTodoMemo', $event)"
              :rows="15"
              class="font-mono text-sm"
              :ui="{ base: 'min-h-[300px] resize-y' }"
            />
            <UButton
              size="sm"
              variant="soft"
              @click.prevent="$emit('showPreview')"
              icon="i-heroicons-eye"
            >
              プレビュー
            </UButton>
          </div>
        </UFormGroup>
        <div class="flex gap-4">
          <UFormGroup label="ステータス" class="flex-1">
            <USelect
              :model-value="editingTodo?.status"
              @update:model-value="$emit('update:editingTodoStatus', $event)"
              :options="[
                { label: 'Priority', value: '未対応' },
                { label: 'Next', value: '対応中' },
                { label: 'Archived', value: '完了' },
              ]"
            />
          </UFormGroup>
          <UFormGroup class="flex-1">
            <UCheckbox
              :model-value="editingTodo?.is_private"
              @update:model-value="$emit('update:editingTodoIsPrivate', $event)"
              label="Private"
            />
          </UFormGroup>
        </div>
        <UFormGroup label="合計時間 (hh:mm:ss)">
          <div class="flex items-center gap-2">
            <UInput
              :model-value="editTimeInput"
              placeholder="00:00:00"
              @input="$emit('validateTime', $event)"
              :disabled="editingTodo?.is_timing"
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
            @click="$emit('update')"
            :loading="isUpdating"
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
          <div
            class="prose prose-sm max-w-none min-h-[300px] overflow-y-auto max-h-[60vh]"
            v-html="parsedPreviewMemo"
          />
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
defineProps({
  show: Boolean,
  editingTodo: Object,
  editTimeInput: String,
  tagStore: Object,
  isUpdating: Boolean,
  showPreviewModal: Boolean,
  parsedPreviewMemo: String,
});
defineEmits([
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
