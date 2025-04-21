<template>
  <div>
    <!-- ヘッダーナビゲーション -->
    <div class="mb-6 border-b border-gray-200 pb-4">
      <nav class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <UIcon name="i-heroicons-home" class="mr-1 h-5 w-5" />
            ホーム
          </NuxtLink>
          <span class="text-gray-400">/</span>
          <span class="font-medium text-gray-900">カンバンボード</span>
        </div>

        <div class="flex items-center space-x-3">
          <UButton
            @click="showHelpModal = true"
            color="gray"
            variant="ghost"
            icon="i-heroicons-question-mark-circle"
          >
            ヘルプ
          </UButton>
          <UButton
            @click="logout"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-right-on-rectangle"
          >
            ログアウト
          </UButton>
        </div>
      </nav>
    </div>

    <!-- メインコンテンツ -->
    <div v-if="user">
      <KanbanBoard />
    </div>
    <div v-else>
      <UAlert
        title="ログインが必要です"
        description="カンバンボードを利用するにはログインしてください"
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

    <!-- ヘルプモーダル -->
    <UModal v-model="showHelpModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">カンバンボードの使い方</h3>
        </template>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium">タスクの移動</h4>
            <p class="text-gray-600">
              タスクをドラッグ&ドロップで別のステータスに移動できます。
            </p>
          </div>
          <div>
            <h4 class="font-medium">タスクの編集</h4>
            <p class="text-gray-600">
              各タスクの編集ボタンをクリックして、内容を変更できます。
            </p>
          </div>
          <div>
            <h4 class="font-medium">新規タスク</h4>
            <p class="text-gray-600">
              「新しいタスク」ボタンから、新しいタスクを作成できます。
            </p>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton
              color="gray"
              variant="ghost"
              @click="showHelpModal = false"
            >
              閉じる
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

const user = useSupabaseUser();
const showHelpModal = ref(false);
const client = useSupabaseClient();
const router = useRouter();

const logout = async () => {
  await client.auth.signOut();
  router.push("/auth");
};
</script>
