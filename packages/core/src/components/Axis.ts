/**
 * 坐标轴组件
 */

import type { Rect, AxisOptions, TextStyle } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { Component } from './Component'
import { generateTicks, getMinMax } from '../utils/math'
import { isNumber } from '../utils/data'

const defaultOptions: AxisOptions = {
  show: true,
  type: 'value',
  splitNumber: 5,
  axisLine: { show: true, style: { color: '#333', width: 1 } },
  axisTick: { show: true, length: 5, style: { color: '#333', width: 1 } },
  axisLabel: { show: true, style: { fontSize: 12, color: '#666' } },
  splitLine: { show: true, style: { color: '#eee', width: 1 } },
}

export type AxisPosition = 'left' | 'right' | 'top' | 'bottom'

export class Axis extends Component<AxisOptions> {
  private position: AxisPosition
  private scale: { min: number; max: number; ticks: number[] } = { min: 0, max: 0, ticks: [] }

  constructor(position: AxisPosition, options: AxisOptions = {}) {
    super({ ...defaultOptions, ...options })
    this.position = position
  }

  /** 获取轴位置 */
  getPosition(): AxisPosition {
    return this.position
  }

  /** 设置数据范围 */
  setDataRange(data: number[]): void {
    if (data.length === 0) {
      this.scale = { min: 0, max: 100, ticks: generateTicks(0, 100, this.options.splitNumber) }
      return
    }

    const { min: dataMin, max: dataMax } = getMinMax(data)

    let min = this.options.min
    let max = this.options.max

    if (min === 'auto' || min === undefined) min = dataMin
    if (max === 'auto' || max === undefined) max = dataMax

    // 确保 min 和 max 有效
    if (!isNumber(min)) min = dataMin
    if (!isNumber(max)) max = dataMax

    // 添加边距
    const range = max - min
    if (range === 0) {
      min -= 1
      max += 1
    }

    const ticks = generateTicks(min, max, this.options.splitNumber)
    this.scale = { min: ticks[0], max: ticks[ticks.length - 1], ticks }
  }

  /** 设置分类数据 */
  setCategoryData(data: (string | number)[]): void {
    this.options.data = data
  }

  /** 获取刻度 */
  getTicks(): number[] | (string | number)[] {
    if (this.options.type === 'category' && this.options.data) {
      return this.options.data
    }
    return this.scale.ticks
  }

  /** 数据值转像素位置 */
  valueToPixel(value: number | string): number {
    const isHorizontal = this.position === 'top' || this.position === 'bottom'
    const length = isHorizontal ? this.bounds.width : this.bounds.height

    if (this.options.type === 'category' && this.options.data) {
      const index = typeof value === 'string'
        ? this.options.data.indexOf(value)
        : value
      const count = this.options.data.length
      const step = length / count
      const pos = step * index + step / 2

      return isHorizontal
        ? this.bounds.x + pos
        : this.bounds.y + this.bounds.height - pos
    }

    const numValue = typeof value === 'number' ? value : parseFloat(value as string)
    const ratio = (numValue - this.scale.min) / (this.scale.max - this.scale.min)

    if (isHorizontal) {
      return this.bounds.x + ratio * length
    }
    return this.bounds.y + this.bounds.height - ratio * length
  }

  layout(containerBounds: Rect): Rect {
    const axisSize = 40 // 轴的固定尺寸

    switch (this.position) {
      case 'left':
        this.bounds = {
          x: containerBounds.x,
          y: containerBounds.y,
          width: axisSize,
          height: containerBounds.height,
        }
        break
      case 'right':
        this.bounds = {
          x: containerBounds.x + containerBounds.width - axisSize,
          y: containerBounds.y,
          width: axisSize,
          height: containerBounds.height,
        }
        break
      case 'top':
        this.bounds = {
          x: containerBounds.x,
          y: containerBounds.y,
          width: containerBounds.width,
          height: axisSize,
        }
        break
      case 'bottom':
        this.bounds = {
          x: containerBounds.x,
          y: containerBounds.y + containerBounds.height - axisSize,
          width: containerBounds.width,
          height: axisSize,
        }
        break
    }

    return this.bounds
  }

  render(renderer: BaseRenderer): void {
    if (!this.isVisible()) return

    this.renderAxisLine(renderer)
    this.renderTicks(renderer)
    this.renderLabels(renderer)
  }

  private renderAxisLine(renderer: BaseRenderer): void {
    if (!this.options.axisLine?.show) return

    const style = this.options.axisLine.style ?? { color: '#333', width: 1 }
    const { x, y, width, height } = this.bounds

    let start = { x: 0, y: 0 }
    let end = { x: 0, y: 0 }

    switch (this.position) {
      case 'left':
        start = { x: x + width, y }
        end = { x: x + width, y: y + height }
        break
      case 'right':
        start = { x, y }
        end = { x, y: y + height }
        break
      case 'top':
        start = { x, y: y + height }
        end = { x: x + width, y: y + height }
        break
      case 'bottom':
        start = { x, y }
        end = { x: x + width, y }
        break
    }

    renderer.drawLine([start, end], style)
  }

  private renderTicks(renderer: BaseRenderer): void {
    if (!this.options.axisTick?.show) return

    const ticks = this.getTicks()
    const style = this.options.axisTick.style ?? { color: '#333', width: 1 }
    const length = this.options.axisTick.length ?? 5

    ticks.forEach((tick, index) => {
      const pos = this.valueToPixel(this.options.type === 'category' ? index : (tick as number))
      let start = { x: 0, y: 0 }
      let end = { x: 0, y: 0 }

      switch (this.position) {
        case 'left':
          start = { x: this.bounds.x + this.bounds.width - length, y: pos }
          end = { x: this.bounds.x + this.bounds.width, y: pos }
          break
        case 'right':
          start = { x: this.bounds.x, y: pos }
          end = { x: this.bounds.x + length, y: pos }
          break
        case 'top':
          start = { x: pos, y: this.bounds.y + this.bounds.height - length }
          end = { x: pos, y: this.bounds.y + this.bounds.height }
          break
        case 'bottom':
          start = { x: pos, y: this.bounds.y }
          end = { x: pos, y: this.bounds.y + length }
          break
      }

      renderer.drawLine([start, end], style)
    })
  }

  private renderLabels(renderer: BaseRenderer): void {
    if (!this.options.axisLabel?.show) return

    const ticks = this.getTicks()
    const style: TextStyle = {
      fontSize: 12,
      color: '#666',
      ...this.options.axisLabel.style,
    }

    const formatter = this.options.axisLabel.formatter

    ticks.forEach((tick, index) => {
      const pos = this.valueToPixel(this.options.type === 'category' ? index : (tick as number))
      let textPos = { x: 0, y: 0 }
      let textStyle: TextStyle = { ...style }

      const label = formatter
        ? typeof formatter === 'function'
          ? formatter(tick, index)
          : String(tick)
        : String(tick)

      switch (this.position) {
        case 'left':
          textPos = { x: this.bounds.x + this.bounds.width - 10, y: pos }
          textStyle = { ...textStyle, align: 'right', baseline: 'middle' }
          break
        case 'right':
          textPos = { x: this.bounds.x + 10, y: pos }
          textStyle = { ...textStyle, align: 'left', baseline: 'middle' }
          break
        case 'top':
          textPos = { x: pos, y: this.bounds.y + this.bounds.height - 10 }
          textStyle = { ...textStyle, align: 'center', baseline: 'bottom' }
          break
        case 'bottom':
          textPos = { x: pos, y: this.bounds.y + 15 }
          textStyle = { ...textStyle, align: 'center', baseline: 'top' }
          break
      }

      renderer.drawText(label, textPos, textStyle)
    })
  }
}
