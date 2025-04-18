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
        <draggable
          v-model="todosByStatus.todo"
          :group="{ name: 'todos' }"
          item-key="id"
          class="space-y-2"
          data-status="todo"
          :animation="200"
          ghost-class="opacity-50"
          @change="handleDragChange"
        >
          <template #item="{ element }">
            <TodoCard :todo="element" @edit="openEditModal" />
          </template>
        </draggable>
        <div
          v-if="todosByStatus.todo.length === 0"
          class="text-gray-500 text-sm p-2"
        >
          タスクがありません
        </div>
      </div>

      <!-- 対応中 -->
      <div class="rounded-lg bg-blue-50 p-4">
        <h2 class="mb-3 font-semibold text-blue-700">対応中</h2>
        <draggable
          v-model="todosByStatus.inProgress"
          :group="{ name: 'todos' }"
          item-key="id"
          class="space-y-2"
          data-status="inProgress"
          :animation="200"
          ghost-class="opacity-50"
          @change="handleDragChange"
        >
          <template #item="{ element }">
            <TodoCard :todo="element" @edit="openEditModal" />
          </template>
        </draggable>
        <div
          v-if="todosByStatus.inProgress.length === 0"
          class="text-gray-500 text-sm p-2"
        >
          タスクがありません
        </div>
      </div>

      <!-- 完了 -->
      <div class="rounded-lg bg-green-50 p-4">
        <h2 class="mb-3 font-semibold text-green-700">完了</h2>
        <draggable
          v-model="todosByStatus.done"
          :group="{ name: 'todos' }"
          item-key="id"
          class="space-y-2"
          data-status="done"
          :animation="200"
          ghost-class="opacity-50"
          @change="handleDragChange"
        >
          <template #item="{ element }">
            <TodoCard :todo="element" @edit="openEditModal" />
          </template>
        </draggable>
        <div
          v-if="todosByStatus.done.length === 0"
          class="text-gray-500 text-sm p-2"
        >
          タスクがありません
        </div>
      </div>
    </div>

    <!-- デバッグ用：全てのTodoを表示 -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h2 class="text-lg font-semibold mb-3">全てのタスク (デバッグ用)</h2>
      <div v-if="todoStore.todos.length === 0" class="text-gray-500">
        タスクがありません
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="todo in todoStore.todos"
          :key="todo.id"
          class="bg-white p-3 rounded shadow"
        >
          <div class="flex justify-between">
            <div>
              <span class="font-medium">{{ todo.title }}</span>
              <span class="ml-2 text-sm text-gray-600"
                >(ステータス: "{{ todo.status }}")</span
              >
            </div>
            <UBadge v-if="todo.is_private" color="gray" size="sm"
              >個人タスク</UBadge
            >
          </div>
          <p v-if="todo.memo" class="mt-1 text-sm text-gray-600">
            {{ todo.memo }}
          </p>
          <div class="mt-1 text-xs text-gray-500">
            ID: {{ todo.id }} | 更新: {{ formatDate(todo.updated_at) }}
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
          <UFormGroup label="タイトル" class="mt-4">
            <UInput v-model="newTodo.title" required />
          </UFormGroup>
          <UFormGroup label="メモ" class="mt-4">
            <UTextarea v-model="newTodo.memo" />
          </UFormGroup>
          <UFormGroup label="ステータス" class="mt-4">
            <USelect
              v-model="newTodo.status"
              :options="[
                { label: '未対応', value: '未対応' },
                { label: '対応中', value: '対応中' },
                { label: '完了', value: '完了' },
              ]"
            />
          </UFormGroup>
          <UFormGroup class="mt-4">
            <UCheckbox v-model="newTodo.is_private" label="Private" />
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

    <!-- 編集タスクモーダル -->
    <UModal
      v-model="showEditModal"
      :ui="{
        container: 'items-start my-20',
        width: 'max-w-4xl',
        height: 'min-h-[300px]',
      }"
    >
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">タスクを編集</h3>
        </template>
        <form @submit.prevent="updateTodo">
          <UFormGroup label="タイトル" class="mt-4">
            <UInput v-model="editingTodo.title" required />
          </UFormGroup>
          <UFormGroup label="メモ" class="mt-4">
            <div class="space-y-2">
              <UTextarea
                v-model="editingTodo.memo"
                :rows="15"
                class="font-mono text-sm"
                :ui="{
                  base: 'min-h-[300px] resize-y',
                }"
              />
              <UButton
                size="sm"
                variant="ghost"
                @click="showPreviewModal = true"
                icon="i-heroicons-eye"
              >
                プレビュー
              </UButton>
            </div>
          </UFormGroup>
          <div class="flex gap-4 mt-4">
            <UFormGroup label="ステータス" class="flex-1">
              <USelect
                v-model="editingTodo.status"
                :options="[
                  { label: '未対応', value: '未対応' },
                  { label: '対応中', value: '対応中' },
                  { label: '完了', value: '完了' },
                ]"
              />
            </UFormGroup>
            <UFormGroup class="flex-1">
              <UCheckbox v-model="editingTodo.is_private" label="Private" />
            </UFormGroup>
          </div>
        </form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showEditModal = false">
              キャンセル
            </UButton>
            <UButton color="primary" @click="updateTodo" :loading="isUpdating">
              更新
            </UButton>
          </div>
        </template>

        <!-- プレビューモーダル -->
        <UModal
          v-if="showPreviewModal"
          v-model="showPreviewModal"
          :ui="{
            container: 'items-start my-20',
            width: 'max-w-4xl',
            wrapper: 'z-[60]',
            overlay: { base: 'bg-gray-950/75' },
          }"
        >
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">プレビュー</h3>
            </template>
            <div
              class="prose prose-sm max-w-none min-h-[300px] overflow-y-auto max-h-[60vh]"
              v-html="parsedPreviewMemo"
            />
            <template #footer>
              <div class="flex justify-end">
                <UButton variant="ghost" @click="showPreviewModal = false">
                  閉じる
                </UButton>
              </div>
            </template>
          </UCard>
        </UModal>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";
import draggable from "vuedraggable";
import { marked } from "marked";

const todoStore = useTodoStore();
const showNewTaskModal = ref(false);
const showEditModal = ref(false);
const showPreviewModal = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);

const newTodo = ref({
  title: "",
  memo: "",
  status: "未対応",
  task_id: "",
  is_private: false,
});

const editingTodo = ref({
  id: "",
  title: "",
  memo: "",
  status: "未対応",
  task_id: "",
  is_private: false,
});

// プレビュー用のマークダウンパース
const parsedPreviewMemo = computed(() => {
  return marked(editingTodo.value.memo || "");
});

// 日付フォーマット関数
const formatDate = (dateString) => {
  if (!dateString) return "不明";
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ステータスの日本語と英語のマッピング
const statusMap = {
  未対応: "todo",
  対応中: "inProgress",
  完了: "done",
};

// 逆マッピング（英語から日本語へ）
const reverseStatusMap = {
  todo: "未対応",
  inProgress: "対応中",
  done: "完了",
};

// ステータス別のTodoを管理するreactiveな状態
const todosByStatus = reactive({
  todo: [] as Todo[],
  inProgress: [] as Todo[],
  done: [] as Todo[],
});

// Todoの状態が変更されたときに再分類する
const updateTodosByStatus = () => {
  console.log("現在のTodos:", todoStore.filteredTodos);

  // 一旦クリア
  todosByStatus.todo = [];
  todosByStatus.inProgress = [];
  todosByStatus.done = [];

  // 再分類
  todoStore.filteredTodos.forEach((todo) => {
    if (todo.status === "未対応") {
      todosByStatus.todo.push(todo);
    } else if (todo.status === "対応中") {
      todosByStatus.inProgress.push(todo);
    } else if (todo.status === "完了") {
      todosByStatus.done.push(todo);
    } else {
      // デフォルトは未対応に入れる
      console.log(`不明なステータス "${todo.status}" のTodoがあります:`, todo);
      todosByStatus.todo.push(todo);
    }
  });
};

// todoStoreのtodosが変更されたときに再分類を実行
watch(
  () => [todoStore.filteredTodos, todoStore.showPrivateTasks],
  () => {
    updateTodosByStatus();
  },
  { deep: true }
);

// 初期分類
onMounted(() => {
  // 初期データの取得
  const fetchInitialData = async () => {
    try {
      await todoStore.fetchTodos();
    } catch (error) {
      console.error("Todoの取得に失敗しました:", error);
      useToast().add({
        title: "エラー",
        description: "タスクの取得に失敗しました",
        color: "red",
      });
    }
  };

  fetchInitialData();
  updateTodosByStatus();
});

// 編集モーダルを開く
const openEditModal = (todo) => {
  editingTodo.value = { ...todo };
  showEditModal.value = true;
};

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

// Todo更新
const updateTodo = async () => {
  if (!editingTodo.value.title) return;

  isUpdating.value = true;
  try {
    await todoStore.updateTodo(editingTodo.value);
    showEditModal.value = false;
    // 成功メッセージを表示
    useToast().add({
      title: "更新完了",
      description: "タスクを更新しました",
      color: "green",
    });
  } catch (error) {
    console.error("Todo更新エラー:", error);
    // エラーメッセージを表示
    useToast().add({
      title: "エラー",
      description: "更新に失敗しました",
      color: "red",
    });
  } finally {
    isUpdating.value = false;
  }
};

// ドラッグ&ドロップ時の処理
const handleDragChange = async (evt) => {
  console.log("ドラッグイベント:", evt); // デバッグ用

  // ドラッグ&ドロップの種類を特定
  const dragType = evt.added ? "added" : evt.moved ? "moved" : null;
  if (!dragType) return;

  const todo = evt[dragType].element;

  // 移動先のリストを特定
  let newStatus = "todo"; // デフォルト値

  if (evt.added) {
    // 追加された場合は、追加先のインデックスから判断
    if (todosByStatus.inProgress.find((t) => t.id === todo.id)) {
      newStatus = "inProgress";
    } else if (todosByStatus.done.find((t) => t.id === todo.id)) {
      newStatus = "done";
    }
  } else if (evt.moved) {
    // 移動の場合は、移動先のリストから判断
    if (todosByStatus.inProgress.find((t) => t.id === todo.id)) {
      newStatus = "inProgress";
    } else if (todosByStatus.done.find((t) => t.id === todo.id)) {
      newStatus = "done";
    }
  }

  if (!todo || !newStatus) {
    console.error("必要な情報が見つかりません", { todo, newStatus, evt });
    return;
  }

  // ステータスマッピング
  const statusMapping = {
    todo: "未対応",
    inProgress: "対応中",
    done: "完了",
  };

  const mappedStatus = statusMapping[newStatus];
  if (!mappedStatus) {
    console.error("不正なステータス:", newStatus);
    return;
  }

  console.log("ステータス更新前:", {
    currentStatus: todo.status,
    newStatus: mappedStatus,
    todo,
  });

  try {
    await todoStore.updateTodo({
      id: todo.id,
      title: todo.title,
      memo: todo.memo,
      task_id: todo.task_id,
      is_private: todo.is_private,
      status: mappedStatus,
    });

    console.log("ステータス更新後:", {
      status: todoStore.todos.find((t) => t.id === todo.id)?.status,
    });

    // 状態を即時反映
    updateTodosByStatus();

    if (evt.added) {
      useToast().add({
        title: "更新完了",
        description: "タスクを移動しました",
        color: "green",
      });
    }
  } catch (error) {
    console.error("Todo更新エラー:", error);
    useToast().add({
      title: "エラー",
      description: "タスクの移動に失敗しました",
      color: "red",
    });
    // エラー時は状態を再同期
    updateTodosByStatus();
  }
};
</script>
