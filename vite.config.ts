import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'app-logo.png',
        'templates/*.webp',
        'worlds/*.webp',
        'universe/*.webp'
      ],
      manifest: {
        name: 'Mis Universos',
        short_name: 'Universos',
        description: 'Mis mundos, colecciones y recuerdos.',
        theme_color: '#7774bd',
        background_color: '#7774bd',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/app-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
