<template>
  <UButton
    block
    color="gray"
    class="h-12 text-base"
    :loading="loading"
    @click="handleGuestLogin"
  >
    {{ loading ? "処理中..." : "ゲストとして始める" }}
  </UButton>
  <div v-if="errorMessage" class="mt-2 text-center">
    <div class="bg-red-100 text-red-700 px-4 py-2 rounded">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const router = useRouter();

const loading = ref(false);
const errorMessage = ref("");

const emit = defineEmits<{
  (e: "error", message: string): void;
}>();

// ログイン成功後の遷移先を指定するプロップ
const props = defineProps({
  redirectTo: {
    type: String,
    default: "/board",
  },
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

// ゲストログイン処理
const handleGuestLogin = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const { data, error } = await client.auth.signInAnonymously();
    if (error) {
      errorMessage.value = getAuthErrorMessage(error);
      emit("error", errorMessage.value);
    } else if (data?.user) {
      // ログイン成功時にリダイレクト
      router.push(props.redirectTo);
    }
  } catch (e) {
    errorMessage.value = "ゲストログイン中にエラーが発生しました。";
    emit("error", errorMessage.value);
  } finally {
    loading.value = false;
  }
};
</script>
