<template>
  <ClientOnly>
    <div v-if="user">
      <KanbanBoard />
    </div>
    <UCard v-else>
      <template #header>
        <h3 class="text-base font-semibold leading-6 text-gray-900">
          ログインが必要です
        </h3>
      </template>
      <p class="text-sm text-gray-500">
        タスク管理機能を利用するにはログインしてください。
      </p>
      <template #footer>
        <NuxtLink to="/auth" class="text-sm font-medium text-primary-600">
          ログインページへ
        </NuxtLink>
      </template>
    </UCard>

    <template #fallback>
      <div class="flex items-center justify-center p-4">
        <USpinner />
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
</script>
