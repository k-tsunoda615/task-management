<template>
  <div
    class="mb-8 border border-dashed rounded-xl transition-colors"
    :class="[
      isDragOver && !isDisabled
        ? 'border-primary-400 bg-primary-50/40'
        : 'border-gray-200 bg-white',
    ]"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="flex items-center justify-between px-5 pt-5">
      <h3 class="text-lg font-medium text-gray-700">添付ファイル</h3>
      <div class="flex items-center gap-2">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-down-tray"
          :disabled="isDisabled || uploadQueue.length > 0"
          @click="triggerFilePicker"
        >
          {{ uploadQueue.length > 0 ? "アップロード中..." : "ファイルを追加" }}
        </UButton>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          :accept="acceptString"
          multiple
          :disabled="isDisabled || uploadQueue.length > 0"
          @change="handleFileSelected"
        >
      </div>
    </div>

    <div v-if="uploadQueue.length > 0" class="px-5">
      <div class="mt-4 space-y-3">
        <div
          v-for="item in uploadQueue"
          :key="item.id"
          class="flex items-center justify-between rounded-lg border border-gray-200 bg-white/70 p-3 text-sm"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-arrow-up-tray" class="text-primary-500" />
            <span class="font-medium text-gray-700 truncate max-w-[220px]">
              {{ item.fileName }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <UProgress
              v-if="item.status === 'uploading'"
              size="xs"
              :value="item.progress"
              class="w-28"
            />
            <UIcon
              v-if="item.status === 'error'"
              name="i-heroicons-exclamation-triangle"
              class="text-red-500"
            />
            <span
              class="text-xs"
              :class="{
                'text-gray-500': item.status === 'uploading',
                'text-green-600': item.status === 'done',
                'text-red-600': item.status === 'error',
              }"
            >
              {{ uploadStatusLabel(item.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!assets?.length && uploadQueue.length === 0" class="px-5 pb-5">
      <div
        class="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-gray-500"
      >
        添付ファイルはまだありません。{{
          isDisabled
            ? "完了タスクでは編集できません。"
            : "「ファイルを追加」ボタンやドラッグ＆ドロップでアップロードできます。"
        }}
      </div>
    </div>

    <div
      v-else
      class="grid gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
      >
        <div
          class="relative lg:h-36 aspect-video bg-gray-100"
          :class="{
            'cursor-pointer': canOpenPreview(asset),
          }"
          role="button"
          @click="canOpenPreview(asset) ? openPreview(asset) : undefined"
        >
          <div
            v-if="isPreviewing(asset)"
            class="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm"
          >
            プレビューを生成中...
          </div>
          <img
            v-if="isImage(asset) && previewUrls[asset.id]"
            :src="previewUrls[asset.id]"
            alt=""
            class="h-full w-full object-cover"
            @error="refreshPreview(asset)"
          >
          <video
            v-else-if="isVideo(asset) && previewUrls[asset.id]"
            :src="previewUrls[asset.id]"
            class="h-full w-full object-cover"
            muted
            loop
            playsinline
            @loadedmetadata="handleVideoLoaded($event)"
          />
          <div
            v-else-if="isText(asset)"
            class="h-full w-full overflow-hidden bg-slate-900 p-3 text-xs text-slate-200"
          >
            <pre class="whitespace-pre-wrap leading-tight">{{
              textPreviews[asset.id] ||
              "テキストプレビューはプレビューを開くボタンから読み込みます。"
            }}</pre>
          </div>
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-white text-primary-500"
          >
            <UIcon :name="iconForAsset(asset)" class="text-3xl" />
          </div>
        </div>
        <div class="flex flex-1 flex-col p-4">
          <p
            class="truncate text-sm font-medium text-gray-700"
            :title="asset.file_name"
          >
            {{ asset.file_name }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ formatSize(asset.size) }}
            <span v-if="asset.created_at"
              >・{{ formatDate(asset.created_at) }}</span
            >
          </p>
          <div class="mt-auto flex items-center justify-between gap-2 pt-4">
            <div class="flex gap-1.5">
              <UTooltip text="新しいタブで開く">
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-arrow-up-right"
                  size="xs"
                  :loading="downloadingAssetId === asset.id"
                  @click="handleDownload(asset)"
                />
              </UTooltip>
              <UTooltip
                v-if="isPreviewableOnDemand(asset)"
                text="プレビューを更新"
              >
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-eye"
                  size="xs"
                  :loading="previewingAssetId === asset.id"
                  @click="loadPreview(asset)"
                />
              </UTooltip>
            </div>
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              size="xs"
              :disabled="isDisabled"
              :loading="deletingAssetId === asset.id"
              @click="handleDelete(asset)"
            >
              削除
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="isPreviewModalOpen" :ui="{ width: 'sm:max-w-3xl' }">
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-eye" class="text-primary-500" />
            <h3 class="text-lg font-medium text-gray-800">
              {{ modalAsset?.file_name }}
            </h3>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="closePreview"
          />
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div
            v-if="modalLoading"
            class="flex h-72 items-center justify-center text-gray-500"
          >
            <USpinner size="lg" />
          </div>
          <div v-else class="max-h-[70vh] overflow-auto">
            <img
              v-if="modalAsset && isImage(modalAsset) && modalUrl"
              :src="modalUrl"
              alt=""
              class="max-h-[70vh] w-full object-contain"
            >
            <video
              v-else-if="modalAsset && isVideo(modalAsset) && modalUrl"
              :src="modalUrl"
              controls
              class="max-h-[70vh] w-full rounded-lg bg-black"
            />
            <iframe
              v-else-if="modalAsset && isPdf(modalAsset) && modalUrl"
              :src="modalUrl"
              class="h-[70vh] w-full rounded-lg bg-white"
            />
            <pre
              v-else-if="modalAsset && isText(modalAsset)"
              class="whitespace-pre-wrap text-sm leading-relaxed text-gray-800"
              >{{
                modalTextPreview || "プレビューを読み込めませんでした。"
              }}</pre
            >
            <div v-else class="text-sm text-gray-600">
              このファイル形式はプレビューできません。新しいタブで開いてご確認ください。
            </div>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
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
const downloadingAssetId = ref<string | null>(null);
const deletingAssetId = ref<string | null>(null);
const previewingAssetId = ref<string | null>(null);
const isDragOver = ref(false);

const acceptString = computed(() => TASK_ASSET_ACCEPTED_TYPES.join(","));
const toast = useToast();
const todoStore = useTodoStore();
const repository = useTaskRepository();

type UploadQueueItem = {
  id: string;
  fileName: string;
  status: "uploading" | "done" | "error";
  progress: number;
};

const uploadQueue = ref<UploadQueueItem[]>([]);
const previewUrls = reactive<Record<string, string>>({});
const textPreviews = reactive<Record<string, string>>({});
const isClient = typeof window !== "undefined";
const isPreviewModalOpen = ref(false);
const modalAsset = ref<TodoAsset | null>(null);
const modalUrl = ref<string | null>(null);
const modalTextPreview = ref<string | null>(null);
const modalLoading = ref(false);

/**
 * プレビューキャッシュを整理する。
 * @description 現在の assets に存在しないものを削除する。
 * @returns {void} なし。
 */
const cleanupPreviewCache = () => {
  const currentIds = new Set(props.assets.map((asset) => asset.id));
  Object.keys(previewUrls).forEach((key) => {
    if (!currentIds.has(key)) {
      Reflect.deleteProperty(previewUrls, key);
    }
  });
  Object.keys(textPreviews).forEach((key) => {
    if (!currentIds.has(key)) {
      Reflect.deleteProperty(textPreviews, key);
    }
  });
};

/**
 * 既存添付のプレビューを事前生成する。
 * @description 画像/動画のプレビューを先読みする。
 * @returns {Promise<void>} 生成処理の完了。
 */
const warmPreviews = async () => {
  for (const asset of props.assets) {
    await warmPreviewForAsset(asset);
  }
};

/**
 * 単一添付のプレビューを事前生成する。
 * @description 画像/動画のみを対象にする。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {Promise<void>} 生成処理の完了。
 */
const warmPreviewForAsset = async (asset: TodoAsset) => {
  if (!isClient) return;
  if (isImage(asset) || isVideo(asset)) {
    await loadPreview(asset, 300);
  }
};

/**
 * 添付のプレビューを取得する。
 * @description 署名 URL を取得してプレビューを保存する。
 * @param {TodoAsset} asset - 添付情報。
 * @param {number} [expiresIn] - 署名 URL の有効秒数。
 * @returns {Promise<void>} プレビュー取得の完了。
 */
const loadPreview = async (asset: TodoAsset, expiresIn = 120) => {
  if (!isClient) return;
  if (previewingAssetId.value && previewingAssetId.value !== asset.id) {
    // another preview is in progress, allow concurrently
  }
  previewingAssetId.value = asset.id;
  try {
    const signedUrl = await repository.getTodoAssetUrl(asset, expiresIn);
    previewUrls[asset.id] = signedUrl;
    if (isText(asset)) {
      const response = await fetch(signedUrl);
      const text = await response.text();
      textPreviews[asset.id] = text.slice(0, 1200);
    }
  } catch (error) {
    console.error("[AssetManager] プレビュー生成でエラー:", error);
    toast.add({
      title: "プレビューを取得できません",
      description: "時間をおいて再度お試しください。",
      color: "red",
    });
  } finally {
    previewingAssetId.value = null;
  }
};

onMounted(() => {
  if (!isClient) return;
  warmPreviews();
});

watch(
  () => props.assets.map((asset) => asset.id),
  () => {
    if (!isClient) return;
    cleanupPreviewCache();
    warmPreviews();
  },
  { immediate: true }
);

/**
 * ファイルピッカーを起動する。
 * @description 無効状態の場合は何もしない。
 * @returns {void} なし。
 */
const triggerFilePicker = () => {
  if (props.isDisabled) {
    return;
  }
  fileInput.value?.click();
};

/**
 * ファイル選択時の処理を行う。
 * @description 選択ファイルを処理し、入力をリセットする。
 * @param {Event} event - ファイル選択イベント。
 * @returns {Promise<void>} 処理の完了。
 */
const handleFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  await processFiles(files);
  resetFileInput(input);
};

/**
 * ファイル入力をリセットする。
 * @description 同じファイルの再選択を可能にする。
 * @param {HTMLInputElement} input - ファイル入力要素。
 * @returns {void} なし。
 */
const resetFileInput = (input: HTMLInputElement) => {
  input.value = "";
};

/**
 * 添付ファイルをダウンロードする。
 * @description 署名 URL を取得して新規タブで開く。
 * @param {TodoAsset} asset - ダウンロード対象の添付情報。
 * @returns {Promise<void>} ダウンロード処理の完了。
 */
const handleDownload = async (asset: TodoAsset) => {
  if (!import.meta.client) return;

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
};

/**
 * 添付ファイルを削除する。
 * @description 確認後に削除し、結果を通知する。
 * @param {TodoAsset} asset - 削除対象の添付情報。
 * @returns {Promise<void>} 削除処理の完了。
 */
const handleDelete = async (asset: TodoAsset) => {
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
};

/**
 * サイズを人間可読な単位に変換する。
 * @description B/KB/MB/GB の範囲で表示する。
 * @param {number} [bytes] - 変換対象のバイト数。
 * @returns {string} 表示用のサイズ文字列。
 */
const formatSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "サイズ不明";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`;
};

/**
 * 日付文字列をローカル表示に変換する。
 * @description 無効な日付は空文字を返す。
 * @param {string} [dateString] - 日付文字列。
 * @returns {string} 表示用の日時文字列。
 */
const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ja-JP");
};

/**
 * 添付ファイル種別に対応するアイコンを返す。
 * @description MIME タイプからアイコン名を選択する。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {string} アイコン名。
 */
const iconForAsset = (asset: TodoAsset) => {
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
};

/**
 * 画像ファイルか判定する。
 * @description MIME タイプで判定する。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {boolean} 画像なら true。
 */
const isImage = (asset: TodoAsset) => {
  return (asset.mime_type || "").startsWith("image/");
};

/**
 * 動画ファイルか判定する。
 * @description MIME タイプで判定する。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {boolean} 動画なら true。
 */
const isVideo = (asset: TodoAsset) => {
  return (asset.mime_type || "").startsWith("video/");
};

/**
 * テキスト系ファイルか判定する。
 * @description MIME タイプから判定する。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {boolean} テキストなら true。
 */
const isText = (asset: TodoAsset) => {
  const mime = asset.mime_type || "";
  return (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml"
  );
};

/**
 * オンデマンドでプレビュー可能か判定する。
 * @description テキスト or PDF を対象にする。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {boolean} プレビュー可能なら true。
 */
const isPreviewableOnDemand = (asset: TodoAsset) => {
  return isText(asset) || isPdf(asset);
};

/**
 * PDF ファイルか判定する。
 * @description MIME タイプで判定する。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {boolean} PDF なら true。
 */
const isPdf = (asset: TodoAsset) => {
  return asset.mime_type === "application/pdf";
};

/**
 * ドラッグ中の表示状態を更新する。
 * @description ドロップ可能状態を示す。
 * @returns {void} なし。
 */
const handleDragOver = () => {
  if (props.isDisabled) return;
  isDragOver.value = true;
};

/**
 * ドラッグ離脱時の状態を更新する。
 * @description ドロップ表示を解除する。
 * @returns {void} なし。
 */
const handleDragLeave = () => {
  isDragOver.value = false;
};

/**
 * ドロップされたファイルを処理する。
 * @description ドラッグ&ドロップからファイルを取得する。
 * @param {DragEvent} event - ドロップイベント。
 * @returns {Promise<void>} 処理の完了。
 */
const handleDrop = async (event: DragEvent) => {
  if (props.isDisabled) return;
  isDragOver.value = false;
  const files = event.dataTransfer?.files
    ? Array.from(event.dataTransfer.files)
    : [];
  await processFiles(files);
};

/**
 * ファイル一覧を処理してアップロードする。
 * @description サイズ/形式を検証し、順次アップロードする。
 * @param {File[]} files - アップロード対象のファイル群。
 * @returns {Promise<void>} 処理の完了。
 */
const processFiles = async (files: File[]) => {
  if (!isClient) return;
  if (!files.length) return;

  const filtered = files.filter((file) => {
    if (file.size > TASK_ASSET_MAX_SIZE) {
      toast.add({
        title: "アップロードできません",
        description: `${file.name} は上限の10MBを超えています。`,
        color: "red",
      });
      return false;
    }
    if (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !TASK_ASSET_ACCEPTED_TYPES.includes("application/octet-stream" as any) &&
      TASK_ASSET_ACCEPTED_TYPES.every((mime) => {
        if (mime.endsWith("/*")) {
          const prefix = mime.replace("/*", "/");
          return !file.type.startsWith(prefix);
        }
        return file.type !== mime;
      }) &&
      file.type !== ""
    ) {
      toast.add({
        title: "対応していない形式です",
        description: `${file.name} (${file.type}) はアップロード対象外です。`,
        color: "orange",
      });
      return false;
    }
    return true;
  });

  if (!filtered.length) return;

  for (const file of filtered) {
    const queueItem: UploadQueueItem = {
      id: generateId(),
      fileName: file.name,
      status: "uploading",
      progress: 0,
    };
    uploadQueue.value.push(queueItem);
    try {
      const asset = await todoStore.uploadTodoAsset(props.todoId, file);
      queueItem.status = "done";
      queueItem.progress = 100;
      if (asset) {
        emit("uploaded", asset);
        await warmPreviewForAsset(asset);
      }
      toast.add({
        title: "アップロード完了",
        description: `${file.name} を添付しました。`,
        color: "green",
      });
    } catch (error) {
      console.error("[AssetManager] アップロードでエラー:", error);
      queueItem.status = "error";
      toast.add({
        title: "アップロードに失敗しました",
        description: `${file.name} のアップロードを完了できませんでした。`,
        color: "red",
      });
    } finally {
      setTimeout(() => {
        uploadQueue.value = uploadQueue.value.filter(
          (item) => item.id !== queueItem.id
        );
      }, 1200);
    }
  }
};

/**
 * 添付のプレビューを再取得する。
 * @description 既存プレビューを上書きする。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {void} なし。
 */
const refreshPreview = (asset: TodoAsset) => {
  loadPreview(asset);
};

/**
 * アップロード状態のラベルを取得する。
 * @description ステータスに応じた表示文字列を返す。
 * @param {UploadQueueItem["status"]} status - アップロード状態。
 * @returns {string} 表示ラベル。
 */
const uploadStatusLabel = (status: UploadQueueItem["status"]) => {
  switch (status) {
    case "uploading":
      return "アップロード中...";
    case "done":
      return "完了";
    case "error":
      return "失敗";
    default:
      return "";
  }
};

/**
 * プレビュー中か判定する。
 * @description 現在プレビュー中の ID と比較する。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {boolean} プレビュー中なら true。
 */
const isPreviewing = (asset: TodoAsset) => {
  return previewingAssetId.value === asset.id;
};

/**
 * 動画読み込み完了時の処理を行う。
 * @description 自動再生を試みる。
 * @param {Event} event - 動画読み込みイベント。
 * @returns {void} なし。
 */
const handleVideoLoaded = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  video.play().catch(() => {
    // autoplay may be blocked; ignore
  });
};

/**
 * アップロードキュー用の ID を生成する。
 * @description randomUUID があれば使用し、なければ疑似 ID を返す。
 * @returns {string} 生成した ID。
 */
const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * プレビューを開けるか判定する。
 * @description 画像/動画/テキスト/PDF の場合に true を返す。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {boolean} プレビュー可能なら true。
 */
const canOpenPreview = (asset: TodoAsset) => {
  return isImage(asset) || isVideo(asset) || isText(asset) || isPdf(asset);
};

/**
 * プレビューを開く。
 * @description モーダルを開き、必要なプレビューを取得する。
 * @param {TodoAsset} asset - 添付情報。
 * @returns {Promise<void>} プレビュー表示の完了。
 */
const openPreview = async (asset: TodoAsset) => {
  if (!isClient) return;
  modalAsset.value = asset;
  isPreviewModalOpen.value = true;
  modalLoading.value = true;
  try {
    await loadPreview(asset, 600);
    modalUrl.value = previewUrls[asset.id] || null;
    modalTextPreview.value = textPreviews[asset.id] || null;
  } finally {
    modalLoading.value = false;
  }
};

/**
 * プレビューを閉じる。
 * @description モーダル状態とプレビュー情報をリセットする。
 * @returns {void} なし。
 */
const closePreview = () => {
  isPreviewModalOpen.value = false;
  modalAsset.value = null;
  modalUrl.value = null;
  modalTextPreview.value = null;
};
</script>
