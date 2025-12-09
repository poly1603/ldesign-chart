/**
 * 折线图模块 - 使用 @ldesign/chart-core 的 LineChart 类
 */

import { LineChart } from '@ldesign/chart-core'
import { getRendererMode } from '../../main'
// 类型导出在文件末尾

// 保存所有图表实例，用于主题切换时刷新
let chartInstances: LineChart[] = []

// 注册图表实例
function registerChart(chart: LineChart): void {
  chartInstances.push(chart)
}

// 刷新所有图表（主题切换时调用）
export function refreshAllLineCharts(theme: 'light' | 'dark'): void {
  chartInstances.forEach(chart => chart.setTheme(theme))
}

// 销毁所有图表实例
export function disposeAllLineCharts(): void {
  chartInstances.forEach(chart => chart.dispose())
  chartInstances = []
}

// ============== 基础折线图 ==============
export function initLineChart(): void {
  const container = document.getElementById('line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { name: '销售额', data: [150, 230, 224, 218, 135, 147, 260] },
      { name: '利润', data: [80, 120, 160, 140, 180, 200, 190] },
    ],
  })
  registerChart(chart)
}

// ============== 平滑折线图 ==============
export function initSmoothLineChart(): void {
  const container = document.getElementById('smooth-line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { name: '2023', data: [820, 932, 901, 934, 1290, 1330], smooth: true },
      { name: '2024', data: [620, 732, 1101, 1134, 1190, 1530], smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 虚线折线图 ==============
export function initDashedLineChart(): void {
  const container = document.getElementById('dashed-line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'] },
    series: [
      { name: '实际', data: [120, 132, 101, 134, 90, 230] },
      { name: '预测', data: [null, null, null, null, 90, 230], lineStyle: { type: 'dashed' }, connectNulls: true },
    ],
  })
  registerChart(chart)
}

// ============== 空值折线图 ==============
export function initNullLineChart(): void {
  const container = document.getElementById('null-line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    series: [
      { name: '数据', data: [120, 132, null, 134, 90, null, 210], connectNulls: false },
    ],
  })
  registerChart(chart)
}

// ============== 多样式折线图 ==============
export function initMultiStyleLineChart(): void {
  const container = document.getElementById('multi-style-line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { name: '实线', data: [120, 200, 150, 80, 70, 110, 130], lineStyle: { type: 'solid' } },
      { name: '虚线', data: [60, 100, 80, 120, 90, 140, 100], lineStyle: { type: 'dashed' } },
      { name: '点线', data: [30, 50, 40, 60, 45, 70, 55], lineStyle: { type: 'dotted' } },
    ],
  })
  registerChart(chart)
}

// ============== 自定义点样式 ==============
export function initCustomSymbolLineChart(): void {
  const container = document.getElementById('custom-symbol-line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F'] },
    series: [
      { name: '圆形', data: [120, 200, 150, 80, 70, 110], symbol: 'circle', symbolSize: 6 },
      { name: '方形', data: [80, 150, 100, 120, 90, 140], symbol: 'rect', symbolSize: 5 },
      { name: '三角', data: [40, 80, 60, 100, 50, 90], symbol: 'triangle', symbolSize: 6 },
    ],
  })
  registerChart(chart)
}

// ============== 阶梯折线图 ==============
export function initStepLineChart(): void {
  const container = document.getElementById('step-line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1', '2', '3', '4', '5', '6', '7'] },
    series: [
      { name: 'Start', data: [120, 132, 101, 134, 90, 230, 210], step: 'start' },
      { name: 'Middle', data: [220, 182, 191, 234, 290, 330, 310], step: 'middle' },
      { name: 'End', data: [450, 432, 401, 454, 590, 530, 510], step: 'end' },
    ],
  })
  registerChart(chart)
}

// ============== 堆叠折线图 ==============
export function initStackedLineChart(): void {
  const container = document.getElementById('stacked-line-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total' },
      { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total' },
      { name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410], stack: 'total' },
    ],
  })
  registerChart(chart)
}

// ============== 堆叠面积图 ==============
export function initStackedAreaChart(): void {
  const container = document.getElementById('stacked-area-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { name: '产品A', data: [140, 232, 101, 264], areaStyle: true, smooth: true },
      { name: '产品B', data: [120, 282, 111, 234], areaStyle: true, smooth: true },
      { name: '产品C', data: [320, 132, 201, 334], areaStyle: true, smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 渐变面积图 ==============
export function initGradientAreaChart(): void {
  const container = document.getElementById('gradient-area-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { name: '数据', data: [820, 932, 901, 934, 1290, 1330, 1320], areaStyle: { opacity: 0.4 }, smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 置信区间图 ==============
export function initConfidenceBandChart(): void {
  const container = document.getElementById('confidence-band-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { name: '上界', data: [120, 150, 140, 160, 180, 200], areaStyle: { opacity: 0.2 }, lineStyle: { type: 'dashed' } },
      { name: '均值', data: [100, 120, 110, 130, 150, 170], smooth: true },
      { name: '下界', data: [80, 90, 80, 100, 120, 140], areaStyle: { opacity: 0.2 }, lineStyle: { type: 'dashed' } },
    ],
  })
  registerChart(chart)
}

// ============== 双Y轴折线图 ==============
export function initDualAxisChart(): void {
  const container = document.getElementById('dual-axis-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { name: '蒸发量', data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7] },
      { name: '降水量', data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7], smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 标记线折线图 ==============
export function initLineWithMarklineChart(): void {
  const container = document.getElementById('line-markline-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { name: '数据', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true },
    ],
  })
  registerChart(chart)
}

// ============== 排名变化图 (Bump Chart) ==============
export function initBumpChart(): void {
  const container = document.getElementById('bump-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['2019', '2020', '2021', '2022', '2023'] },
    series: [
      { name: 'Apple', data: [1, 1, 2, 1, 1], smooth: true, symbolSize: 8 },
      { name: 'Samsung', data: [2, 2, 1, 2, 3], smooth: true, symbolSize: 8 },
      { name: 'Huawei', data: [3, 3, 3, 4, 2], smooth: true, symbolSize: 8 },
      { name: 'Xiaomi', data: [4, 4, 4, 3, 4], smooth: true, symbolSize: 8 },
    ],
  })
  registerChart(chart)
}

// ============== 正负区域图 ==============
export function initNegativeAreaChart(): void {
  const container = document.getElementById('negative-area-chart')
  if (!container) return

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    series: [
      { name: '利润', data: [10, 20, -15, 25, -10, 30, 15, -5, 20, 35, -20, 40], areaStyle: true },
    ],
  })
  registerChart(chart)
}

// ============== 大数据量折线图 ==============
export function initLargeScaleLineChart(): void {
  const container = document.getElementById('large-scale-line-chart')
  if (!container) return

  // 生成大量数据点
  const data: number[] = []
  const labels: string[] = []
  for (let i = 0; i < 200; i++) {
    data.push(Math.sin(i / 10) * 50 + Math.random() * 20 + 100)
    labels.push(String(i))
  }

  const chart = new LineChart(container, {
    renderer: getRendererMode(),
    xAxis: {
      data: labels,
      interval: 'auto',
    },
    series: [
      { name: '数据', data, showSymbol: false, smooth: true },
    ],
    markLine: {
      data: [{ type: 'average' }, { type: 'max' }, { type: 'min' }]
    }
  })
  registerChart(chart)
}

// 导出 LineChart 类供外部使用（从 core 包重导出）
export { LineChart } from '@ldesign/chart-core'
export type { LineChartOptions, LineSeriesData } from '@ldesign/chart-core'
