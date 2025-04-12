<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">カンバンボード</h1>
      <UButton @click="showNewTaskModal = true" icon="i-heroicons-plus">
        新しいタスク
      </UButton>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <!-- 未対応 -->
      <div class="rounded-lg bg-gray-100 p-4">
        <h2 class="mb-3 font-semibold text-gray-700">未対応</h2>
        <div class="space-y-2">
          <TodoCard
            v-for="todo in todosByStatus['未対応']"
            :key="todo.id"
            :todo="todo"
          />
          <div
            v-if="todosByStatus['未対応'].length === 0"
            class="text-gray-500 text-sm p-2"
          >
            タスクがありません
          </div>
        </div>
      </div>

      <!-- 対応中 -->
      <div class="rounded-lg bg-blue-50 p-4">
        <h2 class="mb-3 font-semibold text-blue-700">対応中</h2>
        <div class="space-y-2">
          <TodoCard
            v-for="todo in todosByStatus['対応中']"
            :key="todo.id"
            :todo="todo"
          />
          <div
            v-if="todosByStatus['対応中'].length === 0"
            class="text-gray-500 text-sm p-2"
          >
            タスクがありません
          </div>
        </div>
      </div>

      <!-- 完了 -->
      <div class="rounded-lg bg-green-50 p-4">
        <h2 class="mb-3 font-semibold text-green-700">完了</h2>
        <div class="space-y-2">
          <TodoCard
            v-for="todo in todosByStatus['完了']"
            :key="todo.id"
            :todo="todo"
          />
          <div
            v-if="todosByStatus['完了'].length === 0"
            class="text-gray-500 text-sm p-2"
          >
            タスクがありません
          </div>
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
                { label: '未対応', value: '未対応' },
                { label: '対応中', value: '対応中' },
                { label: '完了', value: '完了' },
              ]"
            />
          </UFormGroup>
          <UFormGroup label="プライベート">
            <UCheckbox v-model="newTodo.is_private" label="個人タスク" />
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
  status: "未対応",
  task_id: "", // データベースのカラム名に合わせる
  is_private: false,
});

// ステータス別にTodoを分類
const todosByStatus = computed(() => {
  console.log("現在のTodos:", todoStore.todos);
  return {
    未対応: todoStore.todos.filter((t) => t.status === "未対応"),
    対応中: todoStore.todos.filter((t) => t.status === "対応中"),
    完了: todoStore.todos.filter((t) => t.status === "完了"),
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
      task_id: newTodo.value.task_id,
      is_private: newTodo.value.is_private,
    });

    showNewTaskModal.value = false;
    newTodo.value = {
      title: "",
      memo: "",
      status: "未対応",
      task_id: "",
      is_private: false,
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
