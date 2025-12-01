/**
 * LDesign Chart 示例 - 主入口
 */
import {
  CanvasRenderer,
  LinearScale,
  CartesianCoordinate,
  Axis,
  LineSeries,
  BarSeries,
  ScatterSeries,
  AreaSeries,
  PieSeries,
  Title,
} from '@ldesign/chart-core'

// 示例数据
const months = ['一月', '二月', '三月', '四月', '五月', '六月']
const salesData = [150, 230, 224, 218, 135, 147]
const visitData = [80, 120, 160, 140, 180, 200]

/**
 * 初始化折线图
 */
function initLineChart() {
  const container = document.getElementById('line-chart')
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new CanvasRenderer(container)
  renderer.init(container, width, height)

  const padding = { left: 60, right: 30, top: 40, bottom: 50 }

  // 比例尺
  const xScale = new LinearScale({
    domain: [0, salesData.length - 1],
    range: [0, 1],
  })

  const yScale = new LinearScale({
    domain: [0, Math.max(...salesData) * 1.2],
    range: [0, 1],
  })

  // 坐标系
  const coordinate = new CartesianCoordinate({
    x: [padding.left, width - padding.right],
    y: [height - padding.bottom, padding.top],
  })

  // 渲染
  renderer.clear()

  // 标题
  const title = new Title({
    type: 'title',
    text: '销售趋势',
    x: width / 2,
    y: 20,
    textStyle: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
    },
  })
  title.render(renderer)

  // X轴
  const xAxis = new Axis({
    type: 'axis',
    orientation: 'bottom',
    scale: xScale,
    coordinate,
    data: months,
    axisLine: { show: true },
    axisTick: { show: true, length: 5 },
  })
  xAxis.render(renderer)

  // Y轴
  const yAxis = new Axis({
    type: 'axis',
    orientation: 'left',
    scale: yScale,
    coordinate,
    tickCount: 5,
    axisLine: { show: true },
    axisTick: { show: true, length: 5 },
  })
  yAxis.render(renderer)

  // 折线
  const lineSeries = new LineSeries({
    type: 'line',
    data: salesData,
    lineStyle: {
      stroke: '#5470c6',
      lineWidth: 3,
    },
    showSymbol: true,
  }, xScale, yScale, coordinate)
  lineSeries.render(renderer)

  renderer.render()
}

/**
 * 初始化柱状图
 */
function initBarChart() {
  const container = document.getElementById('bar-chart')
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new CanvasRenderer(container)
  renderer.init(container, width, height)

  const padding = { left: 60, right: 30, top: 40, bottom: 50 }

  // 比例尺
  const xScale = new LinearScale({
    domain: [0, salesData.length - 1],
    range: [0, 1],
  })

  const yScale = new LinearScale({
    domain: [0, Math.max(...salesData) * 1.2],
    range: [0, 1],
  })

  // 坐标系
  const coordinate = new CartesianCoordinate({
    x: [padding.left, width - padding.right],
    y: [height - padding.bottom, padding.top],
  })

  // 渲染
  renderer.clear()

  // 标题
  const title = new Title({
    type: 'title',
    text: '月度销售额',
    x: width / 2,
    y: 20,
    textStyle: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
    },
  })
  title.render(renderer)

  // X轴
  const xAxis = new Axis({
    type: 'axis',
    orientation: 'bottom',
    scale: xScale,
    coordinate,
    data: months,
  })
  xAxis.render(renderer)

  // Y轴
  const yAxis = new Axis({
    type: 'axis',
    orientation: 'left',
    scale: yScale,
    coordinate,
    tickCount: 5,
  })
  yAxis.render(renderer)

  // 柱状图
  const barSeries = new BarSeries({
    type: 'bar',
    data: salesData,
    barBorderRadius: [4, 4, 0, 0],
    itemStyle: {
      color: '#91cc75',
    },
    label: {
      show: true,
      position: 'top',
    },
  }, xScale, yScale, coordinate)
  barSeries.render(renderer)

  renderer.render()
}

/**
 * 初始化饼图
 */
function initPieChart() {
  const container = document.getElementById('pie-chart')
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new CanvasRenderer(container)
  renderer.init(container, width, height)

  renderer.clear()

  // 饼图
  const pieSeries = new PieSeries({
    type: 'pie',
    data: [
      { value: 335, name: '直接访问' },
      { value: 310, name: '邮件营销' },
      { value: 234, name: '联盟广告' },
      { value: 135, name: '视频广告' },
      { value: 1548, name: '搜索引擎' },
    ],
    radius: '65%',
    center: ['50%', '55%'],
    label: {
      show: true,
      position: 'outside',
      formatter: '{name}: {percent}',
    },
    labelLine: {
      show: true,
      length: 15,
      length2: 10,
    },
  }, width, height)
  pieSeries.render(renderer)

  // 标题
  const title = new Title({
    type: 'title',
    text: '访问来源',
    x: width / 2,
    y: 20,
    textStyle: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
    },
  })
  title.render(renderer)

  renderer.render()
}

/**
 * 初始化环形图
 */
function initDonutChart() {
  const container = document.getElementById('donut-chart')
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new CanvasRenderer(container)
  renderer.init(container, width, height)

  renderer.clear()

  // 环形图
  const pieSeries = new PieSeries({
    type: 'pie',
    data: [
      { value: 40, name: '产品A' },
      { value: 30, name: '产品B' },
      { value: 20, name: '产品C' },
      { value: 10, name: '产品D' },
    ],
    radius: ['40%', '70%'],
    center: ['50%', '55%'],
    label: {
      show: true,
      position: 'inside',
      formatter: '{percent}',
      color: '#fff',
    },
  }, width, height)
  pieSeries.render(renderer)

  // 标题
  const title = new Title({
    type: 'title',
    text: '产品分布',
    x: width / 2,
    y: 20,
    textStyle: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
    },
  })
  title.render(renderer)

  renderer.render()
}

/**
 * 初始化散点图
 */
function initScatterChart() {
  const container = document.getElementById('scatter-chart')
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new CanvasRenderer(container)
  renderer.init(container, width, height)

  const padding = { left: 60, right: 30, top: 40, bottom: 50 }

  // 生成随机散点数据
  const scatterData = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 5,
  }))

  // 比例尺
  const xScale = new LinearScale({
    domain: [0, 100],
    range: [0, 1],
  })

  const yScale = new LinearScale({
    domain: [0, 100],
    range: [0, 1],
  })

  // 坐标系
  const coordinate = new CartesianCoordinate({
    x: [padding.left, width - padding.right],
    y: [height - padding.bottom, padding.top],
  })

  renderer.clear()

  // 标题
  const title = new Title({
    type: 'title',
    text: '数据分布',
    x: width / 2,
    y: 20,
    textStyle: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
    },
  })
  title.render(renderer)

  // X轴
  const xAxis = new Axis({
    type: 'axis',
    orientation: 'bottom',
    scale: xScale,
    coordinate,
    tickCount: 5,
  })
  xAxis.render(renderer)

  // Y轴
  const yAxis = new Axis({
    type: 'axis',
    orientation: 'left',
    scale: yScale,
    coordinate,
    tickCount: 5,
  })
  yAxis.render(renderer)

  // 散点图
  const scatterSeries = new ScatterSeries({
    type: 'scatter',
    data: scatterData,
    symbolSize: 12,
    itemStyle: {
      color: '#ee6666',
      opacity: 0.8,
    },
  }, xScale, yScale, coordinate)
  scatterSeries.render(renderer)

  renderer.render()
}

/**
 * 初始化面积图
 */
function initAreaChart() {
  const container = document.getElementById('area-chart')
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new CanvasRenderer(container)
  renderer.init(container, width, height)

  const padding = { left: 60, right: 30, top: 40, bottom: 50 }

  // 比例尺
  const xScale = new LinearScale({
    domain: [0, visitData.length - 1],
    range: [0, 1],
  })

  const yScale = new LinearScale({
    domain: [0, Math.max(...visitData) * 1.2],
    range: [0, 1],
  })

  // 坐标系
  const coordinate = new CartesianCoordinate({
    x: [padding.left, width - padding.right],
    y: [height - padding.bottom, padding.top],
  })

  renderer.clear()

  // 标题
  const title = new Title({
    type: 'title',
    text: '网站访问量',
    x: width / 2,
    y: 20,
    textStyle: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
    },
  })
  title.render(renderer)

  // X轴
  const xAxis = new Axis({
    type: 'axis',
    orientation: 'bottom',
    scale: xScale,
    coordinate,
    data: months,
  })
  xAxis.render(renderer)

  // Y轴
  const yAxis = new Axis({
    type: 'axis',
    orientation: 'left',
    scale: yScale,
    coordinate,
    tickCount: 5,
  })
  yAxis.render(renderer)

  // 面积图
  const areaSeries = new AreaSeries({
    type: 'area',
    data: visitData,
    areaStyle: {
      fill: 'rgba(115, 192, 222, 0.4)',
    },
    lineStyle: {
      stroke: '#73c0de',
      lineWidth: 2,
    },
    showSymbol: true,
  }, xScale, yScale, coordinate)
  areaSeries.render(renderer)

  renderer.render()
}

/**
 * 初始化所有图表
 */
function initAllCharts() {
  initLineChart()
  initBarChart()
  initPieChart()
  initDonutChart()
  initScatterChart()
  initAreaChart()
}

/**
 * 导航标签切换
 */
function setupNavigation() {
  const buttons = document.querySelectorAll('.nav-tabs button')
  const cards = document.querySelectorAll('.chart-card')

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const view = button.getAttribute('data-view')

      // 更新按钮状态
      buttons.forEach(b => b.classList.remove('active'))
      button.classList.add('active')

      // 显示/隐藏卡片
      cards.forEach(card => {
        const type = card.getAttribute('data-type')
        if (view === 'all' || type === view) {
          (card as HTMLElement).style.display = 'block'
        } else {
          (card as HTMLElement).style.display = 'none'
        }
      })
    })
  })
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initAllCharts()
  setupNavigation()

  // 监听窗口大小变化，重新绘制图表
  let resizeTimeout: number
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(initAllCharts, 200)
  })
})
