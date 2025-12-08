/**
 * 坐标轴组件
 */

import type { IComponent } from './interface'
import type { IRenderer } from '../renderer/interface'
import type { IScale } from '../scale/interface'
import type { Rect, Point } from '../types'

/**
 * 坐标轴方向
 */
export type AxisOrientation = 'top' | 'right' | 'bottom' | 'left'

/**
 * 扩展的坐标轴配置
 */
export interface AxisComponentOptions {
  /** 坐标轴方向 */
  orientation: AxisOrientation
  /** 比例尺 */
  scale: IScale<any, number>
  /** 是否显示 */
  show?: boolean
  /** 是否是类目轴 */
  isCategory?: boolean
  /** 类目数据 */
  categories?: string[]
  /** 轴线样式 */
  axisLine?: {
    show?: boolean
    lineStyle?: {
      color?: string
      width?: number
      type?: 'solid' | 'dashed' | 'dotted'
    }
  }
  /** 刻度配置 */
  axisTick?: {
    show?: boolean
    length?: number
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  /** 标签配置 */
  axisLabel?: {
    show?: boolean
    formatter?: string | ((value: any, index: number) => string)
    textStyle?: {
      color?: string
      fontSize?: number
      fontFamily?: string
    }
    rotate?: number
    margin?: number
  }
  /** 分割线 */
  splitLine?: {
    show?: boolean
    lineStyle?: {
      color?: string
      width?: number
      type?: 'solid' | 'dashed' | 'dotted'
    }
  }
}

/**
 * 坐标轴组件类
 */
export class Axis implements IComponent {
  readonly type = 'axis' as const
  visible = true

  private options: AxisComponentOptions
  private rect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  private scale: IScale<any, number>
  private orientation: AxisOrientation

  constructor(options: AxisComponentOptions) {
    this.options = options
    this.scale = options.scale
    this.orientation = options.orientation
    this.visible = options.show ?? true
  }

  /**
   * 渲染坐标轴
   */
  render(renderer: IRenderer): void {
    if (!this.visible) return

    const { orientation } = this
    const isHorizontal = orientation === 'top' || orientation === 'bottom'

    // 渲染轴线
    if (this.options.axisLine?.show !== false) {
      this.renderAxisLine(renderer, isHorizontal)
    }

    // 渲染刻度
    if (this.options.axisTick?.show !== false) {
      this.renderAxisTicks(renderer, isHorizontal)
    }

    // 渲染标签
    if (this.options.axisLabel?.show !== false) {
      this.renderAxisLabels(renderer, isHorizontal)
    }
  }

  /**
   * 渲染轴线
   */
  private renderAxisLine(renderer: IRenderer, isHorizontal: boolean): void {
    const { x, y, width, height } = this.rect
    const lineStyle = this.options.axisLine?.lineStyle || {}

    const start: Point = isHorizontal
      ? { x, y: y + height / 2 }
      : { x: x + width / 2, y }

    const end: Point = isHorizontal
      ? { x: x + width, y: y + height / 2 }
      : { x: x + width / 2, y: y + height }

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: start.x, y: start.y },
          { type: 'L', x: end.x, y: end.y },
        ],
      },
      {
        stroke: lineStyle.color || '#333',
        lineWidth: lineStyle.width || 1,
      }
    )
  }

  /**
   * 渲染刻度线
   */
  private renderAxisTicks(renderer: IRenderer, isHorizontal: boolean): void {
    const ticks = this.scale.getTicks()
    const range = this.scale.getRange()
    const tickLength = this.options.axisTick?.length || 5

    for (const tick of ticks) {
      const pos = this.scale.map(tick)

      if (isHorizontal) {
        const x = this.rect.x + ((pos - range[0]!) / (range[1]! - range[0]!)) * this.rect.width
        const y = this.orientation === 'bottom'
          ? this.rect.y
          : this.rect.y + this.rect.height

        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y },
              { type: 'L', x, y: y + (this.orientation === 'bottom' ? tickLength : -tickLength) },
            ],
          },
          {
            stroke: '#333',
            lineWidth: 1,
          }
        )
      } else {
        const x = this.orientation === 'right'
          ? this.rect.x
          : this.rect.x + this.rect.width
        const y = this.rect.y + ((pos - range[0]!) / (range[1]! - range[0]!)) * this.rect.height

        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y },
              { type: 'L', x: x + (this.orientation === 'right' ? tickLength : -tickLength), y },
            ],
          },
          {
            stroke: '#333',
            lineWidth: 1,
          }
        )
      }
    }
  }

  /**
   * 渲染刻度标签
   */
  private renderAxisLabels(renderer: IRenderer, isHorizontal: boolean): void {
    const ticks = this.scale.getTicks()
    const range = this.scale.getRange()
    const formatter = this.options.axisLabel?.formatter
    const textStyle = this.options.axisLabel?.textStyle || {}

    for (const tick of ticks) {
      const pos = this.scale.map(tick)
      let label = String(tick)

      if (typeof formatter === 'function') {
        label = formatter(tick, ticks.indexOf(tick))
      } else if (typeof formatter === 'string') {
        label = formatter.replace('{value}', String(tick))
      }

      if (isHorizontal) {
        const x = this.rect.x + ((pos - range[0]!) / (range[1]! - range[0]!)) * this.rect.width
        const y = this.orientation === 'bottom'
          ? this.rect.y + 20
          : this.rect.y + this.rect.height - 20

        renderer.drawText(
          { x, y, text: label },
          {
            fill: textStyle.color || '#666',
            fontSize: textStyle.fontSize || 12,
            textAlign: 'center',
            textBaseline: this.orientation === 'bottom' ? 'top' : 'bottom',
          }
        )
      } else {
        const x = this.orientation === 'right'
          ? this.rect.x + 10
          : this.rect.x + this.rect.width - 10
        const y = this.rect.y + ((pos - range[0]!) / (range[1]! - range[0]!)) * this.rect.height

        renderer.drawText(
          { x, y, text: label },
          {
            fill: textStyle.color || '#666',
            fontSize: textStyle.fontSize || 12,
            textAlign: this.orientation === 'right' ? 'left' : 'right',
            textBaseline: 'middle',
          }
        )
      }
    }
  }

  /**
   * 获取组件边界
   */
  getBoundingRect(): Rect {
    return { ...this.rect }
  }

  /**
   * 更新布局
   */
  update(rect: Rect): void {
    this.rect = { ...rect }

    // 更新比例尺范围
    if (this.orientation === 'top' || this.orientation === 'bottom') {
      this.scale.setRange([0, rect.width])
    } else {
      this.scale.setRange([rect.height, 0])
    }
  }

  /**
   * 设置比例尺
   */
  setScale(scale: IScale<any, number>): void {
    this.scale = scale
  }

  /**
   * 获取比例尺
   */
  getScale(): IScale<any, number> {
    return this.scale
  }

  /**
   * 销毁组件
   */
  dispose(): void {
    // 清理资源
  }
}