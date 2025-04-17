<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="font-medium">{{ todo.title }}</h3>
        <div
          v-if="todo.memo"
          class="mt-1 text-sm text-gray-600 prose prose-sm max-w-none"
          v-html="parsedMemo"
        />
      </div>
      <div class="flex items-center space-x-2">
        <UBadge v-if="todo.is_private" color="gray" size="sm">
          個人タスク
        </UBadge>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          size="xs"
          @click="$emit('edit', todo)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";
import { marked } from "marked";

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit"]);

const todoStore = useTodoStore();

const editTodo = () => {
  emit("edit", props.todo);
};

const deleteTodo = async () => {
  if (confirm("このタスクを削除しますか？")) {
    try {
      await todoStore.deleteTodo(props.todo.id);
    } catch (error) {
      console.error("削除エラー:", error);
    }
  }
};

// メモをマークダウンとしてパース
const parsedMemo = computed(() => {
  if (!props.todo.memo) return "";
  return marked(props.todo.memo);
});
</script>
