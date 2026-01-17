import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

/**
 * total_time を数値に変換する。
 * @description number | number[] を正規化して返す。
 * @param {number | number[] | undefined} time - Todo の total_time。
 * @returns {number} 正規化した秒数。
 */
export const extractTotalTime = (
  time: number | number[] | undefined,
): number => {
  if (Array.isArray(time) && time.length > 0) {
    return time[0] ?? 0;
  }
  return typeof time === "number" ? time : 0;
};

/**
 * 時間を HH:MM:SS 形式にフォーマットする。
 * @description dayjs の duration を使って表示文字列を生成する。
 * @param {number} totalSeconds - 秒数。
 * @returns {string} フォーマット済みの時間文字列。
 */
export const formatTime = (totalSeconds: number): string => {
  return dayjs.duration(totalSeconds, "seconds").format("HH:mm:ss");
};

/**
 * 日付が24時間以内であるかを判定する。
 * @description 現在時刻との差分で判定する。
 * @param {string} [dateString] - 判定対象の日付文字列。
 * @returns {boolean} 24時間以内であれば true。
 */
export const isRecent = (dateString?: string): boolean => {
  if (!dateString) return false;
  return dayjs().diff(dayjs(dateString), "hour") < 24;
};
