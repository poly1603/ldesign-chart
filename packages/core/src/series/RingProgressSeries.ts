/**
 * 环形进度图系列
 */

import type { IRenderer, PathCommand } from '../renderer/interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 环形进度数据项
 */
export interface RingProgressDataItem {
  value: number
  name?: string
  itemStyle?: {
    color?: string
  }
}

/**
 * 环形进度图配置选项
 */
export interface RingProgressSeriesOption {
  type: 'ringProgress'
  name?: string
  data: RingProgressDataItem[]
  center?: [number | string, number | string]
  radius?: [number | string, number | string]
  startAngle?: number
  endAngle?: number
  clockwise?: boolean
  roundCap?: boolean
  gap?: number
  trackStyle?: {
    color?: string
    opacity?: number
  }
  itemStyle?: {
    color?: string | string[] | ((params: { dataIndex: number; value: number }) => string)
  }
  label?: {
    show?: boolean
    fontSize?: number
    color?: string
    formatter?: string | ((value: number, name?: string) => string)
  }
  title?: {
    show?: boolean
    text?: string
    fontSize?: number
    color?: string
    offsetY?: number
  }
}

// 默认颜色
const DEFAULT_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']

/**
 * 环形进度图系列类
 */
export class RingProgressSeries extends EventEmitter {
  protected option: RingProgressSeriesOption
  private containerWidth = 800
  private containerHeight = 400

  constructor(option: RingProgressSeriesOption, containerWidth?: number, containerHeight?: number) {
    super()
    this.option = option
    if (containerWidth !== undefined) this.containerWidth = containerWidth
    if (containerHeight !== undefined) this.containerHeight = containerHeight
  }

  get type(): string {
    return 'ringProgress'
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
  }

  /**
   * 渲染环形进度图
   */
  render(renderer: IRenderer): void {
    const { data } = this.option
    if (!data || data.length === 0) return

    const { cx, cy, innerRadius, outerRadius } = this.calculateGeometry()
    const gap = this.option.gap ?? 3

    // 单个进度条
    if (data.length === 1 && data[0]) {
      this.renderSingleProgress(renderer, data[0], cx, cy, innerRadius, outerRadius)
    } else {
      // 多个进度条（堆叠）
      this.renderMultiProgress(renderer, data, cx, cy, innerRadius, outerRadius, gap)
    }

    // 渲染中心标签
    if (this.option.label?.show !== false) {
      this.renderCenterLabel(renderer, cx, cy)
    }

    // 渲染标题
    if (this.option.title?.show !== false && this.option.title?.text) {
      this.renderTitle(renderer, cx, cy)
    }
  }

  /**
   * 计算几何参数
   */
  private calculateGeometry(): {
    cx: number
    cy: number
    innerRadius: number
    outerRadius: number
  } {
    const center = this.option.center || ['50%', '50%']
    const radius = this.option.radius || ['60%', '70%']

    const cx = this.parsePosition(center[0], this.containerWidth)
    const cy = this.parsePosition(center[1], this.containerHeight)

    const minSize = Math.min(this.containerWidth, this.containerHeight)
    const innerRadius = this.parseRadius(radius[0], minSize)
    const outerRadius = this.parseRadius(radius[1], minSize)

    return { cx, cy, innerRadius, outerRadius }
  }

  /**
   * 解析位置值
   */
  private parsePosition(value: number | string, total: number): number {
    if (typeof value === 'number') return value
    if (value.endsWith('%')) {
      return (parseFloat(value) / 100) * total
    }
    return parseFloat(value)
  }

  /**
   * 解析半径值
   */
  private parseRadius(value: number | string, containerSize: number): number {
    if (typeof value === 'number') return value
    if (value.endsWith('%')) {
      return (parseFloat(value) / 100) * containerSize / 2
    }
    return parseFloat(value)
  }

  /**
   * 角度转弧度
   */
  private degToRad(deg: number): number {
    return (deg * Math.PI) / 180
  }

  /**
   * 渲染单个进度条 - 完整圆环进度
   */
  private renderSingleProgress(
    renderer: IRenderer,
    item: RingProgressDataItem,
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number
  ): void {
    // 从顶部开始，顺时针方向
    const startAngle = this.degToRad(this.option.startAngle ?? 90)
    const endAngle = this.degToRad(this.option.endAngle ?? -270)
    const clockwise = this.option.clockwise !== false
    const lineWidth = outerRadius - innerRadius
    const radius = (innerRadius + outerRadius) / 2

    // 渲染完整的背景轨道圆环
    const trackStyle = this.option.trackStyle
    this.drawFullCircle(renderer, cx, cy, radius, {
      stroke: trackStyle?.color || '#e6ebf8',
      lineWidth,
      opacity: trackStyle?.opacity ?? 0.3,
    })

    // 计算进度角度
    const value = Math.max(0, Math.min(1, item.value))
    const totalAngle = Math.abs(endAngle - startAngle)
    const progressAngle = clockwise
      ? startAngle - totalAngle * value
      : startAngle + totalAngle * value

    // 获取颜色
    const color = this.getColor(item, 0)

    // 渲染进度
    if (value > 0) {
      this.drawArc(renderer, cx, cy, radius, startAngle, progressAngle, clockwise, {
        stroke: color,
        lineWidth,
      })

      // 圆角端点
      if (this.option.roundCap !== false) {
        const halfLineWidth = lineWidth / 2

        // 起点圆角
        const startX = cx + radius * Math.cos(startAngle)
        const startY = cy - radius * Math.sin(startAngle)
        renderer.drawCircle(
          { x: startX, y: startY, radius: halfLineWidth },
          { fill: color }
        )

        // 终点圆角
        const endX = cx + radius * Math.cos(progressAngle)
        const endY = cy - radius * Math.sin(progressAngle)
        renderer.drawCircle(
          { x: endX, y: endY, radius: halfLineWidth },
          { fill: color }
        )
      }
    }
  }

  /**
   * 绘制完整圆环
   */
  private drawFullCircle(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    style: { stroke?: string; lineWidth?: number; opacity?: number }
  ): void {
    renderer.drawCircle(
      { x: cx, y: cy, radius },
      {
        stroke: style.stroke,
        lineWidth: style.lineWidth,
        fill: undefined,
        opacity: style.opacity,
      }
    )
  }

  /**
   * 渲染多个进度条
   */
  private renderMultiProgress(
    renderer: IRenderer,
    data: RingProgressDataItem[],
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    gap: number
  ): void {
    const count = data.length
    const totalWidth = outerRadius - innerRadius
    const ringWidth = (totalWidth - gap * (count - 1)) / count

    const startAngle = this.degToRad(this.option.startAngle ?? 90)
    const endAngle = this.degToRad(this.option.endAngle ?? -270)
    const clockwise = this.option.clockwise !== false
    const totalAngle = Math.abs(endAngle - startAngle)

    data.forEach((item, index) => {
      const ringInner = innerRadius + index * (ringWidth + gap)
      const ringOuter = ringInner + ringWidth
      const radius = (ringInner + ringOuter) / 2
      const lineWidth = ringWidth

      // 渲染背景轨道
      const trackStyle = this.option.trackStyle
      this.drawArc(renderer, cx, cy, radius, startAngle, endAngle, clockwise, {
        stroke: trackStyle?.color || '#e6ebf8',
        lineWidth,
        opacity: trackStyle?.opacity ?? 0.3,
      })

      // 计算进度角度
      const value = Math.max(0, Math.min(1, item.value))
      const progressAngle = clockwise
        ? startAngle - totalAngle * value
        : startAngle + totalAngle * value

      // 获取颜色
      const color = this.getColor(item, index)

      // 渲染进度
      if (value > 0) {
        this.drawArc(renderer, cx, cy, radius, startAngle, progressAngle, clockwise, {
          stroke: color,
          lineWidth,
        })

        // 圆角端点
        if (this.option.roundCap !== false) {
          const halfLineWidth = lineWidth / 2

          const startX = cx + radius * Math.cos(startAngle)
          const startY = cy - radius * Math.sin(startAngle)
          renderer.drawCircle(
            { x: startX, y: startY, radius: halfLineWidth },
            { fill: color }
          )

          const endX = cx + radius * Math.cos(progressAngle)
          const endY = cy - radius * Math.sin(progressAngle)
          renderer.drawCircle(
            { x: endX, y: endY, radius: halfLineWidth },
            { fill: color }
          )
        }
      }
    })
  }

  /**
   * 绘制圆弧
   */
  private drawArc(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    clockwise: boolean,
    style: { stroke?: string; lineWidth?: number; opacity?: number }
  ): void {
    const startX = cx + radius * Math.cos(startAngle)
    const startY = cy - radius * Math.sin(startAngle)
    const endX = cx + radius * Math.cos(endAngle)
    const endY = cy - radius * Math.sin(endAngle)

    let angleDiff = Math.abs(startAngle - endAngle)
    if (angleDiff > 2 * Math.PI) angleDiff = 2 * Math.PI
    const largeArc = angleDiff > Math.PI

    const commands: PathCommand[] = [
      { type: 'M', x: startX, y: startY },
      {
        type: 'A',
        rx: radius,
        ry: radius,
        rotation: 0,
        large: largeArc,
        sweep: !clockwise,
        x: endX,
        y: endY,
      },
    ]

    renderer.drawPath({ commands }, {
      stroke: style.stroke,
      lineWidth: style.lineWidth,
      fill: undefined,
      opacity: style.opacity,
    })
  }

  /**
   * 获取颜色
   */
  private getColor(item: RingProgressDataItem, index: number): string {
    if (item.itemStyle?.color) {
      return item.itemStyle.color
    }

    const itemStyle = this.option.itemStyle
    if (typeof itemStyle?.color === 'function') {
      return itemStyle.color({ dataIndex: index, value: item.value })
    }
    if (Array.isArray(itemStyle?.color)) {
      return itemStyle.color[index % itemStyle.color.length] ?? '#5470c6'
    }
    if (typeof itemStyle?.color === 'string') {
      return itemStyle.color
    }

    return DEFAULT_COLORS[index % DEFAULT_COLORS.length] ?? '#5470c6'
  }

  /**
   * 渲染中心标签
   */
  private renderCenterLabel(renderer: IRenderer, cx: number, cy: number): void {
    const label = this.option.label
    if (label?.show === false) return

    const { data } = this.option

    // 计算显示值
    let displayValue: string
    const primaryItem = data[0]
    const value = primaryItem?.value ?? 0

    if (typeof label?.formatter === 'function') {
      displayValue = label.formatter(value, primaryItem?.name)
    } else if (typeof label?.formatter === 'string') {
      displayValue = label.formatter
        .replace('{value}', (value * 100).toFixed(0))
        .replace('{name}', primaryItem?.name || '')
    } else {
      displayValue = `${(value * 100).toFixed(0)}%`
    }

    renderer.drawText(
      { text: displayValue, x: cx, y: cy },
      {
        fill: label?.color ?? '#333',
        fontSize: label?.fontSize ?? 36,
        fontWeight: 'bold',
        textAlign: 'center',
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 渲染标题
   */
  private renderTitle(renderer: IRenderer, cx: number, cy: number): void {
    const title = this.option.title
    if (!title?.text) return

    const offsetY = title.offsetY ?? 30

    renderer.drawText(
      { text: title.text!, x: cx, y: cy + offsetY },
      {
        fill: title.color ?? '#666',
        fontSize: title.fontSize ?? 14,
        textAlign: 'center',
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<RingProgressSeriesOption>): void {
    this.option = { ...this.option, ...option }
  }

  /**
   * 获取配置
   */
  getOption(): RingProgressSeriesOption {
    return { ...this.option }
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.removeAllListeners()
  }
}
