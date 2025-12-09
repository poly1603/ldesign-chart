/**
 * 饼图模块 - 使用 @ldesign/chart-core 的 PieChart 类
 */

import { PieChart } from '@ldesign/chart-core'
import { getRendererMode } from '../../main'

let chartInstances: PieChart[] = []

function getCommonOptions() {
  return { renderer: getRendererMode() }
}

function registerChart(chart: PieChart): void {
  chartInstances.push(chart)
}

export function refreshAllPieCharts(theme: 'light' | 'dark'): void {
  chartInstances.forEach(chart => chart.setTheme(theme))
}

export function disposeAllPieCharts(): void {
  chartInstances.forEach(chart => chart.dispose())
  chartInstances = []
}

export function initPieChart(): void {
  const container = document.getElementById('pie-chart')
  if (!container) return
  const chart = new PieChart(container, {
    ...getCommonOptions(),
    data: [
      { name: '直接访问', value: 335 },
      { name: '邮件营销', value: 310 },
      { name: '联盟广告', value: 234 },
      { name: '视频广告', value: 135 },
      { name: '搜索引擎', value: 1548 },
    ],
  })
  registerChart(chart)
}

export function initDonutChart(): void {
  const container = document.getElementById('donut-chart')
  if (!container) return
  const chart = new PieChart(container, {
    ...getCommonOptions(),
    radius: [0.4, 0.7],
    data: [
      { name: '直接访问', value: 335 },
      { name: '邮件营销', value: 310 },
      { name: '联盟广告', value: 234 },
      { name: '视频广告', value: 135 },
      { name: '搜索引擎', value: 1548 },
    ],
  })
  registerChart(chart)
}

export function initRoseChart(): void {
  const container = document.getElementById('rose-chart')
  if (!container) return
  const chart = new PieChart(container, {
    ...getCommonOptions(),
    roseType: 'radius',
    data: [
      { name: '玫瑰1', value: 40 },
      { name: '玫瑰2', value: 38 },
      { name: '玫瑰3', value: 32 },
      { name: '玫瑰4', value: 30 },
      { name: '玫瑰5', value: 28 },
    ],
  })
  registerChart(chart)
}

export function initNestedPieChart(): void {
  const container = document.getElementById('nested-pie-chart')
  if (!container) return
  const chart = new PieChart(container, {
    ...getCommonOptions(),
    radius: [0.3, 0.6],
    data: [
      { name: '直接访问', value: 335 },
      { name: '邮件营销', value: 310 },
      { name: '联盟广告', value: 234 },
      { name: '视频广告', value: 135 },
    ],
  })
  registerChart(chart)
}

export function initHalfPieChart(): void {
  const container = document.getElementById('half-pie-chart')
  if (!container) return
  const chart = new PieChart(container, {
    ...getCommonOptions(),
    radius: [0.4, 0.7],
    data: [
      { name: '搜索引擎', value: 1048 },
      { name: '直接访问', value: 735 },
      { name: '邮件营销', value: 580 },
      { name: '联盟广告', value: 484 },
      { name: '视频广告', value: 300 },
    ],
  })
  registerChart(chart)
}

export { PieChart } from '@ldesign/chart-core'
export type { PieChartOptions, PieChartDataItem } from '@ldesign/chart-core'