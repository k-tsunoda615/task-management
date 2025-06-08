<template>
  <div>
    <CommonNavigation :title="'ボードビュー'" />
    <!-- メインコンテンツ -->
    <div v-if="user">
      <KanbanTaskBoard />
    </div>

    <!-- ミドルウェアのリダイレクトが効かなかった時のフォールバック -->
    <div v-else>
      <div class="flex justify-end mt-1">
        <NuxtLink
          to="/auth"
          class="text-xs text-blue-600 underline hover:text-blue-800 transition"
        >
          ログインページが開かない場合はこちら
        </NuxtLink>
      </div>
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

onMounted(async () => {
  await useInitialSampleData();
});
</script>
