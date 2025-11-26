/**
 * 折线图系列
 */

import type { Point, DataPoint, LineSeriesOptions } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { BaseSeries } from './BaseSeries'
import { isPointInCircle } from '../utils/math'

const defaultOptions: Partial<LineSeriesOptions> = {
  type: 'line',
  smooth: false,
  showSymbol: true,
  symbol: 'circle',
  symbolSize: 4,
  connectNulls: false,
}

export class LineSeries extends BaseSeries<LineSeriesOptions> {
  constructor(options: LineSeriesOptions) {
    super({ ...defaultOptions, ...options } as LineSeriesOptions)
  }

  render(renderer: BaseRenderer): void {
    if (!this.context) return

    const points = this.getPixelPoints()
    if (points.length === 0) return

    // 绘制区域填充
    if (this.options.areaStyle) {
      this.renderArea(renderer, points)
    }

    // 绘制线条
    this.renderLine(renderer, points)

    // 绘制数据点
    if (this.options.showSymbol !== false) {
      this.renderSymbols(renderer, points)
    }
  }

  private getPixelPoints(): Point[] {
    const points: Point[] = []

    for (const dataPoint of this.processedData) {
      const pixel = this.dataToPixel(dataPoint)
      if (pixel) points.push(pixel)
    }

    return points
  }

  private renderLine(renderer: BaseRenderer, points: Point[]): void {
    if (points.length < 2) return

    const { smooth, step } = this.options
    let renderPoints: Point[]

    if (step) {
      renderPoints = this.getStepPoints(points)
    } else if (smooth) {
      renderPoints = this.getSmoothPoints(points)
    } else {
      renderPoints = points
    }

    renderer.drawLine(renderPoints, {
      color: this.getColor(),
      width: this.options.style?.line?.width ?? 2,
      ...this.options.style?.line,
    })
  }

  private renderArea(renderer: BaseRenderer, points: Point[]): void {
    if (points.length < 2 || !this.context) return

    const { plotArea } = this.context
    const areaPoints = [
      { x: points[0].x, y: plotArea.y + plotArea.height },
      ...points,
      { x: points[points.length - 1].x, y: plotArea.y + plotArea.height },
    ]

    renderer.drawPolygon(areaPoints, {
      color: this.options.areaStyle?.color ?? this.getColor(),
      opacity: this.options.areaStyle?.opacity ?? 0.3,
    })
  }

  private renderSymbols(renderer: BaseRenderer, points: Point[]): void {
    const { symbol = 'circle', symbolSize = 4 } = this.options
    const color = this.getColor()

    points.forEach(point => {
      if (symbol === 'circle') {
        renderer.drawCircle(point, symbolSize, { color }, { color: '#fff', width: 1 })
      } else if (symbol === 'rect') {
        renderer.drawRect(
          {
            x: point.x - symbolSize,
            y: point.y - symbolSize,
            width: symbolSize * 2,
            height: symbolSize * 2,
          },
          { color }
        )
      } else if (symbol === 'diamond') {
        renderer.drawPolygon(
          [
            { x: point.x, y: point.y - symbolSize },
            { x: point.x + symbolSize, y: point.y },
            { x: point.x, y: point.y + symbolSize },
            { x: point.x - symbolSize, y: point.y },
          ],
          { color }
        )
      } else if (symbol === 'triangle') {
        renderer.drawPolygon(
          [
            { x: point.x, y: point.y - symbolSize },
            { x: point.x + symbolSize, y: point.y + symbolSize },
            { x: point.x - symbolSize, y: point.y + symbolSize },
          ],
          { color }
        )
      }
    })
  }

  private getStepPoints(points: Point[]): Point[] {
    const result: Point[] = []
    const { step } = this.options

    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[i + 1]

      result.push(current)

      if (next) {
        if (step === 'start') {
          result.push({ x: current.x, y: next.y })
        } else if (step === 'end') {
          result.push({ x: next.x, y: current.y })
        } else {
          // middle
          const midX = (current.x + next.x) / 2
          result.push({ x: midX, y: current.y })
          result.push({ x: midX, y: next.y })
        }
      }
    }

    return result
  }

  private getSmoothPoints(points: Point[]): Point[] {
    // 简单的贝塞尔曲线插值
    if (points.length < 3) return points

    const result: Point[] = [points[0]]
    const tension = typeof this.options.smooth === 'number' ? this.options.smooth : 0.3

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]

      for (let t = 0; t <= 1; t += 0.1) {
        const x = this.catmullRom(p0.x, p1.x, p2.x, p3.x, t, tension)
        const y = this.catmullRom(p0.y, p1.y, p2.y, p3.y, t, tension)
        result.push({ x, y })
      }
    }

    result.push(points[points.length - 1])
    return result
  }

  private catmullRom(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number,
    tension: number
  ): number {
    const t2 = t * t
    const t3 = t2 * t

    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * t * tension +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 * tension +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3 * tension)
    )
  }

  hitTest(point: Point): DataPoint | null {
    const { symbolSize = 4 } = this.options
    const hitRadius = Math.max(symbolSize * 2, 10)

    for (let i = 0; i < this.processedData.length; i++) {
      const dataPoint = this.processedData[i]
      const pixel = this.dataToPixel(dataPoint)

      if (pixel && isPointInCircle(point, pixel, hitRadius)) {
        return dataPoint
      }
    }

    return null
  }
}
