import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg'],
            manifest: {
                name: 'MuseoYo',
                short_name: 'MuseoYo',
                description: 'Tu museo personal de recuerdos, colecciones y mundos.',
                theme_color: '#090815',
                background_color: '#090815',
                display: 'standalone',
                start_url: '/',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ]
});
