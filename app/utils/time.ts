/**
 * 秒数を hh:mm:ss 形式に変換する。
 * @description number | number[] を受け取り表示用文字列に変換する。
 * @param {number | number[]} seconds - 変換対象の秒数。
 * @returns {string} hh:mm:ss 形式の文字列。
 */
export const formatTime = (seconds: number | number[]): string => {
  let totalSeconds = 0;
  if (Array.isArray(seconds) && seconds.length > 0) {
    totalSeconds = seconds[0] ?? 0;
  } else if (typeof seconds === "number") {
    totalSeconds = seconds;
  }
  if (totalSeconds === undefined) return "00:00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
};

/**
 * hh:mm:ss 形式の文字列を秒数に変換する。
 * @description 不正な形式は 0 を返す。
 * @param {string} timeStr - 変換対象の文字列。
 * @returns {number} 秒数。
 */
export const parseTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  const timeRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;
  const match = timeStr.match(timeRegex);
  if (!match) {
    const parts = timeStr.split(":").map((part) => parseInt(part, 10));
    if (
      parts.length === 3 &&
      !isNaN(parts[0] ?? 0) &&
      !isNaN(parts[1] ?? 0) &&
      !isNaN(parts[2] ?? 0)
    ) {
      return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
    }
    return 0;
  }
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * 時間入力のバリデーションを行う。
 * @description hh:mm:ss 形式かを判定する。
 * @param {string} value - 判定対象の文字列。
 * @returns {boolean} 正しい形式なら true。
 */
export const validateTimeInput = (value: string): boolean => {
  const timeRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;
  return timeRegex.test(value);
};
