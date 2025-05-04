// タスクステータスの定義
export const TASK_STATUS = {
  PRIORITY: "priority",
  NEXT: "next",
  ARCHIVED: "archived",
} as const;

// UIで表示する名前のマッピング（多言語対応可能な設計）
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PRIORITY]: "Priority",
  [TASK_STATUS.NEXT]: "Next Up",
  [TASK_STATUS.ARCHIVED]: "Archived",
} as const;

// 旧システムからの移行用マッピング
export const LEGACY_STATUS_MAPPING = {
  未対応: TASK_STATUS.PRIORITY,
  対応中: TASK_STATUS.NEXT,
  完了: TASK_STATUS.ARCHIVED,
  // 他の可能性のある値も含める
  todo: TASK_STATUS.PRIORITY,
  in_progress: TASK_STATUS.NEXT,
  done: TASK_STATUS.ARCHIVED,
  priority: TASK_STATUS.PRIORITY,
  next: TASK_STATUS.NEXT,
  archived: TASK_STATUS.ARCHIVED,
  "'未対応'": TASK_STATUS.PRIORITY, // クエリ結果から特殊なケースが見つかったため追加
} as const;

// データベース保存用の変換マッピング
export const DB_STATUS_MAPPING = {
  [TASK_STATUS.PRIORITY]: TASK_STATUS.PRIORITY,
  [TASK_STATUS.NEXT]: TASK_STATUS.NEXT,
  [TASK_STATUS.ARCHIVED]: TASK_STATUS.ARCHIVED,
} as const;

// ステータスの色設定
export const STATUS_COLORS = {
  [TASK_STATUS.PRIORITY]: {
    bg: "bg-gray-50/50",
    border: "border-gray-100",
    icon: "text-gray-500",
    iconName: "i-heroicons-inbox",
  },
  [TASK_STATUS.NEXT]: {
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    icon: "text-blue-500",
    iconName: "i-heroicons-clock",
  },
  [TASK_STATUS.ARCHIVED]: {
    bg: "bg-green-50/50",
    border: "border-green-100",
    icon: "text-green-500",
    iconName: "i-heroicons-check-circle",
  },
} as const;

// ステータスの表示順序
export const STATUS_ORDER = [
  TASK_STATUS.PRIORITY,
  TASK_STATUS.NEXT,
  TASK_STATUS.ARCHIVED,
] as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
