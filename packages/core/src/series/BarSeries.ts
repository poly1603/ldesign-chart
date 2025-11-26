/**
 * 柱状图系列
 */

import type { Point, DataPoint, BarSeriesOptions, Rect } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { BaseSeries } from './BaseSeries'
import { isPointInRect } from '../utils/math'
import { parseSize } from '../utils/data'

const defaultOptions: Partial<BarSeriesOptions> = {
  type: 'bar',
  barWidth: '60%',
  barGap: '30%',
  borderRadius: 0,
}

export class BarSeries extends BaseSeries<BarSeriesOptions> {
  private barRects: Rect[] = []

  constructor(options: BarSeriesOptions) {
    super({ ...defaultOptions, ...options } as BarSeriesOptions)
  }

  render(renderer: BaseRenderer): void {
    if (!this.context) return

    this.barRects = []
    const rects = this.calculateBarRects()

    rects.forEach(rect => {
      this.barRects.push(rect)

      const borderRadius = this.options.borderRadius
      const fill = { color: this.getColor() }
      const stroke = this.options.style?.line
        ? { color: this.options.style.line.color, width: this.options.style.line.width }
        : undefined

      if (borderRadius) {
        // 简化处理：绘制带圆角的矩形
        this.drawRoundedRect(renderer, rect, borderRadius, fill, stroke)
      } else {
        renderer.drawRect(rect, fill, stroke)
      }
    })
  }

  private calculateBarRects(): Rect[] {
    if (!this.context?.xAxis || !this.context?.yAxis) return []

    const { plotArea } = this.context
    const dataCount = this.processedData.length
    if (dataCount === 0) return []

    // 计算柱宽
    const categoryWidth = plotArea.width / dataCount
    const barWidthRatio = this.parseBarWidth(this.options.barWidth, categoryWidth)
    const barWidth = categoryWidth * barWidthRatio

    const rects: Rect[] = []
    const baseY = this.context.yAxis.valueToPixel(0)

    this.processedData.forEach((dataPoint, index) => {
      const pixel = this.dataToPixel(dataPoint)
      if (!pixel) return

      const x = pixel.x - barWidth / 2
      const y = Math.min(pixel.y, baseY)
      const height = Math.abs(pixel.y - baseY)

      rects.push({ x, y, width: barWidth, height })
    })

    return rects
  }

  private parseBarWidth(width: number | string | undefined, categoryWidth: number): number {
    if (width === undefined) return 0.6

    if (typeof width === 'number') {
      return width / categoryWidth
    }

    if (width.endsWith('%')) {
      return parseFloat(width) / 100
    }

    return parseFloat(width) / categoryWidth
  }

  private drawRoundedRect(
    renderer: BaseRenderer,
    rect: Rect,
    radius: number | number[],
    fill?: { color: string },
    stroke?: { color?: string; width?: number }
  ): void {
    const r = Array.isArray(radius) ? radius : [radius, radius, radius, radius]
    const { x, y, width, height } = rect

    // 使用路径绘制圆角矩形
    const path = `
      M ${x + r[0]} ${y}
      L ${x + width - r[1]} ${y}
      Q ${x + width} ${y} ${x + width} ${y + r[1]}
      L ${x + width} ${y + height - r[2]}
      Q ${x + width} ${y + height} ${x + width - r[2]} ${y + height}
      L ${x + r[3]} ${y + height}
      Q ${x} ${y + height} ${x} ${y + height - r[3]}
      L ${x} ${y + r[0]}
      Q ${x} ${y} ${x + r[0]} ${y}
      Z
    `

    renderer.drawPath(path, fill, stroke)
  }

  hitTest(point: Point): DataPoint | null {
    for (let i = 0; i < this.barRects.length; i++) {
      if (isPointInRect(point, this.barRects[i])) {
        return this.processedData[i]
      }
    }
    return null
  }
}
