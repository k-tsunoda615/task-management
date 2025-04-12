<template>
  <div class="w-full max-w-md">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">タスク管理アプリ</h3>
        <p class="text-sm text-gray-500">ログインまたは新規登録</p>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="メールアドレス">
          <UInput
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </UFormGroup>

        <UFormGroup label="パスワード">
          <UInput
            v-model="password"
            type="password"
            placeholder="********"
            required
          />
        </UFormGroup>

        <UButton type="submit" :loading="loading" block>
          {{ loading ? "処理中..." : "続ける" }}
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);

// クライアントサイドでのみ実行されるようにする
onMounted(() => {
  watchEffect(() => {
    if (user.value) {
      router.push("/");
    }
  });
});

async function handleSubmit() {
  loading.value = true;

  try {
    const { error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        // 新規登録を試みる
        const { error: signUpError } = await client.auth.signUp({
          email: email.value,
          password: password.value,
        });

        if (signUpError) throw signUpError;

        useToast().add({
          title: "アカウント作成完了",
          description: "メールアドレスの確認をお願いします。",
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    useToast().add({
      title: "エラー",
      description:
        error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
}
</script>
