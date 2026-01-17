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
        <p v-if="isOpen || isMobile" class="font-medium text-gray-900">
          メニュー
        </p>
        <UButton
          v-if="isMobile"
          color="gray"
          variant="ghost"
          size="sm"
          class="hover:bg-gray-100"
          @click="$emit('close-mobile-menu')"
        >
          <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
        </UButton>
        <UButton
          v-else
          color="gray"
          variant="ghost"
          size="sm"
          class="hover:bg-gray-100"
          @click="toggleSidebar"
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
              class="justify-start hover:bg-gray-100"
              @click="$emit('open-new-task-modal')"
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
              class="justify-start hover:bg-gray-100 relative"
              @click="showTagModal = true"
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
            <!-- ボードビュー -->
            <UTooltip
              :text="!isOpen ? 'ボードビュー' : ''"
              :ui="{ popper: { strategy: 'fixed' } }"
              class="w-full"
            >
              <UButton
                :block="isOpen || isMobile"
                :color="isCurrentRoute('/board') ? 'primary' : 'gray'"
                :variant="isCurrentRoute('/board') ? 'soft' : 'ghost'"
                class="justify-start hover:bg-gray-100"
                @click="navigateToBoard"
              >
                <UIcon
                  name="i-heroicons-view-columns"
                  class="w-5 h-5"
                  :class="
                    isCurrentRoute('/board')
                      ? 'text-primary-500'
                      : 'text-gray-500'
                  "
                />
                <span v-if="isOpen || isMobile" class="ml-2">
                  ボードビュー
                </span>
              </UButton>
            </UTooltip>

            <!-- リストビュー -->
            <UTooltip
              :text="!isOpen ? 'リストビュー' : ''"
              :ui="{ popper: { strategy: 'fixed' } }"
              class="w-full"
            >
              <UButton
                :block="isOpen || isMobile"
                :color="isCurrentRoute('/list') ? 'primary' : 'gray'"
                :variant="isCurrentRoute('/list') ? 'soft' : 'ghost'"
                class="justify-start hover:bg-gray-100"
                @click="navigateTo('/list')"
              >
                <UIcon
                  name="i-heroicons-table-cells"
                  class="w-5 h-5"
                  :class="
                    isCurrentRoute('/list')
                      ? 'text-primary-500'
                      : 'text-gray-500'
                  "
                />
                <span v-if="isOpen || isMobile" class="ml-2">
                  リストビュー
                </span>
              </UButton>
            </UTooltip>

            <!-- アナリティクスビュー -->
            <UTooltip
              :text="!isOpen ? 'アナリティクスビュー' : ''"
              :ui="{ popper: { strategy: 'fixed' } }"
              class="w-full"
            >
              <UButton
                :block="isOpen || isMobile"
                :color="isCurrentRoute('/analytics') ? 'primary' : 'gray'"
                :variant="isCurrentRoute('/analytics') ? 'soft' : 'ghost'"
                class="justify-start hover:bg-gray-100"
                @click="navigateTo('/analytics')"
              >
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="w-5 h-5"
                  :class="
                    isCurrentRoute('/analytics')
                      ? 'text-primary-500'
                      : 'text-gray-500'
                  "
                />
                <span v-if="isOpen || isMobile" class="ml-2">
                  アナリティクスビュー
                </span>
              </UButton>
            </UTooltip>

            <!-- 管理ページ if(isAdmin)はあとで実装 -->
            <UTooltip
              :text="!isOpen ? '管理ダッシュボード' : ''"
              :ui="{ popper: { strategy: 'fixed' } }"
              class="w-full"
            >
              <UButton
                :block="isOpen || isMobile"
                :color="isCurrentRoute('/admin') ? 'primary' : 'gray'"
                :variant="isCurrentRoute('/admin') ? 'soft' : 'ghost'"
                class="justify-start hover:bg-gray-100"
                @click="navigateTo('/admin')"
              >
                <UIcon
                  name="i-heroicons-shield-check"
                  class="w-5 h-5"
                  :class="
                    isCurrentRoute('/admin')
                      ? 'text-primary-500'
                      : 'text-gray-500'
                  "
                />
                <span v-if="isOpen || isMobile" class="ml-2">
                  管理ダッシュボード
                </span>
              </UButton>
            </UTooltip>
          </div>
        </div>

        <!-- 区切り線 -->
        <div class="my-2 border-t border-gray-200" />

        <!-- 表示切り替え系ボタン群 -->
        <!-- フィルター表示切り替え -->
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
              :icon="getFilterIcon()"
              class="justify-start hover:bg-gray-100"
              @click="toggleTaskFilter"
            >
              <span v-if="isOpen || isMobile" class="ml-2">{{
                getFilterLabel()
              }}</span>
            </UButton>
          </UTooltip>
        </div>

        <!-- タグ表示切り替え -->
        <div
          v-if="isCurrentRoute('/board')"
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
              class="justify-start hover:bg-gray-100"
              @click="toggleTagVisibility"
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

        <!-- タイマー表示切り替え -->
        <div
          v-if="isCurrentRoute('/board')"
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
              class="justify-start hover:bg-gray-100"
              @click="toggleTimerVisibility"
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

        <!-- 完了タスク表示切り替え -->
        <div
          class="px-3 py-1.5"
          :class="{ 'text-center': !isOpen && !isMobile }"
        >
          <UTooltip
            :text="
              !isOpen
                ? showCompletedTasks
                  ? '完了タスク非表示'
                  : '完了タスク表示'
                : ''
            "
            :ui="{ popper: { strategy: 'fixed' } }"
            class="w-full"
          >
            <UButton
              :block="isOpen || isMobile"
              :color="showCompletedTasks ? 'green' : 'gray'"
              :variant="'ghost'"
              class="justify-start hover:bg-gray-100"
              @click="toggleCompletedTasksVisibility"
            >
              <UIcon
                name="i-heroicons-check-circle"
                class="w-5 h-5"
                :class="showCompletedTasks ? 'text-green-500' : 'text-gray-400'"
              />
              <span v-if="isOpen || isMobile" class="ml-2">
                {{
                  showCompletedTasks ? "完了タスク表示中" : "完了タスク非表示"
                }}
              </span>
            </UButton>
          </UTooltip>
        </div>
      </div>

      <!-- ゴミ箱エリア -->
      <div class="mt-auto border-t border-gray-200">
        <!-- ゴミ箱 -->
        <div v-if="!isMobile && isCurrentRoute('/board')">
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
            <div
              v-if="!isOpen && !isMobile"
              class="flex flex-col items-center justify-center gap-1"
            >
              <span class="text-[11px] text-gray-500">
                {{ totalItemCount }}件
              </span>
              <hr class="w-full border-gray-200" >
              <span class="text-[11px] text-gray-500">
                {{ formattedStorageUsage }}
              </span>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-1">
              <span class="text-[11px] text-gray-500">
                アイテム数: {{ totalItemCount }} / 100
              </span>
              <span class="text-[11px] text-gray-500">
                ストレージ容量: {{ formattedStorageUsage }} / 1GB
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
      :tag-store="tagStore"
      :new-tag-name="newTagName"
      :new-tag-color="newTagColor"
      @close="showTagModal = false"
      @add-tag="addTag"
      @delete-tag="deleteTag"
      @update-tag="updateTag"
      @update-new-tag-name="(val: string) => (newTagName = val)"
      @update-new-tag-color="(val: string) => (newTagColor = val)"
    />
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from "../../../stores/tasks";
import { useTagStore } from "../../../stores/tags";
import { useEventBus } from "@vueuse/core";
import TagManageModal from "../modals/TagManageModal.vue";
import { useTagOperations } from "../../composables/useTagOperations";

defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const _emit = defineEmits(["close-mobile-menu", "open-new-task-modal"]);

const todoStore = useTodoStore();
const { tagStore, newTagName, newTagColor, addTag, deleteTag, updateTag } =
  useTagOperations();

const trashEventBus = useEventBus("trash-drop");
const isDragOver = ref(false);
const isOpen = ref(true); // サイドバーの開閉状態
const showTimer = ref(true); // タイマー表示状態
const showTagModal = ref(false);
const showTagBar = ref(true); // タグ表示状態
const showCompletedTasks = ref(false); // 完了タスク表示状態の初期値はfalse
const route = useRoute();
const router = useRouter();

// tagStoreを直接インポート
const directTagStore = useTagStore();

// コンピューテッドプロパティを追加 - アイテム数(todo + tag)を計算
const totalItemCount = computed(() => {
  const todoCount = todoStore.totalTodoCount || 0;
  const tagCount = directTagStore.totalTagCount || 0;
  return todoCount + tagCount;
});

const totalAssetSize = computed(() => {
  return todoStore.todos.reduce((sum, todo) => {
    const assets = todo.assets || [];
    const assetSize = assets.reduce(
      (assetSum, asset) => assetSum + (asset.size || 0),
      0
    );
    return sum + assetSize;
  }, 0);
});

const formattedStorageUsage = computed(() => formatBytes(totalAssetSize.value));

/**
 * バイト数を人間可読な単位に変換する。
 * @description B/KB/MB/GB の範囲で表示する。
 * @param {number} bytes - 変換対象のバイト数。
 * @returns {string} 表示用のサイズ文字列。
 */
const formatBytes = (bytes: number) => {
  if (!bytes || bytes <= 0) {
    return "0MB";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const decimals = unitIndex <= 1 ? 0 : 1;
  const value = size.toFixed(decimals);
  return `${decimals === 0 ? value : value.replace(/\.0$/, "")}${units[unitIndex]}`;
};

/**
 * 現在のルートが指定パス配下かを判定する。
 * @description ルートの prefix で一致を確認する。
 * @param {string} path - 判定対象のパス。
 * @returns {boolean} 一致する場合 true。
 */
const isCurrentRoute = (path: string): boolean => {
  return route.path.startsWith(path);
};

/**
 * 指定パスへ遷移する。
 * @description Router を使ってページ遷移する。
 * @param {string} path - 遷移先パス。
 * @returns {void} なし。
 */
const navigateTo = (path: string): void => {
  router.push(path);
};

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

  // 完了タスク表示状態を復元
  const savedCompletedTasksState = localStorage.getItem("showCompletedTasks");
  if (savedCompletedTasksState !== null) {
    showCompletedTasks.value = savedCompletedTasksState === "true";
  }

  // タグを取得
  await directTagStore.fetchTags();
});

// ボードビューに移動
/**
 * ボードビューへ移動する。
 * @description /board へ遷移する。
 * @returns {void} なし。
 */
const navigateToBoard = () => {
  navigateTo("/board");
};

// サイドバーの開閉を切り替える
/**
 * サイドバーの開閉状態を切り替える。
 * @description 状態を保存し、カスタムイベントを発行する。
 * @returns {void} なし。
 */
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
/**
 * タイマー表示の切り替えを行う。
 * @description 状態を保存し、カスタムイベントを発行する。
 * @returns {void} なし。
 */
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
/**
 * タグ表示の切り替えを行う。
 * @description 状態を保存し、カスタムイベントを発行する。
 * @returns {void} なし。
 */
const toggleTagVisibility = () => {
  showTagBar.value = !showTagBar.value;
  localStorage.setItem("showTagBar", showTagBar.value.toString());
  window.dispatchEvent(
    new CustomEvent("tagVisibilityToggle", {
      detail: { showTagBar: showTagBar.value },
    })
  );
};

// 完了タスク表示の切り替え
/**
 * 完了タスク表示の切り替えを行う。
 * @description 状態を保存し、カスタムイベントを発行する。
 * @returns {void} なし。
 */
const toggleCompletedTasksVisibility = () => {
  showCompletedTasks.value = !showCompletedTasks.value;
  localStorage.setItem(
    "showCompletedTasks",
    showCompletedTasks.value.toString()
  );
  window.dispatchEvent(
    new CustomEvent("completedTasksVisibilityToggle", {
      detail: { showCompletedTasks: showCompletedTasks.value },
    })
  );
};

// フィルターに応じたラベルを取得
/**
 * 現在のフィルターに応じたラベルを返す。
 * @description taskFilter の値から表示ラベルを決定する。
 * @returns {string} 表示ラベル。
 */
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
/**
 * 現在のフィルターに応じたアイコン名を返す。
 * @description taskFilter の値からアイコンを決定する。
 * @returns {string} アイコン名。
 */
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

/**
 * フィルターのボタン色を取得する。
 * @description taskFilter の値から色を決定する。
 * @returns {string} 色名。
 */
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

/**
 * フィルター状態を順番に切り替える。
 * @description all → private → public → all の順で切り替える。
 * @returns {void} なし。
 */
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

/**
 * ゴミ箱へのドロップを処理する。
 * @description DragEvent から todoId を取得し削除イベントを送る。
 * @param {DragEvent} event - ドロップイベント。
 * @returns {void} なし。
 */
const handleTrashDrop = (event: DragEvent) => {
  const todoId = event.dataTransfer?.getData("todoId");
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
