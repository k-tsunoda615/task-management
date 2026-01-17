/**
 * HEX カラーを暗くする。
 * @description 指定した割合で RGB を減衰させる。
 * @param {string} hex - 変換対象の HEX カラー。
 * @param {number} [amount] - 暗くする割合（デフォルト: 0.2）。
 * @returns {string} 暗くした HEX カラー。
 */
export const darkenColor = (hex: string, amount = 0.2): string => {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    const [rChar = "0", gChar = "0", bChar = "0"] = c.split("");
    c = rChar.repeat(2) + gChar.repeat(2) + bChar.repeat(2);
  }
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
