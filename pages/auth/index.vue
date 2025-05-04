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

            <div v-if="isSignUp" class="flex items-center gap-2">
              <input
                id="agreeTerms"
                type="checkbox"
                v-model="agreeTerms"
                class="w-4 h-4"
              />
              <label for="agreeTerms" class="text-sm text-gray-700 select-none">
                <a
                  href="#"
                  class="text-primary-600 hover:text-primary-700 underline"
                  >利用規約</a
                >
                <span>と</span>
                <a
                  href="#"
                  class="text-primary-600 hover:text-primary-700 underline"
                  >プライバシーポリシー</a
                >
                <span>に同意します</span>
              </label>
            </div>
            <div
              v-else
              class="mt-8 text-center text-sm text-gray-500 text-left"
            >
              <p>
                続行で
                <a href="#" class="text-primary-600 hover:text-primary-700"
                  >利用規約</a
                >
                と
                <a href="#" class="text-primary-600 hover:text-primary-700"
                  >プライバシーポリシー</a
                >
                に同意します。
              </p>
            </div>

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

        <div v-if="!isSignUp" class="mt-4 text-center">
          <UButton
            block
            color="gray"
            class="h-12 text-base mt-2"
            @click="handleGuestLogin"
          >
            ゲストとして始める
          </UButton>
        </div>

        <div v-if="errorMessage" class="mb-4 text-center">
          <div class="bg-red-100 text-red-700 px-4 py-2 rounded">
            {{ errorMessage }}
          </div>
        </div>

        <!-- パスワードリセットモーダル -->
        <UModal v-model="showResetModal">
          <UCard>
            <template #header>
              <div class="text-lg font-bold">パスワードリセット</div>
            </template>
            <form @submit.prevent="handleResetPassword" class="space-y-4">
              <UFormGroup label="メールアドレス">
                <UInput
                  v-model="resetEmail"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </UFormGroup>
              <UButton
                type="submit"
                :loading="resetLoading"
                block
                color="primary"
              >
                リセットメールを送信
              </UButton>
              <div
                v-if="resetMessage"
                class="mt-2 text-center text-sm"
                :class="
                  resetMessage.includes('送信しました')
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ resetMessage }}
              </div>
            </form>
            <template #footer>
              <div class="flex justify-end">
                <UButton variant="ghost" @click="showResetModal = false"
                  >閉じる</UButton
                >
              </div>
            </template>
          </UCard>
        </UModal>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const isSignUp = ref(false);
const errorMessage = ref("");
const showResetModal = ref(false);
const resetEmail = ref("");
const resetMessage = ref("");
const resetLoading = ref(false);
const agreeTerms = ref(false);

// 認証状態の変更を監視
onMounted(() => {
  const unsubscribe = client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      router.push("/board");
    }
  });

  // コンポーネントのアンマウント時にリスナーを解除
  onUnmounted(() => {
    unsubscribe.data.subscription.unsubscribe();
  });
});

// エラーメッセージ日本語化関数
function getAuthErrorMessage(error: any): string {
  if (!error || !error.message) return "認証に失敗しました";
  const msg = error.message;
  if (msg.includes("Invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  if (msg.includes("Email not confirmed")) {
    return "メールアドレスの確認が完了していません。メールボックスをご確認ください。";
  }
  if (
    msg.includes("User already registered") ||
    msg.includes("User already exists")
  ) {
    return "このメールアドレスは既に登録されています";
  }
  if (msg.match(/Password should be at least (\d+) characters/)) {
    return "パスワードが短すぎます。8文字以上で入力してください。";
  }
  if (msg.includes("Password should contain at least one special character")) {
    return "パスワードには記号を1つ以上含めてください。";
  }
  if (msg.includes("Password should contain at least one number")) {
    return "パスワードには数字を1つ以上含めてください。";
  }
  if (msg.includes("Password should contain at least one uppercase letter")) {
    return "パスワードには大文字を1つ以上含めてください。";
  }
  if (msg.includes("Email is invalid") || msg.includes("Invalid email")) {
    return "メールアドレスの形式が正しくありません";
  }
  if (msg.includes("Rate limit exceeded")) {
    return "リクエストが多すぎます。しばらくしてから再度お試しください。";
  }
  if (msg.includes("network error")) {
    return "ネットワークエラーが発生しました。接続環境をご確認ください。";
  }
  return msg; // その他は原文表示
}

async function handleSubmit() {
  if (!email.value || !password.value) return;
  loading.value = true;
  errorMessage.value = "";
  if (isSignUp.value && !agreeTerms.value) {
    errorMessage.value = "利用規約とプライバシーポリシーに同意してください。";
    loading.value = false;
    return;
  }
  try {
    if (isSignUp.value) {
      // 新規登録処理
      const { data, error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;

      errorMessage.value =
        "確認メールを送信しました。メールボックスをご確認ください。";
      agreeTerms.value = false;
    } else {
      // ログイン処理
      const { data, error } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) {
        errorMessage.value = getAuthErrorMessage(error);
      } else {
        // ログイン成功時に明示的にリダイレクト
        router.push("/board");
      }
    }
  } catch (error: any) {
    console.error("認証エラー:", error);
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

async function handleResetPassword() {
  resetMessage.value = "";
  if (!resetEmail.value) {
    resetMessage.value = "メールアドレスを入力してください。";
    return;
  }
  resetLoading.value = true;
  try {
    const { error } = await client.auth.resetPasswordForEmail(resetEmail.value);
    if (error) {
      resetMessage.value = getAuthErrorMessage(error);
    } else {
      resetMessage.value =
        "パスワードリセット用のメールを送信しました。メールボックスをご確認ください。";
    }
  } catch (e) {
    resetMessage.value = "リセット処理中にエラーが発生しました。";
  } finally {
    resetLoading.value = false;
  }
}

// ゲストログイン処理
const handleGuestLogin = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const { error } = await client.auth.signInAnonymously();
    if (error) {
      errorMessage.value = getAuthErrorMessage(error);
    }
  } catch (e) {
    errorMessage.value = "ゲストログイン中にエラーが発生しました。";
  } finally {
    loading.value = false;
  }
};
</script>
