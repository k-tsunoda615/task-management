<template>
  <UModal v-model="isOpen">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">タグ管理</h3>
          <UButton
            icon="i-heroicons-plus-circle"
            color="gray"
            variant="ghost"
            size="xs"
            class="hover:bg-gray-100 rounded-full"
            @click="isCreatingNewTag = true"
            v-if="!isCreatingNewTag && !isEditing"
          />
        </div>
      </template>
      <div class="space-y-4">
        <!-- 新規タグ追加フォーム -->
        <div
          v-if="isCreatingNewTag"
          class="flex gap-2 items-center bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 transition-all duration-200"
        >
          <div class="relative">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <div
                class="w-6 h-6 rounded-full cursor-pointer border border-gray-200"
                :style="{ backgroundColor: localColor }"
              ></div>

              <template #panel>
                <div class="p-2 w-40">
                  <div class="grid grid-cols-5 gap-2 mb-2">
                    <div
                      v-for="color in predefinedColors"
                      :key="color"
                      class="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform duration-150"
                      :style="{ backgroundColor: color }"
                      @click="selectColor(color)"
                    ></div>
                  </div>
                  <input
                    type="color"
                    v-model="localColor"
                    class="w-full h-6 cursor-pointer"
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
            autofocus
          />
          <div class="flex gap-1">
            <UButton
              size="xs"
              icon="i-heroicons-check"
              color="primary"
              variant="soft"
              @click="handleAddTag()"
            />
            <UButton
              size="xs"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="soft"
              @click="isCreatingNewTag = false"
            />
          </div>
        </div>

        <!-- タグ編集フォーム -->
        <div
          v-if="isEditing"
          class="flex gap-2 items-center bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 transition-all duration-200"
        >
          <div class="relative">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <div
                class="w-6 h-6 rounded-full cursor-pointer border border-gray-200"
                :style="{ backgroundColor: editColor }"
              ></div>

              <template #panel>
                <div class="p-2 w-40">
                  <div class="grid grid-cols-5 gap-2 mb-2">
                    <div
                      v-for="color in predefinedColors"
                      :key="color"
                      class="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform duration-150"
                      :style="{ backgroundColor: color }"
                      @click="editColor = color"
                    ></div>
                  </div>
                  <input
                    type="color"
                    v-model="editColor"
                    class="w-full h-6 cursor-pointer"
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
            autofocus
          />
          <div class="flex gap-1">
            <UButton
              size="xs"
              icon="i-heroicons-check"
              color="primary"
              variant="soft"
              @click="handleUpdateTag"
            />
            <UButton
              size="xs"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="soft"
              @click="cancelEditing"
            />
          </div>
        </div>

        <!-- タグリスト -->
        <div class="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
          <div v-for="tag in sortedTags" :key="tag.id" class="group relative">
            <div
              class="flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              @click="startEditing(tag)"
            >
              <div
                class="w-3.5 h-3.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: tag.color || '#3b82f6' }"
              ></div>
              <span class="text-sm text-gray-700">{{ tag.name }}</span>
              <UButton
                icon="i-heroicons-x-mark"
                size="xs"
                color="gray"
                variant="ghost"
                class="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5"
                @click.stop="confirmDeleteTag(tag.id)"
              />
            </div>
          </div>
        </div>

        <!-- タグがない場合のメッセージ -->
        <div
          v-if="tagStore?.tags.length === 0 && !isCreatingNewTag"
          class="text-center p-4"
        >
          <p class="text-gray-500 text-sm">タグがありません</p>
          <UButton
            icon="i-heroicons-plus"
            color="gray"
            variant="ghost"
            size="sm"
            class="mt-2"
            @click="isCreatingNewTag = true"
          >
            最初のタグを作成
          </UButton>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UButton variant="ghost" @click="closeModal">閉じる</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
const localName = ref(props.newTagName || "");
const localColor = ref(props.newTagColor || "#3b82f6");
const isCreatingNewTag = ref(false);

// 編集モード用の状態
const isEditing = ref(false);
const editingTagId = ref<string | null>(null);
const editName = ref("");
const editColor = ref("#3b82f6");

// あらかじめ定義された色のリスト
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

// タグを名前でソート
const sortedTags = computed(() => {
  if (!props.tagStore?.tags) return [];
  return [...props.tagStore.tags].sort((a, b) => a.name.localeCompare(b.name));
});

watch(
  () => props.show,
  (newVal) => {
    isOpen.value = newVal;
  }
);

watch(isOpen, (newVal) => {
  emit("update:show", newVal);
  if (!newVal) {
    emit("close");
    cancelEditing();
    isCreatingNewTag.value = false;
  }
});

watch(
  () => props.newTagName,
  (newVal) => {
    localName.value = newVal || "";
  }
);

watch(
  () => props.newTagColor,
  (newVal) => {
    localColor.value = newVal || "#3b82f6";
  }
);

watch(localName, (newVal) => {
  emit("updateNewTagName", newVal);
});

watch(localColor, (newVal) => {
  emit("updateNewTagColor", newVal);
});

const handleAddTag = () => {
  if (localName.value.trim() === "") return;
  emit("addTag");
  isCreatingNewTag.value = false;
};

const startEditing = (tag: Tag) => {
  isEditing.value = true;
  editingTagId.value = tag.id;
  editName.value = tag.name;
  editColor.value = tag.color || "#3b82f6";
  isCreatingNewTag.value = false;
};

const cancelEditing = () => {
  isEditing.value = false;
  editingTagId.value = null;
  editName.value = "";
  editColor.value = "#3b82f6";
};

const handleUpdateTag = () => {
  if (editingTagId.value && editName.value.trim() !== "") {
    emit("updateTag", {
      id: editingTagId.value,
      name: editName.value,
      color: editColor.value,
    });
    cancelEditing();
  }
};

const selectColor = (color: string) => {
  localColor.value = color;
};

const confirmDeleteTag = (tagId: string) => {
  emit("deleteTag", tagId);
};

const closeModal = () => {
  isOpen.value = false;
};
</script>
