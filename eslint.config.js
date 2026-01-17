import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "eslint-plugin-vue";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "dist",
      "node_modules",
      ".nuxt",
      ".output",
      "playwright-report",
      "test-results",
    ],
  },
  ...vue.configs["flat/recommended"],
  ...compat.config({
    root: true,
    env: {
      browser: true,
      node: true,
      es2022: true,
    },
    parser: "vue-eslint-parser",
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: "@typescript-eslint/parser",
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
    ],
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
      "prettier/prettier": "error",
    },
  }),
];
