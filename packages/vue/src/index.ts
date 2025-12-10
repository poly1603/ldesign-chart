/**
 * @ldesign/chart-vue
 * Vue 3 adapter for @ldesign/chart
 */

// 导出组件
export { default as LChart } from './components/LChart.vue'

// 导出 composables
export { useChart } from './composables/useChart'

// 导出类型
export type {
  ChartOption,
  UseChartOptions,
  UseChartReturn
} from './composables/useChart'

// 重新导出核心包的 Chart 类和类型
export { Chart } from '@ldesign/chart-core'
export type { ChartOptions } from '@ldesign/chart-core'