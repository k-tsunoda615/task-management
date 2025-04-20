<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
    <div class="container mx-auto">
      <div class="max-w-md mx-auto">
        <!-- タブ切り替え -->
        <div class="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
          <button
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
            :class="[
              !isSignUp
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
            @click="isSignUp = false"
          >
            ログイン
          </button>
          <button
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
            :class="[
              isSignUp
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
            @click="isSignUp = true"
          >
            新規登録
          </button>
        </div>

        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isSignUp ? "新規アカウントの作成" : "おかえりなさい" }}
          </h1>
          <p class="mt-2 text-gray-600">
            {{
              isSignUp
                ? "メールアドレスとパスワードを入力してください"
                : "アカウントにログインしてください"
            }}
          </p>
        </div>

        <UCard>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormGroup label="メールアドレス">
              <UInput
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                :ui="{
                  base: 'h-12',
                }"
              />
            </UFormGroup>

            <UFormGroup label="パスワード">
              <UInput
                v-model="password"
                type="password"
                placeholder="8文字以上のパスワード"
                required
                :ui="{
                  base: 'h-12',
                }"
              />
            </UFormGroup>

            <UButton
              type="submit"
              :loading="loading"
              block
              color="primary"
              class="h-12 text-base"
            >
              {{
                loading
                  ? "処理中..."
                  : isSignUp
                    ? "アカウントを作成"
                    : "ログイン"
              }}
            </UButton>
          </form>
        </UCard>

        <div class="mt-8 text-center text-sm text-gray-500">
          <p>
            続行することで、
            <a href="#" class="text-primary-600 hover:text-primary-700"
              >利用規約</a
            >
            と
            <a href="#" class="text-primary-600 hover:text-primary-700"
              >プライバシーポリシー</a
            >
            に同意したことになります。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const isSignUp = ref(false);

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
  if (!email.value || !password.value) return;
  loading.value = true;

  try {
    if (isSignUp.value) {
      // 新規登録処理
      const { data, error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;

      useToast().add({
        title: "確認メールを送信しました",
        description: "メールボックスをご確認ください",
        color: "green",
      });
    } else {
      // ログイン処理
      const { data, error } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          useToast().add({
            title: "ログインエラー",
            description: "メールアドレスまたはパスワードが正しくありません",
            color: "red",
          });
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("認証エラー:", error);
    useToast().add({
      title: "エラーが発生しました",
      description:
        error instanceof Error ? error.message : "認証に失敗しました",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
}
</script>
