/**
 * MixedChart 类 - 支持折线图和柱状图混合显示，支持双Y轴
 */

import { BaseChart, SERIES_COLORS } from './BaseChart'
import type { BaseChartOptions } from './BaseChart'

export interface MixedSeriesData {
  name?: string
  type: 'bar' | 'line'
  data: (number | null)[]
  color?: string
  /** 使用的Y轴索引，0=左侧Y轴，1=右侧Y轴 */
  yAxisIndex?: number
  /** 折线图是否平滑 */
  smooth?: boolean
  /** 折线图区域填充 */
  areaStyle?: { opacity?: number }
  /** 柱状图圆角 */
  borderRadius?: number
  /** 柱状图堆叠标识 */
  stack?: string
  /** 线条样式 */
  lineStyle?: { type?: 'solid' | 'dashed' | 'dotted'; width?: number }
  /** 是否显示数据点 */
  showSymbol?: boolean
  /** 数据点大小 */
  symbolSize?: number
}

export interface MixedChartOptions extends BaseChartOptions {
  xAxis?: { data?: string[] }
  yAxis?: { min?: number | 'auto'; max?: number | 'auto'; name?: string }[]
  series?: MixedSeriesData[]
  legend?: { show?: boolean }
  tooltip?: { show?: boolean }
  grid?: { show?: boolean }
}

function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export class MixedChart extends BaseChart<MixedChartOptions> {
  private hoverIndex = -1
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null
  private mixedOptions: MixedChartOptions

  constructor(container: string | HTMLElement, options: MixedChartOptions = {}) {
    const defaultOptions: MixedChartOptions = {
      ...options,
      theme: options.theme || getCurrentTheme(),
      xAxis: options.xAxis || { data: [] },
      yAxis: options.yAxis || [{}],
      series: options.series || [],
      legend: options.legend ?? { show: true },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
    }

    super(container, defaultOptions)
    this.mixedOptions = defaultOptions
    this.enabledSeries = new Set(this.mixedOptions.series?.map(s => s.name || '') || [])

    this.bindEvents()

    const config = this.getAnimationConfig()
    if (config.enabled) {
      this.startAnimation()
    } else {
      this.render()
    }
  }

  protected getPadding() {
    const padding = (this.options as MixedChartOptions)?.padding
    const hasRightYAxis = this.mixedOptions?.series?.some(s => s.yAxisIndex === 1)
    return {
      top: padding?.top ?? 40,
      right: padding?.right ?? (hasRightYAxis ? 60 : 20),
      bottom: padding?.bottom ?? 40,
      left: padding?.left ?? 50,
    }
  }

  protected paint(): void {
    const { renderer, chartRect, mixedOptions: options } = this
    const colors = this.colors

    if (!options.series?.length) return

    const labels = options.xAxis?.data || []
    const enabledSeries = (options.series || []).filter(s => this.enabledSeries.has(s.name || ''))

    // 分离柱状图和折线图系列
    const barSeries = enabledSeries.filter(s => s.type === 'bar')
    const lineSeries = enabledSeries.filter(s => s.type === 'line')

    // 计算两个Y轴的范围
    const yRanges = this.getYRanges(enabledSeries)

    // 绘制背景
    this.drawBackground()

    // 绘制网格
    if (options.grid?.show !== false) {
      this.drawGrid(5)
    }

    // 绘制X轴标签 - 与柱状图对齐，标签居中于每个分段
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)
    labels.forEach((label, i) => {
      const x = chartRect.x + barGroupWidth * i + barGroupWidth / 2
      renderer.drawText(
        { x, y: chartRect.y + chartRect.height + 20, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
      )
    })

    // 绘制左Y轴标签
    this.drawMixedYAxisLabels(yRanges[0]!, 'left')

    // 绘制右Y轴标签（如果有）
    if (enabledSeries.some(s => s.yAxisIndex === 1) && yRanges[1]) {
      this.drawMixedYAxisLabels(yRanges[1], 'right')
    }

    // 绘制柱状图
    if (barSeries.length > 0) {
      this.drawBarSeries(barSeries, yRanges, labels)
    }

    // 绘制折线图
    if (lineSeries.length > 0) {
      this.drawLineSeries(lineSeries, yRanges, labels)
    }

    // 绘制悬停参考线
    if (this.hoverIndex >= 0) {
      const hoverX = chartRect.x + barGroupWidth * this.hoverIndex + barGroupWidth / 2
      const hoverLineColor = this.options.theme === 'dark' ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.5)'
      renderer.drawLine(
        [{ x: hoverX, y: chartRect.y }, { x: hoverX, y: chartRect.y + chartRect.height }],
        { stroke: hoverLineColor, lineWidth: 2 }
      )
    }

    // 绘制图例
    if (options.legend?.show !== false) {
      this.drawMixedLegend()
    }
  }

  private getYRanges(series: MixedSeriesData[]): { min: number; max: number }[] {
    const ranges: { min: number; max: number }[] = [
      { min: Infinity, max: -Infinity },
      { min: Infinity, max: -Infinity },
    ]

    series.forEach(s => {
      const yAxisIndex = s.yAxisIndex || 0
      const range = ranges[yAxisIndex]
      if (range) {
        s.data.forEach(v => {
          if (v !== null) {
            range.min = Math.min(range.min, v)
            range.max = Math.max(range.max, v)
          }
        })
      }
    })

    // 处理边界情况
    ranges.forEach(range => {
      if (!isFinite(range.min)) range.min = 0
      if (!isFinite(range.max)) range.max = 100

      // 添加边距
      const padding = (range.max - range.min) * 0.1 || 10
      range.min = Math.floor(range.min - padding)
      range.max = Math.ceil(range.max + padding)
      if (range.min > 0 && range.min < padding * 2) range.min = 0
    })

    return ranges
  }

  private drawMixedYAxisLabels(range: { min: number; max: number }, side: 'left' | 'right'): void {
    const { renderer, chartRect, colors } = this
    const tickCount = 5

    for (let i = 0; i <= tickCount; i++) {
      const value = range.min + (range.max - range.min) * (i / tickCount)
      const y = chartRect.y + chartRect.height - (chartRect.height * i) / tickCount
      const x = side === 'left' ? chartRect.x - 10 : chartRect.x + chartRect.width + 10
      const textAlign = side === 'left' ? 'right' : 'left'

      renderer.drawText(
        { x, y: y + 4, text: Math.round(value).toString() },
        { fill: colors.textSecondary, fontSize: 11, textAlign: textAlign as 'left' | 'right' }
      )
    }
  }

  private drawBarSeries(series: MixedSeriesData[], yRanges: { min: number; max: number }[], labels: string[]): void {
    const { renderer, chartRect, animationProgress } = this
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)
    const barWidth = (barGroupWidth * 0.6) / series.length
    // 计算柱子组的总宽度和起始偏移，使柱子组居中于分段
    const totalBarsWidth = barWidth * series.length
    const startOffset = (barGroupWidth - totalBarsWidth) / 2

    series.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!

      s.data.forEach((value, dataIndex) => {
        if (value === null) return

        // 柱子居中于标签位置
        const x = chartRect.x + barGroupWidth * dataIndex + startOffset + barWidth * seriesIndex
        const normalizedValue = (value - yRange.min) / (yRange.max - yRange.min)
        const barHeight = chartRect.height * normalizedValue * animationProgress
        const y = chartRect.y + chartRect.height - barHeight
        const isHovered = this.hoverIndex === dataIndex

        renderer.drawRect(
          { x, y, width: barWidth - 2, height: barHeight },
          { fill: color, opacity: isHovered ? 1 : 0.85 }
        )
      })
    })
  }

  private drawLineSeries(series: MixedSeriesData[], yRanges: { min: number; max: number }[], labels: string[]): void {
    const { renderer, chartRect, animationProgress } = this
    // 使用与柱状图相同的坐标系，确保折线图数据点与柱状图中心对齐
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    series.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const points: { x: number; y: number }[] = []

      s.data.forEach((value, dataIndex) => {
        if (value === null) return
        const x = chartRect.x + barGroupWidth * dataIndex + barGroupWidth / 2
        const normalizedValue = (value - yRange.min) / (yRange.max - yRange.min)
        const y = chartRect.y + chartRect.height - chartRect.height * normalizedValue
        points.push({ x, y })
      })

      if (points.length === 0) return

      // 应用动画
      const visibleCount = Math.ceil(points.length * animationProgress)
      const visiblePoints = points.slice(0, visibleCount)

      // 绘制区域填充
      if (s.areaStyle && visiblePoints.length > 1) {
        const lastPoint = visiblePoints[visiblePoints.length - 1]!
        const firstPoint = visiblePoints[0]!
        const areaPoints = [...visiblePoints]
        areaPoints.push({ x: lastPoint.x, y: chartRect.y + chartRect.height })
        areaPoints.push({ x: firstPoint.x, y: chartRect.y + chartRect.height })
        renderer.drawPolygon(areaPoints, { fill: color, opacity: s.areaStyle.opacity || 0.2 })
      }

      // 绘制线条
      if (visiblePoints.length > 1) {
        const lineDash = s.lineStyle?.type === 'dashed' ? [6, 4] : s.lineStyle?.type === 'dotted' ? [2, 2] : undefined
        renderer.drawLine(visiblePoints, {
          stroke: color,
          lineWidth: s.lineStyle?.width || 2,
          lineDash,
        }, s.smooth)
      }

      // 绘制数据点
      if (s.showSymbol !== false) {
        visiblePoints.forEach((point) => {
          const radius = s.symbolSize || 4
          renderer.drawCircle(
            { x: point.x, y: point.y, radius },
            { fill: this.colors.background, stroke: color, lineWidth: 2 }
          )
        })
      }
    })
  }

  private drawMixedLegend(): void {
    const { renderer, mixedOptions: options, chartRect, colors } = this
    const series = options.series || []
    const disabledColor = colors.textSecondary

    const legendY = chartRect.y - 25
    let legendX = chartRect.x

    series.forEach((s, i) => {
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      const name = s.name || `系列${i + 1}`
      const isEnabled = this.enabledSeries.has(name)

      // 绘制图例图标
      if (s.type === 'bar') {
        renderer.drawRect(
          { x: legendX, y: legendY - 5, width: 14, height: 10 },
          { fill: isEnabled ? color : disabledColor }
        )
      } else {
        renderer.drawLine(
          [{ x: legendX, y: legendY }, { x: legendX + 14, y: legendY }],
          { stroke: isEnabled ? color : disabledColor, lineWidth: 2 }
        )
        renderer.drawCircle(
          { x: legendX + 7, y: legendY, radius: 3 },
          { fill: isEnabled ? color : disabledColor }
        )
      }

      // 绘制图例文字
      renderer.drawText(
        { x: legendX + 18, y: legendY + 4, text: name },
        { fill: isEnabled ? colors.text : disabledColor, fontSize: 12 }
      )

      legendX += renderer.measureText(name, 12) + 35
    })
  }

  private bindEvents(): void {
    const container = this.container
    if (!container) return

    container.addEventListener('mousemove', this.handleMouseMove.bind(this))
    container.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    container.addEventListener('click', this.handleClick.bind(this))
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.container?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const labels = this.mixedOptions.xAxis?.data || []
    const barGroupWidth = this.chartRect.width / Math.max(labels.length, 1)

    const newIndex = Math.floor((x - this.chartRect.x) / barGroupWidth)
    if (newIndex >= 0 && newIndex < labels.length && newIndex !== this.hoverIndex) {
      this.hoverIndex = newIndex
      this.render()
      this.showTooltip(e, newIndex)
    }
  }

  private handleMouseLeave(): void {
    this.hoverIndex = -1
    this.hideTooltip()
    this.render()
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.container?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 检查是否点击图例
    const legendY = this.chartRect.y - 25
    if (y >= legendY - 10 && y <= legendY + 10) {
      let legendX = this.chartRect.x
      const series = this.mixedOptions.series || []

      for (const s of series) {
        const name = s.name || ''
        const textWidth = this.renderer.measureText(name, 12)
        const itemWidth = textWidth + 35

        if (x >= legendX && x <= legendX + itemWidth) {
          if (this.enabledSeries.has(name)) {
            this.enabledSeries.delete(name)
          } else {
            this.enabledSeries.add(name)
          }
          this.render()
          break
        }
        legendX += itemWidth
      }
    }
  }

  private showTooltip(e: MouseEvent, index: number): void {
    if (this.mixedOptions.tooltip?.show === false) return

    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      this.tooltipEl.style.cssText = `
        position: fixed;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        max-width: 200px;
      `
      document.body.appendChild(this.tooltipEl)
    }

    const labels = this.mixedOptions.xAxis?.data || []
    const series = this.mixedOptions.series || []

    let html = `<div style="margin-bottom: 4px; font-weight: bold;">${labels[index] || ''}</div>`
    series.forEach((s, i) => {
      if (!this.enabledSeries.has(s.name || '')) return
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      const value = s.data[index]
      if (value !== null) {
        const icon = s.type === 'bar' ? '■' : '●'
        html += `<div><span style="color: ${color}">${icon}</span> ${s.name || ''}: ${value}</div>`
      }
    })

    this.tooltipEl.innerHTML = html
    this.tooltipEl.style.left = `${e.clientX + 10}px`
    this.tooltipEl.style.top = `${e.clientY + 10}px`
    this.tooltipEl.style.display = 'block'
  }

  private hideTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none'
    }
  }

  dispose(): void {
    if (this.tooltipEl) {
      this.tooltipEl.remove()
      this.tooltipEl = null
    }
    super.dispose()
  }
}
