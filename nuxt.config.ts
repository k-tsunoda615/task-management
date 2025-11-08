import { gtmNoscript, gtmScript } from "./app/utils/gtm";

export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@pinia/nuxt", "@vueuse/nuxt"],

  // エイリアス設定を追加
  alias: {
    "@": "./app",
    "~": "./app",
    "@components": "./app/components",
    "@utils": "./app/utils",
    "@composables": "./app/composables",
    "@stores": "./stores",
    "@types": "./types",
  },

  // PostCSS設定をNuxt内に移動
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // TailwindCSS設定を追加
  css: ["~/assets/css/main.css"],

  supabase: {
    redirectOptions: {
      login: "/auth",
      callback: "/confirm",
      exclude: ["/*"],
    },
    // テスト環境やCI環境でのデフォルト値を設定
    url: process.env.NUXT_SUPABASE_URL || "https://dummy.supabase.co",
    key: process.env.NUXT_SUPABASE_ANON_KEY || "dummy-anon-key",
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      title: "タスクボード",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
      ],
      script: [
        {
          id: "gtm-script",
          innerHTML: gtmScript,
          type: "text/javascript",
        },
      ],
      // @ts-expect-error Nuxt Head型の制約回避
      __dangerouslyDisableSanitizersByTagID: {
        "gtm-script": ["innerHTML"],
      },
    },
    body: {
      noscript: [
        {
          id: "gtm-noscript",
          innerHTML: gtmNoscript,
        },
      ],
    },
  },

  compatibilityDate: "2025-04-12",
});
