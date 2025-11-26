/**
 * Vue Demo Vite 配置
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  root: __dirname,
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/chart-vue': resolve(__dirname, '../src/index.ts'),
      '@ldesign/chart-core': resolve(__dirname, '../../core/src/index.ts'),
    },
  },
  server: {
    port: 3002,
    open: true,
  },
})
