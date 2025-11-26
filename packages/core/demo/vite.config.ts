/**
 * Core Demo Vite 配置
 */
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@ldesign/chart-core': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
})
