export default defineAppConfig({
  // カーム・ミニマルのテーマ設定 (issue #112)
  // primary を calm (tailwind.config.ts で定義した青) に接続し、
  // Nuxt UI コンポーネント (UButton, UCheckbox, UModal 等) の配色を一括で揃える
  ui: {
    primary: "calm",
    gray: "paper",
    button: {
      rounded: "rounded-lg",
    },
    card: {
      rounded: "rounded-card",
    },
    modal: {
      rounded: "rounded-xl",
    },
  },
});
