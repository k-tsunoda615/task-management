<template>
  <div class="w-64 bg-white p-4 shadow">
    <div class="mb-6">
      <h2 class="mb-2 text-lg font-semibold">タスク管理</h2>
      <div class="mb-4">
        <UButton
          block
          :color="todoStore.showPrivateTasks ? 'primary' : 'gray'"
          :variant="todoStore.showPrivateTasks ? 'soft' : 'ghost'"
          @click="todoStore.togglePrivateTasks"
          :icon="
            todoStore.showPrivateTasks
              ? 'i-heroicons-eye'
              : 'i-heroicons-eye-slash'
          "
        >
        </UButton>
      </div>
      <UButton
        variant="ghost"
        block
        @click="logout"
        icon="i-heroicons-arrow-right-on-rectangle"
      >
        ログアウト
      </UButton>
    </div>

    <div class="mb-4">
      <h3 class="mb-2 font-medium">プロジェクト</h3>
      <ul class="space-y-1">
        <li v-for="project in projectStore.projects" :key="project.id">
          <UButton
            block
            variant="ghost"
            :color="
              projectStore.selectedProject?.id === project.id
                ? 'primary'
                : 'gray'
            "
            @click="projectStore.setSelectedProject(project)"
          >
            {{ project.title }}
          </UButton>
        </li>
      </ul>
    </div>

    <!-- ゴミ箱エリア -->
    <div
      class="mt-auto p-3 bg-red-50 rounded-lg border border-red-200 flex items-center"
      @dragover.prevent
      @drop="handleTrashDrop"
    >
      <UIcon name="i-heroicons-trash" class="text-red-500 mr-2" />
      <span class="text-red-700">ドラッグで削除</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "~/stores/project";
import { useTodoStore } from "~/stores/todo";
import { useEventBus } from "@vueuse/core";

const client = useSupabaseClient();
const router = useRouter();
const projectStore = useProjectStore();
const todoStore = useTodoStore();

const trashEventBus = useEventBus("trash-drop");

const logout = async () => {
  await client.auth.signOut();
  router.push("/auth");
};

onMounted(async () => {
  await projectStore.fetchProjects();
});

// ゴミ箱へのドロップを処理
const handleTrashDrop = (event) => {
  const todoId = event.dataTransfer.getData("todoId");
  if (todoId) {
    trashEventBus.emit(todoId);
  }
};
</script>
