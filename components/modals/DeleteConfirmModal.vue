<template>
  <UModal
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
  >
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium text-red-600">タスクの削除</h3>
      </template>
      <p class="text-gray-700">
        「{{ editingTodo?.title }}」を削除してもよろしいですか？
      </p>
      <p class="text-sm text-gray-500 mt-2">この操作は元に戻せません。</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="$emit('close')">
            キャンセル
          </UButton>
          <UButton color="red" variant="soft" @click="$emit('delete')">
            削除する
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
defineProps({
  show: Boolean,
  editingTodo: Object,
});
defineEmits(["close", "delete", "update:show"]);
</script>
