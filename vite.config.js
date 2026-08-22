import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Futbol Simülatör — UCL / Avrupa Ligi / Süper Lig',
        short_name: 'Futbol Simülatör',
        description: 'UCL, Avrupa Ligi ve Trendyol Süper Lig kura/fikstür/tahmin simülatörü',
        theme_color: '#0e1d4a',
        background_color: '#0a1636',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Statik SPA -- tüm build çıktısı + amblem/takım logoları önbelleğe
        // alınır, böylece kurulumdan sonra internet olmadan da açılır.
        globPatterns: ['**/*.{js,css,html,png,svg,mp3}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  server: {
    port: 5173,
    open: true
  }
})
