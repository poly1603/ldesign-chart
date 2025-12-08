import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  resolve: {
    alias: {
      '@ldesign/chart-core': resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
})
