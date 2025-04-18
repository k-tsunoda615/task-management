<template>
  <div class="bg-white rounded-lg shadow p-4 relative">
    <!-- プライベートインジケーター -->
    <div
      v-if="todo.is_private"
      class="absolute bottom-0 right-2 text-green-500"
      title="プライベート"
    >
      <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
    </div>
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="font-medium">{{ todo.title }}</h3>
        <div
          v-if="todo.memo"
          class="mt-1 text-sm text-gray-600 prose prose-sm max-w-none"
          v-html="parsedMemo"
        />
      </div>
      <div class="flex items-center ml-4">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          size="xs"
          @click="$emit('edit', todo)"
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
import { marked } from "marked";

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit"]);

const todoStore = useTodoStore();
const toast = useToast();

const editTodo = () => {
  emit("edit", props.todo);
};

const deleteTodo = async () => {
  if (confirm("このタスクを削除しますか？")) {
    try {
      await todoStore.deleteTodo(props.todo.id);
      toast.add({
        title: "削除完了",
        description: "タスクを削除しました",
        color: "green",
      });
    } catch (error) {
      console.error("削除エラー:", error);
      toast.add({
        title: "エラー",
        description: "タスクの削除に失敗しました",
        color: "red",
      });
    }
  }
};

// メモをマークダウンとしてパース
const parsedMemo = computed(() => {
  if (!props.todo.memo) return "";
  return marked(props.todo.memo);
});
</script>
