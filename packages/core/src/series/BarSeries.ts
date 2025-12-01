/**
 * 柱状图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { SeriesOption } from '../types'

/**
 * 柱状图配置选项
 */
export interface BarSeriesOption extends SeriesOption {
  type: 'bar'
  data: number[]
  barWidth?: number | string  // 柱子宽度，可以是像素值或百分比
  barGap?: number | string    // 柱子间距
  barCategoryGap?: number | string  // 类目间距
  barBorderRadius?: number | number[]  // 圆角半径
}

/**
 * 柱状图系列类
 */
export class BarSeries extends Series {
  protected declare option: BarSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null

  constructor(
    option: BarSeriesOption,
    xScale: IScale,
    yScale: IScale,
    coordinate: ICoordinate
  ) {
    super(option)
    this.xScale = xScale
    this.yScale = yScale
    this.coordinate = coordinate
  }

  get type(): string {
    return 'bar'
  }

  /**
   * 渲染柱状图
   */
  render(renderer: IRenderer): void {
    if (!this.coordinate || !this.xScale || !this.yScale || this.data.length === 0) {
      return
    }

    const bars = this.calculateBars()
    
    for (const bar of bars) {
      this.renderBar(renderer, bar)
      
      // 渲染标签
      if (this.option.label?.show) {
        this.renderLabel(renderer, bar)
      }
    }
  }

  /**
   * 计算柱子的位置和尺寸
   */
  private calculateBars(): Array<{
    x: number
    y: number
    width: number
    height: number
    value: number
    index: number
  }> {
    const bars: Array<{
      x: number
      y: number
      width: number
      height: number
      value: number
      index: number
    }> = []

    if (!this.coordinate || !this.xScale || !this.yScale) {
      return bars
    }

    const dataLength = this.data.length
    const barWidth = this.calculateBarWidth()

    for (let i = 0; i < dataLength; i++) {
      const value = this.data[i]
      if (typeof value !== 'number') continue

      // 计算 X 位置（类目中心）
      const dataX = this.xScale.map(i)
      const dataY0 = this.yScale.map(0)  // 基线
      const dataY1 = this.yScale.map(value)  // 数据值

      // 转换为屏幕坐标
      const point0 = this.coordinate.dataToPoint([dataX, dataY0])
      const point1 = this.coordinate.dataToPoint([dataX, dataY1])

      // 计算柱子位置和尺寸
      const x = point1.x - barWidth / 2
      const y = Math.min(point0.y, point1.y)
      const height = Math.abs(point1.y - point0.y)

      bars.push({
        x,
        y,
        width: barWidth,
        height,
        value,
        index: i,
      })
    }

    return bars
  }

  /**
   * 计算柱子宽度
   */
  private calculateBarWidth(): number {
    if (!this.coordinate || !this.xScale) {
      return 20
    }

    // 如果指定了固定宽度
    if (typeof this.option.barWidth === 'number') {
      return this.option.barWidth
    }

    // 计算可用宽度
    const dataLength = this.data.length
    if (dataLength === 0) return 20

    // 获取相邻两个类目的距离
    let categoryWidth = 0
    if (dataLength > 1 && this.xScale) {
      const pos0 = this.coordinate.dataToPoint([this.xScale.map(0), 0])
      const pos1 = this.coordinate.dataToPoint([this.xScale.map(1), 0])
      categoryWidth = Math.abs(pos1.x - pos0.x)
    } else {
      // 单个数据点时，使用固定宽度
      return 40
    }

    // 默认柱子占类目宽度的 60%
    const barGap = 0.2  // 柱子间距占比
    return categoryWidth * (1 - barGap)
  }

  /**
   * 渲染单个柱子
   */
  private renderBar(
    renderer: IRenderer,
    bar: { x: number; y: number; width: number; height: number; value: number }
  ): void {
    const itemStyle = this.option.itemStyle || {}
    const borderRadius = this.option.barBorderRadius || 0

    // 处理圆角
    const hasRadius = typeof borderRadius === 'number' ? borderRadius > 0 : borderRadius.length > 0
    if (hasRadius) {
      this.renderRoundedBar(renderer, bar, borderRadius)
    } else {
      // 普通矩形
      const x = bar.x
      const y = bar.y
      const width = bar.width
      const height = bar.height
      
      renderer.drawPath(
        {
          commands: [
            { type: 'M', x, y },
            { type: 'L', x: x + width, y },
            { type: 'L', x: x + width, y: y + height },
            { type: 'L', x, y: y + height },
            { type: 'Z' },
          ],
        },
        {
          fill: (itemStyle.color as string) || '#5470c6',
          stroke: (itemStyle.borderColor as string) || undefined,
          lineWidth: itemStyle.borderWidth || 0,
          opacity: itemStyle.opacity || 1,
        }
      )
    }
  }

  /**
   * 渲染圆角柱子
   */
  private renderRoundedBar(
    renderer: IRenderer,
    bar: { x: number; y: number; width: number; height: number },
    radius: number | number[]
  ): void {
    const itemStyle = this.option.itemStyle || {}
    const { x, y, width, height } = bar

    // 处理圆角半径数组 [topLeft, topRight, bottomRight, bottomLeft]
    let radii: number[]
    if (typeof radius === 'number') {
      radii = [radius, radius, 0, 0]  // 只圆角顶部
    } else {
      radii = radius
    }

    const tl = radii[0] || 0
    const tr = radii[1] || 0
    const br = radii[2] || 0
    const bl = radii[3] || 0

    // 构建路径
    const commands = [
      { type: 'M' as const, x: x + tl, y },
      { type: 'L' as const, x: x + width - tr, y },
      tr > 0 ? { type: 'Q' as const, x1: x + width, y1: y, x: x + width, y: y + tr } : null,
      { type: 'L' as const, x: x + width, y: y + height - br },
      br > 0 ? { type: 'Q' as const, x1: x + width, y1: y + height, x: x + width - br, y: y + height } : null,
      { type: 'L' as const, x: x + bl, y: y + height },
      bl > 0 ? { type: 'Q' as const, x1: x, y1: y + height, x: x, y: y + height - bl } : null,
      { type: 'L' as const, x: x, y: y + tl },
      tl > 0 ? { type: 'Q' as const, x1: x, y1: y, x: x + tl, y: y } : null,
      { type: 'Z' as const },
    ].filter(Boolean)

    renderer.drawPath(
      { commands: commands as any },
      {
        fill: (itemStyle.color as string) || '#5470c6',
        stroke: (itemStyle.borderColor as string) || undefined,
        lineWidth: itemStyle.borderWidth || 0,
        opacity: itemStyle.opacity || 1,
      }
    )
  }

  /**
   * 渲染标签
   */
  private renderLabel(
    renderer: IRenderer,
    bar: { x: number; y: number; width: number; height: number; value: number }
  ): void {
    const labelOption = this.option.label
    if (!labelOption || !labelOption.show) return

    // 使用类型断言处理 formatter
    const formatter = labelOption.formatter as ((params: unknown) => string) | string | undefined
    let text: string
    if (typeof formatter === 'function') {
      text = formatter(bar.value)
    } else if (typeof formatter === 'string') {
      text = formatter
    } else {
      text = bar.value.toString()
    }

    // 计算标签位置
    let x = bar.x + bar.width / 2
    let y = bar.y

    const position = (labelOption as any).position || 'top'
    
    switch (position) {
      case 'top':
        y = bar.y - 5
        break
      case 'inside':
        y = bar.y + bar.height / 2
        break
      case 'bottom':
        y = bar.y + bar.height + 15
        break
      default:
        y = bar.y - 5
    }

    const labelStyle = (labelOption as any).style || {}
    renderer.drawText(
      { text, x, y },
      {
        fill: labelStyle.fill || '#333',
        fontSize: labelStyle.fontSize || 12,
        textAlign: 'center',
        textBaseline: position === 'top' ? 'bottom' : position === 'inside' ? 'middle' : 'top',
      }
    )
  }

  /**
   * 更新比例尺
   */
  setScales(xScale: IScale, yScale: IScale): void {
    this.xScale = xScale
    this.yScale = yScale
  }

  /**
   * 销毁
   */
  dispose(): void {
    super.dispose()
    this.xScale = null
    this.yScale = null
  }
}