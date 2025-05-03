<template>
  <div>
    <!-- サイドバー本体 -->
    <div
      class="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-40"
      :class="[
        { 'w-64': isOpen || isMobile, 'w-16': !isOpen && !isMobile },
        { '-translate-x-full': !isMobile },
        'md:translate-x-0',
      ]"
    >
      <!-- ヘッダー部分 -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200"
      >
        <h2 class="text-lg font-medium text-gray-900" v-if="isOpen || isMobile">
          Task Board
        </h2>
        <UButton
          v-if="isMobile"
          @click="$emit('close-mobile-menu')"
          color="gray"
          variant="ghost"
          size="sm"
          class="hover:bg-gray-100"
        >
          <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
        </UButton>
        <UButton
          v-else
          @click="toggleSidebar"
          color="gray"
          variant="ghost"
          size="sm"
          class="hover:bg-gray-100"
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
      <div class="flex-1 overflow-y-auto py-2">
        <!-- フィルターボタン -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
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
              class="justify-start hover:bg-gray-100"
            >
              <span v-if="isOpen || isMobile" class="ml-2">{{
                getFilterLabel()
              }}</span>
            </UButton>
          </UTooltip>
        </div>

        <!-- タグ管理ボタン -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="!isOpen ? 'タグ管理' : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
          >
            <UButton
              :block="isOpen || isMobile"
              color="gray"
              variant="ghost"
              icon="i-heroicons-tag"
              @click="showTagModal = true"
              class="justify-start hover:bg-gray-100"
            >
              <span v-if="isOpen || isMobile" class="ml-2">タグ管理</span>
            </UButton>
          </UTooltip>
        </div>

        <!-- タイマー表示切り替えボタン -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
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
              class="justify-start hover:bg-gray-100"
            >
              <span v-if="isOpen || isMobile" class="ml-2">
                {{ showTimer ? "タイマー表示中" : "タイマー非表示" }}
              </span>
            </UButton>
          </UTooltip>
        </div>

        <!-- レイアウト切り替えボタン -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="!isOpen ? 'レイアウト切り替え' : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
          >
            <UButton
              :block="isOpen || isMobile"
              color="gray"
              variant="ghost"
              @click="$emit('toggle-layout')"
              icon="i-heroicons-view-columns"
              class="justify-start hover:bg-gray-100"
            >
              <span v-if="isOpen || isMobile" class="ml-2"
                >レイアウト切り替え</span
              >
            </UButton>
          </UTooltip>
        </div>
      </div>

      <!-- ゴミ箱エリア -->
      <div class="mt-auto border-t border-gray-200">
        <!-- ゴミ箱 -->
        <UTooltip
          :text="!isOpen ? 'タスクをドラッグして削除' : ''"
          :ui="{ popper: { strategy: 'fixed' } }"
        >
          <div
            class="p-4 flex items-center justify-center transition-all duration-200 hover:bg-red-50"
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

        <!-- タスク数表示 -->
        <div class="px-4 py-3 text-center border-t border-gray-200 bg-gray-50">
          <UTooltip
            :text="!isOpen ? `タスク数: ${todoStore.totalTodoCount}/100` : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
          >
            <div class="flex items-center justify-center">
              <span class="text-xs text-gray-600" v-if="!isOpen && !isMobile">
                {{ todoStore.totalTodoCount }}%
              </span>
              <span v-else class="text-xs text-gray-600">
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
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
      @click="$emit('close-mobile-menu')"
    />

    <TagManageModal
      :show="showTagModal"
      :tagStore="tagStore"
      :newTagName="newTagName"
      :newTagColor="newTagColor"
      @close="showTagModal = false"
      @addTag="addTag"
      @deleteTag="deleteTag"
      @updateNewTagName="(val) => (newTagName = val)"
      @updateNewTagColor="(val) => (newTagColor = val)"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "../../stores/project";
import { useTodoStore } from "../../stores/todo";
import { useTagStore } from "../../stores/tag";
import { useEventBus } from "@vueuse/core";
import type { Tag } from "../../types/todo";
import TagManageModal from "../modals/TagManageModal.vue";
// import { darkenColor } from "@/utils/color";

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-mobile-menu", "toggle-layout"]);

const projectStore = useProjectStore();
const todoStore = useTodoStore();
const tagStore = useTagStore();

const trashEventBus = useEventBus("trash-drop");
const isDragOver = ref(false);
const isOpen = ref(true); // サイドバーの開閉状態
const showTimer = ref(true); // タイマー表示状態
const showTagModal = ref(false);
const newTagName = ref("");
const randomColor = () => {
  // パステル系のランダム色
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 70%)`;
};
const newTagColor = ref(randomColor());

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

const addTag = async () => {
  const name = newTagName.value.trim();
  const color = newTagColor.value;
  if (!name) return;
  if (tagStore.tags.some((t: Tag) => t.name === name)) {
    newTagName.value = "";
    newTagColor.value = randomColor();
    return;
  }
  const { data, error } = await tagStore.createTag({ name, color });
  if (!error && data) {
    newTagName.value = "";
    newTagColor.value = randomColor();
  }
};

const deleteTag = async (tagId: string) => {
  if (!confirm("このタグを削除しますか？")) return;
  await tagStore.deleteTag(tagId);
};
</script>

<style scoped>
.tag-modern.tag-modal:hover {
  opacity: 1 !important;
}
</style>
