<template>
  <div class="min-h-screen bg-gray-100/20">
    <!-- クライアントサイドでのみ評価される loading 状態 -->
    <ClientOnly>
      <div
        v-if="loading"
        class="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="text-center">
          <USpinner size="lg" class="mb-4" />
          <p class="text-gray-600">読み込み中...</p>
        </div>
      </div>
      <div
        v-else-if="showDataLoadingOverlay"
        class="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40"
      >
        <div class="text-center space-y-2">
          <USpinner size="lg" class="mx-auto" />
          <p class="text-gray-600 text-sm">データを更新しています...</p>
        </div>
      </div>
      <div
        v-if="!initialized"
        class="flex min-h-screen items-center justify-center"
      >
        <USpinner size="lg" />
      </div>
      <div v-else-if="initialized && !user">
        <slot />
      </div>
      <div v-else-if="initialized && user">
        <!-- PC表示時のサイドバー -->
        <div class="hidden md:block">
          <TheSidebar />
        </div>

        <!-- モバイル表示時のハンバーガーメニュー -->
        <div class="block md:hidden">
          <div class="fixed top-0 left-0 z-30 p-4">
            <UButton
              color="white"
              variant="solid"
              icon="i-heroicons-bars-3"
              class="shadow-md"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            />
          </div>

          <!-- モバイルメニューオーバーレイ -->
          <Transition
            enter-active-class="transition-opacity duration-300"
            leave-active-class="transition-opacity duration-300"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div
              v-if="isMobileMenuOpen"
              class="fixed inset-0 bg-black bg-opacity-50 z-40"
              @click="isMobileMenuOpen = false"
            />
          </Transition>

          <!-- モバイルサイドバー -->
          <Transition
            enter-active-class="transition-transform duration-300"
            leave-active-class="transition-transform duration-300"
            enter-from-class="-translate-x-full"
            leave-to-class="-translate-x-full"
          >
            <div
              v-if="isMobileMenuOpen"
              class="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50"
            >
              <TheSidebar
                :is-mobile="true"
                @close-mobile-menu="isMobileMenuOpen = false"
              />
            </div>
          </Transition>
        </div>

        <main
          class="transition-all duration-300 p-4"
          :class="{
            'md:ml-64': sidebarOpen && !isMobile,
            'md:ml-16': !sidebarOpen && !isMobile,
            'mt-14': isMobile,
          }"
        >
          <slot />
        </main>

        <ModalsHelpModal v-model="helpModal" />
        <AIChat v-if="user" />
      </div>

      <!-- フォールバックコンテンツ -->
      <template #fallback>
        <div class="flex min-h-screen items-center justify-center">
          <USpinner size="lg" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import TheSidebar from "../components/common/Sidebar.vue";
import AIChat from "../components/ai/AIChat.vue";
import ModalsHelpModal from "../components/modals/HelpModal.vue";
import { useAuthService } from "../composables/useAuthService";
import { useTodoSync } from "../composables/useTodoSync";
import { useTodoStore } from "../../stores/tasks";

const { user } = useAuthService();
const loading = useState("auth-loading", () => true);
const initialized = ref(false);
const helpModal = useState("help-modal", () => false);

// サイドバーの状態を監視
const sidebarOpen = ref(true);
// モバイルメニューの状態
const isMobileMenuOpen = ref(false);
// モバイル判定
const isMobile = ref(false);
const { startAutoRefresh, stopAutoRefresh, isSyncing } = useTodoSync();
const todoStore = useTodoStore();
const showDataLoadingOverlay = computed(
  () => !!user.value && (todoStore.isLoading || isSyncing.value),
);

watch(
  () => user.value?.id,
  (currentUserId) => {
    if (currentUserId) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopAutoRefresh();
});

onMounted(() => {
  // 初期化完了を通知
  loading.value = false;
  initialized.value = true;

  // サイドバーの状態を初期化
  const savedState = localStorage.getItem("sidebarOpen");
  if (savedState !== null) {
    sidebarOpen.value = savedState === "true";
  }

  // サイドバーの状態変更を監視（カスタムイベント）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.addEventListener("sidebarToggle", (event: any) => {
    sidebarOpen.value = event.detail.isOpen;
  });

  // 画面サイズの監視
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };

  checkMobile();
  window.addEventListener("resize", checkMobile);
});
</script>
