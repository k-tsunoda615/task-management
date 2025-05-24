/**
 * Google Analytics 4 イベント送信用ユーティリティ
 */

// dataLayerが存在しない場合は初期化
export const initDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
};

/**
 * dataLayerにイベントをプッシュする
 * @param eventName イベント名
 * @param params イベントパラメーター
 */
export const pushEvent = (
  eventName: string,
  params: Record<string, string | number | boolean | null> = {},
) => {
  if (typeof window === "undefined") return;

  // dataLayerが存在しない場合は初期化
  window.dataLayer = window.dataLayer || [];

  // イベントをプッシュ
  window.dataLayer.push({
    event: eventName,
    ...params,
  });

  // 開発環境でのデバッグログ
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, params);
  }
};

/**
 * タスク作成イベント
 * @param taskId タスクID
 * @param status タスクステータス
 * @param hasTags タグがあるかどうか
 * @param isPrivate プライベートかどうか
 */
export const trackTaskCreated = (
  taskId: string,
  status: string,
  hasTags: boolean,
  isPrivate: boolean,
) => {
  pushEvent("task_created", {
    task_id: taskId,
    task_status: status,
    has_tags: hasTags,
    is_private: isPrivate,
  });
};

/**
 * タスク更新イベント
 * @param taskId タスクID
 * @param status 更新後のステータス
 */
export const trackTaskUpdated = (taskId: string, status: string) => {
  pushEvent("task_updated", {
    task_id: taskId,
    task_status: status,
  });
};

/**
 * タスク削除イベント
 * @param taskId タスクID
 */
export const trackTaskDeleted = (taskId: string) => {
  pushEvent("task_deleted", {
    task_id: taskId,
  });
};

/**
 * タスクステータス変更イベント
 * @param taskId タスクID
 * @param oldStatus 変更前のステータス
 * @param newStatus 変更後のステータス
 */
export const trackTaskStatusChanged = (
  taskId: string,
  oldStatus: string,
  newStatus: string,
) => {
  pushEvent("task_status_changed", {
    task_id: taskId,
    old_status: oldStatus,
    new_status: newStatus,
  });
};

/**
 * タイマー開始イベント
 * @param taskId タスクID
 * @param taskTitle タスクタイトル
 */
export const trackTimerStarted = (taskId: string, taskTitle: string) => {
  pushEvent("timer_started", {
    task_id: taskId,
    task_title: taskTitle,
  });
};

/**
 * タイマー停止イベント
 * @param taskId タスクID
 * @param taskTitle タスクタイトル
 * @param duration 計測時間（秒）
 */
export const trackTimerStopped = (
  taskId: string,
  taskTitle: string,
  duration: number,
) => {
  pushEvent("timer_stopped", {
    task_id: taskId,
    task_title: taskTitle,
    duration_seconds: duration,
    duration_formatted: formatDuration(duration),
  });
};

/**
 * レイアウト変更イベント
 * @param layoutType レイアウトタイプ
 */
export const trackLayoutChanged = (layoutType: string) => {
  pushEvent("layout_changed", {
    layout_type: layoutType,
  });
};

/**
 * 検索実行イベント
 * @param query 検索クエリ
 * @param resultCount 検索結果数
 */
export const trackSearch = (query: string, resultCount: number) => {
  pushEvent("search_performed", {
    search_term: query,
    result_count: resultCount,
  });
};

/**
 * タグフィルタリングイベント
 * @param tagId タグID
 * @param tagName タグ名
 * @param resultCount 結果数
 */
export const trackTagFiltered = (
  tagId: string,
  tagName: string,
  resultCount: number,
) => {
  pushEvent("tag_filtered", {
    tag_id: tagId,
    tag_name: tagName,
    result_count: resultCount,
  });
};

/**
 * 時間フォーマット（秒 → hh:mm:ss）
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
};

// TypeScript型定義
declare global {
  interface Window {
    dataLayer: Array<
      Record<string, string | number | boolean | null | undefined>
    >;
  }
}
