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

/**
 * 初期表示時に認証状態を確認する。
 * @description Supabase セッションを取得し、初期化フラグを更新する。
 * @returns {Promise<void>} 認証確認の完了。
 */
const checkAuth = async () => {
  const client = useSupabaseClient();
  await client.auth.getSession();
  loading.value = false;
  initialized.value = true;
};

onMounted(() => {
  // Google認証後の?code=がURLに含まれていたら/boardにリダイレクト
  if (route.query.code) {
    router.replace("/board");
    return;
  }
  // クライアントサイドでのみ実行
  checkAuth();
});
</script>
