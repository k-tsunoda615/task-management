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

        <div class="flex items-center gap-2">
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
import { mapAuthErrorToMessage } from "../../utils/auth";

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

/**
 * 新規登録を実行する。
 * @description 匿名ユーザーの場合は昇格、通常は新規登録を行う。
 * @returns {Promise<void>} 登録処理の完了。
 */
const handleSubmit = async () => {
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
      const { data: _updateData, error: updateError } =
        await client.auth.updateUser({ email: email.value });

      if (updateError) throw updateError;

      agreeTerms.value = false;
      emit("signup-success");
      router.push(props.redirectUrl || "/board");
    } else {
      // 通常の新規登録
      const { data: _data, error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;

      agreeTerms.value = false;
      emit("signup-success");
      router.push(props.redirectUrl || "/board");
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("認証エラー:", error);
    errorMessage.value = mapAuthErrorToMessage(error);
  } finally {
    loading.value = false;
  }
};
</script>
