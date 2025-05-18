<template>
  <ListTable />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

// ページのメタタイトルを設定
useHead({
  title: "Task Board",
  meta: [{ name: "description", content: "Todoの一覧化と進捗メモ" }],
});

// const user = useSupabaseUser();
// const showHelpModal = ref(false);
</script>
