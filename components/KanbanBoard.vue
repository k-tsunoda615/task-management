<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">カンバンボード</h1>
      <UButton @click="showNewTaskModal = true" icon="i-heroicons-plus">
        新しいタスク
      </UButton>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <!-- 未着手 -->
      <div class="rounded-lg bg-gray-100 p-4">
        <h2 class="mb-3 font-semibold text-gray-700">未着手</h2>
        <div class="space-y-2">
          <TodoCard
            v-for="todo in todosByStatus.todo"
            :key="todo.id"
            :todo="todo"
          />
        </div>
      </div>

      <!-- 進行中 -->
      <div class="rounded-lg bg-blue-50 p-4">
        <h2 class="mb-3 font-semibold text-blue-700">進行中</h2>
        <div class="space-y-2">
          <TodoCard
            v-for="todo in todosByStatus.inProgress"
            :key="todo.id"
            :todo="todo"
          />
        </div>
      </div>

      <!-- 完了 -->
      <div class="rounded-lg bg-green-50 p-4">
        <h2 class="mb-3 font-semibold text-green-700">完了</h2>
        <div class="space-y-2">
          <TodoCard
            v-for="todo in todosByStatus.done"
            :key="todo.id"
            :todo="todo"
          />
        </div>
      </div>
    </div>

    <!-- 新規タスクモーダル -->
    <UModal v-model="showNewTaskModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">新しいタスク</h3>
        </template>
        <form @submit.prevent="createTodo">
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
                { label: '未着手', value: 'todo' },
                { label: '進行中', value: 'inProgress' },
                { label: '完了', value: 'done' },
              ]"
            />
          </UFormGroup>
        </form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showNewTaskModal = false">
              キャンセル
            </UButton>
            <UButton color="primary" @click="createTodo" :loading="isCreating">
              作成
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";

const todoStore = useTodoStore();
const showNewTaskModal = ref(false);
const isCreating = ref(false);

const newTodo = ref({
  title: "",
  memo: "",
  status: "todo",
  taskId: "default", // デフォルトのタスクID
});

// ステータス別にTodoを分類
const todosByStatus = computed(() => {
  return {
    todo: todoStore.todos.filter((t) => t.status === "todo"),
    inProgress: todoStore.todos.filter((t) => t.status === "inProgress"),
    done: todoStore.todos.filter((t) => t.status === "done"),
  };
});

// 新規Todo作成
const createTodo = async () => {
  if (!newTodo.value.title) return;

  isCreating.value = true;
  try {
    await todoStore.createTodo({
      title: newTodo.value.title,
      memo: newTodo.value.memo,
      status: newTodo.value.status,
      taskId: newTodo.value.taskId,
    });

    showNewTaskModal.value = false;
    newTodo.value = {
      title: "",
      memo: "",
      status: "todo",
      taskId: "default",
    };
  } catch (error) {
    console.error("Todo作成エラー:", error);
  } finally {
    isCreating.value = false;
  }
};

// コンポーネントマウント時にTodoを取得
onMounted(async () => {
  try {
    await todoStore.fetchTodos();
  } catch (error) {
    console.error("Todoの取得に失敗しました:", error);
  }
});
</script>
