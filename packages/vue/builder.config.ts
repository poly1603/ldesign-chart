/**
 * @ldesign/chart-vue 构建配置
 * Vue 3 适配器
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: 'LDesignChartVue',
  libraryType: 'vue3',
  
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
    'vue',
    '@ldesign/chart-core',
    'echarts',
    /^echarts\//
  ],
  
  typescript: {
    declaration: true,
    sourceMap: true
  },
  
  style: {
    extract: true,
    minimize: true
  }
})

