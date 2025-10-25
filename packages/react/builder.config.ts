/**
 * @ldesign/chart-react 构建配置
 * React 适配器
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: 'LDesignChartReact',
  libraryType: 'react',
  
  input: 'src/index.tsx',
  
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
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@ldesign/chart-core',
    'echarts',
    /^echarts\//
  ],
  
  typescript: {
    declaration: true,
    sourceMap: true
  }
})

