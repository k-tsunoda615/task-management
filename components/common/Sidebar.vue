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
        <!-- 機能系ボタン群 -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="!isOpen ? '新しいタスク' : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <UButton
              :block="isOpen || isMobile"
              color="gray"
              variant="ghost"
              @click="$emit('open-new-task-modal')"
              class="justify-start hover:bg-gray-100"
            >
              <UIcon
                name="i-heroicons-plus-circle"
                class="w-5 h-5 text-primary-500"
              />
              <span v-if="isOpen || isMobile" class="ml-2">新しいタスク</span>
            </UButton>
          </UTooltip>
        </div>
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="!isOpen ? 'タグ編集' : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <UButton
              :block="isOpen || isMobile"
              color="gray"
              variant="ghost"
              @click="showTagModal = true"
              class="justify-start hover:bg-gray-100 relative"
            >
              <span class="relative inline-block w-5 h-5">
                <UIcon name="i-heroicons-tag" class="w-5 h-5 text-gray-500" />
                <UIcon
                  name="i-heroicons-plus"
                  class="w-3 h-3 text-gray-500 absolute right-[-3px] top-[-4px]"
                />
              </span>
              <span v-if="isOpen || isMobile" class="ml-2">タグ編集</span>
            </UButton>
          </UTooltip>
        </div>

        <!-- 区切り線 -->
        <div class="my-2 border-t border-gray-200" />

        <!-- ビュー切り替え -->
        <div class="px-3 py-1 mb-1">
          <p
            v-if="isOpen || isMobile"
            class="text-xs font-medium text-gray-500 uppercase px-1.5 mb-1"
          >
            表示形式
          </p>
          <div class="flex flex-col gap-1">
            <!-- 統合された表示形式切り替えボタン -->
            <UTooltip
              :text="!isOpen ? getViewModeLabel() : ''"
              :ui="{ popper: { strategy: 'fixed' } }"
              class="w-full"
            >
              <UButton
                :block="isOpen || isMobile"
                :color="'primary'"
                :variant="'soft'"
                @click="cycleViewMode"
                class="justify-start hover:bg-gray-100"
              >
                <UIcon
                  :name="getViewModeIcon()"
                  class="w-5 h-5 text-primary-500"
                />
                <span v-if="isOpen || isMobile" class="ml-2">
                  {{ getViewModeLabel() }}
                </span>
              </UButton>
            </UTooltip>
          </div>
        </div>

        <!-- 区切り線 -->
        <div class="my-2 border-t border-gray-200" />

        <!-- 表示切り替え系ボタン群 -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="!isOpen ? getFilterLabel() : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
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
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="!isOpen ? (showTagBar ? 'タグ非表示' : 'タグ表示') : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <UButton
              :block="isOpen || isMobile"
              :color="showTagBar ? 'green' : 'gray'"
              :variant="'ghost'"
              @click="toggleTagVisibility"
              class="justify-start hover:bg-gray-100"
            >
              <UIcon
                name="i-heroicons-tag"
                class="w-5 h-5"
                :class="showTagBar ? 'text-green-500' : 'text-gray-400'"
              />
              <span v-if="isOpen || isMobile" class="ml-2">
                {{ showTagBar ? "タグ表示中" : "タグ非表示" }}
              </span>
            </UButton>
          </UTooltip>
        </div>
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="
              !isOpen ? (showTimer ? 'タイマー非表示' : 'タイマー表示') : ''
            "
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <UButton
              :block="isOpen || isMobile"
              :color="showTimer ? 'green' : 'gray'"
              :variant="'ghost'"
              @click="toggleTimerVisibility"
              class="justify-start hover:bg-gray-100"
            >
              <UIcon
                name="i-heroicons-clock"
                :class="showTimer ? 'text-green-500' : 'text-gray-400'"
                class="w-5 h-5"
              />
              <span v-if="isOpen || isMobile" class="ml-2">
                {{ showTimer ? "タイマー表示中" : "タイマー非表示" }}
              </span>
            </UButton>
          </UTooltip>
        </div>

        <!-- アナリティクス -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="!isOpen ? 'アナリティクス' : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <UButton
              :block="isOpen || isMobile"
              color="gray"
              :variant="isCurrentRoute('/analytics') ? 'solid' : 'ghost'"
              @click="navigateTo('/analytics')"
              class="justify-start hover:bg-gray-100"
            >
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-5 h-5"
                :class="
                  isCurrentRoute('/analytics')
                    ? 'text-primary-500'
                    : 'text-gray-400'
                "
              />
              <span v-if="isOpen || isMobile" class="ml-2">アナリティクス</span>
            </UButton>
          </UTooltip>
        </div>
      </div>

      <!-- ゴミ箱エリア -->
      <div class="mt-auto border-t border-gray-200">
        <!-- ゴミ箱 -->
        <div v-if="!isMobile">
          <UTooltip
            :text="!isOpen ? 'タスクをドラッグして削除' : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <div
              class="p-4 flex items-center justify-center transition-all duration-200 hover:bg-red-50 w-full"
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
                class="transition-colors duration-200 w-full"
                :class="isDragOver ? 'text-red-700' : 'text-gray-600'"
              >
                ドラッグで削除
              </span>
            </div>
          </UTooltip>
        </div>

        <!-- タスク数表示 -->
        <div class="px-4 py-3 text-center border-t border-gray-200 bg-gray-50">
          <UTooltip
            :text="!isOpen ? `アイテム数: ${totalItemCount}/100` : ''"
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <div class="flex items-center justify-center">
              <span class="text-xs text-gray-600" v-if="!isOpen && !isMobile">
                {{ totalItemCount }}%
              </span>
              <span v-else class="text-xs text-gray-600">
                アイテム数: {{ totalItemCount }} / 100
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
      @updateTag="updateTag"
      @updateNewTagName="(val: string) => (newTagName = val)"
      @updateNewTagColor="(val: string) => (newTagColor = val)"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "../../stores/project";
import { useTodoStore } from "../../stores/todo";
import { useTagStore } from "../../stores/tag";
import { useEventBus } from "@vueuse/core";
import TagManageModal from "../modals/TagManageModal.vue";
import { useTags } from "../../composables/useTags";

defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "close-mobile-menu",
  "toggle-layout",
  "open-new-task-modal",
]);

const projectStore = useProjectStore();
const todoStore = useTodoStore();
const { tagStore, newTagName, newTagColor, addTag, deleteTag, updateTag } =
  useTags();

const trashEventBus = useEventBus("trash-drop");
const isDragOver = ref(false);
const isOpen = ref(true); // サイドバーの開閉状態
const showTimer = ref(true); // タイマー表示状態
const showTagModal = ref(false);
const showTagBar = ref(true); // タグ表示状態
const route = useRoute();
const router = useRouter();

// tagStoreを直接インポート
const directTagStore = useTagStore();

// コンピューテッドプロパティを追加 - アイテム数(todo + tag)を計算
const totalItemCount = computed(() => {
  const todoCount = todoStore.totalTodoCount || 0;
  // useTags()から取得したtagStoreではなく、直接インポートしたものを使用
  const tagCount = directTagStore.totalTagCount || 0;
  console.log("todoCount:", todoCount, "tagCount:", tagCount);
  return todoCount + tagCount;
});

// 現在のルートをチェックするメソッド
function isCurrentRoute(path: string): boolean {
  return route.path.startsWith(path);
}

// ページ遷移用関数
function navigateTo(path: string): void {
  router.push(path);
}

// viewモードの状態を管理
const viewModeState = ref(0); // 0: ボード通常, 1: ボード比率変化1, 2: ボード比率変化2, 3: リスト表示

// ページ読み込み時に状態を初期化
onMounted(async () => {
  const savedState = localStorage.getItem("sidebarOpen");
  if (savedState !== null) {
    isOpen.value = savedState === "true";
  }

  // タイマー表示状態を復元
  const savedTimerState = localStorage.getItem("showTimer");
  if (savedTimerState !== null) {
    showTimer.value = savedTimerState === "true";
  }

  // タグ表示状態を復元
  const savedTagBarState = localStorage.getItem("showTagBar");
  if (savedTagBarState !== null) {
    showTagBar.value = savedTagBarState === "true";
  }

  // プロジェクトとタグを取得
  await Promise.all([projectStore.fetchProjects(), directTagStore.fetchTags()]);

  // viewModeStateを初期化
  if (isCurrentRoute("/list")) {
    viewModeState.value = 3; // リスト表示
  } else {
    viewModeState.value = 0; // ボード表示（デフォルト）
  }
});

// ビューモードを循環させる
function cycleViewMode(): void {
  // 次の状態に進める
  viewModeState.value = (viewModeState.value + 1) % 4;

  // 状態に応じた処理
  if (viewModeState.value === 0) {
    // ボード表示（標準レイアウト）
    if (isCurrentRoute("/list")) {
      navigateTo("/board");
    }
    // レイアウトを標準に戻す
    resetLayout();
  } else if (viewModeState.value === 1 || viewModeState.value === 2) {
    // ボード表示（レイアウト変更）
    if (isCurrentRoute("/list")) {
      navigateTo("/board");
      // 画面遷移後にレイアウトを変更するための遅延処理
      setTimeout(() => {
        emit("toggle-layout");
      }, 100);
    } else {
      // すでにボード表示の場合は直接レイアウト変更
      emit("toggle-layout");
    }
  } else if (viewModeState.value === 3) {
    // リスト表示
    navigateTo("/list");
  }
}

// レイアウトをリセットする内部関数
function resetLayout(): void {
  // 実装は省略 - 必要に応じて実装
}

// 現在のビューモードを取得
function getViewModeLabel(): string {
  switch (viewModeState.value) {
    case 0:
      return "ボード表示：標準";
    case 1:
      return "ボード表示：比率1";
    case 2:
      return "ボード表示：比率2";
    case 3:
      return "リスト表示";
    default:
      return "ボード表示：標準";
  }
}

// 現在のビューモードアイコンを取得
function getViewModeIcon(): string {
  switch (viewModeState.value) {
    case 0:
      return "i-heroicons-view-columns";
    case 1:
      return "i-heroicons-squares-2x2";
    case 2:
      return "i-heroicons-squares-plus";
    case 3:
      return "i-heroicons-table-cells";
    default:
      return "i-heroicons-view-columns";
  }
}

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

// タグ表示の切り替え
const toggleTagVisibility = () => {
  showTagBar.value = !showTagBar.value;
  localStorage.setItem("showTagBar", showTagBar.value.toString());
  window.dispatchEvent(
    new CustomEvent("tagVisibilityToggle", {
      detail: { showTagBar: showTagBar.value },
    })
  );
};

// フィルターに応じたラベルを取得
const getFilterLabel = () => {
  switch (todoStore.taskFilter) {
    case "all":
      return "全てのタスク";
    case "private":
      return "プライベート";
    case "public":
      return "パブリック";
    default:
      return "全てのタスク";
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
      return "i-heroicons-eye";
    default:
      return "i-heroicons-globe-alt";
  }
};

const getFilterButtonColor = () => {
  switch (todoStore.taskFilter) {
    case "all":
      return "green";
    case "private":
      return "green";
    case "public":
      return "gray";
    default:
      return "gray";
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

<style scoped>
.tag-modern.tag-modal:hover {
  opacity: 1 !important;
}
</style>
