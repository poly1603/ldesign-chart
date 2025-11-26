/**
 * 散点图系列
 */

import type { Point, DataPoint, ScatterSeriesOptions } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { BaseSeries } from './BaseSeries'
import { isPointInCircle } from '../utils/math'

const defaultOptions: Partial<ScatterSeriesOptions> = {
  type: 'scatter',
  symbol: 'circle',
  symbolSize: 10,
  opacity: 0.8,
}

export class ScatterSeries extends BaseSeries<ScatterSeriesOptions> {
  constructor(options: ScatterSeriesOptions) {
    super({ ...defaultOptions, ...options } as ScatterSeriesOptions)
  }

  render(renderer: BaseRenderer): void {
    if (!this.context) return

    const { symbol = 'circle', symbolSize = 10, opacity = 0.8 } = this.options
    const color = this.getColor()

    this.processedData.forEach(dataPoint => {
      const pixel = this.dataToPixel(dataPoint)
      if (!pixel) return

      const size = typeof symbolSize === 'function' ? symbolSize(dataPoint) : symbolSize

      renderer.save()

      if (symbol === 'circle') {
        renderer.drawCircle(pixel, size / 2, { color, opacity }, { color: '#fff', width: 1 })
      } else if (symbol === 'rect') {
        renderer.drawRect(
          { x: pixel.x - size / 2, y: pixel.y - size / 2, width: size, height: size },
          { color, opacity }
        )
      } else if (symbol === 'diamond') {
        renderer.drawPolygon(
          [
            { x: pixel.x, y: pixel.y - size / 2 },
            { x: pixel.x + size / 2, y: pixel.y },
            { x: pixel.x, y: pixel.y + size / 2 },
            { x: pixel.x - size / 2, y: pixel.y },
          ],
          { color, opacity }
        )
      } else if (symbol === 'triangle') {
        renderer.drawPolygon(
          [
            { x: pixel.x, y: pixel.y - size / 2 },
            { x: pixel.x + size / 2, y: pixel.y + size / 2 },
            { x: pixel.x - size / 2, y: pixel.y + size / 2 },
          ],
          { color, opacity }
        )
      }

      renderer.restore()
    })
  }

  hitTest(point: Point): DataPoint | null {
    const { symbolSize = 10 } = this.options
    const baseSize = typeof symbolSize === 'number' ? symbolSize : 10
    const hitRadius = Math.max(baseSize, 10)

    for (const dataPoint of this.processedData) {
      const pixel = this.dataToPixel(dataPoint)
      if (pixel && isPointInCircle(point, pixel, hitRadius)) {
        return dataPoint
      }
    }

    return null
  }
}
