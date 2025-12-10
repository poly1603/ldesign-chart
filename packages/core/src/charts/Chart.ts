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

/** 动画类型 */
export type AnimationType =
  | 'rise'    // 从下往上升起（默认）
  | 'expand'  // 从左到右展开（揭示效果）
  | 'grow'    // 点依次出现（生长效果）
  | 'fade'    // 淡入
  | 'wave'    // 波浪动画 - 数据点依次弹起（折线图专用）
  | 'draw'    // 绘制动画 - 线条渐进绘制（折线图专用）
  | 'none'    // 无动画

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

/** 饼图数据点 */
export interface PieDataItem {
  name: string
  value: number
  color?: string
  selected?: boolean
}

/** 饼图动画类型 */
export type PieAnimationType = 'expand' | 'scale' | 'fade' | 'bounce' | 'none'

/** 通用系列数据 */
export interface SeriesData {
  type: SeriesType
  name?: string
  /** 数据数组：折线/柱状图用 number[], 散点图用 [x,y][], 饼图用 PieDataItem[] */
  data: (number | null)[] | ScatterDataPoint[] | PieDataItem[]
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
  /** 动画类型（覆盖全局设置） */
  animationType?: AnimationType

  // 柱状图特有
  stack?: string
  barWidth?: number | string
  barGap?: string
  borderRadius?: number

  // 饼图特有
  /** 饼图半径 [内半径, 外半径]，值为 0-1 的比例 */
  radius?: number | [number, number]
  /** 南丁格尔玫瑰图 */
  roseType?: boolean | 'radius' | 'area'
  /** 饼图动画类型 */
  pieAnimationType?: PieAnimationType
  /** 起始角度（弧度），默认 -Math.PI/2 (12点钟方向) */
  startAngle?: number
  /** 扇形总角度（弧度），默认 Math.PI*2 (完整圆)，设为 Math.PI 为半圆 */
  sweepAngle?: number
  /** 标签配置 */
  label?: { show?: boolean; position?: 'inside' | 'outside' }

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
  /** 坐标系翻转：交换 X/Y 轴（用于横向图表），X轴显示值，Y轴显示类目 */
  horizontal?: boolean
  /** 全局动画类型（可被系列配置覆盖） */
  animationType?: AnimationType
}

// ============== 辅助函数 ==============

/** 从数据中提取数值（用于折线图/柱状图） */
function getNumericValue(value: number | null | ScatterDataPoint | PieDataItem): number | null {
  if (value === null) return null
  if (typeof value === 'number') return value
  // 对于散点图数据，返回 y 值
  if (Array.isArray(value)) return value[1]
  // 对于饼图数据，返回 value
  if ('value' in value && 'name' in value) return value.value
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

    // 延迟渲染，等待 DOM 完全就绪（避免刷新时抖动）
    requestAnimationFrame(() => {
      if (this.disposed) return

      // 检查并更新尺寸（确保容器已有正确尺寸）
      const actualWidth = this.container.clientWidth
      const actualHeight = this.container.clientHeight
      if (actualWidth > 0 && actualHeight > 0) {
        if (actualWidth !== this.width || actualHeight !== this.height) {
          // 直接设置尺寸并重新初始化
          ; (this.options as any).width = actualWidth
            ; (this.options as any).height = actualHeight
          const padding = this.getPadding()
          this.chartRect = {
            x: padding.left,
            y: padding.top,
            width: actualWidth - padding.left - padding.right,
            height: actualHeight - padding.top - padding.bottom,
          }
          this.renderer.resize(actualWidth, actualHeight)
        }
      }

      // 启动动画
      if (this.getAnimationConfig().enabled) {
        this.startEntryAnimation()
      } else {
        this.render()
      }
    })
  }

  // ============== 抽象方法实现 ==============

  protected getPadding(): { top: number; right: number; bottom: number; left: number } {
    const p = this.options.padding || {}
    const { horizontal, xAxis } = this.options

    // 水平模式下，Y轴显示类目标签，需要更大的左边距
    let defaultLeft = 50
    if (horizontal) {
      // 根据标签长度动态计算左边距
      const labels = Array.isArray(xAxis) ? xAxis[0]?.data : xAxis?.data
      if (labels && labels.length > 0) {
        const maxLabelLength = Math.max(...labels.map(l => l.length))
        // 每个字符约8px，加上一些边距
        defaultLeft = Math.max(60, Math.min(120, maxLabelLength * 8 + 20))
      } else {
        defaultLeft = 80
      }
    }

    return {
      top: p.top ?? 40,
      right: p.right ?? 20,
      bottom: p.bottom ?? 40,
      left: p.left ?? defaultLeft,
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

    const enabledSeries = (options.series || []).filter(s => this.enabledSeries.has(s.name || ''))

    // 按类型分组系列
    const barSeries = enabledSeries.filter(s => s.type === 'bar')
    const lineSeries = enabledSeries.filter(s => s.type === 'line')
    const scatterSeries = enabledSeries.filter(s => s.type === 'scatter')
    const pieSeries = enabledSeries.filter(s => s.type === 'pie')

    // 判断是否只有饼图（饼图不需要坐标轴和网格）
    const isPieOnly = pieSeries.length > 0 && barSeries.length === 0 && lineSeries.length === 0 && scatterSeries.length === 0

    // 绘制背景
    this.drawBackground()

    if (isPieOnly) {
      // 纯饼图模式：只绘制饼图
      this.drawPieSeries(pieSeries)
    } else {
      // 获取轴配置
      const xAxisConfig = this.getAxisConfig(options.xAxis, 0)
      const yAxisConfigs = this.getAxisConfigs(options.yAxis)
      const labels = xAxisConfig.data || []

      // 计算 Y 轴范围
      const yRanges = this.calculateYRanges(enabledSeries, yAxisConfigs)

      // 绘制网格
      if (options.grid?.show !== false) {
        this.drawGrid(5)
      }

      // 绘制坐标轴
      this.drawXAxis(labels, xAxisConfig, yRanges, horizontal)
      this.drawYAxis(yRanges, yAxisConfigs, labels, horizontal)

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
    }

    // 绘制图例
    if (options.legend?.show !== false && !isPieOnly) {
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

      // 确保范围包含0
      if (range.min > 0) range.min = 0
      if (range.max < 0) range.max = 0

      // 添加边距
      const padding = (range.max - range.min) * 0.1 || 10

      // 处理最大值
      if (range.max > 0) {
        range.max = Math.ceil((range.max + padding) / 10) * 10
      }

      // 处理最小值
      if (range.min < 0) {
        range.min = Math.floor((range.min - padding) / 10) * 10
      }
    })

    return ranges
  }

  private drawXAxis(
    labels: string[],
    config: XAxisConfig,
    yRanges: { min: number; max: number }[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, colors } = this
    const { inverse, interval } = config

    if (horizontal) {
      // 水平模式：X轴显示数值（底部）
      const yTicks = 5
      const range = yRanges[0] || { min: 0, max: 100 }

      for (let i = 0; i <= yTicks; i++) {
        const tickIndex = inverse ? (yTicks - i) : i
        const value = range.min + (range.max - range.min) * (tickIndex / yTicks)
        const x = chartRect.x + (i / yTicks) * chartRect.width
        const y = chartRect.y + chartRect.height + 20

        renderer.drawText(
          { x, y, text: Math.round(value).toString() },
          { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
        )
      }
      return
    }

    // 垂直模式（默认）：X轴显示类目
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    // 计算标签间隔，避免重叠
    let labelInterval = 1
    if (interval === 'auto' || labels.length > 20) {
      const avgLabelWidth = 50
      const maxLabels = Math.floor(chartRect.width / avgLabelWidth)
      labelInterval = Math.max(1, Math.ceil(labels.length / maxLabels))
    } else if (typeof interval === 'number') {
      labelInterval = interval
    }

    const displayLabels = inverse ? [...labels].reverse() : labels

    displayLabels.forEach((label, i) => {
      if (i % labelInterval !== 0 && i !== displayLabels.length - 1) return

      const x = chartRect.x + barGroupWidth * i + barGroupWidth / 2
      const y = chartRect.y + chartRect.height + 20

      renderer.drawText(
        { x, y, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
      )
    })
  }

  private drawYAxis(
    yRanges: { min: number; max: number }[],
    configs: YAxisConfig[],
    labels: string[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, colors } = this

    if (horizontal) {
      // 水平模式：Y轴显示类目（左侧）
      const barGroupWidth = chartRect.height / Math.max(labels.length, 1)
      const config = configs[0] || {}
      const inverse = config.inverse

      const displayLabels = inverse ? [...labels].reverse() : labels

      displayLabels.forEach((label, i) => {
        const x = chartRect.x - 8
        const y = chartRect.y + barGroupWidth * i + barGroupWidth / 2

        renderer.drawText(
          { x, y, text: label },
          { fill: colors.textSecondary, fontSize: 11, textAlign: 'right', textBaseline: 'middle' }
        )
      })
      return
    }

    // 垂直模式（默认）：Y轴显示数值
    const yTicks = 5

    configs.forEach((config, axisIndex) => {
      const range = yRanges[axisIndex]
      if (!range) return

      const isRight = config.position === 'right' || axisIndex > 0
      const { inverse } = config

      for (let i = 0; i <= yTicks; i++) {
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
    const { renderer, chartRect, animationProgress, options } = this
    const globalAnimationType = options.animationType || 'rise'

    if (horizontal) {
      this.drawHorizontalBars(series, yRanges, labels)
      return
    }

    const totalBars = labels.length
    const barGroupWidth = chartRect.width / Math.max(totalBars, 1)

    // 分离堆叠和非堆叠系列
    const stackGroups = new Map<string, SeriesData[]>()
    const nonStackSeries: SeriesData[] = []

    series.forEach(s => {
      if (s.stack) {
        if (!stackGroups.has(s.stack)) stackGroups.set(s.stack, [])
        stackGroups.get(s.stack)!.push(s)
      } else {
        nonStackSeries.push(s)
      }
    })

    // 计算柱子宽度：非堆叠系列 + 堆叠组数
    const totalBarGroups = nonStackSeries.length + stackGroups.size
    const barWidth = totalBarGroups > 0 ? (barGroupWidth * 0.7) / totalBarGroups : barGroupWidth * 0.7
    const totalBarsWidth = barWidth * totalBarGroups
    const startOffset = (barGroupWidth - totalBarsWidth) / 2

    // 获取 Y 轴范围和零点位置
    const yRange = yRanges[0] || { min: 0, max: 100 }
    const zeroY = chartRect.y + chartRect.height -
      ((0 - yRange.min) / (yRange.max - yRange.min)) * chartRect.height

    // 绘制非堆叠系列
    nonStackSeries.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
      const radius = s.borderRadius ?? 4
      const animationType = s.animationType || globalAnimationType

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const x = chartRect.x + barGroupWidth * dataIndex + startOffset + barWidth * seriesIndex
        const isHovered = this.hoverIndex === dataIndex

        // 计算柱子高度和位置（支持负值）
        const normalizedValue = (numValue - yRange.min) / (yRange.max - yRange.min)
        const barY = chartRect.y + chartRect.height - normalizedValue * chartRect.height
        const targetHeight = Math.abs(barY - zeroY)

        // 应用动画
        const { height: barHeight, opacity } = this.applyBarAnimation(
          targetHeight, animationType, animationProgress, dataIndex, totalBars, isHovered
        )

        if (barHeight > 0) {
          const y = numValue >= 0 ? zeroY - barHeight : zeroY
          renderer.drawRect(
            { x, y, width: barWidth - 2, height: barHeight },
            { fill: color, opacity, radius: numValue >= 0 ? radius : 0 }
          )
        }
      })
    })

    // 绘制堆叠系列
    let stackIndex = nonStackSeries.length
    stackGroups.forEach((stackSeries) => {
      // 正值和负值分别累加
      const positiveStack = new Array(totalBars).fill(0)
      const negativeStack = new Array(totalBars).fill(0)
      const totalStackLayers = stackSeries.length

      stackSeries.forEach((s, sIdx) => {
        const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
        const radius = s.borderRadius ?? 4
        const animationType = s.animationType || globalAnimationType

        s.data.forEach((value, dataIndex) => {
          const numValue = getNumericValue(value)
          if (numValue === null) return

          const x = chartRect.x + barGroupWidth * dataIndex + startOffset + barWidth * stackIndex
          const isHovered = this.hoverIndex === dataIndex

          // 计算堆叠位置
          let baseValue: number, targetValue: number
          if (numValue >= 0) {
            baseValue = positiveStack[dataIndex]!
            targetValue = baseValue + numValue
            positiveStack[dataIndex] = targetValue
          } else {
            baseValue = negativeStack[dataIndex]!
            targetValue = baseValue + numValue
            negativeStack[dataIndex] = targetValue
          }

          const baseY = chartRect.y + chartRect.height -
            ((baseValue - yRange.min) / (yRange.max - yRange.min)) * chartRect.height
          const targetY = chartRect.y + chartRect.height -
            ((targetValue - yRange.min) / (yRange.max - yRange.min)) * chartRect.height
          const targetHeight = Math.abs(targetY - baseY)

          // 堆叠动画：每层依次出现
          const { height: barHeight, opacity } = this.applyStackedBarAnimation(
            targetHeight, animationType, animationProgress, dataIndex, totalBars,
            sIdx, totalStackLayers, isHovered
          )

          if (barHeight > 0) {
            const y = numValue >= 0 ? baseY - barHeight : baseY
            // 只有最上层的堆叠才有圆角
            const isTop = sIdx === stackSeries.length - 1
            renderer.drawRect(
              { x, y, width: barWidth - 2, height: barHeight },
              { fill: color, opacity, radius: isTop ? radius : 0 }
            )
          }
        })
      })
      stackIndex++
    })
  }

  // 柱状图动画计算辅助方法
  private applyBarAnimation(
    targetHeight: number,
    animationType: AnimationType,
    progress: number,
    dataIndex: number,
    totalBars: number,
    isHovered: boolean
  ): { height: number; opacity: number } {
    let height = targetHeight
    let opacity = isHovered ? 1 : 0.85

    // 使用缓动函数使动画更流畅
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    switch (animationType) {
      case 'rise':
        // 从底部升起，使用缓动
        height = targetHeight * easeOutCubic(progress)
        break
      case 'expand':
        // 从左到右依次展开，每个柱子有重叠
        const expandDelay = dataIndex / (totalBars + 2)
        const expandDuration = 1 - expandDelay
        const expandProgress = Math.max(0, Math.min(1, (progress - expandDelay) / expandDuration))
        height = targetHeight * easeOutQuart(expandProgress)
        break
      case 'grow':
        // 依次出现，更平滑的延迟
        const growDelay = (dataIndex / totalBars) * 0.6
        const growDuration = 1 - growDelay
        const growProgress = Math.max(0, Math.min(1, (progress - growDelay) / growDuration))
        height = targetHeight * easeOutCubic(growProgress)
        break
      case 'fade':
        // 淡入效果
        height = targetHeight
        opacity = (isHovered ? 1 : 0.85) * easeOutCubic(progress)
        break
      case 'none':
        height = targetHeight
        break
    }

    return { height, opacity }
  }

  // 堆叠柱状图动画：每层依次出现
  private applyStackedBarAnimation(
    targetHeight: number,
    animationType: AnimationType,
    progress: number,
    dataIndex: number,
    totalBars: number,
    stackLayerIndex: number,
    totalStackLayers: number,
    isHovered: boolean
  ): { height: number; opacity: number } {
    let height = targetHeight
    let opacity = isHovered ? 1 : 0.85

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    // 堆叠动画：每层依次出现
    // 每层占用的动画时间段
    const layerDuration = 1 / totalStackLayers
    const layerStart = stackLayerIndex * layerDuration * 0.7 // 0.7 让层之间有重叠
    const layerEnd = layerStart + layerDuration + 0.3 // 延长结束时间让动画更平滑

    // 计算当前层的进度
    const layerProgress = Math.max(0, Math.min(1, (progress - layerStart) / (layerEnd - layerStart)))

    switch (animationType) {
      case 'rise':
        // 从底部升起，每层依次
        height = targetHeight * easeOutCubic(layerProgress)
        break
      case 'expand':
        // 从左到右依次展开，同时每层依次
        const expandDelay = dataIndex / (totalBars + 2)
        const expandDuration = 1 - expandDelay
        const expandProgress = Math.max(0, Math.min(1, (layerProgress - expandDelay) / expandDuration))
        height = targetHeight * easeOutQuart(expandProgress)
        break
      case 'grow':
        // 依次出现
        const growDelay = (dataIndex / totalBars) * 0.4
        const growDuration = 1 - growDelay
        const growProgress = Math.max(0, Math.min(1, (layerProgress - growDelay) / growDuration))
        height = targetHeight * easeOutCubic(growProgress)
        break
      case 'fade':
        // 淡入效果
        height = targetHeight * easeOutCubic(layerProgress)
        opacity = (isHovered ? 1 : 0.85) * easeOutCubic(layerProgress)
        break
      case 'none':
        height = targetHeight
        break
    }

    return { height, opacity }
  }

  private drawHorizontalBars(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[]
  ): void {
    const { renderer, chartRect, animationProgress, options } = this
    const globalAnimationType = options.animationType || 'rise'

    const totalBars = labels.length
    const barGroupHeight = chartRect.height / Math.max(totalBars, 1)

    // 分离堆叠和非堆叠系列
    const stackGroups = new Map<string, SeriesData[]>()
    const nonStackSeries: SeriesData[] = []

    series.forEach(s => {
      if (s.stack) {
        if (!stackGroups.has(s.stack)) stackGroups.set(s.stack, [])
        stackGroups.get(s.stack)!.push(s)
      } else {
        nonStackSeries.push(s)
      }
    })

    // 计算柱子高度
    const totalBarGroups = nonStackSeries.length + stackGroups.size
    const barHeight = totalBarGroups > 0 ? (barGroupHeight * 0.7) / totalBarGroups : barGroupHeight * 0.7
    const totalBarsHeight = barHeight * totalBarGroups
    const startOffset = (barGroupHeight - totalBarsHeight) / 2

    // 获取 X 轴范围和零点位置
    const xRange = yRanges[0] || { min: 0, max: 100 }
    const zeroX = chartRect.x + ((0 - xRange.min) / (xRange.max - xRange.min)) * chartRect.width

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    // 应用水平柱状图动画
    const applyHorizontalAnimation = (
      targetWidth: number, animationType: AnimationType, dataIndex: number, isHovered: boolean
    ): { width: number; opacity: number } => {
      let width = targetWidth
      let opacity = isHovered ? 1 : 0.85

      switch (animationType) {
        case 'rise':
          width = targetWidth * easeOutCubic(animationProgress)
          break
        case 'expand':
          const expandDelay = dataIndex / (totalBars + 2)
          const expandDuration = 1 - expandDelay
          const expandProgress = Math.max(0, Math.min(1, (animationProgress - expandDelay) / expandDuration))
          width = targetWidth * easeOutQuart(expandProgress)
          break
        case 'grow':
          const growDelay = (dataIndex / totalBars) * 0.6
          const growDuration = 1 - growDelay
          const growProgress = Math.max(0, Math.min(1, (animationProgress - growDelay) / growDuration))
          width = targetWidth * easeOutCubic(growProgress)
          break
        case 'fade':
          width = targetWidth
          opacity = (isHovered ? 1 : 0.85) * easeOutCubic(animationProgress)
          break
        case 'none':
          width = targetWidth
          break
      }
      return { width, opacity }
    }

    // 绘制非堆叠系列
    nonStackSeries.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
      const radius = s.borderRadius ?? 4
      const animationType = s.animationType || globalAnimationType

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const y = chartRect.y + barGroupHeight * dataIndex + startOffset + barHeight * seriesIndex
        const isHovered = this.hoverIndex === dataIndex

        // 计算柱子宽度和位置（支持负值）
        const normalizedValue = (numValue - xRange.min) / (xRange.max - xRange.min)
        const barX = chartRect.x + normalizedValue * chartRect.width
        const targetWidth = Math.abs(barX - zeroX)

        const { width: barWidth, opacity } = applyHorizontalAnimation(
          targetWidth, animationType, dataIndex, isHovered
        )

        if (barWidth > 0) {
          const x = numValue >= 0 ? zeroX : zeroX - barWidth
          renderer.drawRect(
            { x, y, width: barWidth, height: barHeight - 2 },
            { fill: color, opacity, radius: numValue >= 0 ? radius : 0 }
          )
        }
      })
    })

    // 绘制堆叠系列
    let stackIndex = nonStackSeries.length
    stackGroups.forEach((stackSeries) => {
      const positiveStack = new Array(totalBars).fill(0)
      const negativeStack = new Array(totalBars).fill(0)

      stackSeries.forEach((s, sIdx) => {
        const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
        const radius = s.borderRadius ?? 4
        const animationType = s.animationType || globalAnimationType

        s.data.forEach((value, dataIndex) => {
          const numValue = getNumericValue(value)
          if (numValue === null) return

          const y = chartRect.y + barGroupHeight * dataIndex + startOffset + barHeight * stackIndex
          const isHovered = this.hoverIndex === dataIndex

          // 计算堆叠位置
          let baseValue: number, targetValue: number
          if (numValue >= 0) {
            baseValue = positiveStack[dataIndex]!
            targetValue = baseValue + numValue
            positiveStack[dataIndex] = targetValue
          } else {
            baseValue = negativeStack[dataIndex]!
            targetValue = baseValue + numValue
            negativeStack[dataIndex] = targetValue
          }

          const baseX = chartRect.x + ((baseValue - xRange.min) / (xRange.max - xRange.min)) * chartRect.width
          const targetX = chartRect.x + ((targetValue - xRange.min) / (xRange.max - xRange.min)) * chartRect.width
          const targetWidth = Math.abs(targetX - baseX)

          const { width: barWidth, opacity } = applyHorizontalAnimation(
            targetWidth, animationType, dataIndex, isHovered
          )

          if (barWidth > 0) {
            const x = numValue >= 0 ? baseX : baseX - barWidth
            const isLast = sIdx === stackSeries.length - 1
            renderer.drawRect(
              { x, y, width: barWidth, height: barHeight - 2 },
              { fill: color, opacity, radius: isLast ? radius : 0 }
            )
          }
        })
      })
      stackIndex++
    })
  }

  private drawLineSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, animationProgress, colors, options } = this
    const globalAnimationType = options.animationType || 'rise'
    const barGroupWidth = horizontal
      ? chartRect.height / Math.max(labels.length, 1)
      : chartRect.width / Math.max(labels.length, 1)
    const baseY = chartRect.y + chartRect.height // 底部基线
    const baseX = chartRect.x // 左侧基线（水平模式用）

    // 缓动函数使动画更流畅
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easedProgress = easeOutCubic(animationProgress)

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

    // 存储每个系列的目标点位置和动画后的点位置
    const seriesPointsMap: Map<number, { x: number; y: number }[]> = new Map()
    const seriesTargetPointsMap: Map<number, { x: number; y: number }[]> = new Map()

    series.forEach((s, seriesIndex) => {
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const animationType = s.animationType || globalAnimationType

      // 计算所有目标点位置（考虑堆叠）
      const targetPoints: { x: number; y: number }[] = []
      const animatedPoints: { x: number; y: number }[] = []

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

        const normalizedValue = (actualValue - yRange.min) / (yRange.max - yRange.min)

        let targetX: number, targetY: number
        if (horizontal) {
          // 水平模式：Y轴显示类目，X轴显示值
          targetX = chartRect.x + chartRect.width * normalizedValue
          targetY = chartRect.y + barGroupWidth * dataIndex + barGroupWidth / 2
        } else {
          // 垂直模式（默认）
          targetX = chartRect.x + barGroupWidth * dataIndex + barGroupWidth / 2
          targetY = chartRect.y + chartRect.height - chartRect.height * normalizedValue
        }
        targetPoints.push({ x: targetX, y: targetY })

        // 根据动画类型计算动画后的点位置
        let animatedX = targetX
        let animatedY = targetY

        switch (animationType) {
          case 'rise':
            // 从底部/左侧升起，使用缓动
            if (horizontal) {
              animatedX = baseX + (targetX - baseX) * easedProgress
            } else {
              animatedY = baseY + (targetY - baseY) * easedProgress
            }
            break
          case 'expand':
            // 展开效果：点位置不变，通过裁剪实现
            break
          case 'grow':
            // 生长效果：根据进度决定显示哪些点
            break
          case 'fade':
            // 淡入效果：点位置不变
            break
          case 'wave':
            // 波浪动画：数据点依次弹起，带有弹性效果
            {
              const pointDelay = dataIndex / Math.max(s.data.length - 1, 1)
              const pointProgress = Math.max(0, (animationProgress - pointDelay * 0.6) / (1 - pointDelay * 0.6))
              // 弹性缓动
              const bounceEase = (t: number) => {
                if (t < 0) return 0
                if (t > 1) return 1
                const c4 = (2 * Math.PI) / 3
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
              }
              const easedPoint = bounceEase(pointProgress)
              if (horizontal) {
                animatedX = baseX + (targetX - baseX) * easedPoint
              } else {
                animatedY = baseY + (targetY - baseY) * easedPoint
              }
            }
            break
          case 'draw':
            // 绘制动画：线条从左到右渐进绘制，点位置不变
            break
          case 'none':
            // 无动画：点位置不变
            break
        }

        animatedPoints.push({ x: animatedX, y: animatedY })
      })

      if (targetPoints.length === 0) return

      seriesTargetPointsMap.set(seriesIndex, targetPoints)
      seriesPointsMap.set(seriesIndex, animatedPoints)
    })

    // 绘制区域填充（从后往前绘制，确保正确的层叠顺序）
    const reversedSeries = [...series].reverse()
    reversedSeries.forEach((s, reversedIndex) => {
      const seriesIndex = series.length - 1 - reversedIndex
      const animationType = s.animationType || globalAnimationType
      const points = seriesPointsMap.get(seriesIndex)
      const targetPoints = seriesTargetPointsMap.get(seriesIndex)
      if (!points || points.length < 2 || !s.areaStyle) return

      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]

      // 根据动画类型计算透明度（使用缓动）
      let opacityMultiplier = 1
      if (animationType === 'fade') {
        opacityMultiplier = easedProgress
      } else if (animationType !== 'none') {
        opacityMultiplier = easedProgress
      }
      const opacity = (typeof s.areaStyle === 'object' ? (s.areaStyle.opacity || 0.3) : 0.3) * opacityMultiplier

      // 根据动画类型选择要绘制的点
      let drawPoints = points
      if (animationType === 'expand' && targetPoints) {
        // 展开效果：使用目标点，通过裁剪实现
        drawPoints = targetPoints
      } else if (animationType === 'grow' && targetPoints) {
        // 生长效果：只绘制部分点（使用缓动）
        const visibleCount = Math.ceil(targetPoints.length * easedProgress)
        drawPoints = targetPoints.slice(0, Math.max(2, visibleCount))
      }

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

      // 使用正确的绘制方法
      const r = renderer as any

      // 展开动画：先设置裁剪区域
      if (animationType === 'expand') {
        renderer.save()
        const clipWidth = horizontal
          ? chartRect.height * animationProgress
          : chartRect.width * animationProgress
        const clipHeight = horizontal
          ? chartRect.width
          : chartRect.height
        if (horizontal) {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: chartRect.width, height: clipWidth })
        } else {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: clipWidth, height: clipHeight })
        }
      }

      const drawBaseY = horizontal ? chartRect.x : baseY

      if (bottomPoints && bottomPoints.length > 0) {
        r.drawStackedArea(drawPoints, bottomPoints, { fill: color, opacity }, s.smooth)
      } else {
        r.drawArea(drawPoints, drawBaseY, color, s.smooth, opacity)
      }

      if (animationType === 'expand') {
        renderer.restore()
      }
    })

    // 绘制线条和数据点
    series.forEach((s, seriesIndex) => {
      const animationType = s.animationType || globalAnimationType
      const points = seriesPointsMap.get(seriesIndex)
      const targetPoints = seriesTargetPointsMap.get(seriesIndex)
      if (!points || points.length < 2) return

      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]

      // 根据动画类型计算线条透明度（使用缓动）
      let lineOpacity = 1
      if (animationType === 'fade') {
        lineOpacity = easedProgress
      } else if (animationType === 'rise') {
        lineOpacity = 0.3 + 0.7 * easedProgress
      } else if (animationType !== 'none') {
        lineOpacity = 0.3 + 0.7 * easedProgress
      }

      // 根据动画类型选择要绘制的点
      let drawPoints = points
      if (animationType === 'expand' && targetPoints) {
        drawPoints = targetPoints
      } else if (animationType === 'grow' && targetPoints) {
        // 生长动画：点一个个出现（阶梯式）
        const visibleCount = Math.ceil(targetPoints.length * easedProgress)
        drawPoints = targetPoints.slice(0, Math.max(2, visibleCount))
      } else if (animationType === 'draw' && targetPoints) {
        // 绘制动画：平滑绘制，支持绘制到两点之间的位置
        const progress = easedProgress * (targetPoints.length - 1)
        const fullPoints = Math.floor(progress)
        const partialProgress = progress - fullPoints

        // 获取完整的点
        drawPoints = targetPoints.slice(0, fullPoints + 1)

        // 如果还有下一个点，插值计算当前绘制位置
        if (fullPoints < targetPoints.length - 1 && partialProgress > 0) {
          const currentPoint = targetPoints[fullPoints]!
          const nextPoint = targetPoints[fullPoints + 1]!
          const interpolatedPoint = {
            x: currentPoint.x + (nextPoint.x - currentPoint.x) * partialProgress,
            y: currentPoint.y + (nextPoint.y - currentPoint.y) * partialProgress
          }
          drawPoints = [...drawPoints, interpolatedPoint]
        }
      } else if (animationType === 'wave') {
        // 波浪动画：使用动画后的点位置
        drawPoints = points
      }

      // 绘制线条
      const lineDash = s.lineStyle?.type === 'dashed' ? [6, 4] :
        s.lineStyle?.type === 'dotted' ? [2, 2] : undefined

      // 展开动画：先设置裁剪区域
      if (animationType === 'expand') {
        renderer.save()
        const clipWidth = horizontal
          ? chartRect.height * animationProgress
          : chartRect.width * animationProgress
        if (horizontal) {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: chartRect.width, height: clipWidth })
        } else {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: clipWidth, height: chartRect.height })
        }
      }

      renderer.drawLine(drawPoints, {
        stroke: color,
        lineWidth: s.lineStyle?.width || 2,
        lineDash,
        opacity: lineOpacity,
      }, s.smooth)

      // draw 动画：绘制"笔尖"发光效果
      if (animationType === 'draw' && drawPoints.length > 0 && animationProgress < 1) {
        const tipPoint = drawPoints[drawPoints.length - 1]!
        // 发光圈
        renderer.drawCircle(
          { x: tipPoint.x, y: tipPoint.y, radius: 8 },
          { fill: color, opacity: 0.3 }
        )
        renderer.drawCircle(
          { x: tipPoint.x, y: tipPoint.y, radius: 4 },
          { fill: color, opacity: 0.8 }
        )
      }

      if (animationType === 'expand') {
        renderer.restore()
      }

      // 绘制数据点
      if (s.showSymbol !== false) {
        let symbolOpacity = 1
        let symbolScale = 1

        if (animationType === 'rise' || animationType === 'expand') {
          // 延迟出现
          if (animationProgress > 0.5) {
            symbolOpacity = (animationProgress - 0.5) * 2
            symbolScale = symbolOpacity
          } else {
            symbolOpacity = 0
          }
        } else if (animationType === 'fade') {
          symbolOpacity = animationProgress
          symbolScale = 1
        } else if (animationType === 'grow' || animationType === 'draw') {
          symbolScale = 1
        } else if (animationType === 'wave') {
          // 波浪动画：数据点跟随弹起
          symbolOpacity = 1
          symbolScale = 1
        }

        if (symbolOpacity > 0) {
          const pointsToDraw = (animationType === 'grow' || animationType === 'draw') ? drawPoints : points
          const symbolType = s.symbol || 'circle'

          // symbol: 'none' 或 showSymbol: false 不绘制数据点
          if (symbolType === 'none') return

          pointsToDraw.forEach((point, idx) => {
            // grow/draw 动画：点依次出现
            if ((animationType === 'grow' || animationType === 'draw') && targetPoints) {
              const pointProgress = (idx / targetPoints.length)
              if (pointProgress > animationProgress) return
            }

            // wave 动画：点依次弹起时显示
            if (animationType === 'wave' && targetPoints) {
              const pointDelay = idx / Math.max(targetPoints.length - 1, 1)
              const pointProgress = Math.max(0, (animationProgress - pointDelay * 0.6) / (1 - pointDelay * 0.6))
              if (pointProgress < 0.1) return // 还没开始弹起的点不显示
            }

            const size = (s.symbolSize || 4) * symbolScale
            if (size > 0.5) {
              // 根据 symbol 类型绘制不同形状
              if (symbolType === 'rect') {
                renderer.drawRect(
                  { x: point.x - size, y: point.y - size, width: size * 2, height: size * 2 },
                  { fill: color, stroke: colors.background, lineWidth: 1, opacity: symbolOpacity }
                )
              } else if (symbolType === 'triangle') {
                const h = size * 1.8
                renderer.drawPolygon([
                  { x: point.x, y: point.y - h / 2 },
                  { x: point.x - size, y: point.y + h / 2 },
                  { x: point.x + size, y: point.y + h / 2 }
                ], { fill: color, opacity: symbolOpacity })
              } else if (symbolType === 'diamond') {
                renderer.drawPolygon([
                  { x: point.x, y: point.y - size * 1.2 },
                  { x: point.x + size, y: point.y },
                  { x: point.x, y: point.y + size * 1.2 },
                  { x: point.x - size, y: point.y }
                ], { fill: color, opacity: symbolOpacity })
              } else {
                // 默认圆形 - 实心填充
                renderer.drawCircle(
                  { x: point.x, y: point.y, radius: size },
                  { fill: color, stroke: colors.background, lineWidth: 2, opacity: symbolOpacity }
                )
              }
            }
          })
        }
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

  // ============== 饼图绑制 ==============

  private drawPieSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, options, width, height } = this

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBounce = (t: number) => {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }

    series.forEach((s, seriesIndex) => {
      const pieData = s.data as PieDataItem[]
      if (!pieData || pieData.length === 0) return

      // 计算饼图中心和半径
      // 留出标签空间：左右各留 80px，上下各留 40px
      const labelPadding = { left: 80, right: 80, top: 40, bottom: 40 }
      const availableWidth = width - labelPadding.left - labelPadding.right
      const availableHeight = height - labelPadding.top - labelPadding.bottom
      const centerX = labelPadding.left + availableWidth / 2
      const centerY = labelPadding.top + availableHeight / 2
      const maxRadius = Math.min(availableWidth, availableHeight) / 2 * 0.85

      // 解析半径配置
      let innerRadius = 0
      let outerRadius = maxRadius
      if (s.radius !== undefined) {
        if (Array.isArray(s.radius)) {
          innerRadius = s.radius[0] * maxRadius
          outerRadius = s.radius[1] * maxRadius
        } else {
          outerRadius = s.radius * maxRadius
        }
      }

      // 计算总值
      const total = pieData.reduce((sum, item) => sum + item.value, 0)
      if (total === 0) return

      // 动画类型
      const pieAnimationType = s.pieAnimationType || 'expand'
      const easedProgress = easeOutCubic(animationProgress)

      // 起始角度和总角度
      const baseStartAngle = s.startAngle ?? -Math.PI / 2
      const sweepAngle = s.sweepAngle ?? Math.PI * 2  // 默认完整圆，Math.PI 为半圆
      let startAngle = baseStartAngle

      pieData.forEach((item, i) => {
        const fullSliceAngle = (item.value / total) * sweepAngle
        const isHover = i === this.hoverIndex
        const color = item.color || s.color || SERIES_COLORS[(seriesIndex * pieData.length + i) % SERIES_COLORS.length]

        // 根据动画类型计算参数
        let sliceAngle = fullSliceAngle
        let opacity = 1
        let radiusScale = 1

        switch (pieAnimationType) {
          case 'expand':
            sliceAngle = fullSliceAngle * easedProgress
            break
          case 'scale':
            sliceAngle = fullSliceAngle
            radiusScale = easedProgress
            break
          case 'fade':
            sliceAngle = fullSliceAngle
            opacity = easedProgress
            break
          case 'bounce':
            sliceAngle = fullSliceAngle
            radiusScale = easeOutBounce(animationProgress)
            break
          case 'none':
            sliceAngle = fullSliceAngle
            break
        }

        const endAngle = startAngle + sliceAngle

        // 悬停时扇形外移（带平滑动画效果）
        let cx = centerX, cy = centerY
        let hoverOffset = 0
        if (isHover) {
          hoverOffset = 10  // hover 时偏移距离
        }
        const midAngleForOffset = startAngle + fullSliceAngle / 2
        cx += Math.cos(midAngleForOffset) * hoverOffset
        cy += Math.sin(midAngleForOffset) * hoverOffset

        // 南丁格尔玫瑰图
        let finalOuterRadius = outerRadius * radiusScale
        let finalInnerRadius = innerRadius * radiusScale
        if (s.roseType) {
          const maxVal = Math.max(...pieData.map(d => d.value))
          finalOuterRadius = (innerRadius + (outerRadius - innerRadius) * (item.value / maxVal)) * radiusScale
        }

        // 绘制扇形
        const fillColor = isHover && color ? this.lightenColor(color) : color
        renderer.drawSector(
          cx, cy,
          finalInnerRadius,
          finalOuterRadius,
          startAngle,
          endAngle,
          { fill: fillColor, opacity }
        )

        // 标签和引导线（带动画效果，hover 时跟随扇形移动）
        if (s.label?.show !== false && animationProgress > 0.6) {
          // 标签动画进度（从0.6开始到1结束）
          const labelProgress = Math.min(1, (animationProgress - 0.6) / 0.4)
          const labelOpacity = easeOutCubic(labelProgress)

          // 使用当前扇形的中心角度
          const midAngle = startAngle + fullSliceAngle / 2
          const percent = ((item.value / total) * 100).toFixed(1)
          const labelText = `${item.name}: ${percent}%`

          // 玫瑰图使用实际的外半径，普通饼图使用固定外半径
          const actualOuterRadius = s.roseType ? finalOuterRadius : outerRadius

          // 标签中心点跟随 hover 偏移
          const labelCenterX = cx
          const labelCenterY = cy

          if (s.label?.position === 'inside') {
            const labelRadius = actualOuterRadius * 0.6
            const lx = labelCenterX + Math.cos(midAngle) * labelRadius
            const ly = labelCenterY + Math.sin(midAngle) * labelRadius
            renderer.drawText(
              { x: lx, y: ly, text: item.name },
              { fill: '#fff', fontSize: 11, textAlign: 'center', textBaseline: 'middle', opacity: labelOpacity }
            )
          } else {
            // 外部标签 + 引导线（跟随 hover 偏移）
            const direction = Math.cos(midAngle) >= 0 ? 1 : -1
            const length1 = 15
            const length2 = 25

            // 引导线起点（扇形边缘，跟随偏移）
            const lineStartX = labelCenterX + Math.cos(midAngle) * actualOuterRadius
            const lineStartY = labelCenterY + Math.sin(midAngle) * actualOuterRadius

            // 引导线中点（带动画，跟随偏移）
            const animatedLength1 = length1 * labelProgress
            const lineMidX = labelCenterX + Math.cos(midAngle) * (actualOuterRadius + animatedLength1)
            const lineMidY = labelCenterY + Math.sin(midAngle) * (actualOuterRadius + animatedLength1)

            // 引导线终点（水平延伸，带动画）
            const animatedLength2 = length2 * labelProgress
            const lineEndX = lineMidX + direction * animatedLength2
            const lineEndY = lineMidY

            // 绘制引导线
            const lineColor = options.theme === 'dark' ? '#94a3b8' : '#64748b'
            renderer.drawLine(
              [
                { x: lineStartX, y: lineStartY },
                { x: lineMidX, y: lineMidY },
                { x: lineEndX, y: lineEndY },
              ],
              { stroke: lineColor, lineWidth: 1, opacity: labelOpacity }
            )

            // 绘制标签文本（动画完成后显示）
            if (labelProgress > 0.5) {
              const textOpacity = (labelProgress - 0.5) * 2
              renderer.drawText(
                { x: lineEndX + direction * 4, y: lineEndY, text: labelText },
                {
                  fill: options.theme === 'dark' ? '#e2e8f0' : '#1e293b',
                  fontSize: 11,
                  textAlign: direction > 0 ? 'left' : 'right',
                  textBaseline: 'middle',
                  opacity: textOpacity
                }
              )
            }
          }
        }

        // 更新起始角度（始终使用完整角度，动画只影响绘制的扇形大小）
        startAngle += fullSliceAngle
      })
    })
  }

  private lightenColor(hex: string): string {
    if (!hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // ============== 辅助绑制方法 ==============

  private drawHoverLine(labels: string[]): void {
    if (this.hoverIndex < 0) return

    const { chartRect, options, renderer } = this
    const { horizontal } = options
    const series = options.series || []

    // 检测图表类型
    const hasBarSeries = series.some(s => s.type === 'bar')
    const hasLineSeries = series.some(s => s.type === 'line')

    // 背景色（用于柱状图）
    const hoverBgColor = options.theme === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)'

    // 指示线颜色（用于折线图）
    const hoverLineColor = options.theme === 'dark'
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(0, 0, 0, 0.2)'

    if (horizontal) {
      const barGroupHeight = chartRect.height / Math.max(labels.length, 1)
      const hoverY = chartRect.y + barGroupHeight * this.hoverIndex + barGroupHeight / 2

      // 柱状图：绘制背景
      if (hasBarSeries) {
        renderer.drawRect(
          { x: chartRect.x, y: chartRect.y + barGroupHeight * this.hoverIndex, width: chartRect.width, height: barGroupHeight },
          { fill: hoverBgColor }
        )
      }

      // 折线图：绘制水平指示线
      if (hasLineSeries) {
        renderer.drawLine(
          [{ x: chartRect.x, y: hoverY }, { x: chartRect.x + chartRect.width, y: hoverY }],
          { stroke: hoverLineColor, lineWidth: 1, lineDash: [4, 4] }
        )
      }
    } else {
      const barGroupWidth = chartRect.width / Math.max(labels.length, 1)
      const hoverX = chartRect.x + barGroupWidth * this.hoverIndex + barGroupWidth / 2

      // 柱状图：绘制背景
      if (hasBarSeries) {
        renderer.drawRect(
          { x: chartRect.x + barGroupWidth * this.hoverIndex, y: chartRect.y, width: barGroupWidth, height: chartRect.height },
          { fill: hoverBgColor }
        )
      }

      // 折线图：绘制垂直指示线
      if (hasLineSeries) {
        renderer.drawLine(
          [{ x: hoverX, y: chartRect.y }, { x: hoverX, y: chartRect.y + chartRect.height }],
          { stroke: hoverLineColor, lineWidth: 1, lineDash: [4, 4] }
        )
      }
    }
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

    // 检查是否有饼图系列
    const pieSeries = (this.options.series || []).filter(s => s.type === 'pie')
    if (pieSeries.length > 0) {
      this.handlePieMouseMove(x, y, e)
      return
    }

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

  private handlePieMouseMove(x: number, y: number, e: MouseEvent): void {
    const pieSeries = (this.options.series || []).filter(s => s.type === 'pie')
    if (pieSeries.length === 0) return

    const s = pieSeries[0]!
    const pieData = s.data as PieDataItem[]
    if (!pieData || pieData.length === 0) return

    // 计算饼图中心和半径（与绑制时一致）
    const labelPadding = { left: 80, right: 80, top: 40, bottom: 40 }
    const availableWidth = this.width - labelPadding.left - labelPadding.right
    const availableHeight = this.height - labelPadding.top - labelPadding.bottom
    const centerX = labelPadding.left + availableWidth / 2
    const centerY = labelPadding.top + availableHeight / 2
    const maxRadius = Math.min(availableWidth, availableHeight) / 2 * 0.85

    let outerRadius = maxRadius
    let innerRadius = 0
    if (s.radius !== undefined) {
      if (Array.isArray(s.radius)) {
        innerRadius = s.radius[0] * maxRadius
        outerRadius = s.radius[1] * maxRadius
      } else {
        outerRadius = s.radius * maxRadius
      }
    }

    // 计算鼠标相对于圆心的位置
    const dx = x - centerX
    const dy = y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    let angle = Math.atan2(dy, dx)

    // 检查是否在饼图范围内
    if (dist < innerRadius || dist > outerRadius) {
      if (this.hoverIndex !== -1) {
        this.hoverIndex = -1
        this.hideTooltip()
        this.render()
      }
      return
    }

    // 计算总值和起始角度
    const total = pieData.reduce((sum, item) => sum + item.value, 0)
    const baseStartAngle = s.startAngle ?? -Math.PI / 2

    // 将角度调整到与饼图起始角度一致
    if (angle < baseStartAngle) {
      angle += Math.PI * 2
    }

    // 找到鼠标所在的扇形
    let startAngle = baseStartAngle
    let found = -1
    for (let i = 0; i < pieData.length; i++) {
      const sliceAngle = (pieData[i]!.value / total) * Math.PI * 2
      const endAngle = startAngle + sliceAngle

      let checkAngle = angle
      if (checkAngle < startAngle) checkAngle += Math.PI * 2

      if (checkAngle >= startAngle && checkAngle < endAngle) {
        found = i
        break
      }
      startAngle = endAngle
    }

    if (found !== this.hoverIndex) {
      this.hoverIndex = found
      this.render()
      if (found >= 0) {
        this.showPieTooltip(e, pieData[found]!, total)
      } else {
        this.hideTooltip()
      }
    }
  }

  private showPieTooltip(e: MouseEvent, item: PieDataItem, total: number): void {
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

    const percent = ((item.value / total) * 100).toFixed(1)
    this.tooltipEl.innerHTML = `
      <div style="font-weight:bold;margin-bottom:4px">${item.name}</div>
      <div>数值: ${item.value}</div>
      <div>占比: ${percent}%</div>
    `
    this.tooltipEl.style.left = `${e.clientX + 10}px`
    this.tooltipEl.style.top = `${e.clientY + 10}px`
    this.tooltipEl.style.display = 'block'
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
