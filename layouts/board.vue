<template>
  <div class="min-h-screen">
    <!-- クライアントサイドでのみ評価される loading 状態 -->
    <ClientOnly>
      <div
        v-if="loading"
        class="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="text-center">
          <USpinner size="lg" class="mb-4" />
          <p class="text-gray-600">読み込み中...</p>
        </div>
      </div>
      <div
        v-if="!initialized"
        class="flex min-h-screen items-center justify-center"
      >
        <USpinner size="lg" />
      </div>
      <div v-else-if="initialized && !user">
        <slot />
      </div>
      <div v-else-if="initialized && user">
        <TheSidebar />
        <main
          class="transition-all duration-300 p-4"
          :class="{ 'ml-64': sidebarOpen, 'ml-16': !sidebarOpen }"
        >
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
const loading = useState("auth-loading", () => true);
const initialized = ref(false);

// サイドバーの状態を監視
const sidebarOpen = ref(true);

onMounted(() => {
  // クライアントサイドでのみ実行
  const checkAuth = async () => {
    const client = useSupabaseClient();
    const { data } = await client.auth.getSession();
    loading.value = false;
    initialized.value = true;
  };

  checkAuth();

  // サイドバーの状態を初期化
  const savedState = localStorage.getItem("sidebarOpen");
  if (savedState !== null) {
    sidebarOpen.value = savedState === "true";
  }

  // サイドバーの状態変更を監視（カスタムイベント）
  window.addEventListener("sidebarToggle", (event: any) => {
    sidebarOpen.value = event.detail.isOpen;
  });
});
</script>
