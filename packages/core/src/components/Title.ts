/**
 * 标题组件
 */

import type { Rect, TitleOptions, TextStyle } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { Component } from './Component'
import { parsePadding } from '../utils/data'

const defaultOptions: TitleOptions = {
  show: true,
  text: '',
  subtext: '',
  position: 'top',
  align: 'center',
  textStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtextStyle: {
    fontSize: 12,
    color: '#666',
  },
  padding: 10,
}

export class Title extends Component<TitleOptions> {
  constructor(options: TitleOptions = {}) {
    super({ ...defaultOptions, ...options })
  }

  layout(containerBounds: Rect): Rect {
    if (!this.isVisible() || !this.options.text) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    const padding = parsePadding(this.options.padding)
    const titleFontSize = this.options.textStyle?.fontSize ?? 18
    const subtextFontSize = this.options.subtextStyle?.fontSize ?? 12
    const lineHeight = 1.4

    let height = padding.top + titleFontSize * lineHeight + padding.bottom
    if (this.options.subtext) {
      height += subtextFontSize * lineHeight
    }

    this.bounds = {
      x: containerBounds.x,
      y: containerBounds.y,
      width: containerBounds.width,
      height,
    }

    return this.bounds
  }

  render(renderer: BaseRenderer): void {
    if (!this.isVisible() || !this.options.text) return

    const padding = parsePadding(this.options.padding)
    const { align = 'center' } = this.options

    // 计算 x 坐标
    let x: number
    let textAlign: CanvasTextAlign = 'center'

    switch (align) {
      case 'left':
        x = this.bounds.x + padding.left
        textAlign = 'left'
        break
      case 'right':
        x = this.bounds.x + this.bounds.width - padding.right
        textAlign = 'right'
        break
      default:
        x = this.bounds.x + this.bounds.width / 2
        textAlign = 'center'
    }

    // 绘制主标题
    const titleStyle: TextStyle = {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      align: textAlign,
      baseline: 'top',
      ...this.options.textStyle,
    }

    let y = this.bounds.y + padding.top
    renderer.drawText(this.options.text, { x, y }, titleStyle)

    // 绘制副标题
    if (this.options.subtext) {
      const subtextStyle: TextStyle = {
        fontSize: 12,
        color: '#666',
        align: textAlign,
        baseline: 'top',
        ...this.options.subtextStyle,
      }

      y += (titleStyle.fontSize ?? 18) * 1.4
      renderer.drawText(this.options.subtext, { x, y }, subtextStyle)
    }
  }
}
