<template>
  <div>
    <CommonNavigation :title="'リストビュー'" />
    <div v-if="user">
      <ListTable />
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

// ページのメタタイトルを設定
useHead({
  title: "Todo リスト",
  meta: [{ name: "description", content: "Todoの一覧表示" }],
});

const user = useSupabaseUser();
</script>
