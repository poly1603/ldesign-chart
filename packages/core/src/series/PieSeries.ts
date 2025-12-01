/**
 * 饼图系列
 */

import type { IRenderer, PathData, PathCommand } from '../renderer/interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 饼图数据项
 */
export interface PieDataItem {
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
    formatter?: string | ((params: PieDataItem) => string)
  }
}

/**
 * 饼图配置选项
 */
export interface PieSeriesOption {
  type: 'pie'
  name?: string
  data: PieDataItem[]
  radius?: number | string | [number | string, number | string]
  center?: [number | string, number | string]
  startAngle?: number
  clockwise?: boolean
  roseType?: boolean | 'radius' | 'area'
  selectedMode?: boolean | 'single' | 'multiple'
  selectedOffset?: number
  padAngle?: number
  itemStyle?: {
    color?: string | ((params: { dataIndex: number; data: PieDataItem }) => string)
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
  }
  label?: {
    show?: boolean
    position?: 'outside' | 'inside' | 'center'
    formatter?: string | ((params: PieDataItem) => string)
    fontSize?: number
    color?: string
    labelLine?: {
      show?: boolean
      length?: number
      length2?: number
    }
  }
  labelLine?: {
    show?: boolean
    length?: number
    length2?: number
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  emphasis?: {
    scale?: boolean
    scaleSize?: number
    itemStyle?: {
      color?: string
      shadowBlur?: number
      shadowColor?: string
    }
  }
}

// 默认颜色调色板
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

/**
 * 饼图系列类
 */
export class PieSeries extends EventEmitter {
  protected option: PieSeriesOption
  protected data: PieDataItem[] = []
  private containerWidth = 800
  private containerHeight = 400

  constructor(option: PieSeriesOption, containerWidth?: number, containerHeight?: number) {
    super()
    this.option = option
    this.data = option.data || []
    if (containerWidth !== undefined) this.containerWidth = containerWidth
    if (containerHeight !== undefined) this.containerHeight = containerHeight
  }

  get type(): string {
    return 'pie'
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
  }

  /**
   * 渲染饼图
   */
  render(renderer: IRenderer): void {
    const data = this.data as PieDataItem[]
    if (!data || data.length === 0) return

    // 计算总值
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
    if (total === 0) return

    // 获取圆心和半径
    const { cx, cy, innerRadius, outerRadius } = this.calculateGeometry()

    // 计算每个扇形
    const sectors = this.calculateSectors(data, total, innerRadius, outerRadius)

    // 渲染每个扇形
    sectors.forEach((sector, index) => {
      this.renderSector(renderer, sector, cx, cy, index)

      // 渲染标签
      if (this.option.label?.show !== false) {
        this.renderLabel(renderer, sector, cx, cy, index)
      }
    })
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
    const radius = this.option.radius || '75%'

    // 解析圆心
    const cx = this.parsePosition(center[0], this.containerWidth)
    const cy = this.parsePosition(center[1], this.containerHeight)

    // 解析半径
    const minSize = Math.min(this.containerWidth, this.containerHeight)
    let innerRadius = 0
    let outerRadius = minSize * 0.375  // 默认75%的一半

    if (Array.isArray(radius)) {
      innerRadius = this.parseRadius(radius[0], minSize)
      outerRadius = this.parseRadius(radius[1], minSize)
    } else {
      outerRadius = this.parseRadius(radius, minSize)
    }

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
   * 计算扇形数据
   */
  private calculateSectors(
    data: PieDataItem[],
    total: number,
    innerRadius: number,
    outerRadius: number
  ): Array<{
    startAngle: number
    endAngle: number
    innerRadius: number
    outerRadius: number
    data: PieDataItem
    percentage: number
  }> {
    const sectors: Array<{
      startAngle: number
      endAngle: number
      innerRadius: number
      outerRadius: number
      data: PieDataItem
      percentage: number
    }> = []

    const startAngle = ((this.option.startAngle ?? 90) * Math.PI) / 180
    const clockwise = this.option.clockwise !== false
    const padAngle = ((this.option.padAngle ?? 0) * Math.PI) / 180
    const roseType = this.option.roseType

    let currentAngle = startAngle

    // 如果是南丁格尔图，计算最大值用于半径映射
    const maxValue = roseType ? Math.max(...data.map(d => d.value)) : 0

    for (const item of data) {
      const percentage = item.value / total
      let sweepAngle = percentage * 2 * Math.PI - padAngle

      if (sweepAngle < 0) sweepAngle = 0

      let sectorOuterRadius = outerRadius

      // 南丁格尔图处理
      if (roseType === 'radius' || roseType === true) {
        // radius 模式：扇区半径表示数据大小
        const radiusRatio = item.value / maxValue
        sectorOuterRadius = innerRadius + (outerRadius - innerRadius) * radiusRatio
      } else if (roseType === 'area') {
        // area 模式：扇区面积表示数据大小
        const areaRatio = Math.sqrt(item.value / maxValue)
        sectorOuterRadius = innerRadius + (outerRadius - innerRadius) * areaRatio
      }

      sectors.push({
        startAngle: currentAngle,
        endAngle: currentAngle + (clockwise ? -sweepAngle : sweepAngle),
        innerRadius,
        outerRadius: sectorOuterRadius,
        data: item,
        percentage,
      })

      currentAngle += clockwise ? -sweepAngle - padAngle : sweepAngle + padAngle
    }

    return sectors
  }

  /**
   * 渲染扇形
   */
  private renderSector(
    renderer: IRenderer,
    sector: {
      startAngle: number
      endAngle: number
      innerRadius: number
      outerRadius: number
      data: PieDataItem
    },
    cx: number,
    cy: number,
    index: number
  ): void {
    const { startAngle, endAngle, innerRadius, outerRadius, data } = sector

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
      color = DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }

    // 构建扇形路径
    const path = this.createSectorPath(
      cx, cy,
      innerRadius, outerRadius,
      startAngle, endAngle,
      itemStyle.borderRadius || 0
    )

    renderer.drawPath(path, {
      fill: color,
      stroke: data.itemStyle?.borderColor || itemStyle.borderColor || '#fff',
      lineWidth: data.itemStyle?.borderWidth ?? itemStyle.borderWidth ?? 1,
      opacity: data.itemStyle?.opacity ?? itemStyle.opacity ?? 1,
    })
  }

  /**
   * 创建扇形路径
   */
  private createSectorPath(
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    _borderRadius?: number
  ): PathData {
    const commands: PathCommand[] = []

    // 外圆弧起点
    const outerStartX = cx + Math.cos(startAngle) * outerRadius
    const outerStartY = cy - Math.sin(startAngle) * outerRadius

    // 外圆弧终点
    const outerEndX = cx + Math.cos(endAngle) * outerRadius
    const outerEndY = cy - Math.sin(endAngle) * outerRadius

    // 判断是否大于180度
    let angleDiff = startAngle - endAngle
    if (angleDiff < 0) angleDiff += 2 * Math.PI
    const largeArc = angleDiff > Math.PI ? 1 : 0

    if (innerRadius > 0) {
      // 环形
      const innerStartX = cx + Math.cos(startAngle) * innerRadius
      const innerStartY = cy - Math.sin(startAngle) * innerRadius
      const innerEndX = cx + Math.cos(endAngle) * innerRadius
      const innerEndY = cy - Math.sin(endAngle) * innerRadius

      commands.push({ type: 'M', x: outerStartX, y: outerStartY })
      commands.push({
        type: 'A',
        rx: outerRadius,
        ry: outerRadius,
        rotation: 0,
        large: largeArc === 1,
        sweep: false,
        x: outerEndX,
        y: outerEndY,
      })
      commands.push({ type: 'L', x: innerEndX, y: innerEndY })
      commands.push({
        type: 'A',
        rx: innerRadius,
        ry: innerRadius,
        rotation: 0,
        large: largeArc === 1,
        sweep: true,
        x: innerStartX,
        y: innerStartY,
      })
      commands.push({ type: 'Z' })
    } else {
      // 实心扇形
      commands.push({ type: 'M', x: cx, y: cy })
      commands.push({ type: 'L', x: outerStartX, y: outerStartY })
      commands.push({
        type: 'A',
        rx: outerRadius,
        ry: outerRadius,
        rotation: 0,
        large: largeArc === 1,
        sweep: false,
        x: outerEndX,
        y: outerEndY,
      })
      commands.push({ type: 'Z' })
    }

    return { commands }
  }

  /**
   * 渲染标签
   */
  private renderLabel(
    renderer: IRenderer,
    sector: {
      startAngle: number
      endAngle: number
      outerRadius: number
      data: PieDataItem
      percentage: number
    },
    cx: number,
    cy: number,
    _index: number
  ): void {
    const labelOption = this.option.label
    if (labelOption?.show === false) return
    if (sector.data.label?.show === false) return

    const position = labelOption?.position || 'outside'
    const midAngle = (sector.startAngle + sector.endAngle) / 2

    // 格式化标签文本
    let text: string
    const formatter = sector.data.label?.formatter || labelOption?.formatter

    if (typeof formatter === 'function') {
      text = formatter(sector.data)
    } else if (typeof formatter === 'string') {
      text = formatter
        .replace('{name}', sector.data.name)
        .replace('{value}', String(sector.data.value))
        .replace('{percent}', (sector.percentage * 100).toFixed(1) + '%')
    } else {
      text = sector.data.name
    }

    let labelX: number
    let labelY: number
    let textAlign: 'left' | 'center' | 'right' = 'center'

    if (position === 'inside' || position === 'center') {
      // 标签在扇形内部
      const labelRadius = sector.outerRadius * 0.6
      labelX = cx + Math.cos(midAngle) * labelRadius
      labelY = cy - Math.sin(midAngle) * labelRadius
    } else {
      // 标签在扇形外部
      const labelLineConfig = this.option.labelLine
      const labelLineShow = labelLineConfig?.show !== false
      const labelLineLength = labelLineShow
        ? (labelLineConfig?.length ?? 20) + (labelLineConfig?.length2 ?? 10)
        : 10
      const labelRadius = sector.outerRadius + labelLineLength
      labelX = cx + Math.cos(midAngle) * labelRadius
      labelY = cy - Math.sin(midAngle) * labelRadius

      // 根据位置调整对齐
      textAlign = Math.cos(midAngle) > 0 ? 'left' : 'right'

      // 渲染引导线
      if (labelLineShow) {
        this.renderLabelLine(renderer, sector, cx, cy, midAngle)
      }
    }

    renderer.drawText(
      { text, x: labelX, y: labelY },
      {
        fill: labelOption?.color || '#333',
        fontSize: labelOption?.fontSize || 12,
        textAlign,
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 渲染标签引导线
   */
  private renderLabelLine(
    renderer: IRenderer,
    sector: { outerRadius: number },
    cx: number,
    cy: number,
    midAngle: number
  ): void {
    const labelLine = this.option.labelLine
    const length1 = labelLine?.length ?? 20
    const length2 = labelLine?.length2 ?? 10

    // 起点（扇形边缘）
    const startX = cx + Math.cos(midAngle) * sector.outerRadius
    const startY = cy - Math.sin(midAngle) * sector.outerRadius

    // 中点
    const midX = cx + Math.cos(midAngle) * (sector.outerRadius + length1)
    const midY = cy - Math.sin(midAngle) * (sector.outerRadius + length1)

    // 终点（水平延伸）
    const endX = midX + (Math.cos(midAngle) > 0 ? length2 : -length2)
    const endY = midY

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: startX, y: startY },
          { type: 'L', x: midX, y: midY },
          { type: 'L', x: endX, y: endY },
        ],
      },
      {
        stroke: labelLine?.lineStyle?.color || '#999',
        lineWidth: labelLine?.lineStyle?.width || 1,
        fill: undefined,
      }
    )
  }

  /**
   * 获取图例数据
   */
  getLegendData(): Array<{ name: string; color: string }> {
    return this.data.map((item, index) => ({
      name: item.name,
      color: (item.itemStyle?.color as string | undefined) ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }))
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<PieSeriesOption>): void {
    this.option = { ...this.option, ...option }
    if (option.data) {
      this.data = option.data
    }
  }

  /**
   * 获取配置
   */
  getOption(): PieSeriesOption {
    return { ...this.option }
  }

  /**
   * 获取数据
   */
  getData(): PieDataItem[] {
    return [...this.data]
  }

  /**
   * 设置数据
   */
  setData(data: PieDataItem[]): void {
    this.data = data
    this.option.data = data
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.removeAllListeners()
    this.data = []
  }
}
