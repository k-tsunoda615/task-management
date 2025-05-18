<template>
  <CommonHeader />
  <Auth />
  <CommonFooter />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
</script>
