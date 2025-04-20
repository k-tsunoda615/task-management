<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- ヒーローセクション -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              class="text-4xl md:text-5xl font-bold text-gray-900 !leading-[1.2]"
            >
              インストール不要、<br />
              ブラウザだけで完結。<br />
              <span class="text-primary-600">セキュアで直感的な</span><br />
              タスク管理ツール
            </h1>
            <p class="mt-6 text-lg text-gray-600 leading-relaxed">
              面倒な設定やインストールは一切不要。<br />
              ブラウザを開くだけで、すぐにタスク管理を始められます。
            </p>
            <div class="mt-8 flex gap-4">
              <UButton
                to="/auth"
                size="xl"
                color="primary"
                class="rounded-full px-8 py-4"
              >
                <span class="text-lg">無料で始める</span>
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
              <UButton
                @click="scrollToFeatures"
                size="xl"
                variant="ghost"
                color="gray"
                class="rounded-full px-8 py-4"
              >
                <span class="text-lg">機能を見る</span>
                <UIcon name="i-heroicons-arrow-down" class="ml-2" />
              </UButton>
            </div>
          </div>
          <div class="relative">
            <img
              src="https://placehold.jp/500x400.png"
              alt="カンバンボードのスクリーンショット"
              class="rounded-lg shadow-2xl"
            />
            <div
              class="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-clock"
                  class="text-primary-600 w-6 h-6"
                />
                <p class="font-medium">30秒でセットアップ完了</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特徴セクション -->
    <section id="features" class="py-20 bg-gray-50">
      <div class="container mx-auto max-w-6xl px-4">
        <h2 class="text-3xl font-bold text-center text-gray-900">
          必要な機能だけを、シンプルに。
        </h2>

        <div class="mt-16 grid md:grid-cols-3 gap-8">
          <!-- ブラウザ完結 -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div
              class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4"
            >
              <UIcon
                name="i-heroicons-globe-alt"
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <h3 class="text-xl font-semibold text-gray-900">
              ブラウザだけで完結
            </h3>
            <p class="mt-2 text-gray-600">
              インストール不要。ブラウザを開くだけですぐに使えます。どのデバイスからでも同じ体験でアクセス可能です。
            </p>
          </div>

          <!-- 直感的な操作 -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div
              class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4"
            >
              <UIcon
                name="i-heroicons-cursor-arrow-rays"
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <h3 class="text-xl font-semibold text-gray-900">
              直感的なカンバンボード
            </h3>
            <p class="mt-2 text-gray-600">
              ドラッグ＆ドロップの簡単操作で、タスクの進捗を視覚的に管理。複雑な操作を覚える必要はありません。
            </p>
          </div>

          <!-- セキュア -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div
              class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4"
            >
              <UIcon
                name="i-heroicons-shield-check"
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <h3 class="text-xl font-semibold text-gray-900">
              セキュアなデータ管理
            </h3>
            <p class="mt-2 text-gray-600">
              Supabaseの強固なセキュリティで、大切なタスク情報を安全に保管。デバイス紛失のリスクもありません。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- デモセクション -->
    <section class="py-20">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">
              シンプルで使いやすい<br />
              タスク管理を体験
            </h2>
            <p class="mt-4 text-gray-600 text-lg">
              学習コストが低く、誰でもすぐに使いこなせます。<br />
              操作に迷わない、ストレスフリーな体験。
            </p>
            <div class="mt-8">
              <UButton
                to="/auth"
                size="lg"
                color="primary"
                class="rounded-full px-8 py-4"
              >
                5分でカンバンボードを作成
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
            </div>
          </div>
          <div class="relative">
            <img
              src="https://placehold.jp/550x400.png"
              alt="アプリケーションのデモ画面"
              class="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTAセクション -->
    <section class="py-20 bg-primary-50">
      <div class="container mx-auto max-w-4xl px-4 text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          今すぐタスク管理を始めましょう
        </h2>
        <p class="mt-4 text-gray-600 text-lg">
          面倒な設定は不要。30秒でアカウントを作成し、<br />
          すぐにタスク管理を始められます。
        </p>
        <div class="mt-8">
          <UButton
            to="/auth"
            size="xl"
            color="primary"
            class="rounded-full px-12 py-6"
          >
            <span class="text-xl">無料アカウントを作成する</span>
            <UIcon name="i-heroicons-arrow-right" class="ml-2 w-6 h-6" />
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();

// 機能セクションまでスクロール
const scrollToFeatures = () => {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
};

// ログイン済みの場合はボードページにリダイレクト
if (user.value) {
  navigateTo("/board");
}
</script>
