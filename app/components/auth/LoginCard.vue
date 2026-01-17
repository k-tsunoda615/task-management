<template>
  <div class="login-card-container">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">おかえりなさい</h1>
      <p class="mt-2 text-gray-600">アカウントにログインしてください</p>
    </div>

    <UCard>
      <form class="space-y-4" @submit.prevent="handleSubmit">
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

    <!-- Googleサインインボタン追加 -->
    <div class="mt-2 text-center">
      <UButton
        block
        color="white"
        class="h-12 text-base border border-gray-300 flex items-center justify-center gap-2"
        @click="handleGoogleSignIn"
      >
        <svg class="w-5 h-5" viewBox="0 0 48 48">
          <g>
            <path
              fill="#4285F4"
              d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.9 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.5-4z"
            />
            <path
              fill="#34A853"
              d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.9 3 24 3 16.3 3 9.4 7.6 6.3 14.7z"
            />
            <path
              fill="#FBBC05"
              d="M24 45c6.1 0 11.2-2 14.9-5.4l-6.9-5.7C29.7 35.7 27 36.5 24 36.5c-6.1 0-11.2-4.1-13-9.6l-7 5.4C9.4 40.4 16.3 45 24 45z"
            />
            <path
              fill="#EA4335"
              d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.7 7.5-11.7 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.9 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.5-4z"
            />
          </g>
        </svg>
        Googleでログイン
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
        <form class="space-y-4" @submit.prevent="handleResetPassword">
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
import { mapAuthErrorToMessage } from "../../utils/auth";

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
      errorMessage.value = mapAuthErrorToMessage(error);
    } else {
      emit("login-success");
      if (props.redirectUrl) {
        router.push(props.redirectUrl);
      }
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("認証エラー:", error);
    errorMessage.value = mapAuthErrorToMessage(error);
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
      resetMessage.value = mapAuthErrorToMessage(error);
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
      errorMessage.value = mapAuthErrorToMessage(error);
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

// Googleサインイン関数
async function handleGoogleSignIn() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const config = useRuntimeConfig();
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          String(config.public.NUXT_SUPABASE_CALLBACK_URL) || undefined,
      },
    });
    if (error) {
      errorMessage.value = mapAuthErrorToMessage(error);
    }
    // 通常、リダイレクトされるのでここでの処理は不要
  } catch (e) {
    errorMessage.value = "Googleログイン中にエラーが発生しました。";
  } finally {
    loading.value = false;
  }
}
</script>
