/**
 * 系列基类
 */

import type { Rect, BaseSeriesOptions, DataPoint, Point } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import type { Axis } from '../components/Axis'

export interface SeriesContext {
  xAxis?: Axis
  yAxis?: Axis
  plotArea: Rect
  colors: string[]
  seriesIndex: number
}

export abstract class BaseSeries<T extends BaseSeriesOptions = BaseSeriesOptions> {
  protected options: T
  protected context: SeriesContext | null = null
  protected processedData: DataPoint[] = []
  protected color: string = '#5470c6'

  constructor(options: T) {
    this.options = options
  }

  /** 更新配置 */
  setOptions(options: Partial<T>): void {
    this.options = { ...this.options, ...options }
  }

  /** 获取配置 */
  getOptions(): T {
    return this.options
  }

  /** 设置上下文 */
  setContext(context: SeriesContext): void {
    this.context = context
    this.color = context.colors[context.seriesIndex % context.colors.length]
  }

  /** 获取系列名称 */
  getName(): string {
    return this.options.name ?? ''
  }

  /** 获取系列颜色 */
  getColor(): string {
    return this.options.style?.line?.color as string ?? this.color
  }

  /** 获取数据 */
  getData(): DataPoint[] {
    return this.processedData
  }

  /** 处理数据 */
  processData(): void {
    const rawData = this.options.data ?? []

    this.processedData = rawData.map((item, index) => {
      if (typeof item === 'number') {
        return { x: index, y: item }
      }
      return item as DataPoint
    })
  }

  /** 获取 Y 值范围 */
  getYRange(): { min: number; max: number } {
    const values = this.processedData.map(d => d.y)
    if (values.length === 0) return { min: 0, max: 100 }

    let min = Math.min(...values)
    let max = Math.max(...values)

    // 添加边距
    const range = max - min
    if (range === 0) {
      min -= 1
      max += 1
    }

    return { min, max }
  }

  /** 数据点转像素坐标 */
  dataToPixel(dataPoint: DataPoint): Point | null {
    if (!this.context?.xAxis || !this.context?.yAxis) return null

    // 处理 Date 类型转换为数字
    const xValue = dataPoint.x instanceof Date ? dataPoint.x.getTime() : dataPoint.x
    const x = this.context.xAxis.valueToPixel(xValue)
    const y = this.context.yAxis.valueToPixel(dataPoint.y)

    return { x, y }
  }

  /** 渲染系列 */
  abstract render(renderer: BaseRenderer): void

  /** 命中测试 */
  abstract hitTest(point: Point): DataPoint | null
}
