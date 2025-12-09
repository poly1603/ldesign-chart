/**
 * 便捷图表类导出
 * 
 * 使用示例：
 * ```ts
 * import { LineChart, BarChart, PieChart, ScatterChart } from '@ldesign/chart-core'
 * 
 * const chart = new LineChart('#container', {
 *   xAxis: { data: ['Mon', 'Tue', 'Wed'] },
 *   series: [{ name: 'Sales', data: [100, 200, 150] }],
 * })
 * ```
 */

export { BaseChart, getThemeColors, SERIES_COLORS, Easings } from './BaseChart'
export type { BaseChartOptions, ChartRect } from './BaseChart'

export { LineChart } from './LineChart'
export type { LineChartOptions, LineSeriesData, AnimationConfig, EntryAnimationType, UpdateAnimationType } from './LineChart'

export { BarChart } from './BarChart'
export type { BarChartOptions, BarSeriesData } from './BarChart'

export { PieChart } from './PieChart'
export type { PieChartOptions, PieDataItem, PieLabelLineOptions } from './PieChart'

export { ScatterChart } from './ScatterChart'
export type { ScatterChartOptions, ScatterSeriesData, ScatterDataPoint } from './ScatterChart'
