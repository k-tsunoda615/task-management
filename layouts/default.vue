<template>
  <div class="min-h-screen bg-gray-50">
    <!-- クライアントサイドでのみ評価される loading 状態 -->
    <ClientOnly>
      <div v-if="loading" class="flex h-screen items-center justify-center">
        <USpinner size="lg" />
      </div>
      <div v-else-if="!user" class="flex h-screen items-center justify-center">
        <slot />
      </div>
      <div v-else class="flex h-screen">
        <TheSidebar />
        <main class="flex-1 overflow-x-auto p-6">
          <slot />
        </main>
      </div>

      <!-- フォールバックコンテンツ -->
      <template #fallback>
        <div class="flex h-screen items-center justify-center">
          <USpinner size="lg" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const loading = ref(true);

onMounted(() => {
  // クライアントサイドでのみ実行
  loading.value = false;
});
</script>
