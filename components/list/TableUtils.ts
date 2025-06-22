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
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

/**
 * 日付が24時間以内であるかを判定する
 * @param dateString 日付文字列
 * @returns 24時間以内であればtrue
 */
export function isRecent(dateString?: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours < 24;
}
