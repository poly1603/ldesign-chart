/**
 * ScatterChart 类 - 简洁的散点图 API
 */

export interface ScatterDataPoint {
  x: number
  y: number
  value?: number // 用于气泡图大小
  name?: string
}

export interface ScatterSeriesData {
  name?: string
  data: ScatterDataPoint[] | [number, number][]
  color?: string
  symbolSize?: number | ((value: ScatterDataPoint) => number)
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond'
}

export interface ScatterChartOptions {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  padding?: { top?: number; right?: number; bottom?: number; left?: number }
  xAxis?: { name?: string; min?: number | 'auto'; max?: number | 'auto' }
  yAxis?: { name?: string; min?: number | 'auto'; max?: number | 'auto' }
  series?: ScatterSeriesData[]
  legend?: { show?: boolean }
  tooltip?: { show?: boolean }
  grid?: { show?: boolean }
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
    grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(0, 0, 0, 0.06)',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
  }
}

function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export class ScatterChart {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private options: ScatterChartOptions & { width: number; height: number; theme: 'light' | 'dark' }
  private chartRect: { x: number; y: number; width: number; height: number }
  private dpr: number
  private hoverPoint: { seriesIndex: number; pointIndex: number } | null = null
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null
  private disposed = false

  // 动画相关
  private animationProgress = 1
  private animationRafId: number | null = null
  private animationStartTime = 0

  constructor(container: string | HTMLElement, options: ScatterChartOptions = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container
    if (!el || !(el instanceof HTMLElement)) throw new Error('Container not found')
    this.container = el

    const padding = {
      top: options.padding?.top ?? 40,
      right: options.padding?.right ?? 20,
      bottom: options.padding?.bottom ?? 40,
      left: options.padding?.left ?? 50,
    }

    const width = options.width || this.container.clientWidth || 400
    const height = options.height || this.container.clientHeight || 280

    this.options = {
      ...options,
      width,
      height,
      theme: options.theme || getCurrentTheme(),
      padding,
      series: options.series || [],
      legend: options.legend ?? { show: true },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
    }

    this.enabledSeries = new Set(this.options.series?.map(s => s.name || '') || [])

    this.chartRect = {
      x: padding.left,
      y: padding.top,
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom,
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
    return 800
  }

  private easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  }

  private startEntryAnimation(): void {
    this.animationProgress = 0
    this.animationStartTime = performance.now()

    const animate = (currentTime: number) => {
      if (this.disposed) return

      const elapsed = currentTime - this.animationStartTime
      const duration = this.getAnimationDuration()
      const rawProgress = Math.min(elapsed / duration, 1)
      this.animationProgress = this.easeOutElastic(rawProgress)

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

  setData(series: ScatterSeriesData[]): void {
    this.options.series = series
    this.enabledSeries = new Set(series.map(s => s.name || ''))
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

  private getSeriesColor(index: number, series: ScatterSeriesData): string {
    return series.color ?? SERIES_COLORS[index % SERIES_COLORS.length]!
  }

  private normalizeData(data: ScatterDataPoint[] | [number, number][]): ScatterDataPoint[] {
    return data.map(d => Array.isArray(d) ? { x: d[0], y: d[1] } : d)
  }

  private getRange(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    const series = this.options.series || []
    const allPoints = series
      .filter(s => this.enabledSeries.has(s.name || ''))
      .flatMap(s => this.normalizeData(s.data))

    if (!allPoints.length) return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }

    let xMin = Math.min(...allPoints.map(p => p.x))
    let xMax = Math.max(...allPoints.map(p => p.x))
    let yMin = Math.min(...allPoints.map(p => p.y))
    let yMax = Math.max(...allPoints.map(p => p.y))

    const xRange = xMax - xMin || 1
    const yRange = yMax - yMin || 1
    xMin -= xRange * 0.1
    xMax += xRange * 0.1
    yMin -= yRange * 0.1
    yMax += yRange * 0.1

    return { xMin, xMax, yMin, yMax }
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (this.options.width / rect.width)
      const my = (e.clientY - rect.top) * (this.options.height / rect.height)

      const { xMin, xMax, yMin, yMax } = this.getRange()
      const series = this.options.series || []
      let found: { seriesIndex: number; pointIndex: number } | null = null

      for (let si = 0; si < series.length; si++) {
        const s = series[si]!
        if (!this.enabledSeries.has(s.name || '')) continue

        const points = this.normalizeData(s.data)
        for (let pi = 0; pi < points.length; pi++) {
          const p = points[pi]!
          const px = this.chartRect.x + ((p.x - xMin) / (xMax - xMin)) * this.chartRect.width
          const py = this.chartRect.y + this.chartRect.height - ((p.y - yMin) / (yMax - yMin)) * this.chartRect.height
          const size = typeof s.symbolSize === 'function' ? s.symbolSize(p) : (s.symbolSize ?? 8)

          if (Math.abs(mx - px) < size && Math.abs(my - py) < size) {
            found = { seriesIndex: si, pointIndex: pi }
            break
          }
        }
        if (found) break
      }

      if (found?.seriesIndex !== this.hoverPoint?.seriesIndex || found?.pointIndex !== this.hoverPoint?.pointIndex) {
        this.hoverPoint = found
        this.render()
      }

      if (found && this.options.tooltip?.show !== false) {
        const s = series[found.seriesIndex]!
        const p = this.normalizeData(s.data)[found.pointIndex]!
        this.showTooltip(e.clientX, e.clientY, s.name || '', p)
      } else {
        this.hideTooltip()
      }
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverPoint = null
      this.render()
      this.hideTooltip()
    })
  }

  private showTooltip(x: number, y: number, name: string, point: ScatterDataPoint): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }
    const colors = this.colors
    this.tooltipEl.style.cssText = `position:fixed;z-index:9999;padding:12px 16px;border-radius:8px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,0.2);pointer-events:none;font-family:Inter,sans-serif;background:${colors.tooltipBg};color:${colors.text};border:1px solid ${colors.grid};`
    this.tooltipEl.innerHTML = `<div style="font-weight:600">${name}</div><div style="margin-top:4px">x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}${point.value !== undefined ? `, value: ${point.value}` : ''}</div>`
    this.tooltipEl.classList.add('visible')
    this.tooltipEl.style.left = `${Math.min(x + 12, window.innerWidth - 180)}px`
    this.tooltipEl.style.top = `${Math.min(y + 12, window.innerHeight - 80)}px`
  }

  private hideTooltip(): void {
    if (this.tooltipEl) this.tooltipEl.classList.remove('visible')
  }

  render(): void {
    const { ctx, chartRect, options } = this
    const { width, height } = options
    const colors = this.colors
    const series = options.series || []
    const { xMin, xMax, yMin, yMax } = this.getRange()

    ctx.clearRect(0, 0, width, height)
    if (!series.length) return

    // 图例
    if (options.legend?.show !== false) {
      ctx.font = '12px Inter, sans-serif'
      let totalWidth = series.reduce((w, s, i) => w + ctx.measureText(s.name || `S${i}`).width + 24 + 16, -16)
      let x = (width - totalWidth) / 2
      series.forEach((s, i) => {
        const name = s.name || `S${i}`
        const enabled = this.enabledSeries.has(name)
        ctx.beginPath()
        ctx.arc(x + 4, 15, 4, 0, Math.PI * 2)
        ctx.fillStyle = enabled ? this.getSeriesColor(i, s) : '#64748b'
        ctx.globalAlpha = enabled ? 1 : 0.4
        ctx.fill()
        ctx.fillStyle = colors.text
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(name, x + 14, 15)
        ctx.globalAlpha = 1
        x += ctx.measureText(name).width + 24 + 16
      })
    }

    // 网格
    if (options.grid?.show !== false) {
      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = chartRect.y + (chartRect.height / 5) * i
        ctx.beginPath(); ctx.moveTo(chartRect.x, y); ctx.lineTo(chartRect.x + chartRect.width, y)
        ctx.globalAlpha = 0.5; ctx.stroke()

        const x = chartRect.x + (chartRect.width / 5) * i
        ctx.beginPath(); ctx.moveTo(x, chartRect.y); ctx.lineTo(x, chartRect.y + chartRect.height)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    // 坐标轴
    ctx.fillStyle = colors.textSecondary
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let i = 0; i <= 5; i++) {
      const v = xMin + (xMax - xMin) * (i / 5)
      ctx.fillText(v.toFixed(0), chartRect.x + (chartRect.width / 5) * i, chartRect.y + chartRect.height + 8)
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= 5; i++) {
      const v = yMin + (yMax - yMin) * (i / 5)
      ctx.fillText(v.toFixed(0), chartRect.x - 8, chartRect.y + chartRect.height - (chartRect.height / 5) * i)
    }

    // 绑制点
    series.forEach((s, si) => {
      if (!this.enabledSeries.has(s.name || '')) return
      const color = this.getSeriesColor(si, s)
      const points = this.normalizeData(s.data)

      points.forEach((p, pi) => {
        const px = chartRect.x + ((p.x - xMin) / (xMax - xMin)) * chartRect.width
        const py = chartRect.y + chartRect.height - ((p.y - yMin) / (yMax - yMin)) * chartRect.height
        const isHover = this.hoverPoint?.seriesIndex === si && this.hoverPoint?.pointIndex === pi
        const baseSize = typeof s.symbolSize === 'function' ? s.symbolSize(p) : (s.symbolSize ?? 8)
        const animatedSize = baseSize * this.animationProgress
        const size = isHover ? animatedSize + 3 : animatedSize

        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fillStyle = isHover ? this.lightenColor(color) : color
        ctx.globalAlpha = 0.7
        ctx.fill()
        ctx.globalAlpha = 1

        if (isHover) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    })
  }

  private lightenColor(hex: string): string {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }
}
