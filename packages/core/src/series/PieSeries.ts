/**
 * 饼图系列
 */

import type { Point, DataPoint, PieSeriesOptions } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { BaseSeries, SeriesContext } from './BaseSeries'
import { parseSize } from '../utils/data'
import { degToRad, distance, angle } from '../utils/math'

const defaultOptions: Partial<PieSeriesOptions> = {
  type: 'pie',
  center: ['50%', '50%'],
  radius: ['0%', '75%'],
  startAngle: 90,
  clockwise: true,
  roseType: false,
}

interface PieSlice {
  startAngle: number
  endAngle: number
  innerRadius: number
  outerRadius: number
  dataIndex: number
  color: string
}

export class PieSeries extends BaseSeries<PieSeriesOptions> {
  private slices: PieSlice[] = []
  private center: Point = { x: 0, y: 0 }
  private innerRadius: number = 0
  private outerRadius: number = 0

  constructor(options: PieSeriesOptions) {
    super({ ...defaultOptions, ...options } as PieSeriesOptions)
  }

  setContext(context: SeriesContext): void {
    super.setContext(context)
    this.calculateGeometry()
  }

  private calculateGeometry(): void {
    if (!this.context) return

    const { plotArea, colors } = this.context
    const { center = ['50%', '50%'], radius = ['0%', '75%'] } = this.options

    // 计算圆心
    this.center = {
      x: plotArea.x + parseSize(center[0], plotArea.width),
      y: plotArea.y + parseSize(center[1], plotArea.height),
    }

    // 计算半径
    const maxRadius = Math.min(plotArea.width, plotArea.height) / 2
    const radiusArray = Array.isArray(radius) ? radius : ['0%', radius]
    this.innerRadius = parseSize(radiusArray[0], maxRadius)
    this.outerRadius = parseSize(radiusArray[1], maxRadius)

    // 计算每个扇形
    this.calculateSlices(colors)
  }

  private calculateSlices(colors: string[]): void {
    const total = this.processedData.reduce((sum, d) => sum + d.y, 0)
    if (total === 0) return

    const { startAngle = 90, clockwise = true, roseType } = this.options

    let currentAngle = degToRad(startAngle)
    this.slices = []

    this.processedData.forEach((dataPoint, index) => {
      const value = dataPoint.y
      const ratio = value / total
      const angleSpan = ratio * Math.PI * 2 * (clockwise ? -1 : 1)

      let innerR = this.innerRadius
      let outerR = this.outerRadius

      // 南丁格尔玫瑰图
      if (roseType) {
        if (roseType === 'radius') {
          outerR = this.innerRadius + (this.outerRadius - this.innerRadius) * ratio * this.processedData.length
        } else {
          // area
          const areaRatio = Math.sqrt(ratio * this.processedData.length)
          outerR = this.innerRadius + (this.outerRadius - this.innerRadius) * areaRatio
        }
      }

      this.slices.push({
        startAngle: currentAngle,
        endAngle: currentAngle + angleSpan,
        innerRadius: innerR,
        outerRadius: outerR,
        dataIndex: index,
        color: colors[index % colors.length],
      })

      currentAngle += angleSpan
    })
  }

  render(renderer: BaseRenderer): void {
    if (!this.context) return

    this.slices.forEach(slice => {
      renderer.drawSector(
        this.center,
        slice.innerRadius,
        slice.outerRadius,
        slice.startAngle,
        slice.endAngle,
        { color: slice.color },
        { color: '#fff', width: 1 }
      )
    })

    // 绘制标签
    if (this.options.label?.show !== false) {
      this.renderLabels(renderer)
    }
  }

  private renderLabels(renderer: BaseRenderer): void {
    const { label } = this.options

    this.slices.forEach((slice, index) => {
      const dataPoint = this.processedData[index]
      const midAngle = (slice.startAngle + slice.endAngle) / 2

      const labelRadius = slice.outerRadius + 20
      const labelPos: Point = {
        x: this.center.x + Math.cos(midAngle) * labelRadius,
        y: this.center.y + Math.sin(midAngle) * labelRadius,
      }

      let text = String(dataPoint.x)
      if (label?.formatter) {
        if (typeof label.formatter === 'function') {
          text = label.formatter({
            name: String(dataPoint.x),
            value: dataPoint.y,
            dataIndex: index,
          })
        } else {
          text = label.formatter
            .replace(/{b}/g, String(dataPoint.x))
            .replace(/{c}/g, String(dataPoint.y))
            .replace(/{d}/g, String(Math.round(dataPoint.y / this.getTotal() * 100)))
        }
      }

      renderer.drawText(text, labelPos, {
        fontSize: 12,
        color: '#333',
        align: Math.cos(midAngle) > 0 ? 'left' : 'right',
        baseline: 'middle',
        ...label?.style,
      })
    })
  }

  private getTotal(): number {
    return this.processedData.reduce((sum, d) => sum + d.y, 0)
  }

  hitTest(point: Point): DataPoint | null {
    const dist = distance(point, this.center)

    for (const slice of this.slices) {
      if (dist < slice.innerRadius || dist > slice.outerRadius) continue

      let ang = angle(this.center, point)
      // 标准化角度
      const start = Math.min(slice.startAngle, slice.endAngle)
      const end = Math.max(slice.startAngle, slice.endAngle)

      if (ang >= start && ang <= end) {
        return this.processedData[slice.dataIndex]
      }
    }

    return null
  }

  /** 获取 Y 值范围（饼图不需要） */
  getYRange(): { min: number; max: number } {
    return { min: 0, max: 100 }
  }
}
