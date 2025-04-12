<template>
  <div class="h-full">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        {{ selectedProject?.title || 'すべてのタスク' }}
      </h1>
      <UButton
        icon="i-heroicons-plus"
        @click="showNewTodoModal = true"
      >
        新規Todo
      </UButton>
    </div>

    <div class="flex gap-4 h-[calc(100vh-8rem)] overflow-x-auto">
      <div
        v-for="status in statuses"
        :key="status"
        class="w-80 flex-shrink-0"
      >
        <div class="bg-gray-100 rounded-lg p-4 h-full">
          <h3 class="font-medium mb-4">{{ status }}</h3>
          <draggable
            v-model="todosByStatus[status]"
            group="todos"
            :animation="200"
            class="space-y-2"
            @change="handleDragChange"
          >
            <TodoCard
              v-for="todo in todosByStatus[status]"
              :key="todo.id"
              :todo="todo"
              @click="editTodo(todo)"
            />
          </draggable>
        </div>
      </div>
    </div>

    <!-- Todo作成/編集モーダル -->
    <UModal v-model="showNewTodoModal">
      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">
            {{ editingTodo ? 'Todoを編集' : '新規Todo' }}
          </h3>
        </template>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormGroup label="タイトル">
            <UInput v-model="todoForm.title" required />
          </UFormGroup>

          <UFormGroup label="ステータス">
            <USelect
              v-model="todoForm.status"
              :options="statuses"
              required
            />
          </UFormGroup>

          <UFormGroup label="タスク">
            <USelect
              v-model="todoForm.taskId"
              :options="tasks"
              option-attribute="title"
              required
            />
          </UFormGroup>

          <UFormGroup label="メモ">
            <UTextarea v-model="todoForm.memo" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="showNewTodoModal = false"
            >
              キャンセル
            </UButton>
            <UButton
              type="submit"
              :loading="saving"
            >
              {{ editingTodo ? '更新' : '作成' }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/stores/project'
import { useTodoStore } from '~/stores/todo'
import draggable from 'vuedraggable'

const projectStore = useProjectStore()
const todoStore = useTodoStore()

const { selectedProject } = storeToRefs(projectStore)
const { todos, tasks } = storeToRefs(todoStore)

const statuses = ['未対応', '対応中', '処理済み', '完了']
const showNewTodoModal = ref(false)
const saving = ref(false)
const editingTodo = ref<Todo | null>(null)

const todoForm = ref({
  title: '',
  status: '未対応',
  taskId: '',
  memo: ''
})

const todosByStatus = computed(() => {
  return statuses.reduce((acc, status) => {
    acc[status] = todos.value.filter(todo => todo.status === status)
    return acc
  }, {} as Record<string, Todo[]>)
})

const handleDragChange = async (evt: any) => {
  if (!evt.added && !evt.moved) return

  const todo = evt.added?.element || evt.moved?.element
  if (!todo) return

  const newStatus = evt.added?.newIndex !== undefined
    ? statuses[evt.added.newIndex]
    : todo.status

  await todoStore.updateTodo({
    ...todo,
    status: newStatus
  })
}

const editTodo = (todo: Todo) => {
  editingTodo.value = todo
  todoForm.value = { ...todo }
  showNewTodoModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (editingTodo.value) {
      await todoStore.updateTodo({
        ...editingTodo.value,
        ...todoForm.value
      })
    } else {
      await todoStore.createTodo(todoForm.value)
    }
    showNewTodoModal.value = false
    todoForm.value = {
      title: '',
      status: '未対応',
      taskId: '',
      memo: ''
    }
  } catch (error) {
    useToast().add({
      title: 'エラー',
      description: '保存に失敗しました',
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}
</script>