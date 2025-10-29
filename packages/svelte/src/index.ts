/**
 * Svelte 适配器入口
 */

// 导出组件
export { default as Chart } from './Chart.svelte'

// 导出类型
export type {
  ChartConfig,
  ChartData,
  ChartType,
  ChartInstance,
  SimpleChartData,
  Dataset,
} from '@ldesign/chart-core'

// 导出核心功能
export { Chart as ChartCore, createChart } from '@ldesign/chart-core'
