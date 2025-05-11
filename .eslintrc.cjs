// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint", "vue", "prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  ignorePatterns: ["dist", "node_modules"],
};
