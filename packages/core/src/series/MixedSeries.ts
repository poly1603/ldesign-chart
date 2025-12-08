/**
 * 混合图表系列 - 支持柱状图和折线图在同一坐标系中混合显示
 */

import type { IRenderer } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 混合系列数据项
 */
export interface MixedSeriesDataItem {
  name: string
  type: 'bar' | 'line'
  data: number[]
  color?: string
  /** 使用的Y轴索引 */
  yAxisIndex?: number
  /** 折线图配置 */
  lineStyle?: {
    width?: number
    type?: 'solid' | 'dashed' | 'dotted'
  }
  /** 是否显示区域填充（折线图） */
  areaStyle?: {
    color?: string
    opacity?: number
  }
  /** 是否平滑曲线（折线图） */
  smooth?: boolean
  /** 柱状图配置 */
  barStyle?: {
    borderRadius?: number
    borderColor?: string
    borderWidth?: number
  }
  /** 柱宽度 */
  barWidth?: number | string
}

/**
 * 混合系列配置
 */
export interface MixedSeriesOption {
  type: 'mixed'
  /** 系列数据 */
  series: MixedSeriesDataItem[]
  /** X轴数据（类目） */
  categories?: string[]
}

/**
 * 默认颜色
 */
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0',
]

/**
 * 缓存的数据点
 */
interface CachedDataPoint {
  x: number
  y: number
  value: number
  seriesIndex: number
  dataIndex: number
  type: 'bar' | 'line'
  width?: number
  height?: number
}

/**
 * 混合图表系列类
 */
export class MixedSeries extends EventEmitter {
  readonly type = 'mixed'

  private option: MixedSeriesOption
  private xScale: IScale<any, number> | null = null
  private yScales: (IScale<number, number> | null)[] = [null, null]
  // Reserved for future use
  // private _containerWidth: number = 800
  // private _containerHeight: number = 600
  private chartRect: { x: number; y: number; width: number; height: number } = {
    x: 50, y: 20, width: 700, height: 500,
  }

  private cachedPoints: CachedDataPoint[] = []
  private hoveredPoint: CachedDataPoint | null = null

  constructor(option: MixedSeriesOption) {
    super()
    this.option = option
  }

  /**
   * 设置比例尺
   */
  setScales(
    xScale: IScale<any, number>,
    yScale: IScale<number, number>,
    yScale2?: IScale<number, number>
  ): void {
    this.xScale = xScale
    this.yScales[0] = yScale
    if (yScale2) {
      this.yScales[1] = yScale2
    }
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(_width: number, _height: number): void {
    // Reserved for future responsive features
    // this._containerWidth = width
    // this._containerHeight = height
  }

  /**
   * 设置图表区域
   */
  setChartRect(rect: { x: number; y: number; width: number; height: number }): void {
    this.chartRect = rect
  }

  /**
   * 渲染混合系列
   */
  render(renderer: IRenderer): void {
    if (!this.xScale || !this.yScales[0]) {
      console.warn('MixedSeries: scales not set')
      return
    }

    this.cachedPoints = []

    // 计算柱状图系列数量和宽度
    const barSeries = this.option.series.filter(s => s.type === 'bar')
    const barCount = barSeries.length
    const categoryCount = this.option.categories?.length || 0

    if (categoryCount === 0) return

    const categoryWidth = this.chartRect.width / categoryCount
    const barGroupWidth = categoryWidth * 0.7
    const barWidth = barCount > 0 ? barGroupWidth / barCount : 0
    const barGap = categoryWidth * 0.15

    let barSeriesIndex = 0

    // 渲染每个系列
    this.option.series.forEach((series, seriesIndex) => {
      const color = series.color || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length]!
      const yScale = this.yScales[series.yAxisIndex || 0]

      if (!yScale) return

      if (series.type === 'bar') {
        this.renderBarSeries(
          renderer,
          series,
          seriesIndex,
          barSeriesIndex,
          barCount,
          barWidth,
          barGap,
          color,
          yScale
        )
        barSeriesIndex++
      } else if (series.type === 'line') {
        this.renderLineSeries(renderer, series, seriesIndex, color, yScale)
      }
    })
  }

  /**
   * 渲染柱状系列
   */
  private renderBarSeries(
    renderer: IRenderer,
    series: MixedSeriesDataItem,
    seriesIndex: number,
    barSeriesIndex: number,
    _barCount: number,
    barWidth: number,
    _barGap: number,
    color: string,
    yScale: IScale<number, number>
  ): void {
    const categoryCount = this.option.categories?.length || 0
    const categoryWidth = this.chartRect.width / categoryCount
    const barGroupWidth = categoryWidth * 0.7

    series.data.forEach((value, dataIndex) => {
      const categoryX = this.chartRect.x + dataIndex * categoryWidth + categoryWidth / 2
      const barX = categoryX - barGroupWidth / 2 + barSeriesIndex * barWidth
      const barY = yScale.map(value)
      const barHeight = this.chartRect.y + this.chartRect.height - barY
      const isHovered = this.hoveredPoint?.seriesIndex === seriesIndex &&
        this.hoveredPoint?.dataIndex === dataIndex

      // 缓存数据点
      this.cachedPoints.push({
        x: barX,
        y: barY,
        value,
        seriesIndex,
        dataIndex,
        type: 'bar',
        width: barWidth,
        height: barHeight,
      })

      // 绘制柱子
      const borderRadius = series.barStyle?.borderRadius || 0
      const fillColor = isHovered ? this.lightenColor(color, 20) : color
      const opacity = isHovered ? 1 : 0.9

      if (borderRadius > 0) {
        this.renderRoundedBar(renderer, barX, barY, barWidth, barHeight, borderRadius, fillColor, opacity)
      } else {
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x: barX, y: barY },
              { type: 'L', x: barX + barWidth, y: barY },
              { type: 'L', x: barX + barWidth, y: barY + barHeight },
              { type: 'L', x: barX, y: barY + barHeight },
              { type: 'Z' },
            ],
          },
          { fill: fillColor, opacity }
        )
      }
    })
  }

  /**
   * 渲染圆角柱子
   */
  private renderRoundedBar(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
    opacity: number
  ): void {
    const r = Math.min(radius, width / 2, height / 2)
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: x + r, y },
          { type: 'L', x: x + width - r, y },
          { type: 'Q', x1: x + width, y1: y, x: x + width, y: y + r },
          { type: 'L', x: x + width, y: y + height },
          { type: 'L', x, y: y + height },
          { type: 'L', x, y: y + r },
          { type: 'Q', x1: x, y1: y, x: x + r, y },
          { type: 'Z' },
        ],
      },
      { fill: color, opacity }
    )
  }

  /**
   * 渲染折线系列
   */
  private renderLineSeries(
    renderer: IRenderer,
    series: MixedSeriesDataItem,
    seriesIndex: number,
    color: string,
    yScale: IScale<number, number>
  ): void {
    const categoryCount = this.option.categories?.length || 0
    if (categoryCount === 0) return

    const categoryWidth = this.chartRect.width / categoryCount
    const points: { x: number; y: number }[] = []

    series.data.forEach((value, dataIndex) => {
      const x = this.chartRect.x + dataIndex * categoryWidth + categoryWidth / 2
      const y = yScale.map(value)
      points.push({ x, y })

      // 缓存数据点
      this.cachedPoints.push({
        x,
        y,
        value,
        seriesIndex,
        dataIndex,
        type: 'line',
      })
    })

    if (points.length === 0) return

    // 绘制区域填充
    if (series.areaStyle) {
      const areaColor = series.areaStyle.color || color
      const areaOpacity = series.areaStyle.opacity ?? 0.3
      const areaCommands: any[] = [
        { type: 'M', x: points[0]!.x, y: this.chartRect.y + this.chartRect.height },
      ]
      points.forEach(p => areaCommands.push({ type: 'L', x: p.x, y: p.y }))
      areaCommands.push({ type: 'L', x: points[points.length - 1]!.x, y: this.chartRect.y + this.chartRect.height })
      areaCommands.push({ type: 'Z' })

      renderer.drawPath({ commands: areaCommands }, { fill: areaColor, opacity: areaOpacity })
    }

    // 绘制线条
    const lineCommands: any[] = []
    if (series.smooth) {
      // 平滑曲线
      lineCommands.push({ type: 'M', x: points[0]!.x, y: points[0]!.y })
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i]!
        const p1 = points[i + 1]!
        const cpx = (p0.x + p1.x) / 2
        lineCommands.push({
          type: 'Q',
          x1: cpx,
          y1: p0.y,
          x: cpx,
          y: (p0.y + p1.y) / 2,
        })
        lineCommands.push({
          type: 'Q',
          x1: cpx,
          y1: p1.y,
          x: p1.x,
          y: p1.y,
        })
      }
    } else {
      // 直线
      points.forEach((p, i) => {
        lineCommands.push({ type: i === 0 ? 'M' : 'L', x: p.x, y: p.y })
      })
    }

    const lineWidth = series.lineStyle?.width || 2
    const lineDash = series.lineStyle?.type === 'dashed' ? [5, 5] :
      series.lineStyle?.type === 'dotted' ? [2, 2] : undefined

    renderer.drawPath(
      { commands: lineCommands },
      { stroke: color, lineWidth, lineDash, fill: undefined }
    )

    // 绘制数据点
    points.forEach((p, dataIndex) => {
      const isHovered = this.hoveredPoint?.seriesIndex === seriesIndex &&
        this.hoveredPoint?.dataIndex === dataIndex
      const pointRadius = isHovered ? 6 : 4

      renderer.drawCircle(
        { x: p.x, y: p.y, radius: pointRadius },
        {
          fill: isHovered ? '#fff' : color,
          stroke: color,
          lineWidth: 2,
        }
      )
    })
  }

  /**
   * 查找指定位置的数据点
   */
  findPointAt(mouseX: number, mouseY: number): CachedDataPoint | null {
    for (const point of this.cachedPoints) {
      if (point.type === 'bar') {
        if (
          mouseX >= point.x &&
          mouseX <= point.x + (point.width || 0) &&
          mouseY >= point.y &&
          mouseY <= point.y + (point.height || 0)
        ) {
          return point
        }
      } else {
        const distance = Math.sqrt(
          Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
        )
        if (distance <= 10) {
          return point
        }
      }
    }
    return null
  }

  /**
   * 查找X坐标最近的数据点（用于轴触发tooltip）
   */
  findNearestPointsByX(mouseX: number): CachedDataPoint[] {
    if (this.cachedPoints.length === 0) return []

    // 找到最近的X坐标对应的dataIndex
    let nearestDataIndex = 0
    let minDistance = Infinity

    const categoryCount = this.option.categories?.length || 0
    if (categoryCount === 0) return []

    const categoryWidth = this.chartRect.width / categoryCount

    for (let i = 0; i < categoryCount; i++) {
      const categoryX = this.chartRect.x + i * categoryWidth + categoryWidth / 2
      const distance = Math.abs(mouseX - categoryX)
      if (distance < minDistance) {
        minDistance = distance
        nearestDataIndex = i
      }
    }

    // 返回该dataIndex的所有系列数据点
    return this.cachedPoints.filter(p => p.dataIndex === nearestDataIndex)
  }

  /**
   * 设置悬停点
   */
  setHoveredPoint(point: CachedDataPoint | null): void {
    this.hoveredPoint = point
  }

  /**
   * 颜色变亮
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
    const B = Math.min(255, (num & 0x0000ff) + amt)
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
  }

  /**
   * 获取系列数据
   */
  getSeries(): MixedSeriesDataItem[] {
    return this.option.series
  }

  /**
   * 获取类目数据
   */
  getCategories(): string[] {
    return this.option.categories || []
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<MixedSeriesOption>): void {
    this.option = { ...this.option, ...option }
  }
}
