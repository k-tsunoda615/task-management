<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-medium text-gray-700">添付ファイル</h3>
      <div class="flex items-center gap-2">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-down-tray"
          :disabled="isDisabled || isUploading"
          @click="triggerFilePicker"
        >
          {{ isUploading ? "アップロード中..." : "ファイルを追加" }}
        </UButton>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          :accept="acceptString"
          :disabled="isDisabled || isUploading"
          @change="handleFileSelected"
        />
      </div>
    </div>

    <div v-if="!assets?.length" class="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
      添付ファイルはまだありません。{{ isDisabled ? "完了タスクでは編集できません。" : "「ファイルを追加」ボタンからアップロードできます。" }}
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="asset in assets"
        :key="asset.id"
        class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-500">
            <UIcon :name="iconForAsset(asset)" class="text-xl" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700 truncate max-w-[220px]">
              {{ asset.file_name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatSize(asset.size) }}
              <span v-if="asset.created_at">・{{ formatDate(asset.created_at) }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-up-right"
            :loading="downloadingAssetId === asset.id"
            @click="handleDownload(asset)"
          >
            開く
          </UButton>
          <UButton
            color="red"
            variant="ghost"
            icon="i-heroicons-trash"
            :disabled="isDisabled"
            :loading="deletingAssetId === asset.id"
            @click="handleDelete(asset)"
          >
            削除
          </UButton>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useTodoStore } from "../../../stores/tasks";
import { useTaskRepository } from "../../composables/useTaskRepository";
import {
  TASK_ASSET_ACCEPTED_TYPES,
  TASK_ASSET_MAX_SIZE,
} from "../../utils/constants";
import type { TodoAsset } from "../../../types/todo";

const props = defineProps<{
  todoId: string;
  assets: TodoAsset[];
  isDisabled?: boolean;
}>();

const emit = defineEmits<{
  (event: "uploaded", asset: TodoAsset): void;
  (event: "deleted", assetId: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const downloadingAssetId = ref<string | null>(null);
const deletingAssetId = ref<string | null>(null);

const acceptString = computed(() => TASK_ASSET_ACCEPTED_TYPES.join(","));
const toast = useToast();
const todoStore = useTodoStore();
const repository = useTaskRepository();

function triggerFilePicker() {
  if (props.isDisabled) {
    return;
  }
  fileInput.value?.click();
}

async function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  if (file.size > TASK_ASSET_MAX_SIZE) {
    toast.add({
      title: "アップロードできません",
      description: "ファイルサイズは10MB以下にしてください。",
      color: "red",
    });
    resetFileInput(input);
    return;
  }

  isUploading.value = true;
  try {
    const asset = await todoStore.uploadTodoAsset(props.todoId, file);
    toast.add({
      title: "アップロード完了",
      description: `${file.name} を添付しました。`,
      color: "green",
    });
    if (asset) {
      emit("uploaded", asset);
    }
  } catch (error) {
    console.error("[AssetManager] アップロードでエラー:", error);
    toast.add({
      title: "アップロードに失敗しました",
      description: "時間をおいて再度お試しください。",
      color: "red",
    });
  } finally {
    isUploading.value = false;
    resetFileInput(input);
  }
}

function resetFileInput(input: HTMLInputElement) {
  input.value = "";
}

async function handleDownload(asset: TodoAsset) {
  if (!process.client) return;

  downloadingAssetId.value = asset.id;
  try {
    const signedUrl = await repository.getTodoAssetUrl(asset, 60);
    window.open(signedUrl, "_blank", "noopener");
  } catch (error) {
    console.error("[AssetManager] ダウンロードURL生成でエラー:", error);
    toast.add({
      title: "ダウンロードできません",
      description: "ファイルの取得に失敗しました。",
      color: "red",
    });
  } finally {
    downloadingAssetId.value = null;
  }
}

async function handleDelete(asset: TodoAsset) {
  if (props.isDisabled) {
    return;
  }
  if (!confirm(`「${asset.file_name}」を削除しますか？`)) {
    return;
  }

  deletingAssetId.value = asset.id;
  try {
    await todoStore.deleteTodoAsset(asset);
    toast.add({
      title: "削除しました",
      description: `${asset.file_name} を削除しました。`,
      color: "green",
    });
    emit("deleted", asset.id);
  } catch (error) {
    console.error("[AssetManager] 添付削除でエラー:", error);
    toast.add({
      title: "削除に失敗しました",
      description: "時間をおいて再度お試しください。",
      color: "red",
    });
  } finally {
    deletingAssetId.value = null;
  }
}

function formatSize(bytes?: number) {
  if (!bytes && bytes !== 0) return "サイズ不明";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`;
}

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ja-JP");
}

function iconForAsset(asset: TodoAsset) {
  const mime = asset.mime_type || "";
  if (mime.startsWith("image/")) {
    return "i-heroicons-photo";
  }
  if (mime === "application/pdf") {
    return "i-heroicons-document-text";
  }
  if (mime.startsWith("video/")) {
    return "i-heroicons-video-camera";
  }
  if (mime.startsWith("audio/")) {
    return "i-heroicons-musical-note";
  }
  return "i-heroicons-document-duplicate";
}
</script>
