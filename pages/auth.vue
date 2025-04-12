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
const emailNotConfirmed = ref(false);

// クライアントサイドでのみ実行されるようにする
onMounted(() => {
  // 初期状態のチェック
  if (user.value) {
    console.log("既にログイン済み:", user.value);
    router.push("/");
  }

  // ユーザー状態の変更を監視
  const unsubscribe = client.auth.onAuthStateChange((event, session) => {
    console.log("認証状態変更:", event, session?.user);
    if (event === "SIGNED_IN" && session?.user) {
      router.push("/");
    }
  });

  // コンポーネントのアンマウント時にリスナーを解除
  onUnmounted(() => {
    unsubscribe.data.subscription.unsubscribe();
  });
});

async function handleSubmit() {
  loading.value = true;

  try {
    // 基本的なサインイン処理
    const { data, error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    console.log("認証レスポンス:", data, error);

    if (error) {
      // エラーの種類に応じた処理
      if (error.message.includes("Email not confirmed")) {
        useToast().add({
          title: "メール確認が必要です",
          description: "登録時に送信された確認メールをご確認ください。",
          color: "orange",
        });
      } else if (error.message.includes("Invalid login credentials")) {
        // 新規登録処理
        await handleSignUp();
      } else {
        throw error;
      }
    } else if (data.user) {
      // ログイン成功
      router.push("/");
    }
  } catch (error) {
    console.error("認証エラー:", error);
    useToast().add({
      title: "エラー",
      description:
        error instanceof Error ? error.message : "認証エラーが発生しました",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
}

// 新規登録処理を別関数に分離
async function handleSignUp() {
  try {
    const { data, error } = await client.auth.signUp({
      email: email.value,
      password: password.value,
    });

    console.log("新規登録レスポンス:", data, error);

    if (error) throw error;

    useToast().add({
      title: "アカウント作成完了",
      description: "メールアドレスの確認をお願いします。",
    });
  } catch (error) {
    console.error("新規登録エラー:", error);
    throw error;
  }
}

const resendConfirmation = async () => {
  try {
    loading.value = true;
    const { error } = await client.auth.resend({
      type: "signup",
      email: email.value,
    });

    if (error) throw error;

    useToast().add({
      title: "確認メール再送信",
      description: "確認メールを再送信しました。メールをご確認ください。",
    });
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
};
</script>
