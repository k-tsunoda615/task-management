<template>
  <div class="login-card-container">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">おかえりなさい</h1>
      <p class="mt-2 text-gray-600">アカウントにログインしてください</p>
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
            placeholder="パスワードを入力"
            required
            :ui="{
              base: 'h-12',
            }"
          />
        </UFormGroup>

        <div class="mt-8 text-center text-sm text-gray-500 text-left">
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
          {{ loading ? "処理中..." : "ログイン" }}
        </UButton>
      </form>
    </UCard>

    <div class="mt-4 text-center">
      <UButton
        block
        color="gray"
        class="h-12 text-base mt-2"
        @click="handleGuestLogin"
      >
        ゲストとして始める
      </UButton>
    </div>

    <div class="mt-4 text-center">
      <UButton
        variant="link"
        color="primary"
        class="text-sm"
        @click="showResetModal = true"
      >
        パスワードをお忘れですか？
      </UButton>
    </div>

    <div v-if="errorMessage" class="mt-4 text-center">
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
          <UButton type="submit" :loading="resetLoading" block color="primary">
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
</template>

<script setup lang="ts">
const props = defineProps({
  redirectUrl: {
    type: String,
    default: "/board",
  },
});

const emit = defineEmits(["login-success", "guest-login"]);

const client = useSupabaseClient();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const showResetModal = ref(false);
const resetEmail = ref("");
const resetMessage = ref("");
const resetLoading = ref(false);

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
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) {
      errorMessage.value = getAuthErrorMessage(error);
    } else {
      emit("login-success");
      if (props.redirectUrl) {
        router.push(props.redirectUrl);
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
async function handleGuestLogin() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const { error } = await client.auth.signInAnonymously();
    if (error) {
      errorMessage.value = getAuthErrorMessage(error);
    } else {
      emit("guest-login");
      if (props.redirectUrl) {
        router.push(props.redirectUrl);
      }
    }
  } catch (e) {
    errorMessage.value = "ゲストログイン中にエラーが発生しました。";
  } finally {
    loading.value = false;
  }
}
</script>
