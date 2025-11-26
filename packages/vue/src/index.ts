/**
 * LChart Vue 3 适配器
 * @module @aspect/lchart-vue
 */

import type { App, Plugin } from 'vue'

// 组件
export { LChart, LineChart, BarChart, PieChart, ScatterChart } from './components'

// Composables
export { useChart, useResize } from './composables'
export type { UseChartOptions, UseChartReturn, UseResizeOptions, UseResizeReturn } from './composables'

// 重新导出核心类型
export type {
  ChartOptions,
  ChartEventMap,
  SeriesOptions,
  LineSeriesOptions,
  BarSeriesOptions,
  PieSeriesOptions,
  DataPoint,
  DataSet,
  SimpleData,
  ThemeOptions,
} from '@ldesign/chart-core'

// Vue 插件
import { LChart, LineChart, BarChart, PieChart, ScatterChart } from './components'

export interface LChartPluginOptions {
  /** 组件前缀 */
  prefix?: string
}

/**
 * LChart Vue 插件
 */
export const LChartPlugin: Plugin = {
  install(app: App, options: LChartPluginOptions = {}) {
    const prefix = options.prefix || 'L'

    app.component(`${prefix}Chart`, LChart)
    app.component(`${prefix}LineChart`, LineChart)
    app.component(`${prefix}BarChart`, BarChart)
    app.component(`${prefix}PieChart`, PieChart)
    app.component(`${prefix}ScatterChart`, ScatterChart)
  },
}

export default LChartPlugin
