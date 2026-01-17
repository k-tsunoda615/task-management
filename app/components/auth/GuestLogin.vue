<template>
  <UButton
    block
    color="gray"
    :class="['h-12 text-base', props.class]"
    :loading="loading"
    @click="handleGuestLogin"
  >
    {{ loading ? "処理中..." : buttonText }}
  </UButton>
  <div v-if="errorMessage" class="mt-2 text-center">
    <div class="bg-red-100 text-red-700 px-4 py-2 rounded">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { mapAuthErrorToMessage } from "../../utils/auth";

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
  class: {
    type: String,
    default: "",
  },
  buttonText: {
    type: String,
    default: "ゲストとして始める",
  },
});

/**
 * ゲストログインを実行する。
 * @description 匿名ログイン後に遷移し、エラーは親へ通知する。
 * @returns {Promise<void>} ゲストログインの完了。
 */
const handleGuestLogin = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const { data, error } = await client.auth.signInAnonymously();
    if (error) {
      errorMessage.value = mapAuthErrorToMessage(error);
      emit("error", errorMessage.value);
    } else if (data?.user) {
      // ログイン成功時にリダイレクト
      router.push(props.redirectTo);
    }
  } catch {
    errorMessage.value = "ゲストログイン中にエラーが発生しました。";
    emit("error", errorMessage.value);
  } finally {
    loading.value = false;
  }
};
</script>
