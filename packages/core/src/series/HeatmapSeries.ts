/**
 * 热力图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { SeriesOption } from '../types'

/**
 * 热力图数据项
 * 格式：[x, y, value] 或 { x, y, value }
 */
export type HeatmapDataItem =
  | [number, number, number]
  | { x: number; y: number; value: number; name?: string }

/**
 * 热力图配置选项
 */
export interface HeatmapSeriesOption extends SeriesOption {
  type: 'heatmap'
  data: HeatmapDataItem[]

  // 坐标系类型
  coordinateSystem?: 'cartesian2d' | 'geo' | 'calendar'

  // 使用的x轴和y轴索引
  xAxisIndex?: number
  yAxisIndex?: number

  // 每个数据点的大小
  pointSize?: number

  // 模糊半径（用于平滑热力图）
  blurSize?: number

  // 最小/最大透明度
  minOpacity?: number
  maxOpacity?: number

  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
  }

  // 标签配置（使用单独字段避免类型冲突）
  labelShow?: boolean
  labelFormatter?: string | ((params: { value: number }) => string)
  labelColor?: string
  labelFontSize?: number
  labelFontWeight?: string | number

  emphasis?: {
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
      shadowBlur?: number
      shadowColor?: string
    }
    label?: {
      show?: boolean
      color?: string
    }
  }

  // 视觉映射范围
  visualMin?: number
  visualMax?: number

  // 颜色渐变
  inRange?: {
    color?: string[]
  }

  // 标注
  markPoint?: unknown
  markLine?: unknown

  // 系列索引
  seriesIndex?: number

  // z-index
  z?: number
  zlevel?: number
}

/**
 * 缓存的热力图数据
 */
export interface CachedHeatmapItem {
  x: number
  y: number
  width: number
  height: number
  value: number
  color: string
  dataIndex: number
  originalData: HeatmapDataItem
}

// 默认颜色渐变（蓝 -> 黄 -> 红）
const DEFAULT_COLORS = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']

/**
 * 热力图系列类
 */
export class HeatmapSeries extends Series {
  protected declare option: HeatmapSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null
  private cachedItems: CachedHeatmapItem[] = []
  private hoveredIndex: number = -1
  private valueRange: { min: number; max: number } = { min: 0, max: 1 }

  constructor(
    option: HeatmapSeriesOption,
    xScale: IScale,
    yScale: IScale,
    coordinate: ICoordinate
  ) {
    super(option)
    this.xScale = xScale
    this.yScale = yScale
    this.coordinate = coordinate
    this.calculateValueRange()
  }

  get type(): string {
    return 'heatmap'
  }

  /**
   * 计算值范围
   */
  private calculateValueRange(): void {
    const values = (this.data as HeatmapDataItem[]).map(item => {
      if (Array.isArray(item)) {
        return item[2]
      }
      return item.value
    })

    if (values.length === 0) {
      this.valueRange = { min: 0, max: 1 }
      return
    }

    this.valueRange = {
      min: this.option.visualMin ?? Math.min(...values),
      max: this.option.visualMax ?? Math.max(...values),
    }
  }

  /**
   * 获取缓存的热力图数据
   */
  getCachedItems(): CachedHeatmapItem[] {
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
   * 渲染热力图
   */
  render(renderer: IRenderer): void {
    if (!this.coordinate || !this.xScale || !this.yScale || this.data.length === 0) {
      return
    }

    this.calculateValueRange()
    const items = this.calculateItems()
    this.cachedItems = items

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const isHovered = i === this.hoveredIndex
      this.renderCell(renderer, item, isHovered)

      // 渲染标签
      if (this.option.labelShow) {
        this.renderLabel(renderer, item)
      }
    }
  }

  /**
   * 计算热力图单元格
   */
  private calculateItems(): CachedHeatmapItem[] {
    const items: CachedHeatmapItem[] = []

    if (!this.coordinate || !this.xScale || !this.yScale) {
      return items
    }

    // 计算单元格大小
    const cellSize = this.calculateCellSize()

    for (let i = 0; i < this.data.length; i++) {
      const dataItem = this.data[i] as HeatmapDataItem
      let xValue: number, yValue: number, value: number

      if (Array.isArray(dataItem)) {
        ;[xValue, yValue, value] = dataItem
      } else {
        xValue = dataItem.x
        yValue = dataItem.y
        value = dataItem.value
      }

      // 计算屏幕位置
      const dataX = this.xScale.map(xValue)
      const dataY = this.yScale.map(yValue)
      const screenPoint = this.coordinate.dataToPoint([dataX, dataY])

      // 计算颜色
      const color = this.getColorForValue(value)

      items.push({
        x: screenPoint.x - cellSize.width / 2,
        y: screenPoint.y - cellSize.height / 2,
        width: cellSize.width,
        height: cellSize.height,
        value,
        color,
        dataIndex: i,
        originalData: dataItem,
      })
    }

    return items
  }

  /**
   * 计算单元格大小
   */
  private calculateCellSize(): { width: number; height: number } {
    if (!this.coordinate || !this.xScale || !this.yScale) {
      return { width: 20, height: 20 }
    }

    // 根据数据范围计算单元格大小
    const pos00 = this.coordinate.dataToPoint([this.xScale.map(0), this.yScale.map(0)])
    const pos11 = this.coordinate.dataToPoint([this.xScale.map(1), this.yScale.map(1)])

    return {
      width: Math.abs(pos11.x - pos00.x) || 20,
      height: Math.abs(pos11.y - pos00.y) || 20,
    }
  }

  /**
   * 根据值获取颜色
   */
  private getColorForValue(value: number): string {
    const colors = this.option.inRange?.color || DEFAULT_COLORS
    const { min, max } = this.valueRange

    // 归一化值到 0-1 范围
    let ratio = (value - min) / (max - min || 1)
    ratio = Math.max(0, Math.min(1, ratio))

    // 计算颜色索引
    const colorIndex = Math.floor(ratio * (colors.length - 1))
    const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1)

    // 线性插值两个颜色
    const localRatio = (ratio * (colors.length - 1)) - colorIndex
    return this.interpolateColor(colors[colorIndex]!, colors[nextColorIndex]!, localRatio)
  }

  /**
   * 线性插值颜色
   */
  private interpolateColor(color1: string, color2: string, ratio: number): string {
    const c1 = this.hexToRgb(color1)
    const c2 = this.hexToRgb(color2)

    if (!c1 || !c2) return color1

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio)

    return `rgb(${r}, ${g}, ${b})`
  }

  /**
   * 十六进制转 RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
      : null
  }

  /**
   * 渲染单个单元格
   */
  private renderCell(
    renderer: IRenderer,
    item: CachedHeatmapItem,
    isHovered: boolean = false
  ): void {
    const itemStyle = this.option.itemStyle || {}
    const emphasisStyle = this.option.emphasis?.itemStyle || {}
    const borderRadius = itemStyle.borderRadius || 0

    const fillColor = isHovered ? (emphasisStyle.color || item.color) : item.color
    const borderColor = isHovered
      ? (emphasisStyle.borderColor || '#fff')
      : (itemStyle.borderColor || undefined)
    const borderWidth = isHovered
      ? (emphasisStyle.borderWidth ?? 2)
      : (itemStyle.borderWidth ?? 0)
    const opacity = itemStyle.opacity ?? 1

    if (borderRadius > 0) {
      // 圆角矩形
      renderer.drawRect(
        {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
        },
        {
          fill: fillColor,
          stroke: borderColor,
          lineWidth: borderWidth,
          opacity,
          radius: borderRadius,
        }
      )
    } else {
      // 普通矩形
      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: item.x, y: item.y },
            { type: 'L', x: item.x + item.width, y: item.y },
            { type: 'L', x: item.x + item.width, y: item.y + item.height },
            { type: 'L', x: item.x, y: item.y + item.height },
            { type: 'Z' },
          ],
        },
        {
          fill: fillColor,
          stroke: borderColor,
          lineWidth: borderWidth,
          opacity,
        }
      )
    }
  }

  /**
   * 渲染标签
   */
  private renderLabel(renderer: IRenderer, item: CachedHeatmapItem): void {
    if (!this.option.labelShow) return

    // 格式化文本
    let text: string
    const formatter = this.option.labelFormatter
    if (typeof formatter === 'function') {
      text = formatter({ value: item.value })
    } else if (typeof formatter === 'string') {
      text = formatter.replace('{value}', String(item.value))
    } else {
      text = String(item.value)
    }

    const centerX = item.x + item.width / 2
    const centerY = item.y + item.height / 2

    renderer.drawText(
      { text, x: centerX, y: centerY },
      {
        fill: this.option.labelColor || '#333',
        fontSize: this.option.labelFontSize || 12,
        textAlign: 'center',
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 根据坐标找到单元格
   */
  findItemAtPosition(mouseX: number, mouseY: number): { item: CachedHeatmapItem | null; index: number } {
    for (let i = 0; i < this.cachedItems.length; i++) {
      const item = this.cachedItems[i]!
      if (
        mouseX >= item.x &&
        mouseX <= item.x + item.width &&
        mouseY >= item.y &&
        mouseY <= item.y + item.height
      ) {
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
