import { Chart } from '@ldesign/chart-core'
import type { ChartConfig } from '@ldesign/chart-core'
import './style.css'

// 图表实例
let chart1: Chart | null = null
let chart2: Chart | null = null
let chart3: Chart | null = null
let chart4: Chart | null = null

// 实时数据更新定时器
let realtimeTimer: number | null = null

// 当前配置
let currentConfig = {
  type: 'line',
  theme: 'light',
  engine: 'echarts' as 'echarts' | 'vchart'
}

/**
 * 生成随机数据
 */
function generateRandomData(count: number, min: number = 0, max: number = 100): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

/**
 * 生成日期标签
 */
function generateDateLabels(count: number): string[] {
  const labels: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }
  return labels
}

/**
 * 初始化图表 1 - 基础图表
 */
function initChart1() {
  const container = document.getElementById('chart-1')
  if (!container) return

  if (chart1) {
    chart1.dispose()
  }

  const config: ChartConfig = {
    type: currentConfig.type as any,
    data: {
      labels: generateDateLabels(7),
      datasets: [
        {
          label: '销售额',
          data: generateRandomData(7, 50, 150)
        },
        {
          label: '访问量',
          data: generateRandomData(7, 100, 200)
        }
      ]
    },
    title: '本周数据统计',
    theme: currentConfig.theme,
    engine: currentConfig.engine,
    responsive: true,
    cache: true
  }

  chart1 = new Chart(container, config)
}

/**
 * 初始化图表 2 - 实时数据
 */
function initChart2() {
  const container = document.getElementById('chart-2')
  if (!container) return

  if (chart2) {
    chart2.dispose()
  }

  const config: ChartConfig = {
    type: 'line',
    data: {
      labels: Array.from({ length: 20 }, (_, i) => `T${i}`),
      datasets: [{
        label: '实时数据',
        data: generateRandomData(20, 20, 80)
      }]
    },
    title: '实时数据流',
    theme: currentConfig.theme,
    engine: currentConfig.engine,
    responsive: true
  }

  chart2 = new Chart(container, config)

  // 启动实时更新
  startRealtimeUpdate()
}

/**
 * 启动实时更新
 */
function startRealtimeUpdate() {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
  }

  realtimeTimer = window.setInterval(() => {
    if (chart2) {
      const newData = {
        labels: Array.from({ length: 20 }, (_, i) => `T${i}`),
        datasets: [{
          label: '实时数据',
          data: generateRandomData(20, 20, 80)
        }]
      }
      chart2.updateData(newData)
    }
  }, 2000)
}

/**
 * 初始化图表 3 - 多维数据
 */
function initChart3() {
  const container = document.getElementById('chart-3')
  if (!container) return

  if (chart3) {
    chart3.dispose()
  }

  let config: ChartConfig

  if (currentConfig.type === 'pie') {
    config = {
      type: 'pie',
      data: {
        labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
        datasets: [{
          data: generateRandomData(5, 10, 50)
        }]
      },
      title: '产品销售占比',
      theme: currentConfig.theme,
      engine: currentConfig.engine,
      responsive: true
    }
  } else if (currentConfig.type === 'radar') {
    config = {
      type: 'radar',
      data: {
        labels: ['速度', '质量', '稳定性', '易用性', '文档'],
        datasets: [
          {
            label: '版本 1.0',
            data: [85, 90, 75, 80, 70]
          },
          {
            label: '版本 2.0',
            data: [95, 85, 90, 85, 85]
          }
        ]
      },
      title: '性能对比',
      theme: currentConfig.theme,
      engine: currentConfig.engine,
      responsive: true
    }
  } else {
    config = {
      type: currentConfig.type as any,
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: '2023',
            data: generateRandomData(4, 100, 200)
          },
          {
            label: '2024',
            data: generateRandomData(4, 120, 220)
          }
        ]
      },
      title: '季度对比',
      theme: currentConfig.theme,
      engine: currentConfig.engine,
      responsive: true
    }
  }

  chart3 = new Chart(container, config)
}

/**
 * 初始化图表 4 - 性能测试
 */
function initChart4() {
  const container = document.getElementById('chart-4')
  if (!container) return

  if (chart4) {
    chart4.dispose()
  }

  const startTime = performance.now()
  const dataSize = 1000

  const config: ChartConfig = {
    type: currentConfig.type as any,
    data: {
      labels: Array.from({ length: dataSize }, (_, i) => `P${i}`),
      datasets: [{
        label: '大数据集',
        data: generateRandomData(dataSize, 0, 100)
      }]
    },
    title: `性能测试 (${dataSize} 数据点)`,
    theme: currentConfig.theme,
    engine: currentConfig.engine,
    responsive: true,
    cache: true,
    virtual: true,  // 启用虚拟渲染
    lazy: true      // 启用懒加载
  }

  chart4 = new Chart(container, config)

  const endTime = performance.now()
  const renderTime = (endTime - startTime).toFixed(2)

  const perfInfo = document.getElementById('perf-info')
  if (perfInfo) {
    perfInfo.innerHTML = `
      <strong>性能指标：</strong><br>
      数据量：${dataSize} 个数据点<br>
      渲染时间：${renderTime} ms<br>
      引擎：${currentConfig.engine}<br>
      优化：虚拟渲染 + 懒加载
    `
  }
}

/**
 * 初始化所有图表
 */
function initAllCharts() {
  initChart1()
  initChart2()
  initChart3()
  initChart4()
}

/**
 * 刷新数据
 */
function refreshData() {
  initAllCharts()
}

/**
 * 导出图片
 */
function exportImage() {
  if (chart1) {
    const dataURL = chart1.getDataURL({ type: 'png', pixelRatio: 2 })
    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'chart.png'
    link.click()
  }
}

/**
 * 初始化事件监听
 */
function initEventListeners() {
  // 图表类型变化
  const chartTypeSelect = document.getElementById('chart-type') as HTMLSelectElement
  if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', (e) => {
      currentConfig.type = (e.target as HTMLSelectElement).value
      initAllCharts()
    })
  }

  // 主题变化
  const themeSelect = document.getElementById('theme') as HTMLSelectElement
  if (themeSelect) {
    themeSelect.addEventListener('change', async (e) => {
      currentConfig.theme = (e.target as HTMLSelectElement).value

      // 异步更新主题
      if (chart1) await chart1.setTheme(currentConfig.theme)
      if (chart2) await chart2.setTheme(currentConfig.theme)
      if (chart3) await chart3.setTheme(currentConfig.theme)
      if (chart4) await chart4.setTheme(currentConfig.theme)
    })
  }

  // 引擎变化
  const engineSelect = document.getElementById('engine') as HTMLSelectElement
  if (engineSelect) {
    engineSelect.addEventListener('change', (e) => {
      currentConfig.engine = (e.target as HTMLSelectElement).value as 'echarts' | 'vchart'
      initAllCharts()
    })
  }

  // 刷新按钮
  const refreshBtn = document.getElementById('refresh-btn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshData)
  }

  // 导出按钮
  const exportBtn = document.getElementById('export-btn')
  if (exportBtn) {
    exportBtn.addEventListener('click', exportImage)
  }
}

/**
 * 应用入口
 */
function main() {
  console.log('🚀 @ldesign/chart 原生 JavaScript 示例')

  // 初始化事件监听
  initEventListeners()

  // 初始化所有图表
  initAllCharts()

  // 窗口大小变化时自动调整
  window.addEventListener('resize', () => {
    if (chart1) chart1.resize()
    if (chart2) chart2.resize()
    if (chart3) chart3.resize()
    if (chart4) chart4.resize()
  })

  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    if (realtimeTimer) {
      clearInterval(realtimeTimer)
    }
    if (chart1) chart1.dispose()
    if (chart2) chart2.dispose()
    if (chart3) chart3.dispose()
    if (chart4) chart4.dispose()
  })
}

// 启动应用
main()

