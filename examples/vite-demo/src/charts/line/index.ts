/**
 * 折线图模块 - 使用统一的 Chart 类
 */

import { Chart, type ChartOptions } from '@ldesign/chart-core'
import { getRendererMode, getChartAnimationType } from '../../main'

// 保存所有图表实例，使用 Map 以便按 ID 查找和销毁
const chartInstancesMap = new Map<string, Chart>()

// 创建折线图的通用函数
function createLineChart(chartId: string, options: Omit<ChartOptions, 'renderer' | 'animationType'>): Chart | null {
  const container = document.getElementById(chartId)
  if (!container) return null

  // 先销毁旧实例
  const oldChart = chartInstancesMap.get(chartId)
  if (oldChart) {
    oldChart.dispose()
  }

  const chart = new Chart(container, {
    ...options,
    renderer: getRendererMode(),
    animationType: getChartAnimationType(chartId),
  })

  chartInstancesMap.set(chartId, chart)
  return chart
}

// 注册图表实例（从容器 ID 自动获取）
function registerChart(chart: Chart, container: HTMLElement): void {
  const chartId = container.id
  if (!chartId) return

  // 先销毁旧实例
  const oldChart = chartInstancesMap.get(chartId)
  if (oldChart) {
    oldChart.dispose()
  }
  chartInstancesMap.set(chartId, chart)
}

// 刷新所有图表（主题切换时调用）
export function refreshAllLineCharts(theme: 'light' | 'dark'): void {
  chartInstancesMap.forEach(chart => chart.setTheme(theme))
}

// 销毁所有图表实例
export function disposeAllLineCharts(): void {
  chartInstancesMap.forEach(chart => chart.dispose())
  chartInstancesMap.clear()
}

// ============== 基础折线图 ==============
export function initLineChart(): void {
  createLineChart('line-chart', {
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { type: 'line', name: '销售额', data: [150, 230, 224, 218, 135, 147, 260] },
      { type: 'line', name: '利润', data: [80, 120, 160, 140, 180, 200, 190] },
    ],
  })
}

// ============== 平滑折线图 ==============
export function initSmoothLineChart(): void {
  const container = document.getElementById('smooth-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { type: 'line', name: '2023', data: [820, 932, 901, 934, 1290, 1330], smooth: true },
      { type: 'line', name: '2024', data: [620, 732, 1101, 1134, 1190, 1530], smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 虚线折线图（实际值+预测值）==============
export function initDashedLineChart(): void {
  const container = document.getElementById('dashed-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'] },
    series: [
      { type: 'line', name: '实际', data: [120, 132, 101, 134, 150, null, null, null] },
      { type: 'line', name: '预测', data: [null, null, null, null, 150, 180, 165, 200], lineStyle: { type: 'dashed' } },
    ],
  })
  registerChart(chart, container)
}

// ============== 空值折线图 ==============
export function initNullLineChart(): void {
  const container = document.getElementById('null-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    series: [
      { type: 'line', name: '数据', data: [120, 132, null, 134, 90, null, 210], connectNulls: false },
    ],
  })
  registerChart(chart, container)
}

// ============== 多样式折线图 ==============
export function initMultiStyleLineChart(): void {
  const container = document.getElementById('multi-style-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { type: 'line', name: '实线', data: [120, 200, 150, 80, 70, 110, 130], lineStyle: { type: 'solid' } },
      { type: 'line', name: '虚线', data: [60, 100, 80, 120, 90, 140, 100], lineStyle: { type: 'dashed' } },
      { type: 'line', name: '点线', data: [30, 50, 40, 60, 45, 70, 55], lineStyle: { type: 'dotted' } },
    ],
  })
  registerChart(chart, container)
}

// ============== 自定义点样式 ==============
export function initCustomSymbolLineChart(): void {
  const container = document.getElementById('custom-symbol-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F'] },
    series: [
      { type: 'line', name: '圆形', data: [120, 200, 150, 80, 70, 110], symbol: 'circle', symbolSize: 6 },
      { type: 'line', name: '方形', data: [80, 150, 100, 120, 90, 140], symbol: 'rect', symbolSize: 5 },
      { type: 'line', name: '三角', data: [40, 80, 60, 100, 50, 90], symbol: 'triangle', symbolSize: 6 },
    ],
  })
  registerChart(chart, container)
}

// ============== 阶梯折线图 ==============
export function initStepLineChart(): void {
  const container = document.getElementById('step-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1', '2', '3', '4', '5', '6', '7'] },
    series: [
      { type: 'line', name: 'Start', data: [120, 132, 101, 134, 90, 230, 210], step: 'start' },
      { type: 'line', name: 'Middle', data: [220, 182, 191, 234, 290, 330, 310], step: 'middle' },
      { type: 'line', name: 'End', data: [450, 432, 401, 454, 590, 530, 510], step: 'end' },
    ],
  })
  registerChart(chart, container)
}

// ============== 堆叠折线图 ==============
export function initStackedLineChart(): void {
  const container = document.getElementById('stacked-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { type: 'line', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total' },
      { type: 'line', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total' },
      { type: 'line', name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410], stack: 'total' },
    ],
  })
  registerChart(chart, container)
}

// ============== 堆叠面积图 ==============
export function initStackedAreaChart(): void {
  const container = document.getElementById('stacked-area-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'line', name: '产品A', data: [140, 232, 101, 264], areaStyle: { opacity: 0.6 }, smooth: true, stack: 'total' },
      { type: 'line', name: '产品B', data: [120, 282, 111, 234], areaStyle: { opacity: 0.6 }, smooth: true, stack: 'total' },
      { type: 'line', name: '产品C', data: [320, 132, 201, 334], areaStyle: { opacity: 0.6 }, smooth: true, stack: 'total' },
    ],
  })
  registerChart(chart, container)
}

// ============== 渐变面积图 ==============
export function initGradientAreaChart(): void {
  const container = document.getElementById('gradient-area-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { type: 'line', name: '数据', data: [820, 932, 901, 934, 1290, 1330, 1320], areaStyle: { opacity: 0.4 }, smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 置信区间图 ==============
export function initConfidenceBandChart(): void {
  const container = document.getElementById('confidence-band-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { type: 'line', name: '上界', data: [120, 150, 140, 160, 180, 200], areaStyle: { opacity: 0.2 }, lineStyle: { type: 'dashed' } },
      { type: 'line', name: '均值', data: [100, 120, 110, 130, 150, 170], smooth: true },
      { type: 'line', name: '下界', data: [80, 90, 80, 100, 120, 140], areaStyle: { opacity: 0.2 }, lineStyle: { type: 'dashed' } },
    ],
  })
  registerChart(chart, container)
}

// ============== 双Y轴折线图 ==============
export function initDualAxisChart(): void {
  const container = document.getElementById('dual-axis-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { type: 'line', name: '蒸发量', data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7] },
      { type: 'line', name: '降水量', data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7], smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 标记线折线图 ==============
export function initLineWithMarklineChart(): void {
  const container = document.getElementById('line-markline-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { type: 'line', name: '数据', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 排名变化图 (Bump Chart) ==============
export function initBumpChart(): void {
  const container = document.getElementById('bump-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['2019', '2020', '2021', '2022', '2023'] },
    series: [
      { type: 'line', name: 'Apple', data: [1, 1, 2, 1, 1], smooth: true, symbolSize: 8 },
      { type: 'line', name: 'Samsung', data: [2, 2, 1, 2, 3], smooth: true, symbolSize: 8 },
      { type: 'line', name: 'Huawei', data: [3, 3, 3, 4, 2], smooth: true, symbolSize: 8 },
      { type: 'line', name: 'Xiaomi', data: [4, 4, 4, 3, 4], smooth: true, symbolSize: 8 },
    ],
  })
  registerChart(chart, container)
}

// ============== 正负区域图 ==============
export function initNegativeAreaChart(): void {
  const container = document.getElementById('negative-area-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    series: [
      { type: 'line', name: '利润', data: [10, 20, -15, 25, -10, 30, 15, -5, 20, 35, -20, 40], areaStyle: true },
    ],
  })
  registerChart(chart, container)
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

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: {
      data: labels,
      interval: 'auto',
    },
    series: [
      { type: 'line', name: '数据', data, showSymbol: false, smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 温度变化折线图（实用场景）==============
export function initTemperatureChart(): void {
  const container = document.getElementById('temperature-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'] },
    series: [
      { type: 'line', name: '最高温', data: [18, 16, 22, 32, 30, 24, 19], color: '#ef4444', smooth: true },
      { type: 'line', name: '最低温', data: [12, 10, 14, 22, 20, 16, 13], color: '#3b82f6', smooth: true },
      { type: 'line', name: '平均温', data: [15, 13, 18, 27, 25, 20, 16], color: '#10b981', smooth: true, lineStyle: { type: 'dashed' } },
    ],
  })
  registerChart(chart, container)
}

// ============== 多系列对比折线图 ==============
export function initComparisonChart(): void {
  const container = document.getElementById('comparison-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { type: 'line', name: '本周', data: [320, 332, 301, 334, 390, 450, 420], color: '#6366f1' },
      { type: 'line', name: '上周', data: [220, 182, 191, 234, 290, 330, 310], color: '#94a3b8', lineStyle: { type: 'dashed' } },
      { type: 'line', name: '目标', data: [300, 300, 300, 300, 300, 300, 300], color: '#f59e0b', lineStyle: { type: 'dotted' }, showSymbol: false },
    ],
  })
  registerChart(chart, container)
}

// ============== 实时数据折线图（带动画）==============
export function initRealtimeChart(): void {
  const container = document.getElementById('realtime-chart')
  if (!container) return

  // 初始数据
  const initialData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 50)
  const labels = Array.from({ length: 20 }, (_, i) => `${i}s`)

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: labels },
    series: [
      { type: 'line', name: 'CPU', data: initialData, color: '#6366f1', smooth: true, showSymbol: false, areaStyle: { opacity: 0.2 } },
    ],
    animation: { enabled: true, entryDuration: 300 },
  })
  registerChart(chart, container)
}

// ============== 多区间折线图（不同时间段）==============
export function initMultiRangeChart(): void {
  const container = document.getElementById('multi-range-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'line', name: '2022', data: [200, 280, 250, 320], symbolSize: 6 },
      { type: 'line', name: '2023', data: [250, 350, 400, 450], symbolSize: 6 },
      { type: 'line', name: '2024', data: [300, 420, 380, null], symbolSize: 6 },
    ],
  })
  registerChart(chart, container)
}

// ============== 带标记点的折线图 ==============
export function initMarkedLineChart(): void {
  const container = document.getElementById('marked-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { type: 'line', name: '访问量', data: [820, 932, 901, 1234, 1290, 1330, 1420], smooth: true, symbolSize: 8 },
    ],
  })
  registerChart(chart, container)
}

// ============== 百分比折线图 ==============
export function initPercentageChart(): void {
  const container = document.getElementById('percentage-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [
      { type: 'line', name: '完成率', data: [65, 72, 68, 85, 92, 88], color: '#10b981', areaStyle: { opacity: 0.3 }, smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 股票走势图 ==============
export function initStockTrendChart(): void {
  const container = document.getElementById('stock-trend-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00'] },
    series: [
      { type: 'line', name: '股价', data: [100, 102.5, 101.8, 103.2, 104.5, 103.8, 105.2, 104.6, 106.1, 105.8], color: '#ef4444', showSymbol: false, areaStyle: { opacity: 0.1 } },
    ],
  })
  registerChart(chart, container)
}

// ============== 网站流量图 ==============
export function initTrafficChart(): void {
  const container = document.getElementById('traffic-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] },
    series: [
      { type: 'line', name: 'PV', data: [1200, 800, 600, 2500, 3200, 2800, 4500, 3800], color: '#6366f1', smooth: true },
      { type: 'line', name: 'UV', data: [400, 280, 200, 850, 1100, 950, 1500, 1280], color: '#10b981', smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 销售趋势图 ==============
export function initSalesTrendChart(): void {
  const container = document.getElementById('sales-trend-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    series: [
      { type: 'line', name: '销售额', data: [45, 52, 48, 65, 72, 68, 85, 92, 88, 95, 110, 125], color: '#f59e0b', smooth: true, areaStyle: { opacity: 0.2 } },
    ],
  })
  registerChart(chart, container)
}

// ============== 预算vs实际对比图 ==============
export function initBudgetActualChart(): void {
  const container = document.getElementById('budget-actual-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'line', name: '预算', data: [100, 120, 140, 160], color: '#94a3b8', lineStyle: { type: 'dashed' }, symbolSize: 6 },
      { type: 'line', name: '实际', data: [95, 135, 125, 175], color: '#6366f1', symbolSize: 6 },
    ],
  })
  registerChart(chart, container)
}

// ============== 用户增长图 ==============
export function initUserGrowthChart(): void {
  const container = document.getElementById('user-growth-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [
      { type: 'line', name: '新增用户', data: [1200, 1800, 2400, 3200, 4500, 6000], color: '#10b981', smooth: true, areaStyle: { opacity: 0.3 } },
      { type: 'line', name: '活跃用户', data: [800, 1400, 2000, 2800, 3800, 5200], color: '#6366f1', smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 环比增长图 ==============
export function initMoMGrowthChart(): void {
  const container = document.getElementById('mom-growth-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [
      { type: 'line', name: '环比增长率', data: [5, 12, -3, 8, 15, -2], color: '#6366f1', symbolSize: 6 },
    ],
  })
  registerChart(chart, container)
}

// ============== 多指标监控图 ==============
export function initMultiMetricChart(): void {
  const container = document.getElementById('multi-metric-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { type: 'line', name: 'CPU', data: [45, 52, 48, 70, 65, 40, 38], color: '#ef4444', smooth: true },
      { type: 'line', name: '内存', data: [62, 65, 68, 72, 70, 58, 55], color: '#f59e0b', smooth: true },
      { type: 'line', name: '磁盘', data: [35, 36, 37, 38, 39, 40, 41], color: '#10b981', smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 周期性数据图 ==============
export function initCyclicDataChart(): void {
  const container = document.getElementById('cyclic-data-chart')
  if (!container) return

  // 生成周期性数据
  const labels: string[] = []
  const data: number[] = []
  for (let i = 0; i < 24; i++) {
    labels.push(`${i}:00`)
    data.push(Math.sin(i / 24 * Math.PI * 2) * 30 + 50 + Math.random() * 10)
  }

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: labels, interval: 'auto' },
    series: [
      { type: 'line', name: '活跃度', data, color: '#8b5cf6', smooth: true, showSymbol: false },
    ],
  })
  registerChart(chart, container)
}

// ============== 目标达成图 ==============
export function initGoalProgressChart(): void {
  const container = document.getElementById('goal-progress-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] },
    series: [
      { type: 'line', name: '目标', data: [100, 100, 100, 100, 100, 100, 100, 100], color: '#94a3b8', lineStyle: { type: 'dotted' }, showSymbol: false },
      { type: 'line', name: '实际', data: [65, 78, 82, 95, 88, 102, 110, 115], color: '#10b981', smooth: true, symbolSize: 6 },
    ],
  })
  registerChart(chart, container)
}

// ============== 季节性趋势图 ==============
export function initSeasonalTrendChart(): void {
  const container = document.getElementById('seasonal-trend-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    series: [
      { type: 'line', name: '2023', data: [30, 35, 55, 70, 85, 95, 100, 98, 80, 60, 45, 35], color: '#94a3b8', lineStyle: { type: 'dashed' } },
      { type: 'line', name: '2024', data: [35, 40, 60, 75, 90, 100, null, null, null, null, null, null], color: '#6366f1' },
    ],
  })
  registerChart(chart, container)
}

// ============== 转化漏斗折线图 ==============
export function initConversionLineChart(): void {
  const container = document.getElementById('conversion-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['访问', '浏览', '加购', '下单', '支付'] },
    series: [
      { type: 'line', name: '转化率', data: [100, 68, 42, 28, 22], color: '#6366f1', smooth: true, areaStyle: { opacity: 0.3 }, symbolSize: 8 },
    ],
  })
  registerChart(chart, container)
}

// ============== 对数增长图 ==============
export function initLogGrowthChart(): void {
  const container = document.getElementById('log-growth-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'] },
    series: [
      { type: 'line', name: '用户数(万)', data: [1, 5, 25, 100, 350, 800, 1500], color: '#10b981', smooth: true, areaStyle: { opacity: 0.2 } },
    ],
  })
  registerChart(chart, container)
}

// ============== 波动范围图 ==============
export function initVolatilityChart(): void {
  const container = document.getElementById('volatility-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    series: [
      { type: 'line', name: '最高', data: [125, 132, 128, 140, 135], color: '#ef4444', lineStyle: { type: 'dashed' } },
      { type: 'line', name: '收盘', data: [118, 125, 122, 132, 128], color: '#6366f1', symbolSize: 6 },
      { type: 'line', name: '最低', data: [112, 118, 115, 125, 120], color: '#10b981', lineStyle: { type: 'dashed' } },
    ],
  })
  registerChart(chart, container)
}

// ============== 分时走势图 ==============
export function initIntradayChart(): void {
  const container = document.getElementById('intraday-chart')
  if (!container) return

  // 生成分时数据
  const labels: string[] = []
  const priceData: number[] = []
  const avgData: number[] = []
  let price = 100
  let total = 0

  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 4) + 9
    const min = (i % 4) * 15
    labels.push(`${hour}:${min.toString().padStart(2, '0')}`)
    price += (Math.random() - 0.48) * 2
    priceData.push(Math.round(price * 100) / 100)
    total += price
    avgData.push(Math.round(total / (i + 1) * 100) / 100)
  }

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: labels, interval: 'auto' },
    series: [
      { type: 'line', name: '价格', data: priceData, color: '#6366f1', showSymbol: false },
      { type: 'line', name: '均价', data: avgData, color: '#f59e0b', showSymbol: false, lineStyle: { type: 'dashed' } },
    ],
  })
  registerChart(chart, container)
}

// ============== 能耗监控图 ==============
export function initEnergyChart(): void {
  const container = document.getElementById('energy-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    series: [
      { type: 'line', name: '用电量', data: [320, 280, 260, 240, 280, 420, 520, 540, 380, 280, 300, 350], color: '#f59e0b', areaStyle: { opacity: 0.3 } },
    ],
  })
  registerChart(chart, container)
}

// ============== 多区域对比图 ==============
export function initRegionCompareChart(): void {
  const container = document.getElementById('region-compare-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'line', name: '华东', data: [320, 380, 420, 480], color: '#6366f1', symbolSize: 6 },
      { type: 'line', name: '华南', data: [280, 320, 360, 400], color: '#10b981', symbolSize: 6 },
      { type: 'line', name: '华北', data: [240, 280, 300, 340], color: '#f59e0b', symbolSize: 6 },
      { type: 'line', name: '西部', data: [180, 220, 260, 300], color: '#8b5cf6', symbolSize: 6 },
    ],
  })
  registerChart(chart, container)
}

// ============== 预测区间图 ==============
export function initForecastChart(): void {
  const container = document.getElementById('forecast-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'] },
    series: [
      { type: 'line', name: '上界', data: [null, null, null, null, 160, 175, 185, 200], color: '#6366f1', lineStyle: { type: 'dotted' }, areaStyle: { opacity: 0.1 } },
      { type: 'line', name: '预测', data: [null, null, null, null, 150, 162, 170, 180], color: '#6366f1', lineStyle: { type: 'dashed' } },
      { type: 'line', name: '下界', data: [null, null, null, null, 140, 150, 155, 160], color: '#6366f1', lineStyle: { type: 'dotted' } },
      { type: 'line', name: '实际', data: [120, 135, 128, 145, null, null, null, null], color: '#10b981' },
    ],
  })
  registerChart(chart, container)
}

// ============== 健康指标图 ==============
export function initHealthMetricChart(): void {
  const container = document.getElementById('health-metric-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { type: 'line', name: '步数(千)', data: [8.2, 6.5, 10.2, 7.8, 5.5, 12.5, 15.2], color: '#10b981', symbolSize: 6 },
      { type: 'line', name: '目标', data: [10, 10, 10, 10, 10, 10, 10], color: '#94a3b8', lineStyle: { type: 'dotted' }, showSymbol: false },
    ],
  })
  registerChart(chart, container)
}

// ============== 竞品对比图 ==============
export function initCompetitorChart(): void {
  const container = document.getElementById('competitor-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [
      { type: 'line', name: '我们', data: [28, 32, 35, 42, 48, 55], color: '#6366f1', smooth: true, symbolSize: 6 },
      { type: 'line', name: '竞品A', data: [35, 36, 38, 40, 42, 45], color: '#ef4444', smooth: true, lineStyle: { type: 'dashed' } },
      { type: 'line', name: '竞品B', data: [25, 28, 30, 32, 35, 38], color: '#f59e0b', smooth: true, lineStyle: { type: 'dashed' } },
    ],
  })
  registerChart(chart, container)
}

// ============== 展开动画折线图 ==============
export function initExpandAnimationChart(): void {
  const container = document.getElementById('expand-animation-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    animationType: 'expand', // 从左到右展开动画
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { type: 'line', name: '数据', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true, areaStyle: { opacity: 0.3 } },
    ],
  })
  registerChart(chart, container)
}

// ============== 生长动画折线图 ==============
export function initGrowAnimationChart(): void {
  const container = document.getElementById('grow-animation-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    animationType: 'grow', // 点依次出现动画
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'line', name: '销售', data: [150, 280, 220, 350], smooth: true },
      { type: 'line', name: '利润', data: [80, 150, 120, 200], smooth: true },
    ],
  })
  registerChart(chart, container)
}

// ============== 水平折线图 ==============
export function initHorizontalLineChart(): void {
  const container = document.getElementById('horizontal-line-chart')
  if (!container) return

  const chart = new Chart(container, {
    renderer: getRendererMode(),
    horizontal: true, // X轴显示值，Y轴显示类目
    xAxis: {},
    yAxis: {},
    series: [
      { type: 'line', name: '得分', data: [85, 92, 78, 95, 88], color: '#6366f1' },
    ],
  })
  // 手动设置 X 轴数据（类目会显示在 Y 轴）
  chart.setOption({
    xAxis: { data: ['语文', '数学', '英语', '物理', '化学'] },
  })
  registerChart(chart, container)
}

// 导出 Chart 类供外部使用
export { Chart } from '@ldesign/chart-core'
export type { ChartOptions, SeriesData, AnimationType } from '@ldesign/chart-core'
