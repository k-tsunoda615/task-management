<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
    <div class="container mx-auto">
      <div class="max-w-md mx-auto">
        <div v-if="loading" class="text-center">
          <USpinner size="lg" class="mb-4" />
          <p class="text-gray-600">メール確認を処理中...</p>
        </div>

        <div v-else-if="error" class="text-center">
          <UIcon
            name="i-heroicons-exclamation-circle"
            class="w-16 h-16 mx-auto text-red-500 mb-4"
          />
          <h1 class="text-2xl font-bold text-gray-900 mb-2">確認エラー</h1>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <UButton to="/auth" color="primary">ログインページへ戻る</UButton>
        </div>

        <div v-else class="text-center">
          <UIcon
            name="i-heroicons-check-circle"
            class="w-16 h-16 mx-auto text-green-500 mb-4"
          />
          <h1 class="text-2xl font-bold text-gray-900 mb-2">メール確認完了</h1>
          <p class="text-gray-600 mb-6">
            {{ confirmationMessage }}
          </p>

          <!-- 通常のユーザー向け -->
          <div v-if="!isAnonymousUpgrade">
            <UButton to="/board" color="primary">進む</UButton>
          </div>

          <!-- 匿名→永続ユーザーへのアップグレード -->
          <div v-else class="space-y-4">
            <!-- パスワード設定フォーム -->
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">
                  アカウント設定を完了してください
                </h3>
              </template>
              <div class="space-y-4 p-1">
                <div class="text-sm text-green-600 mb-4 text-left">
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="mr-1 h-5 w-5 inline-block"
                  />
                  メールアドレスの確認が完了しました！パスワードを設定して、アカウントのセットアップを完了してください。
                </div>
                <UFormGroup label="パスワード" class="text-left">
                  <UInput
                    v-model="password"
                    type="password"
                    placeholder="8文字以上のパスワード"
                    required
                  />
                </UFormGroup>
                <UFormGroup label="パスワード (確認用)" class="text-left">
                  <UInput
                    v-model="passwordConfirm"
                    type="password"
                    placeholder="同じパスワードをもう一度入力"
                    required
                  />
                </UFormGroup>
                <div
                  v-if="passwordError"
                  class="mt-3 text-sm text-red-600 text-left"
                >
                  {{ passwordError }}
                </div>
              </div>
              <template #footer>
                <div class="flex justify-end">
                  <UButton
                    color="primary"
                    :loading="updatingPassword"
                    @click="completeAnonymousUpgrade"
                  >
                    パスワード設定を完了
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const client = useSupabaseClient();
const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref("");
const confirmationMessage = ref("メールアドレスが確認されました。");
const isAnonymousUpgrade = ref(false);

// パスワード設定関連
const password = ref("");
const passwordConfirm = ref("");
const passwordError = ref("");
const updatingPassword = ref(false);

onMounted(async () => {
  const hash = route.hash;

  if (!hash) {
    error.value = "確認リンクが無効です。";
    loading.value = false;
    return;
  }

  try {
    // SupabaseのURLからハッシュを取り出す方法（例：#access_token=...&type=...）
    const hashParams = new URLSearchParams(
      hash.substring(1), // #を除去
    );

    const type = hashParams.get("type");

    // メール確認フロー
    if (type === "email_change" || type === "signup") {
      const { data, error: verifyError } = await client.auth.getSession();

      if (verifyError) {
        throw verifyError;
      }

      // ユーザーが匿名ユーザーからのアップグレードかチェック
      const user = data?.session?.user;
      isAnonymousUpgrade.value = user?.is_anonymous === true || false;

      if (isAnonymousUpgrade.value) {
        confirmationMessage.value =
          "メールアドレスが確認されました。パスワードを設定して本登録を完了してください。";

        // 匿名ユーザーからのアップグレードの場合、自動的にメール確認
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
          if (supabaseUrl && user?.id) {
            // セッションを取得
            const { data: sessionData } = await client.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            // Edge Functionを呼び出してメールを自動確認
            const response = await fetch(
              `${supabaseUrl}/functions/v1/auto-confirm-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ user_id: user.id }),
              },
            );

            if (!response.ok) {
              console.warn(
                "メールの自動確認に失敗しました - ユーザーはメール確認が必要です",
              );
            } else {
              console.log("メールが自動的に確認されました");
            }
          }
        } catch (autoConfirmError) {
          console.error("メール自動確認エラー:", autoConfirmError);
          // 自動確認に失敗してもユーザー体験を中断しない
        }
      }
    } else {
      error.value = "不明な確認タイプです。";
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("確認エラー:", e);
    error.value = e.message || "確認処理中にエラーが発生しました。";
  } finally {
    loading.value = false;
  }
});

const completeAnonymousUpgrade = async () => {
  passwordError.value = "";

  if (password.value.length < 8) {
    passwordError.value = "パスワードは8文字以上で入力してください。";
    return;
  }

  if (password.value !== passwordConfirm.value) {
    passwordError.value = "パスワードが一致しません。";
    return;
  }

  updatingPassword.value = true;

  try {
    // パスワードを設定して匿名ユーザーのアップグレードを完了
    const { error: updateError } = await client.auth.updateUser({
      password: password.value,
    });

    if (updateError) throw updateError;

    // 成功したらダッシュボードにリダイレクト
    router.push("/board");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("パスワード設定エラー:", e);
    passwordError.value =
      e.message || "パスワードの設定中にエラーが発生しました。";
  } finally {
    updatingPassword.value = false;
  }
};
</script>
