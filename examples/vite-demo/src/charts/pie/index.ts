/**
 * 饼图模块 - 使用统一的 Chart 类，通过 series[].type = 'pie' 实现
 * 支持多种动画效果和丰富的饼图形式
 */

import { Chart } from '@ldesign/chart-core'
import type { ChartOptions, PieAnimationType } from '@ldesign/chart-core'
import { getRendererMode, getChartAnimationType } from '../../main'

// 使用 Map 管理图表实例，支持单独更新
const chartInstancesMap = new Map<string, Chart>()

// 饼图动画类型映射（将通用动画类型转换为饼图动画类型）
function getPieAnimationType(chartId: string): PieAnimationType {
  const animationType = getChartAnimationType(chartId)
  // 将通用动画类型映射到饼图动画类型
  switch (animationType) {
    case 'rise': return 'expand'
    case 'expand': return 'expand'
    case 'grow': return 'scale'
    case 'fade': return 'fade'
    case 'none': return 'none'
    default: return 'expand'
  }
}

interface PieSeriesOptions {
  data: Array<{ name: string; value: number; color?: string }>
  radius?: number | [number, number]
  roseType?: boolean | 'radius' | 'area'
  label?: { show?: boolean; position?: 'inside' | 'outside' }
  startAngle?: number
  sweepAngle?: number  // 总角度，Math.PI 为半圆
}

function createPieChart(chartId: string, options: PieSeriesOptions): Chart | null {
  const container = document.getElementById(chartId)
  if (!container) return null
  const oldChart = chartInstancesMap.get(chartId)
  if (oldChart) oldChart.dispose()

  const chartOptions: ChartOptions = {
    renderer: getRendererMode(),
    legend: { show: false },
    grid: { show: false },
    series: [{
      type: 'pie',
      name: 'pie',
      data: options.data,
      radius: options.radius,
      roseType: options.roseType,
      pieAnimationType: getPieAnimationType(chartId),
      label: options.label,
      startAngle: options.startAngle,
      sweepAngle: options.sweepAngle,
    }],
  }

  const chart = new Chart(container, chartOptions)
  chartInstancesMap.set(chartId, chart)
  return chart
}

export function refreshAllPieCharts(theme: 'light' | 'dark'): void {
  chartInstancesMap.forEach(chart => chart.setTheme(theme))
}

export function disposeAllPieCharts(): void {
  chartInstancesMap.forEach(chart => chart.dispose())
  chartInstancesMap.clear()
}

// 饼图动画切换需要通过重新初始化图表来实现
// 使用相同的动画类型系统，通过 chartAnimationTypes Map 来管理

// ============== 基础饼图 ==============

export function initPieChart(): void {
  createPieChart('pie-chart', {
    data: [
      { name: '直接访问', value: 335 },
      { name: '邮件营销', value: 310 },
      { name: '联盟广告', value: 234 },
      { name: '视频广告', value: 135 },
      { name: '搜索引擎', value: 1548 },
    ],
  })
}

export function initDonutChart(): void {
  createPieChart('donut-chart', {
    radius: [0.4, 0.7],
    data: [
      { name: '直接访问', value: 335 },
      { name: '邮件营销', value: 310 },
      { name: '联盟广告', value: 234 },
      { name: '视频广告', value: 135 },
      { name: '搜索引擎', value: 1548 },
    ],
  })
}

export function initRoseChart(): void {
  createPieChart('rose-chart', {
    roseType: 'radius',
    data: [
      { name: '玫瑰1', value: 40 },
      { name: '玫瑰2', value: 38 },
      { name: '玫瑰3', value: 32 },
      { name: '玫瑰4', value: 30 },
      { name: '玫瑰5', value: 28 },
    ],
  })
}

export function initNestedPieChart(): void {
  // 嵌套饼图需要多个系列
  const container = document.getElementById('nested-pie-chart')
  if (!container) return
  const oldChart = chartInstancesMap.get('nested-pie-chart')
  if (oldChart) oldChart.dispose()

  const chartOptions: ChartOptions = {
    renderer: getRendererMode(),
    legend: { show: false },
    grid: { show: false },
    series: [
      // 内圈
      {
        type: 'pie',
        name: 'inner',
        radius: [0, 0.35],
        label: { show: false },
        pieAnimationType: getPieAnimationType('nested-pie-chart'),
        data: [
          { name: '直接访问', value: 335, color: '#6366f1' },
          { name: '邮件营销', value: 310, color: '#10b981' },
          { name: '联盟广告', value: 234, color: '#f59e0b' },
          { name: '视频广告', value: 135, color: '#ef4444' },
        ],
      },
      // 外圈
      {
        type: 'pie',
        name: 'outer',
        radius: [0.45, 0.7],
        pieAnimationType: getPieAnimationType('nested-pie-chart'),
        data: [
          { name: '直接访问', value: 335, color: '#818cf8' },
          { name: '邮件营销', value: 310, color: '#34d399' },
          { name: '联盟广告', value: 234, color: '#fbbf24' },
          { name: '视频广告', value: 135, color: '#f87171' },
        ],
      },
    ],
  }

  const chart = new Chart(container, chartOptions)
  chartInstancesMap.set('nested-pie-chart', chart)
}

export function initHalfPieChart(): void {
  createPieChart('half-pie-chart', {
    radius: [0.4, 0.7],
    startAngle: -Math.PI,  // 从9点钟方向开始
    sweepAngle: Math.PI,   // 半圆（180度）
    data: [
      { name: '搜索引擎', value: 1048 },
      { name: '直接访问', value: 735 },
      { name: '邮件营销', value: 580 },
      { name: '联盟广告', value: 484 },
      { name: '视频广告', value: 300 },
    ],
  })
}

// ============== 新增饼图示例 ==============

// 薄环形图
export function initThinDonutChart(): void {
  createPieChart('thin-donut-chart', {
    radius: [0.6, 0.7],
    data: [
      { name: '已完成', value: 75 },
      { name: '进行中', value: 15 },
      { name: '待处理', value: 10 },
    ],
    label: { show: false },
  })
}

// 厚环形图
export function initThickDonutChart(): void {
  createPieChart('thick-donut-chart', {
    radius: [0.2, 0.7],
    data: [
      { name: 'Chrome', value: 65 },
      { name: 'Firefox', value: 15 },
      { name: 'Safari', value: 12 },
      { name: 'Edge', value: 5 },
      { name: 'Other', value: 3 },
    ],
  })
}

// 玫瑰面积图
export function initRoseAreaChart(): void {
  createPieChart('rose-area-chart', {
    roseType: 'area',
    data: [
      { name: '周一', value: 120 },
      { name: '周二', value: 200 },
      { name: '周三', value: 150 },
      { name: '周四', value: 80 },
      { name: '周五', value: 70 },
      { name: '周六', value: 110 },
      { name: '周日', value: 130 },
    ],
  })
}

// 市场份额图
export function initMarketShareChart(): void {
  createPieChart('market-share-chart', {
    data: [
      { name: 'Apple', value: 28 },
      { name: 'Samsung', value: 22 },
      { name: 'Xiaomi', value: 13 },
      { name: 'OPPO', value: 10 },
      { name: 'Vivo', value: 8 },
      { name: 'Others', value: 19 },
    ],
  })
}

// 预算分配图
export function initBudgetPieChart(): void {
  createPieChart('budget-pie-chart', {
    radius: [0.35, 0.65],
    data: [
      { name: '研发', value: 40 },
      { name: '市场', value: 25 },
      { name: '运营', value: 20 },
      { name: '行政', value: 10 },
      { name: '其他', value: 5 },
    ],
  })
}

// 用户来源图
export function initUserSourceChart(): void {
  createPieChart('user-source-chart', {
    data: [
      { name: '自然搜索', value: 45 },
      { name: '付费广告', value: 25 },
      { name: '社交媒体', value: 18 },
      { name: '直接访问', value: 8 },
      { name: '邮件', value: 4 },
    ],
  })
}

// 项目状态图
export function initProjectStatusChart(): void {
  createPieChart('project-status-chart', {
    radius: [0.4, 0.7],
    data: [
      { name: '已完成', value: 12 },
      { name: '进行中', value: 8 },
      { name: '待开始', value: 5 },
      { name: '已暂停', value: 2 },
    ],
  })
}

// 年龄分布图
export function initAgeDistChart(): void {
  createPieChart('age-dist-chart', {
    data: [
      { name: '18-24岁', value: 15 },
      { name: '25-34岁', value: 35 },
      { name: '35-44岁', value: 25 },
      { name: '45-54岁', value: 15 },
      { name: '55岁以上', value: 10 },
    ],
  })
}

// 设备分布图
export function initDeviceChart(): void {
  createPieChart('device-chart', {
    radius: [0.35, 0.65],
    data: [
      { name: '手机', value: 60 },
      { name: '电脑', value: 30 },
      { name: '平板', value: 8 },
      { name: '其他', value: 2 },
    ],
  })
}

// 收入来源图
export function initRevenueSourceChart(): void {
  createPieChart('revenue-source-chart', {
    data: [
      { name: '产品销售', value: 55 },
      { name: '服务收入', value: 25 },
      { name: '订阅费', value: 15 },
      { name: '广告收入', value: 5 },
    ],
  })
}

// 简约环形图
export function initMinimalDonutChart(): void {
  createPieChart('minimal-donut-chart', {
    radius: [0.55, 0.7],
    label: { show: false },
    data: [
      { name: '完成率', value: 72 },
      { name: '剩余', value: 28, color: 'rgba(100,100,100,0.2)' },
    ],
  })
}

// 多色玫瑰图
export function initColorfulRoseChart(): void {
  createPieChart('colorful-rose-chart', {
    roseType: 'radius',
    data: [
      { name: 'A类', value: 100, color: '#6366f1' },
      { name: 'B类', value: 80, color: '#10b981' },
      { name: 'C类', value: 60, color: '#f59e0b' },
      { name: 'D类', value: 40, color: '#ef4444' },
      { name: 'E类', value: 20, color: '#8b5cf6' },
    ],
  })
}

export { PieChart } from '@ldesign/chart-core'
export type { PieChartOptions, PieChartDataItem } from '@ldesign/chart-core'