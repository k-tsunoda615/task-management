<template>
  <div
    class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h4 class="font-medium text-sm">{{ todo.title }}</h4>
        <p v-if="todo.memo" class="text-xs text-gray-500 mt-1 line-clamp-2">
          {{ todo.memo }}
        </p>
      </div>
      <UButton
        icon="i-heroicons-trash"
        color="red"
        variant="ghost"
        size="xs"
        class="ml-2"
        @click.stop="confirmDelete"
      />
    </div>
    <div class="mt-2 flex items-center gap-2">
      <UBadge
        v-if="task"
        size="sm"
        color="gray"
      >
        {{ task.title }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from '~/stores/todo'

const props = defineProps<{
  todo: Todo
}>()

const todoStore = useTodoStore()
const { tasks } = storeToRefs(todoStore)

const task = computed(() => {
  return tasks.value.find(t => t.id === props.todo.taskId)
})

const confirmDelete = async () => {
  if (!confirm('このTodoを削除してもよろしいですか？')) return
  
  try {
    await todoStore.deleteTodo(props.todo.id)
    useToast().add({
      title: '削除完了',
      description: 'Todoを削除しました',
    })
  } catch (error) {
    useToast().add({
      title: 'エラー',
      description: '削除に失敗しました',
      color: 'red'
    })
  }
}
</script>