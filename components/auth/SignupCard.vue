<template>
  <div :class="['signup-card-container', props.class]">
    <div class="text-center mb-8">
      <h1 v-if="showTitle" class="text-2xl font-bold text-gray-900">
        新規アカウントの作成
      </h1>
      <p v-if="showSubtitle" class="mt-2 text-gray-600">
        メールアドレスとパスワードを入力してください
      </p>
    </div>

    <UCard :class="cardClass">
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

        <div class="flex items-center gap-2">
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

        <UButton
          type="submit"
          :loading="loading"
          block
          color="primary"
          class="h-12 text-base"
        >
          {{ loading ? "処理中..." : "アカウントを作成" }}
        </UButton>
      </form>
    </UCard>

    <div v-if="errorMessage" class="mt-4 text-center">
      <div class="bg-red-100 text-red-700 px-4 py-2 rounded">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  redirectUrl: {
    type: String,
    default: "/board",
  },
  class: {
    type: String,
    default: "",
  },
  cardClass: {
    type: String,
    default: "",
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
  showSubtitle: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["signup-success"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const agreeTerms = ref(false);

// エラーメッセージ日本語化関数
function getAuthErrorMessage(error: any): string {
  if (!error || !error.message) return "認証に失敗しました";
  const msg = error.message;
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
  return msg; // その他は原文表示
}

async function handleSubmit() {
  if (!email.value || !password.value) return;
  if (!agreeTerms.value) {
    errorMessage.value = "利用規約とプライバシーポリシーに同意してください。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    // 匿名ユーザーから永続的なユーザーへの変換
    if (user.value?.is_anonymous) {
      // メールアドレスのみ更新
      const { data: updateData, error: updateError } =
        await client.auth.updateUser({
          email: email.value,
        });

      if (updateError) {
        throw updateError;
      }

      errorMessage.value =
        "確認メールを送信しました。メールボックスを確認して確認リンクをクリックしてください。確認後にパスワードが設定されます。";
      agreeTerms.value = false;
      emit("signup-success");
    } else {
      // 通常の新規登録
      const { data, error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      errorMessage.value =
        "確認メールを送信しました。メールボックスをご確認ください。";
      agreeTerms.value = false;
      emit("signup-success");
    }
  } catch (error: any) {
    console.error("認証エラー:", error);
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    loading.value = false;
  }
}
</script>
