import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

/**
 * デザイントークン: カーム・ミニマル (issue #112)
 * - calm: アクセントの青。Nuxt UI の primary に接続される (app/app.config.ts)
 * - gray: 紙のような暖色寄りグレー。既存の gray-* 直書きクラスごと世界観を差し替える
 * 実行時に切り替わる値 (ダークモード等) は app/assets/css/main.css の CSS 変数側で管理する
 */
export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{vue,ts,tsx}",
    "./stores/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        calm: {
          50: "#EFF4FE",
          100: "#DEE9FD",
          200: "#C3D6FB",
          300: "#9CBAF8",
          400: "#6D97F4",
          500: "#3474F0",
          600: "#2A5FD1",
          700: "#234EAC",
          800: "#1F4189",
          900: "#1D3970",
          950: "#14264C",
        },
        gray: {
          50: "#F8F8F6",
          100: "#F1F1ED",
          200: "#E9E8E2",
          300: "#D8D7D0",
          400: "#AEADA5",
          500: "#8E8D85",
          600: "#6E6D66",
          700: "#56554F",
          800: "#3B3A36",
          900: "#262521",
          950: "#191814",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgb(24 26 34 / 0.05), 0 0 0 1px rgb(24 26 34 / 0.04)",
        "card-hover":
          "0 6px 18px rgb(24 26 34 / 0.09), 0 0 0 1px rgb(24 26 34 / 0.05)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;
