/**
 * PieChart 类 - 简洁的饼图 API
 */

export interface PieDataItem {
  name: string
  value: number
  color?: string
}

export interface PieChartOptions {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  data?: PieDataItem[]
  radius?: number | [number, number] // 外半径 或 [内半径, 外半径]
  legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' }
  tooltip?: { show?: boolean }
  label?: { show?: boolean; position?: 'inside' | 'outside' }
  roseType?: boolean | 'radius' | 'area' // 南丁格尔玫瑰图
  /** 动画配置 */
  animation?: boolean | {
    enabled?: boolean
    duration?: number
  }
}

const SERIES_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#3b82f6',
]

function getThemeColors(theme: 'light' | 'dark') {
  const isDark = theme === 'dark'
  return {
    text: isDark ? '#e2e8f0' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#334155',  // 浅色模式使用更深的颜色
    background: isDark ? '#1e293b' : '#ffffff',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(0, 0, 0, 0.06)',
  }
}

function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export class PieChart {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private options: PieChartOptions & { width: number; height: number; theme: 'light' | 'dark' }
  private dpr: number
  private hoverIndex = -1
  private tooltipEl: HTMLDivElement | null = null
  private centerX: number
  private centerY: number
  private outerRadius: number
  private innerRadius: number
  private disposed = false

  // 动画相关
  private animationProgress = 1
  private animationRafId: number | null = null
  private animationStartTime = 0

  constructor(container: string | HTMLElement, options: PieChartOptions = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container
    if (!el || !(el instanceof HTMLElement)) throw new Error('Container not found')
    this.container = el

    const width = options.width || this.container.clientWidth || 400
    const height = options.height || this.container.clientHeight || 280

    this.options = {
      ...options,
      width,
      height,
      theme: options.theme || getCurrentTheme(),
      data: options.data || [],
      legend: options.legend ?? { show: true, position: 'right' },
      tooltip: options.tooltip ?? { show: true },
      label: options.label ?? { show: true, position: 'outside' },
    }

    // 计算圆心和半径
    const legendSpace = this.options.legend?.show !== false ? 100 : 0
    const availableWidth = width - legendSpace
    const size = Math.min(availableWidth, height) * 0.8

    this.centerX = availableWidth / 2
    this.centerY = height / 2

    if (Array.isArray(options.radius)) {
      this.innerRadius = options.radius[0] * size / 2
      this.outerRadius = options.radius[1] * size / 2
    } else {
      this.outerRadius = (options.radius ?? 0.8) * size / 2
      this.innerRadius = 0
    }

    this.dpr = window.devicePixelRatio || 1
    this.canvas = document.createElement('canvas')
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.canvas.style.display = 'block'
    this.container.innerHTML = ''
    this.container.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!
    this.ctx.scale(this.dpr, this.dpr)

    this.bindEvents()

    // 启动入场动画或直接渲染
    if (this.getAnimationEnabled()) {
      this.startEntryAnimation()
    } else {
      this.render()
    }
  }

  private getAnimationEnabled(): boolean {
    const anim = this.options.animation
    if (typeof anim === 'boolean') return anim
    if (typeof anim === 'object') return anim.enabled !== false
    return true
  }

  private getAnimationDuration(): number {
    const anim = this.options.animation
    if (typeof anim === 'object' && anim.duration) return anim.duration
    return 1000
  }

  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4)
  }

  private startEntryAnimation(): void {
    this.animationProgress = 0
    this.animationStartTime = performance.now()

    const animate = (currentTime: number) => {
      if (this.disposed) return

      const elapsed = currentTime - this.animationStartTime
      const duration = this.getAnimationDuration()
      const rawProgress = Math.min(elapsed / duration, 1)
      this.animationProgress = this.easeOutQuart(rawProgress)

      this.render()

      if (rawProgress < 1) {
        this.animationRafId = requestAnimationFrame(animate)
      } else {
        this.animationProgress = 1
        this.animationRafId = null
      }
    }

    this.animationRafId = requestAnimationFrame(animate)
  }

  setData(data: PieDataItem[]): void {
    this.options.data = data
    this.render()
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.options.theme = theme
    this.render()
  }

  refresh(): void {
    this.options.theme = getCurrentTheme()
    this.render()
  }

  dispose(): void {
    this.disposed = true
    if (this.animationRafId !== null) {
      cancelAnimationFrame(this.animationRafId)
    }
    if (this.tooltipEl) this.tooltipEl.remove()
    this.canvas.remove()
  }

  private get colors() {
    return getThemeColors(this.options.theme)
  }

  private getItemColor(index: number, item: PieDataItem): string {
    return item.color ?? SERIES_COLORS[index % SERIES_COLORS.length]!
  }

  private getTotal(): number {
    return (this.options.data || []).reduce((sum, d) => sum + d.value, 0)
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (this.options.width / rect.width) - this.centerX
      const y = (e.clientY - rect.top) * (this.options.height / rect.height) - this.centerY

      const dist = Math.sqrt(x * x + y * y)
      let angle = Math.atan2(y, x)
      if (angle < -Math.PI / 2) angle += Math.PI * 2

      const data = this.options.data || []
      const total = this.getTotal()
      let startAngle = -Math.PI / 2
      let found = -1

      if (dist >= this.innerRadius && dist <= this.outerRadius) {
        for (let i = 0; i < data.length; i++) {
          const sliceAngle = (data[i]!.value / total) * Math.PI * 2
          const endAngle = startAngle + sliceAngle
          if (angle >= startAngle && angle < endAngle) {
            found = i
            break
          }
          startAngle = endAngle
        }
      }

      if (found !== this.hoverIndex) {
        this.hoverIndex = found
        this.render()
      }

      if (found >= 0 && this.options.tooltip?.show !== false) {
        const item = data[found]!
        const percent = ((item.value / total) * 100).toFixed(1)
        this.showTooltip(e.clientX, e.clientY, item.name, item.value, percent)
      } else {
        this.hideTooltip()
      }
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1
      this.render()
      this.hideTooltip()
    })
  }

  private showTooltip(x: number, y: number, name: string, value: number, percent: string): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }
    const colors = this.colors
    this.tooltipEl.style.cssText = `position:fixed;z-index:9999;padding:12px 16px;border-radius:8px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,0.2);pointer-events:none;font-family:Inter,sans-serif;background:${colors.tooltipBg};color:${colors.text};border:1px solid ${colors.grid};`
    this.tooltipEl.innerHTML = `<div style="font-weight:600">${name}</div><div style="margin-top:4px">${value} (${percent}%)</div>`
    this.tooltipEl.classList.add('visible')
    this.tooltipEl.style.left = `${Math.min(x + 12, window.innerWidth - 150)}px`
    this.tooltipEl.style.top = `${Math.min(y + 12, window.innerHeight - 80)}px`
  }

  private hideTooltip(): void {
    if (this.tooltipEl) this.tooltipEl.classList.remove('visible')
  }

  render(): void {
    const { ctx, options } = this
    const { width, height } = options
    const colors = this.colors
    const data = options.data || []
    const total = this.getTotal()

    ctx.clearRect(0, 0, width, height)
    if (!data.length || total === 0) return

    // 绘制扇形（应用动画进度）
    let startAngle = -Math.PI / 2
    data.forEach((item, i) => {
      const fullSliceAngle = (item.value / total) * Math.PI * 2
      const sliceAngle = fullSliceAngle * this.animationProgress
      const endAngle = startAngle + sliceAngle
      const isHover = i === this.hoverIndex
      const color = this.getItemColor(i, item)

      // 悬停时扇形外移
      let cx = this.centerX, cy = this.centerY
      if (isHover) {
        const midAngle = startAngle + sliceAngle / 2
        cx += Math.cos(midAngle) * 8
        cy += Math.sin(midAngle) * 8
      }

      // 南丁格尔玫瑰图
      let radius = this.outerRadius
      if (options.roseType) {
        const maxVal = Math.max(...data.map(d => d.value))
        radius = this.innerRadius + (this.outerRadius - this.innerRadius) * (item.value / maxVal)
      }

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      if (this.innerRadius > 0) {
        ctx.arc(cx, cy, this.innerRadius, endAngle, startAngle, true)
      }
      ctx.closePath()
      ctx.fillStyle = isHover ? this.lightenColor(color) : color
      ctx.fill()

      // 标签
      if (options.label?.show !== false && options.label?.position !== 'inside') {
        const midAngle = startAngle + sliceAngle / 2
        const labelRadius = radius + 20
        const lx = this.centerX + Math.cos(midAngle) * labelRadius
        const ly = this.centerY + Math.sin(midAngle) * labelRadius

        ctx.fillStyle = colors.text
        ctx.font = '11px Inter, sans-serif'
        ctx.textAlign = midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5 ? 'right' : 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${item.name}`, lx, ly)
      }

      startAngle = endAngle
    })

    // 图例
    if (options.legend?.show !== false) {
      const legendX = width - 90
      let legendY = 40
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      data.forEach((item, i) => {
        const color = this.getItemColor(i, item)
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(legendX, legendY, 5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = colors.text
        ctx.fillText(item.name, legendX + 12, legendY)
        legendY += 24
      })
    }
  }

  private lightenColor(hex: string): string {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }
}
