import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9001,
    host: true
  },
  resolve: {
    alias: {
      '@ldesign/chart-react': path.resolve(__dirname, '../../packages/react/es/index.js'),
      '@ldesign/chart-core': path.resolve(__dirname, '../../packages/core/es/index.js'),
    }
  },
  optimizeDeps: {
    exclude: ['@ldesign/chart-react', '@ldesign/chart-core']
  }
})

