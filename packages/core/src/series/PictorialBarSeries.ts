/**
 * 象形柱图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { SeriesOption } from '../types'
import type { IScale } from '../scale/interface'

/**
 * 象形柱图数据项
 */
export interface PictorialBarDataItem {
  value: number
  name?: string
  symbol?: string
  symbolSize?: number | [number, number]
  symbolPosition?: 'start' | 'end' | 'center'
  symbolOffset?: [number, number]
  symbolRotate?: number
  itemStyle?: {
    color?: string
    opacity?: number
  }
}

/**
 * 象形柱图配置选项
 */
export interface PictorialBarSeriesOption extends SeriesOption {
  type: 'pictorialBar'
  data: (number | PictorialBarDataItem)[]

  // 符号配置
  symbol?: string  // 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'path://...'
  symbolSize?: number | [number, number] | ((value: number, params: unknown) => number | [number, number])
  symbolPosition?: 'start' | 'end' | 'center'
  symbolOffset?: [number, number]
  symbolRotate?: number

  // 符号重复
  symbolRepeat?: boolean | number | 'fixed'
  symbolRepeatDirection?: 'start' | 'end'
  symbolMargin?: number | string
  symbolClip?: boolean

  // 柱体
  barWidth?: number | string
  barMaxWidth?: number | string
  barMinWidth?: number
  barGap?: string
  barCategoryGap?: string

  // 标签
  labelShow?: boolean
  labelPosition?: 'inside' | 'top' | 'bottom' | 'left' | 'right'
  labelColor?: string
  labelFontSize?: number
  labelFormatter?: string | ((params: { value: number; name: string }) => string)

  // 动画
  animationEasing?: string
  animationDelay?: number | ((idx: number) => number)
}

/**
 * 缓存的柱子数据
 */
interface CachedBar {
  x: number
  y: number
  width: number
  height: number
  value: number
  name: string
  symbol: string
  symbolSize: [number, number]
  color: string
  repeatCount: number
}

// 默认颜色
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

/**
 * 象形柱图系列类
 */
export class PictorialBarSeries extends Series {
  protected declare option: PictorialBarSeriesOption
  private xScale: IScale | null = null
  private yScale: IScale | null = null
  private cachedBars: CachedBar[] = []
  private hoveredIndex: number = -1

  constructor(option: PictorialBarSeriesOption) {
    super(option)
  }

  get type(): string {
    return 'pictorialBar'
  }

  /**
   * 设置比例尺
   */
  setScales(xScale: IScale, yScale: IScale): void {
    this.xScale = xScale
    this.yScale = yScale
  }

  /**
   * 设置悬停索引
   */
  setHoveredIndex(index: number): void {
    this.hoveredIndex = index
  }

  /**
   * 渲染象形柱图
   */
  render(renderer: IRenderer): void {
    if (!this.xScale || !this.yScale) return

    const data = this.option.data || []
    if (data.length === 0) return

    // 计算柱子
    this.calculateBars(data)

    // 渲染每个柱子
    for (let i = 0; i < this.cachedBars.length; i++) {
      const bar = this.cachedBars[i]!
      const isHovered = i === this.hoveredIndex
      this.renderBar(renderer, bar, isHovered, i)
    }
  }

  /**
   * 计算柱子数据
   */
  private calculateBars(data: (number | PictorialBarDataItem)[]): void {
    this.cachedBars = []

    const barWidth = this.getBarWidth()
    const symbolRepeat = this.option.symbolRepeat

    for (let i = 0; i < data.length; i++) {
      const item = data[i]!
      const value = typeof item === 'number' ? item : item.value
      const name = typeof item === 'number' ? `${i}` : (item.name || `${i}`)
      const itemSymbol = typeof item === 'number' ? undefined : item.symbol
      const itemColor = typeof item === 'number' ? undefined : item.itemStyle?.color

      // 计算位置
      const x = this.xScale!.map(i as never)
      const y0 = this.yScale!.map(0 as never)
      const y1 = this.yScale!.map(value as never)

      const barX = (x as number) - barWidth / 2
      const barY = Math.min(y0 as number, y1 as number)
      const barHeight = Math.abs((y1 as number) - (y0 as number))

      // 获取符号配置
      const symbol = itemSymbol || this.option.symbol || 'rect'
      const symbolSize = this.getSymbolSize(typeof item === 'number' ? undefined : item)
      const color = itemColor || DEFAULT_COLORS[i % DEFAULT_COLORS.length]!

      // 计算重复次数
      let repeatCount = 1
      if (symbolRepeat === true) {
        repeatCount = Math.max(1, Math.floor(barHeight / symbolSize[1]))
      } else if (typeof symbolRepeat === 'number') {
        repeatCount = symbolRepeat
      }

      this.cachedBars.push({
        x: barX,
        y: barY,
        width: barWidth,
        height: barHeight,
        value,
        name,
        symbol,
        symbolSize,
        color,
        repeatCount,
      })
    }
  }

  /**
   * 获取柱子宽度
   */
  private getBarWidth(): number {
    const barWidth = this.option.barWidth
    if (typeof barWidth === 'number') return barWidth

    // 根据数据量自动计算
    const dataLength = this.option.data?.length || 1
    const range = this.xScale!.getRange()
    const totalWidth = Math.abs(range[1]! - range[0]!)
    return Math.max(10, totalWidth / dataLength * 0.6)
  }

  /**
   * 获取符号大小
   */
  private getSymbolSize(item?: PictorialBarDataItem): [number, number] {
    const size = item?.symbolSize || this.option.symbolSize || 20

    if (typeof size === 'number') {
      return [size, size]
    }
    if (Array.isArray(size)) {
      return [size[0] ?? 20, size[1] ?? 20]
    }
    return [20, 20]
  }

  /**
   * 渲染单个柱子
   */
  private renderBar(
    renderer: IRenderer,
    bar: CachedBar,
    isHovered: boolean,
    _index: number
  ): void {
    const { symbol, symbolSize, color, repeatCount } = bar
    const opacity = isHovered ? 1 : 0.9
    const scale = isHovered ? 1.05 : 1

    const symbolRepeat = this.option.symbolRepeat
    const symbolClip = this.option.symbolClip ?? false
    const symbolMargin = typeof this.option.symbolMargin === 'number'
      ? this.option.symbolMargin
      : 2

    if (symbolRepeat) {
      // 重复符号
      const direction = this.option.symbolRepeatDirection || 'start'
      const startY = direction === 'start' ? bar.y + bar.height : bar.y

      for (let i = 0; i < repeatCount; i++) {
        const offsetY = direction === 'start'
          ? -(i * (symbolSize[1] + symbolMargin) + symbolSize[1] / 2)
          : (i * (symbolSize[1] + symbolMargin) + symbolSize[1] / 2)

        const symX = bar.x + bar.width / 2
        const symY = startY + offsetY

        // 如果启用裁剪，检查是否在柱体范围内
        if (symbolClip) {
          if (symY < bar.y || symY > bar.y + bar.height) continue
        }

        this.renderSymbol(
          renderer,
          symbol,
          symX,
          symY,
          symbolSize[0] * scale,
          symbolSize[1] * scale,
          color,
          opacity
        )
      }
    } else {
      // 单个符号填满
      const position = this.option.symbolPosition || 'end'
      let symX = bar.x + bar.width / 2
      // position used for offset calculation if needed
      // 符号填满整个柱体高度
      const actualHeight = symbolClip ? bar.height : symbolSize[1]
      void position  // used for future positioning logic

      this.renderSymbol(
        renderer,
        symbol,
        symX,
        bar.y + bar.height / 2,
        bar.width * scale,
        actualHeight * scale,
        color,
        opacity
      )
    }

    // 渲染标签
    if (this.option.labelShow) {
      this.renderLabel(renderer, bar)
    }
  }

  /**
   * 渲染符号
   */
  private renderSymbol(
    renderer: IRenderer,
    symbol: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    opacity: number
  ): void {
    const halfW = width / 2
    const halfH = height / 2

    switch (symbol) {
      case 'circle':
        renderer.drawCircle(
          { x, y, radius: Math.min(halfW, halfH) },
          { fill: color, opacity }
        )
        break

      case 'rect':
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x: x - halfW, y: y - halfH },
              { type: 'L', x: x + halfW, y: y - halfH },
              { type: 'L', x: x + halfW, y: y + halfH },
              { type: 'L', x: x - halfW, y: y + halfH },
              { type: 'Z' },
            ],
          },
          { fill: color, opacity }
        )
        break

      case 'roundRect':
        const r = Math.min(halfW, halfH) * 0.2
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x: x - halfW + r, y: y - halfH },
              { type: 'L', x: x + halfW - r, y: y - halfH },
              { type: 'Q', x1: x + halfW, y1: y - halfH, x: x + halfW, y: y - halfH + r },
              { type: 'L', x: x + halfW, y: y + halfH - r },
              { type: 'Q', x1: x + halfW, y1: y + halfH, x: x + halfW - r, y: y + halfH },
              { type: 'L', x: x - halfW + r, y: y + halfH },
              { type: 'Q', x1: x - halfW, y1: y + halfH, x: x - halfW, y: y + halfH - r },
              { type: 'L', x: x - halfW, y: y - halfH + r },
              { type: 'Q', x1: x - halfW, y1: y - halfH, x: x - halfW + r, y: y - halfH },
              { type: 'Z' },
            ],
          },
          { fill: color, opacity }
        )
        break

      case 'triangle':
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y: y - halfH },
              { type: 'L', x: x + halfW, y: y + halfH },
              { type: 'L', x: x - halfW, y: y + halfH },
              { type: 'Z' },
            ],
          },
          { fill: color, opacity }
        )
        break

      case 'diamond':
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y: y - halfH },
              { type: 'L', x: x + halfW, y },
              { type: 'L', x, y: y + halfH },
              { type: 'L', x: x - halfW, y },
              { type: 'Z' },
            ],
          },
          { fill: color, opacity }
        )
        break

      case 'arrow':
        const arrowWidth = halfW * 0.6
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y: y - halfH },
              { type: 'L', x: x + halfW, y: y + halfH * 0.3 },
              { type: 'L', x: x + arrowWidth, y: y + halfH * 0.3 },
              { type: 'L', x: x + arrowWidth, y: y + halfH },
              { type: 'L', x: x - arrowWidth, y: y + halfH },
              { type: 'L', x: x - arrowWidth, y: y + halfH * 0.3 },
              { type: 'L', x: x - halfW, y: y + halfH * 0.3 },
              { type: 'Z' },
            ],
          },
          { fill: color, opacity }
        )
        break

      default:
        // 默认矩形
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x: x - halfW, y: y - halfH },
              { type: 'L', x: x + halfW, y: y - halfH },
              { type: 'L', x: x + halfW, y: y + halfH },
              { type: 'L', x: x - halfW, y: y + halfH },
              { type: 'Z' },
            ],
          },
          { fill: color, opacity }
        )
    }
  }

  /**
   * 渲染标签
   */
  private renderLabel(renderer: IRenderer, bar: CachedBar): void {
    const position = this.option.labelPosition || 'top'
    const formatter = this.option.labelFormatter
    const color = this.option.labelColor || '#333'
    const fontSize = this.option.labelFontSize || 12

    let labelX = bar.x + bar.width / 2
    let labelY: number
    let textBaseline: 'top' | 'middle' | 'bottom' = 'middle'

    switch (position) {
      case 'inside':
        labelY = bar.y + bar.height / 2
        break
      case 'top':
        labelY = bar.y - 5
        textBaseline = 'bottom'
        break
      case 'bottom':
        labelY = bar.y + bar.height + 5
        textBaseline = 'top'
        break
      default:
        labelY = bar.y - 5
        textBaseline = 'bottom'
    }

    const text = formatter
      ? (typeof formatter === 'function'
        ? formatter({ value: bar.value, name: bar.name })
        : String(bar.value))
      : String(bar.value)

    renderer.drawText(
      { text, x: labelX, y: labelY },
      {
        fill: color,
        fontSize,
        textAlign: 'center',
        textBaseline,
      }
    )
  }

  /**
   * 根据坐标找到柱子
   */
  findBarAtPosition(mouseX: number, mouseY: number): { bar: CachedBar | null; index: number } {
    for (let i = 0; i < this.cachedBars.length; i++) {
      const bar = this.cachedBars[i]!
      if (
        mouseX >= bar.x &&
        mouseX <= bar.x + bar.width &&
        mouseY >= bar.y &&
        mouseY <= bar.y + bar.height
      ) {
        return { bar, index: i }
      }
    }
    return { bar: null, index: -1 }
  }

  /**
   * 销毁
   */
  dispose(): void {
    super.dispose()
    this.cachedBars = []
    this.xScale = null
    this.yScale = null
  }
}
