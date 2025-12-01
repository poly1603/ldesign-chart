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

export type { LChartProps } from './components/LChart.vue'

// 重新导出核心包的类型和工具
export type {
  Theme,
  ColorTheme,
  IAnimation,
  AnimationOptions,
} from '@ldesign/chart-core'