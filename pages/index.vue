<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold">タスク管理</h1>
      <p class="mt-2 text-gray-600">
        プロジェクトやタスクを様々な方法で可視化・管理できます
      </p>
    </div>

    <div v-if="user" class="space-y-8">
      <!-- ビュー切り替えカード -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- カンバンボード -->
        <NuxtLink to="/board">
          <UCard
            class="transition-transform hover:-translate-y-1 hover:shadow-lg h-full"
          >
            <div class="flex items-start justify-between">
              <div>
                <UIcon
                  name="i-heroicons-squares-2x2"
                  class="mb-3 h-8 w-8 text-primary-600"
                />
                <h3 class="text-lg font-medium">カンバンボード</h3>
                <p class="mt-1 text-sm text-gray-600">
                  ドラッグ&ドロップでタスクの進捗を管理
                </p>
              </div>
              <UBadge color="primary" variant="subtle">実装済み</UBadge>
            </div>
          </UCard>
        </NuxtLink>

        <!-- リストビュー（Coming Soon） -->
        <UCard class="opacity-75">
          <div class="flex items-start justify-between">
            <div>
              <UIcon
                name="i-heroicons-list-bullet"
                class="mb-3 h-8 w-8 text-gray-400"
              />
              <h3 class="text-lg font-medium">リストビュー</h3>
              <p class="mt-1 text-sm text-gray-600">
                シンプルなリスト形式でタスクを管理
              </p>
            </div>
            <UBadge color="gray" class="whitespace-nowrap">Coming Soon</UBadge>
          </div>
        </UCard>

        <!-- ガントチャート（Coming Soon） -->
        <UCard class="opacity-75">
          <div class="flex items-start justify-between">
            <div>
              <UIcon
                name="i-heroicons-chart-bar"
                class="mb-3 h-8 w-8 text-gray-400"
              />
              <h3 class="text-lg font-medium">ガントチャート</h3>
              <p class="mt-1 text-sm text-gray-600">
                タイムラインベースでプロジェクトを管理
              </p>
            </div>
            <UBadge color="gray" class="whitespace-nowrap">Coming Soon</UBadge>
          </div>
        </UCard>
      </div>

      <!-- 最近のアクティビティ -->
      <div class="mt-8">
        <h2 class="mb-4 text-lg font-medium">最近のアクティビティ</h2>
        <UCard>
          <div class="space-y-4">
            <!-- 後で実装する場合のプレースホルダー -->
            <p class="text-sm text-gray-500">アクティビティはまだありません</p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- 未ログイン時の表示 -->
    <div v-else>
      <UAlert
        title="ログインが必要です"
        description="タスク管理機能を利用するにはログインしてください"
        color="amber"
      >
        <template #icon>
          <UIcon name="i-heroicons-exclamation-triangle" />
        </template>
        <template #description>
          <p class="mt-2">
            <NuxtLink
              to="/auth"
              class="text-amber-700 hover:text-amber-900 underline"
            >
              ログインページへ移動
            </NuxtLink>
          </p>
        </template>
      </UAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
</script>
