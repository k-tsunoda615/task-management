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
                v-model="agreeTerms"
                type="checkbox"
                class="w-4 h-4"
              >
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
          <AuthGuestLogin @error="handleGuestLoginError" />
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
            <form class="space-y-4" @submit.prevent="handleResetPassword">
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
import { useRoute } from "vue-router";
import { mapAuthErrorToMessage } from "../../utils/auth";

definePageMeta({
  middleware: ["auth"],
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const route = useRoute();

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

onMounted(() => {
  // signup=1 で新規登録タブを自動で開く
  if (route.query.signup === "1") {
    isSignUp.value = true;
  }

  const unsubscribe = client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      router.push("/board");
    }
  });

  onUnmounted(() => {
    unsubscribe.data.subscription.unsubscribe();
  });
});

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
      // 匿名ユーザーから永続的なユーザーへの変換
      if (user.value?.is_anonymous) {
        // 1. まずメールアドレスのみ更新（パスワードはまだ設定しない）
        const { data: _updateData, error: updateError } =
          await client.auth.updateUser({
            email: email.value,
          });

        if (updateError) {
          // メール更新でエラーが発生した場合（すでに登録済みのメールなど）
          throw updateError;
        }

        // 成功メッセージを表示（メール確認が必要）
        errorMessage.value =
          "確認メールを送信しました。メールボックスを確認して確認リンクをクリックしてください。確認後にパスワードが設定されます。";
        // 注意: この時点ではメール確認されていないのでパスワードは設定されていない
        agreeTerms.value = false;
      } else {
        // 通常の新規登録
        const { data: _data, error } = await client.auth.signUp({
          email: email.value,
          password: password.value,
        });
        if (error) throw error;
        errorMessage.value =
          "確認メールを送信しました。メールボックスをご確認ください。";
        agreeTerms.value = false;
      }
    } else {
      // 通常のログイン処理
      const { data: _data, error } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) {
        errorMessage.value = mapAuthErrorToMessage(error);
      } else {
        router.push("/board");
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
  } catch {
    resetMessage.value = "リセット処理中にエラーが発生しました。";
  } finally {
    resetLoading.value = false;
  }
}

// ゲストログインのエラーハンドリング
function handleGuestLoginError(message: string) {
  errorMessage.value = message;
}
</script>
