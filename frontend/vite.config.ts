/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = import.meta.dirname;

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    injectRegister: false,
    workbox: {
      globPatterns: ["**/*.{js,css,woff2,woff,png,svg,ico}"],
      runtimeCaching: [{
        urlPattern: /^https?:\/\/.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "flowforge-api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24
          },
          networkTimeoutSeconds: 4
        }
      }, {
        urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "flowforge-images-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7
          }
        }
      }]
    },
    manifest: {
      name: "FlowForge",
      short_name: "FlowForge",
      description: "Kanban board for team collaboration",
      theme_color: "#0ea5e9",
      background_color: "#f8fafc",
      display: "standalone",
      orientation: "portrait",
      start_url: "/?source=pwa",
      scope: "/",
      id: "/",
      icons: [{
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any"
      }, {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      }, {
        src: "/icons/icon-192-maskable.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable"
      }, {
        src: "/icons/icon-512-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable"
      }]
    }
  })],
  resolve: {
    tsconfigPaths: true
  },
  test: {
    projects: [{
      extends: true,
      test: {
        name: 'unit',
        environment: 'node',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});