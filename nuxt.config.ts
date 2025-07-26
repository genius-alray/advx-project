import { defineNuxtConfig } from "nuxt/config";

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
    LLMApiKey: process.env.LLM_API_KEY,

    public: {},
  },
  nitro: {
    storage: {
      memory: {
        driver: "memory",
      },
    },
  },
  vite: {
    server: {
      hmr: {
        overlay: true,
        port: 24678,
      },
    },
    plugins: [
      {
        name: "test-nuxt4-hmr-fix",
        configureServer(server) {
          const originalInvalidateModule = server.moduleGraph.invalidateModule;
          server.moduleGraph.invalidateModule = function (
            mod,
            invalidatedModules = new Set(),
            timestamp = Date.now()
          ) {
            if (mod?.file?.includes("pages/")) {
              console.log("🔥 Force reload for page file:", mod.file);
              server.ws.send({
                type: "full-reload",
              });
              return;
            }
            return originalInvalidateModule.call(
              this,
              mod,
              invalidatedModules,
              timestamp
            );
          };
        },
        handleHotUpdate(ctx) {
          if (ctx.file.includes("pages/")) {
            console.log("🔥 Page file changed, forcing full reload:", ctx.file);
            ctx.server.ws.send({
              type: "full-reload",
            });
            return [];
          }
          return ctx.modules;
        },
      },
    ],
  },
});
