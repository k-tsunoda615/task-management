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

      <div class="flex items-center space-x-3">
        <UTooltip text="ヘルプ" :ui="{ popper: { strategy: 'fixed' } }">
          <UButton
            @click="showHelpModal = true"
            color="gray"
            variant="ghost"
            icon="i-heroicons-question-mark-circle"
          >
            <span class="md:hidden hidden">ヘルプ</span>
          </UButton>
        </UTooltip>
        <UTooltip text="ログアウト" :ui="{ popper: { strategy: 'fixed' } }">
          <UButton
            @click="logout"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-right-on-rectangle"
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
    ゲスト（匿名）ユーザーとして利用中です。データは一定期間で自動削除されます。<br />
    <strong
      >【重要】ゲストのままログアウトすると、同じアカウントで再ログインすることはできません。</strong
    ><br />
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
import { useAuth } from "../../composables/useAuth";

const client = useSupabaseClient();
const router = useRouter();
const { user } = useAuth();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});
const showHelpModal = ref(false);
const showAnonymousBanner = ref(true);
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
