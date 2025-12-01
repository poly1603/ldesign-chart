/**
 * 面积图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { SeriesOption } from '../types'
import type { PathCommand } from '../renderer/interface'

/**
 * 面积图配置选项
 */
export interface AreaSeriesOption extends SeriesOption {
  type: 'area'
  data: number[]
  smooth?: boolean  // 是否平滑曲线
  areaStyle?: {
    color?: string
    opacity?: number
  }
  lineStyle?: {
    color?: string
    width?: number
  }
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
  }
  showSymbol?: boolean  // 是否显示数据点
  symbolSize?: number   // 数据点大小
}

/**
 * 面积图系列类
 */
export class AreaSeries extends Series {
  protected declare option: AreaSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null

  constructor(
    option: AreaSeriesOption,
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
    return 'area'
  }

  /**
   * 渲染面积图
   */
  render(renderer: IRenderer): void {
    if (!this.coordinate || !this.xScale || !this.yScale || this.data.length === 0) {
      return
    }

    const points = this.calculatePoints()
    if (points.length === 0) return

    // 绘制面积
    this.renderArea(renderer, points)

    // 绘制线条
    this.renderLine(renderer, points)

    // 绘制数据点
    if (this.option.showSymbol) {
      this.renderPoints(renderer, points)
    }
  }

  /**
   * 计算屏幕坐标点
   */
  private calculatePoints(): Array<{ x: number; y: number; value: number }> {
    const points: Array<{ x: number; y: number; value: number }> = []

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

      // 转换为屏幕坐标
      const screenPoint = this.coordinate.dataToPoint([dataX, dataY])
      points.push({
        x: screenPoint.x,
        y: screenPoint.y,
        value,
      })
    }

    return points
  }

  /**
   * 渲染面积
   */
  private renderArea(renderer: IRenderer, points: Array<{ x: number; y: number }>): void {
    if (points.length === 0 || !this.coordinate || !this.yScale) return

    const commands: PathCommand[] = []
    const areaStyle = this.option.areaStyle || {}

    // 获取基线 Y 坐标
    const baselineY = this.coordinate.dataToPoint([0, this.yScale.map(0)]).y

    // 移动到第一个点
    if (points[0]) {
      commands.push({ type: 'M', x: points[0].x, y: baselineY })
      commands.push({ type: 'L', x: points[0].x, y: points[0].y })
    }

    // 绘制上边界
    if (this.option.smooth) {
      // 平滑曲线 - 使用简单的贝塞尔曲线
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!
        const curr = points[i]!
        
        // 计算控制点
        const cpX = (prev.x + curr.x) / 2
        
        commands.push({
          type: 'Q',
          x1: cpX,
          y1: prev.y,
          x: curr.x,
          y: curr.y,
        })
      }
    } else {
      // 直线连接
      for (let i = 1; i < points.length; i++) {
        const point = points[i]!
        commands.push({ type: 'L', x: point.x, y: point.y })
      }
    }

    // 连接到基线
    const lastPoint = points[points.length - 1]
    if (lastPoint) {
      commands.push({ type: 'L', x: lastPoint.x, y: baselineY })
    }

    // 闭合路径
    commands.push({ type: 'Z' })

    // 渲染面积
    renderer.drawPath(
      { commands },
      {
        fill: (areaStyle.color as string) || 'rgba(84, 112, 198, 0.3)',
        stroke: undefined,
        opacity: areaStyle.opacity !== undefined ? areaStyle.opacity : 0.3,
      }
    )
  }

  /**
   * 渲染线条
   */
  private renderLine(renderer: IRenderer, points: Array<{ x: number; y: number }>): void {
    if (points.length === 0) return

    const commands: PathCommand[] = []
    const lineStyle = this.option.lineStyle || {}

    // 移动到第一个点
    if (points[0]) {
      commands.push({ type: 'M', x: points[0].x, y: points[0].y })
    }

    // 连接其余点
    if (this.option.smooth) {
      // 平滑曲线
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!
        const curr = points[i]!
        
        const cpX = (prev.x + curr.x) / 2
        
        commands.push({
          type: 'Q',
          x1: cpX,
          y1: prev.y,
          x: curr.x,
          y: curr.y,
        })
      }
    } else {
      // 直线
      for (let i = 1; i < points.length; i++) {
        const point = points[i]!
        commands.push({ type: 'L', x: point.x, y: point.y })
      }
    }

    renderer.drawPath(
      { commands },
      {
        stroke: (lineStyle.color as string) || '#5470c6',
        lineWidth: lineStyle.width || 2,
        fill: undefined,
      }
    )
  }

  /**
   * 渲染数据点
   */
  private renderPoints(renderer: IRenderer, points: Array<{ x: number; y: number }>): void {
    const itemStyle = this.option.itemStyle || {}
    const symbolSize = this.option.symbolSize || 4

    for (const point of points) {
      renderer.drawCircle(
        {
          x: point.x,
          y: point.y,
          radius: symbolSize,
        },
        {
          fill: (itemStyle.color as string) || '#5470c6',
          stroke: (itemStyle.borderColor as string) || '#fff',
          lineWidth: itemStyle.borderWidth || 2,
        }
      )
    }
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