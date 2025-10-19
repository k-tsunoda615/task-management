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
        Supabase の `profiles` テーブルから取得したユーザー情報を表示します。
      </p>

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
              <th class="px-4 py-3 text-left font-medium text-gray-500">表示名</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">メール</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">区分</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">作成日</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">最終ログイン</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="pending">
              <td colspan="5" class="px-4 py-6">
                <div class="flex items-center justify-center gap-3 text-gray-500">
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
              v-else
              v-for="user in users"
              :key="user.id"
              class="transition hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-gray-900 font-medium">
                {{ user.displayName }}
              </td>
              <td class="px-4 py-3 text-gray-700">
                {{ user.email ?? "未設定" }}
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :label="user.accountType === 'anonymous' ? 'ゲスト' : '登録済み'"
                  :color="user.accountType === 'anonymous' ? 'amber' : 'gray'"
                  variant="subtle"
                />
              </td>
              <td class="px-4 py-3 text-gray-700">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-4 py-3 text-gray-700">
                {{ formatDate(user.lastLoginAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-xs text-gray-500">
        表示件数: {{ users.length }} 件
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";

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
  accountType: "anonymous" | "registered";
  createdAt: string | null;
  lastLoginAt: string | null;
};

type ProfileRow = {
  id?: string | number;
  email?: string | null;
  display_name?: string | null;
  username?: string | null;
  full_name?: string | null;
  account_type?: string | null;
  is_anonymous?: boolean | null;
  created_at?: string | null;
  inserted_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
};

const { fetchProfiles } = useProfileRepository();
const { data, pending, error, refresh } = await fetchProfiles();

const users = computed<AdminUserSummary[]>(() => {
  const rows = data.value as ProfileRow[] | undefined;
  if (!rows) {
    return [];
  }

  return rows.map((profile) => {
    const fallbackId =
      typeof profile.id !== "undefined"
        ? String(profile.id)
        : globalThis.crypto?.randomUUID?.() ?? `profile-${Math.random().toString(36).slice(2, 10)}`;

    return {
      id: fallbackId,
      email: typeof profile.email === "string" ? profile.email : null,
      displayName:
        (typeof profile.display_name === "string" && profile.display_name) ||
        (typeof profile.username === "string" && profile.username) ||
        (typeof profile.full_name === "string" && profile.full_name) ||
        (typeof profile.email === "string" && profile.email) ||
        "未設定",
      accountType:
        typeof profile.account_type === "string"
          ? profile.account_type === "anonymous"
            ? "anonymous"
            : "registered"
          : profile.is_anonymous === true
            ? "anonymous"
            : "registered",
      createdAt:
        typeof profile.created_at === "string"
          ? profile.created_at
          : typeof profile.inserted_at === "string"
            ? profile.inserted_at
            : null,
      lastLoginAt:
        typeof profile.last_login_at === "string"
          ? profile.last_login_at
          : typeof profile.updated_at === "string"
            ? profile.updated_at
            : null,
    } satisfies AdminUserSummary;
  });
});

const formatDate = (value: string | null) => {
  if (!value) {
    return "未記録";
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY/MM/DD HH:mm") : "未記録";
};
</script>
