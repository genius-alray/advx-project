import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxtjs/mdc",
    "@pinia/nuxt",
    "@nuxt/ui",
    "@nuxt/image",
    "nuxt-auth-utils",
  ],
  css: ["~/assets/main.css"],
  ui: { colorMode: false },
  runtimeConfig: {
    // Private keys (only available on the server-side)
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    // Public keys that are exposed to the client-side
    public: {
      // Add any public config here if needed
    },
  },
  nitro: {
    storage: {
      memory: {
        driver: "memory",
      },
    },
  },
});