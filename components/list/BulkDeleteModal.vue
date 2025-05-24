<template>
  <UModal :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <div class="p-4">
      <h3 class="text-lg font-medium mb-2">タスクの削除</h3>
      <p class="mb-4">
        選択した
        {{ selectedCount }} 件のタスクを削除します。この操作は元に戻せません。
      </p>
      <div class="flex justify-end gap-2">
        <UButton color="gray" @click="$emit('cancel')">キャンセル</UButton>
        <UButton
          color="red"
          @click="$emit('confirm')"
          :loading="isLoading"
          :disabled="isLoading"
        >
          削除
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  selectedCount: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:isOpen", "cancel", "confirm"]);
</script>
