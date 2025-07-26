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
  vite: {
    server: {
      hmr: {
        overlay: true,
        port: 24678,
      },
    },
    //JA HMR問題を修正するためのカスタムプラグイン
    //EN Custom plugin to fix HMR issues
    // plugins: [
    //   {
    //     name: "test-nuxt4-hmr-fix",
    //     configureServer(server) {
    //       //JA ページファイル変更時に強制的にフルリロードを実行
    //       //EN Force full reload on page file changes
    //       const originalInvalidateModule = server.moduleGraph.invalidateModule;
    //       server.moduleGraph.invalidateModule = function (
    //         mod,
    //         invalidatedModules = new Set(),
    //         timestamp = Date.now()
    //       ) {
    //         if (mod?.file?.includes("pages/")) {
    //           console.log("🔥 Force reload for page file:", mod.file);
    //           server.ws.send({
    //             type: "full-reload",
    //           });
    //           return;
    //         }
    //         return originalInvalidateModule.call(
    //           this,
    //           mod,
    //           invalidatedModules,
    //           timestamp
    //         );
    //       };
    //     },
    //     handleHotUpdate(ctx) {
    //       //JA ページファイルの場合は強制的にフルリロードを送信
    //       //EN Force full reload on page file changes
    //       if (ctx.file.includes("pages/")) {
    //         console.log("🔥 Page file changed, forcing full reload:", ctx.file);
    //         ctx.server.ws.send({
    //           type: "full-reload",
    //         });
    //         return [];
    //       }
    //       return ctx.modules;
    //     },
    //   },
    // ],
  },
});
