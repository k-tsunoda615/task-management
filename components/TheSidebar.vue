<template>
  <div class="w-64 bg-white p-4 shadow">
    <div class="mb-6">
      <h2 class="mb-2 text-lg font-semibold">タスク管理</h2>
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
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "~/stores/project";

const client = useSupabaseClient();
const router = useRouter();
const projectStore = useProjectStore();

const logout = async () => {
  await client.auth.signOut();
  router.push("/auth");
};

onMounted(async () => {
  await projectStore.fetchProjects();
});
</script>
