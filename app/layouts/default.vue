<template>
  <div class="min-h-screen">
    <main class="p-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const loading = useState("auth-loading", () => true);
const initialized = ref(false);
const router = useRouter();
const route = useRoute();

onMounted(() => {
  // Google認証後の?code=がURLに含まれていたら/boardにリダイレクト
  if (route.query.code) {
    router.replace("/board");
    return;
  }
  // クライアントサイドでのみ実行
  const checkAuth = async () => {
    const client = useSupabaseClient();
    await client.auth.getSession();
    loading.value = false;
    initialized.value = true;
  };

  checkAuth();
});
</script>
