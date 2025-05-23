import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { visualizer } from 'rollup-plugin-visualizer'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { fileURLToPath, URL } from 'node:url'

const ANALYZE_BUNDLE = process.env.ANALYZE === 'true'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    base: env.VITE_APP_BASE_URL || '/',

    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('trading-vue'),
          },
        },
      }),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      createSvgIconsPlugin({
        iconDirs: [fileURLToPath(new URL('./src/assets/icons', import.meta.url))],
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-last',
        customDomId: '__svg_icons__',
      }),
      ANALYZE_BUNDLE &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        stream: 'stream-browserify',
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/styles/_variables.scss" as *;
            @use "@/assets/styles/_mixins.scss" as *;
          `,
        },
      },
    },

    build: {
      target: 'es2020',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lightweight-charts')) return 'lwc'
              if (id.includes('lodash')) return 'lodash'
              if (id.includes('moment')) return 'moment'
              return 'vendor'
            }
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
    },

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: env.VITE_WS_URL,
          ws: true,
          changeOrigin: true,
        },
      },
      headers: {
        'Content-Security-Policy': env.VITE_CSP_DIRECTIVES,
      },
    },

    experimental: {
      renderBuiltUrl(filename) {
        return {
          runtime: `window.assetPath(${JSON.stringify(filename)})`,
        }
      },
    },

    worker: {
      format: 'es',
      plugins() {
        return [
          vue({
            template: {
              compilerOptions: {
                isCustomElement: (tag) => tag.startsWith('trading-vue'),
              },
            },
          }),
        ]
      },
    },

    optimizeDeps: {
      include: ['lightweight-charts', 'lodash/throttle', 'lodash/debounce'],
      exclude: ['vue-demi'],
    },
  }
})
