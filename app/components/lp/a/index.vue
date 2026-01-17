<template>
  <div class="min-h-screen bg-white">
    <!-- ヒーローセクション -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div
              class="inline-block mb-3 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              プライオリティ志向のタスク管理
            </div>
            <h1
              class="text-4xl md:text-5xl font-bold text-gray-900 !leading-[1.15]"
            >
              タスク管理を<br >
              もっと賢く<br >
              効率的に
            </h1>
            <p class="mt-6 text-xl text-gray-600 leading-relaxed">
              pritoxは、タスク管理アプリで終わらせない。<br >
              優先順位で動き、成果を最大化する新しいワークスタイルをあなたに。
            </p>
            <div class="mt-10 flex flex-col sm:flex-row gap-4">
              <UButton
                to="/auth"
                size="xl"
                color="black"
                class="rounded-md px-8 py-4"
              >
                <span class="text-lg">今すぐ始める（無料）</span>
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
              <UButton
                size="xl"
                variant="outline"
                color="gray"
                class="rounded-md px-8 py-4"
                @click="scrollToFeatures"
              >
                <span class="text-lg">機能を探索する</span>
                <UIcon name="i-heroicons-chevron-down" class="ml-2" />
              </UButton>
            </div>
          </div>
          <div class="relative">
            <img
              src="https://placehold.jp/550x450.png"
              alt="カンバンボードのスクリーンショット"
              class="rounded-lg shadow-md border border-gray-200"
            >
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
    <section id="features" class="py-20 bg-gray-50">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900">
            成果を出すための必須機能
          </h2>
          <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            重要なことに集中できるように設計された、シンプルで効果的なタスク管理ツール
          </p>
        </div>

        <!-- 機能カード -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <!-- 機能カード1 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3"
              >
                <UIcon
                  name="i-heroicons-arrow-trending-up"
                  class="w-5 h-5 text-red-500"
                />
              </div>
              <h3 class="text-lg font-semibold">重要タスクに集中</h3>
            </div>
            <p class="text-gray-600">
              プライオリティ視点で重要なタスクから取り組み、本当に価値のある成果を生み出せます。
            </p>
          </div>

          <!-- 機能カード2 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3"
              >
                <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-500" />
              </div>
              <h3 class="text-lg font-semibold">時間意識を高める</h3>
            </div>
            <p class="text-gray-600">
              ストップウォッチ機能で各タスクにかかる時間を計測し、時間管理スキルを向上させます。
            </p>
          </div>

          <!-- 機能カード3 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3"
              >
                <UIcon name="i-heroicons-tag" class="w-5 h-5 text-green-500" />
              </div>
              <h3 class="text-lg font-semibold">タグで整理</h3>
            </div>
            <p class="text-gray-600">
              シンプルなドラッグ操作とタグ機能で、タスクを直感的に整理し、必要な情報をすぐに見つけられます。
            </p>
          </div>
        </div>

        <!-- 大きな特徴表示 -->
        <div class="bg-white p-8 rounded-lg border border-gray-200 mb-16">
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 class="text-2xl font-semibold mb-4">
                優先順位で価値を最大化
              </h3>
              <p class="text-gray-600 mb-6">
                プラタスの優先度マネージャーでは、重要度と緊急度を視覚的にマッピング。<br >
                本当に価値を生み出すタスクに集中できます。
              </p>
              <ul class="space-y-3">
                <li class="flex items-center">
                  <UIcon
                    name="i-heroicons-check"
                    class="text-gray-900 mr-2 w-5 h-5"
                  />
                  <span>ドラッグ＆ドロップでタスクの優先度を設定</span>
                </li>
                <li class="flex items-center">
                  <UIcon
                    name="i-heroicons-check"
                    class="text-gray-900 mr-2 w-5 h-5"
                  />
                  <span>重要度×緊急度のマトリクスで可視化</span>
                </li>
                <li class="flex items-center">
                  <UIcon
                    name="i-heroicons-check"
                    class="text-gray-900 mr-2 w-5 h-5"
                  />
                  <span>自動優先順位提案機能</span>
                </li>
              </ul>
            </div>
            <div>
              <img
                src="https://placehold.jp/500x300.png"
                alt="優先度管理の画面"
                class="rounded-lg shadow-md"
              >
            </div>
          </div>
        </div>

        <!-- 追加機能 -->
        <div class="grid md:grid-cols-3 gap-8">
          <!-- 追加機能1 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3"
              >
                <UIcon
                  name="i-heroicons-eye-slash"
                  class="w-5 h-5 text-purple-500"
                />
              </div>
              <h3 class="text-lg font-semibold">安心のプライバシー</h3>
            </div>
            <p class="text-gray-600">
              プライベートタスクは非表示化できるので、同僚や上司と画面を共有する際も安心です。
            </p>
          </div>

          <!-- 追加機能2 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3"
              >
                <UIcon
                  name="i-heroicons-bolt"
                  class="w-5 h-5 text-yellow-500"
                />
              </div>
              <h3 class="text-lg font-semibold">生産性分析</h3>
            </div>
            <p class="text-gray-600">
              タスク完了パターンを分析し、あなたの生産性向上のためのパーソナライズされた提案を行います。
            </p>
          </div>

          <!-- 追加機能3 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3"
              >
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="w-5 h-5 text-teal-500"
                />
              </div>
              <h3 class="text-lg font-semibold">進捗可視化</h3>
            </div>
            <p class="text-gray-600">
              プロジェクトの進捗状況をリアルタイムで可視化し、いつでもステータスを確認できます。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- カンバンセクション -->
    <section class="py-20 bg-white">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">
              忙しさから脱却。<br >
              成果に直結する行動を。
            </h2>
            <p class="text-lg text-gray-600 mb-8">
              単なるタスク管理ではなく、成果を最大化するための<br >
              新しいワークスタイルを提供します。
            </p>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="text-gray-900 w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <p class="text-gray-700">
                  重要度×緊急度マトリクスで優先順位を可視化
                </p>
              </div>
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="text-gray-900 w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <p class="text-gray-700">
                  深い集中を促す「ディープワークモード」
                </p>
              </div>
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="text-gray-900 w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <p class="text-gray-700">
                  成果と時間の相関を分析するインサイトレポート
                </p>
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://placehold.jp/600x450.png"
              alt="アプリケーションのデモ画面"
              class="rounded-lg shadow-md border border-gray-200"
            >
          </div>
        </div>
      </div>
    </section>

    <!-- CTAセクション -->
    <section class="py-20 bg-gray-50 border-t border-gray-200">
      <div class="container mx-auto max-w-4xl px-4 text-center">
        <h2 class="text-3xl font-bold text-gray-900">今すぐ始めましょう</h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          タスクをこなすだけでなく、本当に価値のある成果を生み出す。<br >
          それがプロフェッショナルの働き方です。
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            to="/auth"
            size="xl"
            color="black"
            class="rounded-md px-8 py-4"
          >
            <span class="text-lg">プラタス 無料版</span>
          </UButton>
          <UButton
            to="#"
            size="xl"
            variant="outline"
            color="gray"
            class="rounded-md px-8 py-4"
          >
            <span class="text-lg">プラタス ビジネス</span>
          </UButton>
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
// デフォルトで最初の機能（priority）を選択状態にする
const activeFeature = ref<string | null>("priority");

// 機能セクションまでスクロール
const scrollToFeatures = () => {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
};
</script>
