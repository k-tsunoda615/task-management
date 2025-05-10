<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'items-start my-20',
      width: 'sm:max-w-md',
      overlay: { base: 'bg-gray-950/75' },
    }"
  >
    <UCard
      :ui="{
        base: 'bg-white shadow-lg rounded-lg',
        header: { padding: 'px-6 py-4' },
        body: { padding: 'px-6 py-2' },
        footer: { padding: 'px-6 py-4' },
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">タグ編集</h3>
          <UButton
            v-if="!isCreatingNewTag && !isEditing"
            icon="i-heroicons-plus"
            color="gray"
            variant="ghost"
            size="sm"
            class="hover:bg-gray-100 rounded-lg"
            @click="isCreatingNewTag = true"
          />
        </div>
      </template>

      <div class="space-y-4">
        <!-- 新規タグ追加フォーム -->
        <div
          v-if="isCreatingNewTag"
          class="flex gap-2 items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200"
        >
          <div class="relative">
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              :ui="{
                container:
                  'border border-gray-200 shadow-lg rounded-lg bg-white',
                base: 'relative',
              }"
            >
              <div
                class="w-6 h-6 rounded-lg cursor-pointer border border-gray-200 transition-shadow hover:shadow-sm"
                :style="{ backgroundColor: localColor }"
              ></div>

              <template #panel>
                <div class="p-3 w-44">
                  <div class="grid grid-cols-5 gap-2 mb-3">
                    <div
                      v-for="color in predefinedColors"
                      :key="color"
                      class="w-6 h-6 rounded-lg cursor-pointer hover:scale-110 transition-all duration-150 border border-gray-200"
                      :style="{ backgroundColor: color }"
                      @click="localColor = color"
                    ></div>
                  </div>
                  <input
                    type="color"
                    v-model="localColor"
                    class="w-full h-8 cursor-pointer rounded"
                  />
                </div>
              </template>
            </UPopover>
          </div>
          <UInput
            v-model="localName"
            placeholder="新しいタグ名"
            size="sm"
            class="flex-1"
            :ui="{
              base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 rounded-lg shadow-sm',
              input:
                'block w-full bg-gray-50/50 rounded-lg border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6',
            }"
            autofocus
          />
          <div class="flex gap-1">
            <UButton
              size="sm"
              icon="i-heroicons-check"
              color="primary"
              variant="soft"
              class="rounded-lg"
              @click="handleAddTag()"
            />
            <UButton
              size="sm"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="soft"
              class="rounded-lg"
              @click="cancelNewTag"
            />
          </div>
        </div>

        <!-- タグ編集フォーム -->
        <div
          v-if="isEditing"
          class="flex gap-2 items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200"
        >
          <div class="relative">
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              :ui="{
                container:
                  'border border-gray-200 shadow-lg rounded-lg bg-white',
                base: 'relative',
              }"
            >
              <div
                class="w-6 h-6 rounded-lg cursor-pointer border border-gray-200 transition-shadow hover:shadow-sm"
                :style="{ backgroundColor: editColor }"
              ></div>

              <template #panel>
                <div class="p-3 w-44">
                  <div class="grid grid-cols-5 gap-2 mb-3">
                    <div
                      v-for="color in predefinedColors"
                      :key="color"
                      class="w-6 h-6 rounded-lg cursor-pointer hover:scale-110 transition-all duration-150 border border-gray-200"
                      :style="{ backgroundColor: color }"
                      @click="editColor = color"
                    ></div>
                  </div>
                  <input
                    type="color"
                    v-model="editColor"
                    class="w-full h-8 cursor-pointer rounded"
                  />
                </div>
              </template>
            </UPopover>
          </div>
          <UInput
            v-model="editName"
            placeholder="タグ名を編集"
            size="sm"
            class="flex-1"
            :ui="{
              base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 rounded-lg shadow-sm',
              input:
                'block w-full bg-gray-50/50 rounded-lg border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6',
            }"
            autofocus
          />
          <div class="flex gap-1">
            <UButton
              size="sm"
              icon="i-heroicons-check"
              color="primary"
              variant="soft"
              class="rounded-lg"
              @click="handleUpdateTag"
            />
            <UButton
              size="sm"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="soft"
              class="rounded-lg"
              @click="cancelEditing"
            />
          </div>
        </div>

        <!-- タグリスト -->
        <div
          class="max-h-[240px] overflow-y-auto -mx-2 divide-y divide-gray-100"
        >
          <div v-for="tag in sortedTags" :key="tag.id" class="group relative">
            <div
              class="flex items-center gap-3 py-2.5 px-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              @click="startEditing(tag)"
            >
              <div class="flex items-center gap-3 flex-1">
                <UIcon
                  name="i-heroicons-bars-2"
                  class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                />
                <div
                  class="w-4 h-4 rounded-md flex-shrink-0 border border-gray-200"
                  :style="{ backgroundColor: tag.color || '#3b82f6' }"
                ></div>
                <span class="text-sm text-gray-700">{{ tag.name }}</span>
              </div>
              <UButton
                icon="i-heroicons-x-mark"
                size="xs"
                color="gray"
                variant="ghost"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md"
                @click.stop="confirmDeleteTag(tag.id)"
              />
            </div>
          </div>
        </div>

        <!-- タグがない場合のメッセージ -->
        <div
          v-if="tagStore?.tags.length === 0 && !isCreatingNewTag"
          class="text-center py-12"
        >
          <p class="text-gray-500 text-sm mb-3">タグがありません</p>
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            variant="soft"
            size="sm"
            class="rounded-lg"
            @click="isCreatingNewTag = true"
          >
            最初のタグを作成
          </UButton>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            variant="soft"
            color="gray"
            class="rounded-lg"
            @click="closeModal"
          >
            閉じる
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import type { Tag } from "../../types/todo";

const props = defineProps({
  show: Boolean,
  tagStore: Object,
  newTagName: String,
  newTagColor: String,
});

const emit = defineEmits([
  "close",
  "addTag",
  "deleteTag",
  "updateNewTagName",
  "updateNewTagColor",
  "update:show",
  "updateTag",
]);

const isOpen = ref(props.show);
const localName = ref("");
const localColor = ref("#3b82f6");
const isCreatingNewTag = ref(false);

// 編集モード用の状態
const isEditing = ref(false);
const editingTagId = ref<string | null>(null);
const editName = ref("");
const editColor = ref("#3b82f6");

// メモ化した配列 (頻繁に変更されないデータ)
const predefinedColors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#eab308", // yellow
  "#6366f1", // indigo
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#14b8a6", // teal
  "#f97316", // orange
  "#64748b", // slate
];

// 最適化: ソートは変更があったときのみ実行
const sortedTags = computed(() => {
  if (!props.tagStore?.tags || props.tagStore.tags.length === 0) return [];
  return props.tagStore.sortedTags;
});

// モーダルの表示/非表示の処理
watch(
  () => props.show,
  (newVal) => {
    isOpen.value = newVal;
    if (newVal) {
      // モーダルが開いたときにローカル変数を初期化
      localName.value = props.newTagName || "";
      localColor.value = props.newTagColor || "#3b82f6";
    }
  },
  { immediate: true }
);

// モーダルが閉じられたときの処理
watch(isOpen, (newVal) => {
  emit("update:show", newVal);
  if (!newVal) {
    // クリーンアップ
    emit("close");
    cancelEditing();
    isCreatingNewTag.value = false;
  }
});

// 入力値の変更をプロパゲート (デバウンス処理を追加)
const updateNewTagValues = useDebounceFn(() => {
  emit("updateNewTagName", localName.value);
  emit("updateNewTagColor", localColor.value);
}, 200);

// ローカル名前/色の変更を監視して親コンポーネントに通知
watch([localName, localColor], updateNewTagValues);

// 新しいタグを追加
const handleAddTag = async () => {
  if (localName.value.trim() === "") return;

  emit("addTag");

  // 状態をリセット
  await nextTick();
  isCreatingNewTag.value = false;
  localName.value = "";
  localColor.value = "#3b82f6";
};

// 新規タグ追加をキャンセル
const cancelNewTag = () => {
  isCreatingNewTag.value = false;
  localName.value = "";
  localColor.value = "#3b82f6";
};

// タグ編集開始
const startEditing = (tag: Tag) => {
  // 既存の編集をキャンセル
  cancelEditing();

  // 新しいタグの作成をキャンセル
  isCreatingNewTag.value = false;

  // 編集モードを開始
  isEditing.value = true;
  editingTagId.value = tag.id;
  editName.value = tag.name;
  editColor.value = tag.color || "#3b82f6";
};

// 編集をキャンセル
const cancelEditing = () => {
  isEditing.value = false;
  editingTagId.value = null;
  editName.value = "";
  editColor.value = "#3b82f6";
};

// タグ更新を処理
const handleUpdateTag = async () => {
  if (!editingTagId.value || !editName.value.trim()) return;

  // 親コンポーネントに通知
  emit("updateTag", {
    id: editingTagId.value,
    name: editName.value,
    color: editColor.value,
  });

  // 編集モードを終了
  await nextTick();
  cancelEditing();
};

// タグ削除の確認
const confirmDeleteTag = (tagId: string) => {
  emit("deleteTag", tagId);
};

// モーダルを閉じる
const closeModal = () => {
  isOpen.value = false;
};
</script>
