/**
 * 折线图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { PathCommand } from '../renderer/interface'

/**
 * 折线图系列类
 */
export class LineSeries extends Series {
  get type(): string {
    return 'line'
  }

  /**
   * 渲染折线图
   */
  render(renderer: IRenderer): void {
    if (!this.coordinate || this.data.length === 0) {
      return
    }

    const points = this.calculatePoints()
    if (points.length === 0) return

    // 绘制线条
    this.renderLine(renderer, points)

    // 绘制数据点
    if (this.option.itemStyle) {
      this.renderPoints(renderer, points)
    }
  }

  /**
   * 计算屏幕坐标点
   */
  private calculatePoints(): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = []
    const dataLength = this.data.length

    for (let i = 0; i < dataLength; i++) {
      const value = this.data[i]
      if (typeof value !== 'number') continue

      // 将数据转换为 [0, 1] 范围
      const dataX = i / Math.max(1, dataLength - 1)
      const dataY = value // 假设数据已经归一化，实际应用中需要使用比例尺

      const screenPoint = this.coordinate!.dataToPoint([dataX, dataY])
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