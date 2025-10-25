/**
 * @ldesign/chart-core 构建配置
 * 框架无关的核心图表库
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: 'LDesignChartCore',
  libraryType: 'typescript',
  
  input: 'src/index.ts',
  
  output: {
    esm: {
      dir: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    cjs: {
      dir: 'lib',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    umd: {
      enabled: false
    }
  },
  
  external: [
    'echarts',
    /^echarts\//,
    '@visactor/vchart',
    /^@visactor\//
  ],
  
  typescript: {
    declaration: true,
    declarationDir: 'es',
    sourceMap: true
  }
})

