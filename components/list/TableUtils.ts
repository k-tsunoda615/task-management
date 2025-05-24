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
 * 日付を相対時間または日付形式でフォーマットする
 * @param dateString 日付文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 24時間以内の場合は相対時間で表示
  if (diff < 24 * 60 * 60 * 1000) {
    if (diff < 60 * 60 * 1000) {
      // 1時間以内
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}分前`;
    } else {
      // 24時間以内
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}時間前`;
    }
  } else {
    // それ以外は日付で表示
    return `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  }
}
