/**
 * 图表示例模块总入口
 * 
 * 推荐使用方式（参考 ECharts）：
 * ============================================================
 * 
 * import { Chart } from '@ldesign/chart-core'
 * 
 * // 折线图
 * new Chart('#container', {
 *   xAxis: { data: ['Mon', 'Tue', 'Wed'] },
 *   series: [{ type: 'line', name: 'Sales', data: [100, 200, 150] }],
 * })
 * 
 * // 柱状图
 * new Chart('#container', {
 *   xAxis: { data: ['A', 'B', 'C'] },
 *   series: [{ type: 'bar', name: 'Value', data: [120, 200, 150] }],
 * })
 * 
 * // 组合图（折线 + 柱状）
 * new Chart('#container', {
 *   xAxis: { data: ['Q1', 'Q2', 'Q3'] },
 *   series: [
 *     { type: 'bar', name: '销量', data: [120, 200, 150] },
 *     { type: 'line', name: '增长率', data: [10, 15, 12] },
 *   ],
 * })
 * 
 * ============================================================
 */

// 所有图示例都使用统一的 Chart 类
export * from './line'      // 折线图示例
export * from './bar'       // 柱状图示例
export * from './pie'       // 饼图示例
export * from './scatter'   // 散点图示例
export * from './mixed'     // 组合图表示例（旧版）
