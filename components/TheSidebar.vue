<template>
  <aside class="w-64 bg-white border-r border-gray-200 p-4">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">プロジェクト</h2>
        <UButton
          icon="i-heroicons-plus"
          variant="ghost"
          size="sm"
          @click="showNewProjectModal = true"
        />
      </div>

      <div class="space-y-1">
        <UButton
          v-for="project in projects"
          :key="project.id"
          :variant="selectedProject?.id === project.id ? 'soft' : 'ghost'"
          block
          @click="selectProject(project)"
        >
          {{ project.title }}
        </UButton>
      </div>

      <UDivider />

      <div class="space-y-2">
        <UButton
          icon="i-heroicons-eye-slash"
          variant="ghost"
          block
          @click="togglePrivateTasks"
        >
          個人タスクを隠す
        </UButton>
        <UButton
          icon="i-heroicons-squares-2x2"
          variant="ghost"
          block
          @click="toggleMosaic"
        >
          画面をモザイク化
        </UButton>
      </div>
    </div>

    <!-- 新規プロジェクトモーダル -->
    <UModal v-model="showNewProjectModal">
      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">新規プロジェクト</h3>
        </template>
        <form @submit.prevent="createProject">
          <UFormGroup label="プロジェクト名">
            <UInput v-model="newProjectTitle" required />
          </UFormGroup>
          <div class="mt-4 flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="showNewProjectModal = false"
            >
              キャンセル
            </UButton>
            <UButton
              type="submit"
              :loading="creating"
            >
              作成
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </aside>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/stores/project'

const projectStore = useProjectStore()
const { projects, selectedProject } = storeToRefs(projectStore)

const showNewProjectModal = ref(false)
const newProjectTitle = ref('')
const creating = ref(false)

const selectProject = (project: Project) => {
  projectStore.setSelectedProject(project)
}

const createProject = async () => {
  creating.value = true
  try {
    await projectStore.createProject(newProjectTitle.value)
    showNewProjectModal.value = false
    newProjectTitle.value = ''
  } catch (error) {
    useToast().add({
      title: 'エラー',
      description: '作成に失敗しました',
      color: 'red'
    })
  } finally {
    creating.value = false
  }
}

const togglePrivateTasks = () => {
  projectStore.togglePrivateTasks()
}

const toggleMosaic = () => {
  // モザイク効果の実装
  document.body.style.filter = document.body.style.filter ? '' : 'blur(10px)'
}
</script>