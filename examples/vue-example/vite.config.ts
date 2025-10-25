import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9000,
    host: true,
    watch: {
      ignored: ['!**/node_modules/@ldesign/**']
    }
  },
  resolve: {
    alias: {
      '@ldesign/chart-vue': path.resolve(__dirname, '../../packages/vue/es/index.js'),
      '@ldesign/chart-core': path.resolve(__dirname, '../../packages/core/es/index.js'),
    }
  },
  optimizeDeps: {
    exclude: ['@ldesign/chart-vue', '@ldesign/chart-core']
  }
})

