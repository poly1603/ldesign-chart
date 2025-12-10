/**
 * @ldesign/chart-core 图表示例
 * 使用统一的 Chart 类，通过 series[].type 指定图表类型
 */

import { Chart } from '../../src/charts'
import type { SeriesData, PieDataItem } from '../../src/charts'

// ============== 全局状态 ==============

let currentTheme: 'light' | 'dark' = 'light'
const charts: Map<string, Chart> = new Map()

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
  const lineBasic = new Chart('#line-basic', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      { type: 'line', name: '销售额', data: [150, 230, 224, 218, 135, 147, 260] }
    ],
    animationType: 'expand'
  })
  charts.set('line-basic', lineBasic)

  // 2. 平滑折线图
  const lineSmooth = new Chart('#line-smooth', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      { type: 'line', name: '用户数', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true, color: '#10b981' },
      { type: 'line', name: '访问量', data: [320, 332, 301, 334, 390, 330, 320], smooth: true, color: '#f59e0b' }
    ],
    animationType: 'expand'
  })
  charts.set('line-smooth', lineSmooth)

  // 3. 面积图
  const lineArea = new Chart('#line-area', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      {
        type: 'line',
        name: '下载量',
        data: [150, 232, 201, 154, 190, 330, 410],
        smooth: true,
        areaStyle: { opacity: 0.4 },
        color: '#6366f1'
      }
    ],
    animationType: 'rise'
  })
  charts.set('line-area', lineArea)

  // 4. 堆叠面积图
  const lineStackedArea = new Chart('#line-stacked-area', {
    theme: currentTheme,
    xAxis: { data: weekdays },
    series: [
      { type: 'line', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], smooth: true, stack: 'total', areaStyle: { opacity: 0.6 }, color: '#6366f1' },
      { type: 'line', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], smooth: true, stack: 'total', areaStyle: { opacity: 0.6 }, color: '#10b981' },
      { type: 'line', name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410], smooth: true, stack: 'total', areaStyle: { opacity: 0.6 }, color: '#f59e0b' }
    ],
    animationType: 'rise'
  })
  charts.set('line-stacked-area', lineStackedArea)

  // 5. 阶梯折线图
  const lineStep = new Chart('#line-step', {
    theme: currentTheme,
    xAxis: { data: weekdays },
    series: [
      { type: 'line', name: '步数', data: [4200, 3800, 5100, 4800, 6200, 8500, 7200], step: 'middle', color: '#8b5cf6' }
    ],
    animationType: 'expand'
  })
  charts.set('line-step', lineStep)

  // 6. 多系列折线图
  const lineMulti = new Chart('#line-multi', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 6) },
    series: [
      { type: 'line', name: '系列A', data: [120, 200, 150, 80, 70, 110] },
      { type: 'line', name: '系列B', data: [60, 80, 120, 160, 180, 150], smooth: true },
      { type: 'line', name: '系列C', data: [180, 150, 90, 120, 140, 200] }
    ],
    animationType: 'expand'
  })
  charts.set('line-multi', lineMulti)

  // 7. 带标记线的折线图
  const lineMarkline = new Chart('#line-markline', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 7) },
    series: [
      { type: 'line', name: '销量', data: [150, 230, 224, 218, 135, 147, 260], color: '#6366f1' }
    ],
    animationType: 'expand'
  })
  charts.set('line-markline', lineMarkline)

  // 8. 虚线和点线
  const lineDashed = new Chart('#line-dashed', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 6) },
    series: [
      { type: 'line', name: '实线', data: [120, 200, 150, 80, 70, 110], lineStyle: { type: 'solid', width: 2 } },
      { type: 'line', name: '虚线', data: [80, 150, 180, 120, 160, 140], lineStyle: { type: 'dashed', width: 2 }, color: '#10b981' },
      { type: 'line', name: '点线', data: [180, 120, 100, 150, 130, 190], lineStyle: { type: 'dotted', width: 2 }, color: '#f59e0b' }
    ],
    animationType: 'expand'
  })
  charts.set('line-dashed', lineDashed)
}

// ============== 柱状图示例 ==============

function initBarCharts() {
  // 1. 基础柱状图
  const barBasic = new Chart('#bar-basic', {
    theme: currentTheme,
    xAxis: { data: categories },
    series: [
      { type: 'bar', name: '销量', data: [120, 200, 150, 80, 70] }
    ],
    animationType: 'rise'
  })
  charts.set('bar-basic', barBasic)

  // 2. 分组柱状图
  const barGrouped = new Chart('#bar-grouped', {
    theme: currentTheme,
    xAxis: { data: ['2019', '2020', '2021', '2022', '2023'] },
    series: [
      { type: 'bar', name: '北京', data: [320, 332, 301, 334, 390], color: '#6366f1' },
      { type: 'bar', name: '上海', data: [220, 182, 191, 234, 290], color: '#10b981' },
      { type: 'bar', name: '深圳', data: [150, 232, 201, 154, 190], color: '#f59e0b' }
    ],
    animationType: 'rise'
  })
  charts.set('bar-grouped', barGrouped)

  // 3. 堆叠柱状图
  const barStacked = new Chart('#bar-stacked', {
    theme: currentTheme,
    xAxis: { data: weekdays },
    series: [
      { type: 'bar', name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total', color: '#6366f1' },
      { type: 'bar', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total', color: '#10b981' },
      { type: 'bar', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total', color: '#f59e0b' }
    ],
    animationType: 'rise'
  })
  charts.set('bar-stacked', barStacked)

  // 4. 负值柱状图
  const barNegative = new Chart('#bar-negative', {
    theme: currentTheme,
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    series: [
      { type: 'bar', name: '利润', data: [200, -50, 150, -30], color: '#6366f1' }
    ],
    animationType: 'rise'
  })
  charts.set('bar-negative', barNegative)

  // 5. 圆角柱状图
  const barRounded = new Chart('#bar-rounded', {
    theme: currentTheme,
    xAxis: { data: categories },
    series: [
      { type: 'bar', name: '数值', data: [180, 220, 150, 260, 200], borderRadius: 8, color: '#8b5cf6' }
    ],
    animationType: 'rise'
  })
  charts.set('bar-rounded', barRounded)

  // 6. 渐变色柱状图
  const barGradient = new Chart('#bar-gradient', {
    theme: currentTheme,
    xAxis: { data: months.slice(0, 6) },
    series: [
      { type: 'bar', name: '访问量', data: [220, 182, 191, 234, 290, 330], borderRadius: 4, color: '#6366f1' }
    ],
    animationType: 'rise'
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
  const pieBasic = new Chart('#pie-basic', {
    theme: currentTheme,
    series: [
      { type: 'pie', data: pieData, radius: 0.7 }
    ],
    animationType: 'grow'
  })
  charts.set('pie-basic', pieBasic)

  // 2. 环形图
  const pieDoughnut = new Chart('#pie-doughnut', {
    theme: currentTheme,
    series: [
      { type: 'pie', data: pieData, radius: [0.5, 0.8] }
    ],
    animationType: 'grow'
  })
  charts.set('pie-doughnut', pieDoughnut)

  // 3. 南丁格尔玫瑰图
  const pieRose = new Chart('#pie-rose', {
    theme: currentTheme,
    series: [
      { type: 'pie', data: pieData, radius: [0.2, 0.8], roseType: 'radius' }
    ],
    animationType: 'grow'
  })
  charts.set('pie-rose', pieRose)

  // 4. 带标签的饼图
  const pieLabel = new Chart('#pie-label', {
    theme: currentTheme,
    series: [
      { type: 'pie', data: pieData, radius: 0.6, label: { show: true, position: 'outside' } }
    ],
    animationType: 'grow'
  })
  charts.set('pie-label', pieLabel)

  // 5. 半圆饼图
  const pieHalf = new Chart('#pie-half', {
    theme: currentTheme,
    series: [
      { type: 'pie', data: pieData.slice(0, 3), radius: [0.4, 0.75] }
    ],
    animationType: 'grow'
  })
  charts.set('pie-half', pieHalf)

  // 6. 嵌套环形图
  const pieNested = new Chart('#pie-nested', {
    theme: currentTheme,
    series: [
      {
        type: 'pie', data: [
          { name: '一季度', value: 335 },
          { name: '二季度', value: 310 },
          { name: '三季度', value: 234 },
          { name: '四季度', value: 135 }
        ], radius: [0.3, 0.7], label: { show: true, position: 'inside' }
      }
    ],
    animationType: 'grow'
  })
  charts.set('pie-nested', pieNested)
}

// ============== 交互函数 ==============

// 折线图交互
function updateLineBasic() {
  const chart = charts.get('line-basic')
  if (chart) {
    chart.setOption({
      series: [{ type: 'line', name: '销售额', data: randomData(7) }]
    })
  }
}

function toggleLineSmooth(chartId: string) {
  const chart = charts.get(chartId)
  if (chart) {
    const currentSeries = (chart as any).options.series as SeriesData[]
    chart.setOption({
      series: currentSeries.map(s => ({ ...s, smooth: !s.smooth }))
    })
  }
}

function toggleAreaOpacity() {
  const chart = charts.get('line-area')
  if (chart) {
    const currentSeries = (chart as any).options.series as SeriesData[]
    const currentOpacity = (currentSeries[0]?.areaStyle as any)?.opacity || 0.4
    const newOpacity = currentOpacity >= 0.8 ? 0.2 : currentOpacity + 0.2
    chart.setOption({
      series: [{
        ...currentSeries[0]!,
        areaStyle: { opacity: newOpacity }
      }]
    })
  }
}

function setStepType(type: 'start' | 'middle' | 'end') {
  const chart = charts.get('line-step')
  if (chart) {
    chart.setOption({
      series: [{ type: 'line', name: '步数', data: [4200, 3800, 5100, 4800, 6200, 8500, 7200], step: type, color: '#8b5cf6' }]
    })
  }
}

let seriesCount = 3
function addLineSeries() {
  const chart = charts.get('line-multi')
  if (chart && seriesCount < 6) {
    seriesCount++
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    const currentSeries = (chart as any).options.series as SeriesData[]
    chart.setOption({
      series: [
        ...currentSeries,
        { type: 'line', name: `系列${String.fromCharCode(64 + seriesCount)}`, data: randomData(6, 50, 200), color: colors[seriesCount - 1] }
      ]
    })
  }
}

function removeLineSeries() {
  const chart = charts.get('line-multi')
  if (chart && seriesCount > 1) {
    const currentSeries = (chart as any).options.series as SeriesData[]
    chart.setOption({
      series: currentSeries.slice(0, -1)
    })
    seriesCount--
  }
}

// 柱状图交互
function updateBarBasic() {
  const chart = charts.get('bar-basic')
  if (chart) {
    chart.setOption({
      series: [{ type: 'bar', name: '销量', data: randomData(5) }]
    })
  }
}

function setBarRadius(radius: number) {
  const chart = charts.get('bar-rounded')
  if (chart) {
    chart.setOption({
      series: [{ type: 'bar', name: '数值', data: [180, 220, 150, 260, 200], borderRadius: radius, color: '#8b5cf6' }]
    })
  }
}

// 饼状图交互
function updatePieBasic() {
  const chart = charts.get('pie-basic')
  if (chart) {
    chart.setOption({
      series: [{
        type: 'pie',
        data: [
          { name: '搜索引擎', value: Math.floor(Math.random() * 1000) + 500 },
          { name: '直接访问', value: Math.floor(Math.random() * 500) + 300 },
          { name: '邮件营销', value: Math.floor(Math.random() * 400) + 200 },
          { name: '联盟广告', value: Math.floor(Math.random() * 300) + 200 },
          { name: '视频广告', value: Math.floor(Math.random() * 200) + 100 }
        ],
        radius: 0.7
      }]
    })
  }
}

function setInnerRadius(innerRatio: number) {
  const chart = charts.get('pie-doughnut')
  if (chart) {
    const container = document.getElementById('pie-doughnut')
    if (container) {
      chart.dispose()
      const newChart = new Chart('#pie-doughnut', {
        theme: currentTheme,
        series: [{
          type: 'pie',
          data: [
            { name: '搜索引擎', value: 1048 },
            { name: '直接访问', value: 735 },
            { name: '邮件营销', value: 580 },
            { name: '联盟广告', value: 484 },
            { name: '视频广告', value: 300 }
          ],
          radius: [innerRatio, 0.8]
        }],
        animationType: 'grow'
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
      const newChart = new Chart('#pie-label', {
        theme: currentTheme,
        series: [{
          type: 'pie',
          data: [
            { name: '搜索引擎', value: 1048 },
            { name: '直接访问', value: 735 },
            { name: '邮件营销', value: 580 },
            { name: '联盟广告', value: 484 },
            { name: '视频广告', value: 300 }
          ],
          radius: 0.6,
          label: { show: true, position }
        }],
        animationType: 'grow'
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
