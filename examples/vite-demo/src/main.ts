/**
 * LDesign Chart 示例 - 主入口
 * 展示所有图表类型
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
  Zap,
  Package,
  Palette,
  RotateCw,
  MoreVertical,
  LayoutGrid,
  ScatterChart,
} from 'lucide'
import { createElement } from 'lucide'

// 配色方案
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  green: '#22c55e',
  orange: '#f97316',
}

const TEXT_COLOR = '#94a3b8'
const GRID_COLOR = '#334155'

// Tooltip 管理
let tooltipEl: HTMLDivElement | null = null

function createTooltip(): HTMLDivElement {
  if (tooltipEl) return tooltipEl
  tooltipEl = document.createElement('div')
  tooltipEl.className = 'chart-tooltip'
  document.body.appendChild(tooltipEl)
  return tooltipEl
}

function showTooltip(x: number, y: number, content: string): void {
  const tooltip = createTooltip()
  tooltip.innerHTML = content
  tooltip.classList.add('visible')

  // 计算位置，避免超出视口
  const rect = tooltip.getBoundingClientRect()
  const left = Math.min(x + 12, window.innerWidth - rect.width - 20)
  const top = Math.min(y + 12, window.innerHeight - rect.height - 20)

  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
}

function hideTooltip(): void {
  if (tooltipEl) {
    tooltipEl.classList.remove('visible')
  }
}

// 获取鼠标在 canvas 中的位置（支持 HiDPI）
function getMousePos(canvas: HTMLCanvasElement, e: MouseEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  // 计算实际逻辑坐标（考虑 CSS 尺寸可能与设置的尺寸不同）
  const cssWidth = rect.width
  const cssHeight = rect.height
  const logicalWidth = canvas.width / dpr
  const logicalHeight = canvas.height / dpr

  // 如果 CSS 尺寸与逻辑尺寸不同，需要缩放
  const scaleX = logicalWidth / cssWidth
  const scaleY = logicalHeight / cssHeight

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  }
}

// 创建支持 HiDPI 的 canvas
function createHiDPICanvas(container: HTMLElement, width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const dpr = window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')

  // 设置 canvas 内部尺寸（考虑 DPR）
  canvas.width = width * dpr
  canvas.height = height * dpr

  // 设置 CSS 显示尺寸
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // 缩放上下文以匹配 DPR
  ctx.scale(dpr, dpr)

  // 清空容器并添加 canvas
  container.innerHTML = ''
  container.appendChild(canvas)

  return { canvas, ctx }
}

// 根据颜色计算文字颜色（深色背景用白字，浅色背景用黑字）
function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  // 计算亮度 (YIQ公式)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000
  return luminance > 128 ? '#1e293b' : '#ffffff'
}

// 图例位置类型
type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

// 图例项接口（支持启用/禁用状态）
interface LegendItem {
  name: string
  color: string
  enabled?: boolean
}

// 图例点击区域
interface LegendHitArea {
  name: string
  x: number
  y: number
  width: number
  height: number
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  items: LegendItem[],
  width: number,
  height: number,
  position: LegendPosition = 'top-right'
): { legendHeight: number; legendWidth: number; hitAreas: LegendHitArea[] } {
  const dotSize = 8
  const itemPadding = 16
  const fontSize = 11
  ctx.font = `${fontSize}px Inter, sans-serif`

  // 计算图例尺寸
  let totalWidth = 0
  items.forEach((item, i) => {
    totalWidth += ctx.measureText(item.name).width + dotSize + 6 + (i < items.length - 1 ? itemPadding : 0)
  })
  const legendHeight = 20
  const legendPadding = 10

  // 根据位置计算起始坐标
  let startX = 0
  let startY = 0

  switch (position) {
    case 'top':
      startX = (width - totalWidth) / 2
      startY = legendPadding
      break
    case 'top-left':
      startX = legendPadding + 40
      startY = legendPadding
      break
    case 'top-right':
      startX = width - totalWidth - legendPadding - 20
      startY = legendPadding
      break
    case 'bottom':
      startX = (width - totalWidth) / 2
      startY = height - legendHeight - legendPadding
      break
    case 'bottom-left':
      startX = legendPadding + 40
      startY = height - legendHeight - legendPadding
      break
    case 'bottom-right':
      startX = width - totalWidth - legendPadding - 20
      startY = height - legendHeight - legendPadding
      break
  }

  // 绘制图例项
  let currentX = startX
  const hitAreas: LegendHitArea[] = []

  items.forEach((item) => {
    const isEnabled = item.enabled !== false
    const itemWidth = ctx.measureText(item.name).width + dotSize + 6

    // 记录点击区域
    hitAreas.push({
      name: item.name,
      x: currentX - 4,
      y: startY - 4,
      width: itemWidth + 8,
      height: legendHeight + 8,
    })

    // 绘制圆点
    ctx.beginPath()
    ctx.arc(currentX + dotSize / 2, startY + legendHeight / 2, dotSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = isEnabled ? item.color : '#64748b'
    ctx.globalAlpha = isEnabled ? 1 : 0.4
    ctx.fill()

    // 绘制文字
    ctx.fillStyle = TEXT_COLOR
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.name, currentX + dotSize + 6, startY + legendHeight / 2)

    currentX += ctx.measureText(item.name).width + dotSize + 6 + itemPadding
  })

  ctx.globalAlpha = 1
  return { legendHeight: legendHeight + legendPadding * 2, legendWidth: totalWidth, hitAreas }
}

// 图表配置接口
interface ChartConfig {
  id: string
  title: string
  subtitle: string
  icon: object
  type: string
  init: () => void
}

// 导航配置接口
interface NavSection {
  title: string
  items: { id: string; label: string; icon: object }[]
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

// 辅助函数 - 绘制网格
function drawGrid(
  ctx: CanvasRenderingContext2D,
  chartRect: { x: number; y: number; width: number; height: number },
  xCount: number,
  yCount: number
): void {
  const xStep = chartRect.width / xCount
  const yStep = chartRect.height / yCount

  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth = 1

  for (let i = 0; i <= yCount; i++) {
    const y = chartRect.y + yStep * i
    ctx.beginPath()
    ctx.moveTo(chartRect.x, y)
    ctx.lineTo(chartRect.x + chartRect.width, y)
    ctx.globalAlpha = 0.5
    ctx.stroke()
  }

  for (let i = 0; i <= xCount; i++) {
    const x = chartRect.x + xStep * i
    ctx.beginPath()
    ctx.moveTo(x, chartRect.y)
    ctx.lineTo(x, chartRect.y + chartRect.height)
    ctx.globalAlpha = 0.3
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// 辅助函数 - 绘制X轴
function drawXAxis(
  ctx: CanvasRenderingContext2D,
  chartRect: { x: number; y: number; width: number; height: number },
  labels: string[],
  align: 'center' | 'onZero' = 'center'
): void {
  const count = labels.length
  const step = align === 'onZero' ? chartRect.width / (count - 1) : chartRect.width / count

  ctx.fillStyle = TEXT_COLOR
  ctx.font = '11px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  labels.forEach((label, i) => {
    let x = chartRect.x + step * i
    if (align === 'center') {
      x += step / 2
    }
    ctx.fillText(label, x, chartRect.y + chartRect.height + 20)
  })
}

// 辅助函数 - 绘制Y轴
function drawYAxis(
  ctx: CanvasRenderingContext2D,
  chartRect: { x: number; y: number; width: number; height: number },
  min: number,
  max: number,
  count: number
): void {
  const step = (max - min) / count
  const yStep = chartRect.height / count

  ctx.fillStyle = TEXT_COLOR
  ctx.font = '11px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  for (let i = 0; i <= count; i++) {
    const value = Math.round(max - step * i)
    const y = chartRect.y + yStep * i
    ctx.fillText(String(value), chartRect.x - 10, y)
  }
}

// 折线图
function initLineChart(): void {
  const container = document.getElementById('line-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 40, bottom: 40 } // 增加top为图例留空间
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '销售额', data: [150, 230, 224, 218, 135, 147, 260], color: COLORS.primary, enabled: true },
    { name: '利润', data: [80, 120, 160, 140, 180, 200, 190], color: COLORS.success, enabled: true },
  ]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)
  const yScale = chartRect.height / 300

  let hoverIndex = -1
  let legendHitAreas: LegendHitArea[] = []

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制图例（带点击区域）
    const legendResult = drawLegend(ctx, series.map(s => ({ name: s.name, color: s.color, enabled: s.enabled })), width, height, 'top-right')
    legendHitAreas = legendResult.hitAreas

    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, 300, 5)

    // 绘制悬停竖线
    if (highlightIdx >= 0) {
      const hx = chartRect.x + xStep * highlightIdx
      ctx.beginPath()
      ctx.moveTo(hx, chartRect.y)
      ctx.lineTo(hx, chartRect.y + chartRect.height)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // 绘制线条（只绘制启用的系列）
    series.forEach((s) => {
      if (!s.enabled) return

      ctx.beginPath()
      s.data.forEach((v, i) => {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - v * yScale
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = s.color
      ctx.lineWidth = 2.5
      ctx.stroke()

      // 数据点
      s.data.forEach((v, i) => {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - v * yScale
        const isHover = i === highlightIdx
        ctx.beginPath()
        ctx.arc(x, y, isHover ? 6 : 4, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.fill()
        if (isHover) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.filter(s => s.enabled).map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })

  // 图例点击切换
  canvas.addEventListener('click', (e) => {
    const pos = getMousePos(canvas, e)
    for (const area of legendHitAreas) {
      if (pos.x >= area.x && pos.x <= area.x + area.width &&
        pos.y >= area.y && pos.y <= area.y + area.height) {
        const s = series.find(item => item.name === area.name)
        if (s) {
          s.enabled = !s.enabled
          draw(hoverIndex)
        }
        break
      }
    }
  })
}

// 平滑折线图
function initSmoothLineChart(): void {
  const container = document.getElementById('smooth-line-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [820, 932, 901, 934, 1290, 1330, 1320]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)
  const maxVal = Math.max(...data) * 1.2
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  // 贝塞尔曲线平滑
  function getControlPoints(p0: { x: number, y: number }, p1: { x: number, y: number }, p2: { x: number, y: number }, t: number = 0.3) {
    const d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2))
    const d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    const fa = t * d01 / (d01 + d12)
    const fb = t * d12 / (d01 + d12)
    return {
      cp1: { x: p1.x - fa * (p2.x - p0.x), y: p1.y - fa * (p2.y - p0.y) },
      cp2: { x: p1.x + fb * (p2.x - p0.x), y: p1.y + fb * (p2.y - p0.y) }
    }
  }

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    // 计算点坐标
    const points = data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - v * yScale
    }))

    // 绘制平滑曲线
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]

      const cp1 = i === 0 ? p1 : getControlPoints(p0, p1, p2).cp2
      const cp2 = i === points.length - 2 ? p2 : getControlPoints(p1, p2, p3).cp1

      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y)
    }

    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 数据点
    points.forEach((p, i) => {
      const isHover = i === highlightIdx
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.primary
      ctx.fill()
      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>数值<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 堆叠折线图
function initStackedLineChart(): void {
  const container = document.getElementById('stacked-line-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], color: '#5470c6', enabled: true },
    { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], color: '#91cc75', enabled: true },
    { name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410], color: '#fac858', enabled: true },
    { name: '直接访问', data: [320, 332, 301, 334, 390, 330, 320], color: '#ee6666', enabled: true },
    { name: '搜索引擎', data: [820, 932, 901, 934, 1290, 1330, 1320], color: '#73c0de', enabled: true },
  ]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)

  // 计算堆叠数据
  const stackedData = series.map((s, si) => {
    return s.data.map((v, i) => {
      let sum = v
      for (let j = 0; j < si; j++) {
        if (series[j].enabled) sum += series[j].data[i]
      }
      return sum
    })
  })

  const maxVal = Math.max(...stackedData[stackedData.length - 1]) * 1.1
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1
  let legendHitAreas: LegendHitArea[] = []

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    const legendResult = drawLegend(ctx, series.map(s => ({ name: s.name, color: s.color, enabled: s.enabled })), width, height, 'top')
    legendHitAreas = legendResult.hitAreas

    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    // 从后往前绘制（底层先画）
    for (let si = series.length - 1; si >= 0; si--) {
      if (!series[si].enabled) continue

      const currentData = stackedData[si]
      ctx.beginPath()
      currentData.forEach((v, i) => {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - v * yScale
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = series[si].color
      ctx.lineWidth = 2
      ctx.stroke()

      // 数据点
      currentData.forEach((v, i) => {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - v * yScale
        const isHover = i === highlightIdx
        ctx.beginPath()
        ctx.arc(x, y, isHover ? 5 : 3, 0, Math.PI * 2)
        ctx.fillStyle = series[si].color
        ctx.fill()
      })
    }
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.filter(s => s.enabled).map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })

  canvas.addEventListener('click', (e) => {
    const pos = getMousePos(canvas, e)
    for (const area of legendHitAreas) {
      if (pos.x >= area.x && pos.x <= area.x + area.width &&
        pos.y >= area.y && pos.y <= area.y + area.height) {
        const s = series.find(item => item.name === area.name)
        if (s) {
          s.enabled = !s.enabled
          draw(hoverIndex)
        }
        break
      }
    }
  })
}

// 堆叠面积图
function initStackedAreaChart(): void {
  const container = document.getElementById('stacked-area-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '邮件', data: [120, 132, 101, 134, 90, 230, 210], color: '#5470c6' },
    { name: '广告', data: [220, 182, 191, 234, 290, 330, 310], color: '#91cc75' },
    { name: '视频', data: [150, 232, 201, 154, 190, 330, 410], color: '#fac858' },
    { name: '直接', data: [320, 332, 301, 334, 390, 330, 320], color: '#ee6666' },
  ]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)

  // 计算累积数据
  const accumulatedData: number[][] = []
  for (let i = 0; i < series.length; i++) {
    accumulatedData[i] = series[i].data.map((v, j) => {
      let sum = v
      for (let k = 0; k < i; k++) {
        sum += series[k].data[j]
      }
      return sum
    })
  }

  const maxVal = Math.max(...accumulatedData[accumulatedData.length - 1]) * 1.1
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    drawLegend(ctx, series.map(s => ({ name: s.name, color: s.color })), width, height, 'top')
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    // 从后往前绘制面积
    for (let si = series.length - 1; si >= 0; si--) {
      const currentData = accumulatedData[si]
      const prevData = si > 0 ? accumulatedData[si - 1] : labels.map(() => 0)

      ctx.beginPath()
      // 上边界
      currentData.forEach((v, i) => {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - v * yScale
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      // 下边界（反向）
      for (let i = prevData.length - 1; i >= 0; i--) {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - prevData[i] * yScale
        ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = series[si].color
      ctx.globalAlpha = 0.7
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // 绘制边线
    for (let si = series.length - 1; si >= 0; si--) {
      const currentData = accumulatedData[si]
      ctx.beginPath()
      currentData.forEach((v, i) => {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - v * yScale
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = series[si].color
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // 悬停线
    if (highlightIdx >= 0) {
      const hx = chartRect.x + xStep * highlightIdx
      ctx.beginPath()
      ctx.moveTo(hx, chartRect.y)
      ctx.lineTo(hx, chartRect.y + chartRect.height)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 渐变面积图
function initGradientAreaChart(): void {
  const container = document.getElementById('gradient-area-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [140, 232, 101, 264, 90, 340, 250]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)
  const maxVal = Math.max(...data) * 1.2
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    const points = data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - v * yScale
    }))

    // 创建渐变
    const gradient = ctx.createLinearGradient(0, chartRect.y, 0, chartRect.y + chartRect.height)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)')

    // 绘制填充区域
    ctx.beginPath()
    ctx.moveTo(points[0].x, chartRect.y + chartRect.height)
    points.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1].x, chartRect.y + chartRect.height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // 绘制线条
    ctx.beginPath()
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 数据点
    points.forEach((p, i) => {
      const isHover = i === highlightIdx
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.primary
      ctx.fill()
      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>数值<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 阶梯折线图
function initStepLineChart(): void {
  const container = document.getElementById('step-line-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [120, 132, 101, 134, 90, 230, 210]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)
  const maxVal = Math.max(...data) * 1.2
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    const points = data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - v * yScale
    }))

    // 绘制阶梯线
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      // 先水平，再垂直（中点阶梯）
      const midX = (points[i - 1].x + points[i].x) / 2
      ctx.lineTo(midX, points[i - 1].y)
      ctx.lineTo(midX, points[i].y)
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.strokeStyle = COLORS.success
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 数据点
    points.forEach((p, i) => {
      const isHover = i === highlightIdx
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.success
      ctx.fill()
      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.success}"></span>数值<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 气温变化折线图（带最高最低）
function initTemperatureChart(): void {
  const container = document.getElementById('temperature-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '最高温', data: [10, 11, 13, 11, 12, 12, 9], color: '#ee6666' },
    { name: '最低温', data: [1, -2, 2, 5, 3, 2, 0], color: '#5470c6' },
  ]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)
  const minVal = Math.min(...series.flatMap(s => s.data)) - 5
  const maxVal = Math.max(...series.flatMap(s => s.data)) + 5
  const yScale = chartRect.height / (maxVal - minVal)
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    drawLegend(ctx, series.map(s => ({ name: s.name, color: s.color })), width, height, 'top')
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, minVal, maxVal, 5)

    // 绘制区间填充
    const highPoints = series[0].data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - (v - minVal) * yScale
    }))
    const lowPoints = series[1].data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - (v - minVal) * yScale
    }))

    ctx.beginPath()
    highPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    for (let i = lowPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(lowPoints[i].x, lowPoints[i].y)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(238, 102, 102, 0.15)'
    ctx.fill()

    // 绘制线条
    series.forEach((s) => {
      const points = s.data.map((v, i) => ({
        x: chartRect.x + xStep * i,
        y: chartRect.y + chartRect.height - (v - minVal) * yScale
      }))

      ctx.beginPath()
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.strokeStyle = s.color
      ctx.lineWidth = 2.5
      ctx.stroke()

      // 数据点
      points.forEach((p, i) => {
        const isHover = i === highlightIdx
        ctx.beginPath()
        ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.fill()
        if (isHover) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}°C</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 双Y轴折线图
function initDualAxisChart(): void {
  const container = document.getElementById('dual-axis-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 50, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '蒸发量', data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6], color: '#5470c6', yAxisIndex: 0 },
    { name: '降水量', data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6], color: '#91cc75', yAxisIndex: 0 },
    { name: '温度', data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3], color: '#ee6666', yAxisIndex: 1 },
  ]
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
  const xStep = chartRect.width / (labels.length - 1)

  const maxVal0 = Math.max(...series.filter(s => s.yAxisIndex === 0).flatMap(s => s.data)) * 1.2
  const maxVal1 = Math.max(...series.filter(s => s.yAxisIndex === 1).flatMap(s => s.data)) * 1.2
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    drawLegend(ctx, series.map(s => ({ name: s.name, color: s.color })), width, height, 'top')
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')

    // 左Y轴
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= 5; i++) {
      const val = Math.round(maxVal0 / 5 * (5 - i))
      const y = chartRect.y + chartRect.height / 5 * i
      ctx.fillText(String(val), chartRect.x - 10, y)
    }

    // 右Y轴
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ee6666'
    for (let i = 0; i <= 5; i++) {
      const val = (maxVal1 / 5 * (5 - i)).toFixed(1)
      const y = chartRect.y + chartRect.height / 5 * i
      ctx.fillText(val + '°C', chartRect.x + chartRect.width + 10, y)
    }

    // 绘制线条
    series.forEach((s) => {
      const maxVal = s.yAxisIndex === 0 ? maxVal0 : maxVal1
      const yScale = chartRect.height / maxVal
      const points = s.data.map((v, i) => ({
        x: chartRect.x + xStep * i,
        y: chartRect.y + chartRect.height - v * yScale
      }))

      ctx.beginPath()
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.strokeStyle = s.color
      ctx.lineWidth = 2.5
      ctx.stroke()

      // 数据点
      points.forEach((p, i) => {
        const isHover = i === highlightIdx
        ctx.beginPath()
        ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.fill()
        if (isHover) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}${s.yAxisIndex === 1 ? '°C' : 'ml'}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 渐变堆叠面积图
function initGradientStackedAreaChart(): void {
  const container = document.getElementById('gradient-stacked-area-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '邮件', data: [120, 132, 101, 134, 90, 230, 210], colors: ['rgba(128, 255, 165, 0.8)', 'rgba(1, 191, 236, 0.1)'] },
    { name: '广告', data: [220, 182, 191, 234, 290, 330, 310], colors: ['rgba(0, 221, 255, 0.8)', 'rgba(77, 119, 255, 0.1)'] },
    { name: '视频', data: [150, 232, 201, 154, 190, 330, 410], colors: ['rgba(55, 162, 255, 0.8)', 'rgba(116, 21, 219, 0.1)'] },
    { name: '直接', data: [320, 332, 301, 334, 390, 330, 320], colors: ['rgba(255, 0, 135, 0.8)', 'rgba(135, 0, 157, 0.1)'] },
    { name: '搜索', data: [820, 932, 901, 934, 1290, 1330, 1320], colors: ['rgba(255, 191, 0, 0.8)', 'rgba(224, 62, 76, 0.1)'] },
  ]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)

  // 计算累积数据
  const accumulatedData: number[][] = []
  for (let i = 0; i < series.length; i++) {
    accumulatedData[i] = series[i].data.map((v, j) => {
      let sum = v
      for (let k = 0; k < i; k++) {
        sum += series[k].data[j]
      }
      return sum
    })
  }

  const maxVal = Math.max(...accumulatedData[accumulatedData.length - 1]) * 1.1
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    drawLegend(ctx, series.map((s) => ({ name: s.name, color: s.colors[0].replace('0.8', '1') })), width, height, 'top')
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    // 从后往前绘制面积（带渐变）
    for (let si = series.length - 1; si >= 0; si--) {
      const currentData = accumulatedData[si]
      const prevData = si > 0 ? accumulatedData[si - 1] : labels.map(() => 0)

      // 创建渐变
      const gradient = ctx.createLinearGradient(0, chartRect.y, 0, chartRect.y + chartRect.height)
      gradient.addColorStop(0, series[si].colors[0])
      gradient.addColorStop(1, series[si].colors[1])

      ctx.beginPath()
      currentData.forEach((v, i) => {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - v * yScale
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      for (let i = prevData.length - 1; i >= 0; i--) {
        const x = chartRect.x + xStep * i
        const y = chartRect.y + chartRect.height - prevData[i] * yScale
        ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // 悬停线
    if (highlightIdx >= 0) {
      const hx = chartRect.x + xStep * highlightIdx
      ctx.beginPath()
      ctx.moveTo(hx, chartRect.y)
      ctx.lineTo(hx, chartRect.y + chartRect.height)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.colors[0]}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 标记线折线图
function initLineWithMarklineChart(): void {
  const container = document.getElementById('line-markline-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [820, 932, 901, 934, 1290, 1330, 1320]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (labels.length - 1)
  const maxVal = Math.max(...data) * 1.2
  const minVal = Math.min(...data) * 0.8
  const avgVal = data.reduce((a, b) => a + b, 0) / data.length
  const yScale = chartRect.height / (maxVal - minVal)
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, Math.round(minVal), Math.round(maxVal), 5)

    const points = data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - (v - minVal) * yScale
    }))

    // 绘制线条
    ctx.beginPath()
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 绘制平均线标记
    const avgY = chartRect.y + chartRect.height - (avgVal - minVal) * yScale
    ctx.beginPath()
    ctx.setLineDash([5, 5])
    ctx.moveTo(chartRect.x, avgY)
    ctx.lineTo(chartRect.x + chartRect.width, avgY)
    ctx.strokeStyle = COLORS.warning
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])

    // 平均值标签
    ctx.fillStyle = COLORS.warning
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`平均: ${Math.round(avgVal)}`, chartRect.x + chartRect.width + 5, avgY + 4)

    // 最大值标记线
    const maxIdx = data.indexOf(Math.max(...data))
    const maxX = chartRect.x + xStep * maxIdx
    const maxY = chartRect.y + chartRect.height - (Math.max(...data) - minVal) * yScale
    ctx.beginPath()
    ctx.setLineDash([3, 3])
    ctx.moveTo(maxX, maxY)
    ctx.lineTo(maxX, chartRect.y + chartRect.height)
    ctx.strokeStyle = COLORS.danger
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.setLineDash([])

    // 最大值标签
    ctx.fillStyle = COLORS.danger
    ctx.textAlign = 'center'
    ctx.fillText(`最大: ${Math.max(...data)}`, maxX, maxY - 10)

    // 数据点
    points.forEach((p, i) => {
      const isHover = i === highlightIdx
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.primary
      ctx.fill()
      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>数值<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 排名变化图 (Bump Chart)
function initBumpChart(): void {
  const container = document.getElementById('bump-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 70, right: 70, top: 30, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // 排名数据（1-5名）
  const series = [
    { name: '产品A', ranks: [1, 2, 3, 2, 1, 1, 2], color: '#5470c6' },
    { name: '产品B', ranks: [2, 1, 1, 1, 2, 3, 1], color: '#91cc75' },
    { name: '产品C', ranks: [3, 3, 2, 3, 3, 2, 3], color: '#fac858' },
    { name: '产品D', ranks: [4, 4, 4, 4, 4, 4, 4], color: '#ee6666' },
    { name: '产品E', ranks: [5, 5, 5, 5, 5, 5, 5], color: '#73c0de' },
  ]
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
  const xStep = chartRect.width / (labels.length - 1)
  const yStep = chartRect.height / 4 // 5个排名，4个间隔
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制Y轴（排名）
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 1; i <= 5; i++) {
      const y = chartRect.y + yStep * (i - 1)
      ctx.fillText(`第${i}名`, chartRect.x - 10, y)

      // 网格线
      ctx.beginPath()
      ctx.moveTo(chartRect.x, y)
      ctx.lineTo(chartRect.x + chartRect.width, y)
      ctx.strokeStyle = GRID_COLOR
      ctx.globalAlpha = 0.5
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // X轴标签
    drawXAxis(ctx, chartRect, labels, 'onZero')

    // 绘制排名线
    series.forEach((s) => {
      const points = s.ranks.map((rank, i) => ({
        x: chartRect.x + xStep * i,
        y: chartRect.y + yStep * (rank - 1)
      }))

      // 线条
      ctx.beginPath()
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.strokeStyle = s.color
      ctx.lineWidth = 3
      ctx.stroke()

      // 数据点
      points.forEach((p, i) => {
        const isHover = i === highlightIdx
        ctx.beginPath()
        ctx.arc(p.x, p.y, isHover ? 8 : 6, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.fill()
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // 左右标签
      ctx.fillStyle = s.color
      ctx.font = 'bold 10px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(s.name, chartRect.x - 15, points[0].y)
      ctx.textAlign = 'left'
      ctx.fillText(s.name, chartRect.x + chartRect.width + 10, points[points.length - 1].y)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">第${s.ranks[idx]}名</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 负值区域折线图
function initNegativeAreaChart(): void {
  const container = document.getElementById('negative-area-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [1, -2, 2, 5, 3, 2, 0, -3, -1, 2, 4, -2]
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const xStep = chartRect.width / (labels.length - 1)
  const maxVal = Math.max(...data.map(Math.abs)) * 1.3
  const yScale = chartRect.height / (maxVal * 2)
  const zeroY = chartRect.y + chartRect.height / 2
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 网格
    drawGrid(ctx, chartRect, labels.length, 6)

    // X轴（在中间）
    ctx.beginPath()
    ctx.moveTo(chartRect.x, zeroY)
    ctx.lineTo(chartRect.x + chartRect.width, zeroY)
    ctx.strokeStyle = TEXT_COLOR
    ctx.lineWidth = 1
    ctx.stroke()

    // X轴标签
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'
    labels.forEach((label, i) => {
      const x = chartRect.x + xStep * i
      ctx.fillText(label, x, chartRect.y + chartRect.height + 15)
    })

    // Y轴标签
    ctx.textAlign = 'right'
    for (let i = -3; i <= 3; i++) {
      const val = Math.round(maxVal / 3 * i)
      const y = zeroY - val * yScale
      ctx.fillText(String(val), chartRect.x - 10, y + 4)
    }

    const points = data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: zeroY - v * yScale
    }))

    // 正值区域填充
    ctx.beginPath()
    ctx.moveTo(points[0].x, zeroY)
    points.forEach((p) => {
      const clampedY = Math.min(p.y, zeroY)
      ctx.lineTo(p.x, clampedY)
    })
    ctx.lineTo(points[points.length - 1].x, zeroY)
    ctx.closePath()
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'
    ctx.fill()

    // 负值区域填充
    ctx.beginPath()
    ctx.moveTo(points[0].x, zeroY)
    points.forEach((p) => {
      const clampedY = Math.max(p.y, zeroY)
      ctx.lineTo(p.x, clampedY)
    })
    ctx.lineTo(points[points.length - 1].x, zeroY)
    ctx.closePath()
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.fill()

    // 线条
    ctx.beginPath()
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 数据点
    points.forEach((p, i) => {
      const isHover = i === highlightIdx
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = data[i] >= 0 ? COLORS.success : COLORS.danger
      ctx.fill()
      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const color = data[idx] >= 0 ? COLORS.success : COLORS.danger
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${color}"></span>数值<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 大数据量折线图
function initLargeScaleLineChart(): void {
  const container = document.getElementById('large-scale-line-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // 生成大量数据点
  const dataCount = 200
  const data: number[] = []
  let value = 100
  for (let i = 0; i < dataCount; i++) {
    value += Math.random() * 20 - 10
    value = Math.max(0, Math.min(200, value))
    data.push(Math.round(value))
  }

  const xStep = chartRect.width / (dataCount - 1)
  const maxVal = Math.max(...data) * 1.1
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 简化的网格
    ctx.strokeStyle = GRID_COLOR
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    for (let i = 0; i <= 5; i++) {
      const y = chartRect.y + chartRect.height / 5 * i
      ctx.beginPath()
      ctx.moveTo(chartRect.x, y)
      ctx.lineTo(chartRect.x + chartRect.width, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Y轴
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    // 创建渐变填充
    const gradient = ctx.createLinearGradient(0, chartRect.y, 0, chartRect.y + chartRect.height)
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)')
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)')

    // 绘制面积
    ctx.beginPath()
    ctx.moveTo(chartRect.x, chartRect.y + chartRect.height)
    data.forEach((v, i) => {
      const x = chartRect.x + xStep * i
      const y = chartRect.y + chartRect.height - v * yScale
      ctx.lineTo(x, y)
    })
    ctx.lineTo(chartRect.x + chartRect.width, chartRect.y + chartRect.height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // 绘制线条
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = chartRect.x + xStep * i
      const y = chartRect.y + chartRect.height - v * yScale
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = COLORS.accent
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 悬停点
    if (highlightIdx >= 0 && highlightIdx < dataCount) {
      const x = chartRect.x + xStep * highlightIdx
      const y = chartRect.y + chartRect.height - data[highlightIdx] * yScale

      // 竖线
      ctx.beginPath()
      ctx.moveTo(x, chartRect.y)
      ctx.lineTo(x, chartRect.y + chartRect.height)
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 点
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.accent
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // 标题
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`共 ${dataCount} 个数据点`, chartRect.x, chartRect.y - 5)
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < dataCount && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">数据点 #${idx + 1}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.accent}"></span>数值<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 区域高亮折线图
function initAreaPiecesChart(): void {
  const container = document.getElementById('area-pieces-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // 北京AQI数据示例
  const data = [55, 44, 32, 28, 35, 65, 120, 180, 165, 95, 75, 45, 38, 52, 78, 145, 210, 185, 110, 68, 42, 35, 48, 62]
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const xStep = chartRect.width / (data.length - 1)
  const maxVal = 250
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  // AQI等级颜色
  const getAQIColor = (value: number) => {
    if (value <= 50) return '#91cc75'  // 优
    if (value <= 100) return '#fac858' // 良
    if (value <= 150) return '#ee6666' // 轻度污染
    if (value <= 200) return '#c23531' // 中度污染
    return '#5c0011'                   // 重度污染
  }

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 背景区域
    const zones = [
      { max: 50, color: 'rgba(145, 204, 117, 0.15)', label: '优' },
      { max: 100, color: 'rgba(250, 200, 88, 0.15)', label: '良' },
      { max: 150, color: 'rgba(238, 102, 102, 0.15)', label: '轻度' },
      { max: 200, color: 'rgba(194, 53, 49, 0.15)', label: '中度' },
      { max: 250, color: 'rgba(92, 0, 17, 0.15)', label: '重度' },
    ]

    let prevMax = 0
    zones.forEach((zone) => {
      const y1 = chartRect.y + chartRect.height - zone.max * yScale
      const y2 = chartRect.y + chartRect.height - prevMax * yScale
      ctx.fillStyle = zone.color
      ctx.fillRect(chartRect.x, y1, chartRect.width, y2 - y1)
      prevMax = zone.max
    })

    drawGrid(ctx, chartRect, 6, 5)
    drawYAxis(ctx, chartRect, 0, maxVal, 5)

    // X轴（简化显示）
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < data.length; i += 4) {
      const x = chartRect.x + xStep * i
      ctx.fillText(labels[i], x, chartRect.y + chartRect.height + 15)
    }

    const points = data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - v * yScale,
      value: v
    }))

    // 绘制分段填充
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const avgValue = (p1.value + p2.value) / 2
      const color = getAQIColor(avgValue)

      ctx.beginPath()
      ctx.moveTo(p1.x, chartRect.y + chartRect.height)
      ctx.lineTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.lineTo(p2.x, chartRect.y + chartRect.height)
      ctx.closePath()
      ctx.fillStyle = color.replace(')', ', 0.4)').replace('rgb', 'rgba').replace('#', 'rgba(')
      ctx.globalAlpha = 0.5
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // 绘制分段线条
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const avgValue = (p1.value + p2.value) / 2

      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = getAQIColor(avgValue)
      ctx.lineWidth = 2.5
      ctx.stroke()
    }

    // 数据点
    points.forEach((p, i) => {
      const isHover = i === highlightIdx
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHover ? 6 : 3, 0, Math.PI * 2)
      ctx.fillStyle = getAQIColor(p.value)
      ctx.fill()
      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < data.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const level = data[idx] <= 50 ? '优' : data[idx] <= 100 ? '良' : data[idx] <= 150 ? '轻度污染' : data[idx] <= 200 ? '中度污染' : '重度污染'
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${getAQIColor(data[idx])}"></span>AQI<span class="tooltip-value">${data[idx]} (${level})</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 柱状图
function initBarChart(): void {
  const container = document.getElementById('bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [150, 230, 224, 218, 135, 147]
  const labels = ['一月', '二月', '三月', '四月', '五月', '六月']
  const step = chartRect.width / labels.length
  const barWidth = step * 0.6
  const yScale = chartRect.height / 300
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, 300, 5)

    // 绘制 hover 背景阴影
    if (highlightIdx >= 0) {
      const x = chartRect.x + step * highlightIdx
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'
      ctx.fillRect(x, chartRect.y, step, chartRect.height)
    }

    data.forEach((v, i) => {
      const x = chartRect.x + step * i + (step - barWidth) / 2
      const barHeight = v * yScale
      const y = chartRect.y + chartRect.height - barHeight
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 4)
      ctx.fillStyle = isHover ? COLORS.secondary : COLORS.primary
      ctx.fill()

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < data.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>数值<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 堆叠柱状图
function initStackedBarChart(): void {
  const container = document.getElementById('stacked-bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], color: '#5470c6' },
    { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], color: '#91cc75' },
    { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], color: '#fac858' },
    { name: '视频广告', data: [150, 212, 201, 154, 190, 330, 410], color: '#ee6666' },
    { name: '搜索引擎', data: [820, 832, 901, 934, 1290, 1330, 1320], color: '#73c0de' },
  ]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const step = chartRect.width / labels.length
  const barWidth = step * 0.6

  // 计算堆叠总值
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + s.data[i], 0))
  const maxVal = Math.max(...totals) * 1.1
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    drawLegend(ctx, series.map(s => ({ name: s.name, color: s.color })), width, height, 'top')
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    // hover 背景
    if (highlightIdx >= 0) {
      const x = chartRect.x + step * highlightIdx
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'
      ctx.fillRect(x, chartRect.y, step, chartRect.height)
    }

    // 绘制堆叠柱子
    labels.forEach((_, i) => {
      const x = chartRect.x + step * i + (step - barWidth) / 2
      let currentY = chartRect.y + chartRect.height

      series.forEach((s) => {
        const barHeight = s.data[i] * yScale
        currentY -= barHeight

        ctx.beginPath()
        ctx.rect(x, currentY, barWidth, barHeight)
        ctx.fillStyle = s.color
        ctx.fill()

        if (i === highlightIdx) {
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 横向柱状图
function initHorizontalBarChart(): void {
  const container = document.getElementById('horizontal-bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 80, right: 30, top: 20, bottom: 20 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { name: '巴西', value: 18203 },
    { name: '印尼', value: 23489 },
    { name: '美国', value: 29034 },
    { name: '印度', value: 104970 },
    { name: '中国', value: 131744 },
  ]
  const maxVal = Math.max(...data.map(d => d.value)) * 1.1
  const barHeight = chartRect.height / data.length * 0.7
  const gap = chartRect.height / data.length
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 背景网格
    ctx.strokeStyle = GRID_COLOR
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const x = chartRect.x + chartRect.width / 5 * i
      ctx.beginPath()
      ctx.moveTo(x, chartRect.y)
      ctx.lineTo(x, chartRect.y + chartRect.height)
      ctx.globalAlpha = 0.3
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // X轴刻度值
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 5; i++) {
      const val = Math.round(maxVal / 5 * i)
      const x = chartRect.x + chartRect.width / 5 * i
      ctx.fillText(String(val), x, chartRect.y + chartRect.height + 15)
    }

    data.forEach((d, i) => {
      const y = chartRect.y + gap * i + (gap - barHeight) / 2
      const barW = (d.value / maxVal) * chartRect.width
      const isHover = i === highlightIdx

      // Y轴标签
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(d.name, chartRect.x - 10, y + barHeight / 2 + 4)

      // 条形
      ctx.beginPath()
      ctx.roundRect(chartRect.x, y, barW, barHeight, 3)
      ctx.fillStyle = isHover ? COLORS.secondary : COLORS.primary
      ctx.fill()

      // 数值标签
      ctx.fillStyle = TEXT_COLOR
      ctx.textAlign = 'left'
      ctx.fillText(String(d.value), chartRect.x + barW + 5, y + barHeight / 2 + 4)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const gap = chartRect.height / data.length
    const idx = Math.floor((pos.y - chartRect.y) / gap)
    if (idx >= 0 && idx < data.length && pos.y >= chartRect.y && pos.y <= chartRect.y + chartRect.height) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${data[idx].name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>人口<span class="tooltip-value">${data[idx].value.toLocaleString()}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 分组柱状图
function initGroupedBarChart(): void {
  const container = document.getElementById('grouped-bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const series = [
    { name: '2022年', data: [320, 332, 301, 334, 390], color: '#5470c6' },
    { name: '2023年', data: [220, 182, 191, 234, 290], color: '#91cc75' },
    { name: '2024年', data: [150, 232, 201, 154, 190], color: '#fac858' },
  ]
  const labels = ['一季度', '二季度', '三季度', '四季度', '全年']
  const step = chartRect.width / labels.length
  const groupWidth = step * 0.8
  const barWidth = groupWidth / series.length - 4
  const maxVal = Math.max(...series.flatMap(s => s.data)) * 1.2
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    drawLegend(ctx, series.map(s => ({ name: s.name, color: s.color })), width, height, 'top')
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, Math.round(maxVal), 5)

    // hover 背景
    if (highlightIdx >= 0) {
      const x = chartRect.x + step * highlightIdx
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'
      ctx.fillRect(x, chartRect.y, step, chartRect.height)
    }

    // 绘制分组柱子
    labels.forEach((_, i) => {
      const groupX = chartRect.x + step * i + (step - groupWidth) / 2

      series.forEach((s, si) => {
        const x = groupX + si * (barWidth + 4)
        const barHeight = s.data[i] * yScale
        const y = chartRect.y + chartRect.height - barHeight

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 3)
        ctx.fillStyle = s.color
        ctx.fill()

        if (i === highlightIdx) {
          ctx.strokeStyle = 'rgba(255,255,255,0.5)'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const items = series.map((s) =>
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${s.color}"></span>${s.name}<span class="tooltip-value">${s.data[idx]}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY, `<div class="tooltip-title">${labels[idx]}</div>${items}`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 正负柱状图
function initNegativeBarChart(): void {
  const container = document.getElementById('negative-bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [10, 52, -30, 95, -41, 60, -22, 31, -15, 48]
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月']
  const step = chartRect.width / labels.length
  const barWidth = step * 0.6
  const maxVal = Math.max(...data.map(Math.abs)) * 1.2
  const yScale = chartRect.height / (maxVal * 2)
  const zeroY = chartRect.y + chartRect.height / 2
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 网格
    drawGrid(ctx, chartRect, labels.length, 6)

    // 零轴
    ctx.beginPath()
    ctx.moveTo(chartRect.x, zeroY)
    ctx.lineTo(chartRect.x + chartRect.width, zeroY)
    ctx.strokeStyle = TEXT_COLOR
    ctx.lineWidth = 1
    ctx.stroke()

    // X轴标签
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'
    labels.forEach((label, i) => {
      const x = chartRect.x + step * i + step / 2
      ctx.fillText(label, x, chartRect.y + chartRect.height + 15)
    })

    // Y轴刻度
    ctx.textAlign = 'right'
    for (let i = -2; i <= 2; i++) {
      const val = Math.round(maxVal / 2 * i)
      const y = zeroY - val * yScale
      ctx.fillText(String(val), chartRect.x - 10, y + 4)
    }

    // 绘制柱子
    data.forEach((v, i) => {
      const x = chartRect.x + step * i + (step - barWidth) / 2
      const barHeight = Math.abs(v) * yScale
      const y = v >= 0 ? zeroY - barHeight : zeroY
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 3)
      ctx.fillStyle = v >= 0 ? (isHover ? '#34d399' : COLORS.success) : (isHover ? '#f87171' : COLORS.danger)
      ctx.fill()
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < data.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const color = data[idx] >= 0 ? COLORS.success : COLORS.danger
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${color}"></span>利润<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 瀑布图
function initWaterfallChart(): void {
  const container = document.getElementById('waterfall-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { name: '期初', value: 900, type: 'total' },
    { name: '一月', value: 200, type: 'positive' },
    { name: '二月', value: -100, type: 'negative' },
    { name: '三月', value: 150, type: 'positive' },
    { name: '四月', value: -80, type: 'negative' },
    { name: '五月', value: 120, type: 'positive' },
    { name: '期末', value: 1190, type: 'total' },
  ]

  const step = chartRect.width / data.length
  const barWidth = step * 0.6
  const maxVal = 1500
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  // 计算累积值
  let running = 0
  const positions = data.map((d) => {
    if (d.type === 'total') {
      running = d.value
      return { start: 0, end: d.value }
    } else {
      const start = running
      running += d.value
      return { start: Math.min(start, running), end: Math.max(start, running) }
    }
  })

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, data.length, 5)
    drawXAxis(ctx, chartRect, data.map(d => d.name), 'onZero')
    drawYAxis(ctx, chartRect, 0, maxVal, 5)

    data.forEach((d, i) => {
      const x = chartRect.x + step * i + (step - barWidth) / 2
      const pos = positions[i]
      const barHeight = (pos.end - pos.start) * yScale
      const y = chartRect.y + chartRect.height - pos.end * yScale
      const isHover = i === highlightIdx

      let color: string
      if (d.type === 'total') {
        color = isHover ? '#818cf8' : COLORS.primary
      } else if (d.type === 'positive') {
        color = isHover ? '#34d399' : COLORS.success
      } else {
        color = isHover ? '#f87171' : COLORS.danger
      }

      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 3)
      ctx.fillStyle = color
      ctx.fill()

      // 连接线
      if (i < data.length - 1 && d.type !== 'total') {
        const nextPos = positions[i + 1]
        const lineY = chartRect.y + chartRect.height - (d.type === 'positive' ? pos.end : pos.start) * yScale
        ctx.beginPath()
        ctx.setLineDash([3, 3])
        ctx.moveTo(x + barWidth, lineY)
        ctx.lineTo(chartRect.x + step * (i + 1) + (step - barWidth) / 2, lineY)
        ctx.strokeStyle = GRID_COLOR
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])
      }

      // 数值标签
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      const labelY = d.value >= 0 ? y - 5 : y + barHeight + 12
      ctx.fillText(d.type === 'total' ? String(d.value) : (d.value > 0 ? '+' : '') + d.value, x + barWidth / 2, labelY)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < data.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const d = data[idx]
      const color = d.type === 'total' ? COLORS.primary : d.type === 'positive' ? COLORS.success : COLORS.danger
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${d.name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${color}"></span>金额<span class="tooltip-value">${d.value}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 带背景柱状图
function initBarWithBackgroundChart(): void {
  const container = document.getElementById('bar-background-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [220, 182, 191, 234, 290, 330, 310]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const step = chartRect.width / labels.length
  const barWidth = step * 0.5
  const maxVal = 400
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, maxVal, 5)

    data.forEach((v, i) => {
      const x = chartRect.x + step * i + (step - barWidth) / 2
      const barHeight = v * yScale
      const y = chartRect.y + chartRect.height - barHeight
      const isHover = i === highlightIdx

      // 背景柱
      ctx.beginPath()
      ctx.roundRect(x, chartRect.y, barWidth, chartRect.height, 4)
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'
      ctx.fill()

      // 前景柱
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 4)
      ctx.fillStyle = isHover ? COLORS.secondary : COLORS.primary
      ctx.fill()

      // 百分比标签
      const percent = Math.round(v / maxVal * 100)
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${percent}%`, x + barWidth / 2, y - 5)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < data.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const percent = Math.round(data[idx] / maxVal * 100)
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>数值<span class="tooltip-value">${data[idx]} (${percent}%)</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 排序柱状图
function initSortedBarChart(): void {
  const container = document.getElementById('sorted-bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 80, right: 40, top: 20, bottom: 20 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { name: 'Safari', value: 500, color: '#5470c6' },
    { name: 'Chrome', value: 200, color: '#91cc75' },
    { name: 'Firefox', value: 360, color: '#fac858' },
    { name: 'Edge', value: 100, color: '#ee6666' },
    { name: 'Opera', value: 300, color: '#73c0de' },
  ].sort((a, b) => b.value - a.value) // 按值排序

  const maxVal = Math.max(...data.map(d => d.value)) * 1.2
  const barHeight = chartRect.height / data.length * 0.7
  const gap = chartRect.height / data.length
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 背景网格
    ctx.strokeStyle = GRID_COLOR
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const x = chartRect.x + chartRect.width / 5 * i
      ctx.beginPath()
      ctx.moveTo(x, chartRect.y)
      ctx.lineTo(x, chartRect.y + chartRect.height)
      ctx.globalAlpha = 0.3
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    data.forEach((d, i) => {
      const y = chartRect.y + gap * i + (gap - barHeight) / 2
      const barW = (d.value / maxVal) * chartRect.width
      const isHover = i === highlightIdx

      // 标签
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(d.name, chartRect.x - 10, y + barHeight / 2 + 4)

      // 带圆角的渐变条形
      const gradient = ctx.createLinearGradient(chartRect.x, 0, chartRect.x + barW, 0)
      gradient.addColorStop(0, d.color)
      gradient.addColorStop(1, isHover ? '#fff' : d.color.replace(')', ', 0.6)').replace('rgb', 'rgba'))

      ctx.beginPath()
      ctx.roundRect(chartRect.x, y, barW, barHeight, [0, barHeight / 2, barHeight / 2, 0])
      ctx.fillStyle = gradient
      ctx.fill()

      // 数值标签
      ctx.fillStyle = TEXT_COLOR
      ctx.textAlign = 'left'
      ctx.font = 'bold 11px Inter, sans-serif'
      ctx.fillText(String(d.value), chartRect.x + barW + 8, y + barHeight / 2 + 4)

      // 排名标签
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px Inter, sans-serif'
      ctx.textAlign = 'center'
      if (barW > 30) {
        ctx.fillText(`#${i + 1}`, chartRect.x + 15, y + barHeight / 2 + 4)
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.y - chartRect.y) / gap)
    if (idx >= 0 && idx < data.length && pos.y >= chartRect.y && pos.y <= chartRect.y + chartRect.height) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${data[idx].name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${data[idx].color}"></span>排名 #${idx + 1}<span class="tooltip-value">${data[idx].value}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 极坐标柱状图
function initPolarBarChart(): void {
  const container = document.getElementById('polar-bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { name: '周一', value: 120, color: '#5470c6' },
    { name: '周二', value: 200, color: '#91cc75' },
    { name: '周三', value: 150, color: '#fac858' },
    { name: '周四', value: 80, color: '#ee6666' },
    { name: '周五', value: 180, color: '#73c0de' },
    { name: '周六', value: 250, color: '#3ba272' },
    { name: '周日', value: 220, color: '#fc8452' },
  ]

  const cx = width / 2
  const cy = height / 2
  const maxRadius = Math.min(width, height) / 2 - 30
  const innerRadius = 30
  const maxVal = Math.max(...data.map(d => d.value)) * 1.1
  const angleStep = (Math.PI * 2) / data.length
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 背景圆环
    for (let i = 1; i <= 4; i++) {
      const r = innerRadius + (maxRadius - innerRadius) * (i / 4)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = GRID_COLOR
      ctx.globalAlpha = 0.3
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // 绘制扇形柱子
    data.forEach((d, i) => {
      const startAngle = -Math.PI / 2 + angleStep * i + 0.05
      const endAngle = -Math.PI / 2 + angleStep * (i + 1) - 0.05
      const outerRadius = innerRadius + (maxRadius - innerRadius) * (d.value / maxVal)
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.arc(cx, cy, outerRadius, startAngle, endAngle)
      ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = isHover ? d.color.replace(')', ', 0.8)').replace('rgb', 'rgba') : d.color
      ctx.fill()

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 标签
      const midAngle = (startAngle + endAngle) / 2
      const labelRadius = maxRadius + 15
      const labelX = cx + Math.cos(midAngle) * labelRadius
      const labelY = cy + Math.sin(midAngle) * labelRadius

      ctx.fillStyle = TEXT_COLOR
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(d.name, labelX, labelY)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const dx = pos.x - cx
    const dy = pos.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist >= innerRadius && dist <= maxRadius) {
      let angle = Math.atan2(dy, dx) + Math.PI / 2
      if (angle < 0) angle += Math.PI * 2
      const idx = Math.floor(angle / angleStep) % data.length

      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${data[idx].name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${data[idx].color}"></span>数值<span class="tooltip-value">${data[idx].value}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 饼图
function initPieChart(): void {
  const container = document.getElementById('pie-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { value: 335, name: '直接访问', color: COLORS.primary },
    { value: 310, name: '邮件营销', color: COLORS.success },
    { value: 234, name: '联盟广告', color: COLORS.warning },
    { value: 135, name: '视频广告', color: COLORS.danger },
    { value: 148, name: '搜索引擎', color: COLORS.cyan },
  ]

  const total = data.reduce((sum, d) => sum + d.value, 0)
  // 使用较小的尺寸确保是正圆，留出标签空间
  const size = Math.min(width, height - 40) // 为图例留空间
  const cx = width / 2
  const cy = height / 2 + 15 // 向下偏移为图例留空间
  const radius = size / 2 - 50
  let hoverIndex = -1

  // 计算每个扇区的角度范围
  const angles: { start: number; end: number }[] = []
  let angle = -Math.PI / 2
  data.forEach((d) => {
    const a = (d.value / total) * Math.PI * 2
    angles.push({ start: angle, end: angle + a })
    angle += a
  })

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制图例
    drawLegend(ctx, data.map(d => ({ name: d.name, color: d.color })), width, height, 'top')

    // 绘制扇区
    data.forEach((d, i) => {
      const { start, end } = angles[i]
      const isHover = i === highlightIdx
      const offset = isHover ? 8 : 0
      const midAngle = (start + end) / 2
      const offsetX = offset * Math.cos(midAngle)
      const offsetY = offset * Math.sin(midAngle)

      ctx.beginPath()
      ctx.moveTo(cx + offsetX, cy + offsetY)
      ctx.arc(cx + offsetX, cy + offsetY, radius, start, end)
      ctx.closePath()
      ctx.fillStyle = d.color
      ctx.fill()

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // 绘制外部标签和引导线
    data.forEach((d, i) => {
      const { start, end } = angles[i]
      const midAngle = (start + end) / 2
      const isHover = i === highlightIdx

      // 引导线起点（饼图边缘）
      const innerRadius = radius + 5
      const x1 = cx + Math.cos(midAngle) * innerRadius
      const y1 = cy + Math.sin(midAngle) * innerRadius

      // 引导线中点（向外延伸）
      const outerRadius = radius + 20
      const x2 = cx + Math.cos(midAngle) * outerRadius
      const y2 = cy + Math.sin(midAngle) * outerRadius

      // 引导线终点（水平延伸）
      const isRight = midAngle > -Math.PI / 2 && midAngle < Math.PI / 2
      const x3 = x2 + (isRight ? 20 : -20)
      const y3 = y2

      // 绘制引导线
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.strokeStyle = d.color
      ctx.lineWidth = isHover ? 2 : 1
      ctx.stroke()

      // 绘制小圆点
      ctx.beginPath()
      ctx.arc(x1, y1, 3, 0, Math.PI * 2)
      ctx.fillStyle = d.color
      ctx.fill()

      // 绘制标签
      const pct = ((d.value / total) * 100).toFixed(0)
      ctx.fillStyle = isHover ? '#fff' : TEXT_COLOR
      ctx.font = isHover ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif'
      ctx.textAlign = isRight ? 'left' : 'right'
      ctx.textBaseline = 'middle'
      const labelX = x3 + (isRight ? 5 : -5)
      ctx.fillText(`${d.name} ${pct}%`, labelX, y3)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const dx = pos.x - cx
    const dy = pos.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist <= radius) {
      let angle = Math.atan2(dy, dx)
      if (angle < -Math.PI / 2) angle += Math.PI * 2

      const idx = angles.findIndex((a) => angle >= a.start && angle < a.end)
      if (idx !== -1 && idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      if (idx !== -1) {
        const d = data[idx]
        const pct = ((d.value / total) * 100).toFixed(1)
        showTooltip(e.clientX, e.clientY,
          `<div class="tooltip-title">${d.name}</div>
           <div class="tooltip-item"><span class="tooltip-dot" style="background:${d.color}"></span>数值<span class="tooltip-value">${d.value}</span></div>
           <div class="tooltip-item">占比<span class="tooltip-value">${pct}%</span></div>`)
      }
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 环形图
function initDonutChart(): void {
  const container = document.getElementById('donut-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { value: 40, name: '产品A', color: COLORS.primary },
    { value: 30, name: '产品B', color: COLORS.success },
    { value: 20, name: '产品C', color: COLORS.warning },
    { value: 10, name: '产品D', color: COLORS.danger },
  ]

  const total = data.reduce((sum, d) => sum + d.value, 0)
  // 使用较小的尺寸确保是正圆，留出标签空间
  const size = Math.min(width, height - 40) // 为图例留空间
  const cx = width / 2
  const cy = height / 2 + 15 // 向下偏移为图例留空间
  const outerRadius = size / 2 - 45
  const innerRadius = outerRadius * 0.55
  let hoverIndex = -1

  const angles: { start: number; end: number }[] = []
  let angle = -Math.PI / 2
  data.forEach((d) => {
    const a = (d.value / total) * Math.PI * 2
    angles.push({ start: angle, end: angle + a })
    angle += a
  })

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制图例
    drawLegend(ctx, data.map(d => ({ name: d.name, color: d.color })), width, height, 'top')

    // 绘制环形扇区
    data.forEach((d, i) => {
      const { start, end } = angles[i]
      const isHover = i === highlightIdx
      const offset = isHover ? 6 : 0
      const midAngle = (start + end) / 2
      const offsetX = offset * Math.cos(midAngle)
      const offsetY = offset * Math.sin(midAngle)

      ctx.beginPath()
      ctx.arc(cx + offsetX, cy + offsetY, outerRadius, start, end)
      ctx.arc(cx + offsetX, cy + offsetY, innerRadius, end, start, true)
      ctx.closePath()
      ctx.fillStyle = d.color
      ctx.fill()

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // 绘制外部标签和引导线
    data.forEach((d, i) => {
      const { start, end } = angles[i]
      const midAngle = (start + end) / 2
      const isHover = i === highlightIdx

      // 引导线起点（环形边缘）
      const lineStartRadius = outerRadius + 5
      const x1 = cx + Math.cos(midAngle) * lineStartRadius
      const y1 = cy + Math.sin(midAngle) * lineStartRadius

      // 引导线中点
      const lineMidRadius = outerRadius + 18
      const x2 = cx + Math.cos(midAngle) * lineMidRadius
      const y2 = cy + Math.sin(midAngle) * lineMidRadius

      // 引导线终点（水平延伸）
      const isRight = midAngle > -Math.PI / 2 && midAngle < Math.PI / 2
      const x3 = x2 + (isRight ? 15 : -15)
      const y3 = y2

      // 绘制引导线
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.strokeStyle = d.color
      ctx.lineWidth = isHover ? 2 : 1
      ctx.stroke()

      // 绘制小圆点
      ctx.beginPath()
      ctx.arc(x1, y1, 2, 0, Math.PI * 2)
      ctx.fillStyle = d.color
      ctx.fill()

      // 绘制标签
      const pct = ((d.value / total) * 100).toFixed(0)
      ctx.fillStyle = isHover ? '#fff' : TEXT_COLOR
      ctx.font = isHover ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif'
      ctx.textAlign = isRight ? 'left' : 'right'
      ctx.textBaseline = 'middle'
      const labelX = x3 + (isRight ? 4 : -4)
      ctx.fillText(`${d.name} ${pct}%`, labelX, y3)
    })

    // 中心文字
    const activeData = highlightIdx >= 0 ? data[highlightIdx] : null
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(activeData ? `${activeData.value}%` : '100%', cx, cy - 8)

    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = TEXT_COLOR
    ctx.fillText(activeData ? activeData.name : '总计', cx, cy + 14)
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const dx = pos.x - cx
    const dy = pos.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist >= innerRadius && dist <= outerRadius) {
      let angle = Math.atan2(dy, dx)
      if (angle < -Math.PI / 2) angle += Math.PI * 2

      const idx = angles.findIndex((a) => angle >= a.start && angle < a.end)
      if (idx !== -1 && idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      if (idx !== -1) {
        const d = data[idx]
        const pct = ((d.value / total) * 100).toFixed(1)
        showTooltip(e.clientX, e.clientY,
          `<div class="tooltip-title">${d.name}</div>
           <div class="tooltip-item"><span class="tooltip-dot" style="background:${d.color}"></span>数值<span class="tooltip-value">${d.value}</span></div>
           <div class="tooltip-item">占比<span class="tooltip-value">${pct}%</span></div>`)
      }
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 散点图
function initScatterChart(): void {
  const container = document.getElementById('scatter-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data: { x: number; y: number; size: number }[] = []
  for (let i = 0; i < 30; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 6,
    })
  }

  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, 5, 5)
    drawYAxis(ctx, chartRect, 0, 100, 5)

    // X Axis
    for (let i = 0; i <= 5; i++) {
      const x = chartRect.x + (chartRect.width / 5) * i
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(String(i * 20), x, chartRect.y + chartRect.height + 10)
    }

    data.forEach((d, i) => {
      const cx = chartRect.x + (d.x / 100) * chartRect.width
      const cy = chartRect.y + chartRect.height - (d.y / 100) * chartRect.height
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.arc(cx, cy, isHover ? d.size + 2 : d.size, 0, Math.PI * 2)
      ctx.fillStyle = isHover ? COLORS.secondary : COLORS.primary
      ctx.globalAlpha = isHover ? 1 : 0.7
      ctx.fill()
      ctx.globalAlpha = 1

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    let found = -1

    // 反向遍历，优先选中上层元素
    for (let i = data.length - 1; i >= 0; i--) {
      const d = data[i]
      const cx = chartRect.x + (d.x / 100) * chartRect.width
      const cy = chartRect.y + chartRect.height - (d.y / 100) * chartRect.height
      const dx = pos.x - cx
      const dy = pos.y - cy
      if (dx * dx + dy * dy <= (d.size + 4) * (d.size + 4)) {
        found = i
        break
      }
    }

    if (found !== hoverIndex) {
      hoverIndex = found
      draw(found)
    }

    if (found !== -1) {
      const d = data[found]
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>X: <span class="tooltip-value">${d.x.toFixed(1)}</span></div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>Y: <span class="tooltip-value">${d.y.toFixed(1)}</span></div>`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 面积图
function initAreaChart(): void {
  const container = document.getElementById('area-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [120, 200, 150, 80, 170, 210, 180]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const xStep = chartRect.width / (data.length - 1)
  const yScale = chartRect.height / 250
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, labels.length, 5)
    drawXAxis(ctx, chartRect, labels, 'onZero')
    drawYAxis(ctx, chartRect, 0, 250, 5)

    const points = data.map((v, i) => ({
      x: chartRect.x + xStep * i,
      y: chartRect.y + chartRect.height - v * yScale,
    }))

    // 绘制面积
    ctx.beginPath()
    ctx.moveTo(points[0].x, chartRect.y + chartRect.height)
    points.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1].x, chartRect.y + chartRect.height)
    ctx.closePath()
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'
    ctx.fill()

    // 绘制线条
    ctx.beginPath()
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 绘制悬停效果
    if (highlightIdx >= 0) {
      const p = points[highlightIdx]
      // 竖线
      ctx.beginPath()
      ctx.moveTo(p.x, chartRect.y)
      ctx.lineTo(p.x, chartRect.y + chartRect.height)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 点
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.primary
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.round((pos.x - chartRect.x) / xStep)
    if (idx >= 0 && idx < labels.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>访问量<span class="tooltip-value">${data[idx]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 雷达图
function initRadarChart(): void {
  const container = document.getElementById('radar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const indicators = [
    { name: '销售', max: 100 },
    { name: '管理', max: 100 },
    { name: '技术', max: 100 },
    { name: '服务', max: 100 },
    { name: '研发', max: 100 },
    { name: '市场', max: 100 },
  ]

  const data = [
    { name: '预算分配', value: [80, 90, 70, 80, 95, 60], color: COLORS.primary },
    { name: '实际开销', value: [60, 70, 85, 60, 75, 80], color: COLORS.success },
  ]

  const cx = width / 2
  const cy = height / 2 + 15 // 留出顶部图例空间
  const radius = Math.min(width, height) / 2 - 60
  const angleStep = (Math.PI * 2) / indicators.length
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制图例
    drawLegend(ctx, data.map(d => ({ name: d.name, color: d.color })), width, height, 'top-right')

    // 绘制网格
    const splitNumber = 5
    for (let i = 0; i <= splitNumber; i++) {
      const r = (radius / splitNumber) * i
      ctx.beginPath()
      for (let j = 0; j < indicators.length; j++) {
        const angle = j * angleStep - Math.PI / 2
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (j === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.stroke()

      if (i === splitNumber) {
        // 绘制轴线和标签
        for (let j = 0; j < indicators.length; j++) {
          const angle = j * angleStep - Math.PI / 2
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(x, y)
          ctx.stroke()

          // 绘制标签
          const labelR = r + 20
          const lx = cx + Math.cos(angle) * labelR
          const ly = cy + Math.sin(angle) * labelR
          ctx.fillStyle = TEXT_COLOR
          ctx.font = '12px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(indicators[j].name, lx, ly)
        }
      }
    }

    // 绘制数据
    data.forEach((d, i) => {
      const isHover = i === highlightIdx

      ctx.beginPath()
      d.value.forEach((v, j) => {
        const angle = j * angleStep - Math.PI / 2
        const r = (v / indicators[j].max) * radius
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (j === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()

      ctx.strokeStyle = d.color
      ctx.lineWidth = isHover ? 3 : 2
      ctx.stroke()

      ctx.fillStyle = d.color
      ctx.globalAlpha = isHover ? 0.3 : 0.1
      ctx.fill()
      ctx.globalAlpha = 1

      // 绘制点
      d.value.forEach((v, j) => {
        const angle = j * angleStep - Math.PI / 2
        const r = (v / indicators[j].max) * radius
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r

        ctx.beginPath()
        ctx.arc(x, y, isHover ? 5 : 3, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.strokeStyle = d.color
        ctx.lineWidth = 2
        ctx.stroke()
      })
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    let found = -1

    // 检查鼠标是否接近顶点
    data.forEach((d, i) => {
      d.value.forEach((v, j) => {
        const angle = j * angleStep - Math.PI / 2
        const r = (v / indicators[j].max) * radius
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        const dx = pos.x - x
        const dy = pos.y - y
        if (dx * dx + dy * dy <= 50) {
          found = i
        }
      })
    })

    if (found !== hoverIndex) {
      hoverIndex = found
      draw(found)
    }

    if (found !== -1) {
      const d = data[found]
      const items = d.value.map((v, j) =>
        `<div class="tooltip-item"><span class="tooltip-label">${indicators[j].name}:</span><span class="tooltip-value">${v}</span></div>`
      ).join('')
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${d.name}</div>${items}`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 仪表盘
function initGaugeChart(): void {
  const container = document.getElementById('gauge-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { ctx } = result

  const data = { value: 72, name: '完成率' }
  const cx = width / 2
  const cy = height * 0.75
  const radius = Math.min(width, height * 1.5) / 2 - 30
  const startAngle = -Math.PI
  const endAngle = 0
  const angleRange = endAngle - startAngle

  function draw(): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制背景弧
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.lineWidth = 20
    ctx.strokeStyle = '#334155'
    ctx.lineCap = 'round'
    ctx.stroke()

    // 绘制进度弧
    const currentAngle = startAngle + (data.value / 100) * angleRange
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, currentAngle)
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, COLORS.success)
    gradient.addColorStop(1, COLORS.warning)
    ctx.strokeStyle = gradient
    ctx.stroke()

    // 绘制刻度
    const ticks = 10
    for (let i = 0; i <= ticks; i++) {
      const angle = startAngle + (angleRange / ticks) * i
      const isMajor = i % 5 === 0
      const tickLen = isMajor ? 10 : 6
      const r1 = radius - 20
      const r2 = r1 - tickLen

      const x1 = cx + Math.cos(angle) * r1
      const y1 = cy + Math.sin(angle) * r1
      const x2 = cx + Math.cos(angle) * r2
      const y2 = cy + Math.sin(angle) * r2

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineWidth = isMajor ? 2 : 1
      ctx.strokeStyle = isMajor ? '#fff' : '#64748b'
      ctx.stroke()

      if (isMajor) {
        const r3 = r2 - 15
        const lx = cx + Math.cos(angle) * r3
        const ly = cy + Math.sin(angle) * r3
        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(i * 10), lx, ly)
      }
    }

    // 绘制指针
    const pointerLen = radius - 40
    const px = cx + Math.cos(currentAngle) * pointerLen
    const py = cy + Math.sin(currentAngle) * pointerLen

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(px, py)
    ctx.lineWidth = 4
    ctx.strokeStyle = '#fff'
    ctx.lineCap = 'round'
    ctx.stroke()

    // 绘制中心点
    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()

    // 绘制数值
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 36px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${data.value}%`, cx, cy - 20)

    ctx.fillStyle = TEXT_COLOR
    ctx.font = '14px Inter, sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText(data.name, cx, cy + 10)
  }

  draw()
}

// 漏斗图
function initFunnelChart(): void {
  const container = document.getElementById('funnel-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { value: 100, name: '展示', color: '#6366f1' },
    { value: 80, name: '点击', color: '#8b5cf6' },
    { value: 60, name: '访问', color: '#ec4899' },
    { value: 40, name: '咨询', color: '#f43f5e' },
    { value: 20, name: '订单', color: '#f97316' },
  ]

  const gap = 2
  const topWidth = width * 0.7
  const bottomWidth = width * 0.1
  const funnelHeight = height * 0.8
  const startY = (height - funnelHeight) / 2
  const centerX = width / 2
  const itemHeight = (funnelHeight - gap * (data.length - 1)) / data.length
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    data.forEach((d, i) => {
      const y = startY + (itemHeight + gap) * i
      const nextY = y + itemHeight

      const rate1 = 1 - (i / data.length)
      const rate2 = 1 - ((i + 1) / data.length)

      const w1 = bottomWidth + (topWidth - bottomWidth) * rate1
      const w2 = bottomWidth + (topWidth - bottomWidth) * rate2

      const x1 = centerX - w1 / 2
      const x2 = centerX - w2 / 2
      const x3 = centerX + w2 / 2
      const x4 = centerX + w1 / 2

      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, nextY)
      ctx.lineTo(x3, nextY)
      ctx.lineTo(x4, y)
      ctx.closePath()

      ctx.fillStyle = d.color
      ctx.globalAlpha = isHover ? 1 : 0.85
      ctx.fill()
      ctx.globalAlpha = 1

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 绘制标签
      const labelX = x4 + 10
      const labelY = y + itemHeight / 2
      ctx.fillStyle = isHover ? '#fff' : TEXT_COLOR
      ctx.font = isHover ? 'bold 12px Inter, sans-serif' : '12px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(d.name, labelX, labelY)

      // 绘制数值（在漏斗内部）
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.fillText(`${d.value}%`, centerX, labelY)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    // 简单判断Y轴范围
    if (pos.x >= centerX - topWidth / 2 && pos.x <= centerX + topWidth / 2) {
      const idx = Math.floor((pos.y - startY) / (itemHeight + gap))
      if (idx >= 0 && idx < data.length) {
        if (idx !== hoverIndex) {
          hoverIndex = idx
          draw(idx)
        }
        const d = data[idx]
        showTooltip(e.clientX, e.clientY,
          `<div class="tooltip-title">${d.name}</div>
           <div class="tooltip-item"><span class="tooltip-dot" style="background:${d.color}"></span>转化率<span class="tooltip-value">${d.value}%</span></div>`)
      } else {
        if (hoverIndex !== -1) {
          hoverIndex = -1
          draw()
        }
        hideTooltip()
      }
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 环形进度
function initRingProgressChart(): void {
  const container = document.getElementById('ring-progress-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = { value: 0.75, name: '目标完成率', color: COLORS.primary }
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 40
  const innerRadius = radius * 0.8
  const startAngle = -Math.PI / 2

  function draw(isHover: boolean = false): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制背景环
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.arc(cx, cy, innerRadius, Math.PI * 2, 0, true)
    ctx.closePath()
    ctx.fillStyle = '#334155'
    ctx.fill()

    // 绘制进度环
    const endAngle = startAngle + Math.PI * 2 * data.value
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true)
    ctx.closePath()
    ctx.fillStyle = data.color
    ctx.fill()

    // 绘制端点圆角
    const midRadius = (radius + innerRadius) / 2
    const ringWidth = radius - innerRadius

    const startX = cx + Math.cos(startAngle) * midRadius
    const startY = cy + Math.sin(startAngle) * midRadius
    ctx.beginPath()
    ctx.arc(startX, startY, ringWidth / 2, 0, Math.PI * 2)
    ctx.fillStyle = data.color
    ctx.fill()

    const endX = cx + Math.cos(endAngle) * midRadius
    const endY = cy + Math.sin(endAngle) * midRadius
    ctx.beginPath()
    ctx.arc(endX, endY, ringWidth / 2, 0, Math.PI * 2)
    ctx.fillStyle = isHover ? '#fff' : data.color
    ctx.fill()

    // 绘制中心文字
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 36px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${(data.value * 100).toFixed(0)}%`, cx, cy - 5)

    ctx.fillStyle = TEXT_COLOR
    ctx.font = '14px Inter, sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText(data.name, cx, cy + 10)
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const dx = pos.x - cx
    const dy = pos.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist >= innerRadius && dist <= radius) {
      draw(true)
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${data.name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${data.color}"></span>进度<span class="tooltip-value">${(data.value * 100).toFixed(0)}%</span></div>`)
    } else {
      draw(false)
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    draw(false)
    hideTooltip()
  })
}

// K线图
function initCandlestickChart(): void {
  const container = document.getElementById('candlestick-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // K线数据 [open, close, low, high]
  const klineData: [number, number, number, number][] = [
    [20, 34, 10, 38],
    [40, 35, 30, 50],
    [31, 38, 28, 44],
    [38, 15, 12, 42],
    [15, 25, 10, 30],
    [25, 32, 18, 38],
    [32, 45, 28, 48],
    [45, 38, 35, 52],
  ]
  const labels = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08']

  const allValues = klineData.flatMap((d) => [d[0], d[1], d[2], d[3]])
  const minVal = Math.min(...allValues) * 0.8
  const maxVal = Math.max(...allValues) * 1.1

  const candleWidth = (chartRect.width / klineData.length) * 0.6
  const step = chartRect.width / klineData.length
  const yScale = chartRect.height / (maxVal - minVal)
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, klineData.length, 5)
    drawYAxis(ctx, chartRect, minVal, maxVal, 5)

    // X Axis
    labels.forEach((label, i) => {
      const x = chartRect.x + step * i + step / 2
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(label, x, chartRect.y + chartRect.height + 10)
    })

    // 绘制悬停背景
    if (highlightIdx >= 0) {
      const x = chartRect.x + step * highlightIdx
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(x, chartRect.y, step, chartRect.height)

      // 竖线
      const cx = x + step / 2
      ctx.beginPath()
      ctx.moveTo(cx, chartRect.y)
      ctx.lineTo(cx, chartRect.y + chartRect.height)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    klineData.forEach((d, i) => {
      const [open, close, low, high] = d
      const x = chartRect.x + step * i + step / 2
      const isUp = close >= open
      const color = isUp ? COLORS.success : COLORS.danger

      // 绘制影线
      const highY = chartRect.y + chartRect.height - (high - minVal) * yScale
      const lowY = chartRect.y + chartRect.height - (low - minVal) * yScale
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.stroke()

      // 绘制实体
      const openY = chartRect.y + chartRect.height - (open - minVal) * yScale
      const closeY = chartRect.y + chartRect.height - (close - minVal) * yScale
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY) || 1

      ctx.fillStyle = color
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight)

      if (i === highlightIdx) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight)
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < klineData.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const d = klineData[idx]
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${labels[idx]}</div>
         <div class="tooltip-item"><span class="tooltip-label">开盘:</span><span class="tooltip-value">${d[0]}</span></div>
         <div class="tooltip-item"><span class="tooltip-label">收盘:</span><span class="tooltip-value">${d[1]}</span></div>
         <div class="tooltip-item"><span class="tooltip-label">最低:</span><span class="tooltip-value">${d[2]}</span></div>
         <div class="tooltip-item"><span class="tooltip-label">最高:</span><span class="tooltip-value">${d[3]}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 热力图
function initHeatmapChart(): void {
  const container = document.getElementById('heatmap-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 60, right: 20, top: 30, bottom: 50 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const hours = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24']
  const colors = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027']

  const cellWidth = chartRect.width / days.length
  const cellHeight = chartRect.height / hours.length

  // 生成数据
  const data: { day: number; hour: number; value: number }[] = []
  days.forEach((_, i) => {
    hours.forEach((_, j) => {
      data.push({
        day: i,
        hour: j,
        value: Math.floor(Math.random() * 100)
      })
    })
  })

  let hoverItem: { day: number; hour: number } | null = null

  function draw(): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制热力单元格
    data.forEach(d => {
      const colorIndex = Math.floor((d.value / 100) * (colors.length - 1))
      const x = chartRect.x + cellWidth * d.day
      const y = chartRect.y + cellHeight * d.hour

      ctx.fillStyle = colors[colorIndex]
      const isHover = hoverItem && hoverItem.day === d.day && hoverItem.hour === d.hour

      if (isHover) {
        ctx.fillRect(x, y, cellWidth, cellHeight)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2)
      } else {
        ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2)
      }

      // 绘制数值 - 根据背景颜色自动选择文字颜色
      ctx.fillStyle = getContrastTextColor(colors[colorIndex])
      ctx.font = isHover ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(d.value), x + cellWidth / 2, y + cellHeight / 2)
    })

    // 绘制X轴标签
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    days.forEach((day, i) => {
      ctx.fillText(day, chartRect.x + cellWidth * i + cellWidth / 2, chartRect.y + chartRect.height + 15)
    })

    // 绘制Y轴标签
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    hours.forEach((hour, j) => {
      ctx.fillText(hour, chartRect.x - 5, chartRect.y + cellHeight * j + cellHeight / 2)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const dayIdx = Math.floor((pos.x - chartRect.x) / cellWidth)
    const hourIdx = Math.floor((pos.y - chartRect.y) / cellHeight)

    if (dayIdx >= 0 && dayIdx < days.length && hourIdx >= 0 && hourIdx < hours.length &&
      pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width &&
      pos.y >= chartRect.y && pos.y <= chartRect.y + chartRect.height) {

      if (!hoverItem || hoverItem.day !== dayIdx || hoverItem.hour !== hourIdx) {
        hoverItem = { day: dayIdx, hour: hourIdx }
        draw()
      }

      const d = data.find(item => item.day === dayIdx && item.hour === hourIdx)
      if (d) {
        showTooltip(e.clientX, e.clientY,
          `<div class="tooltip-title">${days[dayIdx]} ${hours[hourIdx]}</div>
           <div class="tooltip-item">数值<span class="tooltip-value">${d.value}</span></div>`)
      }
    } else {
      if (hoverItem) {
        hoverItem = null
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverItem = null
    draw()
    hideTooltip()
  })
}

// 关系图
function initGraphChart(): void {
  const container = document.getElementById('graph-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const cx = width / 2
  const cy = height / 2
  const graphRadius = Math.min(width, height) / 2 - 50

  // 圆形布局：中心节点 + 外围节点
  const outerNodes = 5
  const nodes = [
    { id: 'center', name: '中心', value: 12, category: 0, x: cx, y: cy },
  ]
  for (let i = 0; i < outerNodes; i++) {
    const angle = (i / outerNodes) * Math.PI * 2 - Math.PI / 2
    nodes.push({
      id: String(i + 1),
      name: `节点${i + 1}`,
      value: 6 + Math.floor(Math.random() * 4),
      category: i % 3,
      x: cx + Math.cos(angle) * graphRadius,
      y: cy + Math.sin(angle) * graphRadius,
    })
  }

  // 连接中心到所有外围节点 + 外围节点之间相邻连接
  const links = [
    { source: 'center', target: '1' },
    { source: 'center', target: '2' },
    { source: 'center', target: '3' },
    { source: 'center', target: '4' },
    { source: 'center', target: '5' },
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '3', target: '4' },
    { source: '4', target: '5' },
    { source: '5', target: '1' },
  ]

  const categories = [
    { name: '分类1', color: COLORS.primary },
    { name: '分类2', color: COLORS.success },
    { name: '分类3', color: COLORS.warning },
  ]

  let hoverNode: string | null = null

  function draw(): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制连线（曲线）
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source)
      const target = nodes.find(n => n.id === link.target)
      if (source && target) {
        const isRelated = hoverNode === source.id || hoverNode === target.id
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        // 外围节点之间用弧线，中心连接用直线
        if (source.id !== 'center' && target.id !== 'center') {
          const midX = (source.x + target.x) / 2
          const midY = (source.y + target.y) / 2
          const dx = midX - cx
          const dy = midY - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          const ctrlX = midX + (dx / dist) * 20
          const ctrlY = midY + (dy / dist) * 20
          ctx.quadraticCurveTo(ctrlX, ctrlY, target.x, target.y)
        } else {
          ctx.lineTo(target.x, target.y)
        }
        ctx.strokeStyle = isRelated ? '#6366f1' : '#475569'
        ctx.lineWidth = isRelated ? 2 : 1
        ctx.globalAlpha = isRelated ? 0.8 : 0.4
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // 绘制节点
    nodes.forEach(node => {
      const isHover = hoverNode === node.id
      const isCenter = node.id === 'center'
      const radius = isCenter ? 25 : node.value * 1.5 + 8
      const color = categories[node.category].color

      // 绘制光晕效果
      if (isHover || isCenter) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + (isHover ? 8 : 4), 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.15
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // 绘制节点圆
      ctx.beginPath()
      ctx.arc(node.x, node.y, isHover ? radius + 3 : radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 绘制文字
      ctx.fillStyle = isCenter ? '#fff' : TEXT_COLOR
      ctx.font = isHover ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = isCenter ? 'middle' : 'top'
      const labelY = isCenter ? node.y : node.y + radius + 6
      ctx.fillText(node.name, node.x, labelY)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    let found: string | null = null

    nodes.forEach(node => {
      const isCenter = node.id === 'center'
      const radius = isCenter ? 25 : node.value * 1.5 + 8
      const dx = pos.x - node.x
      const dy = pos.y - node.y
      if (dx * dx + dy * dy <= radius * radius) {
        found = node.id
      }
    })

    if (found !== hoverNode) {
      hoverNode = found
      draw()
    }

    if (found) {
      const node = nodes.find(n => n.id === found)!
      const cat = categories[node.category]
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${node.name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${cat.color}"></span>分类: <span class="tooltip-value">${cat.name}</span></div>
         <div class="tooltip-item">数值<span class="tooltip-value">${node.value}</span></div>`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverNode = null
    draw()
    hideTooltip()
  })
}

// 树图
function initTreeChart(): void {
  const container = document.getElementById('tree-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const startX = 60
  const startY = height / 2
  const levelWidth = (width - 120) / 2

  const nodes = [
    { id: 'root', name: '根节点', x: startX, y: startY, value: 100, parent: null, level: 0 },
    { id: '1', name: '节点1', x: startX + levelWidth, y: startY - 55, value: 40, parent: 'root', level: 1 },
    { id: '2', name: '节点2', x: startX + levelWidth, y: startY + 55, value: 60, parent: 'root', level: 1 },
    { id: '1-1', name: '节点1-1', x: startX + levelWidth * 2, y: startY - 80, value: 20, parent: '1', level: 2 },
    { id: '1-2', name: '节点1-2', x: startX + levelWidth * 2, y: startY - 30, value: 20, parent: '1', level: 2 },
    { id: '2-1', name: '节点2-1', x: startX + levelWidth * 2, y: startY + 30, value: 30, parent: '2', level: 2 },
    { id: '2-2', name: '节点2-2', x: startX + levelWidth * 2, y: startY + 80, value: 30, parent: '2', level: 2 },
  ]

  const levelColors = [COLORS.primary, COLORS.success, COLORS.warning]
  let hoverNode: string | null = null

  function draw(): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制连线
    nodes.forEach(node => {
      if (node.parent) {
        const parent = nodes.find(n => n.id === node.parent)
        if (parent) {
          const isRelated = hoverNode === node.id || hoverNode === parent.id
          ctx.beginPath()
          ctx.moveTo(parent.x, parent.y)
          // 贝塞尔曲线连接
          const midX = (parent.x + node.x) / 2
          ctx.bezierCurveTo(midX, parent.y, midX, node.y, node.x, node.y)
          ctx.strokeStyle = isRelated ? levelColors[node.level] : '#475569'
          ctx.lineWidth = isRelated ? 2 : 1.5
          ctx.globalAlpha = isRelated ? 0.9 : 0.4
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    })

    // 绘制节点
    nodes.forEach(node => {
      const isHover = hoverNode === node.id
      const isRoot = node.level === 0
      const radius = isRoot ? 10 : (node.level === 1 ? 7 : 5)
      const color = levelColors[node.level]

      // 光晕效果
      if (isHover || isRoot) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + (isHover ? 6 : 3), 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.2
        ctx.fill()
        ctx.globalAlpha = 1
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, isHover ? radius + 2 : radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 绘制文字
      ctx.fillStyle = isHover ? '#fff' : TEXT_COLOR
      ctx.font = isHover ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      const labelX = node.x + radius + 6
      ctx.fillText(node.name, labelX, node.y)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    let found: string | null = null

    nodes.forEach(node => {
      const isRoot = node.level === 0
      const radius = isRoot ? 12 : (node.level === 1 ? 10 : 8)
      const dx = pos.x - node.x
      const dy = pos.y - node.y
      if (dx * dx + dy * dy <= radius * radius) {
        found = node.id
      }
    })

    if (found !== hoverNode) {
      hoverNode = found
      draw()
    }

    if (found) {
      const node = nodes.find(n => n.id === found)!
      const color = levelColors[node.level]
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${node.name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${color}"></span>数值<span class="tooltip-value">${node.value}</span></div>`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverNode = null
    draw()
    hideTooltip()
  })
}

// 桑基图
function initSankeyChart(): void {
  const container = document.getElementById('sankey-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // 桑基图数据 - 类似ECharts的多层级结构
  interface SankeyNode {
    name: string
    level: number
    color: string
    x: number
    y: number
    height: number
    sourceY: number  // 出口当前Y位置
    targetY: number  // 入口当前Y位置
  }

  interface SankeyLink {
    source: string
    target: string
    value: number
    sy: number  // 源节点连接点Y
    ty: number  // 目标节点连接点Y
  }

  const nodes: SankeyNode[] = [
    // Level 0 - 来源
    { name: 'a', level: 0, color: '#5cb87a', x: 0, y: 0, height: 0, sourceY: 0, targetY: 0 },
    { name: 'b', level: 0, color: '#f7a35c', x: 0, y: 0, height: 0, sourceY: 0, targetY: 0 },
    // Level 1 - 中间
    { name: 'b1', level: 1, color: '#6366f1', x: 0, y: 0, height: 0, sourceY: 0, targetY: 0 },
    // Level 2 - 目标
    { name: 'a1', level: 2, color: '#67c2a5', x: 0, y: 0, height: 0, sourceY: 0, targetY: 0 },
    { name: 'a2', level: 2, color: '#b5cf6b', x: 0, y: 0, height: 0, sourceY: 0, targetY: 0 },
    { name: 'c', level: 2, color: '#4f81bd', x: 0, y: 0, height: 0, sourceY: 0, targetY: 0 },
  ]

  const links: SankeyLink[] = [
    { source: 'a', target: 'a1', value: 5, sy: 0, ty: 0 },
    { source: 'a', target: 'b1', value: 3, sy: 0, ty: 0 },
    { source: 'b', target: 'b1', value: 8, sy: 0, ty: 0 },
    { source: 'b1', target: 'a1', value: 4, sy: 0, ty: 0 },
    { source: 'b1', target: 'a2', value: 3, sy: 0, ty: 0 },
    { source: 'b1', target: 'c', value: 4, sy: 0, ty: 0 },
  ]

  // 布局参数
  const padding = { left: 20, right: 20, top: 20, bottom: 20 }
  const nodeWidth = 20
  const nodeGap = 10
  const usableWidth = width - padding.left - padding.right - nodeWidth
  const usableHeight = height - padding.top - padding.bottom

  // 计算每个节点的总流量
  const nodeValues: Map<string, number> = new Map()
  nodes.forEach(n => {
    const inFlow = links.filter(l => l.target === n.name).reduce((s, l) => s + l.value, 0)
    const outFlow = links.filter(l => l.source === n.name).reduce((s, l) => s + l.value, 0)
    nodeValues.set(n.name, Math.max(inFlow, outFlow))
  })

  // 按层级分组
  const levels = [0, 1, 2]
  const levelNodes: SankeyNode[][] = levels.map(l => nodes.filter(n => n.level === l))
  const levelWidth = usableWidth / (levels.length - 1)

  // 计算高度比例
  const maxLevelValue = Math.max(...levelNodes.map(ln =>
    ln.reduce((s, n) => s + (nodeValues.get(n.name) || 0), 0) + (ln.length - 1) * nodeGap
  ))
  const heightScale = usableHeight / maxLevelValue

  // 计算节点位置
  levelNodes.forEach((ln, levelIdx) => {
    const levelX = padding.left + levelIdx * levelWidth
    const totalHeight = ln.reduce((s, n) => s + (nodeValues.get(n.name) || 0) * heightScale, 0) + (ln.length - 1) * nodeGap
    let currentY = padding.top + (usableHeight - totalHeight) / 2

    ln.forEach(node => {
      node.x = levelX
      node.height = (nodeValues.get(node.name) || 0) * heightScale
      node.y = currentY
      node.sourceY = currentY
      node.targetY = currentY
      currentY += node.height + nodeGap
    })
  })

  // 计算连线的Y坐标
  links.forEach(link => {
    const source = nodes.find(n => n.name === link.source)!
    const target = nodes.find(n => n.name === link.target)!
    const linkHeight = link.value * heightScale

    link.sy = source.sourceY
    source.sourceY += linkHeight

    link.ty = target.targetY
    target.targetY += linkHeight
  })

  let hoverNode: string | null = null
  let hoverLink: SankeyLink | null = null

  function draw(): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制连线
    links.forEach(link => {
      const source = nodes.find(n => n.name === link.source)!
      const target = nodes.find(n => n.name === link.target)!
      const linkHeight = link.value * heightScale

      const isActive = hoverNode === link.source || hoverNode === link.target || hoverLink === link
      const isInactive = (hoverNode || hoverLink) && !isActive

      // 绘制贝塞尔曲线流
      ctx.beginPath()
      const sx = source.x + nodeWidth
      const sy0 = link.sy
      const sy1 = link.sy + linkHeight
      const tx = target.x
      const ty0 = link.ty
      const ty1 = link.ty + linkHeight

      const cpx1 = sx + (tx - sx) * 0.5
      const cpx2 = sx + (tx - sx) * 0.5

      ctx.moveTo(sx, sy0)
      ctx.bezierCurveTo(cpx1, sy0, cpx2, ty0, tx, ty0)
      ctx.lineTo(tx, ty1)
      ctx.bezierCurveTo(cpx2, ty1, cpx1, sy1, sx, sy1)
      ctx.closePath()

      ctx.globalAlpha = isInactive ? 0.1 : (isActive ? 0.6 : 0.3)
      ctx.fillStyle = source.color
      ctx.fill()
      ctx.globalAlpha = 1
    })

    // 绘制节点
    nodes.forEach(node => {
      const isHover = hoverNode === node.name

      ctx.fillStyle = node.color
      ctx.fillRect(node.x, node.y, nodeWidth, node.height)

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.strokeRect(node.x, node.y, nodeWidth, node.height)
      }

      // 标签
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '11px Inter, sans-serif'
      ctx.textBaseline = 'middle'
      const labelY = node.y + node.height / 2

      if (node.level === levels.length - 1) {
        // 最右侧节点，标签在右边
        ctx.textAlign = 'left'
        ctx.fillText(node.name, node.x + nodeWidth + 6, labelY)
      } else if (node.level === 0) {
        // 最左侧节点，标签在左边
        ctx.textAlign = 'right'
        ctx.fillText(node.name, node.x - 6, labelY)
      } else {
        // 中间节点，标签在下方
        ctx.textAlign = 'center'
        ctx.fillText(node.name, node.x + nodeWidth / 2, node.y + node.height + 12)
      }
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    let foundNode: string | null = null
    let foundLink: SankeyLink | null = null

    // 检测节点
    for (const node of nodes) {
      if (pos.x >= node.x && pos.x <= node.x + nodeWidth &&
        pos.y >= node.y && pos.y <= node.y + node.height) {
        foundNode = node.name
        break
      }
    }

    // 如果没有找到节点，检测连线
    if (!foundNode) {
      for (const link of links) {
        const source = nodes.find(n => n.name === link.source)!
        const target = nodes.find(n => n.name === link.target)!
        const linkHeight = link.value * heightScale

        // 简化的连线碰撞检测
        const sx = source.x + nodeWidth
        const tx = target.x
        if (pos.x >= sx && pos.x <= tx) {
          const t = (pos.x - sx) / (tx - sx)
          const y0 = link.sy + (link.ty - link.sy) * t
          const y1 = y0 + linkHeight
          if (pos.y >= y0 && pos.y <= y1) {
            foundLink = link
            break
          }
        }
      }
    }

    if (foundNode !== hoverNode || foundLink !== hoverLink) {
      hoverNode = foundNode
      hoverLink = foundLink
      draw()
    }

    if (foundNode) {
      const node = nodes.find(n => n.name === foundNode)!
      const value = nodeValues.get(node.name) || 0
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${node.name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${node.color}"></span>流量<span class="tooltip-value">${value}</span></div>`)
    } else if (foundLink) {
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${foundLink.source} → ${foundLink.target}</div>
         <div class="tooltip-item">流量<span class="tooltip-value">${foundLink.value}</span></div>`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverNode = null
    hoverLink = null
    draw()
    hideTooltip()
  })
}

// 象形柱图 (水平条形图)
function initPictorialBarChart(): void {
  const container = document.getElementById('pictorial-bar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 70, right: 30, top: 20, bottom: 20 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { name: '苹果', value: 120, color: COLORS.primary },
    { name: '香蕉', value: 200, color: COLORS.success },
    { name: '橙子', value: 150, color: COLORS.warning },
    { name: '葡萄', value: 80, color: COLORS.secondary },
    { name: '西瓜', value: 70, color: COLORS.danger },
  ]

  const maxValue = Math.max(...data.map((d) => d.value))
  const barHeight = (chartRect.height / data.length) * 0.7
  const step = chartRect.height / data.length
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制 Hover 背景
    if (highlightIdx >= 0) {
      const y = chartRect.y + step * highlightIdx
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(0, y, width, step)
    }

    data.forEach((d, i) => {
      const y = chartRect.y + step * i + (step - barHeight) / 2
      const barWidth = (d.value / maxValue) * chartRect.width
      const isHover = i === highlightIdx

      // 绘制条形
      ctx.fillStyle = d.color
      ctx.beginPath()
      ctx.roundRect(chartRect.x, y, barWidth, barHeight, 4)
      ctx.fill()

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 绘制标签
      ctx.fillStyle = isHover ? '#fff' : TEXT_COLOR
      ctx.font = isHover ? 'bold 12px Inter, sans-serif' : '12px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(d.name, chartRect.x - 10, y + barHeight / 2)

      // 绘制数值
      ctx.fillStyle = isHover ? '#fff' : '#94a3b8'
      ctx.textAlign = 'left'
      ctx.fillText(String(d.value), chartRect.x + barWidth + 8, y + barHeight / 2)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.y - chartRect.y) / step)

    if (idx >= 0 && idx < data.length && pos.y >= chartRect.y && pos.y <= chartRect.y + chartRect.height) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const d = data[idx]
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${d.name}</div>
           <div class="tooltip-item"><span class="tooltip-dot" style="background:${d.color}"></span>销量<span class="tooltip-value">${d.value}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 混合图表
function initMixedChart(): void {
  const container = document.getElementById('mixed-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 30, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const barData = [120, 200, 150, 80, 70, 110, 130]
  const lineData = [80, 150, 120, 100, 90, 140, 160]
  const maxVal = Math.max(...barData, ...lineData) * 1.2

  const xStep = chartRect.width / categories.length
  const barWidth = xStep * 0.5
  const yScale = chartRect.height / maxVal
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, categories.length, 5)

    // X Axis
    categories.forEach((label, i) => {
      const x = chartRect.x + xStep * i + xStep / 2
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(label, x, chartRect.y + chartRect.height + 10)
    })

    drawYAxis(ctx, chartRect, 0, maxVal, 5)

    // 绘制 Hover 背景
    if (highlightIdx >= 0) {
      const x = chartRect.x + xStep * highlightIdx
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(x, chartRect.y, xStep, chartRect.height)
    }

    // 绘制柱状图
    barData.forEach((v, i) => {
      const x = chartRect.x + xStep * i + (xStep - barWidth) / 2
      const h = v * yScale
      const y = chartRect.y + chartRect.height - h

      ctx.fillStyle = COLORS.primary
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, h, 4)
      ctx.fill()

      if (i === highlightIdx) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // 绘制折线图
    ctx.beginPath()
    lineData.forEach((v, i) => {
      const x = chartRect.x + xStep * i + xStep / 2
      const y = chartRect.y + chartRect.height - v * yScale
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = COLORS.success
    ctx.lineWidth = 3
    ctx.stroke()

    // 绘制折线点
    lineData.forEach((v, i) => {
      const x = chartRect.x + xStep * i + xStep / 2
      const y = chartRect.y + chartRect.height - v * yScale
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.arc(x, y, isHover ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.success
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / xStep)

    if (idx >= 0 && idx < categories.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${categories[idx]}</div>
           <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.primary}"></span>销售额<span class="tooltip-value">${barData[idx]}</span></div>
           <div class="tooltip-item"><span class="tooltip-dot" style="background:${COLORS.success}"></span>增长率<span class="tooltip-value">${lineData[idx]}%</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 玫瑰图（南丁格尔图）
function initRoseChart(): void {
  const container = document.getElementById('rose-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { value: 40, name: '玫瑰1', color: '#5470c6' },
    { value: 38, name: '玫瑰2', color: '#91cc75' },
    { value: 32, name: '玫瑰3', color: '#fac858' },
    { value: 30, name: '玫瑰4', color: '#ee6666' },
    { value: 28, name: '玫瑰5', color: '#73c0de' },
    { value: 26, name: '玫瑰6', color: '#3ba272' },
    { value: 22, name: '玫瑰7', color: '#fc8452' },
    { value: 18, name: '玫瑰8', color: '#9a60b4' },
  ]

  const cx = width / 2
  const cy = height / 2
  const maxRadius = Math.min(width, height) / 2 - 30
  const innerRadius = 20
  const maxVal = Math.max(...data.map(d => d.value))
  const angleStep = (Math.PI * 2) / data.length
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    data.forEach((d, i) => {
      const startAngle = -Math.PI / 2 + angleStep * i + 0.02
      const endAngle = -Math.PI / 2 + angleStep * (i + 1) - 0.02
      const radius = innerRadius + (maxRadius - innerRadius) * (d.value / maxVal)
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.arc(cx, cy, isHover ? radius + 5 : radius, startAngle, endAngle)
      ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = d.color
      ctx.globalAlpha = isHover ? 1 : 0.85
      ctx.fill()
      ctx.globalAlpha = 1

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 标签
      const midAngle = (startAngle + endAngle) / 2
      const labelR = radius + 15
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(d.name, cx + Math.cos(midAngle) * labelR, cy + Math.sin(midAngle) * labelR)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const dx = pos.x - cx
    const dy = pos.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist >= innerRadius && dist <= maxRadius + 10) {
      let angle = Math.atan2(dy, dx) + Math.PI / 2
      if (angle < 0) angle += Math.PI * 2
      const idx = Math.floor(angle / angleStep) % data.length

      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${data[idx].name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${data[idx].color}"></span>数值<span class="tooltip-value">${data[idx].value}</span></div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 水球图（液体填充）
function initLiquidChart(): void {
  const container = document.getElementById('liquid-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const value = 0.65 // 65%
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 30

  let waveOffset = 0
  let animationId: number

  function draw(): void {
    ctx.clearRect(0, 0, width, height)

    // 外圈
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 3
    ctx.stroke()

    // 裁剪区域
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2)
    ctx.clip()

    // 水波
    const waterHeight = radius * 2 * value
    const waterY = cy + radius - waterHeight

    ctx.beginPath()
    ctx.moveTo(cx - radius, cy + radius)

    // 波浪曲线
    for (let x = -radius; x <= radius; x += 2) {
      const wave1 = Math.sin((x + waveOffset) * 0.03) * 8
      const wave2 = Math.sin((x + waveOffset * 0.8) * 0.05) * 5
      const y = waterY + wave1 + wave2
      ctx.lineTo(cx + x, y)
    }

    ctx.lineTo(cx + radius, cy + radius)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, waterY, 0, cy + radius)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.4)')
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.restore()

    // 百分比文字
    ctx.fillStyle = value > 0.5 ? '#fff' : COLORS.primary
    ctx.font = 'bold 32px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.round(value * 100)}%`, cx, cy)

    waveOffset += 2
    animationId = requestAnimationFrame(draw)
  }

  draw()

  // 清理动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        cancelAnimationFrame(animationId)
      }
    })
  })
  observer.observe(container)
}

// 矩形树图
function initTreemapChart(): void {
  const container = document.getElementById('treemap-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const data = [
    { name: '技术', value: 400, color: '#5470c6' },
    { name: '销售', value: 300, color: '#91cc75' },
    { name: '运营', value: 200, color: '#fac858' },
    { name: '市场', value: 180, color: '#ee6666' },
    { name: '产品', value: 150, color: '#73c0de' },
    { name: '设计', value: 100, color: '#3ba272' },
    { name: '人事', value: 80, color: '#fc8452' },
  ]

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const padding = 10
  let hoverIndex = -1

  // 简单的水平分割布局
  interface Rect { x: number; y: number; width: number; height: number; data: typeof data[0] }
  const rects: Rect[] = []
  let currentX = padding
  let currentY = padding
  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 2
  let rowHeight = usableHeight / 2
  let rowWidth = 0

  data.forEach((d, i) => {
    const ratio = d.value / total
    const area = usableWidth * usableHeight * ratio
    const w = Math.min(usableWidth - rowWidth, area / rowHeight)

    if (rowWidth + w > usableWidth || i >= 4) {
      // 换行
      if (i === 4) {
        currentY += rowHeight + 2
        currentX = padding
        rowWidth = 0
        rowHeight = usableHeight / 2 - 2
      }
    }

    const rectW = i < 4 ? (usableWidth / 4 - 2) : (usableWidth / 3 - 2)
    const rectH = rowHeight - 2

    rects.push({
      x: currentX,
      y: currentY,
      width: rectW,
      height: rectH,
      data: d
    })

    currentX += rectW + 2
    rowWidth += rectW + 2
  })

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    rects.forEach((rect, i) => {
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 4)
      ctx.fillStyle = rect.data.color
      ctx.globalAlpha = isHover ? 1 : 0.85
      ctx.fill()
      ctx.globalAlpha = 1

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 标签
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(rect.data.name, rect.x + rect.width / 2, rect.y + rect.height / 2 - 8)
      ctx.font = '11px Inter, sans-serif'
      ctx.fillText(String(rect.data.value), rect.x + rect.width / 2, rect.y + rect.height / 2 + 10)
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    let found = -1

    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      if (pos.x >= r.x && pos.x <= r.x + r.width && pos.y >= r.y && pos.y <= r.y + r.height) {
        found = i
        break
      }
    }

    if (found !== hoverIndex) {
      hoverIndex = found
      draw(found)
    }

    if (found >= 0) {
      const d = rects[found].data
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${d.name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${d.color}"></span>数值<span class="tooltip-value">${d.value}</span></div>`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 旭日图
function initSunburstChart(): void {
  const container = document.getElementById('sunburst-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // 两层数据
  const data = {
    name: 'root',
    children: [
      {
        name: '销售', value: 100, color: '#5470c6', children: [
          { name: '线上', value: 60 },
          { name: '线下', value: 40 },
        ]
      },
      {
        name: '技术', value: 80, color: '#91cc75', children: [
          { name: '前端', value: 30 },
          { name: '后端', value: 35 },
          { name: '测试', value: 15 },
        ]
      },
      {
        name: '运营', value: 60, color: '#fac858', children: [
          { name: '内容', value: 25 },
          { name: '活动', value: 35 },
        ]
      },
      {
        name: '市场', value: 40, color: '#ee6666', children: [
          { name: '品牌', value: 20 },
          { name: '推广', value: 20 },
        ]
      },
    ]
  }

  const cx = width / 2
  const cy = height / 2
  const innerRadius = 30
  const midRadius = 70
  const outerRadius = Math.min(width, height) / 2 - 25
  const total = data.children.reduce((sum, c) => sum + c.value, 0)

  interface ArcData { startAngle: number; endAngle: number; innerR: number; outerR: number; color: string; name: string; value: number }
  const arcs: ArcData[] = []

  // 第一层
  let angle = -Math.PI / 2
  data.children.forEach((child) => {
    const sweep = (child.value / total) * Math.PI * 2
    arcs.push({
      startAngle: angle + 0.02,
      endAngle: angle + sweep - 0.02,
      innerR: innerRadius,
      outerR: midRadius,
      color: child.color,
      name: child.name,
      value: child.value
    })

    // 第二层
    let childAngle = angle
    const childTotal = child.children.reduce((sum, c) => sum + c.value, 0)
    child.children.forEach((subChild, si) => {
      const subSweep = (subChild.value / childTotal) * sweep
      arcs.push({
        startAngle: childAngle + 0.01,
        endAngle: childAngle + subSweep - 0.01,
        innerR: midRadius + 2,
        outerR: outerRadius,
        color: child.color,
        name: subChild.name,
        value: subChild.value
      })
      childAngle += subSweep
    })

    angle += sweep
  })

  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    arcs.forEach((arc, i) => {
      const isHover = i === highlightIdx

      ctx.beginPath()
      ctx.arc(cx, cy, isHover ? arc.outerR + 3 : arc.outerR, arc.startAngle, arc.endAngle)
      ctx.arc(cx, cy, arc.innerR, arc.endAngle, arc.startAngle, true)
      ctx.closePath()

      ctx.fillStyle = arc.color
      ctx.globalAlpha = arc.innerR === innerRadius ? (isHover ? 1 : 0.9) : (isHover ? 0.9 : 0.6)
      ctx.fill()
      ctx.globalAlpha = 1

      if (isHover) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // 中心文字
    ctx.fillStyle = TEXT_COLOR
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('部门', cx, cy)
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const dx = pos.x - cx
    const dy = pos.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    let mouseAngle = Math.atan2(dy, dx)
    if (mouseAngle < -Math.PI / 2) mouseAngle += Math.PI * 2

    let found = -1
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i]
      if (dist >= arc.innerR && dist <= arc.outerR) {
        let start = arc.startAngle
        let end = arc.endAngle
        if (start < -Math.PI / 2) start += Math.PI * 2
        if (end < -Math.PI / 2) end += Math.PI * 2
        if (mouseAngle >= start && mouseAngle <= end) {
          found = i
          break
        }
      }
    }

    if (found !== hoverIndex) {
      hoverIndex = found
      draw(found)
    }

    if (found >= 0) {
      const d = arcs[found]
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${d.name}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${d.color}"></span>数值<span class="tooltip-value">${d.value}</span></div>`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 箱线图
function initBoxplotChart(): void {
  const container = document.getElementById('boxplot-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 50, right: 20, top: 20, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // 箱线图数据: [min, Q1, median, Q3, max]
  const data = [
    { name: '类别A', values: [850, 940, 980, 1070, 1180], outliers: [750, 1250] },
    { name: '类别B', values: [960, 1050, 1120, 1190, 1300], outliers: [] },
    { name: '类别C', values: [880, 950, 1000, 1080, 1150], outliers: [800] },
    { name: '类别D', values: [900, 1000, 1050, 1150, 1250], outliers: [1350] },
  ]

  const step = chartRect.width / data.length
  const boxWidth = step * 0.5
  const minVal = 700
  const maxVal = 1400
  const yScale = chartRect.height / (maxVal - minVal)
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, chartRect, data.length, 5)
    drawXAxis(ctx, chartRect, data.map(d => d.name), 'onZero')
    drawYAxis(ctx, chartRect, minVal, maxVal, 5)

    data.forEach((d, i) => {
      const x = chartRect.x + step * i + step / 2
      const [min, q1, median, q3, max] = d.values
      const isHover = i === highlightIdx

      const yMin = chartRect.y + chartRect.height - (min - minVal) * yScale
      const yQ1 = chartRect.y + chartRect.height - (q1 - minVal) * yScale
      const yMedian = chartRect.y + chartRect.height - (median - minVal) * yScale
      const yQ3 = chartRect.y + chartRect.height - (q3 - minVal) * yScale
      const yMax = chartRect.y + chartRect.height - (max - minVal) * yScale

      // 须线
      ctx.beginPath()
      ctx.moveTo(x, yMin)
      ctx.lineTo(x, yQ1)
      ctx.moveTo(x, yQ3)
      ctx.lineTo(x, yMax)
      ctx.strokeStyle = isHover ? COLORS.secondary : COLORS.primary
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 须端
      ctx.beginPath()
      ctx.moveTo(x - boxWidth / 4, yMin)
      ctx.lineTo(x + boxWidth / 4, yMin)
      ctx.moveTo(x - boxWidth / 4, yMax)
      ctx.lineTo(x + boxWidth / 4, yMax)
      ctx.stroke()

      // 箱体
      ctx.beginPath()
      ctx.rect(x - boxWidth / 2, yQ3, boxWidth, yQ1 - yQ3)
      ctx.fillStyle = isHover ? COLORS.secondary : COLORS.primary
      ctx.globalAlpha = 0.7
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = isHover ? COLORS.secondary : COLORS.primary
      ctx.lineWidth = 2
      ctx.stroke()

      // 中位数线
      ctx.beginPath()
      ctx.moveTo(x - boxWidth / 2, yMedian)
      ctx.lineTo(x + boxWidth / 2, yMedian)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // 异常值
      d.outliers.forEach((outlier) => {
        const yOutlier = chartRect.y + chartRect.height - (outlier - minVal) * yScale
        ctx.beginPath()
        ctx.arc(x, yOutlier, 4, 0, Math.PI * 2)
        ctx.fillStyle = COLORS.danger
        ctx.fill()
      })
    })
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const idx = Math.floor((pos.x - chartRect.x) / step)
    if (idx >= 0 && idx < data.length && pos.x >= chartRect.x && pos.x <= chartRect.x + chartRect.width) {
      if (idx !== hoverIndex) {
        hoverIndex = idx
        draw(idx)
      }
      const d = data[idx]
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${d.name}</div>
         <div class="tooltip-item">最小值: ${d.values[0]}</div>
         <div class="tooltip-item">Q1: ${d.values[1]}</div>
         <div class="tooltip-item">中位数: ${d.values[2]}</div>
         <div class="tooltip-item">Q3: ${d.values[3]}</div>
         <div class="tooltip-item">最大值: ${d.values[4]}</div>`)
    } else {
      if (hoverIndex !== -1) {
        hoverIndex = -1
        draw()
      }
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 平行坐标图
function initParallelChart(): void {
  const container = document.getElementById('parallel-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280
  const padding = { left: 40, right: 40, top: 30, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  const axes = ['价格', '性能', '续航', '外观', '服务']
  const data = [
    { name: '产品A', values: [80, 90, 70, 85, 95], color: '#5470c6' },
    { name: '产品B', values: [60, 70, 90, 75, 80], color: '#91cc75' },
    { name: '产品C', values: [90, 60, 80, 90, 70], color: '#fac858' },
    { name: '产品D', values: [70, 85, 65, 80, 85], color: '#ee6666' },
  ]

  const axisGap = chartRect.width / (axes.length - 1)
  let hoverIndex = -1

  function draw(highlightIdx: number = -1): void {
    ctx.clearRect(0, 0, width, height)

    // 绘制坐标轴
    axes.forEach((axis, i) => {
      const x = chartRect.x + axisGap * i

      // 轴线
      ctx.beginPath()
      ctx.moveTo(x, chartRect.y)
      ctx.lineTo(x, chartRect.y + chartRect.height)
      ctx.strokeStyle = GRID_COLOR
      ctx.lineWidth = 1
      ctx.stroke()

      // 轴标签
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(axis, x, chartRect.y + chartRect.height + 20)

      // 刻度
      ctx.font = '9px Inter, sans-serif'
      ctx.fillText('100', x, chartRect.y - 5)
      ctx.fillText('0', x, chartRect.y + chartRect.height + 10)
    })

    // 绘制数据线
    data.forEach((d, di) => {
      const isHover = di === highlightIdx

      ctx.beginPath()
      d.values.forEach((v, i) => {
        const x = chartRect.x + axisGap * i
        const y = chartRect.y + chartRect.height - (v / 100) * chartRect.height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = d.color
      ctx.lineWidth = isHover ? 3 : 1.5
      ctx.globalAlpha = isHover ? 1 : 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      // 数据点
      d.values.forEach((v, i) => {
        const x = chartRect.x + axisGap * i
        const y = chartRect.y + chartRect.height - (v / 100) * chartRect.height
        ctx.beginPath()
        ctx.arc(x, y, isHover ? 5 : 3, 0, Math.PI * 2)
        ctx.fillStyle = d.color
        ctx.fill()
      })
    })

    // 图例
    drawLegend(ctx, data.map(d => ({ name: d.name, color: d.color })), width, height, 'top')
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)

    // 找最近的数据线
    let minDist = Infinity
    let closestIdx = -1

    data.forEach((d, di) => {
      d.values.forEach((v, i) => {
        const x = chartRect.x + axisGap * i
        const y = chartRect.y + chartRect.height - (v / 100) * chartRect.height
        const dist = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2))
        if (dist < minDist && dist < 20) {
          minDist = dist
          closestIdx = di
        }
      })
    })

    if (closestIdx !== hoverIndex) {
      hoverIndex = closestIdx
      draw(closestIdx)
    }

    if (closestIdx >= 0) {
      const d = data[closestIdx]
      const items = axes.map((axis, i) =>
        `<div class="tooltip-item">${axis}: ${d.values[i]}</div>`
      ).join('')
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${d.name}</div>${items}`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverIndex = -1
    draw()
    hideTooltip()
  })
}

// 日历图
function initCalendarChart(): void {
  const container = document.getElementById('calendar-chart')
  if (!container) return

  const width = container.clientWidth || 400
  const height = container.clientHeight || 280

  const result = createHiDPICanvas(container, width, height)
  if (!result) return
  const { canvas, ctx } = result

  // 生成示例数据（一年的提交记录）
  const data: { date: string; value: number }[] = []
  const today = new Date()
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10)
    })
  }

  const cellSize = 10
  const cellGap = 2
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const startX = 40
  const startY = 30
  let hoverCell: { date: string; value: number } | null = null

  // 颜色映射
  const getColor = (value: number) => {
    if (value === 0) return '#1e293b'
    if (value <= 2) return 'rgba(99, 102, 241, 0.3)'
    if (value <= 4) return 'rgba(99, 102, 241, 0.5)'
    if (value <= 6) return 'rgba(99, 102, 241, 0.7)'
    return 'rgba(99, 102, 241, 1)'
  }

  function draw(): void {
    ctx.clearRect(0, 0, width, height)

    // 标题
    ctx.fillStyle = TEXT_COLOR
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('贡献热力图', startX, 15)

    // 星期标签
    ctx.font = '9px Inter, sans-serif'
    ctx.textAlign = 'right'
    weekdays.forEach((day, i) => {
      if (i % 2 === 1) {
        ctx.fillText(day, startX - 5, startY + i * (cellSize + cellGap) + cellSize / 2 + 3)
      }
    })

    // 绘制日历格子
    const firstDay = new Date(data[0].date)
    const startDayOfWeek = firstDay.getDay()

    data.forEach((d, i) => {
      const dayOfWeek = (startDayOfWeek + i) % 7
      const week = Math.floor((startDayOfWeek + i) / 7)
      const x = startX + week * (cellSize + cellGap)
      const y = startY + dayOfWeek * (cellSize + cellGap)

      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, 2)
      ctx.fillStyle = getColor(d.value)
      ctx.fill()

      if (hoverCell && hoverCell.date === d.date) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // 图例
    const legendX = startX
    const legendY = startY + 7 * (cellSize + cellGap) + 15
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '9px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('少', legendX, legendY + 8)

    const legendColors = ['#1e293b', 'rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.5)', 'rgba(99, 102, 241, 0.7)', 'rgba(99, 102, 241, 1)']
    legendColors.forEach((color, i) => {
      ctx.beginPath()
      ctx.roundRect(legendX + 20 + i * 14, legendY, 12, 12, 2)
      ctx.fillStyle = color
      ctx.fill()
    })
    ctx.fillStyle = TEXT_COLOR
    ctx.fillText('多', legendX + 95, legendY + 8)
  }

  draw()

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e)
    const firstDay = new Date(data[0].date)
    const startDayOfWeek = firstDay.getDay()

    let found: { date: string; value: number } | null = null

    for (let i = 0; i < data.length; i++) {
      const dayOfWeek = (startDayOfWeek + i) % 7
      const week = Math.floor((startDayOfWeek + i) / 7)
      const x = startX + week * (cellSize + cellGap)
      const y = startY + dayOfWeek * (cellSize + cellGap)

      if (pos.x >= x && pos.x <= x + cellSize && pos.y >= y && pos.y <= y + cellSize) {
        found = data[i]
        break
      }
    }

    if (found !== hoverCell) {
      hoverCell = found
      draw()
    }

    if (found) {
      showTooltip(e.clientX, e.clientY,
        `<div class="tooltip-title">${found.date}</div>
         <div class="tooltip-item"><span class="tooltip-dot" style="background:${getColor(found.value)}"></span>贡献<span class="tooltip-value">${found.value}</span></div>`)
    } else {
      hideTooltip()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    hoverCell = null
    draw()
    hideTooltip()
  })
}

// 图表配置列表
const chartConfigs: ChartConfig[] = [
  // 折线图系列
  { id: 'line-chart', title: '基础折线图', subtitle: '多系列数据对比', icon: LineChart, type: 'line', init: initLineChart },
  { id: 'smooth-line-chart', title: '平滑折线图', subtitle: '贝塞尔曲线平滑', icon: LineChart, type: 'line', init: initSmoothLineChart },
  { id: 'stacked-line-chart', title: '堆叠折线图', subtitle: '多系列堆叠展示', icon: LineChart, type: 'line', init: initStackedLineChart },
  { id: 'stacked-area-chart', title: '堆叠面积图', subtitle: '区域填充堆叠', icon: LineChart, type: 'line', init: initStackedAreaChart },
  { id: 'gradient-area-chart', title: '渐变面积图', subtitle: '渐变填充效果', icon: LineChart, type: 'line', init: initGradientAreaChart },
  { id: 'gradient-stacked-area-chart', title: '渐变堆叠面积图', subtitle: '多彩渐变堆叠', icon: LineChart, type: 'line', init: initGradientStackedAreaChart },
  { id: 'step-line-chart', title: '阶梯折线图', subtitle: '阶梯状连接', icon: LineChart, type: 'line', init: initStepLineChart },
  { id: 'temperature-chart', title: '气温变化图', subtitle: '最高最低温度', icon: LineChart, type: 'line', init: initTemperatureChart },
  { id: 'dual-axis-chart', title: '双Y轴折线图', subtitle: '双坐标轴展示', icon: LineChart, type: 'line', init: initDualAxisChart },
  { id: 'line-markline-chart', title: '标记线折线图', subtitle: '平均值/最大值标记', icon: LineChart, type: 'line', init: initLineWithMarklineChart },
  { id: 'bump-chart', title: '排名变化图', subtitle: 'Bump Chart', icon: LineChart, type: 'line', init: initBumpChart },
  { id: 'negative-area-chart', title: '正负区域图', subtitle: '正负值分色填充', icon: LineChart, type: 'line', init: initNegativeAreaChart },
  { id: 'large-scale-line-chart', title: '大数据量折线图', subtitle: '200个数据点', icon: LineChart, type: 'line', init: initLargeScaleLineChart },
  { id: 'area-pieces-chart', title: 'AQI区域高亮图', subtitle: '分段着色', icon: LineChart, type: 'line', init: initAreaPiecesChart },
  // 柱状图系列
  { id: 'bar-chart', title: '基础柱状图', subtitle: '圆角柱形展示', icon: BarChart3, type: 'bar', init: initBarChart },
  { id: 'stacked-bar-chart', title: '堆叠柱状图', subtitle: '多系列堆叠', icon: BarChart3, type: 'bar', init: initStackedBarChart },
  { id: 'grouped-bar-chart', title: '分组柱状图', subtitle: '多年度对比', icon: BarChart3, type: 'bar', init: initGroupedBarChart },
  { id: 'horizontal-bar-chart', title: '横向柱状图', subtitle: '水平条形展示', icon: BarChart3, type: 'bar', init: initHorizontalBarChart },
  { id: 'negative-bar-chart', title: '正负柱状图', subtitle: '正负值分色', icon: BarChart3, type: 'bar', init: initNegativeBarChart },
  { id: 'waterfall-chart', title: '瀑布图', subtitle: '累积变化展示', icon: BarChart3, type: 'bar', init: initWaterfallChart },
  { id: 'bar-background-chart', title: '带背景柱状图', subtitle: '百分比进度', icon: BarChart3, type: 'bar', init: initBarWithBackgroundChart },
  { id: 'sorted-bar-chart', title: '排序柱状图', subtitle: '自动排序排名', icon: BarChart3, type: 'bar', init: initSortedBarChart },
  { id: 'polar-bar-chart', title: '极坐标柱状图', subtitle: '环形扇形柱', icon: BarChart3, type: 'bar', init: initPolarBarChart },
  // 饼图系列
  { id: 'pie-chart', title: '饼图', subtitle: '数据占比分析', icon: PieChart, type: 'pie', init: initPieChart },
  { id: 'donut-chart', title: '环形图', subtitle: '中空饼图展示', icon: PieChart, type: 'pie', init: initDonutChart },
  { id: 'rose-chart', title: '玫瑰图', subtitle: '南丁格尔图', icon: PieChart, type: 'pie', init: initRoseChart },
  { id: 'sunburst-chart', title: '旭日图', subtitle: '多层级环形', icon: PieChart, type: 'pie', init: initSunburstChart },
  // 散点图系列
  { id: 'scatter-chart', title: '散点图', subtitle: '多维数据展示', icon: ScatterChart, type: 'scatter', init: initScatterChart },
  // 雷达图系列
  { id: 'radar-chart', title: '雷达图', subtitle: '多维度数据对比', icon: Target, type: 'radar', init: initRadarChart },
  // 仪表盘系列
  { id: 'gauge-chart', title: '仪表盘', subtitle: '进度指示器', icon: Gauge, type: 'gauge', init: initGaugeChart },
  { id: 'liquid-chart', title: '水球图', subtitle: '液体填充动画', icon: Gauge, type: 'gauge', init: initLiquidChart },
  { id: 'ring-progress-chart', title: '环形进度', subtitle: '百分比进度展示', icon: CircleDot, type: 'progress', init: initRingProgressChart },
  // 漏斗图系列
  { id: 'funnel-chart', title: '漏斗图', subtitle: '流程转化率', icon: Filter, type: 'funnel', init: initFunnelChart },
  // 统计图表
  { id: 'candlestick-chart', title: 'K线图', subtitle: 'OHLC 数据展示', icon: TrendingUp, type: 'candlestick', init: initCandlestickChart },
  { id: 'boxplot-chart', title: '箱线图', subtitle: '数据分布统计', icon: TrendingUp, type: 'candlestick', init: initBoxplotChart },
  { id: 'heatmap-chart', title: '热力图', subtitle: '二维数据热度展示', icon: Flame, type: 'heatmap', init: initHeatmapChart },
  { id: 'calendar-chart', title: '日历图', subtitle: '贡献热力图', icon: Flame, type: 'heatmap', init: initCalendarChart },
  // 关系图表
  { id: 'graph-chart', title: '关系图', subtitle: '力导向布局展示', icon: Network, type: 'graph', init: initGraphChart },
  { id: 'tree-chart', title: '树图', subtitle: '层级结构展示', icon: GitBranch, type: 'tree', init: initTreeChart },
  { id: 'treemap-chart', title: '矩形树图', subtitle: '层级占比展示', icon: GitBranch, type: 'tree', init: initTreemapChart },
  { id: 'sankey-chart', title: '桑基图', subtitle: '数据流向展示', icon: Workflow, type: 'sankey', init: initSankeyChart },
  { id: 'parallel-chart', title: '平行坐标', subtitle: '多维数据对比', icon: Workflow, type: 'sankey', init: initParallelChart },
  // 特殊图表
  { id: 'pictorial-bar-chart', title: '象形柱图', subtitle: '符号重复展示', icon: BarChart2, type: 'pictorial', init: initPictorialBarChart },
  { id: 'mixed-chart', title: '混合图表', subtitle: '柱线组合展示', icon: Layers, type: 'mixed', init: initMixedChart },
  { id: 'area-chart', title: '面积图', subtitle: '平滑曲线填充', icon: Activity, type: 'area', init: initAreaChart },
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

      section.items.forEach((item, index) => {
        const itemEl = document.createElement('div')
        itemEl.className = `nav-item${section.title === '概览' && index === 0 ? ' active' : ''}`
        itemEl.dataset.view = item.id

        const iconEl = createElement(item.icon as Parameters<typeof createElement>[0])
        itemEl.appendChild(iconEl)

        const labelEl = document.createElement('span')
        labelEl.textContent = item.label
        itemEl.appendChild(labelEl)

        sectionEl.appendChild(itemEl)
      })

      navContainer.appendChild(sectionEl)
    })
  }

  // 统计卡片
  const statsBar = document.getElementById('stats-bar')
  if (statsBar) {
    const stats = [
      { icon: BarChart3, value: '17', label: '图表类型', color: 'blue' },
      { icon: Zap, value: '60fps', label: '流畅动画', color: 'green' },
      { icon: Package, value: '<50KB', label: 'Gzip 体积', color: 'yellow' },
      { icon: Palette, value: '2+', label: '内置主题', color: 'red' },
    ]

    stats.forEach((stat) => {
      const card = document.createElement('div')
      card.className = 'stat-card'

      const iconDiv = document.createElement('div')
      iconDiv.className = `stat-icon ${stat.color}`
      iconDiv.appendChild(createElement(stat.icon))

      const infoDiv = document.createElement('div')
      infoDiv.className = 'stat-info'
      infoDiv.innerHTML = `<h3>${stat.value}</h3><p>${stat.label}</p>`

      card.appendChild(iconDiv)
      card.appendChild(infoDiv)
      statsBar.appendChild(card)
    })
  }

  // 图表卡片
  const chartsGrid = document.getElementById('charts-grid')
  if (chartsGrid) {
    chartConfigs.forEach((config) => {
      const card = document.createElement('div')
      card.className = 'chart-card'
      card.dataset.type = config.type

      const header = document.createElement('div')
      header.className = 'chart-header'

      const titleDiv = document.createElement('div')
      titleDiv.className = 'chart-title'

      const iconDiv = document.createElement('div')
      iconDiv.className = 'chart-title-icon'
      iconDiv.appendChild(createElement(config.icon as Parameters<typeof createElement>[0]))

      const textDiv = document.createElement('div')
      textDiv.innerHTML = `<h3>${config.title}</h3><p>${config.subtitle}</p>`

      titleDiv.appendChild(iconDiv)
      titleDiv.appendChild(textDiv)

      const actionsDiv = document.createElement('div')
      actionsDiv.className = 'chart-actions'

      const refreshBtn = document.createElement('button')
      refreshBtn.className = 'chart-action-btn'
      refreshBtn.appendChild(createElement(RotateCw))

      const moreBtn = document.createElement('button')
      moreBtn.className = 'chart-action-btn'
      moreBtn.appendChild(createElement(MoreVertical))

      actionsDiv.appendChild(refreshBtn)
      actionsDiv.appendChild(moreBtn)

      header.appendChild(titleDiv)
      header.appendChild(actionsDiv)

      const container = document.createElement('div')
      container.id = config.id
      container.className = 'chart-container'

      card.appendChild(header)
      card.appendChild(container)
      chartsGrid.appendChild(card)
    })
  }
}

// 初始化所有图表
function initAllCharts(): void {
  chartConfigs.forEach((config) => {
    try {
      config.init()
    } catch (e) {
      console.error(`Failed to init ${config.id}:`, e)
    }
  })
}

// 导航交互
function setupNavigation(): void {
  const navItems = document.querySelectorAll('.nav-item')
  const cards = document.querySelectorAll('.chart-card')

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const view = (item as HTMLElement).dataset.view

      navItems.forEach((n) => n.classList.remove('active'))
      item.classList.add('active')

      cards.forEach((card) => {
        const type = (card as HTMLElement).dataset.type
        if (view === 'all' || type === view) {
          ; (card as HTMLElement).style.display = 'block'
        } else {
          ; (card as HTMLElement).style.display = 'none'
        }
      })

      setTimeout(initAllCharts, 100)
    })
  })
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initUI()
  initAllCharts()
  setupNavigation()

  let resizeTimeout: number
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(initAllCharts, 200)
  })
})
