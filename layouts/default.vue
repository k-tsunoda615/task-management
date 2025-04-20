<template>
  <div class="bg-gray-50">
    <!-- クライアントサイドでのみ評価される loading 状態 -->
    <ClientOnly>
      <div v-if="loading" class="flex min-h-screen items-center justify-center">
        <USpinner size="lg" />
      </div>
      <div v-else-if="!user">
        <slot />
      </div>
      <div v-else class="flex min-h-screen">
        <TheSidebar />
        <main class="flex-1 overflow-x-auto p-6">
          <slot />
        </main>
      </div>

      <!-- フォールバックコンテンツ -->
      <template #fallback>
        <div class="flex min-h-screen items-center justify-center">
          <USpinner size="lg" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const loading = ref(true);
const isAuthenticated = ref(false);

onMounted(() => {
  // クライアントサイドでのみ実行
  const checkAuth = async () => {
    const client = useSupabaseClient();
    const { data } = await client.auth.getSession();
    isAuthenticated.value = !!data.session;
    loading.value = false;
    console.log("認証状態:", isAuthenticated.value, data.session);
  };

  checkAuth();
});
</script>
