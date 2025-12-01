/**
 * @ldesign/chart-react
 * React adapter for @ldesign/chart
 */

// Components
export { LChart } from './components/LChart'
export type { LChartProps, LChartRef } from './components/LChart'

// Hooks
export { useChart } from './hooks/useChart'
export type {
  UseChartOptions,
  UseChartReturn,
  ChartOption
} from './hooks/useChart'

// Re-export core types
export type {
  Theme,
  ColorTheme,
  ComponentTheme,
  SeriesTheme
} from '@ldesign/chart-core'

export type {
  IAnimation,
  AnimationOptions,
  AnimationState,
  Keyframe
} from '@ldesign/chart-core'