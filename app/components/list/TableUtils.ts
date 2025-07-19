import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

/**
 * total_timeを数値に変換する
 * @param time Todoのtotal_time（数値または配列）
 * @returns 数値
 */
export function extractTotalTime(time: number | number[] | undefined): number {
  if (Array.isArray(time) && time.length > 0) {
    return time[0];
  }
  return typeof time === "number" ? time : 0;
}

/**
 * 時間を HH:MM:SS 形式にフォーマットする
 * @param totalSeconds 秒数
 * @returns フォーマットされた時間文字列
 */
export function formatTime(totalSeconds: number): string {
  return dayjs.duration(totalSeconds, "seconds").format("HH:mm:ss");
}

/**
 * 日付が24時間以内であるかを判定する
 * @param dateString 日付文字列
 * @returns 24時間以内であればtrue
 */
export function isRecent(dateString?: string): boolean {
  if (!dateString) return false;
  return dayjs().diff(dayjs(dateString), "hour") < 24;
}
