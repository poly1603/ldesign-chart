/**
 * 组合图表模块 - 灵活组合多种图表类型
 * 
 * 设计理念（参考 ECharts）：
 * ============================================================
 * 
 * 核心概念：
 * - 一个图表实例可以包含多种系列类型（line, bar 等）
 * - 通过 series[].type 指定每个系列的图表类型
 * - 不需要为每种组合创建专门的图表类
 * 
 * 使用方式：
 * ```typescript
 * const chart = new Chart(container, {
 *   xAxis: { data: [...] },
 *   series: [
 *     { name: '销量', type: 'bar', data: [...] },    // 柱状图系列
 *     { name: '增长率', type: 'line', data: [...] }, // 折线图系列
 *     // 可以添加更多系列，任意组合 bar 和 line
 *   ],
 * })
 * ```
 * 
 * 灵活性：
 * - 任意数量的 bar 系列 + 任意数量的 line 系列
 * - 支持双 Y 轴（yAxisIndex: 0 或 1）
 * - 支持堆叠（stack 属性）
 * - 支持面积填充（areaStyle）
 * - 支持虚线样式（lineStyle.type）
 * 
 * 扩展性：
 * - 如果需要支持更多图表类型（如 scatter），只需扩展 MixedChart 类
 * - 不需要为每种新的组合创建新的图表类
 * 
 * ============================================================
 */

import { Chart } from '@ldesign/chart-core'
import { getRendererMode } from '../../main'

let chartInstances: Chart[] = []

function registerChart(chart: Chart): void {
  chartInstances.push(chart)
}

export function refreshAllMixedCharts(_theme: 'light' | 'dark'): void {
  // 混合图表刷新时重新初始化
  disposeAllMixedCharts()
  // 重新初始化会由 main.ts 的 reinitCharts 处理
}

export function disposeAllMixedCharts(): void {
  chartInstances.forEach(chart => chart.dispose())
  chartInstances = []
}

// ============== 基础混合图表（柱状图+折线图）==============
export function initBasicMixedChart(): void {
  const container = document.getElementById('basic-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [
      { name: '销量', type: 'bar', data: [120, 150, 180, 200, 170, 220], color: '#6366f1' },
      { name: '增长率', type: 'line', data: [10, 25, 20, 11, -15, 29], color: '#10b981', smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 双Y轴混合图表 ==============
export function initDualAxisMixedChart(): void {
  const container = document.getElementById('dual-axis-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: [
      { name: '销量' },
      { name: '增长率%' },
    ],
    series: [
      { name: '销量', type: 'bar', data: [1200, 1500, 1800, 2000, 1700, 2200], yAxisIndex: 0, color: '#6366f1' },
      { name: '增长率', type: 'line', data: [10, 25, 20, 11, -15, 29], yAxisIndex: 1, color: '#ef4444', smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 销售与利润率混合图 ==============
export function initSalesProfitMixedChart(): void {
  const container = document.getElementById('sales-profit-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    yAxis: [
      { name: '销售额(万)' },
      { name: '利润率%' },
    ],
    series: [
      { name: '销售额', type: 'bar', data: [850, 920, 1100, 1280], yAxisIndex: 0, color: '#6366f1' },
      { name: '利润率', type: 'line', data: [12, 15, 18, 22], yAxisIndex: 1, color: '#10b981', smooth: true, symbolSize: 6 },
    ],
  })
  registerChart(chart)
}

// ============== 多柱状+折线混合图 ==============
export function initMultiBarLineMixedChart(): void {
  const container = document.getElementById('multi-bar-line-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { name: '线上', type: 'bar', data: [320, 350, 380, 420, 450, 520, 480], color: '#6366f1' },
      { name: '线下', type: 'bar', data: [280, 300, 320, 350, 380, 420, 400], color: '#10b981' },
      { name: '总计趋势', type: 'line', data: [600, 650, 700, 770, 830, 940, 880], color: '#f59e0b', smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 温度与降水量混合图 ==============
export function initWeatherMixedChart(): void {
  const container = document.getElementById('weather-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    yAxis: [
      { name: '降水量(mm)' },
      { name: '温度(°C)' },
    ],
    series: [
      { name: '降水量', type: 'bar', data: [45, 52, 68, 85, 120, 180, 210, 195, 140, 85, 55, 42], yAxisIndex: 0, color: '#3b82f6' },
      { name: '温度', type: 'line', data: [5, 8, 14, 20, 25, 30, 32, 31, 26, 18, 12, 6], yAxisIndex: 1, color: '#ef4444', smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 库存与周转率混合图 ==============
export function initInventoryMixedChart(): void {
  const container = document.getElementById('inventory-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['产品A', '产品B', '产品C', '产品D', '产品E'] },
    yAxis: [
      { name: '库存量' },
      { name: '周转率' },
    ],
    series: [
      { name: '库存', type: 'bar', data: [500, 350, 420, 280, 180], yAxisIndex: 0, color: '#8b5cf6' },
      { name: '周转率', type: 'line', data: [2.5, 3.2, 2.8, 4.1, 5.2], yAxisIndex: 1, color: '#f59e0b', symbolSize: 8 },
    ],
  })
  registerChart(chart)
}

// ============== 访问量与转化率混合图 ==============
export function initTrafficConversionMixedChart(): void {
  const container = document.getElementById('traffic-conversion-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: [
      { name: 'UV' },
      { name: '转化率%' },
    ],
    series: [
      { name: 'UV', type: 'bar', data: [5200, 4800, 5500, 6200, 7500, 12000, 9800], yAxisIndex: 0, color: '#6366f1' },
      { name: '转化率', type: 'line', data: [2.5, 2.8, 2.4, 3.1, 3.5, 4.2, 3.8], yAxisIndex: 1, color: '#10b981', smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 面积+柱状混合图 ==============
export function initAreaBarMixedChart(): void {
  const container = document.getElementById('area-bar-mixed-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [
      { name: '预算', type: 'bar', data: [100, 120, 140, 160, 180, 200], color: '#94a3b8' },
      { name: '实际', type: 'line', data: [95, 130, 125, 170, 165, 210], color: '#6366f1', smooth: true, areaStyle: { opacity: 0.3 } },
    ],
  })
  registerChart(chart)
}

// 导出 Chart 类
export { Chart } from '@ldesign/chart-core'
