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
    "@compodium/nuxt",
  ],
  css: ["~/assets/main.css"],
  nitro: {
    storage: {
      memory: {
        driver: "memory",
      },
    },
  },
});
