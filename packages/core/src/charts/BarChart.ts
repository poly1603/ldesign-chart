/**
 * BarChart 类 - 继承 BaseChart，使用 IRenderer 接口
 * 支持 Canvas 和 SVG 双模式渲染
 */

import { BaseChart } from './BaseChart'
import type { BaseChartOptions } from './BaseChart'

export interface BarSeriesData {
  name?: string
  data: (number | null)[]
  color?: string
  stack?: string
  barWidth?: number
  borderRadius?: number
}

export interface BarChartOptions extends BaseChartOptions {
  xAxis?: { data?: string[] }
  yAxis?: { min?: number | 'auto'; max?: number | 'auto' }
  series?: BarSeriesData[]
  legend?: { show?: boolean }
  tooltip?: { show?: boolean }
  grid?: { show?: boolean }
  horizontal?: boolean
}

function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export class BarChart extends BaseChart<BarChartOptions> {
  private hoverIndex = -1
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null
  private barOptions: BarChartOptions

  constructor(container: string | HTMLElement, options: BarChartOptions = {}) {
    // 设置默认值
    const defaultOptions: BarChartOptions = {
      ...options,
      theme: options.theme || getCurrentTheme(),
      xAxis: options.xAxis || { data: [] },
      series: options.series || [],
      legend: options.legend ?? { show: true },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
      horizontal: options.horizontal ?? false,
    }

    super(container, defaultOptions)
    this.barOptions = defaultOptions
    this.enabledSeries = new Set(this.barOptions.series?.map(s => s.name || '') || [])

    this.bindEvents()

    // 启动入场动画或直接渲染
    const config = this.getAnimationConfig()
    if (config.enabled) {
      this.startAnimation()
    } else {
      this.render()
    }
  }

  protected getPadding() {
    // 使用 this.options 而不是 this.barOptions，因为 getPadding() 在 super() 中被调用时 barOptions 还未设置
    const padding = (this.options as BarChartOptions)?.padding
    return {
      top: padding?.top ?? 40,
      right: padding?.right ?? 20,
      bottom: padding?.bottom ?? 40,
      left: padding?.left ?? 50,
    }
  }

  protected paint(): void {
    const { renderer, chartRect, barOptions: options } = this
    const colors = this.colors

    if (!options.series?.length) return

    const { min, max } = this.getYRange()
    const labels = options.xAxis?.data || []
    const enabledSeries = (options.series || []).filter(s => this.enabledSeries.has(s.name || ''))
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)
    const barWidth = enabledSeries.length > 0 ? (barGroupWidth * 0.6) / enabledSeries.length : barGroupWidth * 0.6
    // 计算柱子组的总宽度和起始偏移，使柱子组居中于分段
    const totalBarsWidth = barWidth * enabledSeries.length
    const startOffset = (barGroupWidth - totalBarsWidth) / 2

    // 绘制背景
    this.drawBackground()

    // 绘制网格
    if (options.grid?.show !== false) {
      this.drawGrid(5)
    }

    // 绘制 X 轴标签
    labels.forEach((label, i) => {
      const x = chartRect.x + barGroupWidth * i + barGroupWidth / 2
      renderer.drawText(
        { x, y: chartRect.y + chartRect.height + 20, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
      )
    })

    // 绘制 Y 轴标签
    this.drawYAxisLabels(min, max, 5)

    // 绘制图例
    if (options.legend?.show !== false) {
      this.drawLegend()
    }

    // 计算零线位置（用于支持负值）
    const zeroY = chartRect.y + chartRect.height - ((0 - min) / (max - min)) * chartRect.height

    // 绘制零线（如果有负值）
    if (min < 0) {
      renderer.drawLine(
        [{ x: chartRect.x, y: zeroY }, { x: chartRect.x + chartRect.width, y: zeroY }],
        { stroke: colors.grid, lineWidth: 1 }
      )
    }

    // 绘制柱子
    enabledSeries.forEach((s, si) => {
      const color = this.getSeriesColor((options.series || []).indexOf(s), s.color)
      const radius = s.borderRadius ?? 4

      s.data.forEach((v, i) => {
        if (v === null) return
        // 柱子居中于标签位置
        const x = chartRect.x + barGroupWidth * i + startOffset + barWidth * si
        const isHover = i === this.hoverIndex

        // 计算柱子高度和位置（支持正负值）
        const valueY = chartRect.y + chartRect.height - ((v - min) / (max - min)) * chartRect.height
        let barY: number
        let barHeight: number

        if (v >= 0) {
          // 正值：从零线向上
          barHeight = Math.abs(zeroY - valueY) * this.animationProgress
          barY = zeroY - barHeight
        } else {
          // 负值：从零线向下
          barHeight = Math.abs(valueY - zeroY) * this.animationProgress
          barY = zeroY
        }

        renderer.drawRect(
          { x, y: barY, width: barWidth, height: Math.max(barHeight, 1) },
          {
            fill: isHover ? this.lightenColor(color) : color,
            radius
          }
        )

        // 悬停时显示数值
        if (isHover) {
          const labelY = v >= 0 ? barY - 8 : barY + barHeight + 16
          renderer.drawText(
            { x: x + barWidth / 2, y: labelY, text: String(v) },
            { fill: colors.text, fontSize: 11, fontWeight: 'bold', textAlign: 'center' }
          )
        }
      })
    })
  }

  private drawLegend(): void {
    const { renderer, barOptions: options } = this
    const colors = this.colors
    const series = options.series || []
    const dotSize = 8

    // 计算图例总宽度
    let totalWidth = 0
    series.forEach((s, i) => {
      const name = s.name || `S${i}`
      const textWidth = renderer.measureText(name, 12)
      totalWidth += textWidth + dotSize + 8 + (i < series.length - 1 ? 16 : 0)
    })

    let legendX = (this.width - totalWidth) / 2
    const legendY = 15

    series.forEach((s, i) => {
      const color = this.getSeriesColor(i, s.color)
      const enabled = this.enabledSeries.has(s.name || '')
      const name = s.name || `S${i}`

      // 绘制图例方块
      renderer.drawRect(
        { x: legendX, y: legendY - dotSize / 2, width: dotSize, height: dotSize },
        { fill: enabled ? color : '#64748b', opacity: enabled ? 1 : 0.4 }
      )

      // 绘制图例文本
      renderer.drawText(
        { x: legendX + dotSize + 6, y: legendY, text: name },
        { fill: enabled ? colors.text : colors.textSecondary, fontSize: 12, textBaseline: 'middle', textAlign: 'left' }
      )

      const textWidth = renderer.measureText(name, 12)
      legendX += textWidth + dotSize + 8 + 16
    })
  }

  private getYRange(): { min: number; max: number } {
    const series = this.barOptions.series || []
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
    const el = this.renderer.getElement()
    el.addEventListener('mousemove', this.onMouseMove.bind(this) as EventListener)
    el.addEventListener('mouseleave', this.onMouseLeave.bind(this) as EventListener)
    el.addEventListener('click', this.onClick.bind(this) as EventListener)
  }

  private onMouseMove(e: MouseEvent): void {
    const el = this.renderer.getElement()
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.width / rect.width)
    const labels = this.barOptions.xAxis?.data || []
    const barGroupWidth = this.chartRect.width / Math.max(labels.length, 1)
    const idx = Math.floor((x - this.chartRect.x) / barGroupWidth)

    if (idx >= 0 && idx < labels.length && x >= this.chartRect.x && x <= this.chartRect.x + this.chartRect.width) {
      if (idx !== this.hoverIndex) {
        this.hoverIndex = idx
        this.render()
      }
      if (this.barOptions.tooltip?.show !== false) {
        this.showTooltip(e.clientX, e.clientY, idx, labels[idx] || '')
      }
    } else {
      if (this.hoverIndex !== -1) {
        this.hoverIndex = -1
        this.render()
      }
      this.hideTooltip()
    }
  }

  private onMouseLeave(): void {
    this.hoverIndex = -1
    this.render()
    this.hideTooltip()
  }

  private onClick(e: MouseEvent): void {
    const el = this.renderer.getElement()
    const rect = el.getBoundingClientRect()
    const y = (e.clientY - rect.top) * (this.height / rect.height)

    if (y < 30 && this.barOptions.legend?.show !== false) {
      const x = (e.clientX - rect.left) * (this.width / rect.width)
      const series = this.barOptions.series || []

      let totalW = series.reduce((w, s, i) => w + this.renderer.measureText(s.name || `S${i}`, 12) + 24 + 16, -16)
      let sx = (this.width - totalW) / 2

      for (let i = 0; i < series.length; i++) {
        const name = series[i]!.name || `S${i}`
        const itemW = this.renderer.measureText(name, 12) + 24
        if (x >= sx && x <= sx + itemW) {
          if (this.enabledSeries.has(name)) this.enabledSeries.delete(name)
          else this.enabledSeries.add(name)
          this.render()
          return
        }
        sx += itemW + 16
      }
    }
  }

  private showTooltip(x: number, y: number, idx: number, label: string): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }
    const colors = this.colors
    this.tooltipEl.style.cssText = `position:fixed;z-index:9999;padding:12px 16px;border-radius:8px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,0.2);pointer-events:none;font-family:Inter,sans-serif;background:${colors.tooltipBg};color:${colors.text};border:1px solid ${colors.grid};`

    const items = (this.barOptions.series || [])
      .filter(s => this.enabledSeries.has(s.name || ''))
      .map((s, i) => `<div style="display:flex;gap:8px;margin-top:4px"><span style="width:8px;height:8px;border-radius:2px;background:${this.getSeriesColor(i, s.color)}"></span>${s.name || ''}<span style="margin-left:auto;font-weight:600">${s.data[idx] ?? '-'}</span></div>`)
      .join('')
    this.tooltipEl.innerHTML = `<div style="font-weight:600;margin-bottom:4px">${label}</div>${items}`
    this.tooltipEl.classList.add('visible')
    this.tooltipEl.style.left = `${Math.min(x + 12, window.innerWidth - 180)}px`
    this.tooltipEl.style.top = `${Math.min(y + 12, window.innerHeight - 150)}px`
  }

  private hideTooltip(): void {
    if (this.tooltipEl) this.tooltipEl.classList.remove('visible')
  }

  private lightenColor(hex: string): string {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // ============== 公共方法 ==============

  setData(series: BarSeriesData[]): void {
    this.barOptions.series = series
    this.enabledSeries = new Set(series.map(s => s.name || ''))
    this.render()
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.barOptions.theme = theme
      ; (this.options as any).theme = theme
    this.render()
  }

  refresh(): void {
    this.barOptions.theme = getCurrentTheme()
      ; (this.options as any).theme = this.barOptions.theme
    this.render()
  }

  dispose(): void {
    super.dispose()
    if (this.tooltipEl) this.tooltipEl.remove()
  }
}
