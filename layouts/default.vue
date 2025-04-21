<template>
  <div class="min-h-screen">
    <TheSidebar />
    <main class="ml-64 p-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const loading = useState("auth-loading", () => true);
const initialized = ref(false);

onMounted(() => {
  // クライアントサイドでのみ実行
  const checkAuth = async () => {
    const client = useSupabaseClient();
    const { data } = await client.auth.getSession();
    loading.value = false;
    initialized.value = true;
  };

  checkAuth();
});
</script>
