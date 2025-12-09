/**
 * 图表类导出
 * 
 * 推荐使用方式（参考 ECharts）：
 * ```ts
 * import { Chart } from '@ldesign/chart-core'
 * 
 * // 折线图
 * const lineChart = new Chart('#container', {
 *   xAxis: { data: ['Mon', 'Tue', 'Wed'] },
 *   series: [{ type: 'line', name: 'Sales', data: [100, 200, 150] }],
 * })
 * 
 * // 柱状图
 * const barChart = new Chart('#container', {
 *   xAxis: { data: ['A', 'B', 'C'] },
 *   series: [{ type: 'bar', name: 'Value', data: [120, 200, 150] }],
 * })
 * 
 * // 组合图（折线 + 柱状）
 * const mixedChart = new Chart('#container', {
 *   xAxis: { data: ['Q1', 'Q2', 'Q3'] },
 *   series: [
 *     { type: 'bar', name: '销量', data: [120, 200, 150] },
 *     { type: 'line', name: '增长率', data: [10, 15, 12], yAxisIndex: 1 },
 *   ],
 *   yAxis: [{}, {}], // 双 Y 轴
 * })
 * 
 * // 横向柱状图
 * const horizontalBar = new Chart('#container', {
 *   horizontal: true,
 *   xAxis: { data: ['A', 'B', 'C'] },
 *   series: [{ type: 'bar', name: 'Value', data: [120, 200, 150] }],
 * })
 * ```
 */

// ============== 核心图表类（推荐使用）==============
export { Chart } from './Chart'
export type { ChartOptions, SeriesData, SeriesType, XAxisConfig, YAxisConfig, LineStyle, AreaStyle } from './Chart'

// ============== 基础类和工具 ==============
export { BaseChart, getThemeColors, SERIES_COLORS, Easings } from './BaseChart'
export type { BaseChartOptions, ChartRect } from './BaseChart'

// ============== 便捷类（向后兼容）==============
// 请使用统一的 Chart 类并通过 series[].type 指定图表类型
// export { LineChart } from './LineChart'
// export type { LineChartOptions, LineSeriesData, AnimationConfig, EntryAnimationType, UpdateAnimationType } from './LineChart'

// export { BarChart } from './BarChart'
// export type { BarChartOptions, BarSeriesData } from './BarChart'

export { PieChart } from './PieChart'
export type { PieChartOptions, PieDataItem, PieLabelLineOptions } from './PieChart'

// export { ScatterChart } from './ScatterChart'
// export type { ScatterChartOptions, ScatterSeriesData, ScatterDataPoint } from './ScatterChart'

// export { MixedChart } from './MixedChart'
// export type { MixedChartOptions, MixedSeriesData } from './MixedChart'
