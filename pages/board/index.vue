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
            <span class="md:inline hidden">ホーム</span>
          </NuxtLink>
          <span class="text-gray-400 md:inline hidden">/</span>
          <span class="font-medium text-gray-900 md:inline hidden"
            >Task Board</span
          >
        </div>

        <div class="flex items-center space-x-3">
          <UTooltip text="ヘルプ" :ui="{ popper: { strategy: 'fixed' } }">
            <UButton
              @click="showHelpModal = true"
              color="gray"
              variant="ghost"
              icon="i-heroicons-question-mark-circle"
            >
              <span class="md:hidden hidden">ヘルプ</span>
            </UButton>
          </UTooltip>
          <UTooltip text="ログアウト" :ui="{ popper: { strategy: 'fixed' } }">
            <UButton
              @click="logout"
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-right-on-rectangle"
            >
              <span class="md:hidden hidden">ログアウト</span>
            </UButton>
          </UTooltip>
        </div>
      </nav>
    </div>

    <!-- メインコンテンツ -->
    <div v-if="user">
      <KanbanTaskBoard />
    </div>

    <!-- ヘルプモーダル -->
    <ModalsHelpModal v-model="showHelpModal" />
  </div>
</template>

<script setup lang="ts">
import { useInitialSampleData } from "../../composables/useInitialSampleData";

definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

// ページのメタタイトルを設定
useHead({
  title: "Task Board",
  meta: [{ name: "description", content: "Todoの一覧化と進捗メモ" }],
});

const user = useSupabaseUser();
const showHelpModal = ref(false);
const client = useSupabaseClient();
const router = useRouter();

const logout = async () => {
  await client.auth.signOut();
  router.push("/auth");
};

onMounted(async () => {
  await useInitialSampleData();
});
</script>
