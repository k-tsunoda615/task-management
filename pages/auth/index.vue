<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
    <div class="container mx-auto">
      <div class="max-w-md mx-auto">
        <AuthLoginForm
          :initial-sign-up="isSignUpTab"
          :redirect-url="'/board'"
          @login-success="handleLoginSuccess"
          @signup-success="handleSignupSuccess"
          @guest-login="handleGuestLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const isSignUpTab = ref(route.query.signup === "1");

// ログイン成功時のハンドラー
const handleLoginSuccess = () => {
  // ここに追加のログイン成功時の処理を記述
  console.log("ログイン成功");
};

// 新規登録成功時のハンドラー
const handleSignupSuccess = () => {
  // ここに追加の新規登録成功時の処理を記述
  console.log("新規登録成功");
};

// ゲストログイン成功時のハンドラー
const handleGuestLogin = () => {
  // ここに追加のゲストログイン成功時の処理を記述
  console.log("ゲストログイン成功");
};
</script>
