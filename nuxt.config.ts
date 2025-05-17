import { gtmNoscript, gtmScript } from "./utils/gtm";

export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@pinia/nuxt", "@vueuse/nuxt"],

  supabase: {
    redirectOptions: {
      login: "/auth",
      callback: "/confirm",
      exclude: ["/*"],
    },
    url: process.env.NUXT_SUPABASE_URL,
    key: process.env.NUXT_SUPABASE_ANON_KEY,
  },

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      title: "タスク管理アプリ",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
