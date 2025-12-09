/**
 * 柱状图模块 - 使用统一的 Chart 类
 */

import { Chart } from '@ldesign/chart-core'
import { getRendererMode } from '../../main'

let chartInstances: Chart[] = []

function getCommonOptions() {
  return { renderer: getRendererMode() }
}

function registerChart(chart: Chart): void {
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
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [{ type: 'bar', name: '销量', data: [120, 200, 150, 80, 70, 110, 130] }],
  })
  registerChart(chart)
}

export function initStackedBarChart(): void {
  const container = document.getElementById('stacked-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    series: [
      { type: 'bar', name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total' },
      { type: 'bar', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total' },
      { type: 'bar', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total' },
    ],
  })
  registerChart(chart)
}

export function initGroupedBarChart(): void {
  const container = document.getElementById('grouped-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['巴西', '印尼', '美国', '印度', '中国'] },
    series: [
      { type: 'bar', name: '2011年', data: [18203, 23489, 29034, 104970, 131744] },
      { type: 'bar', name: '2012年', data: [19325, 23438, 31000, 121594, 134141] },
    ],
  })
  registerChart(chart)
}

export function initHorizontalBarChart(): void {
  const container = document.getElementById('horizontal-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    horizontal: true,
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五'] },
    series: [{ type: 'bar', name: '数据', data: [120, 200, 150, 80, 70] }],
  })
  registerChart(chart)
}

export function initNegativeBarChart(): void {
  const container = document.getElementById('negative-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [{ type: 'bar', name: '利润', data: [200, -100, 150, -80, 120, -50] }],
  })
  registerChart(chart)
}

export function initWaterfallChart(): void {
  const container = document.getElementById('waterfall-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['总收入', '成本', '毛利', '运营费', '净利润'] },
    series: [{ type: 'bar', name: '金额', data: [900, -400, 500, -300, 200] }],
  })
  registerChart(chart)
}

export function initGradientBarChart(): void {
  const container = document.getElementById('gradient-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [{ type: 'bar', name: '数据', data: [120, 200, 150, 80, 70, 110, 130], borderRadius: 8 }],
  })
  registerChart(chart)
}

export function initPolarBarChart(): void {
  const container = document.getElementById('polar-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F'] },
    series: [{ type: 'bar', name: '数据', data: [43, 83, 66, 53, 90, 72] }],
  })
  registerChart(chart)
}

// ============== 排行榜柱状图 ==============
export function initRankingBarChart(): void {
  const container = document.getElementById('ranking-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    horizontal: true,
    xAxis: { data: ['产品A', '产品B', '产品C', '产品D', '产品E'] },
    series: [{ type: 'bar', name: '销量', data: [580, 420, 350, 280, 210] }],
  })
  registerChart(chart)
}

// ============== 百分比堆叠柱状图 ==============
export function initPercentStackBarChart(): void {
  const container = document.getElementById('percent-stack-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: '线上', data: [40, 45, 50, 55], stack: 'total' },
      { type: 'bar', name: '线下', data: [35, 30, 28, 25], stack: 'total' },
      { type: 'bar', name: '其他', data: [25, 25, 22, 20], stack: 'total' },
    ],
  })
  registerChart(chart)
}

// ============== 双向柱状图（人口金字塔）==============
export function initBidirectionalBarChart(): void {
  const container = document.getElementById('bidirectional-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['0-9', '10-19', '20-29', '30-39', '40-49', '50+'] },
    series: [
      { type: 'bar', name: '男性', data: [-50, -80, -120, -100, -70, -40] },
      { type: 'bar', name: '女性', data: [48, 75, 115, 95, 68, 45] },
    ],
  })
  registerChart(chart)
}

// ============== 多系列对比柱状图 ==============
export function initMultiSeriesBarChart(): void {
  const container = document.getElementById('multi-series-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [
      { type: 'bar', name: '华东', data: [320, 380, 420, 450, 480, 520] },
      { type: 'bar', name: '华南', data: [280, 320, 350, 380, 400, 430] },
      { type: 'bar', name: '华北', data: [220, 260, 300, 320, 350, 380] },
    ],
  })
  registerChart(chart)
}

// ============== 销售业绩柱状图 ==============
export function initSalesBarChart(): void {
  const container = document.getElementById('sales-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['张三', '李四', '王五', '赵六', '钱七'] },
    series: [{ type: 'bar', name: '销售额', data: [186, 152, 148, 135, 128], borderRadius: 4 }],
  })
  registerChart(chart)
}

// ============== 预算对比柱状图 ==============
export function initBudgetBarChart(): void {
  const container = document.getElementById('budget-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['研发', '市场', '销售', '运营', '行政'] },
    series: [
      { type: 'bar', name: '预算', data: [200, 150, 180, 120, 80] },
      { type: 'bar', name: '实际', data: [180, 165, 170, 125, 75] },
    ],
  })
  registerChart(chart)
}

// ============== 同比增长柱状图 ==============
export function initYoYGrowthBarChart(): void {
  const container = document.getElementById('yoy-growth-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: '去年', data: [420, 480, 520, 580] },
      { type: 'bar', name: '今年', data: [480, 550, 610, 680] },
    ],
  })
  registerChart(chart)
}

// ============== 直方图 ==============
export function initHistogramChart(): void {
  const container = document.getElementById('histogram-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['0-20', '20-40', '40-60', '60-80', '80-100'] },
    series: [{ type: 'bar', name: '频次', data: [5, 18, 35, 28, 14] }],
  })
  registerChart(chart)
}

// ============== 带背景柱状图 ==============
export function initBackgroundBarChart(): void {
  const container = document.getElementById('background-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['周一', '周二', '周三', '周四', '周五'] },
    series: [{ type: 'bar', name: '完成度', data: [60, 80, 70, 90, 85], borderRadius: 4 }],
  })
  registerChart(chart)
}

// ============== 区间柱状图 ==============
export function initRangeBarChart(): void {
  const container = document.getElementById('range-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    horizontal: true,
    xAxis: { data: ['任务A', '任务B', '任务C', '任务D'] },
    series: [{ type: 'bar', name: '持续时间', data: [3, 5, 2, 4] }],
  })
  registerChart(chart)
}

// ============== 月度数据柱状图 ==============
export function initMonthlyBarChart(): void {
  const container = document.getElementById('monthly-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    series: [{ type: 'bar', name: '销量', data: [62, 58, 72, 85, 92, 88, 95, 102, 98, 85, 78, 110], borderRadius: 2 }],
  })
  registerChart(chart)
}

// ============== 分类对比柱状图 ==============
export function initCategoryBarChart(): void {
  const container = document.getElementById('category-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['食品', '服装', '电子', '家居', '美妆'] },
    series: [
      { type: 'bar', name: '线上', data: [420, 350, 580, 280, 320] },
      { type: 'bar', name: '线下', data: [380, 420, 320, 350, 280] },
    ],
  })
  registerChart(chart)
}

// ============== 目标完成柱状图 ==============
export function initGoalBarChart(): void {
  const container = document.getElementById('goal-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['团队A', '团队B', '团队C', '团队D'] },
    series: [
      { type: 'bar', name: '目标', data: [100, 100, 100, 100] },
      { type: 'bar', name: '完成', data: [95, 108, 88, 102] },
    ],
  })
  registerChart(chart)
}

// ============== 环比变化柱状图 ==============
export function initMoMChangeBarChart(): void {
  const container = document.getElementById('mom-change-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    series: [{ type: 'bar', name: '环比变化%', data: [5.2, -3.1, 8.5, 2.3, -1.8, 6.7] }],
  })
  registerChart(chart)
}

// ============== 利润分析柱状图 ==============
export function initProfitBarChart(): void {
  const container = document.getElementById('profit-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['产品A', '产品B', '产品C', '产品D', '产品E'] },
    series: [
      { type: 'bar', name: '收入', data: [500, 420, 380, 320, 280], stack: 'total' },
      { type: 'bar', name: '成本', data: [-300, -280, -250, -220, -200], stack: 'total' },
    ],
  })
  registerChart(chart)
}

// ============== 年度趋势柱状图 ==============
export function initYearlyTrendBarChart(): void {
  const container = document.getElementById('yearly-trend-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['2019', '2020', '2021', '2022', '2023', '2024'] },
    series: [{ type: 'bar', name: '营收', data: [420, 380, 520, 680, 850, 1020], borderRadius: 4 }],
  })
  registerChart(chart)
}

// ============== 用户分布柱状图 ==============
export function initUserDistBarChart(): void {
  const container = document.getElementById('user-dist-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    xAxis: { data: ['18-24', '25-34', '35-44', '45-54', '55+'] },
    series: [
      { type: 'bar', name: '男', data: [1200, 2800, 2200, 1500, 800] },
      { type: 'bar', name: '女', data: [1400, 3200, 2000, 1200, 600] },
    ],
  })
  registerChart(chart)
}

// ============== 订单状态柱状图 ==============
export function initOrderStatusBarChart(): void {
  const container = document.getElementById('order-status-bar-chart')
  if (!container) return
  const chart = new Chart(container, {
    ...getCommonOptions(),
    horizontal: true,
    xAxis: { data: ['待支付', '待发货', '运输中', '已完成', '已取消'] },
    series: [{ type: 'bar', name: '订单数', data: [45, 120, 85, 580, 32] }],
  })
  registerChart(chart)
}

// 导出 Chart 类
export { Chart } from '@ldesign/chart-core'
export type { ChartOptions, SeriesData } from '@ldesign/chart-core'