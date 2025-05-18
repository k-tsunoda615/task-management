<template>
  <div>
    <CommonNavigation :title="'Task Board'" />
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
