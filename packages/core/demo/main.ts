/**
 * LChart Core 演示
 */
import { createChart, type Chart } from '@ldesign/chart-core'

// ==================== 工具函数 ====================

/** 生成随机数据 */
function randomData(count: number, min: number = 10, max: number = 100): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min) + min))
}

/** 月份标签 */
const months = ['一月', '二月', '三月', '四月', '五月', '六月']

// ==================== 图表实例 ====================

let lineChart: Chart
let barChart: Chart
let pieChart: Chart
let areaChart: Chart
let multiChart: Chart
let darkChart: Chart

// 状态
let lineSmooth = false
let pieDonut = false

// ==================== 初始化图表 ====================

function initLineChart() {
  lineChart = createChart('#line-chart', {
    type: 'line',
    title: {
      text: '月度销售趋势',
      subtext: '单位：万元',
    },
    data: {
      labels: months,
      datasets: [
        { name: '2023年', data: [65, 78, 90, 82, 95, 110] },
        { name: '2024年', data: [85, 92, 105, 98, 115, 128] },
      ],
    },
    legend: { show: true, position: 'top' },
    tooltip: { show: true, trigger: 'axis' },
    xAxis: { type: 'category' },
    yAxis: { type: 'value', name: '销售额' },
  })
}

function initBarChart() {
  barChart = createChart('#bar-chart', {
    type: 'bar',
    title: '各部门业绩对比',
    data: {
      labels: ['研发部', '市场部', '销售部', '运营部', '财务部'],
      datasets: [
        { name: 'Q1', data: [120, 95, 150, 80, 70] },
        { name: 'Q2', data: [140, 110, 165, 95, 85] },
      ],
    },
    legend: { show: true },
    tooltip: { show: true },
  })
}

function initPieChart() {
  pieChart = createChart('#pie-chart', {
    type: 'pie',
    title: '市场份额分布',
    data: {
      labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
      datasets: [
        {
          data: [
            { x: '产品A', y: 35 },
            { x: '产品B', y: 25 },
            { x: '产品C', y: 20 },
            { x: '产品D', y: 12 },
            { x: '产品E', y: 8 },
          ],
        },
      ],
    },
    legend: { show: true, position: 'right' },
    tooltip: { show: true },
  })
}

function initAreaChart() {
  areaChart = createChart('#area-chart', {
    title: '流量趋势',
    series: [
      {
        type: 'line',
        name: 'UV',
        data: [820, 932, 901, 934, 1290, 1330],
        smooth: true,
        areaStyle: { opacity: 0.4 },
      },
      {
        type: 'line',
        name: 'PV',
        data: [1200, 1400, 1300, 1500, 1800, 2000],
        smooth: true,
        areaStyle: { opacity: 0.4 },
      },
    ],
    xAxis: {
      type: 'category',
      data: months,
    },
    yAxis: { type: 'value' },
    legend: { show: true },
    tooltip: { show: true },
  })
}

function initMultiChart() {
  multiChart = createChart('#multi-chart', {
    title: {
      text: '多系列数据展示',
      subtext: '折线图 + 柱状图组合',
    },
    series: [
      {
        type: 'bar',
        name: '销量',
        data: [320, 332, 301, 334, 390, 330],
      },
      {
        type: 'line',
        name: '增长率',
        data: [20, 32, 21, 34, 40, 30],
        smooth: true,
      },
    ],
    xAxis: {
      type: 'category',
      data: months,
    },
    yAxis: { type: 'value' },
    legend: { show: true },
    tooltip: { show: true, trigger: 'axis' },
  })
}

function initDarkChart() {
  darkChart = createChart('#dark-chart', {
    type: 'line',
    theme: 'dark',
    title: {
      text: '暗色主题示例',
      subtext: '自动适配暗色配色',
    },
    data: {
      labels: months,
      datasets: [
        { name: '系列1', data: [150, 230, 224, 218, 135, 147] },
        { name: '系列2', data: [80, 120, 160, 140, 180, 200] },
      ],
    },
    legend: { show: true },
    tooltip: { show: true },
  })
}

// ==================== 更新函数 ====================

; (window as any).updateLineChart = function () {
  lineChart.setOption({
    data: {
      labels: months,
      datasets: [
        { name: '2023年', data: randomData(6, 50, 120) },
        { name: '2024年', data: randomData(6, 70, 150) },
      ],
    },
  })
}

  ; (window as any).toggleLineSmooth = function () {
    lineSmooth = !lineSmooth
    lineChart.setOption({
      series: lineChart.getOption().series?.map(s => ({
        ...s,
        smooth: lineSmooth,
      })),
    })
  }

  ; (window as any).updateBarChart = function () {
    barChart.setOption({
      data: {
        labels: ['研发部', '市场部', '销售部', '运营部', '财务部'],
        datasets: [
          { name: 'Q1', data: randomData(5, 60, 180) },
          { name: 'Q2', data: randomData(5, 80, 200) },
        ],
      },
    })
  }

  ; (window as any).updatePieChart = function () {
    const values = randomData(5, 10, 50)
    pieChart.setOption({
      data: {
        datasets: [
          {
            data: [
              { x: '产品A', y: values[0] },
              { x: '产品B', y: values[1] },
              { x: '产品C', y: values[2] },
              { x: '产品D', y: values[3] },
              { x: '产品E', y: values[4] },
            ],
          },
        ],
      },
    })
  }

  ; (window as any).togglePieDonut = function () {
    pieDonut = !pieDonut
    pieChart.setOption({
      series: [
        {
          type: 'pie',
          radius: pieDonut ? ['40%', '70%'] : ['0%', '70%'],
        },
      ],
    })
  }

  ; (window as any).updateAreaChart = function () {
    areaChart.setOption({
      series: [
        {
          type: 'line',
          name: 'UV',
          data: randomData(6, 600, 1500),
          smooth: true,
          areaStyle: { opacity: 0.4 },
        },
        {
          type: 'line',
          name: 'PV',
          data: randomData(6, 1000, 2500),
          smooth: true,
          areaStyle: { opacity: 0.4 },
        },
      ],
    })
  }

  ; (window as any).updateMultiChart = function () {
    multiChart.setOption({
      series: [
        {
          type: 'bar',
          name: '销量',
          data: randomData(6, 200, 500),
        },
        {
          type: 'line',
          name: '增长率',
          data: randomData(6, 10, 50),
          smooth: true,
        },
      ],
    })
  }

  ; (window as any).updateDarkChart = function () {
    darkChart.setOption({
      data: {
        labels: months,
        datasets: [
          { name: '系列1', data: randomData(6, 100, 300) },
          { name: '系列2', data: randomData(6, 50, 250) },
        ],
      },
    })
  }

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  initLineChart()
  initBarChart()
  initPieChart()
  initAreaChart()
  initMultiChart()
  initDarkChart()

  console.log('🚀 LChart Core Demo 已启动')
})
