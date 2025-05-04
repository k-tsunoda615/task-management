<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">タグ管理</h3>
      </template>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in tagStore?.tags"
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
              @click="startEditing(tag)"
            >
              {{ tag.name }}
            </UBadge>
            <UButton
              icon="i-heroicons-x-mark"
              size="2xs"
              color="red"
              variant="ghost"
              class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="$emit('deleteTag', tag.id)"
            />
          </div>
        </div>

        <!-- タグ編集フォーム -->
        <div
          v-if="isEditing"
          class="flex gap-2 items-center bg-gray-50 p-2 rounded-md"
        >
          <input
            type="color"
            v-model="editColor"
            class="w-8 h-8 rounded-md border border-gray-200 p-0.5 cursor-pointer transition-shadow hover:shadow-sm"
          />
          <UInput
            v-model="editName"
            placeholder="タグ名を編集"
            size="sm"
            class="flex-1"
          />
          <div class="flex gap-1">
            <UButton
              size="sm"
              icon="i-heroicons-check"
              color="green"
              @click="handleUpdateTag"
            >
              保存
            </UButton>
            <UButton
              size="sm"
              icon="i-heroicons-x-mark"
              color="gray"
              @click="cancelEditing"
            >
              キャンセル
            </UButton>
          </div>
        </div>

        <!-- 新規タグ追加フォーム -->
        <div v-else class="flex gap-2 items-center">
          <input
            type="color"
            v-model="localColor"
            class="w-8 h-8 rounded-md border border-gray-200 p-0.5 cursor-pointer transition-shadow hover:shadow-sm"
          />
          <UInput
            v-model="localName"
            placeholder="新しいタグ名"
            size="sm"
            class="flex-1"
          />
          <UButton
            size="sm"
            icon="i-heroicons-plus"
            color="primary"
            @click="handleAddTag"
          >
            追加
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
import { ref, watch } from "vue";
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

// 編集モード用の状態
const isEditing = ref(false);
const editingTagId = ref<string | null>(null);
const editName = ref("");
const editColor = ref("#3b82f6");

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
  emit("addTag");
};

const startEditing = (tag: Tag) => {
  isEditing.value = true;
  editingTagId.value = tag.id;
  editName.value = tag.name;
  editColor.value = tag.color || "#3b82f6";
};

const cancelEditing = () => {
  isEditing.value = false;
  editingTagId.value = null;
  editName.value = "";
  editColor.value = "#3b82f6";
};

const handleUpdateTag = () => {
  if (editingTagId.value) {
    emit("updateTag", {
      id: editingTagId.value,
      name: editName.value,
      color: editColor.value,
    });
    cancelEditing();
  }
};

const closeModal = () => {
  isOpen.value = false;
};
</script>
