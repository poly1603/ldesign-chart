/**
 * ScatterChart 类 - 继承 BaseChart，使用 IRenderer 接口
 * 支持 Canvas 和 SVG 双模式渲染
 */

import { BaseChart } from './BaseChart'
import type { BaseChartOptions } from './BaseChart'

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

export interface ScatterChartOptions extends BaseChartOptions {
  xAxis?: { name?: string; min?: number | 'auto'; max?: number | 'auto' }
  yAxis?: { name?: string; min?: number | 'auto'; max?: number | 'auto' }
  series?: ScatterSeriesData[]
  legend?: { show?: boolean }
  tooltip?: { show?: boolean }
  grid?: { show?: boolean }
}

function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export class ScatterChart extends BaseChart<ScatterChartOptions> {
  private hoverPoint: { seriesIndex: number; pointIndex: number } | null = null
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null
  private scatterOptions: ScatterChartOptions

  constructor(container: string | HTMLElement, options: ScatterChartOptions = {}) {
    const defaultOptions: ScatterChartOptions = {
      ...options,
      theme: options.theme || getCurrentTheme(),
      series: options.series || [],
      legend: options.legend ?? { show: true },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
    }

    super(container, defaultOptions)
    this.scatterOptions = defaultOptions
    this.enabledSeries = new Set(this.scatterOptions.series?.map(s => s.name || '') || [])

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
    // 使用 this.options 而不是 this.scatterOptions，因为 getPadding() 在 super() 中被调用时 scatterOptions 还未设置
    const padding = (this.options as ScatterChartOptions)?.padding
    return {
      top: padding?.top ?? 40,
      right: padding?.right ?? 20,
      bottom: padding?.bottom ?? 40,
      left: padding?.left ?? 50,
    }
  }

  protected paint(): void {
    const { renderer, chartRect, scatterOptions: options } = this
    const colors = this.colors
    const series = options.series || []
    const { xMin, xMax, yMin, yMax } = this.getRange()

    if (!series.length) return

    // 绘制背景
    this.drawBackground()

    // 绘制网格
    if (options.grid?.show !== false) {
      this.drawScatterGrid(5)
    }

    // 绘制 X 轴标签
    for (let i = 0; i <= 5; i++) {
      const v = xMin + (xMax - xMin) * (i / 5)
      const x = chartRect.x + (chartRect.width / 5) * i
      renderer.drawText(
        { x, y: chartRect.y + chartRect.height + 20, text: v.toFixed(0) },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
      )
    }

    // 绘制 Y 轴标签
    for (let i = 0; i <= 5; i++) {
      const v = yMin + (yMax - yMin) * (i / 5)
      const y = chartRect.y + chartRect.height - (chartRect.height / 5) * i
      renderer.drawText(
        { x: chartRect.x - 8, y, text: v.toFixed(0) },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'right', textBaseline: 'middle' }
      )
    }

    // 绘制图例
    if (options.legend?.show !== false) {
      this.drawLegend()
    }

    // 绘制散点
    series.forEach((s, si) => {
      if (!this.enabledSeries.has(s.name || '')) return
      const color = this.getSeriesColor(si, s.color)
      const points = this.normalizeData(s.data)

      points.forEach((p, pi) => {
        const px = chartRect.x + ((p.x - xMin) / (xMax - xMin)) * chartRect.width
        const py = chartRect.y + chartRect.height - ((p.y - yMin) / (yMax - yMin)) * chartRect.height
        const isHover = this.hoverPoint?.seriesIndex === si && this.hoverPoint?.pointIndex === pi
        const baseSize = typeof s.symbolSize === 'function' ? s.symbolSize(p) : (s.symbolSize ?? 8)
        const animatedSize = baseSize * this.animationProgress
        // 确保半径不为负数
        const size = Math.max(0, isHover ? animatedSize + 3 : animatedSize)

        renderer.drawCircle(
          { x: px, y: py, radius: size },
          {
            fill: isHover ? this.lightenColor(color) : color,
            opacity: 0.7,
            stroke: isHover ? '#fff' : undefined,
            lineWidth: isHover ? 2 : undefined
          }
        )
      })
    })
  }

  private drawScatterGrid(ticks: number): void {
    const { renderer, chartRect, colors } = this

    for (let i = 0; i <= ticks; i++) {
      // 水平线
      const y = chartRect.y + (i / ticks) * chartRect.height
      renderer.drawLine(
        [{ x: chartRect.x, y }, { x: chartRect.x + chartRect.width, y }],
        { stroke: colors.grid, lineWidth: 1 }
      )

      // 垂直线
      const x = chartRect.x + (i / ticks) * chartRect.width
      renderer.drawLine(
        [{ x, y: chartRect.y }, { x, y: chartRect.y + chartRect.height }],
        { stroke: colors.grid, lineWidth: 1 }
      )
    }
  }

  private drawLegend(): void {
    const { renderer, scatterOptions: options } = this
    const colors = this.colors
    const series = options.series || []

    // 计算图例总宽度
    let totalWidth = 0
    series.forEach((s, i) => {
      const name = s.name || `S${i}`
      const textWidth = renderer.measureText(name, 12)
      totalWidth += textWidth + 20 + (i < series.length - 1 ? 16 : 0)
    })

    let legendX = (this.width - totalWidth) / 2
    const legendY = 15

    series.forEach((s, i) => {
      const color = this.getSeriesColor(i, s.color)
      const enabled = this.enabledSeries.has(s.name || '')
      const name = s.name || `S${i}`

      // 绘制图例圆点
      renderer.drawCircle(
        { x: legendX + 4, y: legendY, radius: 4 },
        { fill: enabled ? color : '#64748b', opacity: enabled ? 1 : 0.4 }
      )

      // 绘制图例文本
      renderer.drawText(
        { x: legendX + 14, y: legendY, text: name },
        { fill: enabled ? colors.text : colors.textSecondary, fontSize: 12, textBaseline: 'middle', textAlign: 'left' }
      )

      const textWidth = renderer.measureText(name, 12)
      legendX += textWidth + 20 + 16
    })
  }

  private normalizeData(data: ScatterDataPoint[] | [number, number][]): ScatterDataPoint[] {
    return data.map(d => Array.isArray(d) ? { x: d[0], y: d[1] } : d)
  }

  private getRange(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    const series = this.scatterOptions.series || []
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
    const el = this.renderer.getElement()
    el.addEventListener('mousemove', this.onMouseMove.bind(this) as EventListener)
    el.addEventListener('mouseleave', this.onMouseLeave.bind(this) as EventListener)
  }

  private onMouseMove(e: MouseEvent): void {
    const el = this.renderer.getElement()
    const rect = el.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (this.width / rect.width)
    const my = (e.clientY - rect.top) * (this.height / rect.height)

    const { xMin, xMax, yMin, yMax } = this.getRange()
    const series = this.scatterOptions.series || []
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

    if (found && this.scatterOptions.tooltip?.show !== false) {
      const s = series[found.seriesIndex]!
      const p = this.normalizeData(s.data)[found.pointIndex]!
      this.showTooltip(e.clientX, e.clientY, s.name || '', p)
    } else {
      this.hideTooltip()
    }
  }

  private onMouseLeave(): void {
    this.hoverPoint = null
    this.render()
    this.hideTooltip()
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

  private lightenColor(hex: string): string {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // ============== 公共方法 ==============

  setData(series: ScatterSeriesData[]): void {
    this.scatterOptions.series = series
    this.enabledSeries = new Set(series.map(s => s.name || ''))
    this.render()
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.scatterOptions.theme = theme
      ; (this.options as any).theme = theme
    this.render()
  }

  refresh(): void {
    this.scatterOptions.theme = getCurrentTheme()
      ; (this.options as any).theme = this.scatterOptions.theme
    this.render()
  }

  dispose(): void {
    super.dispose()
    if (this.tooltipEl) this.tooltipEl.remove()
  }
}
