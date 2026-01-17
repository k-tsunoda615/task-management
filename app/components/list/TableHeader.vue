<template>
  <thead class="bg-gray-50">
    <tr>
      <!-- <th class="w-8 px-2 py-3 text-center align-middle">
        <UIcon
          name="i-heroicons-arrows-up-down"
          class="text-gray-400 w-4 h-4"
        />
      </th> -->
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        <div class="flex items-center">タイトル</div>
      </th>
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        @click="$emit('sort', 'status')"
      >
        <div class="flex items-center">
          ステータス
          <UIcon
            :name="getSortIcon('status')"
            class="inline ml-1 w-4 h-4"
            :class="
              sortColumn === 'status' ? 'text-primary-500' : 'text-gray-300'
            "
          />
        </div>
      </th>
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        @click="$emit('sort', 'is_private')"
      >
        <div class="flex items-center">
          公開設定
          <UIcon
            :name="getSortIcon('is_private')"
            class="inline ml-1 w-4 h-4"
            :class="
              sortColumn === 'is_private' ? 'text-primary-500' : 'text-gray-300'
            "
          />
        </div>
      </th>
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        @click="$emit('sort', 'total_time')"
      >
        <div class="flex items-center">
          合計時間
          <UIcon
            :name="getSortIcon('total_time')"
            class="inline ml-1 w-4 h-4"
            :class="
              sortColumn === 'total_time' ? 'text-primary-500' : 'text-gray-300'
            "
          />
        </div>
      </th>
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        @click="$emit('sort', 'updated_at')"
      >
        <div class="flex items-center">
          更新日時
          <UIcon
            :name="getSortIcon('updated_at')"
            class="inline ml-1 w-4 h-4"
            :class="
              sortColumn === 'updated_at' ? 'text-primary-500' : 'text-gray-300'
            "
          />
        </div>
      </th>
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        @click="$emit('sort', 'is_finished')"
      >
        <div class="flex items-center">
          <UIcon
            :name="getSortIcon('is_finished')"
            class="inline ml-1 w-4 h-4"
            :class="
              sortColumn === 'is_finished'
                ? 'text-primary-500'
                : 'text-gray-300'
            "
          />
          完了
        </div>
      </th>
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        @click="$emit('sort', 'tags')"
      >
        <div class="flex items-center">
          タグ
          <UIcon
            :name="getSortIcon('tags')"
            class="inline ml-1 w-4 h-4"
            :class="
              sortColumn === 'tags' ? 'text-primary-500' : 'text-gray-300'
            "
          />
        </div>
      </th>
      <th
        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1"
      >
        <UCheckbox
          :checked="selectAll"
          class="mx-auto"
          @change="$emit('toggleSelectAll', $event)"
        />
        削除
      </th>
    </tr>
  </thead>
</template>

<script setup lang="ts">
const props = defineProps({
  sortColumn: {
    type: String,
    required: true,
  },
  sortDirection: {
    type: String as () => "asc" | "desc" | "none",
    required: true,
  },
  selectAll: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["sort", "toggleSelectAll"]);

/**
 * ソートアイコンを取得する。
 * @description 現在のソート状態に応じてアイコン名を返す。
 * @param {string} column - 対象カラム名。
 * @returns {string} アイコン名。
 */
const getSortIcon = (column: string): string => {
  if (column !== props.sortColumn) {
    return "i-heroicons-arrows-up-down";
  }

  if (props.sortDirection === "asc") {
    return "i-heroicons-arrow-up";
  } else if (props.sortDirection === "desc") {
    return "i-heroicons-arrow-down";
  } else {
    return "i-heroicons-arrows-up-down";
  }
};
</script>
