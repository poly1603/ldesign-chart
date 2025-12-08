/**
 * 雷达图系列
 */

import type { IRenderer, PathCommand } from '../renderer/interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 雷达图数据项
 */
export interface RadarDataItem {
  name: string
  value: number[]
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
    opacity?: number
  }
  areaStyle?: {
    color?: string
    opacity?: number
  }
  lineStyle?: {
    color?: string
    width?: number
    type?: 'solid' | 'dashed' | 'dotted'
  }
}

/**
 * 雷达图指示器
 */
export interface RadarIndicator {
  name: string
  max?: number
  min?: number
}

/**
 * 雷达图配置选项
 */
export interface RadarSeriesOption {
  type: 'radar'
  name?: string
  data: RadarDataItem[]
  indicator: RadarIndicator[]
  center?: [number | string, number | string]
  radius?: number | string
  startAngle?: number
  shape?: 'polygon' | 'circle'
  splitNumber?: number
  axisLine?: {
    show?: boolean
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  splitLine?: {
    show?: boolean
    lineStyle?: {
      color?: string | string[]
      width?: number
    }
  }
  splitArea?: {
    show?: boolean
    areaStyle?: {
      color?: string[]
    }
  }
  axisName?: {
    show?: boolean
    formatter?: string | ((name: string, indicator: RadarIndicator) => string)
    color?: string
    fontSize?: number
  }
}

// 默认颜色
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

/**
 * 雷达图系列类
 */
export class RadarSeries extends EventEmitter {
  protected option: RadarSeriesOption
  private containerWidth = 800
  private containerHeight = 400

  constructor(option: RadarSeriesOption, containerWidth?: number, containerHeight?: number) {
    super()
    this.option = option
    if (containerWidth !== undefined) this.containerWidth = containerWidth
    if (containerHeight !== undefined) this.containerHeight = containerHeight
  }

  get type(): string {
    return 'radar'
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
  }

  /**
   * 渲染雷达图
   */
  render(renderer: IRenderer): void {
    const { indicator, data } = this.option
    if (!indicator || indicator.length < 3 || !data || data.length === 0) {
      return
    }

    const { cx, cy, radius } = this.calculateGeometry()
    const angleStep = (2 * Math.PI) / indicator.length
    const startAngle = ((this.option.startAngle ?? 90) * Math.PI) / 180

    // 渲染背景网格
    this.renderBackground(renderer, cx, cy, radius, angleStep, startAngle)

    // 渲染轴线
    this.renderAxisLines(renderer, cx, cy, radius, angleStep, startAngle)

    // 渲染指示器名称
    this.renderAxisNames(renderer, cx, cy, radius, angleStep, startAngle)

    // 渲染数据系列
    data.forEach((item, index) => {
      this.renderDataItem(renderer, item, index, cx, cy, radius, angleStep, startAngle)
    })
  }

  /**
   * 计算几何参数
   */
  private calculateGeometry(): { cx: number; cy: number; radius: number } {
    const center = this.option.center || ['50%', '50%']
    const radius = this.option.radius || '65%'

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
   * 渲染背景网格
   */
  private renderBackground(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    angleStep: number,
    startAngle: number
  ): void {
    const splitNumber = this.option.splitNumber ?? 5
    const shape = this.option.shape || 'polygon'
    const splitLine = this.option.splitLine
    const splitArea = this.option.splitArea
    const indicatorCount = this.option.indicator.length

    for (let i = splitNumber; i >= 1; i--) {
      const r = (radius * i) / splitNumber

      // 渲染分隔区域
      if (splitArea?.show !== false && splitArea?.areaStyle?.color) {
        const colors = splitArea.areaStyle.color
        const colorIndex = (splitNumber - i) % colors.length
        this.renderSplitArea(renderer, cx, cy, r, angleStep, startAngle, indicatorCount, shape, colors[colorIndex] ?? 'rgba(0,0,0,0.05)')
      }

      // 渲染分隔线
      if (splitLine?.show !== false) {
        const lineColor = Array.isArray(splitLine?.lineStyle?.color)
          ? splitLine!.lineStyle!.color[i % splitLine!.lineStyle!.color.length]
          : splitLine?.lineStyle?.color || '#ddd'

        if (shape === 'circle') {
          renderer.drawCircle(
            { x: cx, y: cy, radius: r },
            {
              stroke: lineColor,
              lineWidth: splitLine?.lineStyle?.width || 1,
              fill: undefined,
            }
          )
        } else {
          this.renderPolygon(renderer, cx, cy, r, angleStep, startAngle, indicatorCount, {
            stroke: lineColor,
            lineWidth: splitLine?.lineStyle?.width || 1,
            fill: undefined,
          })
        }
      }
    }
  }

  /**
   * 渲染分隔区域
   */
  private renderSplitArea(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    angleStep: number,
    startAngle: number,
    count: number,
    shape: 'polygon' | 'circle',
    color: string
  ): void {
    if (shape === 'circle') {
      renderer.drawCircle(
        { x: cx, y: cy, radius },
        { fill: color, stroke: undefined }
      )
    } else {
      this.renderPolygon(renderer, cx, cy, radius, angleStep, startAngle, count, {
        fill: color,
        stroke: undefined,
      })
    }
  }

  /**
   * 渲染多边形
   */
  private renderPolygon(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    angleStep: number,
    startAngle: number,
    count: number,
    style: { fill?: string; stroke?: string; lineWidth?: number }
  ): void {
    const commands: PathCommand[] = []

    for (let i = 0; i < count; i++) {
      const angle = startAngle - i * angleStep
      const x = cx + radius * Math.cos(angle)
      const y = cy - radius * Math.sin(angle)

      if (i === 0) {
        commands.push({ type: 'M', x, y })
      } else {
        commands.push({ type: 'L', x, y })
      }
    }
    commands.push({ type: 'Z' })

    renderer.drawPath({ commands }, style)
  }

  /**
   * 渲染轴线
   */
  private renderAxisLines(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    angleStep: number,
    startAngle: number
  ): void {
    const axisLine = this.option.axisLine
    if (axisLine?.show === false) return

    const { indicator } = this.option
    const lineStyle = axisLine?.lineStyle

    for (let i = 0; i < indicator.length; i++) {
      const angle = startAngle - i * angleStep
      const x = cx + radius * Math.cos(angle)
      const y = cy - radius * Math.sin(angle)

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: cx, y: cy },
            { type: 'L', x, y },
          ],
        },
        {
          stroke: lineStyle?.color || '#bbb',
          lineWidth: lineStyle?.width || 1,
        }
      )
    }
  }

  /**
   * 渲染指示器名称
   */
  private renderAxisNames(
    renderer: IRenderer,
    cx: number,
    cy: number,
    radius: number,
    angleStep: number,
    startAngle: number
  ): void {
    const axisName = this.option.axisName
    if (axisName?.show === false) return

    const { indicator } = this.option
    const nameOffset = 15

    for (let i = 0; i < indicator.length; i++) {
      const item = indicator[i]
      if (!item) continue
      const angle = startAngle - i * angleStep
      const x = cx + (radius + nameOffset) * Math.cos(angle)
      const y = cy - (radius + nameOffset) * Math.sin(angle)

      // 格式化名称
      let name = item.name
      if (axisName?.formatter) {
        if (typeof axisName.formatter === 'function') {
          name = axisName.formatter(item.name, item)
        } else {
          name = axisName.formatter.replace('{value}', item.name)
        }
      }

      // 计算文本对齐
      let textAlign: 'left' | 'center' | 'right' = 'center'
      const angleDeg = (angle * 180) / Math.PI
      if (Math.abs(angleDeg % 360) < 10 || Math.abs((angleDeg % 360) - 180) < 10) {
        textAlign = 'center'
      } else if (Math.cos(angle) > 0) {
        textAlign = 'left'
      } else {
        textAlign = 'right'
      }

      renderer.drawText(
        { text: name, x, y },
        {
          fill: axisName?.color || '#666',
          fontSize: axisName?.fontSize || 12,
          textAlign,
          textBaseline: 'middle',
        }
      )
    }
  }

  /**
   * 渲染数据项
   */
  private renderDataItem(
    renderer: IRenderer,
    item: RadarDataItem,
    index: number,
    cx: number,
    cy: number,
    radius: number,
    angleStep: number,
    startAngle: number
  ): void {
    const { indicator } = this.option
    const values = item.value
    const commands: PathCommand[] = []
    const points: { x: number; y: number }[] = []

    // 计算各点坐标
    for (let i = 0; i < indicator.length; i++) {
      const value = values[i] ?? 0
      const ind = indicator[i]
      if (!ind) continue
      const max = ind.max ?? 100
      const min = ind.min ?? 0
      const ratio = (value - min) / (max - min)
      const r = radius * Math.max(0, Math.min(1, ratio))

      const angle = startAngle - i * angleStep
      const x = cx + r * Math.cos(angle)
      const y = cy - r * Math.sin(angle)
      points.push({ x, y })

      if (i === 0) {
        commands.push({ type: 'M', x, y })
      } else {
        commands.push({ type: 'L', x, y })
      }
    }
    commands.push({ type: 'Z' })

    // 获取颜色
    const color = item.itemStyle?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]

    // 渲染面积
    if (item.areaStyle || !item.lineStyle) {
      renderer.drawPath(
        { commands },
        {
          fill: item.areaStyle?.color || color,
          opacity: item.areaStyle?.opacity ?? 0.3,
          stroke: undefined,
        }
      )
    }

    // 渲染线条
    const lineStyle = item.lineStyle || {}
    const lineDash = lineStyle.type === 'dashed' ? [5, 5] : lineStyle.type === 'dotted' ? [2, 2] : undefined

    renderer.drawPath(
      { commands },
      {
        stroke: lineStyle.color || color,
        lineWidth: lineStyle.width || 2,
        fill: undefined,
        lineDash,
      }
    )

    // 渲染数据点
    for (const point of points) {
      renderer.drawCircle(
        { x: point.x, y: point.y, radius: 4 },
        {
          fill: color,
          stroke: '#fff',
          lineWidth: 2,
        }
      )
    }
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<RadarSeriesOption>): void {
    this.option = { ...this.option, ...option }
  }

  /**
   * 获取配置
   */
  getOption(): RadarSeriesOption {
    return { ...this.option }
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.removeAllListeners()
  }
}
