<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="flex h-screen items-center justify-center">
      <USpinner size="lg" />
    </div>
    <div v-else-if="!user" class="flex h-screen items-center justify-center">
      <NuxtPage />
    </div>
    <div v-else class="flex h-screen">
      <TheSidebar />
      <main class="flex-1 overflow-x-auto p-6">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const loading = ref(true)

onMounted(() => {
  loading.value = false
})
</script>