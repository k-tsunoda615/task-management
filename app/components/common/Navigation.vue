<template>
  <!-- ヘッダーナビゲーション -->
  <div class="mb-6 border-b border-gray-200 pb-4">
    <nav class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- <NuxtLink
          to="/"
          class="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <UIcon name="i-heroicons-home" class="mr-1 h-5 w-5" />
          <span class="md:inline hidden">ホーム</span>
        </NuxtLink>
        <span class="text-gray-400 md:inline hidden">/</span> -->
        <span class="font-medium text-lg text-gray-900 md:inline hidden">{{
          props.title
        }}</span>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3 text-right">
        <div class="flex flex-col items-end gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              size="xs"
              color="gray"
              variant="soft"
              icon="i-heroicons-arrow-path"
              :loading="isSyncing"
              :disabled="isSyncing"
              @click="handleManualRefresh"
            >
              最新に更新
            </UButton>
            <span class="text-xs text-gray-500">
              最終更新: {{ lastSyncedLabel }}
            </span>
          </div>
          <span v-if="lastSyncError" class="text-xs text-red-500">
            {{ lastSyncError }}
          </span>
        </div>
        <UTooltip text="ヘルプ" :ui="{ popper: { strategy: 'fixed' } }">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-question-mark-circle"
            @click="showHelpModal = true"
          >
            <span class="md:hidden hidden">ヘルプ</span>
          </UButton>
        </UTooltip>
        <UTooltip text="ログアウト" :ui="{ popper: { strategy: 'fixed' } }">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-right-on-rectangle"
            @click="logout"
          >
            <span class="md:hidden hidden">ログアウト</span>
          </UButton>
        </UTooltip>
      </div>
    </nav>
  </div>
  <!-- アノニマスユーザー向け警告バナー -->
  <div
    v-if="showAnonymousBanner && user?.is_anonymous"
    class="anonymous-warning"
  >
    <span class="close-btn" @click="showAnonymousBanner = false">&times;</span>
    ゲスト（匿名）ユーザーとして利用中です。データは一定期間で自動削除されます。<br >
    <strong
      >【重要】ゲストのままログアウトすると、同じアカウントで再ログインすることはできません。</strong
    ><br >
    作成したタスクやタグを残したい場合は、<NuxtLink
      to="/auth?signup=1"
      class="underline font-bold"
      >アカウント登録</NuxtLink
    >（メールアドレスとパスワードの設定）を行うことで、現在のデータをそのまま引き継ぐことができます。
  </div>
  <NuxtLink
    v-if="showAnonymousBanner && user?.is_anonymous"
    to="/auth?signup=1"
    class="m-3 flex justify-end"
  >
    <UButton color="primary" size="sm">アカウント登録へ進む</UButton>
  </NuxtLink>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useAuthService } from "../../composables/useAuthService";
import { useTodoSync } from "../../composables/useTodoSync";

const client = useSupabaseClient();
const router = useRouter();
const { user } = useAuthService();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});
const showHelpModal = useState("help-modal", () => false);
const showAnonymousBanner = ref(true);
const { refresh, lastSyncedAt, lastSyncError, isSyncing } = useTodoSync();

const lastSyncedLabel = computed(() => {
  if (!lastSyncedAt.value) {
    return "未取得";
  }
  return dayjs(lastSyncedAt.value).format("HH:mm:ss");
});

/**
 * 手動で最新データを再取得する。
 * @description 同期処理を実行し、失敗時はログを出す。
 * @returns {Promise<void>} 再取得の完了。
 */
const handleManualRefresh = async () => {
  try {
    await refresh();
  } catch (error) {
    console.error("[CommonNavigation] 最新情報の再取得に失敗:", error);
  }
};

/**
 * サインアウトを実行する。
 * @description Supabase からサインアウトし、認証画面へ遷移する。
 * @returns {Promise<void>} サインアウト処理の完了。
 */
const logout = async () => {
  await client.auth.signOut();
  router.push("/auth");
};
</script>

<style scoped>
.anonymous-warning {
  background: #fff3cd;
  color: #856404;
  padding: 1em 2em 1em 1em;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  margin: 1em 0 0.5em 0;
  text-align: center;
  position: relative;
  font-size: 0.8em;
}
.flex.justify-end {
  gap: 0.5em;
}
.close-btn {
  position: absolute;
  right: 1em;
  top: 0.7em;
  font-size: 1.2em;
  cursor: pointer;
  color: #856404;
}
</style>
