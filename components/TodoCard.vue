<template>
  <div class="rounded bg-white p-3 shadow">
    <h3 class="font-medium">{{ todo.title }}</h3>
    <p v-if="todo.memo" class="mt-1 text-sm text-gray-600">{{ todo.memo }}</p>
    <div class="mt-2 flex justify-end">
      <UButton
        color="red"
        variant="ghost"
        icon="i-heroicons-trash"
        size="xs"
        @click="deleteTodo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
});

const todoStore = useTodoStore();

const deleteTodo = async () => {
  if (confirm("このタスクを削除しますか？")) {
    await todoStore.deleteTodo(props.todo.id);
  }
};
</script>
