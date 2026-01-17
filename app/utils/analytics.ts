/**
 * Google Analytics 4 イベント送信用ユーティリティ。
 */

type DataLayerParams = Record<string, string | number | boolean | null>;

type DataLayerEvent = DataLayerParams & {
  /** 送信するイベント名 */
  event: string;
};

type WindowWithDataLayer = Window & {
  /** dataLayer 本体 */
  dataLayer: DataLayerEvent[];
};

/**
 * dataLayer が存在しない場合に初期化する。
 * @description window.dataLayer を配列として確保する。
 * @returns {void} なし。
 */
export const initDataLayer = () => {
  const windowWithDataLayer = window as WindowWithDataLayer;
  windowWithDataLayer.dataLayer = windowWithDataLayer.dataLayer || [];
};

/**
 * dataLayer にイベントをプッシュする。
 * @description dataLayer を初期化してからイベントを送信する。
 * @param {string} eventName - イベント名。
 * @param {DataLayerParams} params - イベントパラメーター。
 * @returns {void} なし。
 */
export const pushEvent = (
  eventName: string,
  params: DataLayerParams = {},
) => {
  if (typeof window === "undefined") return;

  const windowWithDataLayer = window as WindowWithDataLayer;

  // dataLayerが存在しない場合は初期化
  windowWithDataLayer.dataLayer = windowWithDataLayer.dataLayer || [];

  // イベントをプッシュ
  windowWithDataLayer.dataLayer.push({
    event: eventName,
    ...params,
  });

  // 開発環境でのデバッグログ
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, params);
  }
};

/**
 * タスク作成イベントを送信する。
 * @description 作成時に必要な属性を dataLayer に積む。
 * @param {string} taskId - タスク ID。
 * @param {string} status - タスクステータス。
 * @param {boolean} hasTags - タグがあるかどうか。
 * @param {boolean} isPrivate - プライベートかどうか。
 * @returns {void} なし。
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
 * タスク更新イベントを送信する。
 * @description 更新後のステータスを送信する。
 * @param {string} taskId - タスク ID。
 * @param {string} status - 更新後のステータス。
 * @returns {void} なし。
 */
export const trackTaskUpdated = (taskId: string, status: string) => {
  pushEvent("task_updated", {
    task_id: taskId,
    task_status: status,
  });
};

/**
 * タスク削除イベントを送信する。
 * @description 削除対象のタスク ID を送信する。
 * @param {string} taskId - タスク ID。
 * @returns {void} なし。
 */
export const trackTaskDeleted = (taskId: string) => {
  pushEvent("task_deleted", {
    task_id: taskId,
  });
};

/**
 * タスクステータス変更イベントを送信する。
 * @description 変更前後のステータスを送信する。
 * @param {string} taskId - タスク ID。
 * @param {string} oldStatus - 変更前のステータス。
 * @param {string} newStatus - 変更後のステータス。
 * @returns {void} なし。
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
 * タイマー開始イベントを送信する。
 * @description タスク ID とタイトルを送信する。
 * @param {string} taskId - タスク ID。
 * @param {string} taskTitle - タスクタイトル。
 * @returns {void} なし。
 */
export const trackTimerStarted = (taskId: string, taskTitle: string) => {
  pushEvent("timer_started", {
    task_id: taskId,
    task_title: taskTitle,
  });
};

/**
 * タイマー停止イベントを送信する。
 * @description 計測時間を整形して送信する。
 * @param {string} taskId - タスク ID。
 * @param {string} taskTitle - タスクタイトル。
 * @param {number} duration - 計測時間（秒）。
 * @returns {void} なし。
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
 * レイアウト変更イベントを送信する。
 * @description レイアウトの切り替えを通知する。
 * @param {string} layoutType - レイアウトタイプ。
 * @returns {void} なし。
 */
export const trackLayoutChanged = (layoutType: string) => {
  pushEvent("layout_changed", {
    layout_type: layoutType,
  });
};

/**
 * 検索実行イベントを送信する。
 * @description 検索条件と結果件数を送信する。
 * @param {string} query - 検索クエリ。
 * @param {number} resultCount - 検索結果数。
 * @returns {void} なし。
 */
export const trackSearch = (query: string, resultCount: number) => {
  pushEvent("search_performed", {
    search_term: query,
    result_count: resultCount,
  });
};

/**
 * タグフィルタリングイベントを送信する。
 * @description タグ情報と結果件数を送信する。
 * @param {string} tagId - タグ ID。
 * @param {string} tagName - タグ名。
 * @param {number} resultCount - 結果数。
 * @returns {void} なし。
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
 * 時間フォーマット（秒 → hh:mm:ss）。
 * @description 秒数を hh:mm:ss 形式に整形する。
 * @param {number} seconds - 整形対象の秒数。
 * @returns {string} hh:mm:ss 形式の文字列。
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
