// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";

// 配置 base URL - 只需在此处修改
const BASE_PATH = "/ObraDinn-HintsAndCheck";

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
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Return of the Obra Dinn - Hints & Check",
        short_name: "Obra Dinn Hints",
        description: "Helper tool for Return of the Obra Dinn",
        theme_color: "#333319",
        background_color: "#333319",
        display: "standalone",
        scope: `${BASE_PATH}/`,
        start_url: `${BASE_PATH}/`,
        icons: [
          {
            src: `${BASE_PATH}/icon.webp`,
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: `${BASE_PATH}/icon.webp`,
            sizes: "512x512",
            type: "image/webp",
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
