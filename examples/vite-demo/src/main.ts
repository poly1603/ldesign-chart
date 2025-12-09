/**
 * LDesign Chart 示例 - 主入口（模块化版本）
 * 展示所有图表类型
 * 支持 URL 路由和浅色/深色主题切换
 */

import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Gauge,
  Filter,
  CircleDot,
  TrendingUp,
  Flame,
  Network,
  GitBranch,
  Workflow,
  BarChart2,
  Layers,
  Home,
  LayoutGrid,
  ScatterChart,
} from 'lucide'
import { createElement } from 'lucide'

// 主题管理
type Theme = 'light' | 'dark'

function getStoredTheme(): Theme {
  return (localStorage.getItem('chart-theme') as Theme) || 'dark'
}

function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('chart-theme', theme)
}

function getCurrentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') as Theme || 'dark'
}

// 获取当前主题的颜色配置
export function getThemeColors() {
  const isDark = getCurrentTheme() === 'dark'
  return {
    textColor: isDark ? '#e2e8f0' : '#334155',
    gridColor: isDark ? '#334155' : '#e2e8f0',
    bgColor: isDark ? '#1e293b' : '#ffffff',
  }
}

// 导入图表模块
import {
  // 折线图
  initLineChart,
  initSmoothLineChart,
  initDashedLineChart,
  initNullLineChart,
  initMultiStyleLineChart,
  initCustomSymbolLineChart,
  initStepLineChart,
  initStackedLineChart,
  initStackedAreaChart,
  initGradientAreaChart,
  initConfidenceBandChart,
  initDualAxisChart,
  initLineWithMarklineChart,
  initBumpChart,
  initNegativeAreaChart,
  initLargeScaleLineChart,
  disposeAllLineCharts,
  // 柱状图
  initBarChart,
  initStackedBarChart,
  initGroupedBarChart,
  initHorizontalBarChart,
  initNegativeBarChart,
  initWaterfallChart,
  initGradientBarChart,
  initPolarBarChart,
  disposeAllBarCharts,
  // 饼图
  initPieChart,
  initDonutChart,
  initRoseChart,
  initHalfPieChart,
  initNestedPieChart,
  disposeAllPieCharts,
  // 散点图
  initScatterChart,
  initBubbleChart,
  initMultiScatterChart,
  initQuadrantScatterChart,
  disposeAllScatterCharts,
} from './charts'

// 类型定义
interface ChartConfig {
  id: string
  title: string
  subtitle?: string
  description?: string
  type: 'line' | 'bar' | 'pie' | 'scatter'
  icon?: unknown
  init: () => void
}

interface NavItem {
  id: string
  label: string
  icon: unknown
}

interface NavSection {
  title: string
  items: NavItem[]
}

// 导航配置
const navSections: NavSection[] = [
  { title: '概览', items: [{ id: 'all', label: '所有图表', icon: Home }] },
  {
    title: '基础图表',
    items: [
      { id: 'line', label: '折线图', icon: LineChart },
      { id: 'bar', label: '柱状图', icon: BarChart3 },
      { id: 'area', label: '面积图', icon: Activity },
      { id: 'scatter', label: '散点图', icon: ScatterChart },
    ],
  },
  {
    title: '比例图表',
    items: [
      { id: 'pie', label: '饼图 / 环形图', icon: PieChart },
      { id: 'funnel', label: '漏斗图', icon: Filter },
    ],
  },
  {
    title: '高级图表',
    items: [
      { id: 'radar', label: '雷达图', icon: Target },
      { id: 'gauge', label: '仪表盘', icon: Gauge },
      { id: 'progress', label: '环形进度', icon: CircleDot },
    ],
  },
  {
    title: '统计图表',
    items: [
      { id: 'candlestick', label: 'K线图', icon: TrendingUp },
      { id: 'heatmap', label: '热力图', icon: Flame },
    ],
  },
  {
    title: '关系图表',
    items: [
      { id: 'graph', label: '关系图', icon: Network },
      { id: 'tree', label: '树图', icon: GitBranch },
      { id: 'sankey', label: '桑基图', icon: Workflow },
    ],
  },
  {
    title: '特殊图表',
    items: [
      { id: 'pictorial', label: '象形柱图', icon: BarChart2 },
      { id: 'mixed', label: '混合图表', icon: Layers },
    ],
  },
]

// 图表配置列表
const chartConfigs: ChartConfig[] = [
  // 折线图系列 (16种)
  { id: 'line-chart', title: '基础折线图', subtitle: '多系列数据对比', icon: LineChart, type: 'line', init: initLineChart },
  { id: 'smooth-line-chart', title: '平滑折线图', subtitle: '贝塞尔曲线平滑', icon: LineChart, type: 'line', init: initSmoothLineChart },
  { id: 'stacked-line-chart', title: '堆叠折线图', subtitle: '多系列堆叠展示', icon: LineChart, type: 'line', init: initStackedLineChart },
  { id: 'stacked-area-chart', title: '堆叠面积图', subtitle: '区域填充堆叠', icon: LineChart, type: 'line', init: initStackedAreaChart },
  { id: 'gradient-area-chart', title: '渐变面积图', subtitle: '渐变填充效果', icon: LineChart, type: 'line', init: initGradientAreaChart },
  { id: 'step-line-chart', title: '阶梯折线图', subtitle: '阶梯状连接', icon: LineChart, type: 'line', init: initStepLineChart },
  { id: 'dashed-line-chart', title: '虚线折线图', subtitle: '实际值+预测值', icon: LineChart, type: 'line', init: initDashedLineChart },
  { id: 'null-line-chart', title: '空值折线图', subtitle: '数据断点处理', icon: LineChart, type: 'line', init: initNullLineChart },
  { id: 'multi-style-line-chart', title: '多样式折线图', subtitle: '实线/虚线/点线', icon: LineChart, type: 'line', init: initMultiStyleLineChart },
  { id: 'custom-symbol-line-chart', title: '自定义点样式', subtitle: '圆形/方形/三角', icon: LineChart, type: 'line', init: initCustomSymbolLineChart },
  { id: 'dual-axis-chart', title: '双Y轴折线图', subtitle: '双坐标轴展示', icon: LineChart, type: 'line', init: initDualAxisChart },
  { id: 'line-markline-chart', title: '标记线折线图', subtitle: '平均值/最大值标记', icon: LineChart, type: 'line', init: initLineWithMarklineChart },
  { id: 'bump-chart', title: '排名变化图', subtitle: 'Bump Chart', icon: LineChart, type: 'line', init: initBumpChart },
  { id: 'negative-area-chart', title: '正负区域图', subtitle: '正负值分色填充', icon: LineChart, type: 'line', init: initNegativeAreaChart },
  { id: 'large-scale-line-chart', title: '大数据量折线图', subtitle: '200个数据点', icon: LineChart, type: 'line', init: initLargeScaleLineChart },
  { id: 'confidence-band-chart', title: '置信区间图', subtitle: '上下界区间带', icon: LineChart, type: 'line', init: initConfidenceBandChart },

  // 柱状图系列 (8种)
  { id: 'bar-chart', title: '基础柱状图', subtitle: '圆角柱形展示', icon: BarChart3, type: 'bar', init: initBarChart },
  { id: 'stacked-bar-chart', title: '堆叠柱状图', subtitle: '多系列堆叠', icon: BarChart3, type: 'bar', init: initStackedBarChart },
  { id: 'grouped-bar-chart', title: '分组柱状图', subtitle: '多年度对比', icon: BarChart3, type: 'bar', init: initGroupedBarChart },
  { id: 'horizontal-bar-chart', title: '横向柱状图', subtitle: '水平条形展示', icon: BarChart3, type: 'bar', init: initHorizontalBarChart },
  { id: 'negative-bar-chart', title: '正负柱状图', subtitle: '正负值分色', icon: BarChart3, type: 'bar', init: initNegativeBarChart },
  { id: 'waterfall-chart', title: '瀑布图', subtitle: '累积变化展示', icon: BarChart3, type: 'bar', init: initWaterfallChart },
  { id: 'gradient-bar-chart', title: '渐变柱状图', subtitle: '渐变填充柱形', icon: BarChart3, type: 'bar', init: initGradientBarChart },
  { id: 'polar-bar-chart', title: '极坐标柱状图', subtitle: '环形扇形柱', icon: BarChart3, type: 'bar', init: initPolarBarChart },

  // 饼图系列 (5种)
  { id: 'pie-chart', title: '饼图', subtitle: '数据占比分析', icon: PieChart, type: 'pie', init: initPieChart },
  { id: 'donut-chart', title: '环形图', subtitle: '中空饼图展示', icon: PieChart, type: 'pie', init: initDonutChart },
  { id: 'rose-chart', title: '玫瑰图', subtitle: '南丁格尔图', icon: PieChart, type: 'pie', init: initRoseChart },
  { id: 'half-pie-chart', title: '半圆饼图', subtitle: '半环形展示', icon: PieChart, type: 'pie', init: initHalfPieChart },
  { id: 'nested-pie-chart', title: '嵌套饼图', subtitle: '多层级嵌套', icon: PieChart, type: 'pie', init: initNestedPieChart },

  // 散点图系列 (4种)
  { id: 'scatter-chart', title: '散点图', subtitle: '多维数据展示', icon: ScatterChart, type: 'scatter', init: initScatterChart },
  { id: 'bubble-chart', title: '气泡图', subtitle: '三维数据展示', icon: ScatterChart, type: 'scatter', init: initBubbleChart },
  { id: 'multi-scatter-chart', title: '多系列散点图', subtitle: '分类散点对比', icon: ScatterChart, type: 'scatter', init: initMultiScatterChart },
  { id: 'quadrant-scatter-chart', title: '象限散点图', subtitle: '四象限分析', icon: ScatterChart, type: 'scatter', init: initQuadrantScatterChart },
]

// 初始化 UI
function initUI(): void {
  // Logo 图标
  const logoIcon = document.getElementById('logo-icon')
  if (logoIcon) {
    logoIcon.appendChild(createElement(LayoutGrid))
  }

  // 导航
  const navContainer = document.getElementById('nav-container')
  if (navContainer) {
    navSections.forEach((section) => {
      const sectionEl = document.createElement('div')
      sectionEl.className = 'nav-section'
      sectionEl.innerHTML = `<div class="nav-title">${section.title}</div>`

      section.items.forEach((item) => {
        const itemEl = document.createElement('a')
        itemEl.href = `#${item.id}`
        itemEl.className = 'nav-item'
        itemEl.innerHTML = `<span class="nav-icon"></span>${item.label}`
        itemEl.querySelector('.nav-icon')?.appendChild(createElement(item.icon as Parameters<typeof createElement>[0]))

        itemEl.addEventListener('click', (e) => {
          e.preventDefault()
          setHash(item.id)
          filterCharts(item.id)
          updateNavActive(item.id)
        })

        sectionEl.appendChild(itemEl)
      })

      navContainer.appendChild(sectionEl)
    })
  }

  // 图表网格
  const chartsGrid = document.getElementById('charts-grid')
  if (chartsGrid) {
    chartConfigs.forEach((config) => {
      const card = document.createElement('div')
      card.className = 'chart-card'
      card.setAttribute('data-type', config.type)
      card.innerHTML = `
        <div class="chart-header">
          <div class="chart-icon"></div>
          <div class="chart-info">
            <div class="chart-title">${config.title}</div>
            <div class="chart-subtitle">${config.subtitle}</div>
          </div>
        </div>
        <div class="chart-container" id="${config.id}"></div>
      `
      card.querySelector('.chart-icon')?.appendChild(createElement(config.icon as Parameters<typeof createElement>[0]))
      chartsGrid.appendChild(card)
    })
  }
}

// 筛选图表
function filterCharts(type: string): void {
  const cards = document.querySelectorAll('.chart-card')
  cards.forEach((card) => {
    const cardType = card.getAttribute('data-type')
    if (type === 'all' || cardType === type) {
      (card as HTMLElement).style.display = 'block'
    } else {
      (card as HTMLElement).style.display = 'none'
    }
  })
}

// 更新导航高亮状态
function updateNavActive(type: string): void {
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.remove('active')
    if (el.getAttribute('href') === `#${type}`) {
      el.classList.add('active')
    }
  })
}

// 从 URL hash 获取当前类型
function getHashType(): string {
  const hash = window.location.hash.slice(1)
  return hash || 'all'
}

// 设置 URL hash
function setHash(type: string): void {
  window.history.pushState(null, '', `#${type}`)
}

// 初始化所有图表
function initCharts(): void {
  chartConfigs.forEach((config) => {
    try {
      config.init()
    } catch (error) {
      console.error(`Failed to initialize chart: ${config.id}`, error)
    }
  })
}

// 销毁所有图表实例
function disposeAllCharts(): void {
  disposeAllLineCharts()
  disposeAllBarCharts()
  disposeAllPieCharts()
  disposeAllScatterCharts()
}

// 重新初始化所有图表（用于主题切换）
function reinitCharts(): void {
  // 先销毁所有图表实例
  disposeAllCharts()
  // 重新初始化
  initCharts()
}

// 渲染模式管理
type RendererMode = 'canvas' | 'svg'
let currentRenderer: RendererMode = 'canvas'

function getStoredRenderer(): RendererMode {
  return (localStorage.getItem('chart-renderer') as RendererMode) || 'canvas'
}

function setRenderer(mode: RendererMode): void {
  currentRenderer = mode
  localStorage.setItem('chart-renderer', mode)
  const btn = document.getElementById('renderer-toggle')
  if (btn) {
    btn.textContent = mode === 'canvas' ? 'Canvas' : 'SVG'
    btn.title = mode === 'canvas' ? '当前: Canvas 渲染' : '当前: SVG 渲染 (开发中)'
  }
}

export function getRendererMode(): RendererMode {
  return currentRenderer
}

// 初始化渲染模式切换
function initRendererToggle(): void {
  const toggleBtn = document.getElementById('renderer-toggle')
  if (!toggleBtn) return

  // 恢复保存的渲染模式
  const savedRenderer = getStoredRenderer()
  setRenderer(savedRenderer)
  toggleBtn.textContent = savedRenderer === 'canvas' ? 'Canvas' : 'SVG'
  toggleBtn.title = savedRenderer === 'canvas' ? 'Canvas 渲染模式' : 'SVG 渲染模式'

  toggleBtn.addEventListener('click', () => {
    const newMode: RendererMode = currentRenderer === 'canvas' ? 'svg' : 'canvas'
    setRenderer(newMode)
    toggleBtn.textContent = newMode === 'canvas' ? 'Canvas' : 'SVG'
    toggleBtn.title = newMode === 'canvas' ? 'Canvas 渲染模式' : 'SVG 渲染模式'
    // 重新初始化所有图表以应用新渲染模式
    reinitCharts()
  })
}

// 初始化主题切换
function initThemeToggle(): void {
  const toggleBtn = document.getElementById('theme-toggle')
  if (!toggleBtn) return

  // 恢复保存的主题
  const savedTheme = getStoredTheme()
  setTheme(savedTheme)

  toggleBtn.addEventListener('click', () => {
    const current = getCurrentTheme()
    const newTheme: Theme = current === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // 重新绘制所有图表以应用新主题
    reinitCharts()
  })
}

// 初始化路由
function initRouter(): void {
  // 处理 hash 变化
  window.addEventListener('hashchange', () => {
    const type = getHashType()
    filterCharts(type)
    updateNavActive(type)
  })

  // 初始加载时应用 hash
  const initialType = getHashType()
  filterCharts(initialType)
  updateNavActive(initialType)
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  initUI()
  initThemeToggle()
  initRendererToggle()
  initCharts()
  initRouter()
})
