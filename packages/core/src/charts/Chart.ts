/**
 * 统一图表类 - 参考 ECharts 设计理念
 * 
 * 核心概念：
 * - 一个 Chart 实例可以包含多种系列类型
 * - 通过 series[].type 指定每个系列的图表类型
 * - 支持坐标轴翻转（横向柱状图等）
 * 
 * @example
 * ```ts
 * const chart = new Chart('#container', {
 *   xAxis: { data: ['Mon', 'Tue', 'Wed'] },
 *   yAxis: {},
 *   series: [
 *     { type: 'bar', name: '销量', data: [120, 200, 150] },
 *     { type: 'line', name: '增长率', data: [10, 15, 12] },
 *   ],
 * })
 * ```
 */

import { BaseChart, SERIES_COLORS } from './BaseChart'
import type { BaseChartOptions } from './BaseChart'

// ============== 类型定义 ==============

/** 系列类型 */
export type SeriesType = 'line' | 'bar' | 'scatter' | 'pie'

/** 线条样式 */
export interface LineStyle {
  width?: number
  type?: 'solid' | 'dashed' | 'dotted'
  color?: string
}

/** 区域样式 */
export interface AreaStyle {
  opacity?: number
  color?: string
}

/** 散点图数据点 */
export type ScatterDataPoint = [number, number] | { x: number; y: number; value?: number }

/** 通用系列数据 */
export interface SeriesData {
  type: SeriesType
  name?: string
  /** 数据数组：折线/柱状图用 number[], 散点图用 [x,y][] 或 {x,y}[] */
  data: (number | null)[] | ScatterDataPoint[]
  color?: string

  // 折线图特有
  smooth?: boolean
  step?: false | 'start' | 'middle' | 'end'
  areaStyle?: boolean | AreaStyle
  lineStyle?: LineStyle
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
  symbolSize?: number
  showSymbol?: boolean
  connectNulls?: boolean

  // 柱状图特有
  stack?: string
  barWidth?: number | string
  barGap?: string
  borderRadius?: number

  // 多轴支持
  yAxisIndex?: number
  xAxisIndex?: number
}

/** X轴配置 */
export interface XAxisConfig {
  data?: string[]
  name?: string
  show?: boolean
  /** 轴反转 */
  inverse?: boolean
  /** 轴位置：bottom（默认）或 top */
  position?: 'bottom' | 'top'
  /** 标签显示间隔 */
  interval?: number | 'auto'
  /** 标签旋转角度 */
  rotate?: number
  /** 标签格式化 */
  formatter?: (value: string, index: number) => string
}

/** Y轴配置 */
export interface YAxisConfig {
  name?: string
  min?: number | 'auto'
  max?: number | 'auto'
  show?: boolean
  /** 轴反转 */
  inverse?: boolean
  /** 轴位置：left（默认）或 right */
  position?: 'left' | 'right'
}

/** 图表配置 */
export interface ChartOptions extends BaseChartOptions {
  /** X轴配置，支持多个 */
  xAxis?: XAxisConfig | XAxisConfig[]
  /** Y轴配置，支持多个 */
  yAxis?: YAxisConfig | YAxisConfig[]
  /** 系列数据 */
  series?: SeriesData[]
  /** 图例配置 */
  legend?: { show?: boolean; position?: 'top' | 'bottom' }
  /** 提示框配置 */
  tooltip?: { show?: boolean }
  /** 网格配置 */
  grid?: { show?: boolean }
  /** 坐标系翻转：交换 X/Y 轴（用于横向柱状图） */
  horizontal?: boolean
}

// ============== 辅助函数 ==============

/** 从数据中提取数值（用于折线图/柱状图） */
function getNumericValue(value: number | null | ScatterDataPoint): number | null {
  if (value === null) return null
  if (typeof value === 'number') return value
  // 对于散点图数据，返回 y 值
  if (Array.isArray(value)) return value[1]
  return value.y
}

// ============== Chart 类 ==============

export class Chart extends BaseChart<ChartOptions> {
  private hoverIndex = -1
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null

  constructor(container: string | HTMLElement, options: ChartOptions = {}) {
    // 自动检测主题
    const detectedTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
      : null) || 'dark'

    const defaultOptions: ChartOptions = {
      ...options,
      theme: options.theme || detectedTheme,
      xAxis: options.xAxis || { data: [] },
      yAxis: options.yAxis || [{}],
      series: options.series || [],
      legend: options.legend ?? { show: true },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
    }

    super(container, defaultOptions)

    // 启用所有系列
    this.enabledSeries = new Set(this.options.series?.map(s => s.name || '') || [])

    // 绑定事件
    this.bindEvents()

    // 启动动画
    if (this.getAnimationConfig().enabled) {
      this.startEntryAnimation()
    } else {
      this.render()
    }
  }

  // ============== 抽象方法实现 ==============

  protected getPadding(): { top: number; right: number; bottom: number; left: number } {
    const p = this.options.padding || {}
    return {
      top: p.top ?? 40,
      right: p.right ?? 20,
      bottom: p.bottom ?? 40,
      left: p.left ?? 50,
    }
  }

  protected paint(): void {
    this.renderChart()
  }

  // ============== 公共方法 ==============

  setOption(options: Partial<ChartOptions>): void {
    this.options = { ...this.options, ...options }
    if (options.series) {
      this.enabledSeries = new Set(options.series.map(s => s.name || ''))
    }
    this.render()
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.options.theme = theme
    this.render()
  }

  override resize(): void {
    super.resize()
  }

  refresh(): void {
    this.render()
  }

  dispose(): void {
    if (this.tooltipEl?.parentNode) {
      this.tooltipEl.parentNode.removeChild(this.tooltipEl)
    }
    super.dispose()
  }

  // ============== 渲染逻辑 ==============

  private renderChart(): void {
    const { options } = this
    const { horizontal } = options

    // 获取轴配置
    const xAxisConfig = this.getAxisConfig(options.xAxis, 0)
    const yAxisConfigs = this.getAxisConfigs(options.yAxis)

    // 获取标签和启用的系列
    const labels = horizontal
      ? [] // 横向模式下标签在 Y 轴
      : (xAxisConfig.data || [])

    const enabledSeries = (options.series || []).filter(s => this.enabledSeries.has(s.name || ''))

    // 计算 Y 轴范围
    const yRanges = this.calculateYRanges(enabledSeries, yAxisConfigs)

    // 绘制背景
    this.drawBackground()

    // 绘制网格
    if (options.grid?.show !== false) {
      this.drawGrid(5)
    }

    // 绘制坐标轴
    this.drawXAxis(labels, xAxisConfig)
    this.drawYAxis(yRanges, yAxisConfigs)

    // 按类型分组系列
    const barSeries = enabledSeries.filter(s => s.type === 'bar')
    const lineSeries = enabledSeries.filter(s => s.type === 'line')
    const scatterSeries = enabledSeries.filter(s => s.type === 'scatter')

    // 绘制各类型系列
    if (barSeries.length > 0) {
      this.drawBarSeries(barSeries, yRanges, labels, horizontal)
    }
    if (lineSeries.length > 0) {
      this.drawLineSeries(lineSeries, yRanges, labels, horizontal)
    }
    if (scatterSeries.length > 0) {
      this.drawScatterSeries(scatterSeries, yRanges, labels)
    }

    // 绘制悬停参考线
    this.drawHoverLine(labels)

    // 绘制图例
    if (options.legend?.show !== false) {
      this.drawLegend()
    }
  }

  // ============== 坐标轴方法 ==============

  private getAxisConfig(axis: XAxisConfig | XAxisConfig[] | undefined, index: number): XAxisConfig {
    if (Array.isArray(axis)) {
      return axis[index] || {}
    }
    return axis || {}
  }

  private getAxisConfigs(axis: YAxisConfig | YAxisConfig[] | undefined): YAxisConfig[] {
    if (Array.isArray(axis)) {
      return axis
    }
    return axis ? [axis] : [{}]
  }

  private calculateYRanges(series: SeriesData[], yAxisConfigs: YAxisConfig[]): { min: number; max: number }[] {
    const ranges: { min: number; max: number }[] = yAxisConfigs.map(() => ({
      min: Infinity,
      max: -Infinity,
    }))

    // 计算堆叠累计值
    const stackTotals: Map<string, number[]> = new Map()

    series.forEach(s => {
      const yAxisIndex = s.yAxisIndex || 0
      const range = ranges[yAxisIndex]
      if (!range) return

      if (s.stack) {
        // 堆叠系列：累加值
        if (!stackTotals.has(s.stack)) {
          stackTotals.set(s.stack, [])
        }
        const totals = stackTotals.get(s.stack)!

        s.data.forEach((v, i) => {
          const numValue = getNumericValue(v)
          if (numValue !== null) {
            totals[i] = (totals[i] || 0) + numValue
            range.max = Math.max(range.max, totals[i]!)
            range.min = Math.min(range.min, 0) // 堆叠图从0开始
          }
        })
      } else {
        // 非堆叠系列：使用原始值
        s.data.forEach(v => {
          const numValue = getNumericValue(v)
          if (numValue !== null) {
            range.min = Math.min(range.min, numValue)
            range.max = Math.max(range.max, numValue)
          }
        })
      }
    })

    // 处理边界情况
    ranges.forEach((range) => {
      if (!isFinite(range.min)) range.min = 0
      if (!isFinite(range.max)) range.max = 100

      // 添加边距
      const padding = (range.max - range.min) * 0.1 || 10
      range.max = Math.ceil((range.max + padding) / 10) * 10

      // 处理最小值：如果数据都是正数，从0开始；否则添加下边距
      if (range.min >= 0) {
        range.min = 0
      } else {
        range.min = Math.floor((range.min - padding) / 10) * 10
      }
    })

    return ranges
  }

  private drawXAxis(labels: string[], config: XAxisConfig): void {
    const { renderer, chartRect, colors } = this
    const { inverse, interval } = config

    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    // 计算标签间隔，避免重叠
    let labelInterval = 1
    if (interval === 'auto' || labels.length > 20) {
      // 估算每个标签需要的宽度（假设平均8个字符 * 7像素）
      const avgLabelWidth = 50
      const maxLabels = Math.floor(chartRect.width / avgLabelWidth)
      labelInterval = Math.max(1, Math.ceil(labels.length / maxLabels))
    } else if (typeof interval === 'number') {
      labelInterval = interval
    }

    // 处理反转
    const displayLabels = inverse ? [...labels].reverse() : labels

    displayLabels.forEach((label, i) => {
      // 只显示符合间隔的标签
      if (i % labelInterval !== 0 && i !== displayLabels.length - 1) return

      const x = chartRect.x + barGroupWidth * i + barGroupWidth / 2
      const y = chartRect.y + chartRect.height + 20

      renderer.drawText(
        { x, y, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
      )
    })
  }

  private drawYAxis(yRanges: { min: number; max: number }[], configs: YAxisConfig[]): void {
    const { renderer, chartRect, colors } = this
    const yTicks = 5

    configs.forEach((config, axisIndex) => {
      const range = yRanges[axisIndex]
      if (!range) return

      const isRight = config.position === 'right' || axisIndex > 0
      const { inverse } = config

      for (let i = 0; i <= yTicks; i++) {
        // 支持反转
        const tickIndex = inverse ? (yTicks - i) : i
        const value = range.min + (range.max - range.min) * (1 - tickIndex / yTicks)
        const y = chartRect.y + (i / yTicks) * chartRect.height

        const x = isRight ? chartRect.x + chartRect.width + 8 : chartRect.x - 8
        const textAlign = isRight ? 'left' : 'right'

        renderer.drawText(
          { x, y, text: Math.round(value).toString() },
          { fill: colors.textSecondary, fontSize: 11, textAlign: textAlign as 'left' | 'right' }
        )
      }
    })
  }

  // ============== 系列绑制方法 ==============

  private drawBarSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, animationProgress } = this

    if (horizontal) {
      this.drawHorizontalBars(series, yRanges, labels)
      return
    }

    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)
    const barWidth = (barGroupWidth * 0.6) / series.length
    const totalBarsWidth = barWidth * series.length
    const startOffset = (barGroupWidth - totalBarsWidth) / 2

    series.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const radius = s.borderRadius ?? 4

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const x = chartRect.x + barGroupWidth * dataIndex + startOffset + barWidth * seriesIndex
        const normalizedValue = (numValue - yRange.min) / (yRange.max - yRange.min)
        const barHeight = chartRect.height * normalizedValue * animationProgress
        const y = chartRect.y + chartRect.height - barHeight
        const isHovered = this.hoverIndex === dataIndex

        renderer.drawRect(
          { x, y, width: barWidth - 2, height: barHeight },
          { fill: color, opacity: isHovered ? 1 : 0.85, radius }
        )
      })
    })
  }

  private drawHorizontalBars(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[]
  ): void {
    const { renderer, chartRect, animationProgress, colors } = this

    // 横向柱状图：Y轴显示分类，X轴显示数值
    const barGroupHeight = chartRect.height / Math.max(labels.length, 1)
    const barHeight = (barGroupHeight * 0.6) / series.length
    const totalBarsHeight = barHeight * series.length
    const startOffset = (barGroupHeight - totalBarsHeight) / 2

    // 绘制 Y 轴分类标签
    labels.forEach((label, i) => {
      const y = chartRect.y + barGroupHeight * i + barGroupHeight / 2
      renderer.drawText(
        { x: chartRect.x - 8, y, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'right', textBaseline: 'middle' }
      )
    })

    // 绘制横向柱子
    series.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const radius = s.borderRadius ?? 4

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const y = chartRect.y + barGroupHeight * dataIndex + startOffset + barHeight * seriesIndex
        const normalizedValue = (numValue - yRange.min) / (yRange.max - yRange.min)
        const barWidth = chartRect.width * normalizedValue * animationProgress
        const x = chartRect.x
        const isHovered = this.hoverIndex === dataIndex

        renderer.drawRect(
          { x, y, width: barWidth, height: barHeight - 2 },
          { fill: color, opacity: isHovered ? 1 : 0.85, radius }
        )
      })
    })
  }

  private drawLineSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[],
    _horizontal?: boolean
  ): void {
    const { renderer, chartRect, animationProgress, colors } = this
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)
    const baseY = chartRect.y + chartRect.height // 底部基线

    // 计算堆叠数据：按 stack 属性分组
    const stackGroups: Map<string, { seriesIndex: number; data: number[] }[]> = new Map()
    const stackedValues: Map<string, number[]> = new Map()

    series.forEach((s, seriesIndex) => {
      if (s.stack) {
        if (!stackGroups.has(s.stack)) {
          stackGroups.set(s.stack, [])
          stackedValues.set(s.stack, new Array(labels.length).fill(0))
        }
        stackGroups.get(s.stack)!.push({
          seriesIndex,
          data: s.data.map(v => getNumericValue(v) || 0)
        })
      }
    })

    // 存储每个系列的实际 Y 坐标（堆叠后）
    const seriesPointsMap: Map<number, { x: number; y: number }[]> = new Map()

    series.forEach((s, seriesIndex) => {
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!

      // 计算所有点位置（考虑堆叠）
      const allPoints: { x: number; y: number }[] = []

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        let actualValue = numValue

        // 如果有堆叠，累加之前的值
        if (s.stack && stackedValues.has(s.stack)) {
          const stackedArr = stackedValues.get(s.stack)!
          actualValue = stackedArr[dataIndex]! + numValue
          stackedArr[dataIndex] = actualValue
        }

        const x = chartRect.x + barGroupWidth * dataIndex + barGroupWidth / 2
        const normalizedValue = (actualValue - yRange.min) / (yRange.max - yRange.min)
        const targetY = chartRect.y + chartRect.height - chartRect.height * normalizedValue
        // 动画：从底部升起到目标位置
        const y = baseY + (targetY - baseY) * animationProgress
        allPoints.push({ x, y })
      })

      if (allPoints.length === 0) return

      seriesPointsMap.set(seriesIndex, allPoints)
    })

    // 绘制区域填充（从后往前绘制，确保正确的层叠顺序）
    const reversedSeries = [...series].reverse()
    reversedSeries.forEach((s, reversedIndex) => {
      const seriesIndex = series.length - 1 - reversedIndex
      const points = seriesPointsMap.get(seriesIndex)
      if (!points || points.length < 2 || !s.areaStyle) return

      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const opacity = (typeof s.areaStyle === 'object' ? (s.areaStyle.opacity || 0.3) : 0.3) * animationProgress

      // 找到同一 stack 组中的前一个系列
      let bottomPoints: { x: number; y: number }[] | null = null
      if (s.stack) {
        for (let i = seriesIndex - 1; i >= 0; i--) {
          if (series[i]?.stack === s.stack) {
            bottomPoints = seriesPointsMap.get(i) || null
            break
          }
        }
      }

      // 使用正确的绘制方法：顶部曲线平滑，底部保持直线或跟随前一系列
      const r = renderer as any // 类型断言以访问扩展方法

      if (bottomPoints && bottomPoints.length > 0) {
        // 堆叠模式：顶部和底部都可能是曲线
        r.drawStackedArea(points, bottomPoints, { fill: color, opacity }, s.smooth)
      } else {
        // 非堆叠模式：使用 drawArea 方法（顶部平滑，底部直线到 baseY）
        r.drawArea(points, baseY, color, s.smooth, opacity)
      }
    })

    // 绘制线条和数据点
    series.forEach((s, seriesIndex) => {
      const points = seriesPointsMap.get(seriesIndex)
      if (!points || points.length < 2) return

      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]

      // 绘制线条
      const lineDash = s.lineStyle?.type === 'dashed' ? [6, 4] :
        s.lineStyle?.type === 'dotted' ? [2, 2] : undefined
      renderer.drawLine(points, {
        stroke: color,
        lineWidth: s.lineStyle?.width || 2,
        lineDash,
        opacity: 0.3 + 0.7 * animationProgress,
      }, s.smooth)

      // 绘制数据点（延迟出现）
      if (s.showSymbol !== false && animationProgress > 0.5) {
        const symbolProgress = (animationProgress - 0.5) * 2
        points.forEach((point) => {
          const radius = (s.symbolSize || 4) * symbolProgress
          if (radius > 0.5) {
            renderer.drawCircle(
              { x: point.x, y: point.y, radius },
              { fill: colors.background, stroke: color, lineWidth: 2 }
            )
          }
        })
      }
    })
  }

  private drawScatterSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[]
  ): void {
    const { renderer, chartRect, colors } = this
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    series.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return
        const x = chartRect.x + barGroupWidth * dataIndex + barGroupWidth / 2
        const normalizedValue = (numValue - yRange.min) / (yRange.max - yRange.min)
        const y = chartRect.y + chartRect.height - chartRect.height * normalizedValue
        const radius = s.symbolSize || 6

        renderer.drawCircle(
          { x, y, radius },
          { fill: color, stroke: colors.background, lineWidth: 1 }
        )
      })
    })
  }

  // ============== 辅助绑制方法 ==============

  private drawHoverLine(labels: string[]): void {
    if (this.hoverIndex < 0) return

    const { chartRect, options } = this
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    const hoverLineColor = options.theme === 'dark'
      ? 'rgba(99, 102, 241, 0.6)'
      : 'rgba(99, 102, 241, 0.5)'

    const hoverX = chartRect.x + barGroupWidth * this.hoverIndex + barGroupWidth / 2
    this.renderer.drawLine(
      [{ x: hoverX, y: chartRect.y }, { x: hoverX, y: chartRect.y + chartRect.height }],
      { stroke: hoverLineColor, lineWidth: 2 }
    )
  }

  private drawLegend(): void {
    const { renderer, chartRect, colors, options } = this
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
      } else if (s.type === 'scatter') {
        renderer.drawCircle(
          { x: legendX + 7, y: legendY, radius: 5 },
          { fill: isEnabled ? color : disabledColor }
        )
      } else {
        // line
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

  // ============== 事件处理 ==============

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
    const y = e.clientY - rect.top
    const xAxisConfig = this.getAxisConfig(this.options.xAxis, 0)
    const labels = xAxisConfig.data || []
    const { horizontal } = this.options

    let newIndex: number
    if (horizontal) {
      const barGroupHeight = this.chartRect.height / Math.max(labels.length, 1)
      newIndex = Math.floor((y - this.chartRect.y) / barGroupHeight)
    } else {
      const barGroupWidth = this.chartRect.width / Math.max(labels.length, 1)
      newIndex = Math.floor((x - this.chartRect.x) / barGroupWidth)
    }

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

    // 检测图例点击
    const series = this.options.series || []
    const legendY = this.chartRect.y - 25
    let legendX = this.chartRect.x

    for (let i = 0; i < series.length; i++) {
      const s = series[i]!
      const name = s.name || `系列${i + 1}`
      const textWidth = this.renderer.measureText(name, 12)
      const itemWidth = textWidth + 35

      if (x >= legendX && x <= legendX + itemWidth && y >= legendY - 10 && y <= legendY + 10) {
        if (this.enabledSeries.has(name)) {
          this.enabledSeries.delete(name)
        } else {
          this.enabledSeries.add(name)
        }
        this.render()
        return
      }

      legendX += itemWidth
    }
  }

  // ============== 提示框 ==============

  private showTooltip(e: MouseEvent, index: number): void {
    if (this.options.tooltip?.show === false) return

    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.style.cssText = `
        position: fixed; padding: 8px 12px; border-radius: 6px; font-size: 12px;
        pointer-events: none; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      `
      document.body.appendChild(this.tooltipEl)
    }

    const xAxisConfig = this.getAxisConfig(this.options.xAxis, 0)
    const labels = xAxisConfig.data || []
    const label = labels[index] || ''
    const series = this.options.series || []

    let html = `<div style="font-weight:bold;margin-bottom:4px">${label}</div>`
    series.forEach((s, i) => {
      if (!this.enabledSeries.has(s.name || '')) return
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      const value = s.data[index]
      if (value !== null && value !== undefined) {
        html += `<div style="display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:${color}"></span>
          <span>${s.name || '系列' + (i + 1)}: ${value}</span>
        </div>`
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

  // ============== 动画方法 ==============

  private startEntryAnimation(): void {
    this.startAnimation()
  }
}
