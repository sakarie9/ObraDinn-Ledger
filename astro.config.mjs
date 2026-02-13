// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";

// 配置 base URL - 只需在此处修改
const BASE_PATH = "/ObraDinn-Ledger";

// https://astro.build/config
export default defineConfig({
  site: "https://sakarie9.github.io",
  base: BASE_PATH,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    AstroPWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.webp", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Return of the Obra Dinn - Ledger",
        short_name: "Obra Dinn Ledger",
        description: "Helper tool for Return of the Obra Dinn",
        theme_color: "#333319",
        background_color: "#333319",
        display: "standalone",
        scope: `${BASE_PATH}/`,
        start_url: `${BASE_PATH}/`,
        icons: [
          {
            src: `${BASE_PATH}/icon-192.png`,
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${BASE_PATH}/icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${BASE_PATH}/icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,svg,webp}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
        navigateFallback: null,
      },
    }),
  ],
});
