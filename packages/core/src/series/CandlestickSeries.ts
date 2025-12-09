/**
 * K线图（蜡烛图）系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { SeriesOption } from '../types'

/**
 * K线数据项
 * 数组格式：[open, close, lowest, highest] 或 [开盘, 收盘, 最低, 最高]
 */
export type CandlestickDataItem =
  | [number, number, number, number]
  | { open: number; close: number; low: number; high: number; name?: string }

/**
 * K线图配置选项
 */
export interface CandlestickSeriesOption extends SeriesOption {
  type: 'candlestick'
  data: CandlestickDataItem[]

  // 柱子宽度
  barWidth?: number | string
  barMaxWidth?: number | string
  barMinWidth?: number

  // 颜色配置
  itemStyle?: {
    color?: string           // 阳线填充色（收盘 > 开盘）
    color0?: string          // 阴线填充色（收盘 < 开盘）
    borderColor?: string     // 阳线边框色
    borderColor0?: string    // 阴线边框色
    borderWidth?: number
    opacity?: number
  }

  emphasis?: {
    itemStyle?: {
      color?: string
      color0?: string
      borderColor?: string
      borderColor0?: string
      borderWidth?: number
      shadowBlur?: number
      shadowColor?: string
    }
  }

  // 标注
  markPoint?: unknown
  markLine?: unknown
  markArea?: unknown

  // 裁剪
  clip?: boolean

  // 系列索引
  seriesIndex?: number

  // z-index
  z?: number
  zlevel?: number
}

/**
 * 缓存的K线数据
 */
export interface CachedCandlestickItem {
  x: number
  open: number
  close: number
  high: number
  low: number
  bodyTop: number
  bodyBottom: number
  bodyHeight: number
  isRising: boolean
  dataIndex: number
  originalData: CandlestickDataItem
}

// 默认颜色
const DEFAULT_RISING_COLOR = '#ec0000'   // 阳线红色
const DEFAULT_FALLING_COLOR = '#00da3c'  // 阴线绿色

/**
 * K线图系列类
 */
export class CandlestickSeries extends Series {
  protected declare option: CandlestickSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null
  private cachedItems: CachedCandlestickItem[] = []
  private hoveredIndex: number = -1

  constructor(
    option: CandlestickSeriesOption,
    xScale: IScale,
    yScale: IScale,
    coordinate: ICoordinate
  ) {
    super(option)
    this.xScale = xScale
    this.yScale = yScale
    this.coordinate = coordinate
  }

  get type(): string {
    return 'candlestick'
  }

  /**
   * 获取缓存的K线数据
   */
  getCachedItems(): CachedCandlestickItem[] {
    return this.cachedItems
  }

  /**
   * 设置悬停索引
   */
  setHoveredIndex(index: number): void {
    this.hoveredIndex = index
  }

  /**
   * 获取悬停索引
   */
  getHoveredIndex(): number {
    return this.hoveredIndex
  }

  /**
   * 渲染K线图
   */
  render(renderer: IRenderer): void {
    if (!this.coordinate || !this.xScale || !this.yScale || this.data.length === 0) {
      return
    }

    const items = this.calculateItems()
    this.cachedItems = items

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const isHovered = i === this.hoveredIndex
      this.renderCandlestick(renderer, item, isHovered)
    }
  }

  /**
   * 计算K线位置
   */
  private calculateItems(): CachedCandlestickItem[] {
    const items: CachedCandlestickItem[] = []

    if (!this.coordinate || !this.xScale || !this.yScale) {
      return items
    }

    // @ts-ignore - Used for future bar width calculation
    const barWidth = this.calculateBarWidth()

    for (let i = 0; i < this.data.length; i++) {
      const dataItem = this.data[i] as CandlestickDataItem
      let open: number, close: number, low: number, high: number

      // 解析数据格式
      if (Array.isArray(dataItem)) {
        ;[open, close, low, high] = dataItem
      } else {
        open = dataItem.open
        close = dataItem.close
        low = dataItem.low
        high = dataItem.high
      }

      // 计算 X 位置
      const dataX = this.xScale.map(i)
      const screenX = this.coordinate.dataToPoint([dataX, 0]).x

      // 计算 Y 位置
      const openY = this.coordinate.dataToPoint([0, this.yScale.map(open)]).y
      const closeY = this.coordinate.dataToPoint([0, this.yScale.map(close)]).y
      const highY = this.coordinate.dataToPoint([0, this.yScale.map(high)]).y
      const lowY = this.coordinate.dataToPoint([0, this.yScale.map(low)]).y

      const isRising = close >= open
      const bodyTop = Math.min(openY, closeY)
      const bodyBottom = Math.max(openY, closeY)
      const bodyHeight = Math.max(1, bodyBottom - bodyTop)  // 至少1像素

      items.push({
        x: screenX,
        open: openY,
        close: closeY,
        high: highY,
        low: lowY,
        bodyTop,
        bodyBottom,
        bodyHeight,
        isRising,
        dataIndex: i,
        originalData: dataItem,
      })
    }

    return items
  }

  /**
   * 计算柱子宽度
   */
  private calculateBarWidth(): number {
    if (!this.coordinate || !this.xScale) {
      return 8
    }

    if (typeof this.option.barWidth === 'number') {
      return this.option.barWidth
    }

    const dataLength = this.data.length
    if (dataLength <= 1) return 20

    // 计算类目间距
    const pos0 = this.coordinate.dataToPoint([this.xScale.map(0), 0])
    const pos1 = this.coordinate.dataToPoint([this.xScale.map(1), 0])
    const categoryWidth = Math.abs(pos1.x - pos0.x)

    // 柱子占类目宽度的 70%
    return Math.max(4, categoryWidth * 0.7)
  }

  /**
   * 渲染单个K线
   */
  private renderCandlestick(
    renderer: IRenderer,
    item: CachedCandlestickItem,
    isHovered: boolean = false
  ): void {
    const itemStyle = this.option.itemStyle || {}
    const emphasisStyle = this.option.emphasis?.itemStyle || {}
    const barWidth = this.calculateBarWidth()
    const halfWidth = barWidth / 2

    // 选择颜色
    const fillColor = item.isRising
      ? (isHovered ? emphasisStyle.color : itemStyle.color) || DEFAULT_RISING_COLOR
      : (isHovered ? emphasisStyle.color0 : itemStyle.color0) || DEFAULT_FALLING_COLOR

    const borderColor = item.isRising
      ? (isHovered ? emphasisStyle.borderColor : itemStyle.borderColor) || fillColor
      : (isHovered ? emphasisStyle.borderColor0 : itemStyle.borderColor0) || fillColor

    const borderWidth = isHovered
      ? (emphasisStyle.borderWidth ?? 2)
      : (itemStyle.borderWidth ?? 1)

    // 渲染上下影线
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: item.x, y: item.high },
          { type: 'L', x: item.x, y: item.bodyTop },
          { type: 'M', x: item.x, y: item.bodyBottom },
          { type: 'L', x: item.x, y: item.low },
        ],
      },
      {
        stroke: borderColor,
        lineWidth: borderWidth,
        fill: undefined,
      }
    )

    // 渲染实体
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: item.x - halfWidth, y: item.bodyTop },
          { type: 'L', x: item.x + halfWidth, y: item.bodyTop },
          { type: 'L', x: item.x + halfWidth, y: item.bodyBottom },
          { type: 'L', x: item.x - halfWidth, y: item.bodyBottom },
          { type: 'Z' },
        ],
      },
      {
        fill: fillColor,
        stroke: borderColor,
        lineWidth: borderWidth,
        opacity: itemStyle.opacity ?? 1,
      }
    )
  }

  /**
   * 根据坐标找到K线
   */
  findItemAtPosition(mouseX: number, _mouseY: number): { item: CachedCandlestickItem | null; index: number } {
    const barWidth = this.calculateBarWidth()
    const halfWidth = barWidth / 2

    for (let i = 0; i < this.cachedItems.length; i++) {
      const item = this.cachedItems[i]!
      if (Math.abs(mouseX - item.x) <= halfWidth) {
        return { item, index: i }
      }
    }
    return { item: null, index: -1 }
  }

  /**
   * 更新比例尺
   */
  setScales(xScale: IScale, yScale: IScale): void {
    this.xScale = xScale
    this.yScale = yScale
  }

  /**
   * 销毁
   */
  dispose(): void {
    super.dispose()
    this.xScale = null
    this.yScale = null
    this.cachedItems = []
  }
}
