/**
 * Angular 适配器入口
 */

// 导出组件
export { ChartComponent } from './components/chart.component'

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
