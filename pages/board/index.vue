<template>
  <div>
    <!-- ヘッダーナビゲーション -->
    <div class="mb-6 border-b border-gray-200 pb-4">
      <nav class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <UIcon name="i-heroicons-home" class="mr-1 h-5 w-5" />
            ホーム
          </NuxtLink>
          <span class="text-gray-400">/</span>
          <span class="font-medium text-gray-900">Task Board</span>
        </div>

        <div class="flex items-center space-x-3">
          <UButton
            @click="showHelpModal = true"
            color="gray"
            variant="ghost"
            icon="i-heroicons-question-mark-circle"
          >
            ヘルプ
          </UButton>
          <UButton
            @click="logout"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-right-on-rectangle"
          >
            ログアウト
          </UButton>
        </div>
      </nav>
    </div>

    <!-- メインコンテンツ -->
    <div v-if="user">
      <KanbanBoard />
    </div>
    <div v-else>
      <UAlert
        title="ログインが必要です"
        description="Task Boardを利用するにはログインしてください"
        color="amber"
      >
        <template #icon>
          <UIcon name="i-heroicons-exclamation-triangle" />
        </template>
        <template #description>
          <p class="mt-2">
            <NuxtLink
              to="/auth"
              class="text-amber-700 hover:text-amber-900 underline"
            >
              ログインページへ移動
            </NuxtLink>
          </p>
        </template>
      </UAlert>
    </div>

    <!-- ヘルプモーダル -->
    <UModal v-model="showHelpModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Task Board の使い方</h3>
        </template>
        <div class="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          <!-- 基本操作 -->
          <div>
            <h4 class="text-base font-medium border-b pb-1 mb-2">基本操作</h4>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-plus-circle"
                  class="mr-2 text-blue-500 flex-shrink-0 mt-1"
                />
                <span>「新しいタスク」ボタンからタスクを作成できます</span>
              </li>
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-pencil-square"
                  class="mr-2 text-blue-500 flex-shrink-0 mt-1"
                />
                <span
                  >各タスクの編集ボタンをクリックして内容を変更できます</span
                >
              </li>
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-arrows-right-left"
                  class="mr-2 text-blue-500 flex-shrink-0 mt-1"
                />
                <span
                  >タスクをドラッグ＆ドロップで別のステータスに移動できます</span
                >
              </li>
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-trash"
                  class="mr-2 text-red-500 flex-shrink-0 mt-1"
                />
                <span
                  >タスクをサイドバーのゴミ箱にドラッグすると削除できます（削除は元に戻せません）</span
                >
              </li>
            </ul>
          </div>

          <!-- マークダウン対応 -->
          <div>
            <h4 class="text-base font-medium border-b pb-1 mb-2">
              マークダウン対応
            </h4>
            <p class="mb-2 text-gray-600">
              タスクのメモ欄では以下のマークダウン記法が使えます：
            </p>
            <div class="bg-gray-50 p-3 rounded-md">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th
                      class="text-left pb-2 font-medium text-gray-700 border-b border-gray-300"
                    >
                      書き方
                    </th>
                    <th
                      class="text-left pb-2 font-medium text-gray-700 border-b border-gray-300"
                    >
                      表示例
                    </th>
                  </tr>
                </thead>
                <tbody class="text-xs">
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      # 見出し1
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <h1 class="text-base">見出し1</h1>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      ## 見出し2
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <h2 class="text-sm">見出し2</h2>
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      ### 見出し3
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <h3 class="text-sm">見出し3</h3>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      **太字**
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <strong>太字</strong>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      *斜体*
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <em>斜体</em>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      - リスト項目
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <ul class="list-disc ml-4">
                        <li>リスト項目</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      1. 番号付きリスト
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <ol class="list-decimal ml-4">
                        <li>番号付きリスト</li>
                      </ol>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="py-2 pr-4 font-mono text-gray-600 border-b border-gray-200"
                    >
                      [リンク](https://example.com)
                    </td>
                    <td class="py-2 border-b border-gray-200">
                      <a href="#" class="text-blue-600 underline">リンク</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="py-2 pr-4 font-mono text-gray-600">
                      ```<br />
                      コードブロック<br />
                      ```
                    </td>
                    <td class="py-2">
                      <pre
                        class="bg-gray-200 p-1 rounded text-xs"
                      ><code>コードブロック</code></pre>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 優先度管理 -->
          <div>
            <h4 class="text-base font-medium border-b pb-1 mb-2">優先度管理</h4>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-inbox"
                  class="mr-2 text-gray-700 flex-shrink-0 mt-1"
                />
                <div>
                  <span class="font-medium">Priority</span> -
                  優先的に対応すべきタスクを配置します。
                </div>
              </li>
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-clock"
                  class="mr-2 text-blue-700 flex-shrink-0 mt-1"
                />
                <div>
                  <span class="font-medium">Next Up</span> -
                  何らかの理由で待ち状態のタスクを配置します。
                </div>
              </li>
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="mr-2 text-green-700 flex-shrink-0 mt-1"
                />
                <div>
                  <span class="font-medium">Archived</span> -
                  完了したタスクなどを参照用に保管します。
                </div>
              </li>
              <li class="flex items-start mt-2">
                <UIcon
                  name="i-heroicons-arrows-up-down"
                  class="mr-2 text-purple-600 flex-shrink-0 mt-1"
                />
                <div class="font-bold">
                  同じカラム内でタスクをドラッグして並べ替えると、優先順位を変更できます。上にあるタスクほど優先度が高くなります。
                </div>
              </li>
            </ul>
          </div>

          <!-- プライベートタスク -->
          <div>
            <h4 class="text-base font-medium border-b pb-1 mb-2">
              プライベートタスク
            </h4>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-lock-closed"
                  class="mr-2 text-gray-700 flex-shrink-0 mt-1"
                />
                <div>
                  プライベートタスクは、タスク作成・編集時に「Private」チェックボックスをオンにすることで設定できます。
                </div>
              </li>
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-eye-slash"
                  class="mr-2 text-gray-700 flex-shrink-0 mt-1"
                />
                <div>
                  プライベートタスクはサイドバーのフィルターボタンで表示/非表示を切り替えられます。
                </div>
              </li>
            </ul>
          </div>

          <!-- データ管理 -->
          <div>
            <h4 class="text-base font-medium border-b pb-1 mb-2 text-red-600">
              注意事項
            </h4>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-exclamation-triangle"
                  class="mr-2 text-red-500 flex-shrink-0 mt-1"
                />
                <div>
                  <span class="font-medium">タスクの削除は元に戻せません。</span
                  >削除する前に内容を確認してください。
                </div>
              </li>
              <li class="flex items-start">
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="mr-2 text-gray-700 flex-shrink-0 mt-1"
                />
                <div>
                  タスクの変更はリアルタイムで保存されます。ページを離れても作業内容は保持されます。
                </div>
              </li>
            </ul>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton
              color="gray"
              variant="ghost"
              @click="showHelpModal = false"
            >
              閉じる
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import KanbanBoard from "../../components/kanban/KanbanBoard.vue";
import { useInitialSampleData } from "../../composables/useInitialSampleData";
import { onMounted } from "vue";

definePageMeta({
  layout: "board",
  middleware: ["auth"],
});

// ページのメタタイトルを設定
useHead({
  title: "Task Board",
  meta: [{ name: "description", content: "Todoの一覧化と進捗メモ" }],
});

const user = useSupabaseUser();
const showHelpModal = ref(false);
const client = useSupabaseClient();
const router = useRouter();

const logout = async () => {
  await client.auth.signOut();
  router.push("/auth");
};

onMounted(async () => {
  await useInitialSampleData();
});
</script>
