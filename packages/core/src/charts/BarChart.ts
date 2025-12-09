/**
 * BarChart 类 - 简洁的柱状图 API
 */

export interface BarSeriesData {
  name?: string
  data: (number | null)[]
  color?: string
  stack?: string
  barWidth?: number
  borderRadius?: number
}

export interface BarChartOptions {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  padding?: { top?: number; right?: number; bottom?: number; left?: number }
  xAxis?: { data?: string[] }
  yAxis?: { min?: number | 'auto'; max?: number | 'auto' }
  series?: BarSeriesData[]
  legend?: { show?: boolean }
  tooltip?: { show?: boolean }
  grid?: { show?: boolean }
  horizontal?: boolean
  /** 动画配置 */
  animation?: boolean | {
    enabled?: boolean
    duration?: number
    easing?: string
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

export class BarChart {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private options: BarChartOptions & { width: number; height: number; theme: 'light' | 'dark' }
  private chartRect: { x: number; y: number; width: number; height: number }
  private dpr: number
  private hoverIndex = -1
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null
  private disposed = false

  // 动画相关
  private animationProgress = 1
  private animationRafId: number | null = null
  private animationStartTime = 0

  constructor(container: string | HTMLElement, options: BarChartOptions = {}) {
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
      xAxis: options.xAxis || { data: [] },
      series: options.series || [],
      legend: options.legend ?? { show: true },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
      horizontal: options.horizontal ?? false,
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

  setData(series: BarSeriesData[]): void {
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

  private getSeriesColor(index: number, series: BarSeriesData): string {
    return series.color ?? SERIES_COLORS[index % SERIES_COLORS.length]!
  }

  private getYRange(): { min: number; max: number } {
    const series = this.options.series || []
    const data = series
      .filter(s => this.enabledSeries.has(s.name || ''))
      .flatMap(s => s.data.filter((v): v is number => v !== null))
    if (!data.length) return { min: 0, max: 100 }
    let min = Math.min(...data), max = Math.max(...data)
    const range = max - min || 1
    max += range * 0.1
    if (min > 0) min = 0
    else min -= range * 0.1
    return { min, max }
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (this.options.width / rect.width)
      const labels = this.options.xAxis?.data || []
      const barGroupWidth = this.chartRect.width / labels.length
      const idx = Math.floor((x - this.chartRect.x) / barGroupWidth)

      if (idx >= 0 && idx < labels.length && x >= this.chartRect.x && x <= this.chartRect.x + this.chartRect.width) {
        if (idx !== this.hoverIndex) { this.hoverIndex = idx; this.render() }
        this.showTooltip(e.clientX, e.clientY, idx, labels[idx] || '')
      } else {
        if (this.hoverIndex !== -1) { this.hoverIndex = -1; this.render() }
        this.hideTooltip()
      }
    })
    this.canvas.addEventListener('mouseleave', () => { this.hoverIndex = -1; this.render(); this.hideTooltip() })
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const y = (e.clientY - rect.top) * (this.options.height / rect.height)
      if (y < 30 && this.options.legend?.show !== false) {
        const x = (e.clientX - rect.left) * (this.options.width / rect.width)
        const series = this.options.series || []
        this.ctx.font = '12px Inter, sans-serif'
        let totalW = series.reduce((w, s, i) => w + this.ctx.measureText(s.name || `S${i}`).width + 24 + 16, -16)
        let sx = (this.options.width - totalW) / 2
        for (let i = 0; i < series.length; i++) {
          const name = series[i]!.name || `S${i}`
          const itemW = this.ctx.measureText(name).width + 24
          if (x >= sx && x <= sx + itemW) {
            if (this.enabledSeries.has(name)) this.enabledSeries.delete(name)
            else this.enabledSeries.add(name)
            this.render()
            return
          }
          sx += itemW + 16
        }
      }
    })
  }

  private showTooltip(x: number, y: number, idx: number, label: string): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }
    const colors = this.colors
    this.tooltipEl.style.cssText = `position:fixed;z-index:9999;padding:12px 16px;border-radius:8px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,0.2);pointer-events:none;font-family:Inter,sans-serif;background:${colors.tooltipBg};color:${colors.text};border:1px solid ${colors.grid};`

    const items = (this.options.series || [])
      .filter(s => this.enabledSeries.has(s.name || ''))
      .map((s, i) => `<div style="display:flex;gap:8px;margin-top:4px"><span style="width:8px;height:8px;border-radius:2px;background:${this.getSeriesColor(i, s)}"></span>${s.name || ''}<span style="margin-left:auto;font-weight:600">${s.data[idx] ?? '-'}</span></div>`)
      .join('')
    this.tooltipEl.innerHTML = `<div style="font-weight:600;margin-bottom:4px">${label}</div>${items}`
    this.tooltipEl.classList.add('visible')
    this.tooltipEl.style.left = `${Math.min(x + 12, window.innerWidth - 180)}px`
    this.tooltipEl.style.top = `${Math.min(y + 12, window.innerHeight - 150)}px`
  }

  private hideTooltip(): void {
    if (this.tooltipEl) this.tooltipEl.classList.remove('visible')
  }

  render(): void {
    const { ctx, chartRect, options } = this
    const { width, height } = options
    const colors = this.colors

    ctx.clearRect(0, 0, width, height)
    if (!options.series?.length) return

    const { min, max } = this.getYRange()
    const labels = options.xAxis?.data || []
    const enabledSeries = (options.series || []).filter(s => this.enabledSeries.has(s.name || ''))
    const barGroupWidth = chartRect.width / labels.length
    const barWidth = enabledSeries.length > 0 ? (barGroupWidth * 0.6) / enabledSeries.length : barGroupWidth * 0.6
    const gap = barGroupWidth * 0.2

    // 图例
    if (options.legend?.show !== false) {
      ctx.font = '12px Inter, sans-serif'
      const allSeries = options.series || []
      let totalWidth = allSeries.reduce((w, s, i) => w + ctx.measureText(s.name || `S${i}`).width + 24 + 16, -16)
      let x = (width - totalWidth) / 2
      allSeries.forEach((s, i) => {
        const name = s.name || `S${i}`
        const enabled = this.enabledSeries.has(name)
        ctx.fillStyle = enabled ? this.getSeriesColor(i, s) : '#64748b'
        ctx.globalAlpha = enabled ? 1 : 0.4
        ctx.fillRect(x, 11, 8, 8)
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
      }
      ctx.globalAlpha = 1
    }

    // 坐标轴
    ctx.fillStyle = colors.textSecondary
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    labels.forEach((l, i) => ctx.fillText(l, chartRect.x + barGroupWidth * i + barGroupWidth / 2, chartRect.y + chartRect.height + 8))
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= 5; i++) {
      const v = min + (max - min) * (i / 5)
      const y = chartRect.y + chartRect.height - (chartRect.height / 5) * i
      ctx.fillText(v >= 1000 ? (v / 1000).toFixed(1) + 'K' : Math.round(v).toString(), chartRect.x - 8, y)
    }

    // 绑制柱子
    enabledSeries.forEach((s, si) => {
      const color = this.getSeriesColor((options.series || []).indexOf(s), s)
      const radius = s.borderRadius ?? 4

      s.data.forEach((v, i) => {
        if (v === null) return
        const x = chartRect.x + gap / 2 + barGroupWidth * i + barWidth * si
        const fullBarHeight = ((v - min) / (max - min)) * chartRect.height
        const barHeight = fullBarHeight * this.animationProgress
        const y = chartRect.y + chartRect.height - barHeight
        const isHover = i === this.hoverIndex

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0])
        ctx.fillStyle = isHover ? this.lightenColor(color) : color
        ctx.fill()

        if (isHover) {
          ctx.fillStyle = colors.text
          ctx.font = 'bold 11px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(String(v), x + barWidth / 2, y - 8)
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
