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

    <!-- タグ管理モーダル -->
    <UModal v-model="showTagModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-gray-900">タグ管理</h3>
        </template>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="tag in todoStore.tags"
              :key="tag.id"
              class="relative group"
            >
              <UBadge
                :style="{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color || '#3b82f6',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '0.75rem',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.75rem',
                  lineHeight: '1.25',
                }"
                class="transition-all duration-200"
              >
                {{ tag.name }}
              </UBadge>
              <UButton
                icon="i-heroicons-x-mark"
                size="2xs"
                color="red"
                variant="ghost"
                class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                @click="deleteTag(tag.id)"
              />
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <input
              type="color"
              v-model="newTagColor"
              class="w-8 h-8 rounded-md border border-gray-200 p-0.5 cursor-pointer transition-shadow hover:shadow-sm"
            />
            <UInput
              v-model="newTagName"
              placeholder="新しいタグ名"
              size="sm"
              class="flex-1"
            />
            <UButton
              size="sm"
              icon="i-heroicons-plus"
              color="primary"
              @click="addTag"
            >
              追加
            </UButton>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton variant="ghost" @click="showTagModal = false"
              >閉じる</UButton
            >
          </div>
        </template>
      </UCard>
    </UModal>
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
  if (todoStore.tags.some((t) => t.name === name)) {
    newTagName.value = "";
    newTagColor.value = randomColor();
    return;
  }
  const { data, error } = await todoStore.createTag({ name, color });
  if (!error && data) {
    await todoStore.fetchTodos(); // タグ一覧を最新化
    newTagName.value = "";
    newTagColor.value = randomColor();
  }
};

const deleteTag = async (tagId: string) => {
  if (!confirm("このタグを削除しますか？")) return;
  await todoStore.deleteTag(tagId);
  await todoStore.fetchTodos(); // タグ一覧を最新化
};

// 色を暗くするユーティリティ関数
function darkenColor(hex: string, amount = 0.2) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
</script>

<style scoped>
.tag-modern.tag-modal:hover {
  opacity: 1 !important;
}
</style>
