import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  server: {
    port: 9002,
    host: true,
    watch: {
      ignored: ['!**/node_modules/@ldesign/**']
    }
  },
  resolve: {
    alias: {
      '@ldesign/chart-core': path.resolve(__dirname, '../../packages/core/es/index.js'),
    }
  },
  optimizeDeps: {
    exclude: ['@ldesign/chart-core']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

