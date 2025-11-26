/**
 * 提示框组件
 */

import type { Rect, TooltipOptions, TooltipParams, Point } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { Component } from './Component'
import { parsePadding, isFunction } from '../utils/data'

const defaultOptions: TooltipOptions = {
  show: true,
  trigger: 'item',
  triggerOn: 'mousemove',
  backgroundColor: 'rgba(50, 50, 50, 0.9)',
  borderColor: '#333',
  borderWidth: 1,
  padding: 8,
  textStyle: {
    fontSize: 12,
    color: '#fff',
  },
  followPointer: true,
}

export class Tooltip extends Component<TooltipOptions> {
  private visible: boolean = false
  private position: Point = { x: 0, y: 0 }
  private params: TooltipParams | null = null
  private containerBounds: Rect = { x: 0, y: 0, width: 0, height: 0 }

  constructor(options: TooltipOptions = {}) {
    super({ ...defaultOptions, ...options })
  }

  /** 显示提示框 */
  show(position: Point, params: TooltipParams): void {
    this.visible = true
    this.position = position
    this.params = params
  }

  /** 隐藏提示框 */
  hide(): void {
    this.visible = false
    this.params = null
  }

  /** 更新位置 */
  updatePosition(position: Point): void {
    this.position = position
  }

  /** 是否可见 */
  isTooltipVisible(): boolean {
    return this.visible && this.params !== null
  }

  layout(containerBounds: Rect): Rect {
    this.containerBounds = containerBounds
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  render(renderer: BaseRenderer): void {
    if (!this.isVisible() || !this.isTooltipVisible() || !this.params) return

    const content = this.formatContent()
    if (!content) return

    const padding = parsePadding(this.options.padding)
    const fontSize = this.options.textStyle?.fontSize ?? 12
    const lineHeight = fontSize * 1.4

    // 计算内容尺寸
    const lines = content.split('\n')
    const maxWidth = Math.max(...lines.map(line => renderer.measureText(line, this.options.textStyle)))
    const width = padding.left + maxWidth + padding.right
    const height = padding.top + lines.length * lineHeight + padding.bottom

    // 计算位置（避免超出边界）
    let x = this.position.x + 10
    let y = this.position.y + 10

    if (x + width > this.containerBounds.x + this.containerBounds.width) {
      x = this.position.x - width - 10
    }
    if (y + height > this.containerBounds.y + this.containerBounds.height) {
      y = this.position.y - height - 10
    }
    if (x < this.containerBounds.x) x = this.containerBounds.x
    if (y < this.containerBounds.y) y = this.containerBounds.y

    // 绘制背景
    renderer.drawRect(
      { x, y, width, height },
      { color: this.options.backgroundColor },
      { color: this.options.borderColor, width: this.options.borderWidth }
    )

    // 绘制文本
    lines.forEach((line, index) => {
      renderer.drawText(
        line,
        { x: x + padding.left, y: y + padding.top + index * lineHeight + fontSize * 0.3 },
        { ...this.options.textStyle, baseline: 'top' }
      )
    })
  }

  private formatContent(): string {
    if (!this.params) return ''

    const { formatter } = this.options

    if (formatter) {
      if (isFunction(formatter)) {
        return formatter(this.params)
      }
      return this.replaceTemplate(formatter, this.params)
    }

    // 默认格式化
    const parts: string[] = []

    if (this.params.seriesName) {
      parts.push(this.params.seriesName)
    }

    if (this.params.name !== undefined) {
      parts.push(`${this.params.name}`)
    }

    if (this.params.value !== undefined) {
      const value = Array.isArray(this.params.value)
        ? this.params.value.join(', ')
        : this.params.value
      parts.push(`值: ${value}`)
    }

    return parts.join('\n')
  }

  private replaceTemplate(template: string, params: TooltipParams): string {
    return template
      .replace(/{a}/g, params.seriesName ?? '')
      .replace(/{b}/g, params.name ?? '')
      .replace(/{c}/g, String(params.value ?? ''))
  }
}
