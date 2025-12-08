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
  endAngle?: number  // 结束角度，用于半饼图等
  clockwise?: boolean

  // 南丁格尔图（玫瑰图）
  roseType?: boolean | 'radius' | 'area'

  // 最小角度，小于该角度的扇区会被调整
  minAngle?: number
  // 最小显示的数据百分比
  minShowLabelAngle?: number

  // 选中模式
  selectedMode?: boolean | 'single' | 'multiple'
  selectedOffset?: number

  // 扇区间距角度
  padAngle?: number

  // 避免标签重叠
  avoidLabelOverlap?: boolean

  // 标签布局策略
  labelLayout?: {
    hideOverlap?: boolean
    moveOverlap?: 'shiftX' | 'shiftY'
    draggable?: boolean
  }

  // 是否静默（不响应事件）
  silent?: boolean

  // 动画类型
  animationType?: 'expansion' | 'scale'
  animationTypeUpdate?: 'expansion' | 'transition'

  itemStyle?: {
    color?: string | ((params: { dataIndex: number; data: PieDataItem }) => string)
    borderColor?: string
    borderWidth?: number
    borderRadius?: number | [number, number, number, number]
    opacity?: number
    shadowBlur?: number
    shadowColor?: string
    shadowOffsetX?: number
    shadowOffsetY?: number
  }

  label?: {
    show?: boolean
    position?: 'outside' | 'inside' | 'center'
    formatter?: string | ((params: PieDataItem & { percent: number }) => string)
    fontSize?: number
    fontWeight?: string | number
    color?: string
    backgroundColor?: string
    padding?: number | [number, number, number, number]
    borderRadius?: number
    rotate?: number
    alignTo?: 'none' | 'labelLine' | 'edge'
    edgeDistance?: number | string
    bleedMargin?: number
    distanceToLabelLine?: number
    // 标签内富文本
    rich?: Record<string, {
      color?: string
      fontSize?: number
      fontWeight?: string | number
      lineHeight?: number
    }>
  }

  labelLine?: {
    show?: boolean
    showAbove?: boolean
    length?: number
    length2?: number
    smooth?: boolean | number
    minTurnAngle?: number
    maxSurfaceAngle?: number
    lineStyle?: {
      color?: string
      width?: number
      type?: 'solid' | 'dashed' | 'dotted'
    }
  }

  emphasis?: {
    disabled?: boolean
    scale?: boolean
    scaleSize?: number
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
    label?: {
      show?: boolean
      fontSize?: number
      fontWeight?: string | number
      color?: string
    }
    labelLine?: {
      show?: boolean
      lineStyle?: {
        width?: number
        color?: string
      }
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
    label?: {
      show?: boolean
    }
  }

  // 淡出状态
  blur?: {
    itemStyle?: {
      color?: string
      opacity?: number
    }
    label?: {
      show?: boolean
    }
  }

  // z-index
  z?: number
  zlevel?: number
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
    })

    // 渲染标签（需要在所有扇形之后渲染，以便进行避让计算）
    if (this.option.label?.show !== false) {
      const labelPositions = this.calculateLabelPositions(sectors, cx, cy)

      // 如果启用标签避让，调整位置
      if (this.option.avoidLabelOverlap !== false) {
        this.avoidLabelOverlap(labelPositions, cx, cy)
      }

      // 渲染标签
      sectors.forEach((sector, index) => {
        const labelPos = labelPositions[index]
        if (labelPos) {
          this.renderLabelWithPosition(renderer, sector, cx, cy, labelPos, index)
        }
      })
    }
  }

  /**
   * 计算所有标签的初始位置
   */
  private calculateLabelPositions(
    sectors: Array<{
      startAngle: number
      endAngle: number
      outerRadius: number
      data: PieDataItem
      percentage: number
    }>,
    cx: number,
    cy: number
  ): Array<{ x: number; y: number; textAlign: 'left' | 'right' | 'center'; midAngle: number }> {
    const labelOption = this.option.label
    const labelLineConfig = this.option.labelLine
    const position = labelOption?.position || 'outside'
    const length1 = labelLineConfig?.length ?? 15
    const length2 = labelLineConfig?.length2 ?? 20

    return sectors.map((sector) => {
      const midAngle = (sector.startAngle + sector.endAngle) / 2

      if (position === 'inside' || position === 'center') {
        const labelRadius = sector.outerRadius * 0.6
        return {
          x: cx + Math.cos(midAngle) * labelRadius,
          y: cy - Math.sin(midAngle) * labelRadius,
          textAlign: 'center' as const,
          midAngle,
        }
      } else {
        const midX = cx + Math.cos(midAngle) * (sector.outerRadius + length1)
        const midY = cy - Math.sin(midAngle) * (sector.outerRadius + length1)
        const direction = Math.cos(midAngle) > 0 ? 1 : -1

        return {
          x: midX + direction * length2,
          y: midY,
          textAlign: (direction > 0 ? 'left' : 'right') as 'left' | 'right',
          midAngle,
        }
      }
    })
  }

  /**
   * 标签避让算法
   */
  private avoidLabelOverlap(
    labelPositions: Array<{ x: number; y: number; textAlign: 'left' | 'right' | 'center'; midAngle: number }>,
    cx: number,
    _cy: number
  ): void {
    const labelHeight = (this.option.label?.fontSize ?? 12) + 4
    const minGap = 2

    // 分离左右两侧的标签
    const leftLabels: Array<{ index: number; pos: typeof labelPositions[0] }> = []
    const rightLabels: Array<{ index: number; pos: typeof labelPositions[0] }> = []

    labelPositions.forEach((pos, index) => {
      if (pos.x < cx) {
        leftLabels.push({ index, pos })
      } else {
        rightLabels.push({ index, pos })
      }
    })

    // 按 Y 坐标排序
    leftLabels.sort((a, b) => a.pos.y - b.pos.y)
    rightLabels.sort((a, b) => a.pos.y - b.pos.y)

    // 处理左侧标签避让
    this.adjustLabelPositions(leftLabels, labelHeight, minGap)

    // 处理右侧标签避让
    this.adjustLabelPositions(rightLabels, labelHeight, minGap)

    // 更新原始位置
    leftLabels.forEach(({ index, pos }) => {
      labelPositions[index] = pos
    })
    rightLabels.forEach(({ index, pos }) => {
      labelPositions[index] = pos
    })
  }

  /**
   * 调整一组标签的位置以避免重叠
   */
  private adjustLabelPositions(
    labels: Array<{ index: number; pos: { x: number; y: number; textAlign: 'left' | 'right' | 'center'; midAngle: number } }>,
    labelHeight: number,
    minGap: number
  ): void {
    for (let i = 1; i < labels.length; i++) {
      const prev = labels[i - 1]!
      const curr = labels[i]!
      const overlap = prev.pos.y + labelHeight + minGap - curr.pos.y

      if (overlap > 0) {
        // 向下移动当前标签
        curr.pos.y += overlap
      }
    }

    // 如果超出容器底部，向上调整
    const maxY = this.containerHeight - 20
    for (let i = labels.length - 1; i >= 0; i--) {
      const label = labels[i]!
      if (label.pos.y > maxY) {
        label.pos.y = maxY

        // 向上推动前面的标签
        for (let j = i - 1; j >= 0; j--) {
          const prev = labels[j]!
          const next = labels[j + 1]!
          const requiredY = next.pos.y - labelHeight - minGap
          if (prev.pos.y > requiredY) {
            prev.pos.y = Math.max(20, requiredY)
          } else {
            break
          }
        }
      }
    }
  }

  /**
   * 使用计算好的位置渲染标签
   */
  private renderLabelWithPosition(
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
    labelPos: { x: number; y: number; textAlign: 'left' | 'right' | 'center'; midAngle: number },
    _index: number
  ): void {
    const labelOption = this.option.label
    if (sector.data.label?.show === false) return

    // 检查最小显示角度
    const angleDiff = Math.abs(sector.startAngle - sector.endAngle)
    const minShowAngle = ((this.option.minShowLabelAngle ?? 0) * Math.PI) / 180
    if (angleDiff < minShowAngle) return

    // 格式化标签文本
    let text: string
    const formatter = sector.data.label?.formatter || labelOption?.formatter

    if (typeof formatter === 'function') {
      text = formatter({ ...sector.data, percent: sector.percentage * 100 })
    } else if (typeof formatter === 'string') {
      text = formatter
        .replace('{name}', sector.data.name)
        .replace('{value}', String(sector.data.value))
        .replace('{percent}', (sector.percentage * 100).toFixed(1) + '%')
    } else {
      text = `${sector.data.name}: ${(sector.percentage * 100).toFixed(1)}%`
    }

    const position = labelOption?.position || 'outside'

    // 渲染引导线（仅外部标签）
    if (position === 'outside' && this.option.labelLine?.show !== false) {
      this.renderLabelLineToPosition(renderer, sector.outerRadius, cx, cy, labelPos)
    }

    renderer.drawText(
      { text, x: labelPos.x, y: labelPos.y },
      {
        fill: labelOption?.color || '#333',
        fontSize: labelOption?.fontSize || 12,
        textAlign: labelPos.textAlign,
        textBaseline: 'middle',
      }
    )
  }

  /**
   * 渲染到指定位置的引导线
   */
  private renderLabelLineToPosition(
    renderer: IRenderer,
    outerRadius: number,
    cx: number,
    cy: number,
    labelPos: { x: number; y: number; midAngle: number }
  ): void {
    const labelLine = this.option.labelLine
    const length1 = labelLine?.length ?? 15

    // 起点（扇形边缘）
    const startX = cx + Math.cos(labelPos.midAngle) * outerRadius
    const startY = cy - Math.sin(labelPos.midAngle) * outerRadius

    // 中点
    const midX = cx + Math.cos(labelPos.midAngle) * (outerRadius + length1)
    const midY = cy - Math.sin(labelPos.midAngle) * (outerRadius + length1)

    // 处理虚线样式
    let lineDash: number[] | undefined
    if (labelLine?.lineStyle?.type === 'dashed') {
      lineDash = [4, 4]
    } else if (labelLine?.lineStyle?.type === 'dotted') {
      lineDash = [2, 2]
    }

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: startX, y: startY },
          { type: 'L', x: midX, y: midY },
          { type: 'L', x: labelPos.x, y: labelPos.y },
        ],
      },
      {
        stroke: labelLine?.lineStyle?.color || '#999',
        lineWidth: labelLine?.lineStyle?.width || 1,
        fill: undefined,
        lineDash,
      }
    )
  }

  /**
   * 计算几何参数
   * 确保使用正方形区域来保证圆形不会变成椭圆
   */
  private calculateGeometry(): {
    cx: number
    cy: number
    innerRadius: number
    outerRadius: number
  } {
    const center = this.option.center || ['50%', '50%']
    const radius = this.option.radius || '70%'

    // 解析圆心
    const cx = this.parsePosition(center[0], this.containerWidth)
    const cy = this.parsePosition(center[1], this.containerHeight)

    // 使用最小尺寸确保圆形不变形
    const minSize = Math.min(this.containerWidth, this.containerHeight)
    let innerRadius = 0
    let outerRadius = minSize * 0.35  // 默认70%的一半

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
      color = DEFAULT_COLORS[index % DEFAULT_COLORS.length] ?? '#5470c6'
    }

    // 构建扇形路径
    const borderRadius = typeof itemStyle.borderRadius === 'number'
      ? itemStyle.borderRadius
      : (Array.isArray(itemStyle.borderRadius) ? itemStyle.borderRadius[0] : 0)
    const path = this.createSectorPath(
      cx, cy,
      innerRadius, outerRadius,
      startAngle, endAngle,
      borderRadius || 0
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
   * 渲染标签引导线（旧版，保留兼容）
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
      color: (item.itemStyle?.color as string | undefined) ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length] ?? '#5470c6',
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
