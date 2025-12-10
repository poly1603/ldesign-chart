/**
 * 柱状图模块 - 使用统一的 Chart 类
 */

import { Chart, type ChartOptions } from '@ldesign/chart-core'
import { getRendererMode, getChartAnimationType } from '../../main'

const chartInstancesMap = new Map<string, Chart>()

function createBarChart(chartId: string, options: Omit<ChartOptions, 'renderer' | 'animationType'>): Chart | null {
  const container = document.getElementById(chartId)
  if (!container) return null
  const oldChart = chartInstancesMap.get(chartId)
  if (oldChart) oldChart.dispose()
  const chart = new Chart(container, {
    ...options,
    renderer: getRendererMode(),
    animationType: getChartAnimationType(chartId),
  })
  chartInstancesMap.set(chartId, chart)
  return chart
}

export function refreshAllBarCharts(theme: 'light' | 'dark'): void {
  chartInstancesMap.forEach(chart => chart.setTheme(theme))
}

export function disposeAllBarCharts(): void {
  chartInstancesMap.forEach(chart => chart.dispose())
  chartInstancesMap.clear()
}

export function initBarChart(): void {
  createBarChart('bar-chart', {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [{ type: 'bar', name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] }],
  })
}

export function initStackedBarChart(): void {
  createBarChart('stacked-bar-chart', {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [
      { type: 'bar', name: 'Direct', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total' },
      { type: 'bar', name: 'Email', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total' },
      { type: 'bar', name: 'Ads', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total' },
    ],
  })
}

export function initGroupedBarChart(): void {
  createBarChart('grouped-bar-chart', {
    xAxis: { data: ['Brazil', 'Indonesia', 'USA', 'India', 'China'] },
    series: [
      { type: 'bar', name: '2011', data: [18203, 23489, 29034, 104970, 131744] },
      { type: 'bar', name: '2012', data: [19325, 23438, 31000, 121594, 134141] },
    ],
  })
}

export function initHorizontalBarChart(): void {
  createBarChart('horizontal-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    series: [{ type: 'bar', name: 'Data', data: [120, 200, 150, 80, 70] }],
  })
}

export function initNegativeBarChart(): void {
  createBarChart('negative-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [{ type: 'bar', name: 'Profit', data: [200, -100, 150, -80, 120, -50] }],
  })
}

export function initWaterfallChart(): void {
  createBarChart('waterfall-chart', {
    xAxis: { data: ['Revenue', 'Cost', 'Gross', 'OpEx', 'Net'] },
    series: [{ type: 'bar', name: 'Amount', data: [900, -400, 500, -300, 200] }],
  })
}

export function initGradientBarChart(): void {
  createBarChart('gradient-bar-chart', {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [{ type: 'bar', name: 'Data', data: [120, 200, 150, 80, 70, 110, 130], borderRadius: 8 }],
  })
}

export function initPolarBarChart(): void {
  createBarChart('polar-bar-chart', {
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F'] },
    series: [{ type: 'bar', name: 'Data', data: [43, 83, 66, 53, 90, 72] }],
  })
}

export function initRankingBarChart(): void {
  createBarChart('ranking-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'] },
    series: [{ type: 'bar', name: 'Sales', data: [580, 420, 350, 280, 210] }],
  })
}

export function initPercentStackBarChart(): void {
  createBarChart('percent-stack-bar-chart', {
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: 'Online', data: [40, 45, 50, 55], stack: 'total' },
      { type: 'bar', name: 'Offline', data: [35, 30, 28, 25], stack: 'total' },
      { type: 'bar', name: 'Other', data: [25, 25, 22, 20], stack: 'total' },
    ],
  })
}

export function initBidirectionalBarChart(): void {
  createBarChart('bidirectional-bar-chart', {
    xAxis: { data: ['0-9', '10-19', '20-29', '30-39', '40-49', '50+'] },
    series: [
      { type: 'bar', name: 'Male', data: [-50, -80, -120, -100, -70, -40] },
      { type: 'bar', name: 'Female', data: [48, 75, 115, 95, 68, 45] },
    ],
  })
}

export function initMultiSeriesBarChart(): void {
  createBarChart('multi-series-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { type: 'bar', name: 'East', data: [320, 380, 420, 450, 480, 520] },
      { type: 'bar', name: 'South', data: [280, 320, 350, 380, 400, 430] },
      { type: 'bar', name: 'North', data: [220, 260, 300, 320, 350, 380] },
    ],
  })
}

export function initSalesBarChart(): void {
  createBarChart('sales-bar-chart', {
    xAxis: { data: ['Tom', 'Jerry', 'Mike', 'John', 'Lisa'] },
    series: [{ type: 'bar', name: 'Sales', data: [186, 152, 148, 135, 128], borderRadius: 4 }],
  })
}

export function initBudgetBarChart(): void {
  createBarChart('budget-bar-chart', {
    xAxis: { data: ['R&D', 'Marketing', 'Sales', 'Ops', 'Admin'] },
    series: [
      { type: 'bar', name: 'Budget', data: [200, 150, 180, 120, 80] },
      { type: 'bar', name: 'Actual', data: [180, 165, 170, 125, 75] },
    ],
  })
}

export function initYoYGrowthBarChart(): void {
  createBarChart('yoy-growth-bar-chart', {
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: 'Last Year', data: [420, 480, 520, 580] },
      { type: 'bar', name: 'This Year', data: [480, 550, 610, 680] },
    ],
  })
}

export function initHistogramChart(): void {
  createBarChart('histogram-chart', {
    xAxis: { data: ['0-20', '20-40', '40-60', '60-80', '80-100'] },
    series: [{ type: 'bar', name: 'Frequency', data: [5, 18, 35, 28, 14] }],
  })
}

export function initBackgroundBarChart(): void {
  createBarChart('background-bar-chart', {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    series: [{ type: 'bar', name: 'Progress', data: [60, 80, 70, 90, 85], borderRadius: 4 }],
  })
}

export function initRangeBarChart(): void {
  createBarChart('range-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Task A', 'Task B', 'Task C', 'Task D'] },
    series: [{ type: 'bar', name: 'Duration', data: [3, 5, 2, 4] }],
  })
}

export function initMonthlyBarChart(): void {
  createBarChart('monthly-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    series: [{ type: 'bar', name: 'Sales', data: [62, 58, 72, 85, 92, 88, 95, 102, 98, 85, 78, 110], borderRadius: 2 }],
  })
}

export function initCategoryBarChart(): void {
  createBarChart('category-bar-chart', {
    xAxis: { data: ['Food', 'Clothing', 'Electronics', 'Home', 'Beauty'] },
    series: [
      { type: 'bar', name: 'Online', data: [420, 350, 580, 280, 320] },
      { type: 'bar', name: 'Offline', data: [380, 420, 320, 350, 280] },
    ],
  })
}

export function initGoalBarChart(): void {
  createBarChart('goal-bar-chart', {
    xAxis: { data: ['Team A', 'Team B', 'Team C', 'Team D'] },
    series: [
      { type: 'bar', name: 'Target', data: [100, 100, 100, 100] },
      { type: 'bar', name: 'Actual', data: [95, 108, 88, 102] },
    ],
  })
}

export function initMoMChangeBarChart(): void {
  createBarChart('mom-change-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [{ type: 'bar', name: 'MoM %', data: [5.2, -3.1, 8.5, 2.3, -1.8, 6.7] }],
  })
}

export function initProfitBarChart(): void {
  createBarChart('profit-bar-chart', {
    xAxis: { data: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'] },
    series: [
      { type: 'bar', name: 'Revenue', data: [500, 420, 380, 320, 280], stack: 'total' },
      { type: 'bar', name: 'Cost', data: [-300, -280, -250, -220, -200], stack: 'total' },
    ],
  })
}

export function initYearlyTrendBarChart(): void {
  createBarChart('yearly-trend-bar-chart', {
    xAxis: { data: ['2019', '2020', '2021', '2022', '2023', '2024'] },
    series: [{ type: 'bar', name: 'Revenue', data: [420, 380, 520, 680, 850, 1020], borderRadius: 4 }],
  })
}

export function initUserDistBarChart(): void {
  createBarChart('user-dist-bar-chart', {
    xAxis: { data: ['18-24', '25-34', '35-44', '45-54', '55+'] },
    series: [
      { type: 'bar', name: 'Male', data: [1200, 2800, 2200, 1500, 800] },
      { type: 'bar', name: 'Female', data: [1400, 3200, 2000, 1200, 600] },
    ],
  })
}

export function initOrderStatusBarChart(): void {
  createBarChart('order-status-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled'] },
    series: [{ type: 'bar', name: 'Orders', data: [45, 120, 85, 580, 32] }],
  })
}

export function initExpandAnimationBarChart(): void {
  createBarChart('expand-animation-bar-chart', {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    series: [{ type: 'bar', name: 'Data', data: [120, 200, 150, 80, 70, 110, 130], borderRadius: 4 }],
  })
}

export function initGrowAnimationBarChart(): void {
  createBarChart('grow-animation-bar-chart', {
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: 'Sales', data: [150, 280, 220, 350] },
      { type: 'bar', name: 'Profit', data: [80, 150, 120, 200] },
    ],
  })
}

export function initFadeAnimationBarChart(): void {
  createBarChart('fade-animation-bar-chart', {
    xAxis: { data: ['A', 'B', 'C', 'D', 'E'] },
    series: [{ type: 'bar', name: 'Value', data: [85, 92, 78, 95, 88], borderRadius: 6 }],
  })
}

export function initLargeDataBarChart(): void {
  const labels: string[] = []
  const data: number[] = []
  for (let i = 0; i < 50; i++) {
    labels.push('D' + (i + 1))
    data.push(Math.floor(Math.random() * 100) + 20)
  }
  createBarChart('large-data-bar-chart', {
    xAxis: { data: labels, interval: 'auto' },
    series: [{ type: 'bar', name: 'Data', data, borderRadius: 2 }],
  })
}

export function initTemperatureBarChart(): void {
  createBarChart('temperature-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    series: [
      { type: 'bar', name: 'High', data: [8, 10, 15, 22, 28, 32, 35, 34, 28, 22, 15, 10], color: '#ef4444' },
      { type: 'bar', name: 'Low', data: [-2, 0, 5, 12, 18, 22, 25, 24, 18, 12, 5, 0], color: '#3b82f6' },
    ],
  })
}

export function initRatingBarChart(): void {
  createBarChart('rating-bar-chart', {
    horizontal: true,
    xAxis: { data: ['5 Star', '4 Star', '3 Star', '2 Star', '1 Star'] },
    series: [{ type: 'bar', name: 'Reviews', data: [1250, 820, 320, 85, 25], borderRadius: 4 }],
  })
}

export function initInventoryBarChart(): void {
  createBarChart('inventory-bar-chart', {
    xAxis: { data: ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'] },
    series: [
      { type: 'bar', name: 'In', data: [500, 420, 380, 320] },
      { type: 'bar', name: 'Out', data: [450, 480, 350, 280] },
      { type: 'bar', name: 'Stock', data: [50, -60, 30, 40] },
    ],
  })
}

export function initEnergyBarChart(): void {
  createBarChart('energy-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { type: 'bar', name: 'Electric', data: [320, 280, 260, 240, 280, 420], stack: 'energy' },
      { type: 'bar', name: 'Gas', data: [120, 100, 80, 60, 80, 150], stack: 'energy' },
      { type: 'bar', name: 'Water', data: [80, 70, 65, 60, 70, 90], stack: 'energy' },
    ],
  })
}

export function initProjectProgressBarChart(): void {
  createBarChart('project-progress-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Project A', 'Project B', 'Project C', 'Project D', 'Project E'] },
    series: [{ type: 'bar', name: 'Progress %', data: [95, 78, 62, 45, 30], borderRadius: 4 }],
  })
}

// ============== 水平堆叠柱状图 ==============
export function initHorizontalStackedBarChart(): void {
  createBarChart('horizontal-stacked-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: 'Product A', data: [120, 150, 180, 200], stack: 'total', color: '#3b82f6' },
      { type: 'bar', name: 'Product B', data: [80, 100, 120, 140], stack: 'total', color: '#10b981' },
      { type: 'bar', name: 'Product C', data: [60, 70, 80, 90], stack: 'total', color: '#f59e0b' },
    ],
  })
}

// ============== 人口金字塔（水平双向）==============
export function initPopulationPyramidChart(): void {
  createBarChart('population-pyramid-chart', {
    horizontal: true,
    xAxis: { data: ['0-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
    series: [
      { type: 'bar', name: 'Male', data: [-8, -12, -15, -14, -12, -10, -7], color: '#3b82f6' },
      { type: 'bar', name: 'Female', data: [7, 11, 14, 13, 11, 9, 8], color: '#ec4899' },
    ],
  })
}

// ============== 混合正负堆叠柱状图 ==============
export function initMixedStackBarChart(): void {
  createBarChart('mixed-stack-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { type: 'bar', name: 'Income', data: [500, 600, 550, 700, 650, 800], stack: 'total', color: '#10b981' },
      { type: 'bar', name: 'Expense', data: [-300, -350, -320, -400, -380, -450], stack: 'total', color: '#ef4444' },
    ],
  })
}

// ============== 对比柱状图（带负值）==============
export function initComparisonBarChart(): void {
  createBarChart('comparison-bar-chart', {
    xAxis: { data: ['Product A', 'Product B', 'Product C', 'Product D'] },
    series: [
      { type: 'bar', name: 'This Year', data: [120, 150, 80, 200], color: '#3b82f6' },
      { type: 'bar', name: 'Last Year', data: [100, 180, 90, 160], color: '#94a3b8' },
    ],
  })
}

// ============== 瀑布图（带累计）==============
export function initWaterfallDetailChart(): void {
  createBarChart('waterfall-detail-chart', {
    xAxis: { data: ['Start', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'End'] },
    series: [{ type: 'bar', name: 'Value', data: [1000, 200, -150, 300, -100, 250, 1500], borderRadius: 4 }],
  })
}

// ============== 分组堆叠柱状图 ==============
export function initGroupedStackBarChart(): void {
  createBarChart('grouped-stack-bar-chart', {
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: 'A-Online', data: [80, 90, 100, 110], stack: 'A', color: '#3b82f6' },
      { type: 'bar', name: 'A-Offline', data: [40, 50, 60, 70], stack: 'A', color: '#93c5fd' },
      { type: 'bar', name: 'B-Online', data: [60, 70, 80, 90], stack: 'B', color: '#10b981' },
      { type: 'bar', name: 'B-Offline', data: [30, 40, 50, 60], stack: 'B', color: '#6ee7b7' },
    ],
  })
}

// ============== 圆角柱状图 ==============
export function initRoundedBarChart(): void {
  createBarChart('rounded-bar-chart', {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    series: [{ type: 'bar', name: 'Sales', data: [150, 230, 180, 290, 200], borderRadius: 12, color: '#8b5cf6' }],
  })
}

// ============== 细柱状图 ==============
export function initThinBarChart(): void {
  createBarChart('thin-bar-chart', {
    xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] },
    series: [{ type: 'bar', name: 'Value', data: [30, 50, 80, 40, 60, 90, 70, 55, 45, 75], borderRadius: 2 }],
  })
}

// ============== 季度对比柱状图 ==============
export function initQuarterlyBarChart(): void {
  createBarChart('quarterly-bar-chart', {
    xAxis: { data: ['2021', '2022', '2023', '2024'] },
    series: [
      { type: 'bar', name: 'Q1', data: [200, 220, 250, 280], color: '#3b82f6' },
      { type: 'bar', name: 'Q2', data: [250, 270, 300, 330], color: '#10b981' },
      { type: 'bar', name: 'Q3', data: [230, 260, 290, 320], color: '#f59e0b' },
      { type: 'bar', name: 'Q4', data: [280, 310, 350, 400], color: '#ef4444' },
    ],
  })
}

// ============== 收支平衡柱状图 ==============
export function initBalanceBarChart(): void {
  createBarChart('balance-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [
      { type: 'bar', name: 'Balance', data: [200, -50, 150, -30, 100, 80], borderRadius: 4 },
    ],
  })
}

// ============== 水平分组柱状图 ==============
export function initHorizontalGroupedBarChart(): void {
  createBarChart('horizontal-grouped-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Dept A', 'Dept B', 'Dept C', 'Dept D'] },
    series: [
      { type: 'bar', name: '2023', data: [85, 72, 90, 68], color: '#3b82f6' },
      { type: 'bar', name: '2024', data: [92, 78, 95, 75], color: '#10b981' },
    ],
  })
}

// ============== 带标记的柱状图 ==============
export function initMarkedBarChart(): void {
  createBarChart('marked-bar-chart', {
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    series: [{ type: 'bar', name: 'Sales', data: [180, 220, 150, 280, 200, 250], borderRadius: 4, color: '#6366f1' }],
  })
}

// ============== 渐变色柱状图 ==============
export function initGradientColorBarChart(): void {
  createBarChart('gradient-color-bar-chart', {
    xAxis: { data: ['A', 'B', 'C', 'D', 'E'] },
    series: [{ type: 'bar', name: 'Value', data: [60, 80, 100, 120, 140], borderRadius: 6, color: '#06b6d4' }],
  })
}

// ============== 多层堆叠柱状图 ==============
export function initMultiLayerStackBarChart(): void {
  createBarChart('multi-layer-stack-bar-chart', {
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    series: [
      { type: 'bar', name: 'Layer 1', data: [100, 120, 110, 130, 140], stack: 'total', color: '#3b82f6' },
      { type: 'bar', name: 'Layer 2', data: [80, 90, 85, 95, 100], stack: 'total', color: '#10b981' },
      { type: 'bar', name: 'Layer 3', data: [60, 70, 65, 75, 80], stack: 'total', color: '#f59e0b' },
      { type: 'bar', name: 'Layer 4', data: [40, 50, 45, 55, 60], stack: 'total', color: '#ef4444' },
      { type: 'bar', name: 'Layer 5', data: [20, 30, 25, 35, 40], stack: 'total', color: '#8b5cf6' },
    ],
  })
}

// ============== 部门业绩柱状图 ==============
export function initDepartmentBarChart(): void {
  createBarChart('department-bar-chart', {
    horizontal: true,
    xAxis: { data: ['Sales', 'Marketing', 'R&D', 'Support', 'HR'] },
    series: [
      { type: 'bar', name: 'Target', data: [100, 80, 120, 60, 40], color: '#94a3b8' },
      { type: 'bar', name: 'Actual', data: [95, 85, 110, 65, 38], color: '#3b82f6' },
    ],
  })
}

// ============== 周数据柱状图 ==============
export function initWeeklyDataBarChart(): void {
  createBarChart('weekly-data-bar-chart', {
    xAxis: { data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
    series: [
      { type: 'bar', name: 'Views', data: [1200, 1500, 1800, 2100], color: '#3b82f6' },
      { type: 'bar', name: 'Clicks', data: [300, 400, 500, 600], color: '#10b981' },
      { type: 'bar', name: 'Conversions', data: [50, 70, 90, 120], color: '#f59e0b' },
    ],
  })
}

export { Chart } from '@ldesign/chart-core'
export type { ChartOptions, SeriesData } from '@ldesign/chart-core'
