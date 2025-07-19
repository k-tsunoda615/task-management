<template>
  <div class="login-form-container">
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

    <!-- ログインフォーム -->
    <AuthLoginCard
      v-if="!isSignUp"
      :redirect-url="redirectUrl"
      @login-success="handleLoginSuccess"
      @guest-login="handleGuestLogin"
    />

    <!-- 新規登録フォーム -->
    <AuthSignupCard
      v-else
      :redirect-url="redirectUrl"
      @signup-success="handleSignupSuccess"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  showGuestLogin: {
    type: Boolean,
    default: true,
  },
  redirectUrl: {
    type: String,
    default: "/board",
  },
  initialSignUp: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["login-success", "signup-success", "guest-login"]);

const isSignUp = ref(props.initialSignUp);

// ログイン成功時のハンドラー
const handleLoginSuccess = () => {
  emit("login-success");
};

// 新規登録成功時のハンドラー
const handleSignupSuccess = () => {
  emit("signup-success");
};

// ゲストログイン成功時のハンドラー
const handleGuestLogin = () => {
  emit("guest-login");
};
</script>
