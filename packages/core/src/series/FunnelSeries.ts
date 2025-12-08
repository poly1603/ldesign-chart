/**
 * 漏斗图系列
 */

import type { IRenderer, PathCommand } from '../renderer/interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 漏斗图数据项
 */
export interface FunnelDataItem {
  value: number
  name: string
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
    opacity?: number
  }
  label?: {
    show?: boolean
    position?: 'left' | 'right' | 'inside' | 'outside'
  }
}

/**
 * 漏斗图配置选项
 */
export interface FunnelSeriesOption {
  type: 'funnel'
  name?: string
  data: FunnelDataItem[]
  left?: number | string
  right?: number | string
  top?: number | string
  bottom?: number | string
  width?: number | string
  height?: number | string
  min?: number
  max?: number
  minSize?: number | string
  maxSize?: number | string
  orient?: 'vertical' | 'horizontal'
  sort?: 'ascending' | 'descending' | 'none'
  gap?: number
  funnelAlign?: 'left' | 'right' | 'center'
  itemStyle?: {
    color?: string | ((params: { dataIndex: number; data: FunnelDataItem }) => string)
    borderColor?: string
    borderWidth?: number
    opacity?: number
  }
  label?: {
    show?: boolean
    position?: 'left' | 'right' | 'inside' | 'outside'
    formatter?: string | ((params: FunnelDataItem) => string)
    color?: string
    fontSize?: number
  }
  labelLine?: {
    show?: boolean
    length?: number
    lineStyle?: {
      color?: string
      width?: number
    }
  }
}

// 默认颜色
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

/**
 * 漏斗图系列类
 */
export class FunnelSeries extends EventEmitter {
  protected option: FunnelSeriesOption
  private containerWidth = 800
  private containerHeight = 400

  constructor(option: FunnelSeriesOption, containerWidth?: number, containerHeight?: number) {
    super()
    this.option = option
    if (containerWidth !== undefined) this.containerWidth = containerWidth
    if (containerHeight !== undefined) this.containerHeight = containerHeight
  }

  get type(): string {
    return 'funnel'
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
  }

  /**
   * 渲染漏斗图
   */
  render(renderer: IRenderer): void {
    const { data } = this.option
    if (!data || data.length === 0) return

    // 排序数据
    const sortedData = this.getSortedData()

    // 计算布局区域
    const rect = this.calculateRect()

    // 计算每个漏斗段
    const segments = this.calculateSegments(sortedData, rect)

    // 渲染每个段
    segments.forEach((segment, index) => {
      this.renderSegment(renderer, segment, index)

      // 渲染标签
      if (this.option.label?.show !== false) {
        this.renderLabel(renderer, segment, index)
      }
    })
  }

  /**
   * 获取排序后的数据
   */
  private getSortedData(): FunnelDataItem[] {
    const data = [...this.option.data]
    const sort = this.option.sort || 'descending'

    if (sort === 'ascending') {
      return data.sort((a, b) => a.value - b.value)
    } else if (sort === 'descending') {
      return data.sort((a, b) => b.value - a.value)
    }
    return data
  }

  /**
   * 计算布局区域
   */
  private calculateRect(): { x: number; y: number; width: number; height: number } {
    const left = this.parsePosition(this.option.left ?? '10%', this.containerWidth)
    const right = this.parsePosition(this.option.right ?? '10%', this.containerWidth)
    const top = this.parsePosition(this.option.top ?? '10%', this.containerHeight)
    const bottom = this.parsePosition(this.option.bottom ?? '10%', this.containerHeight)

    return {
      x: left,
      y: top,
      width: this.containerWidth - left - right,
      height: this.containerHeight - top - bottom,
    }
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
   * 计算漏斗段
   */
  private calculateSegments(
    data: FunnelDataItem[],
    rect: { x: number; y: number; width: number; height: number }
  ): Array<{
    topWidth: number
    bottomWidth: number
    x: number
    y: number
    height: number
    data: FunnelDataItem
  }> {
    const segments: Array<{
      topWidth: number
      bottomWidth: number
      x: number
      y: number
      height: number
      data: FunnelDataItem
    }> = []

    const { min = 0, max = 100, gap = 2, funnelAlign = 'center' } = this.option
    const minSize = this.parsePosition(this.option.minSize ?? '0%', rect.width)
    const maxSize = this.parsePosition(this.option.maxSize ?? '100%', rect.width)

    const totalHeight = rect.height
    const segmentCount = data.length
    const totalGap = gap * (segmentCount - 1)
    const segmentHeight = (totalHeight - totalGap) / segmentCount

    for (let i = 0; i < segmentCount; i++) {
      const item = data[i]!
      const nextItem = data[i + 1]

      // 计算当前段的宽度比例
      const currentRatio = (item.value - min) / (max - min)
      const nextRatio = nextItem ? (nextItem.value - min) / (max - min) : currentRatio * 0.7

      const topWidth = minSize + (maxSize - minSize) * Math.max(0, Math.min(1, currentRatio))
      const bottomWidth = minSize + (maxSize - minSize) * Math.max(0, Math.min(1, nextRatio))

      // 计算 X 位置
      let x = rect.x
      if (funnelAlign === 'center') {
        x = rect.x + (rect.width - topWidth) / 2
      } else if (funnelAlign === 'right') {
        x = rect.x + rect.width - topWidth
      }

      const y = rect.y + i * (segmentHeight + gap)

      segments.push({
        topWidth,
        bottomWidth,
        x,
        y,
        height: segmentHeight,
        data: item!,
      })
    }

    return segments
  }

  /**
   * 渲染漏斗段
   */
  private renderSegment(
    renderer: IRenderer,
    segment: {
      topWidth: number
      bottomWidth: number
      x: number
      y: number
      height: number
      data: FunnelDataItem
    },
    index: number
  ): void {
    const { funnelAlign = 'center' } = this.option
    const { topWidth, bottomWidth, x, y, height, data } = segment

    // 计算四个角的坐标
    let topLeft: number, topRight: number, bottomLeft: number, bottomRight: number

    if (funnelAlign === 'center') {
      const centerX = x + topWidth / 2
      topLeft = centerX - topWidth / 2
      topRight = centerX + topWidth / 2
      bottomLeft = centerX - bottomWidth / 2
      bottomRight = centerX + bottomWidth / 2
    } else if (funnelAlign === 'left') {
      topLeft = x
      topRight = x + topWidth
      bottomLeft = x
      bottomRight = x + bottomWidth
    } else {
      topRight = x + topWidth
      topLeft = topRight - topWidth
      bottomRight = topRight
      bottomLeft = bottomRight - bottomWidth
    }

    const commands: PathCommand[] = [
      { type: 'M', x: topLeft, y },
      { type: 'L', x: topRight, y },
      { type: 'L', x: bottomRight, y: y + height },
      { type: 'L', x: bottomLeft, y: y + height },
      { type: 'Z' },
    ]

    // 获取颜色
    const itemStyle = this.option.itemStyle || {}
    let color: string

    if (data.itemStyle?.color) {
      color = data.itemStyle.color
    } else if (typeof itemStyle.color === 'function') {
      color = itemStyle.color({ dataIndex: index, data })
    } else if (typeof itemStyle.color === 'string') {
      color = itemStyle.color
    } else {
      color = DEFAULT_COLORS[index % DEFAULT_COLORS.length] ?? '#5470c6'
    }

    renderer.drawPath(
      { commands },
      {
        fill: color,
        stroke: data.itemStyle?.borderColor || itemStyle.borderColor || '#fff',
        lineWidth: data.itemStyle?.borderWidth ?? itemStyle.borderWidth ?? 1,
        opacity: data.itemStyle?.opacity ?? itemStyle.opacity ?? 1,
      }
    )
  }

  /**
   * 渲染标签
   */
  private renderLabel(
    renderer: IRenderer,
    segment: {
      topWidth: number
      bottomWidth: number
      x: number
      y: number
      height: number
      data: FunnelDataItem
    },
    _index: number
  ): void {
    const label = this.option.label
    if (label?.show === false) return

    const { topWidth, x, y, height, data } = segment
    const position = data.label?.position || label?.position || 'outside'

    // 格式化文本
    let text: string
    if (typeof label?.formatter === 'function') {
      text = label.formatter(data)
    } else if (typeof label?.formatter === 'string') {
      text = label.formatter
        .replace('{name}', data.name)
        .replace('{value}', String(data.value))
    } else {
      text = data.name || ''
    }

    // 计算标签位置
    const centerY = y + height / 2
    let labelX: number
    let textAlign: 'left' | 'center' | 'right' = 'left'

    if (position === 'inside') {
      labelX = x + topWidth / 2
      textAlign = 'center'
    } else if (position === 'left') {
      labelX = x - 10
      textAlign = 'right'

      // 渲染引导线
      if (this.option.labelLine?.show !== false) {
        this.renderLabelLine(renderer, x, centerY, labelX + 5, centerY)
      }
    } else if (position === 'right' || position === 'outside') {
      labelX = x + topWidth + 10
      textAlign = 'left'

      // 渲染引导线
      if (this.option.labelLine?.show !== false) {
        this.renderLabelLine(renderer, x + topWidth, centerY, labelX - 5, centerY)
      }
    } else {
      labelX = x + topWidth + 10
      textAlign = 'left'
    }

    renderer.drawText(
      { text, x: labelX, y: centerY },
      {
        fill: label?.color || '#333',
        fontSize: label?.fontSize || 12,
        textAlign,
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 渲染引导线
   */
  private renderLabelLine(
    renderer: IRenderer,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    const labelLine = this.option.labelLine

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: x1, y: y1 },
          { type: 'L', x: x2, y: y2 },
        ],
      },
      {
        stroke: labelLine?.lineStyle?.color || '#999',
        lineWidth: labelLine?.lineStyle?.width || 1,
      }
    )
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<FunnelSeriesOption>): void {
    this.option = { ...this.option, ...option }
  }

  /**
   * 获取配置
   */
  getOption(): FunnelSeriesOption {
    return { ...this.option }
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.removeAllListeners()
  }
}
