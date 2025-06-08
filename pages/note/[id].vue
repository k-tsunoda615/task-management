<template>
  <div>
    <CommonNavigation :title="'タスク詳細'" />
    <div class="container mx-auto px-4 py-8">
      <Note :taskId="taskId" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

const route = useRoute();
const taskId = computed(() => route.params.id);
</script>
