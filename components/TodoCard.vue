<template>
  <div
    class="bg-white rounded-lg shadow p-4 relative cursor-move"
    draggable="true"
    @dragstart="handleDragStart"
  >
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
        <h3 class="font-bold border-b border-gray-200 pb-1 mb-3">
          {{ todo.title }}
        </h3>
        <div
          v-if="todo.memo"
          class="mt-1 text-sm prose prose-sm prose-gray max-h-[20em] w-full overflow-y-auto pr-2 break-all"
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
      </div>
    </div>
    <!-- sort_order表示 -->
    <!-- <div class="mt-2 text-xs text-gray-400">
      順序: {{ todo.sort_order !== undefined ? todo.sort_order : "なし" }}
    </div> -->
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

// ドラッグ開始時にTodoのIDをデータ転送オブジェクトに設定
const handleDragStart = (event: any) => {
  event.dataTransfer.setData("todoId", props.todo.id);
  event.dataTransfer.effectAllowed = "move";
};

// メモをマークダウンとしてパース
const parsedMemo = computed(() => {
  if (!props.todo.memo) return "";
  return marked(props.todo.memo);
});
</script>
