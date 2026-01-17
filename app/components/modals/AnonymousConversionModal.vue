<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">アカウント設定</h3>
      </template>
      <div class="space-y-4 p-1">
        <div v-if="emailVerified">
          <div class="text-sm text-green-600 mb-4">
            <UIcon
              name="i-heroicons-check-circle"
              class="mr-1 h-5 w-5 inline-block"
            />
            メールアドレスが確認されました！パスワードを設定してアカウントを完成させてください。
          </div>
          <UFormGroup label="パスワード" class="mb-3">
            <UInput
              v-model="password"
              type="password"
              placeholder="8文字以上のパスワード"
              required
            />
          </UFormGroup>
          <UFormGroup label="パスワード (確認用)">
            <UInput
              v-model="passwordConfirm"
              type="password"
              placeholder="同じパスワードをもう一度入力"
              required
            />
          </UFormGroup>
          <div v-if="errorMessage" class="mt-3 text-sm text-red-600">
            {{ errorMessage }}
          </div>
        </div>
        <div v-else>
          <div class="text-sm text-gray-600">
            <UIcon
              name="i-heroicons-envelope"
              class="mr-1 h-5 w-5 inline-block"
            />
            メールの確認が完了していません。{{ email }}
            に送信された確認メールを確認してください。
          </div>
          <div class="mt-4 text-sm text-gray-600">
            メールが届かない場合は、迷惑メールフォルダを確認するか、再送信してください。
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            v-if="!emailVerified"
            color="gray"
            variant="ghost"
            @click="resendVerification"
          >
            確認メールを再送信
          </UButton>
          <UButton
            v-if="emailVerified"
            color="primary"
            :loading="loading"
            @click="setPassword"
          >
            パスワードを設定
          </UButton>
          <UButton color="gray" variant="ghost" @click="close">
            閉じる
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  email: string;
  emailVerified: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "resend"): void;
  (e: "set-password", password: string): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const password = ref("");
const passwordConfirm = ref("");
const errorMessage = ref("");
const loading = ref(false);

const setPassword = async () => {
  errorMessage.value = "";

  if (password.value.length < 8) {
    errorMessage.value = "パスワードは8文字以上で入力してください";
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = "パスワードが一致しません";
    return;
  }

  loading.value = true;
  emit("set-password", password.value);
};

const resendVerification = () => {
  emit("resend");
};

const close = () => {
  isOpen.value = false;
};
</script>
