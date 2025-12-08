/**
 * LDesign Chart 示例 - 主入口
 * 展示所有图表类型，包含完整交互功能
 */
import {
  CanvasRenderer,
  RadarSeries,
  GaugeSeries,
  FunnelSeries,
  RingProgressSeries,
} from '@ldesign/chart-core'

// 配色方案 - 现代紫色系
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899',
  indigo: '#6366f1',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  green: '#22c55e',
  orange: '#f97316',
}

// 文本颜色（暗色主题）
const TEXT_COLOR = '#94a3b8'
const TEXT_LIGHT = '#e2e8f0'
const GRID_COLOR = '#334155'
// const BG_COLOR = '#1e293b'

// 示例数据
const months = ['一月', '二月', '三月', '四月', '五月', '六月']
const salesData = [150, 230, 224, 218, 135, 147]
const visitData = [80, 120, 160, 140, 180, 200]

// 存储图表实例用于交互
interface ChartInstance {
  renderer: CanvasRenderer
  container: HTMLElement
  data: number[]
  labels: string[]
  hoverIndex: number
  animationProgress: number
  redraw: () => void
}

// const chartInstances: Map<string, ChartInstance> = new Map()

/**
 * 创建Tooltip元素
 */
function createTooltip(): HTMLElement {
  let tooltip = document.getElementById('chart-tooltip')
  if (!tooltip) {
    tooltip = document.createElement('div')
    tooltip.id = 'chart-tooltip'
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      color: #e2e8f0;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.15s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
    `
    document.body.appendChild(tooltip)
  }
  return tooltip
}

/**
 * 显示Tooltip
 */
function showTooltip(x: number, y: number, content: string): void {
  const tooltip = createTooltip()
  tooltip.innerHTML = content
  tooltip.style.opacity = '1'
  tooltip.style.left = `${x + 15}px`
  tooltip.style.top = `${y + 15}px`
  
  // 边界检测
  const rect = tooltip.getBoundingClientRect()
  if (rect.right > window.innerWidth) {
    tooltip.style.left = `${x - rect.width - 15}px`
  }
  if (rect.bottom > window.innerHeight) {
    tooltip.style.top = `${y - rect.height - 15}px`
  }
}

/**
 * 隐藏Tooltip
 */
function hideTooltip(): void {
  const tooltip = document.getElementById('chart-tooltip')
  if (tooltip) {
    tooltip.style.opacity = '0'
  }
}

/**
 * 绘制网格线
 */
function drawGrid(
  renderer: CanvasRenderer,
  rect: { x: number; y: number; width: number; height: number },
  xCount: number,
  yCount: number
): void {
  const ctx = renderer.getContext()
  if (!ctx) return

  ctx.save()
  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.3

  // 水平网格线
  for (let i = 0; i <= yCount; i++) {
    const y = rect.y + (rect.height * i) / yCount
    ctx.beginPath()
    ctx.moveTo(rect.x, y)
    ctx.lineTo(rect.x + rect.width, y)
    ctx.stroke()
  }

  // 垂直网格线
  for (let i = 0; i <= xCount; i++) {
    const x = rect.x + (rect.width * i) / xCount
    ctx.beginPath()
    ctx.moveTo(x, rect.y)
    ctx.lineTo(x, rect.y + rect.height)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * 绘制X轴
 */
function drawXAxis(
  renderer: CanvasRenderer,
  rect: { x: number; y: number; width: number; height: number },
  labels: string[]
): void {
  const ctx = renderer.getContext()
  if (!ctx) return

  ctx.save()
  
  // 轴线
  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(rect.x, rect.y + rect.height)
  ctx.lineTo(rect.x + rect.width, rect.y + rect.height)
  ctx.stroke()

  // 标签
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '11px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  
  const step = rect.width / (labels.length - 1 || 1)
  labels.forEach((label, i) => {
    const x = rect.x + step * i
    ctx.fillText(label, x, rect.y + rect.height + 8)
  })

  ctx.restore()
}

/**
 * 绘制Y轴
 */
function drawYAxis(
  renderer: CanvasRenderer,
  rect: { x: number; y: number; width: number; height: number },
  minValue: number,
  maxValue: number,
  tickCount: number = 5
): void {
  const ctx = renderer.getContext()
  if (!ctx) return

  ctx.save()

  // 轴线
  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(rect.x, rect.y)
  ctx.lineTo(rect.x, rect.y + rect.height)
  ctx.stroke()

  // 刻度和标签
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '11px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  for (let i = 0; i <= tickCount; i++) {
    const value = minValue + ((maxValue - minValue) * i) / tickCount
    const y = rect.y + rect.height - (rect.height * i) / tickCount
    ctx.fillText(Math.round(value).toString(), rect.x - 8, y)
  }

  ctx.restore()
}

/**
 * 缓动函数 - easeOutQuart
 */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/**
 * 动画帧
 */
function animate(
  duration: number,
  onFrame: (progress: number) => void,
  onComplete?: () => void
): void {
  const startTime = performance.now()
  
  function frame(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutQuart(progress)
    
    onFrame(easedProgress)
    
    if (progress < 1) {
      requestAnimationFrame(frame)
    } else if (onComplete) {
      onComplete()
    }
  }
  
  requestAnimationFrame(frame)
}

/**
 * 初始化折线图 - 带交互
 */
function initLineChart(): void {
  const container = document.getElementById('line-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)

  const maxValue = Math.max(...salesData) * 1.2
  let hoverIndex = -1
  let animProgress = 0

  function draw(progress: number = 1) {
    const ctx = renderer.getContext()
    if (!ctx) return

    renderer.clear()

    // 标题
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('销售趋势分析', width / 2, 22)

    // 网格
    drawGrid(renderer, chartRect, salesData.length - 1, 5)

    // 坐标轴
    drawXAxis(renderer, chartRect, months)
    drawYAxis(renderer, chartRect, 0, maxValue, 5)

    // 计算点坐标
    const points: { x: number; y: number }[] = salesData.map((value, i) => ({
      x: chartRect.x + (chartRect.width * i) / (salesData.length - 1),
      y: chartRect.y + chartRect.height - (chartRect.height * value * progress) / maxValue,
    }))

    // 渐变填充区域
    const gradient = ctx.createLinearGradient(0, chartRect.y, 0, chartRect.y + chartRect.height)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')

    ctx.beginPath()
    ctx.moveTo(points[0]!.x, chartRect.y + chartRect.height)
    points.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1]!.x, chartRect.y + chartRect.height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // 绘制线条
    ctx.beginPath()
    ctx.moveTo(points[0]!.x, points[0]!.y)
    points.forEach((p, i) => {
      if (i > 0) ctx.lineTo(p.x, p.y)
    })
    ctx.strokeStyle = COLORS.indigo
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    // 绘制数据点
    points.forEach((p, i) => {
      const isHovered = i === hoverIndex
      const radius = isHovered ? 8 : 5

      // 外圈
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? COLORS.indigo : '#fff'
      ctx.fill()
      ctx.strokeStyle = COLORS.indigo
      ctx.lineWidth = 3
      ctx.stroke()

      // 高亮效果
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'
        ctx.fill()
      }
    })
  }

  // 鼠标交互
  const canvas = renderer.getCanvas()
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 检测hover点
      let newHoverIndex = -1
      salesData.forEach((value, i) => {
        const px = chartRect.x + (chartRect.width * i) / (salesData.length - 1)
        const py = chartRect.y + chartRect.height - (chartRect.height * value) / maxValue
        const dist = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))
        if (dist < 15) newHoverIndex = i
      })

      if (newHoverIndex !== hoverIndex) {
        hoverIndex = newHoverIndex
        draw(animProgress)

        if (hoverIndex >= 0) {
          showTooltip(
            e.clientX,
            e.clientY,
            `<div style="font-weight:600;margin-bottom:4px">${months[hoverIndex]}</div>
             <div style="color:${COLORS.indigo}">● 销售额: <b>${salesData[hoverIndex]}</b></div>`
          )
          canvas.style.cursor = 'pointer'
        } else {
          hideTooltip()
          canvas.style.cursor = 'default'
        }
      }
    })

    canvas.addEventListener('mouseleave', () => {
      hoverIndex = -1
      draw(animProgress)
      hideTooltip()
    })
  }

  // 入场动画
  animate(800, (progress) => {
    animProgress = progress
    draw(progress)
  })
}

/**
 * 初始化柱状图 - 带交互
 */
function initBarChart(): void {
  const container = document.getElementById('bar-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)

  const maxValue = Math.max(...salesData) * 1.2
  let hoverIndex = -1
  let animProgress = 0

  function draw(progress: number = 1) {
    const ctx = renderer.getContext()
    if (!ctx) return

    renderer.clear()

    // 标题
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('月度销售额', width / 2, 22)

    // 网格
    drawGrid(renderer, chartRect, salesData.length, 5)

    // 坐标轴
    drawXAxis(renderer, chartRect, months)
    drawYAxis(renderer, chartRect, 0, maxValue, 5)

    // 柱状图参数
    const barWidth = (chartRect.width / salesData.length) * 0.6
    const gap = (chartRect.width / salesData.length) * 0.4

    // 绘制柱子
    salesData.forEach((value, i) => {
      const isHovered = i === hoverIndex
      const barHeight = (chartRect.height * value * progress) / maxValue
      const x = chartRect.x + (chartRect.width * i) / salesData.length + gap / 2
      const y = chartRect.y + chartRect.height - barHeight

      // 渐变填充
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
      if (isHovered) {
        gradient.addColorStop(0, '#22d3ee')
        gradient.addColorStop(1, '#06b6d4')
      } else {
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)')
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.6)')
      }

      // 绘制圆角矩形
      const radius = 6
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + barWidth - radius, y)
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
      ctx.lineTo(x + barWidth, y + barHeight)
      ctx.lineTo(x, y + barHeight)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // hover阴影
      if (isHovered) {
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)'
        ctx.shadowBlur = 15
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // 数值标签
      if (progress === 1) {
        ctx.fillStyle = TEXT_LIGHT
        ctx.font = '11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(value.toString(), x + barWidth / 2, y - 8)
      }
    })
  }

  // 鼠标交互
  const canvas = renderer.getCanvas()
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left

      // 检测hover柱子
      const barWidth = (chartRect.width / salesData.length) * 0.6
      const gap = (chartRect.width / salesData.length) * 0.4
      let newHoverIndex = -1

      salesData.forEach((_, i) => {
        const barX = chartRect.x + (chartRect.width * i) / salesData.length + gap / 2
        if (x >= barX && x <= barX + barWidth) {
          newHoverIndex = i
        }
      })

      if (newHoverIndex !== hoverIndex) {
        hoverIndex = newHoverIndex
        draw(animProgress)

        if (hoverIndex >= 0) {
          showTooltip(
            e.clientX,
            e.clientY,
            `<div style="font-weight:600;margin-bottom:4px">${months[hoverIndex]}</div>
             <div style="color:${COLORS.cyan}">● 销售额: <b>${salesData[hoverIndex]}</b></div>`
          )
          canvas.style.cursor = 'pointer'
        } else {
          hideTooltip()
          canvas.style.cursor = 'default'
        }
      }
    })

    canvas.addEventListener('mouseleave', () => {
      hoverIndex = -1
      draw(animProgress)
      hideTooltip()
    })
  }

  // 入场动画
  animate(800, (progress) => {
    animProgress = progress
    draw(progress)
  })
}

/**
 * 初始化饼图 - 带交互和动画
 */
function initPieChart(): void {
  const container = document.getElementById('pie-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300
  const cx = width / 2
  const cy = height / 2 + 15
  const radius = Math.min(width, height) * 0.3

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)

  const pieData = [
    { value: 335, name: '直接访问', color: COLORS.indigo },
    { value: 310, name: '邮件营销', color: COLORS.cyan },
    { value: 234, name: '联盟广告', color: COLORS.success },
    { value: 135, name: '视频广告', color: COLORS.warning },
    { value: 548, name: '搜索引擎', color: COLORS.pink },
  ]
  const total = pieData.reduce((sum, d) => sum + d.value, 0)
  let hoverIndex = -1

  function draw(progress: number = 1) {
    const ctx = renderer.getContext()
    if (!ctx) return

    renderer.clear()

    // 标题
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('访问来源分析', width / 2, 22)

    let startAngle = -Math.PI / 2
    pieData.forEach((item, i) => {
      const angle = (item.value / total) * Math.PI * 2 * progress
      const endAngle = startAngle + angle
      const isHovered = i === hoverIndex
      const r = isHovered ? radius + 10 : radius

      // 绘制扇形
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = isHovered ? item.color : item.color + 'cc'
      ctx.fill()

      if (isHovered) {
        ctx.shadowColor = item.color
        ctx.shadowBlur = 20
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // 标签
      if (progress === 1) {
        const midAngle = startAngle + angle / 2
        const labelR = r + 25
        const lx = cx + Math.cos(midAngle) * labelR
        const ly = cy + Math.sin(midAngle) * labelR
        const percent = ((item.value / total) * 100).toFixed(1) + '%'

        ctx.fillStyle = TEXT_COLOR
        ctx.font = '11px Inter, sans-serif'
        ctx.textAlign = midAngle > -Math.PI / 2 && midAngle < Math.PI / 2 ? 'left' : 'right'
        ctx.fillText(`${item.name}: ${percent}`, lx, ly)
      }

      startAngle = endAngle
    })
  }

  // 鼠标交互
  const canvas = renderer.getCanvas()
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - cx
      const y = e.clientY - rect.top - cy
      const dist = Math.sqrt(x * x + y * y)
      let angle = Math.atan2(y, x)
      if (angle < -Math.PI / 2) angle += Math.PI * 2

      let newHoverIndex = -1
      if (dist <= radius + 15) {
        let startAngle = -Math.PI / 2
        pieData.forEach((item, i) => {
          const endAngle = startAngle + (item.value / total) * Math.PI * 2
          if (angle >= startAngle && angle < endAngle) {
            newHoverIndex = i
          }
          startAngle = endAngle
        })
      }

      if (newHoverIndex !== hoverIndex) {
        hoverIndex = newHoverIndex
        draw()

        if (hoverIndex >= 0) {
          const item = pieData[hoverIndex]!
          showTooltip(
            e.clientX,
            e.clientY,
            `<div style="font-weight:600;margin-bottom:4px">${item.name}</div>
             <div style="color:${item.color}">● 数量: <b>${item.value}</b></div>
             <div>占比: <b>${((item.value / total) * 100).toFixed(1)}%</b></div>`
          )
          canvas.style.cursor = 'pointer'
        } else {
          hideTooltip()
          canvas.style.cursor = 'default'
        }
      }
    })

    canvas.addEventListener('mouseleave', () => {
      hoverIndex = -1
      draw()
      hideTooltip()
    })
  }

  animate(1000, draw)
}

/**
 * 初始化环形图 - 带交互和动画
 */
function initDonutChart(): void {
  const container = document.getElementById('donut-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300
  const cx = width / 2
  const cy = height / 2 + 15
  const outerRadius = Math.min(width, height) * 0.32
  const innerRadius = outerRadius * 0.6

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)

  const donutData = [
    { value: 40, name: '产品A', color: COLORS.pink },
    { value: 30, name: '产品B', color: COLORS.warning },
    { value: 20, name: '产品C', color: COLORS.success },
    { value: 10, name: '产品D', color: COLORS.cyan },
  ]
  const total = donutData.reduce((sum, d) => sum + d.value, 0)
  let hoverIndex = -1

  function draw(progress: number = 1) {
    const ctx = renderer.getContext()
    if (!ctx) return

    renderer.clear()

    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('产品销售占比', width / 2, 22)

    let startAngle = -Math.PI / 2
    donutData.forEach((item, i) => {
      const angle = (item.value / total) * Math.PI * 2 * progress
      const endAngle = startAngle + angle
      const isHovered = i === hoverIndex
      const or = isHovered ? outerRadius + 8 : outerRadius

      ctx.beginPath()
      ctx.arc(cx, cy, or, startAngle, endAngle)
      ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = isHovered ? item.color : item.color + 'cc'
      ctx.fill()

      // 百分比标签
      if (progress === 1) {
        const midAngle = startAngle + angle / 2
        const labelR = (innerRadius + or) / 2
        const lx = cx + Math.cos(midAngle) * labelR
        const ly = cy + Math.sin(midAngle) * labelR

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(((item.value / total) * 100).toFixed(0) + '%', lx, ly)
      }

      startAngle = endAngle
    })

    // 中心文字
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 20px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(total.toString(), cx, cy - 5)
    ctx.font = '11px Inter, sans-serif'
    ctx.fillStyle = TEXT_COLOR
    ctx.fillText('总计', cx, cy + 15)
  }

  const canvas = renderer.getCanvas()
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - cx
      const y = e.clientY - rect.top - cy
      const dist = Math.sqrt(x * x + y * y)
      let angle = Math.atan2(y, x)
      if (angle < -Math.PI / 2) angle += Math.PI * 2

      let newHoverIndex = -1
      if (dist >= innerRadius && dist <= outerRadius + 10) {
        let startAngle = -Math.PI / 2
        donutData.forEach((item, i) => {
          const endAngle = startAngle + (item.value / total) * Math.PI * 2
          if (angle >= startAngle && angle < endAngle) newHoverIndex = i
          startAngle = endAngle
        })
      }

      if (newHoverIndex !== hoverIndex) {
        hoverIndex = newHoverIndex
        draw()
        if (hoverIndex >= 0) {
          const item = donutData[hoverIndex]!
          showTooltip(e.clientX, e.clientY,
            `<div style="font-weight:600;color:${item.color}">${item.name}</div>
             <div>数量: <b>${item.value}</b> | 占比: <b>${((item.value / total) * 100).toFixed(1)}%</b></div>`)
          canvas.style.cursor = 'pointer'
        } else {
          hideTooltip()
          canvas.style.cursor = 'default'
        }
      }
    })
    canvas.addEventListener('mouseleave', () => { hoverIndex = -1; draw(); hideTooltip() })
  }

  animate(1000, draw)
}

/**
 * 初始化散点图 - 带交互和动画
 */
function initScatterChart(): void {
  const container = document.getElementById('scatter-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)

  const scatterData = Array.from({ length: 40 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }))
  let hoverIndex = -1

  function draw(progress: number = 1) {
    const ctx = renderer.getContext()
    if (!ctx) return

    renderer.clear()

    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('数据分布图', width / 2, 22)

    drawGrid(renderer, chartRect, 5, 5)
    drawXAxis(renderer, chartRect, ['0', '25', '50', '75', '100'])
    drawYAxis(renderer, chartRect, 0, 100, 5)

    scatterData.forEach((point, i) => {
      const px = chartRect.x + (point.x / 100) * chartRect.width
      const py = chartRect.y + chartRect.height - (point.y / 100) * chartRect.height * progress
      const isHovered = i === hoverIndex
      const r = isHovered ? 10 : 6

      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? COLORS.pink : COLORS.pink + '99'
      ctx.fill()
      if (isHovered) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  const canvas = renderer.getCanvas()
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      let newHoverIndex = -1
      scatterData.forEach((point, i) => {
        const px = chartRect.x + (point.x / 100) * chartRect.width
        const py = chartRect.y + chartRect.height - (point.y / 100) * chartRect.height
        if (Math.sqrt(Math.pow(mx - px, 2) + Math.pow(my - py, 2)) < 12) newHoverIndex = i
      })

      if (newHoverIndex !== hoverIndex) {
        hoverIndex = newHoverIndex
        draw()
        if (hoverIndex >= 0) {
          const p = scatterData[hoverIndex]!
          showTooltip(e.clientX, e.clientY,
            `<div style="color:${COLORS.pink}">● 数据点 #${hoverIndex + 1}</div>
             <div>X: <b>${p.x.toFixed(1)}</b> | Y: <b>${p.y.toFixed(1)}</b></div>`)
          canvas.style.cursor = 'pointer'
        } else {
          hideTooltip()
          canvas.style.cursor = 'default'
        }
      }
    })
    canvas.addEventListener('mouseleave', () => { hoverIndex = -1; draw(); hideTooltip() })
  }

  animate(800, draw)
}

/**
 * 初始化面积图 - 带交互和动画
 */
function initAreaChart(): void {
  const container = document.getElementById('area-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300
  const padding = { left: 50, right: 20, top: 40, bottom: 40 }
  const chartRect = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom,
  }

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)

  const maxValue = Math.max(...visitData) * 1.2
  let hoverIndex = -1

  function draw(progress: number = 1) {
    const ctx = renderer.getContext()
    if (!ctx) return

    renderer.clear()

    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('网站访问趋势', width / 2, 22)

    drawGrid(renderer, chartRect, visitData.length - 1, 5)
    drawXAxis(renderer, chartRect, months)
    drawYAxis(renderer, chartRect, 0, maxValue, 5)

    const points = visitData.map((v, i) => ({
      x: chartRect.x + (chartRect.width * i) / (visitData.length - 1),
      y: chartRect.y + chartRect.height - (chartRect.height * v * progress) / maxValue,
    }))

    // 面积
    const gradient = ctx.createLinearGradient(0, chartRect.y, 0, chartRect.y + chartRect.height)
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)')
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
    ctx.beginPath()
    ctx.moveTo(points[0]!.x, chartRect.y + chartRect.height)
    points.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1]!.x, chartRect.y + chartRect.height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // 线条
    ctx.beginPath()
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    ctx.strokeStyle = COLORS.cyan
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    // 点
    points.forEach((p, i) => {
      const isHovered = i === hoverIndex
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHovered ? 8 : 5, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? COLORS.cyan : '#fff'
      ctx.fill()
      ctx.strokeStyle = COLORS.cyan
      ctx.lineWidth = 3
      ctx.stroke()
    })
  }

  const canvas = renderer.getCanvas()
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left

      let newHoverIndex = -1
      visitData.forEach((_, i) => {
        const px = chartRect.x + (chartRect.width * i) / (visitData.length - 1)
        if (Math.abs(mx - px) < 20) newHoverIndex = i
      })

      if (newHoverIndex !== hoverIndex) {
        hoverIndex = newHoverIndex
        draw()
        if (hoverIndex >= 0) {
          showTooltip(e.clientX, e.clientY,
            `<div style="font-weight:600">${months[hoverIndex]}</div>
             <div style="color:${COLORS.cyan}">● 访问量: <b>${visitData[hoverIndex]}</b></div>`)
          canvas.style.cursor = 'pointer'
        } else {
          hideTooltip()
          canvas.style.cursor = 'default'
        }
      }
    })
    canvas.addEventListener('mouseleave', () => { hoverIndex = -1; draw(); hideTooltip() })
  }

  animate(800, draw)
}

/**
 * 初始化雷达图
 */
function initRadarChart(): void {
  const container = document.getElementById('radar-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)
  renderer.clear()

  // 标题
  const ctx = renderer.getContext()
  if (ctx) {
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('技能能力评估', width / 2, 22)
  }

  const radarSeries = new RadarSeries(
    {
      type: 'radar',
      indicator: [
        { name: '销售', max: 100 },
        { name: '管理', max: 100 },
        { name: '技术', max: 100 },
        { name: '客服', max: 100 },
        { name: '研发', max: 100 },
        { name: '市场', max: 100 },
      ],
      data: [
        {
          name: '预算分配',
          value: [80, 90, 65, 85, 70, 75],
          areaStyle: { color: COLORS.indigo, opacity: 0.3 },
          lineStyle: { color: COLORS.indigo },
        },
        {
          name: '实际开销',
          value: [70, 65, 95, 75, 85, 60],
          areaStyle: { color: COLORS.success, opacity: 0.3 },
          lineStyle: { color: COLORS.success },
        },
      ],
      center: ['50%', '55%'],
      radius: '60%',
      shape: 'polygon',
      splitNumber: 5,
      axisName: { show: true, color: TEXT_COLOR, fontSize: 11 },
      splitLine: { show: true, lineStyle: { color: GRID_COLOR } },
      splitArea: { show: true, areaStyle: { color: ['rgba(99, 102, 241, 0.05)', 'rgba(99, 102, 241, 0.1)'] } },
    },
    width,
    height
  )
  radarSeries.render(renderer)
  renderer.render()
}

/**
 * 初始化仪表盘
 */
function initGaugeChart(): void {
  const container = document.getElementById('gauge-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)
  renderer.clear()

  const ctx = renderer.getContext()
  if (ctx) {
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('任务完成度', width / 2, 22)
  }

  const gaugeSeries = new GaugeSeries(
    {
      type: 'gauge',
      data: [{ value: 72, name: '完成率' }],
      min: 0,
      max: 100,
      center: ['50%', '60%'],
      radius: '70%',
      startAngle: 200,
      endAngle: -20,
      splitNumber: 10,
      axisLine: {
        show: true,
        lineStyle: {
          width: 20,
          color: [
            [0.3, COLORS.danger],
            [0.7, COLORS.warning],
            [1, COLORS.success],
          ],
        },
      },
      progress: { show: true, width: 20 },
      pointer: { show: true, length: '55%', width: 6, itemStyle: { color: COLORS.indigo } },
      anchor: { show: true, size: 12, itemStyle: { color: '#fff', borderColor: COLORS.indigo, borderWidth: 3 } },
      axisTick: { show: true, distance: 5, length: 8, lineStyle: { color: GRID_COLOR } },
      splitLine: { show: true, distance: 5, length: 15, lineStyle: { color: GRID_COLOR, width: 2 } },
      axisLabel: { show: true, distance: 30, color: TEXT_COLOR, fontSize: 11 },
      detail: {
        show: true,
        offsetCenter: [0, '35%'],
        fontSize: 28,
        color: COLORS.indigo,
        formatter: '{value}%',
      },
      title: { show: true, offsetCenter: [0, '55%'], color: TEXT_COLOR, fontSize: 12 },
    },
    width,
    height
  )
  gaugeSeries.render(renderer)
  renderer.render()
}

/**
 * 初始化漏斗图
 */
function initFunnelChart(): void {
  const container = document.getElementById('funnel-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)
  renderer.clear()

  const ctx = renderer.getContext()
  if (ctx) {
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('转化漏斗分析', width / 2, 22)
  }

  const funnelSeries = new FunnelSeries(
    {
      type: 'funnel',
      data: [
        { value: 100, name: '展示' },
        { value: 80, name: '点击' },
        { value: 60, name: '访问' },
        { value: 40, name: '咨询' },
        { value: 20, name: '成交' },
      ],
      left: '15%',
      right: '15%',
      top: '15%',
      bottom: '10%',
      gap: 4,
      sort: 'descending',
      label: {
        show: true,
        position: 'inside',
        formatter: '{name}',
        color: '#fff',
        fontSize: 12,
      },
      itemStyle: {
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    },
    width,
    height
  )
  funnelSeries.render(renderer)
  renderer.render()
}

/**
 * 初始化环形进度图
 */
function initRingProgressChart(): void {
  const container = document.getElementById('ring-progress-chart')
  if (!container) return

  const width = container.clientWidth || 500
  const height = container.clientHeight || 300

  const renderer = new CanvasRenderer()
  renderer.init(container, width, height)
  renderer.clear()

  const ctx = renderer.getContext()
  if (ctx) {
    ctx.fillStyle = TEXT_LIGHT
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('目标达成率', width / 2, 22)
  }

  const ringProgressSeries = new RingProgressSeries(
    {
      type: 'ringProgress',
      data: [{ value: 0.85, name: '完成进度' }],
      center: ['50%', '55%'],
      radius: ['55%', '70%'],
      startAngle: 90,
      endAngle: -270,
      roundCap: true,
      trackStyle: { color: GRID_COLOR, opacity: 0.3 },
      itemStyle: { color: COLORS.success },
      label: {
        show: true,
        fontSize: 32,
        color: COLORS.success,
      },
      title: {
        show: true,
        text: '本月目标',
        fontSize: 14,
        color: TEXT_COLOR,
        offsetY: 35,
      },
    },
    width,
    height
  )
  ringProgressSeries.render(renderer)
  renderer.render()
}

/**
 * 初始化所有图表
 */
function initAllCharts(): void {
  initLineChart()
  initBarChart()
  initPieChart()
  initDonutChart()
  initScatterChart()
  initAreaChart()
  initRadarChart()
  initGaugeChart()
  initFunnelChart()
  initRingProgressChart()
}

/**
 * 导航标签切换
 */
function setupNavigation(): void {
  const navItems = document.querySelectorAll('.nav-item')
  const cards = document.querySelectorAll('.chart-card')

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view')

      // 更新导航状态
      navItems.forEach((n) => n.classList.remove('active'))
      item.classList.add('active')

      // 显示/隐藏卡片
      cards.forEach((card) => {
        const type = card.getAttribute('data-type')
        if (view === 'all' || type === view) {
          ;(card as HTMLElement).style.display = 'block'
        } else {
          ;(card as HTMLElement).style.display = 'none'
        }
      })

      // 触发resize重绘
      setTimeout(initAllCharts, 100)
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
