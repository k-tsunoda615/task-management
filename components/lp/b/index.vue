<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50"
  >
    <!-- ヒーローセクション -->
    <section class="py-24 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div
              class="inline-block mb-3 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              プライオリティ志向タスク管理「プラタス（PrioTaskX）」
            </div>
            <h1
              class="text-5xl md:text-6xl font-bold text-gray-900 !leading-[1.15]"
            >
              成果が出る人は、<br />
              <span
                class="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-500"
                >重要なことから</span
              ><br />
              始めている。
            </h1>
            <p class="mt-6 text-xl text-gray-600 leading-relaxed">
              プラタスは、タスク管理アプリで終わらせない。<br />
              優先順位で動き、成果を最大化する新しいワークスタイルをあなたに。
            </p>
            <div class="mt-10 flex flex-col sm:flex-row gap-4">
              <UButton
                to="/auth"
                size="xl"
                color="primary"
                class="rounded-full px-8 py-4 shadow-lg shadow-primary-200/50"
              >
                <span class="text-lg">今すぐ始める（無料）</span>
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
              <UButton
                @click="scrollToFeatures"
                size="xl"
                variant="soft"
                color="gray"
                class="rounded-full px-8 py-4"
              >
                <span class="text-lg">機能を探索する</span>
                <UIcon name="i-heroicons-chevron-down" class="ml-2" />
              </UButton>
            </div>
          </div>
          <div class="relative">
            <div
              class="absolute -z-10 inset-0 bg-gradient-to-r from-primary-100 to-blue-100 rounded-[30px] blur-3xl opacity-40"
            ></div>
            <div
              class="bg-white rounded-[30px] shadow-xl border border-gray-100 p-6 relative overflow-hidden"
            >
              <div
                class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-primary-100 to-transparent rounded-bl-[100px] -z-0"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-t from-blue-100 to-transparent rounded-tr-[120px] -z-0"
              ></div>
              <div class="relative z-10">
                <div class="mb-4">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">
                    今すぐ始めましょう
                  </h3>
                  <p class="text-sm text-gray-600">
                    インストール不要ですぐに始められます
                  </p>
                </div>
                <div class="space-y-4">
                  <AuthSignupCard
                    class="bg-transparent"
                    cardClass="bg-transparent shadow-none border-0 p-0"
                    :showTitle="false"
                    :showSubtitle="false"
                  />
                  <div class="relative my-6">
                    <div
                      class="absolute inset-x-0 top-1/2 h-px bg-gray-200 transform -translate-y-1/2"
                    ></div>
                    <div class="relative flex justify-center">
                      <span class="bg-white px-4 text-sm text-gray-500"
                        >または</span
                      >
                    </div>
                  </div>
                  <AuthGuestLogin
                    redirectTo="/board"
                    class="transform hover:scale-105 transition-transform duration-200"
                    buttonText="ゲストモードで試してみる"
                  />
                  <div class="text-center text-xs text-gray-500 mt-3">
                    アカウント登録なしで機能を体験できます
                  </div>
                </div>
              </div>
            </div>
            <!-- <div
              class="absolute -top-5 right-5 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 hidden md:block"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-bolt"
                  class="text-primary-600 w-6 h-6"
                />
                <p class="font-medium">インストール不要、すぐに始められる</p>
              </div>
            </div> -->
          </div>
        </div>

        <!-- 信頼バッジ -->
        <div class="mt-24 text-center">
          <p
            class="text-gray-500 mb-8 text-sm uppercase tracking-wider font-medium"
          >
            多くのプロフェッショナルに選ばれています
          </p>
          <div class="flex flex-wrap justify-center gap-8 opacity-70">
            <div class="w-24 h-12 flex items-center justify-center">
              <div class="text-2xl font-bold text-gray-400">Company A</div>
            </div>
            <div class="w-24 h-12 flex items-center justify-center">
              <div class="text-2xl font-bold text-gray-400">Company B</div>
            </div>
            <div class="w-24 h-12 flex items-center justify-center">
              <div class="text-2xl font-bold text-gray-400">Company C</div>
            </div>
            <div class="w-24 h-12 flex items-center justify-center">
              <div class="text-2xl font-bold text-gray-400">Company D</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特徴セクション -->
    <section id="features" class="py-24 bg-white">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="text-center mb-16">
          <div
            class="inline-block mb-3 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
          >
            主な機能
          </div>
          <h2 class="text-4xl font-bold text-gray-900">
            成果を出すために必要な機能だけを
          </h2>
          <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            本当に重要なことに集中できるように設計された、<br />シンプルで効果的なツール
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- プライオリティ視点 -->
          <div
            class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6"
            >
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-7 h-7 text-primary-600"
              />
            </div>
            <h3 class="text-xl font-semibold text-gray-900">
              重要タスクに集中
            </h3>
            <p class="mt-3 text-gray-600 leading-relaxed">
              プライオリティ視点で重要なタスクから取り組み、本当に価値のある成果を生み出せます。
            </p>
          </div>

          <!-- ストップウォッチ -->
          <div
            class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6"
            >
              <UIcon
                name="i-heroicons-clock"
                class="w-7 h-7 text-primary-600"
              />
            </div>
            <h3 class="text-xl font-semibold text-gray-900">
              時間意識を高める
            </h3>
            <p class="mt-3 text-gray-600 leading-relaxed">
              ストップウォッチ機能で各タスクにかかる時間を計測し、時間管理スキルを向上させます。
            </p>
          </div>

          <!-- タグ管理 -->
          <div
            class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6"
            >
              <UIcon name="i-heroicons-tag" class="w-7 h-7 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900">タグで整理</h3>
            <p class="mt-3 text-gray-600 leading-relaxed">
              シンプルなドラッグ操作とタグ機能で、タスクを直感的に整理し、必要な情報をすぐに見つけられます。
            </p>
          </div>

          <!-- プライバシー -->
          <div
            class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6"
            >
              <UIcon
                name="i-heroicons-eye-slash"
                class="w-7 h-7 text-primary-600"
              />
            </div>
            <h3 class="text-xl font-semibold text-gray-900">
              安心のプライバシー
            </h3>
            <p class="mt-3 text-gray-600 leading-relaxed">
              プライベートタスクは非表示化できるので、同僚や上司と画面を共有する際も安心です。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- デモセクション -->
    <section class="py-24 bg-gray-50">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div class="order-2 md:order-1 relative">
            <div
              class="absolute -z-10 inset-0 bg-gradient-to-r from-blue-100 to-primary-100 rounded-[30px] blur-3xl opacity-40"
            ></div>
            <img
              src="https://placehold.jp/600x450.png"
              alt="アプリケーションのデモ画面"
              class="rounded-[30px] shadow-xl border border-gray-100"
            />
            <div
              class="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="text-primary-600 w-6 h-6"
                />
                <p class="font-medium">タスク管理の効率化をサポート</p>
              </div>
            </div>
          </div>
          <div class="order-1 md:order-2">
            <div
              class="inline-block mb-3 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              成果を出すワークフロー
            </div>
            <h2 class="text-4xl font-bold text-gray-900">
              「忙しい」から<br />「成果が出る」へ
            </h2>
            <p class="mt-6 text-lg text-gray-600 leading-relaxed">
              単なるタスク管理ではなく、成果を最大化するための<br />
              新しいワークスタイルを提供します。
            </p>
            <div class="mt-10 space-y-4">
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="text-primary-600 w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <p class="text-gray-700 flex items-center gap-2">
                  重要度×緊急度マトリクスで優先順位を可視化
                  <span
                    class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600 font-semibold"
                    >近日公開</span
                  >
                </p>
              </div>
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="text-primary-600 w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <p class="text-gray-700 flex items-center gap-2">
                  深い集中を促す「ディープワークモード」
                  <span
                    class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600 font-semibold"
                    >近日公開</span
                  >
                </p>
              </div>
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="text-primary-600 w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <p class="text-gray-700 flex items-center gap-2">
                  成果と時間の相関を分析するインサイトレポート
                  <span
                    class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600 font-semibold"
                    >近日公開</span
                  >
                </p>
              </div>
            </div>
            <div class="mt-10">
              <UButton
                to="/auth"
                size="lg"
                color="primary"
                class="rounded-full px-8 py-4 shadow-lg shadow-primary-200/50"
              >
                無料でワークスタイルを変える
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTAセクション -->
    <section
      class="py-24 bg-gradient-to-br from-primary-600 to-blue-700 text-white"
    >
      <div class="container mx-auto max-w-4xl px-4 text-center">
        <h2 class="text-4xl font-bold">
          今日から、重要なことに<br class="md:hidden" />集中する習慣を始めよう
        </h2>
        <p class="mt-6 text-xl text-white/90 max-w-2xl mx-auto">
          タスクをこなすだけでなく、本当に価値のある成果を生み出す。<br />
          それがプロフェッショナルの働き方です。
        </p>
        <div class="mt-10">
          <UButton
            to="/auth"
            size="xl"
            color="white"
            class="rounded-full px-12 py-6 shadow-xl"
          >
            <span class="text-xl text-primary-600 font-medium"
              >無料アカウントを作成する</span
            >
            <UIcon
              name="i-heroicons-arrow-right"
              class="ml-2 w-6 h-6 text-primary-600"
            />
          </UButton>
          <p class="mt-4 text-white/75 text-sm">
            クレジットカードは不要、いつでもキャンセル可能
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const user = useSupabaseUser();

// 機能セクションまでスクロール
const scrollToFeatures = () => {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
};
</script>
