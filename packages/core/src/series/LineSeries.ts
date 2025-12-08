/**
 * 折线图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { PathCommand } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { SeriesOption } from '../types'

/**
 * 折线图配置选项
 */
export interface LineSeriesOption extends SeriesOption {
  type: 'line'
  data: number[]
  smooth?: boolean
  showSymbol?: boolean
  symbolSize?: number
  lineStyle?: {
    color?: string
    width?: number
  }
}

/**
 * 折线图系列类
 */
export class LineSeries extends Series {
  protected declare option: LineSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null

  constructor(
    option: LineSeriesOption,
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
    return 'line'
  }

  /**
   * 渲染折线图
   */
  render(renderer: IRenderer): void {
    if (!this.coordinate || !this.xScale || !this.yScale || this.data.length === 0) {
      return
    }

    const points = this.calculatePoints()
    if (points.length === 0) return

    // 绘制线条
    this.renderLine(renderer, points)

    // 绘制数据点
    if (this.option.showSymbol !== false) {
      this.renderPoints(renderer, points)
    }
  }

  /**
   * 计算屏幕坐标点
   */
  private calculatePoints(): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = []

    if (!this.coordinate || !this.xScale || !this.yScale) {
      return points
    }

    const dataLength = this.data.length

    for (let i = 0; i < dataLength; i++) {
      const value = this.data[i]
      if (typeof value !== 'number') continue

      // 使用比例尺映射数据
      const dataX = this.xScale.map(i)
      const dataY = this.yScale.map(value)

      const screenPoint = this.coordinate.dataToPoint([dataX, dataY])
      points.push(screenPoint)
    }

    return points
  }

  /**
   * 渲染线条
   */
  private renderLine(renderer: IRenderer, points: Array<{ x: number; y: number }>): void {
    const commands: PathCommand[] = []

    // 移动到第一个点
    if (points[0]) {
      commands.push({ type: 'M', x: points[0].x, y: points[0].y })
    }

    // 连接其余点
    for (let i = 1; i < points.length; i++) {
      const point = points[i]!
      commands.push({ type: 'L', x: point.x, y: point.y })
    }

    const itemStyle = this.option.itemStyle || {}
    renderer.drawPath(
      { commands },
      {
        stroke: (itemStyle.color as string) || '#5470c6',
        lineWidth: itemStyle.borderWidth || 2,
        fill: undefined,
      }
    )
  }

  /**
   * 渲染数据点
   */
  private renderPoints(renderer: IRenderer, points: Array<{ x: number; y: number }>): void {
    const itemStyle = this.option.itemStyle || {}
    const pointRadius = 4

    for (const point of points) {
      renderer.drawCircle(
        {
          x: point.x,
          y: point.y,
          radius: pointRadius,
        },
        {
          fill: (itemStyle.color as string) || '#5470c6',
          stroke: '#fff',
          lineWidth: 2,
        }
      )
    }
  }
}