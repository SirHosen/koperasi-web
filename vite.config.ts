import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Remove production comments and whitespace
          comments: false,
          whitespace: 'condense',
        },
      },
    }),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Performance optimizations
    target: 'esnext', // Use modern JS for smaller bundles
    minify: 'esbuild', // Faster minification
    cssMinify: true,

    // Bundle optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor libraries
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['bootstrap'],
          'chart-vendor': ['chart.js'],
          'utility-vendor': ['axios', 'uuid'],

          // Application modules
          'auth-module': [
            './src/stores/modules/auth.js',
            './src/views/auth/LoginView.vue',
            './src/views/auth/RegisterView.vue',
          ],
          'anggota-module': [
            './src/stores/modules/anggota.js',
            './src/views/anggota/AnggotaDashboardView.vue',
            './src/views/anggota/SimpananView.vue',
          ],
          'pengurus-module': [
            './src/views/pengurus/DashboardView.vue',
            './src/views/pengurus/AnggotaManagementView.vue',
            './src/views/pengurus/PinjamanVerifikasiView.vue',
          ],
        },
        // Optimize chunk names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.vue', '') || 'chunk'
            : 'chunk'
          return `js/${facadeModuleId}-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash][extname]`
          }
          if (/\.(css)$/i.test(assetInfo.name || '')) {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
      },
      // External dependencies (if using CDN)
      external: process.env.NODE_ENV === 'production' ? [] : [],
    },

    // Bundle analysis options
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500, // Warn for chunks > 500kb

    // Source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',

    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },

  // Development optimizations
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'chart.js', 'bootstrap'],
    exclude: [
      // Exclude large libraries that should be loaded on demand
    ],
  },

  // CSS optimization
  css: {
    devSourcemap: false, // Disable CSS source maps for better performance
    preprocessorOptions: {
      scss: {
        // Add any SCSS optimizations here
      },
    },
  },
})
