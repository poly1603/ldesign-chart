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
 * 阶梯线类型
 */
export type StepType = 'start' | 'middle' | 'end' | false

/**
 * 标注点数据
 */
export interface MarkPointDataItem {
  name?: string
  type?: 'min' | 'max' | 'average'
  value?: number
  coord?: [number, number]
  x?: number
  y?: number
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow'
  symbolSize?: number
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
  }
  label?: {
    show?: boolean
    formatter?: string | ((params: any) => string)
    color?: string
    fontSize?: number
  }
}

/**
 * 标注点配置
 */
export interface MarkPointOption {
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow'
  symbolSize?: number
  data?: MarkPointDataItem[]
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
  }
  label?: {
    show?: boolean
    formatter?: string | ((params: any) => string)
    color?: string
    fontSize?: number
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside'
  }
}

/**
 * 标注线数据项
 */
export interface MarkLineDataItem {
  name?: string
  type?: 'min' | 'max' | 'average' | 'median'
  xAxis?: number
  yAxis?: number
  coord?: [number, number]
  value?: number
  lineStyle?: {
    color?: string
    width?: number
    type?: 'solid' | 'dashed' | 'dotted'
  }
  label?: {
    show?: boolean
    formatter?: string | ((params: any) => string)
    position?: 'start' | 'middle' | 'end'
  }
}

/**
 * 标注线配置
 */
export interface MarkLineOption {
  silent?: boolean
  symbol?: [string, string]
  data?: (MarkLineDataItem | [MarkLineDataItem, MarkLineDataItem])[]
  lineStyle?: {
    color?: string
    width?: number
    type?: 'solid' | 'dashed' | 'dotted'
  }
  label?: {
    show?: boolean
    formatter?: string | ((params: any) => string)
    position?: 'start' | 'middle' | 'end'
  }
}

/**
 * 标注区域数据项
 */
export interface MarkAreaDataItem {
  name?: string
  xAxis?: number
  yAxis?: number
  coord?: [number, number]
}

/**
 * 标注区域配置
 */
export interface MarkAreaOption {
  silent?: boolean
  data?: [MarkAreaDataItem, MarkAreaDataItem][]
  itemStyle?: {
    color?: string
    opacity?: number
    borderColor?: string
    borderWidth?: number
  }
  label?: {
    show?: boolean
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside'
    color?: string
    fontSize?: number
  }
}

/**
 * 折线图配置选项
 */
export interface LineSeriesOption extends SeriesOption {
  type: 'line'
  data: number[]
  smooth?: boolean | number  // 支持平滑度数值 0-1
  showSymbol?: boolean
  showAllSymbol?: boolean | 'auto'  // 是否显示所有数据点
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none'
  symbolSize?: number | [number, number] | ((value: number, params: any) => number)
  symbolRotate?: number

  // 阶梯线
  step?: StepType

  // 堆叠
  stack?: string
  stackStrategy?: 'samesign' | 'all' | 'positive' | 'negative'

  // 连接空数据
  connectNulls?: boolean

  // 裁剪超出坐标系的图形
  clip?: boolean

  // 采样
  sampling?: 'lttb' | 'average' | 'max' | 'min' | 'sum'

  lineStyle?: {
    color?: string
    width?: number
    type?: 'solid' | 'dashed' | 'dotted'
    cap?: 'butt' | 'round' | 'square'
    join?: 'miter' | 'round' | 'bevel'
    opacity?: number
  }

  areaStyle?: {
    color?: string | {
      type: 'linear'
      x: number
      y: number
      x2: number
      y2: number
      colorStops: { offset: number; color: string }[]
    }
    opacity?: number
    origin?: 'auto' | 'start' | 'end'
  }

  emphasis?: {
    disabled?: boolean
    scale?: boolean | number
    focus?: 'none' | 'self' | 'series'
    blurScope?: 'coordinateSystem' | 'series' | 'global'
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
      shadowBlur?: number
      shadowColor?: string
      opacity?: number
    }
    lineStyle?: {
      color?: string
      width?: number
    }
    label?: {
      show?: boolean
    }
  }

  // 选中状态
  select?: {
    disabled?: boolean
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
    }
    lineStyle?: {
      color?: string
      width?: number
    }
    label?: {
      show?: boolean
    }
  }

  // 标注点
  markPoint?: MarkPointOption

  // 标注线
  markLine?: MarkLineOption

  // 标注区域
  markArea?: MarkAreaOption

  // 系列索引，用于多系列
  seriesIndex?: number

  // z-index
  z?: number
  zlevel?: number
}

/**
 * 折线图数据点
 */
export interface LineDataPoint {
  x: number
  y: number
  dataIndex: number
  value: number
}

// 默认颜色调色板
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

/**
 * 折线图系列类
 */
export class LineSeries extends Series {
  protected declare option: LineSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null
  private cachedPoints: LineDataPoint[] = []
  private hoveredIndex: number = -1
  private seriesColor: string = '#5470c6'

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
    // 根据系列索引选择颜色
    const index = option.seriesIndex ?? 0
    this.seriesColor = (option.itemStyle?.color as string) || DEFAULT_COLORS[index % DEFAULT_COLORS.length] || '#5470c6'
  }

  get type(): string {
    return 'line'
  }

  /**
   * 获取系列颜色
   */
  getColor(): string {
    return this.seriesColor
  }

  /**
   * 获取缓存的数据点
   */
  getCachedPoints(): LineDataPoint[] {
    return this.cachedPoints
  }

  /**
   * 设置悬停索引
   */
  setHoveredIndex(index: number): void {
    this.hoveredIndex = index
  }

  /**
   * 获取悬停索引
   */
  getHoveredIndex(): number {
    return this.hoveredIndex
  }

  /**
   * 根据X坐标找到最近的数据点
   */
  findNearestPoint(mouseX: number, _mouseY: number): { point: LineDataPoint | null; distance: number } {
    if (this.cachedPoints.length === 0) {
      return { point: null, distance: Infinity }
    }

    let nearestPoint: LineDataPoint | null = null
    let minDistance = Infinity

    for (const point of this.cachedPoints) {
      // 使用 X 轴距离作为主要判断，实现类似 ECharts 的效果
      const xDistance = Math.abs(point.x - mouseX)

      if (xDistance < minDistance) {
        minDistance = xDistance
        nearestPoint = point
      }
    }

    return { point: nearestPoint, distance: minDistance }
  }

  /**
   * 根据 X 坐标找到最近的数据点索引
   */
  findNearestPointByX(mouseX: number): number {
    if (this.cachedPoints.length === 0) return -1

    let nearestIndex = -1
    let minDistance = Infinity

    for (let i = 0; i < this.cachedPoints.length; i++) {
      const point = this.cachedPoints[i]!
      const distance = Math.abs(point.x - mouseX)
      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = i
      }
    }

    return nearestIndex
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

    // 缓存数据点用于交互
    this.cachedPoints = points

    // 绘制面积（如果配置了areaStyle）
    if (this.option.areaStyle) {
      this.renderArea(renderer, points)
    }

    // 绘制线条
    this.renderLine(renderer, points)

    // 绘制数据点
    if (this.option.showSymbol !== false) {
      this.renderPoints(renderer, points)
    }

    // 如果有悬停的点，渲染高亮效果
    if (this.hoveredIndex >= 0 && this.hoveredIndex < points.length) {
      this.renderHoverEffect(renderer, points[this.hoveredIndex]!)
    }
  }

  /**
   * 计算屏幕坐标点
   */
  private calculatePoints(): LineDataPoint[] {
    const points: LineDataPoint[] = []

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
      points.push({
        x: screenPoint.x,
        y: screenPoint.y,
        dataIndex: i,
        value: value
      })
    }

    return points
  }

  /**
   * 渲染面积
   */
  private renderArea(renderer: IRenderer, points: LineDataPoint[]): void {
    if (points.length < 2) return

    const commands: PathCommand[] = []
    const areaStyle = this.option.areaStyle!

    // 获取基线 Y 坐标
    const baseY = this.coordinate!.dataToPoint([0, this.yScale!.map(0)]).y

    // 移动到第一个点
    commands.push({ type: 'M', x: points[0]!.x, y: baseY })
    commands.push({ type: 'L', x: points[0]!.x, y: points[0]!.y })

    // 连接所有点
    if (this.option.smooth) {
      this.addSmoothCurve(commands, points)
    } else {
      for (let i = 1; i < points.length; i++) {
        commands.push({ type: 'L', x: points[i]!.x, y: points[i]!.y })
      }
    }

    // 闭合到基线
    commands.push({ type: 'L', x: points[points.length - 1]!.x, y: baseY })
    commands.push({ type: 'Z' })

    // 处理颜色，支持渐变配置（这里简化处理，仅使用纯色）
    const fillColor = typeof areaStyle.color === 'string'
      ? areaStyle.color
      : this.seriesColor

    renderer.drawPath(
      { commands },
      {
        fill: fillColor,
        opacity: areaStyle.opacity ?? 0.3,
        stroke: undefined,
      }
    )
  }

  /**
   * 渲染线条
   */
  private renderLine(renderer: IRenderer, points: LineDataPoint[]): void {
    if (points.length < 2) return

    const commands: PathCommand[] = []
    const lineStyle = this.option.lineStyle || {}

    // 移动到第一个点
    commands.push({ type: 'M', x: points[0]!.x, y: points[0]!.y })

    // 根据线条类型绘制
    if (this.option.step) {
      // 阶梯线
      this.addStepLine(commands, points)
    } else if (this.option.smooth) {
      // 平滑曲线
      this.addSmoothCurve(commands, points)
    } else {
      // 直线
      for (let i = 1; i < points.length; i++) {
        commands.push({ type: 'L', x: points[i]!.x, y: points[i]!.y })
      }
    }

    // 处理虚线样式
    let lineDash: number[] | undefined
    if (lineStyle.type === 'dashed') {
      lineDash = [5, 5]
    } else if (lineStyle.type === 'dotted') {
      lineDash = [2, 2]
    }

    renderer.drawPath(
      { commands },
      {
        stroke: lineStyle.color || this.seriesColor,
        lineWidth: lineStyle.width ?? 2,
        fill: undefined,
        lineDash,
      }
    )
  }

  /**
   * 渲染数据点
   */
  private renderPoints(renderer: IRenderer, points: LineDataPoint[]): void {
    // 处理 symbolSize，可能是数字、数组或函数
    const getSymbolSize = (value: number, index: number): number => {
      const size = this.option.symbolSize
      if (typeof size === 'function') {
        return size(value, { dataIndex: index })
      }
      if (Array.isArray(size)) {
        return size[0] ?? 8
      }
      return size ?? 8
    }

    for (let i = 0; i < points.length; i++) {
      const point = points[i]!
      const isHovered = i === this.hoveredIndex
      const symbolSize = getSymbolSize(point.value, i)
      const pointRadius = symbolSize / 2

      renderer.drawCircle(
        {
          x: point.x,
          y: point.y,
          radius: isHovered ? pointRadius * 1.5 : pointRadius,
        },
        {
          fill: isHovered ? '#fff' : this.seriesColor,
          stroke: this.seriesColor,
          lineWidth: isHovered ? 3 : 2,
        }
      )
    }
  }

  /**
   * 渲染悬停效果
   */
  private renderHoverEffect(renderer: IRenderer, point: LineDataPoint): void {
    const emphasis = this.option.emphasis || {}
    const emphasisStyle = emphasis.itemStyle || {}

    // 绘制外圈光晕
    if (emphasisStyle.shadowBlur) {
      renderer.drawCircle(
        {
          x: point.x,
          y: point.y,
          radius: 12,
        },
        {
          fill: emphasisStyle.shadowColor || this.seriesColor,
          opacity: 0.3,
        }
      )
    }

    // 绘制高亮点
    renderer.drawCircle(
      {
        x: point.x,
        y: point.y,
        radius: 8,
      },
      {
        fill: '#fff',
        stroke: emphasisStyle.borderColor || this.seriesColor,
        lineWidth: emphasisStyle.borderWidth ?? 3,
      }
    )
  }

  /**
   * 添加平滑曲线
   */
  private addSmoothCurve(commands: PathCommand[], points: LineDataPoint[]): void {
    const smoothing = typeof this.option.smooth === 'number' ? this.option.smooth : 0.2

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]!
      const curr = points[i]!
      const next = points[i + 1]
      const prevPrev = points[i - 2]

      // 计算控制点
      const cp1 = this.getControlPoint(prevPrev, prev, curr, false, smoothing)
      const cp2 = this.getControlPoint(prev, curr, next, true, smoothing)

      commands.push({
        type: 'C',
        x1: cp1.x,
        y1: cp1.y,
        x2: cp2.x,
        y2: cp2.y,
        x: curr.x,
        y: curr.y,
      } as PathCommand)
    }
  }

  /**
   * 添加阶梯线路径
   */
  private addStepLine(commands: PathCommand[], points: LineDataPoint[]): void {
    const step = this.option.step

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]!
      const curr = points[i]!

      if (step === 'start') {
        // 先垂直后水平
        commands.push({ type: 'L', x: prev.x, y: curr.y })
        commands.push({ type: 'L', x: curr.x, y: curr.y })
      } else if (step === 'end') {
        // 先水平后垂直
        commands.push({ type: 'L', x: curr.x, y: prev.y })
        commands.push({ type: 'L', x: curr.x, y: curr.y })
      } else if (step === 'middle') {
        // 中间转折
        const midX = (prev.x + curr.x) / 2
        commands.push({ type: 'L', x: midX, y: prev.y })
        commands.push({ type: 'L', x: midX, y: curr.y })
        commands.push({ type: 'L', x: curr.x, y: curr.y })
      }
    }
  }

  /**
   * 计算贝塞尔曲线控制点
   */
  private getControlPoint(
    prev: LineDataPoint | undefined,
    curr: LineDataPoint,
    next: LineDataPoint | undefined,
    isSecond: boolean,
    smoothing: number = 0.2
  ): { x: number; y: number } {
    if (!prev) prev = curr
    if (!next) next = curr

    const dx = next.x - prev.x
    const dy = next.y - prev.y

    if (isSecond) {
      return {
        x: curr.x - dx * smoothing,
        y: curr.y - dy * smoothing,
      }
    } else {
      return {
        x: curr.x + dx * smoothing,
        y: curr.y + dy * smoothing,
      }
    }
  }

  /**
   * 渲染标注点
   */
  renderMarkPoint(renderer: IRenderer): void {
    if (!this.option.markPoint?.data || !this.coordinate || !this.xScale || !this.yScale) {
      return
    }

    const markPoint = this.option.markPoint
    const defaultSymbolSize = markPoint.symbolSize ?? 50

    for (const item of markPoint.data!) {
      let x: number, y: number, value: number | undefined

      if (item.type) {
        // 计算特殊类型的位置
        const values = this.data as number[]
        if (item.type === 'min') {
          value = Math.min(...values)
          const index = values.indexOf(value)
          const point = this.cachedPoints[index]
          if (!point) continue
          x = point.x
          y = point.y
        } else if (item.type === 'max') {
          value = Math.max(...values)
          const index = values.indexOf(value)
          const point = this.cachedPoints[index]
          if (!point) continue
          x = point.x
          y = point.y
        } else if (item.type === 'average') {
          value = values.reduce((a, b) => a + b, 0) / values.length
          const dataY = this.yScale.map(value)
          const midIndex = Math.floor(values.length / 2)
          const dataX = this.xScale.map(midIndex)
          const screenPoint = this.coordinate.dataToPoint([dataX, dataY])
          x = screenPoint.x
          y = screenPoint.y
        } else {
          continue
        }
      } else if (item.coord) {
        const dataX = this.xScale.map(item.coord[0])
        const dataY = this.yScale.map(item.coord[1])
        const screenPoint = this.coordinate.dataToPoint([dataX, dataY])
        x = screenPoint.x
        y = screenPoint.y
        value = item.value ?? item.coord[1]
      } else if (item.x !== undefined && item.y !== undefined) {
        x = item.x
        y = item.y
        value = item.value
      } else {
        continue
      }

      const symbolSize = item.symbolSize ?? defaultSymbolSize
      const color = item.itemStyle?.color ?? markPoint.itemStyle?.color ?? this.seriesColor

      // 绘制标注点符号
      this.drawMarkSymbol(renderer, x, y, symbolSize, item.symbol ?? markPoint.symbol ?? 'pin', color)

      // 绘制标签
      const labelConfig = { ...markPoint.label, ...item.label }
      if (labelConfig.show !== false && value !== undefined) {
        const labelText = typeof labelConfig.formatter === 'function'
          ? labelConfig.formatter({ value, name: item.name })
          : labelConfig.formatter ?? String(Math.round(value))

        renderer.drawText(
          { x, y: y - symbolSize / 2 - 5, text: labelText },
          {
            fill: labelConfig.color ?? '#fff',
            fontSize: labelConfig.fontSize ?? 12,
            textAlign: 'center',
            textBaseline: 'bottom',
          }
        )
      }
    }
  }

  /**
   * 绘制标注符号
   */
  private drawMarkSymbol(
    renderer: IRenderer,
    x: number,
    y: number,
    size: number,
    symbol: string,
    color: string
  ): void {
    const halfSize = size / 2

    switch (symbol) {
      case 'circle':
        renderer.drawCircle({ x, y, radius: halfSize }, { fill: color })
        break
      case 'rect':
      case 'roundRect':
        renderer.drawRect(
          { x: x - halfSize, y: y - halfSize, width: size, height: size },
          { fill: color, radius: symbol === 'roundRect' ? 4 : 0 }
        )
        break
      case 'triangle':
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y: y - halfSize },
              { type: 'L', x: x + halfSize, y: y + halfSize },
              { type: 'L', x: x - halfSize, y: y + halfSize },
              { type: 'Z' },
            ],
          },
          { fill: color }
        )
        break
      case 'diamond':
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y: y - halfSize },
              { type: 'L', x: x + halfSize, y },
              { type: 'L', x, y: y + halfSize },
              { type: 'L', x: x - halfSize, y },
              { type: 'Z' },
            ],
          },
          { fill: color }
        )
        break
      case 'pin':
      default:
        // 绘制 pin 形状（类似于地图标记）
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y: y + halfSize },
              { type: 'L', x: x - halfSize * 0.6, y: y - halfSize * 0.3 },
              { type: 'A', rx: halfSize, ry: halfSize, rotation: 0, large: true, sweep: true, x: x + halfSize * 0.6, y: y - halfSize * 0.3 },
              { type: 'Z' },
            ],
          },
          { fill: color }
        )
        break
    }
  }

  /**
   * 渲染标注线
   */
  renderMarkLine(renderer: IRenderer): void {
    if (!this.option.markLine?.data || !this.coordinate || !this.xScale || !this.yScale) {
      return
    }

    const markLine = this.option.markLine
    const lineStyle = markLine.lineStyle || {}
    const width = renderer.getWidth()
    const height = renderer.getHeight()

    for (const item of markLine.data!) {
      if (Array.isArray(item)) {
        // 两点式标注线
        // TODO: 实现两点式标注线
        continue
      }

      let startX: number, startY: number, endX: number, endY: number
      let value: number | undefined

      if (item.type) {
        const values = this.data as number[]
        if (item.type === 'min') {
          value = Math.min(...values)
        } else if (item.type === 'max') {
          value = Math.max(...values)
        } else if (item.type === 'average') {
          value = values.reduce((a, b) => a + b, 0) / values.length
        } else if (item.type === 'median') {
          const sorted = [...values].sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          value = sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
        } else {
          continue
        }

        const dataY = this.yScale.map(value)
        const screenPoint = this.coordinate.dataToPoint([0, dataY])
        startX = 50  // 左边距
        endX = width - 50  // 右边距
        startY = endY = screenPoint.y
      } else if (item.yAxis !== undefined) {
        value = item.yAxis
        const dataY = this.yScale.map(item.yAxis)
        const screenPoint = this.coordinate.dataToPoint([0, dataY])
        startX = 50
        endX = width - 50
        startY = endY = screenPoint.y
      } else if (item.xAxis !== undefined) {
        const dataX = this.xScale.map(item.xAxis)
        const screenPoint = this.coordinate.dataToPoint([dataX, 0])
        startX = endX = screenPoint.x
        startY = 50
        endY = height - 50
      } else {
        continue
      }

      // 绘制标注线
      const itemLineStyle = item.lineStyle || {}
      let lineDash: number[] | undefined
      const lineType = itemLineStyle.type ?? lineStyle.type ?? 'dashed'
      if (lineType === 'dashed') {
        lineDash = [5, 5]
      } else if (lineType === 'dotted') {
        lineDash = [2, 2]
      }

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: startX, y: startY },
            { type: 'L', x: endX, y: endY },
          ],
        },
        {
          stroke: itemLineStyle.color ?? lineStyle.color ?? this.seriesColor,
          lineWidth: itemLineStyle.width ?? lineStyle.width ?? 1,
          lineDash,
        }
      )

      // 绘制标签
      const labelConfig = { ...markLine.label, ...item.label }
      if (labelConfig.show !== false && value !== undefined) {
        const labelText = typeof labelConfig.formatter === 'function'
          ? labelConfig.formatter({ value, name: item.name })
          : labelConfig.formatter ?? String(Math.round(value * 100) / 100)

        const labelPosition = labelConfig.position ?? 'end'
        let labelX: number, labelY: number

        if (labelPosition === 'start') {
          labelX = startX
          labelY = startY
        } else if (labelPosition === 'middle') {
          labelX = (startX + endX) / 2
          labelY = (startY + endY) / 2
        } else {
          labelX = endX
          labelY = endY
        }

        renderer.drawText(
          { x: labelX + 5, y: labelY, text: labelText },
          {
            fill: this.seriesColor,
            fontSize: 12,
            textAlign: 'left',
            textBaseline: 'middle',
          }
        )
      }
    }
  }

  /**
   * 渲染标注区域
   */
  renderMarkArea(renderer: IRenderer): void {
    if (!this.option.markArea?.data || !this.coordinate || !this.xScale || !this.yScale) {
      return
    }

    const markArea = this.option.markArea
    const itemStyle = markArea.itemStyle || {}

    for (const [start, end] of markArea.data!) {
      let x1: number, y1: number, x2: number, y2: number

      // 计算起始点
      if (start.xAxis !== undefined) {
        const dataX = this.xScale.map(start.xAxis)
        x1 = this.coordinate.dataToPoint([dataX, 0]).x
      } else {
        x1 = 50  // 默认左边距
      }

      if (start.yAxis !== undefined) {
        const dataY = this.yScale.map(start.yAxis)
        y1 = this.coordinate.dataToPoint([0, dataY]).y
      } else {
        y1 = 50  // 默认上边距
      }

      // 计算结束点
      if (end.xAxis !== undefined) {
        const dataX = this.xScale.map(end.xAxis)
        x2 = this.coordinate.dataToPoint([dataX, 0]).x
      } else {
        x2 = renderer.getWidth() - 50  // 默认右边距
      }

      if (end.yAxis !== undefined) {
        const dataY = this.yScale.map(end.yAxis)
        y2 = this.coordinate.dataToPoint([0, dataY]).y
      } else {
        y2 = renderer.getHeight() - 50  // 默认下边距
      }

      // 绘制区域
      renderer.drawRect(
        {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
        },
        {
          fill: itemStyle.color ?? 'rgba(0, 0, 0, 0.1)',
          opacity: itemStyle.opacity ?? 0.3,
          stroke: itemStyle.borderColor,
          lineWidth: itemStyle.borderWidth,
        }
      )

      // 绘制标签
      const labelConfig = markArea.label
      if (labelConfig?.show !== false && start.name) {
        const labelX = (x1 + x2) / 2
        const labelY = Math.min(y1, y2) + 15

        renderer.drawText(
          { x: labelX, y: labelY, text: start.name },
          {
            fill: labelConfig?.color ?? '#666',
            fontSize: labelConfig?.fontSize ?? 12,
            textAlign: 'center',
            textBaseline: 'top',
          }
        )
      }
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
   * 获取堆叠标识
   */
  getStack(): string | undefined {
    return this.option.stack
  }

  /**
   * 设置堆叠后的数据
   */
  setStackedData(data: number[]): void {
    this.data = data
  }

  /**
   * 销毁
   */
  dispose(): void {
    super.dispose()
    this.xScale = null
    this.yScale = null
    this.cachedPoints = []
    this.hoveredIndex = -1
  }
}