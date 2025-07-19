<template>
  <div>
    <CommonNavigation :title="'タスク詳細'" />
    <div class="container mx-auto px-4 py-8">
      <Note :taskId="taskId" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useTodoStore } from "../../../stores/todo";

definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

const route = useRoute();
const taskId = computed(() => route.params.id);
const todoStore = useTodoStore();

// タスク情報を取得してタイトルを設定
const taskTitle = ref("タスク詳細");

onMounted(async () => {
  // TodoStoreからデータがロードされていない場合は取得
  if (!todoStore.isLoaded) {
    await todoStore.fetchTodos();
  }

  // タスクを検索
  const task = todoStore.todos.find((t) => t.id === taskId.value);
  if (task) {
    taskTitle.value = task.title;
  }
});

// タイトルが変わったらhead情報を更新
watchEffect(() => {
  useHead({
    title: taskTitle.value,
    meta: [{ name: "description", content: `タスク: ${taskTitle.value}` }],
  });
});
</script>
