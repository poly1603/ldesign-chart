/**
 * 仪表盘系列
 */

import type { IRenderer, PathCommand } from '../renderer/interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 仪表盘数据项
 */
export interface GaugeDataItem {
  value: number
  name?: string
  itemStyle?: {
    color?: string
  }
}

/**
 * 仪表盘配置选项
 */
export interface GaugeSeriesOption {
  type: 'gauge'
  name?: string
  data: GaugeDataItem[]
  min?: number
  max?: number
  startAngle?: number
  endAngle?: number
  center?: [number | string, number | string]
  radius?: number | string
  clockwise?: boolean
  splitNumber?: number
  axisLine?: {
    show?: boolean
    roundCap?: boolean
    lineStyle?: {
      width?: number
      color?: Array<[number, string]>
    }
  }
  progress?: {
    show?: boolean
    overlap?: boolean
    roundCap?: boolean
    width?: number
    itemStyle?: {
      color?: string
    }
  }
  splitLine?: {
    show?: boolean
    length?: number
    distance?: number
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  axisTick?: {
    show?: boolean
    splitNumber?: number
    length?: number
    distance?: number
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  axisLabel?: {
    show?: boolean
    distance?: number
    color?: string
    fontSize?: number
    formatter?: string | ((value: number) => string)
  }
  pointer?: {
    show?: boolean
    length?: number | string
    width?: number
    itemStyle?: {
      color?: string
    }
  }
  anchor?: {
    show?: boolean
    size?: number
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
    }
  }
  title?: {
    show?: boolean
    offsetCenter?: [number | string, number | string]
    color?: string
    fontSize?: number
  }
  detail?: {
    show?: boolean
    offsetCenter?: [number | string, number | string]
    color?: string
    fontSize?: number
    formatter?: string | ((value: number) => string)
  }
}

/**
 * 仪表盘系列类
 */
export class GaugeSeries extends EventEmitter {
  protected option: GaugeSeriesOption
  private containerWidth = 800
  private containerHeight = 400

  constructor(option: GaugeSeriesOption, containerWidth?: number, containerHeight?: number) {
    super()
    this.option = this.mergeDefaultOption(option)
    if (containerWidth !== undefined) this.containerWidth = containerWidth
    if (containerHeight !== undefined) this.containerHeight = containerHeight
  }

  /**
   * 合并默认配置
   */
  private mergeDefaultOption(option: GaugeSeriesOption): GaugeSeriesOption {
    return {
      ...option,
      min: option.min ?? 0,
      max: option.max ?? 100,
      startAngle: option.startAngle ?? 225,
      endAngle: option.endAngle ?? -45,
      splitNumber: option.splitNumber ?? 10,
      axisLine: {
        show: true,
        roundCap: false,
        lineStyle: {
          width: 20,
          color: [[1, '#e6ebf8']],
        },
        ...option.axisLine,
      },
      progress: {
        show: true,
        roundCap: false,
        width: 20,
        ...option.progress,
      },
      pointer: {
        show: true,
        length: '60%',
        width: 6,
        ...option.pointer,
      },
      anchor: {
        show: true,
        size: 10,
        itemStyle: {
          color: '#fff',
          borderColor: '#5470c6',
          borderWidth: 3,
        },
        ...option.anchor,
      },
      title: {
        show: true,
        offsetCenter: [0, '20%'],
        fontSize: 14,
        color: '#666',
        ...option.title,
      },
      detail: {
        show: true,
        offsetCenter: [0, '40%'],
        fontSize: 30,
        color: '#5470c6',
        ...option.detail,
      },
    }
  }

  get type(): string {
    return 'gauge'
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
  }

  /**
   * 渲染仪表盘
   */
  render(renderer: IRenderer): void {
    const { data } = this.option
    if (!data || data.length === 0) return

    const { cx, cy, radius } = this.calculateGeometry()

    // 渲染轴线（背景）
    this.renderAxisLine(renderer, cx, cy, radius)

    // 渲染分隔线
    this.renderSplitLines(renderer, cx, cy, radius)

    // 渲染刻度
    this.renderAxisTicks(renderer, cx, cy, radius)

    // 渲染标签
    this.renderAxisLabels(renderer, cx, cy, radius)

    // 渲染进度
    if (this.option.progress?.show !== false) {
      this.renderProgress(renderer, cx, cy, radius)
    }

    // 渲染数据（指针、标题、数值）
    data.forEach((item, index) => {
      this.renderDataItem(renderer, item, index, cx, cy, radius)
    })
  }

  /**
   * 计算几何参数
   */
  private calculateGeometry(): { cx: number; cy: number; radius: number } {
    const center = this.option.center || ['50%', '50%']
    const radius = this.option.radius || '75%'

    const cx = this.parsePosition(center[0], this.containerWidth)
    const cy = this.parsePosition(center[1], this.containerHeight)

    const minSize = Math.min(this.containerWidth, this.containerHeight)
    const r = this.parseRadius(radius, minSize)

    return { cx, cy, radius: r }
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
   * 渲染轴线
   */
  private renderAxisLine(renderer: IRenderer, cx: number, cy: number, radius: number): void {
    const axisLine = this.option.axisLine
    if (axisLine?.show === false) return

    const lineWidth = axisLine?.lineStyle?.width || 20
    const r = radius - lineWidth / 2
    const startAngle = this.degToRad(this.option.startAngle!)
    const endAngle = this.degToRad(this.option.endAngle!)

    const colorStops = axisLine?.lineStyle?.color || [[1, '#e6ebf8']]

    // 渲染各段颜色
    let prevStop = 0
    for (const [stop, color] of colorStops) {
      const segmentStartAngle = startAngle - (startAngle - endAngle) * prevStop
      const segmentEndAngle = startAngle - (startAngle - endAngle) * stop

      this.drawArc(renderer, cx, cy, r, segmentStartAngle, segmentEndAngle, {
        stroke: color,
        lineWidth,
        fill: undefined,
      })

      prevStop = stop
    }
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
    style: { stroke?: string; lineWidth?: number; fill?: string }
  ): void {
    const startX = cx + radius * Math.cos(startAngle)
    const startY = cy - radius * Math.sin(startAngle)
    const endX = cx + radius * Math.cos(endAngle)
    const endY = cy - radius * Math.sin(endAngle)

    const largeArc = Math.abs(startAngle - endAngle) > Math.PI

    const commands: PathCommand[] = [
      { type: 'M', x: startX, y: startY },
      {
        type: 'A',
        rx: radius,
        ry: radius,
        rotation: 0,
        large: largeArc,
        sweep: false,
        x: endX,
        y: endY,
      },
    ]

    renderer.drawPath({ commands }, style)
  }

  /**
   * 渲染分隔线
   */
  private renderSplitLines(renderer: IRenderer, cx: number, cy: number, radius: number): void {
    const splitLine = this.option.splitLine
    if (splitLine?.show === false) return

    const splitNumber = this.option.splitNumber!
    const startAngle = this.degToRad(this.option.startAngle!)
    const endAngle = this.degToRad(this.option.endAngle!)
    const angleStep = (startAngle - endAngle) / splitNumber

    const lineLength = splitLine?.length ?? 15
    const distance = splitLine?.distance ?? 10
    const outerRadius = radius - distance
    const innerRadius = outerRadius - lineLength

    for (let i = 0; i <= splitNumber; i++) {
      const angle = startAngle - i * angleStep
      const outerX = cx + outerRadius * Math.cos(angle)
      const outerY = cy - outerRadius * Math.sin(angle)
      const innerX = cx + innerRadius * Math.cos(angle)
      const innerY = cy - innerRadius * Math.sin(angle)

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: outerX, y: outerY },
            { type: 'L', x: innerX, y: innerY },
          ],
        },
        {
          stroke: splitLine?.lineStyle?.color || '#999',
          lineWidth: splitLine?.lineStyle?.width || 2,
        }
      )
    }
  }

  /**
   * 渲染刻度
   */
  private renderAxisTicks(renderer: IRenderer, cx: number, cy: number, radius: number): void {
    const axisTick = this.option.axisTick
    if (axisTick?.show === false) return

    const splitNumber = this.option.splitNumber!
    const tickSplitNumber = axisTick?.splitNumber ?? 5
    const startAngle = this.degToRad(this.option.startAngle!)
    const endAngle = this.degToRad(this.option.endAngle!)
    const totalTicks = splitNumber * tickSplitNumber
    const angleStep = (startAngle - endAngle) / totalTicks

    const lineLength = axisTick?.length ?? 6
    const distance = axisTick?.distance ?? 10
    const outerRadius = radius - distance
    const innerRadius = outerRadius - lineLength

    for (let i = 0; i <= totalTicks; i++) {
      // 跳过主刻度位置
      if (i % tickSplitNumber === 0) continue

      const angle = startAngle - i * angleStep
      const outerX = cx + outerRadius * Math.cos(angle)
      const outerY = cy - outerRadius * Math.sin(angle)
      const innerX = cx + innerRadius * Math.cos(angle)
      const innerY = cy - innerRadius * Math.sin(angle)

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: outerX, y: outerY },
            { type: 'L', x: innerX, y: innerY },
          ],
        },
        {
          stroke: axisTick?.lineStyle?.color || '#999',
          lineWidth: axisTick?.lineStyle?.width || 1,
        }
      )
    }
  }

  /**
   * 渲染标签
   */
  private renderAxisLabels(renderer: IRenderer, cx: number, cy: number, radius: number): void {
    const axisLabel = this.option.axisLabel
    if (axisLabel?.show === false) return

    const { min, max, splitNumber } = this.option
    const startAngle = this.degToRad(this.option.startAngle!)
    const endAngle = this.degToRad(this.option.endAngle!)
    const angleStep = (startAngle - endAngle) / splitNumber!

    const distance = axisLabel?.distance ?? 35
    const labelRadius = radius - distance

    for (let i = 0; i <= splitNumber!; i++) {
      const value = min! + ((max! - min!) * i) / splitNumber!
      const angle = startAngle - i * angleStep
      const x = cx + labelRadius * Math.cos(angle)
      const y = cy - labelRadius * Math.sin(angle)

      let text: string
      if (typeof axisLabel?.formatter === 'function') {
        text = axisLabel.formatter(value)
      } else if (typeof axisLabel?.formatter === 'string') {
        text = axisLabel.formatter.replace('{value}', String(value))
      } else {
        text = Math.round(value).toString()
      }

      renderer.drawText(
        { text, x, y },
        {
          fill: axisLabel?.color || '#666',
          fontSize: axisLabel?.fontSize || 12,
          textAlign: 'center',
          textBaseline: 'middle',
        }
      )
    }
  }

  /**
   * 渲染进度
   */
  private renderProgress(renderer: IRenderer, cx: number, cy: number, radius: number): void {
    const progress = this.option.progress
    if (progress?.show === false) return

    const { data, min, max, startAngle, endAngle } = this.option
    const lineWidth = progress?.width || 20
    const r = radius - lineWidth / 2

    const startRad = this.degToRad(startAngle!)
    const endRad = this.degToRad(endAngle!)
    const totalAngle = startRad - endRad

    data.forEach((item, index) => {
      const ratio = Math.max(0, Math.min(1, (item.value - min!) / (max! - min!)))
      const progressEndAngle = startRad - totalAngle * ratio

      const color = item.itemStyle?.color || progress?.itemStyle?.color || this.getColor(index)

      this.drawArc(renderer, cx, cy, r, startRad, progressEndAngle, {
        stroke: color,
        lineWidth,
        fill: undefined,
      })
    })
  }

  /**
   * 获取颜色
   */
  private getColor(index: number): string {
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
    return colors[index % colors.length] ?? '#5470c6'
  }

  /**
   * 渲染数据项
   */
  private renderDataItem(
    renderer: IRenderer,
    item: GaugeDataItem,
    index: number,
    cx: number,
    cy: number,
    radius: number
  ): void {
    const { min, max, startAngle, endAngle } = this.option
    const ratio = Math.max(0, Math.min(1, (item.value - min!) / (max! - min!)))

    const startRad = this.degToRad(startAngle!)
    const endRad = this.degToRad(endAngle!)
    const totalAngle = startRad - endRad
    const valueAngle = startRad - totalAngle * ratio

    // 渲染指针
    if (this.option.pointer?.show !== false) {
      this.renderPointer(renderer, cx, cy, radius, valueAngle, index)
    }

    // 渲染锚点
    if (this.option.anchor?.show !== false) {
      this.renderAnchor(renderer, cx, cy)
    }

    // 渲染标题
    if (this.option.title?.show !== false && item.name) {
      this.renderTitle(renderer, cx, cy, radius, item.name)
    }

    // 渲染详情
    if (this.option.detail?.show !== false) {
      this.renderDetail(renderer, cx, cy, radius, item.value)
    }
  }

  /**
   * 渲染指针
   */
  private renderPointer(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    angle: number,
    index: number
  ): void {
    const pointer = this.option.pointer!
    const lengthValue = pointer.length || '60%'
    const length = typeof lengthValue === 'string'
      ? this.parseRadius(lengthValue, radius * 2)
      : lengthValue
    const width = pointer.width || 6

    const tipX = cx + length * Math.cos(angle)
    const tipY = cy - length * Math.sin(angle)

    // 计算指针两侧的点
    const baseAngle1 = angle + Math.PI / 2
    const baseAngle2 = angle - Math.PI / 2
    const baseX1 = cx + (width / 2) * Math.cos(baseAngle1)
    const baseY1 = cy - (width / 2) * Math.sin(baseAngle1)
    const baseX2 = cx + (width / 2) * Math.cos(baseAngle2)
    const baseY2 = cy - (width / 2) * Math.sin(baseAngle2)

    const commands: PathCommand[] = [
      { type: 'M', x: tipX, y: tipY },
      { type: 'L', x: baseX1, y: baseY1 },
      { type: 'L', x: baseX2, y: baseY2 },
      { type: 'Z' },
    ]

    renderer.drawPath(
      { commands },
      {
        fill: pointer.itemStyle?.color || this.getColor(index),
        stroke: undefined,
      }
    )
  }

  /**
   * 渲染锚点
   */
  private renderAnchor(renderer: IRenderer, cx: number, cy: number): void {
    const anchor = this.option.anchor!
    const size = anchor.size || 10

    renderer.drawCircle(
      { x: cx, y: cy, radius: size },
      {
        fill: anchor.itemStyle?.color || '#fff',
        stroke: anchor.itemStyle?.borderColor || '#5470c6',
        lineWidth: anchor.itemStyle?.borderWidth || 3,
      }
    )
  }

  /**
   * 渲染标题
   */
  private renderTitle(renderer: IRenderer, cx: number, cy: number, radius: number, name: string): void {
    const title = this.option.title!
    const offset = title.offsetCenter || [0, '20%']
    const x = cx + this.parsePosition(offset[0], radius)
    const y = cy + this.parsePosition(offset[1], radius)

    renderer.drawText(
      { text: name, x, y },
      {
        fill: title.color || '#666',
        fontSize: title.fontSize || 14,
        textAlign: 'center',
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 渲染详情
   */
  private renderDetail(renderer: IRenderer, cx: number, cy: number, radius: number, value: number): void {
    const detail = this.option.detail!
    const offset = detail.offsetCenter || [0, '40%']
    const x = cx + this.parsePosition(offset[0], radius)
    const y = cy + this.parsePosition(offset[1], radius)

    let text: string
    if (typeof detail.formatter === 'function') {
      text = detail.formatter(value)
    } else if (typeof detail.formatter === 'string') {
      text = detail.formatter.replace('{value}', String(value))
    } else {
      text = value.toFixed(0)
    }

    renderer.drawText(
      { text, x, y },
      {
        fill: detail.color || '#5470c6',
        fontSize: detail.fontSize || 30,
        fontWeight: 'bold',
        textAlign: 'center',
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<GaugeSeriesOption>): void {
    this.option = this.mergeDefaultOption({ ...this.option, ...option })
  }

  /**
   * 获取配置
   */
  getOption(): GaugeSeriesOption {
    return { ...this.option }
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.removeAllListeners()
  }
}
