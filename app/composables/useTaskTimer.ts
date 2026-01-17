import type { Todo } from "../../types/todo";
import { formatTime } from "../utils/time";

/**
 * タイムトラッキングの状態管理を UI から分離する。
 * @description タイマー開始/停止とタイトル更新を扱う。
 * @returns {object} タイマー関連の state と操作関数。
 */
export const useTaskTimer = () => {
  const timerInterval = ref<number | null>(null);
  const startTime = ref<number | null>(null);
  const currentTotalTime = ref(0);
  const originalTitle = ref(document.title);

  /**
   * 作業中の時間をユーザーに見せる。
   * @description タブタイトルに経過時間とタスク名を反映する。
   * @param {number} seconds - 経過時間（秒）。
   * @param {string} taskTitle - 表示するタスク名。
   * @returns {void} なし。
   */
  const updateTitle = (seconds: number, taskTitle: string) => {
    const formattedTime = formatTime(seconds);
    document.title = `${formattedTime} - ${taskTitle}`;
  };

  /**
   * タイマー停止時に UI を元に戻す。
   * @description タブタイトルを元の値に戻す。
   * @returns {void} なし。
   */
  const resetTitle = () => {
    document.title = originalTitle.value;
  };

  /**
   * total_time の型ゆれを吸収する。
   * @description number | number[] から数値を取り出す。
   * @param {number | number[] | undefined} time - 正規化対象の値。
   * @returns {number} 正規化した秒数。
   */
  const extractTotalTime = (time: number | number[] | undefined): number => {
    if (Array.isArray(time) && time.length > 0) {
      return time[0] ?? 0;
    }
    return typeof time === "number" ? time : 0;
  };

  /**
   * タスク計測を開始し、更新を継続する。
   * @description requestAnimationFrame で経過時間を更新しコールバックする。
   * @param {Todo} todo - 計測対象のタスク。
   * @param {(total: number) => void} onUpdate - 時間更新時のコールバック。
   * @returns {void} なし。
   */
  const startTimerForTodo = (
    todo: Todo,
    onUpdate: (total: number) => void,
  ) => {
    // 元のタイトルを保存
    originalTitle.value = document.title;

    currentTotalTime.value = extractTotalTime(todo.total_time);
    startTime.value = Date.now();
    if (timerInterval.value) {
      cancelAnimationFrame(timerInterval.value);
      timerInterval.value = null;
    }
    const updateTimer = () => {
      if (!startTime.value) return;
      const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000);
      const newTotalTime = extractTotalTime(todo.total_time) + elapsedSeconds;
      if (currentTotalTime.value !== newTotalTime) {
        currentTotalTime.value = newTotalTime;
        onUpdate(currentTotalTime.value);
        // タブのタイトルを更新
        updateTitle(currentTotalTime.value, todo.title);
      }
      timerInterval.value = requestAnimationFrame(updateTimer);
    };
    timerInterval.value = requestAnimationFrame(updateTimer);

    // 初回のタイトル更新
    updateTitle(currentTotalTime.value, todo.title);
  };

  /**
   * 計測終了時に時間を確定させる。
   * @description タイマーを止め、累積時間を更新する。
   * @param {Todo} todo - 計測対象のタスク。
   * @returns {void} なし。
   */
  const stopTimer = (todo: Todo) => {
    if (timerInterval.value) {
      cancelAnimationFrame(timerInterval.value);
      timerInterval.value = null;
    }
    if (startTime.value) {
      const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000);
      currentTotalTime.value =
        extractTotalTime(todo.total_time) + elapsedSeconds;
      startTime.value = null;
    }

    // タイトルを元に戻す
    resetTitle();
  };

  return {
    timerInterval,
    startTime,
    currentTotalTime,
    startTimerForTodo,
    stopTimer,
    extractTotalTime,
    updateTitle,
    resetTitle,
  };
};
