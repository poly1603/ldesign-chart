/**
 * @ldesign/chart-core 图表示例
 * 参考 VChart 和 ECharts 的丰富示例
 */

import { LineChart, BarChart, PieChart } from '../../src/charts'
import type { LineSeriesData, PieDataItem } from '../../src/charts'

// ============== 全局状态 ==============

let currentTheme: 'light' | 'dark' = 'light'
const charts: Map<string, LineChart | BarChart | PieChart> = new Map()

// ============== 主题切换 ==============

function setTheme(theme: 'light' | 'dark') {
  currentTheme = theme
  document.documentElement.setAttribute('data-theme', theme)

  // 更新主题按钮状态
  document.querySelectorAll('.theme-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (theme === 'light' && i === 0) || (theme === 'dark' && i === 1))
  })

  // 刷新所有图表
  charts.forEach(chart => {
    if ('setTheme' in chart) {
      chart.setTheme(theme)
    }
  })
}

// ============== 导航切换 ==============

function showSection(section: string) {
  // 更新标签状态
  document.querySelectorAll('.nav-tab').forEach((tab, i) => {
    const sections = ['line', 'bar', 'pie']
    tab.classList.toggle('active', sections[i] === section)
  })

  // 显示对应区域
  document.querySelectorAll('.section').forEach(el => {
    el.classList.toggle('active', el.id === `section-${section}`)
  })
}

// ============== 示例数据 ==============

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const categories = ['类目A', '类目B', '类目C', '类目D', '类目E']

function randomData(count: number, min = 50, max = 300): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min) + min))
}

// ============== 折线图示例 ==============

function initLineCharts() {
  // 1. 基础折线图
  const lineBasic = new LineChart('#line-basic', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      { name: '销售额', data: [150, 230, 224, 218, 135, 147, 260] }
    ],
    animation: { entryType: 'drawLine', entryDuration: 1000 }
  })
  charts.set('line-basic', lineBasic)

  // 2. 平滑折线图
  const lineSmooth = new LineChart('#line-smooth', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      { name: '用户数', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true, color: '#10b981' },
      { name: '访问量', data: [320, 332, 301, 334, 390, 330, 320], smooth: true, color: '#f59e0b' }
    ],
    animation: { entryType: 'drawLine' }
  })
  charts.set('line-smooth', lineSmooth)

  // 3. 面积图
  const lineArea = new LineChart('#line-area', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      {
        name: '下载量',
        data: [150, 232, 201, 154, 190, 330, 410],
        smooth: true,
        areaStyle: { opacity: 0.4 },
        color: '#6366f1'
      }
    ],
    animation: { entryType: 'grow', entryDuration: 800 }
  })
  charts.set('line-area', lineArea)

  // 4. 堆叠面积图
  const lineStackedArea = new LineChart('#line-stacked-area', {
    theme: currentTheme,
    xAxis: { data: weekdays },
    series: [
      { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], smooth: true, stack: 'total', areaStyle: { opacity: 0.6 }, color: '#6366f1' },
      { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], smooth: true, stack: 'total', areaStyle: { opacity: 0.6 }, color: '#10b981' },
      { name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410], smooth: true, stack: 'total', areaStyle: { opacity: 0.6 }, color: '#f59e0b' }
    ],
    animation: { entryType: 'grow' }
  })
  charts.set('line-stacked-area', lineStackedArea)

  // 5. 阶梯折线图
  const lineStep = new LineChart('#line-step', {
    theme: currentTheme,
    xAxis: { data: weekdays },
    series: [
      { name: '步数', data: [4200, 3800, 5100, 4800, 6200, 8500, 7200], step: 'middle', color: '#8b5cf6' }
    ],
    animation: { entryType: 'drawLine' }
  })
  charts.set('line-step', lineStep)

  // 6. 多系列折线图
  const lineMulti = new LineChart('#line-multi', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 6) },
    series: [
      { name: '系列A', data: [120, 200, 150, 80, 70, 110] },
      { name: '系列B', data: [60, 80, 120, 160, 180, 150], smooth: true },
      { name: '系列C', data: [180, 150, 90, 120, 140, 200] }
    ],
    animation: { entryType: 'drawLine', stagger: true, staggerDelay: 100 }
  })
  charts.set('line-multi', lineMulti)

  // 7. 带标记线的折线图
  const lineMarkline = new LineChart('#line-markline', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      { name: '销量', data: [150, 230, 224, 218, 135, 147, 260], color: '#6366f1' }
    ],
    markLine: {
      data: [
        { type: 'average' },
        { type: 'max' },
        { type: 'min' }
      ]
    },
    animation: { entryType: 'drawLine' }
  })
  charts.set('line-markline', lineMarkline)

  // 8. 虚线和点线
  const lineDashed = new LineChart('#line-dashed', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 6) },
    series: [
      { name: '实线', data: [120, 200, 150, 80, 70, 110], lineStyle: { type: 'solid', width: 2 } },
      { name: '虚线', data: [80, 150, 180, 120, 160, 140], lineStyle: { type: 'dashed', width: 2 }, color: '#10b981' },
      { name: '点线', data: [180, 120, 100, 150, 130, 190], lineStyle: { type: 'dotted', width: 2 }, color: '#f59e0b' }
    ],
    animation: { entryType: 'drawLine' }
  })
  charts.set('line-dashed', lineDashed)
}

// ============== 柱状图示例 ==============

function initBarCharts() {
  // 1. 基础柱状图
  const barBasic = new BarChart('#bar-basic', {
    theme: currentTheme,
    xAxis: { data: categories },
    series: [
      { name: '销量', data: [120, 200, 150, 80, 70] }
    ],
    animation: true
  })
  charts.set('bar-basic', barBasic)

  // 2. 分组柱状图
  const barGrouped = new BarChart('#bar-grouped', {
    theme: currentTheme,
    xAxis: { data: ['2019', '2020', '2021', '2022', '2023'] },
    series: [
      { name: '北京', data: [320, 332, 301, 334, 390], color: '#6366f1' },
      { name: '上海', data: [220, 182, 191, 234, 290], color: '#10b981' },
      { name: '深圳', data: [150, 232, 201, 154, 190], color: '#f59e0b' }
    ],
    animation: true
  })
  charts.set('bar-grouped', barGrouped)

  // 3. 堆叠柱状图
  const barStacked = new BarChart('#bar-stacked', {
    theme: currentTheme,
    xAxis: { data: weekdays },
    series: [
      { name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total', color: '#6366f1' },
      { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total', color: '#10b981' },
      { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total', color: '#f59e0b' }
    ],
    animation: true
  })
  charts.set('bar-stacked', barStacked)

  // 4. 负值柱状图
  const barNegative = new BarChart('#bar-negative', {
    theme: currentTheme,
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { name: '利润', data: [200, -50, 150, -30], color: '#6366f1' }
    ],
    animation: true
  })
  charts.set('bar-negative', barNegative)

  // 5. 圆角柱状图
  const barRounded = new BarChart('#bar-rounded', {
    theme: currentTheme,
    xAxis: { data: categories },
    series: [
      { name: '数值', data: [180, 220, 150, 260, 200], borderRadius: 8, color: '#8b5cf6' }
    ],
    animation: true
  })
  charts.set('bar-rounded', barRounded)

  // 6. 渐变色柱状图
  const barGradient = new BarChart('#bar-gradient', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 6) },
    series: [
      { name: '访问量', data: [220, 182, 191, 234, 290, 330], borderRadius: 4, color: '#6366f1' }
    ],
    animation: true
  })
  charts.set('bar-gradient', barGradient)
}

// ============== 饼状图示例 ==============

function initPieCharts() {
  const pieData: PieDataItem[] = [
    { name: '搜索引擎', value: 1048 },
    { name: '直接访问', value: 735 },
    { name: '邮件营销', value: 580 },
    { name: '联盟广告', value: 484 },
    { name: '视频广告', value: 300 }
  ]

  // 1. 基础饼图
  const pieBasic = new PieChart('#pie-basic', {
    theme: currentTheme,
    data: pieData,
    radius: 0.7,
    animation: true
  })
  charts.set('pie-basic', pieBasic)

  // 2. 环形图
  const pieDoughnut = new PieChart('#pie-doughnut', {
    theme: currentTheme,
    data: pieData,
    radius: [0.5, 0.8],
    animation: true
  })
  charts.set('pie-doughnut', pieDoughnut)

  // 3. 南丁格尔玫瑰图
  const pieRose = new PieChart('#pie-rose', {
    theme: currentTheme,
    data: pieData,
    radius: [0.2, 0.8],
    roseType: 'radius',
    animation: true
  })
  charts.set('pie-rose', pieRose)

  // 4. 带标签的饼图
  const pieLabel = new PieChart('#pie-label', {
    theme: currentTheme,
    data: pieData,
    radius: 0.6,
    label: { show: true, position: 'outside', fontSize: 12 },
    labelLine: { show: true, length1: 10, length2: 20 },
    animation: true
  })
  charts.set('pie-label', pieLabel)

  // 5. 半圆饼图 - 由于当前 PieChart 不支持半圆，用普通饼图代替
  const pieHalf = new PieChart('#pie-half', {
    theme: currentTheme,
    data: pieData.slice(0, 3),
    radius: [0.4, 0.75],
    animation: true
  })
  charts.set('pie-half', pieHalf)

  // 6. 嵌套环形图 - 用单环形图代替
  const pieNested = new PieChart('#pie-nested', {
    theme: currentTheme,
    data: [
      { name: '一季度', value: 335 },
      { name: '二季度', value: 310 },
      { name: '三季度', value: 234 },
      { name: '四季度', value: 135 }
    ],
    radius: [0.3, 0.7],
    label: { show: true, position: 'inside' },
    animation: true
  })
  charts.set('pie-nested', pieNested)
}

// ============== 交互函数 ==============

// 折线图交互
function updateLineBasic() {
  const chart = charts.get('line-basic') as LineChart
  if (chart) {
    chart.setData([
      { name: '销售额', data: randomData(7) }
    ])
  }
}

function toggleLineSmooth(chartId: string) {
  const chart = charts.get(chartId) as LineChart
  if (chart) {
    const currentSeries = (chart as any).options.series as LineSeriesData[]
    chart.setData(currentSeries.map(s => ({ ...s, smooth: !s.smooth })))
  }
}

function toggleAreaOpacity() {
  const chart = charts.get('line-area') as LineChart
  if (chart) {
    const currentSeries = (chart as any).options.series as LineSeriesData[]
    const currentOpacity = (currentSeries[0]?.areaStyle as any)?.opacity || 0.4
    const newOpacity = currentOpacity >= 0.8 ? 0.2 : currentOpacity + 0.2
    chart.setData([{
      ...currentSeries[0]!,
      areaStyle: { opacity: newOpacity }
    }])
  }
}

function setStepType(type: 'start' | 'middle' | 'end') {
  const chart = charts.get('line-step') as LineChart
  if (chart) {
    chart.setData([
      { name: '步数', data: [4200, 3800, 5100, 4800, 6200, 8500, 7200], step: type, color: '#8b5cf6' }
    ])
  }
}

let seriesCount = 3
function addLineSeries() {
  const chart = charts.get('line-multi') as LineChart
  if (chart && seriesCount < 6) {
    seriesCount++
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    const currentSeries = (chart as any).options.series as LineSeriesData[]
    chart.setData([
      ...currentSeries,
      { name: `系列${String.fromCharCode(64 + seriesCount)}`, data: randomData(6, 50, 200), color: colors[seriesCount - 1] }
    ])
  }
}

function removeLineSeries() {
  const chart = charts.get('line-multi') as LineChart
  if (chart && seriesCount > 1) {
    const currentSeries = (chart as any).options.series as LineSeriesData[]
    chart.setData(currentSeries.slice(0, -1))
    seriesCount--
  }
}

// 柱状图交互
function updateBarBasic() {
  const chart = charts.get('bar-basic') as BarChart
  if (chart) {
    chart.setData([
      { name: '销量', data: randomData(5) }
    ])
  }
}

function setBarRadius(radius: number) {
  const chart = charts.get('bar-rounded') as BarChart
  if (chart) {
    chart.setData([
      { name: '数值', data: [180, 220, 150, 260, 200], borderRadius: radius, color: '#8b5cf6' }
    ])
  }
}

// 饼状图交互
function updatePieBasic() {
  const chart = charts.get('pie-basic') as PieChart
  if (chart) {
    chart.setData([
      { name: '搜索引擎', value: Math.floor(Math.random() * 1000) + 500 },
      { name: '直接访问', value: Math.floor(Math.random() * 500) + 300 },
      { name: '邮件营销', value: Math.floor(Math.random() * 400) + 200 },
      { name: '联盟广告', value: Math.floor(Math.random() * 300) + 200 },
      { name: '视频广告', value: Math.floor(Math.random() * 200) + 100 }
    ])
  }
}

function setInnerRadius(innerRatio: number) {
  const chart = charts.get('pie-doughnut')
  if (chart) {
    // 由于 PieChart 没有直接的 setRadius 方法，需要重新创建
    const container = document.getElementById('pie-doughnut')
    if (container) {
      chart.dispose()
      const newChart = new PieChart('#pie-doughnut', {
        theme: currentTheme,
        data: [
          { name: '搜索引擎', value: 1048 },
          { name: '直接访问', value: 735 },
          { name: '邮件营销', value: 580 },
          { name: '联盟广告', value: 484 },
          { name: '视频广告', value: 300 }
        ],
        radius: [innerRatio, 0.8],
        animation: true
      })
      charts.set('pie-doughnut', newChart)
    }
  }
}

function setLabelPosition(position: 'inside' | 'outside') {
  const chart = charts.get('pie-label')
  if (chart) {
    const container = document.getElementById('pie-label')
    if (container) {
      chart.dispose()
      const newChart = new PieChart('#pie-label', {
        theme: currentTheme,
        data: [
          { name: '搜索引擎', value: 1048 },
          { name: '直接访问', value: 735 },
          { name: '邮件营销', value: 580 },
          { name: '联盟广告', value: 484 },
          { name: '视频广告', value: 300 }
        ],
        radius: 0.6,
        label: { show: true, position, fontSize: 12 },
        labelLine: { show: position === 'outside', length1: 10, length2: 20 },
        animation: true
      })
      charts.set('pie-label', newChart)
    }
  }
}

// ============== 初始化 ==============

function init() {
  initLineCharts()
  initBarCharts()
  initPieCharts()
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init)

// 导出到全局供 HTML 调用
Object.assign(window, {
  setTheme,
  showSection,
  updateLineBasic,
  toggleLineSmooth,
  toggleAreaOpacity,
  setStepType,
  addLineSeries,
  removeLineSeries,
  updateBarBasic,
  setBarRadius,
  updatePieBasic,
  setInnerRadius,
  setLabelPosition
})
