import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { visualizer } from 'rollup-plugin-visualizer'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { fileURLToPath, URL } from 'node:url'
import Icons from 'unplugin-icons/vite'

// 可视化分析开关
const ANALYZE_BUNDLE = process.env.ANALYZE === 'true'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    // 基础路径配置
    base: env.VITE_APP_BASE_URL || '/',

    // 插件配置
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // 兼容轻量级图表库
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
      Icons({
        compiler: 'vue3',
        autoInstall: true,
        scale: 1.2, // 默认缩放比例
        defaultClass: 'inline-icon', // 默认类名
        jsx: 'react', // 如果使用 JSX 需要配置
      }),
      ANALYZE_BUNDLE &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ],

    // 解析配置
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        stream: 'stream-browserify',
      },
    },

    // CSS 预处理器配置
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

    // 构建配置
    build: {
      target: 'es2020',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lightweight-charts')) {
                return 'lwc'
              }
              if (id.includes('lodash')) {
                return 'lodash'
              }
              if (id.includes('moment')) {
                return 'moment'
              }
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

    // 开发服务器配置
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

    // 实验性功能
    experimental: {
      renderBuiltUrl(filename) {
        return {
          runtime: `window.assetPath(${JSON.stringify(filename)})`,
        }
      },
    },

    // Worker 配置
    worker: {
      format: 'es',
      plugins: () => [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag) => tag.startsWith('trading-vue'),
            },
          },
        }),
      ],
    },

    // 优化依赖
    optimizeDeps: {
      include: ['lightweight-charts', 'lodash/throttle', 'lodash/debounce'],
      exclude: ['vue-demi'],
    },
  }
})
