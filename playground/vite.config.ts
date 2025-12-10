import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/chart-core': resolve(__dirname, '../packages/core/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
