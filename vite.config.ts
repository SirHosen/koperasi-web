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
        // Manual chunk splitting for better caching (function form for proper typing)
        manualChunks(id, { getModuleInfo: _getModuleInfo }) {
          // Normalize id to POSIX style
          const path = id.replace(/\\/g, '/')
          // Vendor groups
          if (path.includes('/node_modules/')) {
            if (
              /\/node_modules\/vue(\/|$)|\/node_modules\/vue-router|\/node_modules\/pinia/.test(
                path,
              )
            ) {
              return 'vue-vendor'
            }
            if (/\/node_modules\/bootstrap/.test(path)) {
              return 'ui-vendor'
            }
            if (/\/node_modules\/chart\.js/.test(path)) {
              return 'chart-vendor'
            }
            if (/\/node_modules\/(axios|uuid)(\/|$)/.test(path)) {
              return 'utility-vendor'
            }
          }

          // App module groups
          if (path.includes('/src/')) {
            if (/\/src\/views\/auth\//.test(path) || path.endsWith('/src/stores/modules/auth.js')) {
              return 'auth-module'
            }
            if (
              /\/src\/views\/anggota\//.test(path) ||
              path.endsWith('/src/stores/modules/anggota.js')
            ) {
              return 'anggota-module'
            }
            if (/\/src\/views\/pengurus\//.test(path)) {
              return 'pengurus-module'
            }
          }

          // Let Rollup decide otherwise
          return undefined
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
