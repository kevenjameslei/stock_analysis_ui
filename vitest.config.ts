/// <reference types="vitest" />
import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import rawViteConfig from './vite.config.ts'

const viteBaseConfig = rawViteConfig as ViteUserConfig

export default mergeConfig(
  viteBaseConfig,
  defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['tests/**/*.test.ts'],
      coverage: {
        reporter: ['text', 'json', 'html'],
      },
    },
  }),
)
