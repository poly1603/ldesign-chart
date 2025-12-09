/**
 * 散点图模块 - 使用 @ldesign/chart-core 的 ScatterChart 类
 */

import { ScatterChart } from '@ldesign/chart-core'

let chartInstances: ScatterChart[] = []

function registerChart(chart: ScatterChart): void {
  chartInstances.push(chart)
}

export function refreshAllScatterCharts(theme: 'light' | 'dark'): void {
  chartInstances.forEach(chart => chart.setTheme(theme))
}

export function disposeAllScatterCharts(): void {
  chartInstances.forEach(chart => chart.dispose())
  chartInstances = []
}

export function initScatterChart(): void {
  const container = document.getElementById('scatter-chart')
  if (!container) return
  const chart = new ScatterChart(container, {
    series: [{
      name: '数据1',
      data: [
        [10.0, 8.04], [8.07, 6.95], [13.0, 7.58], [9.05, 8.81], [11.0, 8.33],
        [14.0, 7.66], [13.4, 6.81], [10.0, 6.33], [14.0, 8.96], [12.5, 6.82],
      ],
    }],
  })
  registerChart(chart)
}

export function initMultiScatterChart(): void {
  const container = document.getElementById('multi-scatter-chart')
  if (!container) return
  const chart = new ScatterChart(container, {
    series: [
      {
        name: '女性',
        data: [
          [161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
          [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
        ],
      },
      {
        name: '男性',
        data: [
          [174.0, 65.6], [175.3, 71.8], [193.5, 80.7], [186.5, 72.6], [187.2, 78.8],
          [181.5, 74.8], [184.0, 86.4], [184.5, 78.4], [175.0, 62.0], [184.0, 81.6],
        ],
      },
    ],
  })
  registerChart(chart)
}

export function initBubbleChart(): void {
  const container = document.getElementById('bubble-chart')
  if (!container) return
  const chart = new ScatterChart(container, {
    series: [{
      name: '数据',
      symbolSize: (point) => Math.sqrt((point.value || 10) * 10),
      data: [
        { x: 10, y: 20, value: 30 },
        { x: 20, y: 30, value: 50 },
        { x: 30, y: 10, value: 20 },
        { x: 40, y: 25, value: 40 },
        { x: 50, y: 35, value: 60 },
        { x: 60, y: 15, value: 25 },
        { x: 70, y: 45, value: 70 },
      ],
    }],
  })
  registerChart(chart)
}

export function initQuadrantScatterChart(): void {
  const container = document.getElementById('quadrant-scatter-chart')
  if (!container) return
  const chart = new ScatterChart(container, {
    series: [{
      name: '产品',
      data: [
        { x: 30, y: 40 }, { x: 60, y: 70 }, { x: 20, y: 80 },
        { x: 70, y: 30 }, { x: 80, y: 60 }, { x: 40, y: 20 },
      ],
      symbolSize: 12,
    }],
  })
  registerChart(chart)
}

export { ScatterChart } from '@ldesign/chart-core'
export type { ScatterChartOptions, ScatterSeriesData, ScatterDataPoint } from '@ldesign/chart-core'