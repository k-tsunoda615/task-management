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
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_SUPABASE_URL,
      supabaseKey: process.env.NUXT_SUPABASE_ANON_KEY,
    },
  },

  compatibilityDate: "2025-04-12",
});