<template>
  <div class="rounded bg-white p-3 shadow cursor-move">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-medium">{{ todo.title }}</h3>
        <p v-if="todo.memo" class="mt-1 text-sm text-gray-600">
          {{ todo.memo }}
        </p>
        <div v-if="todo.is_private" class="mt-1">
          <UBadge color="gray" size="xs">個人タスク</UBadge>
        </div>
      </div>
      <div class="flex space-x-1">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          size="xs"
          @click="editTodo"
        />
        <UButton
          color="red"
          variant="ghost"
          icon="i-heroicons-trash"
          size="xs"
          @click="deleteTodo"
        />
      </div>
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
</script>
