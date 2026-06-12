/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // Per GitHub Pages impostare base: '/<nome-repo>/' (vedi README).
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'SManetting — Impara a leggere gli spartiti',
        short_name: 'SManetting',
        description:
          'Impara a leggere gli spartiti musicali partendo da zero: teoria, pratica e composizione.',
        lang: 'it',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          {
            src: 'icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 3145728,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // VexFlow e Tone.js in chunk separati: caricati solo dalle rotte musicali.
        manualChunks: {
          vexflow: ['vexflow'],
          tone: ['tone'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: false,
  },
})
