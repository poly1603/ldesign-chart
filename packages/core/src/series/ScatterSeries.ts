/**
 * 散点图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { SeriesOption } from '../types'

/**
 * 散点数据项 - 支持多种格式
 */
export type ScatterDataItem =
  | [number, number]
  | [number, number, number]  // 气泡图：[x, y, size]
  | { x: number; y: number; value?: number; name?: string; symbolSize?: number }

/**
 * 散点图配置选项
 */
export interface ScatterSeriesOption extends SeriesOption {
  type: 'scatter'
  data: ScatterDataItem[]

  // 散点大小 - 支持数字或函数
  symbolSize?: number | ((value: number, params: { dataIndex: number }) => number)
  // 散点形状
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none'
  // 符号旋转角度
  symbolRotate?: number

  // 大规模散点图优化
  large?: boolean
  largeThreshold?: number

  // 裁剪
  clip?: boolean

  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
    opacity?: number
    shadowBlur?: number
    shadowColor?: string
  }

  // 颜色函数（单独定义以避免类型冲突）
  colorBy?: 'data' | 'series'
  colorFunction?: (params: { dataIndex: number; value: number[] }) => string

  label?: {
    show?: boolean
    position?: 'top' | 'right' | 'bottom' | 'left' | 'inside'
    formatter?: string | ((params: unknown) => string)
    color?: string
    fontSize?: number
  }

  emphasis?: {
    scale?: boolean | number
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
      shadowBlur?: number
      shadowColor?: string
    }
  }

  // 标注
  markPoint?: unknown
  markLine?: unknown

  // 系列索引
  seriesIndex?: number
}

/**
 * 散点图系列类
 */
export class ScatterSeries extends Series {
  protected declare option: ScatterSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null

  constructor(
    option: ScatterSeriesOption,
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
    return 'scatter'
  }

  /**
   * 渲染散点图
   */
  render(renderer: IRenderer): void {
    if (!this.coordinate || !this.xScale || !this.yScale || this.data.length === 0) {
      return
    }

    const points = this.calculatePoints()

    for (const point of points) {
      this.renderPoint(renderer, point)

      // 渲染标签
      if (this.option.label?.show) {
        this.renderLabel(renderer, point)
      }
    }
  }

  /**
   * 计算散点的位置
   */
  private calculatePoints(): Array<{
    x: number
    y: number
    size: number
    value: number
    originalData: ScatterDataItem
  }> {
    const points: Array<{
      x: number
      y: number
      size: number
      value: number
      originalData: ScatterDataItem
    }> = []

    if (!this.coordinate || !this.xScale || !this.yScale) {
      return points
    }

    for (const item of this.data as ScatterDataItem[]) {
      let xValue: number
      let yValue: number
      let pointValue: number

      // 解析数据格式
      if (Array.isArray(item)) {
        xValue = item[0]
        yValue = item[1]
        pointValue = yValue
      } else {
        xValue = item.x
        yValue = item.y
        pointValue = item.value !== undefined ? item.value : yValue
      }

      // 使用比例尺映射数据
      const dataX = this.xScale.map(xValue)
      const dataY = this.yScale.map(yValue)

      // 转换为屏幕坐标
      const screenPoint = this.coordinate.dataToPoint([dataX, dataY])

      // 计算散点大小
      const size = this.calculatePointSize(pointValue)

      points.push({
        x: screenPoint.x,
        y: screenPoint.y,
        size,
        value: pointValue,
        originalData: item,
      })
    }

    return points
  }

  /**
   * 计算散点大小
   */
  private calculatePointSize(value: number): number {
    const symbolSize = this.option.symbolSize

    if (typeof symbolSize === 'function') {
      return symbolSize(value, { dataIndex: 0 })
    } else if (typeof symbolSize === 'number') {
      return symbolSize
    }

    // 默认大小
    return 8
  }

  /**
   * 渲染单个散点
   */
  private renderPoint(
    renderer: IRenderer,
    point: { x: number; y: number; size: number; value: number }
  ): void {
    const itemStyle = this.option.itemStyle || {}
    const symbol = this.option.symbol || 'circle'

    switch (symbol) {
      case 'circle':
        this.renderCircle(renderer, point, itemStyle)
        break
      case 'rect':
        this.renderRect(renderer, point, itemStyle)
        break
      case 'triangle':
        this.renderTriangle(renderer, point, itemStyle)
        break
      case 'diamond':
        this.renderDiamond(renderer, point, itemStyle)
        break
      default:
        this.renderCircle(renderer, point, itemStyle)
    }
  }

  /**
   * 渲染圆形散点
   */
  private renderCircle(
    renderer: IRenderer,
    point: { x: number; y: number; size: number },
    itemStyle: NonNullable<ScatterSeriesOption['itemStyle']>
  ): void {
    renderer.drawCircle(
      {
        x: point.x,
        y: point.y,
        radius: point.size / 2,
      },
      {
        fill: (itemStyle.color as string) || '#5470c6',
        stroke: (itemStyle.borderColor as string) || '#fff',
        lineWidth: itemStyle.borderWidth || 1,
        opacity: itemStyle.opacity || 0.8,
      }
    )
  }

  /**
   * 渲染矩形散点
   */
  private renderRect(
    renderer: IRenderer,
    point: { x: number; y: number; size: number },
    itemStyle: NonNullable<ScatterSeriesOption['itemStyle']>
  ): void {
    const halfSize = point.size / 2

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: point.x - halfSize, y: point.y - halfSize },
          { type: 'L', x: point.x + halfSize, y: point.y - halfSize },
          { type: 'L', x: point.x + halfSize, y: point.y + halfSize },
          { type: 'L', x: point.x - halfSize, y: point.y + halfSize },
          { type: 'Z' },
        ],
      },
      {
        fill: (itemStyle.color as string) || '#5470c6',
        stroke: (itemStyle.borderColor as string) || '#fff',
        lineWidth: itemStyle.borderWidth || 1,
        opacity: itemStyle.opacity || 0.8,
      }
    )
  }

  /**
   * 渲染三角形散点
   */
  private renderTriangle(
    renderer: IRenderer,
    point: { x: number; y: number; size: number },
    itemStyle: NonNullable<ScatterSeriesOption['itemStyle']>
  ): void {
    const halfSize = point.size / 2
    const height = halfSize * Math.sqrt(3)

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: point.x, y: point.y - height / 1.5 },
          { type: 'L', x: point.x + halfSize, y: point.y + height / 3 },
          { type: 'L', x: point.x - halfSize, y: point.y + height / 3 },
          { type: 'Z' },
        ],
      },
      {
        fill: (itemStyle.color as string) || '#5470c6',
        stroke: (itemStyle.borderColor as string) || '#fff',
        lineWidth: itemStyle.borderWidth || 1,
        opacity: itemStyle.opacity || 0.8,
      }
    )
  }

  /**
   * 渲染菱形散点
   */
  private renderDiamond(
    renderer: IRenderer,
    point: { x: number; y: number; size: number },
    itemStyle: NonNullable<ScatterSeriesOption['itemStyle']>
  ): void {
    const halfSize = point.size / 2

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: point.x, y: point.y - halfSize },
          { type: 'L', x: point.x + halfSize, y: point.y },
          { type: 'L', x: point.x, y: point.y + halfSize },
          { type: 'L', x: point.x - halfSize, y: point.y },
          { type: 'Z' },
        ],
      },
      {
        fill: (itemStyle.color as string) || '#5470c6',
        stroke: (itemStyle.borderColor as string) || '#fff',
        lineWidth: itemStyle.borderWidth || 1,
        opacity: itemStyle.opacity || 0.8,
      }
    )
  }

  /**
   * 渲染标签
   */
  private renderLabel(
    renderer: IRenderer,
    point: { x: number; y: number; size: number; value: number; originalData: ScatterDataItem }
  ): void {
    const labelOption = this.option.label
    if (!labelOption || !labelOption.show) return

    // 格式化文本
    const formatter = labelOption.formatter
    let text: string
    if (typeof formatter === 'function') {
      text = formatter(point.originalData)
    } else if (typeof formatter === 'string') {
      text = formatter
    } else {
      text = point.value.toString()
    }

    // 计算标签位置
    const position = (labelOption as any).position || 'top'
    const offset = point.size / 2 + 5
    let x = point.x
    let y = point.y
    let textAlign: 'left' | 'center' | 'right' = 'center'
    let textBaseline: 'top' | 'middle' | 'bottom' = 'middle'

    switch (position) {
      case 'top':
        y = point.y - offset
        textBaseline = 'bottom'
        break
      case 'right':
        x = point.x + offset
        textAlign = 'left'
        break
      case 'bottom':
        y = point.y + offset
        textBaseline = 'top'
        break
      case 'left':
        x = point.x - offset
        textAlign = 'right'
        break
      case 'inside':
        // 保持中心位置
        break
    }

    const labelStyle = (labelOption as any).style || {}
    renderer.drawText(
      { text, x, y },
      {
        fill: labelStyle.fill || '#333',
        fontSize: labelStyle.fontSize || 12,
        textAlign,
        textBaseline,
      }
    )
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
  }
}