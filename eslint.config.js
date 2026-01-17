import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  ignores: [
    "dist",
    "node_modules",
    ".nuxt",
    ".output",
    "playwright-report",
    "test-results",
  ],
  rules: {
    "vue/no-multiple-template-root": "off",
  },
});
