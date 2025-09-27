<template>
  <UModal v-model="isOpen">
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
              <span
                >Priority / Next カラム右上の「＋」ボタン、またはサイドバーの「新しいタスク」からタスクを登録できます。</span
              >
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-pencil-square"
                class="mr-2 text-blue-500 flex-shrink-0 mt-1"
              />
              <span
                >カード右上の編集ボタンでタスク内容を即時更新できます。変更は自動保存されます。</span
              >
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-arrows-right-left"
                class="mr-2 text-purple-500 flex-shrink-0 mt-1"
              />
              <span
                >ドラッグ＆ドロップでカラム間を移動したり、同じカラム内で優先順位を並べ替えられます。</span
              >
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-trash"
                class="mr-2 text-red-500 flex-shrink-0 mt-1"
              />
              <span
                >削除したいタスクはサイドバー下部のゴミ箱にドロップしてください（削除は取り消せません）。</span
              >
            </li>
          </ul>
        </div>

        <!-- カンバン表示・フィルタ -->
        <div>
          <h4 class="text-base font-medium border-b pb-1 mb-2">
            カンバン表示・フィルタ
          </h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-magnifying-glass"
                class="mr-2 text-gray-600 flex-shrink-0 mt-1"
              />
              <span
                >画面右上の検索バーでタイトル・メモを横断検索できます。タグプルダウンで絞り込みも可能です。</span
              >
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-funnel"
                class="mr-2 text-green-500 flex-shrink-0 mt-1"
              />
              <span
                >サイドバーから「全て / パブリック / プライベート」「完了タスク表示」など視界を切り替えられます。</span
              >
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-view-columns"
                class="mr-2 text-blue-500 flex-shrink-0 mt-1"
              />
              <span
                >PC ではレイアウト切り替えボタンから Priority と Next を並列 / 均等レイアウトに変更できます。</span
              >
            </li>
          </ul>
        </div>

        <!-- タイマーと作業記録 -->
        <div>
          <h4 class="text-base font-medium border-b pb-1 mb-2">
            タイマーと作業記録
          </h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-clock"
                class="mr-2 text-blue-600 flex-shrink-0 mt-1"
              />
              <span
                >カードの再生 / 一時停止ボタンで作業時間を計測できます。計測中のタスクは画面上部に表示されます。</span
              >
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-exclamation-circle"
                class="mr-2 text-amber-500 flex-shrink-0 mt-1"
              />
              <span
                >タイマーが動作中に他ページへ移動しようとすると確認ダイアログが表示され、計測忘れを防ぎます。</span
              >
            </li>
          </ul>
        </div>

        <!-- 詳細ページとメモ -->
        <div>
          <h4 class="text-base font-medium border-b pb-1 mb-2">詳細ページとメモ</h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-document-text"
                class="mr-2 text-indigo-500 flex-shrink-0 mt-1"
              />
              <span
                >カードのタイトルをクリックすると詳細ページが開き、タイトル・ステータス・完了フラグを編集できます。</span
              >
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-adjustments-horizontal"
                class="mr-2 text-indigo-500 flex-shrink-0 mt-1"
              />
              <span
                >メモ欄は Markdown とプレビューをタブで切り替えながら編集できます。詳細ページでもタイマー操作が可能です。</span
              >
            </li>
          </ul>
          <p class="mt-3 mb-2 text-gray-600">メモ欄で使える主な Markdown 記法：</p>
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

        <!-- 他ビューへの導線 -->
        <div>
          <h4 class="text-base font-medium border-b pb-1 mb-2">
            他ビューへの導線
          </h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-table-cells"
                class="mr-2 text-slate-600 flex-shrink-0 mt-1"
              />
              <div>
                サイドバーの「リストビュー」では表形式でソートや一括削除ができます。
              </div>
            </li>
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-chart-bar"
                class="mr-2 text-emerald-600 flex-shrink-0 mt-1"
              />
              <div>
                「アナリティクスビュー」では期間別サマリー、タグ分布、時間分析を確認できます。
              </div>
            </li>
          </ul>
        </div>

        <!-- データ管理・注意事項 -->
        <div>
          <h4 class="text-base font-medium border-b pb-1 mb-2 text-red-600">
            注意事項・データ管理
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
            <li class="flex items-start">
              <UIcon
                name="i-heroicons-information-circle"
                class="mr-2 text-gray-500 flex-shrink-0 mt-1"
              />
              <div>タスク・タグの合計は最大100件までです。</div>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UButton color="gray" variant="ghost" @click="isOpen = false">
            閉じる
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
