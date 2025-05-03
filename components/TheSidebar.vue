<template>
  <div>
    <!-- サイドバー本体 -->
    <div
      class="fixed top-0 left-0 h-screen bg-white shadow transition-all duration-300 ease-in-out flex flex-col"
      :class="[{ 'w-64': isOpen, 'w-16': !isOpen }, isMobile ? 'w-64' : '']"
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

      <!-- フィルターボタン -->
      <div class="p-4" :class="{ 'text-center': !isOpen && !isMobile }">
        <UButton
          :block="isOpen || isMobile"
          :color="getFilterButtonColor()"
          :variant="'ghost'"
          @click="toggleTaskFilter"
          :icon="getFilterIcon()"
        >
          <span v-if="isOpen || isMobile">{{ getFilterLabel() }}</span>
        </UButton>
      </div>

      <!-- タイマー表示切り替えボタン -->
      <div class="p-4" :class="{ 'text-center': !isOpen && !isMobile }">
        <UButton
          :block="isOpen || isMobile"
          :color="showTimer ? 'blue' : 'gray'"
          :variant="'ghost'"
          @click="toggleTimerVisibility"
          icon="i-heroicons-clock"
        >
          <span v-if="isOpen || isMobile">{{
            showTimer ? "タイマー表示中" : "タイマー非表示"
          }}</span>
        </UButton>
      </div>

      <!-- 機能ないのにあると気になるからいったん非表示 -->
      <!-- <div class="mb-4">
        <h3 class="mb-2 font-medium">プロジェクト</h3>
        <ul class="space-y-1">
          <li v-for="project in projectStore.projects" :key="project.id">
            <UButton
              block
              variant="ghost"
              :color="
                projectStore.selectedProject?.id === project.id
                  ? 'primary'
                  : 'gray'
              "
              @click="projectStore.setSelectedProject(project)"
            >
              {{ project.title }}
            </UButton>
          </li>
        </ul>
      </div> -->

      <!-- ゴミ箱エリアの直前に配置 -->
      <div class="mt-auto">
        <!-- タスク数表示 - サイドバーが開いているときのみ表示 -->
        <div v-if="isOpen && !isMobile" class="px-4 py-2 text-center">
          <span class="text-xs text-gray-500">
            Tasks: {{ todoStore.totalTodoCount }} / 100
          </span>
        </div>

        <!-- ゴミ箱エリア -->
        <div
          class="p-3 border-t flex items-center justify-center transition-all duration-200"
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
      </div>
    </div>
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

const emit = defineEmits(["close-mobile-menu"]);

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
