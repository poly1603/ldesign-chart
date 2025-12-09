/**
 * 柱状图模块 - 使用 @ldesign/chart-core 的 BarChart 类
 */

import { BarChart } from '@ldesign/chart-core'

let chartInstances: BarChart[] = []

function registerChart(chart: BarChart): void {
  chartInstances.push(chart)
}

export function refreshAllBarCharts(theme: 'light' | 'dark'): void {
  chartInstances.forEach(chart => chart.setTheme(theme))
}

export function disposeAllBarCharts(): void {
  chartInstances.forEach(chart => chart.dispose())
  chartInstances = []
}

export function initBarChart(): void {
  const container = document.getElementById('bar-chart')
  if (!container) return
  const chart = new BarChart(container, {
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [{ name: '销量', data: [120, 200, 150, 80, 70, 110, 130] }],
  })
  registerChart(chart)
}

export function initStackedBarChart(): void {
  const container = document.getElementById('stacked-bar-chart')
  if (!container) return
  const chart = new BarChart(container, {
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total' },
      { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total' },
      { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total' },
    ],
  })
  registerChart(chart)
}

export function initGroupedBarChart(): void {
  const container = document.getElementById('grouped-bar-chart')
  if (!container) return
  const chart = new BarChart(container, {
    xAxis: { data: ['巴西', '印尼', '美国', '印度', '中国'] },
    series: [
      { name: '2011年', data: [18203, 23489, 29034, 104970, 131744] },
      { name: '2012年', data: [19325, 23438, 31000, 121594, 134141] },
    ],
  })
  registerChart(chart)
}

export function initHorizontalBarChart(): void {
  const container = document.getElementById('horizontal-bar-chart')
  if (!container) return
  const chart = new BarChart(container, {
    horizontal: true,
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五'] },
    series: [{ name: '数据', data: [120, 200, 150, 80, 70] }],
  })
  registerChart(chart)
}

export function initNegativeBarChart(): void {
  const container = document.getElementById('negative-bar-chart')
  if (!container) return
  const chart = new BarChart(container, {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [{ name: '利润', data: [200, -100, 150, -80, 120, -50] }],
  })
  registerChart(chart)
}

export function initWaterfallChart(): void {
  const container = document.getElementById('waterfall-chart')
  if (!container) return
  const chart = new BarChart(container, {
    xAxis: { data: ['总收入', '成本', '毛利', '运营费', '净利润'] },
    series: [{ name: '金额', data: [900, -400, 500, -300, 200] }],
  })
  registerChart(chart)
}

export function initGradientBarChart(): void {
  const container = document.getElementById('gradient-bar-chart')
  if (!container) return
  const chart = new BarChart(container, {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [{ name: '数据', data: [120, 200, 150, 80, 70, 110, 130], borderRadius: 8 }],
  })
  registerChart(chart)
}

export function initPolarBarChart(): void {
  const container = document.getElementById('polar-bar-chart')
  if (!container) return
  const chart = new BarChart(container, {
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F'] },
    series: [{ name: '数据', data: [43, 83, 66, 53, 90, 72] }],
  })
  registerChart(chart)
}

export { BarChart } from '@ldesign/chart-core'
export type { BarChartOptions, BarSeriesData } from '@ldesign/chart-core'