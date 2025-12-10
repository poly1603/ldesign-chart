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
export type SeriesType = 'line' | 'bar' | 'scatter' | 'pie' | 'candlestick'

/** 动画类型 */
export type AnimationType =
  | 'none'      // 无动画
  | 'rise'      // 从下往上升起（默认）
  | 'expand'    // 从左到右展开（揭示效果）
  | 'grow'      // 点依次出现（生长效果）
  | 'fade'      // 淡入
  | 'wave'      // 波浪动画 - 数据点依次弹起（折线图专用）
  | 'draw'      // 绘制动画 - 线条渐进绘制（折线图专用）
  | 'cascade'   // 级联动画 - 柱子依次升起（柱状图专用）
  | 'elasticIn' // 弹性进入 - 带回弹效果（柱状图专用）
  | 'none'      // 无动画

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
  /** 禁用悬停高亮效果 */
  noHover?: boolean
}

/** 饼图动画类型 */
export type PieAnimationType =
  | 'expand'   // 扇形展开（默认）
  | 'scale'    // 整体缩放
  | 'fade'     // 淡入
  | 'bounce'   // 回弹缩放
  | 'spin'     // 旋转进入
  | 'cascade'  // 扇形依次展开
  | 'fan'      // 扇形依次弹出（带弹性）
  | 'none'     // 无动画

/** 散点图动画类型 */
export type ScatterAnimationType =
  | 'scale'    // 缩放出现（默认）
  | 'fade'     // 淡入
  | 'rise'     // 从下方升起
  | 'ripple'   // 涟漪效果
  | 'cascade'  // 级联出现
  | 'none'     // 无动画

/** 散点形状 */
export type SymbolType = 'circle' | 'rect' | 'triangle' | 'diamond' | 'pin' | 'arrow'

/** K线图数据点 [open, close, low, high] 或 { open, close, low, high, volume? } */
export type CandlestickDataPoint =
  | [number, number, number, number]  // [open, close, low, high]
  | { open: number; close: number; low: number; high: number; volume?: number }

/** K线图动画类型 */
export type CandlestickAnimationType =
  | 'grow'      // 蜡烛从中间向上下生长（默认）
  | 'rise'      // 从底部升起
  | 'fade'      // 淡入
  | 'cascade'   // 从左到右依次出现
  | 'none'      // 无动画

/** 通用系列数据 */
export interface SeriesData {
  type: SeriesType
  name?: string
  /** 数据数组：折线/柱状图用 number[], 散点图用 [x,y][], 饼图用 PieDataItem[], K线图用 CandlestickDataPoint[] */
  data: (number | null)[] | ScatterDataPoint[] | PieDataItem[] | CandlestickDataPoint[]
  color?: string

  // 折线图特有
  smooth?: boolean
  step?: false | 'start' | 'middle' | 'end'
  areaStyle?: boolean | AreaStyle
  lineStyle?: LineStyle
  symbol?: SymbolType | 'none'
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
  /** 散点图动画类型 */
  scatterAnimationType?: ScatterAnimationType
  /** 起始角度（弧度），默认 -Math.PI/2 (12点钟方向) */
  startAngle?: number
  /** 扇形总角度（弧度），默认 Math.PI*2 (完整圆)，设为 Math.PI 为半圆 */
  sweepAngle?: number
  /** 扇形间隙角度（弧度），默认 0 */
  padAngle?: number
  /** 扇形圆角半径 */
  cornerRadius?: number
  /** 标签配置 */
  label?: { show?: boolean; position?: 'inside' | 'outside' }

  // K线图特有
  /** K线图动画类型 */
  candlestickAnimationType?: CandlestickAnimationType
  /** 上涨颜色（阳线），默认 #ec0000 */
  upColor?: string
  /** 下跌颜色（阴线），默认 #00da3c */
  downColor?: string
  /** 是否显示最高最低价标签 */
  showMinMax?: boolean
  /** 蜡烛宽度 */
  candleWidth?: number | string

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

/** 数据区域缩放配置 */
export interface DataZoomConfig {
  /** 是否显示，默认 false */
  show?: boolean
  /** 类型：slider（滑动条）或 inside（内置，鼠标滚轮/拖拽） */
  type?: 'slider' | 'inside'
  /** 起始百分比 0-100，默认 0 */
  start?: number
  /** 结束百分比 0-100，默认 100 */
  end?: number
  /** 高度（仅 slider 类型），默认 30 */
  height?: number
  /** 背景色 */
  backgroundColor?: string
  /** 选中区域颜色 */
  fillerColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 手柄样式 */
  handleStyle?: { color?: string; borderColor?: string }
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
  /** 数据区域缩放配置 */
  dataZoom?: DataZoomConfig
}

// ============== 辅助函数 ==============

/** 从数据中提取数值（用于折线图/柱状图） */
function getNumericValue(value: number | null | ScatterDataPoint | PieDataItem | CandlestickDataPoint): number | null {
  if (value === null) return null
  if (typeof value === 'number') return value
  // 对于 K线图数组数据 [open, close, low, high]，返回 close 价格
  if (Array.isArray(value) && value.length === 4) return value[1]
  // 对于散点图数据，返回 y 值
  if (Array.isArray(value)) return value[1]
  // 对于饼图数据，返回 value
  if ('value' in value && 'name' in value) return (value as PieDataItem).value
  // 对于 K线图对象数据，返回 close 价格
  if ('open' in value && 'close' in value) return (value as { open: number; close: number }).close
  return (value as { y: number }).y
}

// ============== Chart 类 ==============

export class Chart extends BaseChart<ChartOptions> {
  private hoverIndex = -1
  private hoverSeriesIndex = -1  // 用于嵌套饼图
  private hoverOffsets: Map<string, number> = new Map()  // 存储每个扇形的当前偏移量
  private hoverAnimationFrame: number | null = null
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null

  // DataZoom 状态
  private dataZoomStart = 0      // 起始百分比 0-100
  private dataZoomEnd = 100      // 结束百分比 0-100
  private dataZoomDragging: 'left' | 'right' | 'middle' | null = null
  private dataZoomDragStartX = 0
  private dataZoomDragStartValues = { start: 0, end: 100 }

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

    // 初始化 DataZoom
    if (defaultOptions.dataZoom) {
      this.dataZoomStart = defaultOptions.dataZoom.start ?? 0
      this.dataZoomEnd = defaultOptions.dataZoom.end ?? 100
    }

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

    // DataZoom 占用底部空间
    const dataZoomHeight = this.options.dataZoom?.show ? (this.options.dataZoom.height ?? 30) + 10 : 0

    return {
      top: p.top ?? 40,
      right: p.right ?? 20,
      bottom: (p.bottom ?? 40) + dataZoomHeight,
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

    let enabledSeries = (options.series || []).filter(s => this.enabledSeries.has(s.name || ''))

    // 按类型分组系列
    const barSeries = enabledSeries.filter(s => s.type === 'bar')
    const lineSeries = enabledSeries.filter(s => s.type === 'line')
    const scatterSeries = enabledSeries.filter(s => s.type === 'scatter')
    const pieSeries = enabledSeries.filter(s => s.type === 'pie')
    const candlestickSeries = enabledSeries.filter(s => s.type === 'candlestick')

    // 判断是否只有饼图（饼图不需要坐标轴和网格）
    const isPieOnly = pieSeries.length > 0 && barSeries.length === 0 && lineSeries.length === 0 && scatterSeries.length === 0 && candlestickSeries.length === 0

    // 绘制背景
    this.drawBackground()

    if (isPieOnly) {
      // 纯饼图模式：只绘制饼图
      this.drawPieSeries(pieSeries)
    } else {
      // 获取轴配置
      const xAxisConfig = this.getAxisConfig(options.xAxis, 0)
      const yAxisConfigs = this.getAxisConfigs(options.yAxis)
      let labels = xAxisConfig.data || []

      // DataZoom 数据过滤
      const hasDataZoom = options.dataZoom?.show
      let zoomedSeries = enabledSeries
      let zoomedLabels = labels

      if (hasDataZoom && labels.length > 0) {
        const totalLen = labels.length
        const startIdx = Math.floor(totalLen * this.dataZoomStart / 100)
        const endIdx = Math.ceil(totalLen * this.dataZoomEnd / 100)

        zoomedLabels = labels.slice(startIdx, endIdx)
        zoomedSeries = enabledSeries.map(s => ({
          ...s,
          data: (s.data as any[]).slice(startIdx, endIdx)
        }))
      }

      // 计算 Y 轴范围（使用缩放后的数据）
      const yRanges = this.calculateYRanges(zoomedSeries, yAxisConfigs)

      // 绘制网格
      if (options.grid?.show !== false) {
        this.drawGrid(5)
      }

      // 绘制坐标轴（使用缩放后的标签）
      this.drawXAxis(zoomedLabels, xAxisConfig, yRanges, horizontal)
      this.drawYAxis(yRanges, yAxisConfigs, zoomedLabels, horizontal)

      // 过滤缩放后的系列数据
      const zoomedBar = zoomedSeries.filter(s => s.type === 'bar')
      const zoomedLine = zoomedSeries.filter(s => s.type === 'line')
      const zoomedScatter = zoomedSeries.filter(s => s.type === 'scatter')
      const zoomedCandlestick = zoomedSeries.filter(s => s.type === 'candlestick')

      // 绘制各类型系列（使用缩放后的数据）
      if (zoomedCandlestick.length > 0) {
        this.drawCandlestickSeries(zoomedCandlestick, yRanges, zoomedLabels)
      }
      if (zoomedBar.length > 0) {
        this.drawBarSeries(zoomedBar, yRanges, zoomedLabels, horizontal)
      }
      if (zoomedLine.length > 0) {
        this.drawLineSeries(zoomedLine, yRanges, zoomedLabels, horizontal)
      }
      if (zoomedScatter.length > 0) {
        this.drawScatterSeries(zoomedScatter, yRanges, zoomedLabels)
      }

      // 绘制悬停参考线
      this.drawHoverLine(zoomedLabels)

      // 绘制 DataZoom 滑块
      if (hasDataZoom) {
        this.drawDataZoom(labels, enabledSeries)
      }
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
    if (typeof interval === 'number') {
      labelInterval = interval
    } else {
      // 自动计算：根据标签实际宽度和可用空间
      const maxLabelLen = Math.max(...labels.map(l => l.length))
      const estimatedLabelWidth = Math.max(maxLabelLen * 8, 50) // 每字符约8px
      const availablePerLabel = chartRect.width / labels.length

      if (availablePerLabel < estimatedLabelWidth) {
        labelInterval = Math.ceil(estimatedLabelWidth / availablePerLabel)
      }

      // 数据量大时强制更大间隔
      if (labels.length > 20 && labelInterval < 2) labelInterval = 2
      if (labels.length > 40 && labelInterval < 3) labelInterval = 3
    }

    const displayLabels = inverse ? [...labels].reverse() : labels

    displayLabels.forEach((label, i) => {
      // 只显示间隔的标签
      if (i % labelInterval !== 0) return

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

    // 弹性缓动函数
    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t
      const c4 = (2 * Math.PI) / 3
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }

    // 回弹缓动
    const easeOutBounce = (t: number) => {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }

    switch (animationType) {
      case 'rise':
        // 整体同时从底部升起
        height = targetHeight * easeOutCubic(progress)
        break
      case 'expand':
        // 从中间向两边展开（宽度动画，但这里用高度模拟视觉效果）
        // 中间的柱子先出现，两边的后出现
        const centerIndex = (totalBars - 1) / 2
        const distanceFromCenter = Math.abs(dataIndex - centerIndex) / centerIndex
        const expandDelay = distanceFromCenter * 0.5
        const expandProgress = Math.max(0, Math.min(1, (progress - expandDelay) / (1 - expandDelay)))
        height = targetHeight * easeOutQuart(expandProgress)
        if (expandProgress <= 0) opacity = 0
        break
      case 'grow':
        // 从小到大生长，带轻微回弹
        const growProgress = easeOutBounce(progress)
        height = targetHeight * growProgress
        break
      case 'cascade':
        // 级联瀑布：柱子像多米诺骨牌一样快速依次倒下（升起）
        const cascadeDelay = (dataIndex / totalBars) * 0.85
        const cascadeDuration = 0.2  // 每个柱子升起很快
        const cascadeProgress = Math.max(0, Math.min(1, (progress - cascadeDelay) / cascadeDuration))
        height = targetHeight * easeOutQuart(cascadeProgress)
        if (cascadeProgress <= 0) opacity = 0
        break
      case 'elasticIn':
        // 弹性动画：柱子超过目标高度后回弹
        const elasticDelay = (dataIndex / totalBars) * 0.4
        const elasticDuration = 0.7
        const elasticProgress = Math.max(0, Math.min(1, (progress - elasticDelay) / elasticDuration))
        height = targetHeight * easeOutElastic(elasticProgress)
        if (elasticProgress <= 0) opacity = 0
        break
      case 'fade':
        // 淡入：高度直接到位，透明度渐变
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

    // 弹性缓动函数
    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t
      const c4 = (2 * Math.PI) / 3
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }

    // 回弹缓动
    const easeOutBounce = (t: number) => {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }

    switch (animationType) {
      case 'rise':
        // 从底部升起，每层依次
        height = targetHeight * easeOutCubic(layerProgress)
        break
      case 'expand':
        // 从中间向两边展开
        const centerIndex = (totalBars - 1) / 2
        const distanceFromCenter = Math.abs(dataIndex - centerIndex) / Math.max(centerIndex, 1)
        const expandDelay = distanceFromCenter * 0.4
        const expandProgress = Math.max(0, Math.min(1, (layerProgress - expandDelay) / (1 - expandDelay)))
        height = targetHeight * easeOutQuart(expandProgress)
        if (expandProgress <= 0) opacity = 0
        break
      case 'grow':
        // 带回弹的生长
        height = targetHeight * easeOutBounce(layerProgress)
        break
      case 'cascade':
        // 级联瀑布
        const cascadeDelay = (dataIndex / totalBars) * 0.7
        const cascadeDuration = 0.25
        const cascadeProgress = Math.max(0, Math.min(1, (layerProgress - cascadeDelay) / cascadeDuration))
        height = targetHeight * easeOutQuart(cascadeProgress)
        if (cascadeProgress <= 0) opacity = 0
        break
      case 'elasticIn':
        // 弹性动画
        const elasticDelay = (dataIndex / totalBars) * 0.3
        const elasticDuration = 0.8
        const elasticProgress = Math.max(0, Math.min(1, (layerProgress - elasticDelay) / elasticDuration))
        height = targetHeight * easeOutElastic(elasticProgress)
        if (elasticProgress <= 0) opacity = 0
        break
      case 'fade':
        // 淡入效果
        height = targetHeight
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
    const { renderer, chartRect, colors, animationProgress } = this
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t: number) => {
      const c1 = 1.70158
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }
    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
    }

    series.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const baseRadius = s.symbolSize || 8
      const symbol: SymbolType = (s.symbol as SymbolType) || 'circle'
      const animType = s.scatterAnimationType || 'scale'

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const x = chartRect.x + barGroupWidth * dataIndex + barGroupWidth / 2
        const normalizedValue = (numValue - yRange.min) / (yRange.max - yRange.min)
        const targetY = chartRect.y + chartRect.height - chartRect.height * normalizedValue

        // 根据动画类型计算进度
        const delay = animType === 'cascade' ? dataIndex / (s.data.length + 3) : dataIndex / (s.data.length + 8)
        const progress = Math.max(0, Math.min(1, (animationProgress - delay) / (1 - delay * 0.5)))

        let y = targetY
        let scale = 1
        let opacity = 1

        switch (animType) {
          case 'scale':
            scale = easeOutBack(progress)
            opacity = easeOutCubic(progress)
            break
          case 'fade':
            opacity = easeOutCubic(progress)
            break
          case 'rise':
            y = chartRect.y + chartRect.height - (chartRect.y + chartRect.height - targetY) * easeOutBack(progress)
            opacity = easeOutCubic(progress)
            break
          case 'ripple':
            scale = easeOutElastic(progress)
            opacity = easeOutCubic(progress)
            break
          case 'cascade':
            scale = easeOutBack(progress)
            opacity = progress > 0 ? 1 : 0
            break
          case 'none':
            break
        }

        const radius = baseRadius * scale

        // Hover 效果（平滑过渡）
        const isHover = dataIndex === this.hoverIndex
        const hoverKey = `scatter-${seriesIndex}-${dataIndex}`
        const targetScale = isHover ? 1.4 : 1
        const currentScale = this.hoverOffsets.get(hoverKey) ?? 1
        const scaleDiff = targetScale - currentScale
        const newScale = Math.abs(scaleDiff) < 0.02 ? targetScale : currentScale + scaleDiff * 0.1
        this.hoverOffsets.set(hoverKey, newScale)

        if (Math.abs(scaleDiff) > 0.02) {
          this.scheduleHoverAnimation()
        }

        const finalRadius = radius * newScale
        const fillColor = isHover && color ? this.lightenColor(color) : color

        if (radius > 0.5 && opacity > 0) {
          this.drawSymbol(renderer, x, y, finalRadius, symbol, fillColor, colors.background, opacity)
        }
      })
    })
  }

  // ============== DataZoom 绑制 ==============

  private drawDataZoom(labels: string[], series: SeriesData[]): void {
    const { renderer, chartRect, colors, options, height } = this
    const config = options.dataZoom
    if (!config?.show) return

    const zoomHeight = config.height ?? 30
    const padding = this.getPadding()

    // DataZoom 区域位置（在图表下方）
    const zoomRect = {
      x: chartRect.x,
      y: height - padding.bottom + 45,
      width: chartRect.width,
      height: zoomHeight
    }

    // 背景
    const bgColor = config.backgroundColor || (colors.background === '#ffffff' ? '#f5f5f5' : '#2a2a2a')
    renderer.drawRect(zoomRect, { fill: bgColor, stroke: colors.grid, lineWidth: 1 })

    // 绘制缩略数据预览（小型折线图）
    if (series.length > 0 && labels.length > 0) {
      const firstSeries = series.find(s => s.type === 'line' || s.type === 'bar' || s.type === 'candlestick')
      if (firstSeries) {
        const data = firstSeries.data as any[]
        const values = data.map((d) => {
          if (d === null) return null
          if (typeof d === 'number') return d
          if (Array.isArray(d) && d.length === 4) return d[1]
          if (Array.isArray(d) && d.length === 2) return d[1]
          return d.value ?? d.close ?? d.y ?? 0
        }).filter(v => v !== null) as number[]

        if (values.length > 1) {
          const minVal = Math.min(...values)
          const maxVal = Math.max(...values)
          const range = maxVal - minVal || 1

          // 绘制预览线段
          const points: { x: number; y: number }[] = values.map((v, i) => ({
            x: zoomRect.x + (i / (values.length - 1)) * zoomRect.width,
            y: zoomRect.y + zoomRect.height - ((v - minVal) / range) * (zoomRect.height - 4) - 2
          }))

          renderer.drawLine(points, { stroke: colors.textSecondary, lineWidth: 1 })
        }
      }
    }

    // 选中区域
    const fillerColor = config.fillerColor || (colors.background === '#ffffff' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)')
    const startX = zoomRect.x + (this.dataZoomStart / 100) * zoomRect.width
    const endX = zoomRect.x + (this.dataZoomEnd / 100) * zoomRect.width
    const selectedWidth = endX - startX

    renderer.drawRect(
      { x: startX, y: zoomRect.y, width: selectedWidth, height: zoomRect.height },
      { fill: fillerColor }
    )

    // 边框线
    const borderColor = config.borderColor || '#3b82f6'
    renderer.drawRect(
      { x: startX, y: zoomRect.y, width: selectedWidth, height: zoomRect.height },
      { fill: 'transparent', stroke: borderColor, lineWidth: 1 }
    )

    // 左右手柄
    const handleColor = config.handleStyle?.color || '#3b82f6'
    const handleWidth = 8
    const handleHeight = zoomRect.height - 4

    // 左手柄
    renderer.drawRect(
      { x: startX - handleWidth / 2, y: zoomRect.y + 2, width: handleWidth, height: handleHeight },
      { fill: handleColor, stroke: '#fff', lineWidth: 1 }
    )

    // 右手柄
    renderer.drawRect(
      { x: endX - handleWidth / 2, y: zoomRect.y + 2, width: handleWidth, height: handleHeight },
      { fill: handleColor, stroke: '#fff', lineWidth: 1 }
    )
  }

  // 获取 DataZoom 区域
  private getDataZoomRect(): { x: number; y: number; width: number; height: number } | null {
    const { options, chartRect, height } = this
    const config = options.dataZoom
    if (!config?.show) return null

    const zoomHeight = config.height ?? 30
    const padding = this.getPadding()

    return {
      x: chartRect.x,
      y: height - padding.bottom + 45,
      width: chartRect.width,
      height: zoomHeight
    }
  }

  // 处理 DataZoom 鼠标事件
  private handleDataZoomMouseDown(e: MouseEvent): boolean {
    const zoomRect = this.getDataZoomRect()
    if (!zoomRect) return false

    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 检查是否在 DataZoom 区域内
    if (y < zoomRect.y || y > zoomRect.y + zoomRect.height) return false
    if (x < zoomRect.x || x > zoomRect.x + zoomRect.width) return false

    const startX = zoomRect.x + (this.dataZoomStart / 100) * zoomRect.width
    const endX = zoomRect.x + (this.dataZoomEnd / 100) * zoomRect.width
    const handleWidth = 12

    this.dataZoomDragStartX = x
    this.dataZoomDragStartValues = { start: this.dataZoomStart, end: this.dataZoomEnd }

    // 判断拖拽类型
    if (Math.abs(x - startX) < handleWidth) {
      this.dataZoomDragging = 'left'
    } else if (Math.abs(x - endX) < handleWidth) {
      this.dataZoomDragging = 'right'
    } else if (x > startX && x < endX) {
      this.dataZoomDragging = 'middle'
    } else {
      return false
    }

    return true
  }

  private handleDataZoomMouseMove(e: MouseEvent): void {
    if (!this.dataZoomDragging) return

    const zoomRect = this.getDataZoomRect()
    if (!zoomRect) return

    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const deltaX = x - this.dataZoomDragStartX
    const deltaPercent = (deltaX / zoomRect.width) * 100

    const { start: origStart, end: origEnd } = this.dataZoomDragStartValues
    let newStart = this.dataZoomStart
    let newEnd = this.dataZoomEnd

    switch (this.dataZoomDragging) {
      case 'left':
        newStart = Math.max(0, Math.min(origEnd - 5, origStart + deltaPercent))
        break
      case 'right':
        newEnd = Math.min(100, Math.max(origStart + 5, origEnd + deltaPercent))
        break
      case 'middle':
        const range = origEnd - origStart
        newStart = Math.max(0, Math.min(100 - range, origStart + deltaPercent))
        newEnd = newStart + range
        break
    }

    if (newStart !== this.dataZoomStart || newEnd !== this.dataZoomEnd) {
      this.dataZoomStart = newStart
      this.dataZoomEnd = newEnd
      this.render()
    }
  }

  private handleDataZoomMouseUp(): void {
    this.dataZoomDragging = null
  }

  // 绘制不同形状的散点（支持 Canvas 和 SVG）
  private drawSymbol(
    renderer: any, x: number, y: number, size: number,
    symbol: SymbolType, fill: string | undefined, stroke: string, opacity: number
  ): void {
    const fillColor = fill || '#999'
    const style = { fill: fillColor, stroke, lineWidth: 2, opacity }

    switch (symbol) {
      case 'circle':
        renderer.drawCircle({ x, y, radius: size }, style)
        break
      case 'rect':
        renderer.drawRect({ x: x - size, y: y - size, width: size * 2, height: size * 2 }, style)
        break
      case 'diamond':
        renderer.drawPolygon([
          { x, y: y - size * 1.2 },
          { x: x + size, y },
          { x, y: y + size * 1.2 },
          { x: x - size, y }
        ], style)
        break
      case 'triangle':
        renderer.drawPolygon([
          { x, y: y - size * 1.1 },
          { x: x + size, y: y + size * 0.8 },
          { x: x - size, y: y + size * 0.8 }
        ], style)
        break
      case 'pin':
        // 绘制圆形头部
        renderer.drawCircle({ x, y: y - size * 0.5, radius: size * 0.7 }, style)
        // 绘制三角形尾部
        renderer.drawPolygon([
          { x, y: y + size * 0.2 },
          { x: x - size * 0.4, y: y + size },
          { x: x + size * 0.4, y: y + size }
        ], style)
        break
      case 'arrow':
        renderer.drawPolygon([
          { x, y: y - size * 1.2 },
          { x: x + size * 0.7, y: y + size * 0.3 },
          { x, y: y - size * 0.2 },
          { x: x - size * 0.7, y: y + size * 0.3 }
        ], style)
        break
    }
  }

  // ============== K线图绑制 ==============

  private drawCandlestickSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[]
  ): void {
    const { renderer, chartRect, animationProgress } = this
    const candleGroupWidth = chartRect.width / Math.max(labels.length, 1)

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t: number) => {
      const c1 = 1.70158
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }

    series.forEach((s) => {
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const animType = s.candlestickAnimationType || 'grow'
      const upColor = s.upColor || '#ec0000'     // 上涨颜色（红色）
      const downColor = s.downColor || '#00da3c' // 下跌颜色（绿色）

      // 计算蜡烛宽度
      let candleWidth: number
      if (typeof s.candleWidth === 'number') {
        candleWidth = s.candleWidth
      } else if (typeof s.candleWidth === 'string' && s.candleWidth.endsWith('%')) {
        candleWidth = candleGroupWidth * parseFloat(s.candleWidth) / 100
      } else {
        candleWidth = Math.min(candleGroupWidth * 0.6, 20)  // 默认60%宽度，最大20px
      }

      const data = s.data as CandlestickDataPoint[]

      data.forEach((item, dataIndex) => {
        if (!item) return

        // 解析数据
        let open: number, close: number, low: number, high: number
        if (Array.isArray(item)) {
          [open, close, low, high] = item
        } else {
          open = item.open
          close = item.close
          low = item.low
          high = item.high
        }

        const isUp = close >= open
        const color = isUp ? upColor : downColor

        // 计算位置
        const x = chartRect.x + candleGroupWidth * dataIndex + candleGroupWidth / 2

        // 计算Y坐标
        const normalizeY = (value: number) => {
          const normalized = (value - yRange.min) / (yRange.max - yRange.min)
          return chartRect.y + chartRect.height - chartRect.height * normalized
        }

        const yOpen = normalizeY(open)
        const yClose = normalizeY(close)
        const yLow = normalizeY(low)
        const yHigh = normalizeY(high)

        // 蜡烛体的顶部和底部
        const bodyTop = Math.min(yOpen, yClose)
        const bodyBottom = Math.max(yOpen, yClose)
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1)  // 至少1px

        // 计算动画进度
        let progress = animationProgress
        let opacity = 1

        switch (animType) {
          case 'cascade': {
            // 级联动画：从左到右依次出现
            const delay = dataIndex / data.length * 0.6
            progress = Math.max(0, Math.min(1, (animationProgress - delay) / 0.4))
            progress = easeOutCubic(progress)
            opacity = progress
            break
          }
          case 'fade': {
            // 淡入动画
            opacity = easeOutCubic(animationProgress)
            break
          }
          case 'rise': {
            // 从底部升起
            progress = easeOutCubic(animationProgress)
            break
          }
          case 'grow':
          default: {
            // 从中心向上下生长
            progress = easeOutBack(animationProgress)
            break
          }
        }

        if (opacity <= 0) return

        // 根据动画类型计算实际绘制位置
        let drawBodyTop = bodyTop
        let drawBodyHeight = bodyHeight
        let drawYHigh = yHigh
        let drawYLow = yLow

        if (animType === 'grow') {
          // 从中心向上下生长
          const centerY = (bodyTop + bodyBottom) / 2
          drawBodyTop = centerY - (bodyHeight / 2) * progress
          drawBodyHeight = bodyHeight * progress

          const wickCenter = (yHigh + yLow) / 2
          drawYHigh = wickCenter - (wickCenter - yHigh) * progress
          drawYLow = wickCenter + (yLow - wickCenter) * progress
        } else if (animType === 'rise') {
          // 从底部升起
          const baseY = chartRect.y + chartRect.height
          drawBodyTop = baseY - (baseY - bodyTop) * progress
          drawYHigh = baseY - (baseY - yHigh) * progress
          drawYLow = baseY - (baseY - yLow) * progress
          drawBodyHeight = bodyHeight * progress
        }

        // 绘制上下影线（芯线）
        const wickWidth = 1
        const wickX = x - wickWidth / 2

        // 上影线
        if (drawYHigh < drawBodyTop) {
          renderer.drawRect(
            { x: wickX, y: drawYHigh, width: wickWidth, height: drawBodyTop - drawYHigh },
            { fill: color, opacity }
          )
        }

        // 下影线
        const drawBodyBottom = drawBodyTop + drawBodyHeight
        if (drawYLow > drawBodyBottom) {
          renderer.drawRect(
            { x: wickX, y: drawBodyBottom, width: wickWidth, height: drawYLow - drawBodyBottom },
            { fill: color, opacity }
          )
        }

        // 绘制蜡烛体
        const isHover = this.hoverIndex === dataIndex
        const hoverScale = isHover ? 1.1 : 1
        const finalCandleWidth = candleWidth * hoverScale
        const finalBodyX = x - finalCandleWidth / 2

        if (isUp) {
          // 阳线（上涨）：实心
          renderer.drawRect(
            { x: finalBodyX, y: drawBodyTop, width: finalCandleWidth, height: Math.max(drawBodyHeight, 1) },
            { fill: color, stroke: color, lineWidth: 1, opacity }
          )
        } else {
          // 阴线（下跌）：实心
          renderer.drawRect(
            { x: finalBodyX, y: drawBodyTop, width: finalCandleWidth, height: Math.max(drawBodyHeight, 1) },
            { fill: color, opacity }
          )
        }
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

      // 计算饼图中心和半径 - 根据是否显示标签动态调整
      const showLabel = s.label?.show !== false

      // 动态计算标签空间：有标签时预留空间，无标签时最小化边距
      const basePadding = 15  // 基础边距
      const labelSpace = showLabel ? Math.min(width, height) * 0.18 : 0  // 标签空间为尺寸的18%

      const labelPadding = {
        left: basePadding + labelSpace,
        right: basePadding + labelSpace,
        top: basePadding,
        bottom: basePadding
      }

      const availableWidth = width - labelPadding.left - labelPadding.right
      const availableHeight = height - labelPadding.top - labelPadding.bottom

      // 起始角度和总角度
      const baseStartAngle = s.startAngle ?? -Math.PI / 2
      const sweepAngle = s.sweepAngle ?? Math.PI * 2  // 默认完整圆，Math.PI 为半圆

      // 智能居中：根据扇形范围计算最佳中心点
      let centerX = width / 2
      let centerY = height / 2

      // 对于非完整圆，计算扇形的边界来居中
      if (sweepAngle < Math.PI * 2 - 0.01) {
        const endAngle = baseStartAngle + sweepAngle
        const midAngle = baseStartAngle + sweepAngle / 2

        // 计算扇形在各方向的最大延伸
        const angles = [baseStartAngle, endAngle, midAngle]
        // 添加关键角度点（0, π/2, π, 3π/2）如果在范围内
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
          if ((a >= baseStartAngle && a <= endAngle) ||
            (a + Math.PI * 2 >= baseStartAngle && a + Math.PI * 2 <= endAngle)) {
            angles.push(a)
          }
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        angles.forEach(a => {
          const x = Math.cos(a)
          const y = Math.sin(a)
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        })
        // 包含圆心
        minX = Math.min(minX, 0)
        maxX = Math.max(maxX, 0)
        minY = Math.min(minY, 0)
        maxY = Math.max(maxY, 0)

        // 根据扇形边界调整中心点
        const rangeX = maxX - minX
        const rangeY = maxY - minY
        const offsetX = -(minX + maxX) / 2
        const offsetY = -(minY + maxY) / 2

        // 计算适合扇形的最大半径
        const scaleX = rangeX > 0 ? availableWidth / rangeX : availableWidth
        const scaleY = rangeY > 0 ? availableHeight / rangeY : availableHeight
        const maxRadius = Math.min(scaleX, scaleY) / 2 * 0.92

        centerX = width / 2 + offsetX * maxRadius
        centerY = height / 2 + offsetY * maxRadius
      }

      // 计算最大半径
      const maxRadius = sweepAngle < Math.PI * 2 - 0.01
        ? Math.min(availableWidth, availableHeight) / 2 * 0.85  // 非完整圆稍小一点
        : Math.min(availableWidth / 2, availableHeight / 2) * 0.95

      // 解析半径配置 - 支持嵌套环形图
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

      // 缝隙角度（弧度）
      const padAngle = s.padAngle ?? 0
      // 圆角半径
      const cornerRadius = s.cornerRadius ?? 0

      // 计算总值
      const total = pieData.reduce((sum, item) => sum + item.value, 0)
      if (total === 0) return

      // 动画类型
      const pieAnimationType = s.pieAnimationType || 'expand'
      const easedProgress = easeOutCubic(animationProgress)

      let startAngle = baseStartAngle

      // 获取当前系列在所有系列中的索引
      const allSeriesIndex = (this.options.series || []).indexOf(s)

      pieData.forEach((item, i) => {
        // 计算扇形角度，减去缝隙
        const fullSliceAngle = (item.value / total) * sweepAngle - padAngle
        // 只有当 seriesIndex 和 dataIndex 都匹配，且没有 noHover 时才高亮
        const isHover = i === this.hoverIndex && allSeriesIndex === this.hoverSeriesIndex && !item.noHover
        const color = item.color || s.color || SERIES_COLORS[(seriesIndex * pieData.length + i) % SERIES_COLORS.length]

        // 根据动画类型计算参数
        let sliceAngle = fullSliceAngle
        let opacity = 1
        let radiusScale = 1

        // 弹性缓动函数
        const easeOutElastic = (t: number) => {
          if (t === 0 || t === 1) return t
          const c4 = (2 * Math.PI) / 3
          return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
        }

        // 计算每个扇形的延迟（用于级联动画）
        const sliceDelay = i / pieData.length
        const sliceProgress = Math.max(0, Math.min(1, (animationProgress - sliceDelay * 0.6) / (1 - sliceDelay * 0.6)))
        const easedSliceProgress = easeOutCubic(sliceProgress)

        switch (pieAnimationType) {
          case 'expand':
            // 整体扇形展开
            sliceAngle = fullSliceAngle * easedProgress
            break
          case 'scale':
            // 整体缩放
            sliceAngle = fullSliceAngle
            radiusScale = easedProgress
            break
          case 'fade':
            // 淡入
            sliceAngle = fullSliceAngle
            opacity = easedProgress
            break
          case 'bounce':
            // 回弹缩放
            sliceAngle = fullSliceAngle
            radiusScale = easeOutBounce(animationProgress)
            break
          case 'spin':
            // 旋转进入：所有扇形一起旋转，同时展开
            sliceAngle = fullSliceAngle * easedProgress
            // startAngle 会在后面被修改以实现旋转效果
            break
          case 'cascade':
            // 扇形依次展开：每个扇形依次从0度展开到目标角度
            sliceAngle = fullSliceAngle * easedSliceProgress
            if (sliceProgress <= 0) opacity = 0
            break
          case 'fan':
            // 扇形依次弹出：每个扇形依次从中心弹出，带弹性效果
            sliceAngle = fullSliceAngle
            radiusScale = easeOutElastic(sliceProgress)
            if (sliceProgress <= 0) opacity = 0
            break
          case 'none':
            sliceAngle = fullSliceAngle
            break
        }

        // spin 动画：添加旋转偏移
        let animatedStartAngle = startAngle
        if (pieAnimationType === 'spin') {
          // 从 -360度 旋转到 0度
          const rotationOffset = (1 - easedProgress) * Math.PI * 2
          animatedStartAngle = startAngle - rotationOffset
        }

        const endAngle = animatedStartAngle + sliceAngle

        // 悬停时扇形外移（带平滑动画效果）
        const sliceKey = `${allSeriesIndex}-${i}`
        const targetOffset = isHover ? 10 : 0
        const currentOffset = this.hoverOffsets.get(sliceKey) ?? 0

        // 平滑过渡到目标偏移
        const offsetDiff = targetOffset - currentOffset
        const newOffset = Math.abs(offsetDiff) < 0.5
          ? targetOffset
          : currentOffset + offsetDiff * 0.15  // 缓动系数，越小越慢
        this.hoverOffsets.set(sliceKey, newOffset)

        // 如果还在动画中，请求下一帧
        if (Math.abs(offsetDiff) > 0.5) {
          this.scheduleHoverAnimation()
        }

        let cx = centerX, cy = centerY
        const midAngleForOffset = startAngle + fullSliceAngle / 2
        cx += Math.cos(midAngleForOffset) * newOffset
        cy += Math.sin(midAngleForOffset) * newOffset

        // 南丁格尔玫瑰图
        let finalOuterRadius = outerRadius * radiusScale
        let finalInnerRadius = innerRadius * radiusScale
        if (s.roseType) {
          const maxVal = Math.max(...pieData.map(d => d.value))
          finalOuterRadius = (innerRadius + (outerRadius - innerRadius) * (item.value / maxVal)) * radiusScale
        }

        // 绘制扇形
        const fillColor = isHover && color ? this.lightenColor(color) : color

        // 使用圆角绘制（需要有内径形成环形）
        if (cornerRadius > 0 && finalInnerRadius > 0) {
          this.drawRoundedSector(
            renderer, cx, cy, finalInnerRadius, finalOuterRadius,
            animatedStartAngle, endAngle, cornerRadius, fillColor || '#999', opacity
          )
        } else {
          renderer.drawSector(
            cx, cy,
            finalInnerRadius,
            finalOuterRadius,
            animatedStartAngle,
            endAngle,
            { fill: fillColor, opacity }
          )
        }

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
            // 引导线长度根据饼图大小动态调整
            const direction = Math.cos(midAngle) >= 0 ? 1 : -1
            const length1 = Math.max(8, actualOuterRadius * 0.08)  // 第一段：斜向外
            const length2 = Math.max(12, actualOuterRadius * 0.12) // 第二段：水平

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

        // 更新起始角度（包含缝隙）
        startAngle += fullSliceAngle + padAngle
      })
    })
  }

  // 绘制带圆角的扇形（四角小圆角）- 支持 Canvas 和 SVG
  private drawRoundedSector(
    renderer: any,
    cx: number, cy: number,
    innerRadius: number, outerRadius: number,
    startAngle: number, endAngle: number,
    cornerRadius: number,
    fill: string, opacity: number
  ): void {
    if (innerRadius <= 0) {
      renderer.drawSector(cx, cy, innerRadius, outerRadius, startAngle, endAngle, { fill, opacity })
      return
    }

    const thickness = outerRadius - innerRadius
    const angleSpan = endAngle - startAngle

    // 根据扇形大小动态调整圆角
    const maxCornerByThickness = thickness / 3
    const maxCornerByAngle = (angleSpan * innerRadius) / 4
    const r = Math.min(cornerRadius, maxCornerByThickness, maxCornerByAngle)

    // 圆角太小时回退到普通扇形
    if (r < 1) {
      renderer.drawSector(cx, cy, innerRadius, outerRadius, startAngle, endAngle, { fill, opacity })
      return
    }

    // 尝试使用 Canvas ctx
    const ctx = renderer.ctx
    if (ctx) {
      // Canvas 模式：使用 arcTo 绘制圆角
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = fill
      ctx.beginPath()

      const outerStartAngle = startAngle + r / outerRadius
      const outerEndAngle = endAngle - r / outerRadius
      const innerStartAngle = startAngle + r / innerRadius
      const innerEndAngle = endAngle - r / innerRadius

      ctx.moveTo(
        cx + Math.cos(outerStartAngle) * outerRadius,
        cy + Math.sin(outerStartAngle) * outerRadius
      )
      ctx.arc(cx, cy, outerRadius, outerStartAngle, outerEndAngle, false)
      ctx.arcTo(
        cx + Math.cos(endAngle) * outerRadius,
        cy + Math.sin(endAngle) * outerRadius,
        cx + Math.cos(endAngle) * innerRadius,
        cy + Math.sin(endAngle) * innerRadius,
        r
      )
      ctx.arcTo(
        cx + Math.cos(endAngle) * innerRadius,
        cy + Math.sin(endAngle) * innerRadius,
        cx + Math.cos(innerEndAngle) * innerRadius,
        cy + Math.sin(innerEndAngle) * innerRadius,
        r
      )
      ctx.arc(cx, cy, innerRadius, innerEndAngle, innerStartAngle, true)
      ctx.arcTo(
        cx + Math.cos(startAngle) * innerRadius,
        cy + Math.sin(startAngle) * innerRadius,
        cx + Math.cos(startAngle) * outerRadius,
        cy + Math.sin(startAngle) * outerRadius,
        r
      )
      ctx.arcTo(
        cx + Math.cos(startAngle) * outerRadius,
        cy + Math.sin(startAngle) * outerRadius,
        cx + Math.cos(outerStartAngle) * outerRadius,
        cy + Math.sin(outerStartAngle) * outerRadius,
        r
      )
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    } else {
      // SVG 模式：使用 drawPath 绘制带圆角的扇形
      const outerStartAngle = startAngle + r / outerRadius
      const outerEndAngle = endAngle - r / outerRadius
      const innerStartAngle = startAngle + r / innerRadius
      const innerEndAngle = endAngle - r / innerRadius

      // 判断是否为大弧
      const outerArcLarge = (outerEndAngle - outerStartAngle) > Math.PI
      const innerArcLarge = (innerEndAngle - innerStartAngle) > Math.PI

      const commands: any[] = [
        // 移动到外弧起点
        {
          type: 'M',
          x: cx + Math.cos(outerStartAngle) * outerRadius,
          y: cy + Math.sin(outerStartAngle) * outerRadius
        },
        // 外弧
        {
          type: 'A',
          rx: outerRadius, ry: outerRadius,
          rotation: 0, large: outerArcLarge, sweep: true,
          x: cx + Math.cos(outerEndAngle) * outerRadius,
          y: cy + Math.sin(outerEndAngle) * outerRadius
        },
        // 右上圆角 (用二次贝塞尔曲线)
        {
          type: 'Q',
          x1: cx + Math.cos(endAngle) * outerRadius,
          y1: cy + Math.sin(endAngle) * outerRadius,
          x: cx + Math.cos(endAngle) * (outerRadius - r),
          y: cy + Math.sin(endAngle) * (outerRadius - r)
        },
        // 连接到内弧终点
        {
          type: 'L',
          x: cx + Math.cos(endAngle) * (innerRadius + r),
          y: cy + Math.sin(endAngle) * (innerRadius + r)
        },
        // 右下圆角
        {
          type: 'Q',
          x1: cx + Math.cos(endAngle) * innerRadius,
          y1: cy + Math.sin(endAngle) * innerRadius,
          x: cx + Math.cos(innerEndAngle) * innerRadius,
          y: cy + Math.sin(innerEndAngle) * innerRadius
        },
        // 内弧（逆向）
        {
          type: 'A',
          rx: innerRadius, ry: innerRadius,
          rotation: 0, large: innerArcLarge, sweep: false,
          x: cx + Math.cos(innerStartAngle) * innerRadius,
          y: cy + Math.sin(innerStartAngle) * innerRadius
        },
        // 左下圆角
        {
          type: 'Q',
          x1: cx + Math.cos(startAngle) * innerRadius,
          y1: cy + Math.sin(startAngle) * innerRadius,
          x: cx + Math.cos(startAngle) * (innerRadius + r),
          y: cy + Math.sin(startAngle) * (innerRadius + r)
        },
        // 连接到外弧起点
        {
          type: 'L',
          x: cx + Math.cos(startAngle) * (outerRadius - r),
          y: cy + Math.sin(startAngle) * (outerRadius - r)
        },
        // 左上圆角
        {
          type: 'Q',
          x1: cx + Math.cos(startAngle) * outerRadius,
          y1: cy + Math.sin(startAngle) * outerRadius,
          x: cx + Math.cos(outerStartAngle) * outerRadius,
          y: cy + Math.sin(outerStartAngle) * outerRadius
        },
        { type: 'Z' }
      ]

      renderer.drawPath({ commands }, { fill, opacity })
    }
  }

  private lightenColor(hex: string): string {
    if (!hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // 调度 hover 动画
  private scheduleHoverAnimation(): void {
    if (this.hoverAnimationFrame) return;
    this.hoverAnimationFrame = requestAnimationFrame(() => {
      this.hoverAnimationFrame = null;
      this.render();
    });
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

    // DataZoom 拖拽事件
    container.addEventListener('mousedown', (e: MouseEvent) => {
      if (this.handleDataZoomMouseDown(e)) {
        e.preventDefault()
      }
    })

    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.handleDataZoomMouseMove(e)
    })

    document.addEventListener('mouseup', () => {
      this.handleDataZoomMouseUp()
    })
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

    // 检查是否在有效数据范围内
    const isInRange = newIndex >= 0 && newIndex < labels.length
    const isInChartArea = x >= this.chartRect.x && x <= this.chartRect.x + this.chartRect.width &&
      y >= this.chartRect.y && y <= this.chartRect.y + this.chartRect.height

    if (isInRange && isInChartArea) {
      if (newIndex !== this.hoverIndex) {
        this.hoverIndex = newIndex
        this.render()
        this.showTooltip(e, newIndex)
      }
    } else {
      // 鼠标移出数据区域，立即隐藏tooltip
      if (this.hoverIndex !== -1) {
        this.hoverIndex = -1
        this.hideTooltip()
        this.render()
      }
    }
  }

  private handlePieMouseMove(x: number, y: number, e: MouseEvent): void {
    const allSeries = this.options.series || []
    const pieSeries = allSeries.filter(s => s.type === 'pie')
    if (pieSeries.length === 0) return

    // 计算中心点（简化版本，使用画布中心）
    const centerX = this.width / 2
    const centerY = this.height / 2
    const basePadding = 15
    const maxRadius = Math.min(this.width, this.height) / 2 * 0.95 - basePadding

    // 计算鼠标相对于圆心的位置
    const dx = x - centerX
    const dy = y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    // 从外到内检查每个饼图系列（外层优先）
    // 按外半径从大到小排序
    const sortedSeries = pieSeries.map((s) => {
      let outerR = maxRadius
      if (s.radius !== undefined) {
        outerR = Array.isArray(s.radius) ? s.radius[1] * maxRadius : s.radius * maxRadius
      }
      return { series: s, originalIndex: allSeries.indexOf(s), outerRadius: outerR }
    }).sort((a, b) => b.outerRadius - a.outerRadius)

    let foundSeriesIdx = -1
    let foundDataIdx = -1
    let foundItem: PieDataItem | null = null
    let foundTotal = 0

    for (const { series: s, originalIndex } of sortedSeries) {
      const pieData = s.data as PieDataItem[]
      if (!pieData || pieData.length === 0) continue

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

      // 检查是否在这个环的范围内
      if (dist < innerRadius || dist > outerRadius) continue

      // 计算总值和起始角度
      const total = pieData.reduce((sum, item) => sum + item.value, 0)
      const baseStartAngle = s.startAngle ?? -Math.PI / 2
      const sweepAngle = s.sweepAngle ?? Math.PI * 2
      const padAngle = s.padAngle ?? 0

      // 将角度调整到正确范围
      let checkAngle = angle
      if (checkAngle < baseStartAngle) checkAngle += Math.PI * 2

      // 找到鼠标所在的扇形
      let startAngle = baseStartAngle
      for (let i = 0; i < pieData.length; i++) {
        const item = pieData[i]!
        const sliceAngle = (item.value / total) * sweepAngle - padAngle
        const endAngle = startAngle + sliceAngle

        let testAngle = checkAngle
        if (testAngle < startAngle) testAngle += Math.PI * 2

        if (testAngle >= startAngle && testAngle < endAngle) {
          // 跳过 noHover 的项
          if (!item.noHover) {
            foundSeriesIdx = originalIndex
            foundDataIdx = i
            foundItem = item
            foundTotal = total
          }
          break
        }
        startAngle += sliceAngle + padAngle
      }

      if (foundDataIdx >= 0) break  // 找到了就停止
    }

    // 更新状态
    if (foundSeriesIdx !== this.hoverSeriesIndex || foundDataIdx !== this.hoverIndex) {
      this.hoverSeriesIndex = foundSeriesIdx
      this.hoverIndex = foundDataIdx
      this.render()
      if (foundItem) {
        this.showPieTooltip(e, foundItem, foundTotal)
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
    this.hoverSeriesIndex = -1
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
