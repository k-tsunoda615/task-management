<template>
  <div>
    <CommonNavigation :title="'管理ダッシュボード'" />

    <UCard class="space-y-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">ユーザー一覧</h1>
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-heroicons-arrow-path"
            :loading="pending"
            @click="refresh"
          >
            更新
          </UButton>
        </div>
      </template>

      <p class="text-sm text-gray-500">
        Supabase の `admin_user_metrics`
        ビューから取得した利用状況サマリーを表示
      </p>

      <div
        v-if="adminCheckPending"
        class="flex items-center justify-center gap-3 py-6 text-gray-500"
      >
        <USpinner size="sm" />
        権限を確認しています…
      </div>

      <UAlert
        v-else-if="adminCheckError"
        color="red"
        variant="soft"
        title="権限確認に失敗しました"
        :description="adminCheckError"
      />

      <UAlert
        v-else-if="!isAdmin"
        color="amber"
        variant="soft"
        title="管理者専用のページです"
        description="権限が確認できなかったため、内容は表示されませんでした。"
      />

      <template v-else>
        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          title="データ取得に失敗しました"
          :description="error.message"
        />

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-500">
                  表示名
                </th>
                <th class="px-4 py-3 text-left font-medium text-gray-500">
                  メール
                </th>
                <th class="px-4 py-3 text-left font-medium text-gray-500">
                  ToDo件数
                </th>
                <th class="px-4 py-3 text-left font-medium text-gray-500">
                  使用ストレージ
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-if="pending">
                <td colspan="5" class="px-4 py-6">
                  <div
                    class="flex items-center justify-center gap-3 text-gray-500"
                  >
                    <USpinner size="sm" />
                    読み込み中です…
                  </div>
                </td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                  表示できるユーザーがありません。
                </td>
              </tr>
              <tr
                v-for="user in users"
                v-else
                :key="user.id"
                class="transition hover:bg-gray-50"
              >
                <td class="px-4 py-3 text-gray-900 font-medium">
                  {{ user.displayName }}
                </td>
                <td class="px-4 py-3 text-gray-700">
                  {{ user.email ?? "未設定" }}
                </td>
                <td class="px-4 py-3 text-gray-700">
                  {{ user.todoCount.toLocaleString() }}件
                </td>
                <td class="px-4 py-3 text-gray-700">
                  {{ formatStorage(user.storageBytes) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-xs text-gray-500">表示件数: {{ users.length }} 件</div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
});

useHead({
  title: "管理者ダッシュボード",
  meta: [
    {
      name: "description",
      content: "Supabase ユーザー一覧",
    },
  ],
});

type AdminUserSummary = {
  id: string;
  email: string | null;
  displayName: string;
  todoCount: number;
  storageBytes: number;
};

const usersData = ref<AdminUserSummary[] | null>(null);
const pending = ref(false);
const error = ref<Error | null>(null);
const adminCheckError = ref<string | null>(null);
const isAdmin = ref(false);

/**
 * 管理メトリクスを再取得する。
 * @description 管理者権限を確認し、取得結果を状態に反映する。
 * @returns {Promise<void>} 再取得処理の完了。
 */
const refresh = async () => {
  pending.value = true;
  error.value = null;
  adminCheckError.value = null;

  try {
    const { data, error: fetchError } = await useFetch<AdminUserSummary[]>(
      "/api/admin/users",
      {
        server: false,
        key: "admin-user-metrics",
      },
    );

    if (fetchError.value) {
      throw fetchError.value;
    }

    usersData.value = data.value ?? [];
    isAdmin.value = true;
  } catch (err) {
    if (err instanceof Error && err.message === "Forbidden") {
      isAdmin.value = false;
      adminCheckError.value = null;
      usersData.value = [];
    } else {
      error.value = err as Error;
      adminCheckError.value = err instanceof Error ? err.message : String(err);
    }
  } finally {
    pending.value = false;
  }
};

await refresh();

const users = computed<AdminUserSummary[]>(() => usersData.value ?? []);

/**
 * ストレージ容量を読みやすい単位に変換する。
 * @description バイト数を KB/MB/GB などに換算する。
 * @param {number} bytes - 変換対象のバイト数。
 * @returns {string} 表示用のサイズ文字列。
 */
const formatStorage = (bytes: number) => {
  if (!bytes || bytes <= 0) {
    return "0 MB";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const decimals = unitIndex <= 1 ? 0 : 1;
  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
};
</script>
