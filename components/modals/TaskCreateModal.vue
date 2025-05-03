<template>
  <UModal v-model="show">
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">新しいタスク</h3>
      </template>
      <form @submit.prevent="$emit('create')" class="space-y-4">
        <UFormGroup label="タイトル">
          <UInput v-model="newTodo.title" required />
        </UFormGroup>
        <UFormGroup label="メモ">
          <UTextarea v-model="newTodo.memo" />
        </UFormGroup>
        <UFormGroup label="ステータス">
          <USelect
            v-model="newTodo.status"
            :options="[
              { label: 'Priority', value: '未対応' },
              { label: 'Next Up', value: '対応中' },
              { label: 'Archived', value: '完了' },
            ]"
          />
        </UFormGroup>
        <UFormGroup>
          <UCheckbox v-model="newTodo.is_private" label="Private" />
        </UFormGroup>
        <UFormGroup label="合計時間 (hh:mm:ss)">
          <UInput
            v-model="timeInput"
            placeholder="00:00:00"
            @input="$emit('validate-time', $event)"
          />
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
                  opacity: newTodo.tags.some((t) => t.id === tag.id) ? 1 : 0.5,
                  cursor: 'pointer',
                }"
                class="transition-all duration-200 hover:opacity-100"
                @click="$emit('toggle-tag', tag)"
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
                @click.prevent="$emit('add-tag')"
              >
                追加
              </UButton>
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
            @click="$emit('create')"
            :loading="isCreating"
          >
            作成
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
defineProps({
  show: Boolean,
  newTodo: Object,
  timeInput: String,
  tagStore: Object,
  isCreating: Boolean,
  newTagName: String,
});
defineEmits(["close", "create", "add-tag", "toggle-tag", "validate-time"]);
</script>
