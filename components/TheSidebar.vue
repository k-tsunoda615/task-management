<template>
  <div>
    <!-- サイドバー本体 -->
    <div
      class="fixed top-0 left-0 h-screen bg-white shadow transition-all duration-300 ease-in-out flex flex-col z-40"
      :class="[
        { 'w-64': isOpen || isMobile, 'w-16': !isOpen && !isMobile },
        { '-translate-x-full': !isMobile },
        'md:translate-x-0',
      ]"
    >
      <!-- ヘッダー部分 -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold" v-if="isOpen || isMobile">
          Task Board
        </h2>
        <UButton
          v-if="isMobile"
          @click="$emit('close-mobile-menu')"
          color="gray"
          variant="ghost"
          size="sm"
          class="ml-auto"
        >
          <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
        </UButton>
        <UButton
          v-else
          @click="toggleSidebar"
          color="gray"
          variant="ghost"
          size="sm"
          class="ml-auto"
        >
          <UIcon
            :name="
              isOpen ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'
            "
            class="h-4 w-4"
          />
        </UButton>
      </div>

      <!-- ボタン類 -->
      <div class="flex-1 overflow-y-auto">
        <!-- フィルターボタン -->
        <div class="p-4" :class="{ 'text-center': !isOpen && !isMobile }">
          <UTooltip
            :text="!isOpen ? getFilterLabel() : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
          >
            <UButton
              :block="isOpen || isMobile"
              :color="getFilterButtonColor()"
              :variant="'ghost'"
              @click="toggleTaskFilter"
              :icon="getFilterIcon()"
            >
              <span v-if="isOpen || isMobile">{{ getFilterLabel() }}</span>
            </UButton>
          </UTooltip>
        </div>

        <!-- タイマー表示切り替えボタン -->
        <div class="p-4" :class="{ 'text-center': !isOpen && !isMobile }">
          <UTooltip
            :text="
              !isOpen ? (showTimer ? 'タイマー非表示' : 'タイマー表示') : ''
            "
            :ui="{ popper: { strategy: 'fixed' } }"
          >
            <UButton
              :block="isOpen || isMobile"
              :color="showTimer ? 'blue' : 'gray'"
              :variant="'ghost'"
              @click="toggleTimerVisibility"
              icon="i-heroicons-clock"
            >
              <span v-if="isOpen || isMobile">
                {{ showTimer ? "タイマー表示中" : "タイマー非表示" }}
              </span>
            </UButton>
          </UTooltip>
        </div>

        <!-- レイアウト切り替えボタン -->
        <div class="p-4" :class="{ 'text-center': !isOpen && !isMobile }">
          <UTooltip
            :text="!isOpen ? 'レイアウト切り替え' : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
          >
            <UButton
              :block="isOpen || isMobile"
              color="gray"
              :variant="'ghost'"
              @click="$emit('toggle-layout')"
              icon="i-heroicons-view-columns"
            >
              <span v-if="isOpen || isMobile">レイアウト切り替え</span>
            </UButton>
          </UTooltip>
        </div>
      </div>

      <!-- ゴミ箱エリア -->
      <div class="mt-auto border-t text-center">
        <!-- ゴミ箱 -->
        <UTooltip
          :text="!isOpen ? 'タスクをドラッグして削除' : ''"
          :ui="{ popper: { strategy: 'fixed' } }"
        >
          <div
            class="p-3 flex items-center justify-center transition-all duration-200"
            :class="{ 'flex-col': !isOpen && !isMobile }"
            @dragover.prevent
            @dragenter="isDragOver = true"
            @dragleave="isDragOver = false"
            @drop="handleTrashDrop"
          >
            <UIcon
              name="i-heroicons-trash"
              class="transition-colors duration-200"
              :class="[
                isDragOver ? 'text-red-500' : 'text-gray-500',
                isOpen || isMobile ? 'mr-2' : 'mb-1',
              ]"
            />
            <span
              v-if="isOpen || isMobile"
              class="transition-colors duration-200"
              :class="isDragOver ? 'text-red-700' : 'text-gray-600'"
            >
              ドラッグで削除
            </span>
          </div>
        </UTooltip>

        <!-- タスク数表示 - 常に表示 -->
        <div class="px-4 py-2 text-center border-t">
          <UTooltip
            :text="!isOpen ? `タスク数: ${todoStore.totalTodoCount}/100` : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
          >
            <div class="flex items-center justify-center">
              <span class="text-xs text-gray-500" v-if="!isOpen && !isMobile">
                {{ todoStore.totalTodoCount }}%
              </span>
              <span v-else class="text-xs text-gray-500">
                タスク数: {{ todoStore.totalTodoCount }} / 100
              </span>
            </div>
          </UTooltip>
        </div>
      </div>
    </div>

    <!-- モバイル用オーバーレイ -->
    <div
      v-if="isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-30"
      @click="$emit('close-mobile-menu')"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "../stores/project";
import { useTodoStore } from "../stores/todo";
import { useEventBus } from "@vueuse/core";

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-mobile-menu", "toggle-layout"]);

const projectStore = useProjectStore();
const todoStore = useTodoStore();

const trashEventBus = useEventBus("trash-drop");
const isDragOver = ref(false);
const isOpen = ref(true); // サイドバーの開閉状態
const showTimer = ref(true); // タイマー表示状態

// サイドバーの開閉を切り替える
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  // サイドバーの状態をローカルストレージに保存
  localStorage.setItem("sidebarOpen", isOpen.value.toString());

  // イベントを発行して他のコンポーネントに通知
  window.dispatchEvent(
    new CustomEvent("sidebarToggle", {
      detail: { isOpen: isOpen.value },
    })
  );
};

// タイマー表示の切り替え
const toggleTimerVisibility = () => {
  showTimer.value = !showTimer.value;
  // タイマー表示状態をローカルストレージに保存
  localStorage.setItem("showTimer", showTimer.value.toString());

  // イベントを発行して他のコンポーネントに通知
  window.dispatchEvent(
    new CustomEvent("timerVisibilityToggle", {
      detail: { showTimer: showTimer.value },
    })
  );
};

// ページ読み込み時にサイドバーの状態を復元
onMounted(() => {
  const savedState = localStorage.getItem("sidebarOpen");
  if (savedState !== null) {
    isOpen.value = savedState === "true";
  }

  // タイマー表示状態を復元
  const savedTimerState = localStorage.getItem("showTimer");
  if (savedTimerState !== null) {
    showTimer.value = savedTimerState === "true";
  }

  // プロジェクト取得
  projectStore.fetchProjects();
});

// フィルターに応じたラベルを取得
const getFilterLabel = () => {
  switch (todoStore.taskFilter) {
    case "all":
      return "All Tasks";
    case "private":
      return "Private";
    case "public":
      return "Public";
    default:
      return "All Tasks";
  }
};

// フィルターに応じたアイコンを取得
const getFilterIcon = () => {
  switch (todoStore.taskFilter) {
    case "all":
      return "i-heroicons-globe-alt";
    case "private":
      return "i-heroicons-lock-closed";
    case "public":
      return "i-heroicons-users";
    default:
      return "i-heroicons-globe-alt";
  }
};

const getFilterButtonColor = () => {
  switch (todoStore.taskFilter) {
    case "all":
      return "primary";
    case "private":
      return "green";
    case "public":
      return "gray";
    default:
      return "primary";
  }
};

const toggleTaskFilter = () => {
  if (todoStore.taskFilter === "all") {
    todoStore.setTaskFilter("private");
  } else if (todoStore.taskFilter === "private") {
    todoStore.setTaskFilter("public");
  } else {
    todoStore.setTaskFilter("all");
  }
};

// ゴミ箱へのドロップを処理
const handleTrashDrop = (event: any) => {
  const todoId = event.dataTransfer.getData("todoId");
  if (todoId) {
    isDragOver.value = false;
    trashEventBus.emit(todoId);
  }
};
</script>
