import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/chart-core': resolve(__dirname, '../../src')
    }
  },
  server: {
    port: 5173
  }
})