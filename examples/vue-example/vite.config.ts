import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9000,
    host: true,
    watch: {
      ignored: ['!**/node_modules/@ldesign/**']
    }
  },
  optimizeDeps: {
    exclude: ['@ldesign/chart']
  }
})

