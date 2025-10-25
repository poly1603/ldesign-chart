/**
 * @ldesign/chart-lit 构建配置
 * Lit/Web Components 适配器
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: 'LDesignChartLit',
  libraryType: 'lit',
  
  input: 'src/index.ts',
  
  output: {
    esm: {
      dir: 'es'
    },
    cjs: {
      dir: 'lib'
    },
    umd: {
      enabled: false
    }
  },
  
  external: [
    'lit',
    'lit/decorators.js',
    'lit/directives/class-map.js',
    '@ldesign/chart-core',
    'echarts',
    /^echarts\//
  ],
  
  typescript: {
    declaration: true,
    sourceMap: true
  }
})

