/**
 * 标题组件
 */

import type { IRenderer } from '../renderer/interface'
import type { IComponent, ComponentOptions } from './interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 标题对齐方式
 */
export type TitleAlign = 'left' | 'center' | 'right'

/**
 * 标题组件配置
 */
export interface TitleComponentOptions extends ComponentOptions {
  type: 'title'
  text?: string  // 主标题文本
  subtext?: string  // 副标题文本
  left?: number | string  // 左边距
  top?: number | string  // 上边距
  right?: number | string  // 右边距
  bottom?: number | string  // 下边距
  textAlign?: TitleAlign  // 文本对齐
  textStyle?: {
    color?: string
    fontSize?: number
    fontWeight?: string | number
    fontFamily?: string
  }
  subtextStyle?: {
    color?: string
    fontSize?: number
    fontWeight?: string | number
    fontFamily?: string
  }
  itemGap?: number  // 主副标题之间的间距
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: number | number[]
  containerWidth?: number  // 容器宽度，用于计算居中对齐
  containerHeight?: number  // 容器高度
}

/**
 * 标题组件类
 */
export class Title extends EventEmitter implements IComponent {
  readonly type: 'title' = 'title'
  visible: boolean = true
  private option: TitleComponentOptions
  private boundingRect: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  constructor(option: TitleComponentOptions) {
    super()
    this.option = {
      left: 20,
      top: 20,
      textAlign: 'left',
      itemGap: 5,
      ...option,
    }
  }

  /**
   * 渲染标题
   */
  render(renderer: IRenderer): void {
    if (!this.visible) {
      return
    }

    const { text, subtext } = this.option

    // 如果没有文本内容，不渲染
    if (!text && !subtext) {
      return
    }

    const { x, y, width, height } = this.calculatePosition()
    
    // 更新边界矩形
    this.boundingRect = { x, y, width, height }

    // 绘制背景
    if (this.option.backgroundColor || this.option.borderColor) {
      this.renderBackground(renderer, x, y, width, height)
    }

    // 绘制标题文本
    this.renderText(renderer, x, y)
  }

  /**
   * 计算标题位置和尺寸
   */
  private calculatePosition(): {
    x: number
    y: number
    width: number
    height: number
  } {
    const padding = this.normalizePadding(this.option.padding)
    const textStyle = this.option.textStyle || {}
    const subtextStyle = this.option.subtextStyle || {}
    const mainFontSize = textStyle.fontSize || 18
    const subFontSize = subtextStyle.fontSize || 12
    const itemGap = this.option.itemGap || 5

    // 估算标题宽度
    let maxTextWidth = 0
    if (this.option.text) {
      maxTextWidth = Math.max(maxTextWidth, this.estimateTextWidth(this.option.text, mainFontSize))
    }
    if (this.option.subtext) {
      maxTextWidth = Math.max(maxTextWidth, this.estimateTextWidth(this.option.subtext, subFontSize))
    }

    const totalWidth = maxTextWidth + padding[1] + padding[3]
    let totalHeight = padding[0] + padding[2]

    if (this.option.text) {
      totalHeight += mainFontSize
    }
    if (this.option.subtext) {
      if (this.option.text) {
        totalHeight += itemGap
      }
      totalHeight += subFontSize
    }

    // 计算位置
    let x = 0
    let y = 0

    // 处理 left/right
    if (typeof this.option.left === 'number') {
      x = this.option.left
    } else if (this.option.left === 'center') {
      const containerWidth = this.option.containerWidth || 800
      x = (containerWidth - totalWidth) / 2
    } else if (this.option.left === 'right' || typeof this.option.right === 'number') {
      const containerWidth = this.option.containerWidth || 800
      const rightOffset = typeof this.option.right === 'number' ? this.option.right : 20
      x = containerWidth - totalWidth - rightOffset
    } else {
      x = 20  // 默认左边距
    }

    // 处理 top/bottom
    if (typeof this.option.top === 'number') {
      y = this.option.top
    } else if (typeof this.option.bottom === 'number') {
      const containerHeight = this.option.containerHeight || 600
      y = containerHeight - totalHeight - this.option.bottom
    } else {
      y = 20  // 默认上边距
    }

    return { x, y, width: totalWidth, height: totalHeight }
  }

  /**
   * 渲染背景
   */
  private renderBackground(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const borderRadius = this.option.borderRadius || 0

    if (borderRadius > 0) {
      // 带圆角的矩形
      const r = Math.min(borderRadius, width / 2, height / 2)
      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: x + r, y },
            { type: 'L', x: x + width - r, y },
            { type: 'Q', x1: x + width, y1: y, x: x + width, y: y + r },
            { type: 'L', x: x + width, y: y + height - r },
            { type: 'Q', x1: x + width, y1: y + height, x: x + width - r, y: y + height },
            { type: 'L', x: x + r, y: y + height },
            { type: 'Q', x1: x, y1: y + height, x, y: y + height - r },
            { type: 'L', x, y: y + r },
            { type: 'Q', x1: x, y1: y, x: x + r, y },
            { type: 'Z' },
          ],
        },
        {
          fill: this.option.backgroundColor,
          stroke: this.option.borderColor,
          lineWidth: this.option.borderWidth || 0,
        }
      )
    } else {
      // 普通矩形
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
          fill: this.option.backgroundColor,
          stroke: this.option.borderColor,
          lineWidth: this.option.borderWidth || 0,
        }
      )
    }
  }

  /**
   * 渲染文本
   */
  private renderText(renderer: IRenderer, startX: number, startY: number): void {
    const padding = this.normalizePadding(this.option.padding)
    const textStyle = this.option.textStyle || {}
    const subtextStyle = this.option.subtextStyle || {}
    const itemGap = this.option.itemGap || 5
    const textAlign = this.option.textAlign || 'left'

    let currentY = startY + padding[0]

    // 计算文本对齐的 x 坐标
    const getTextX = (textWidth: number): number => {
      const contentWidth = this.boundingRect.width - padding[1] - padding[3]
      switch (textAlign) {
        case 'center':
          return startX + padding[3] + (contentWidth - textWidth) / 2 + textWidth / 2
        case 'right':
          return startX + padding[3] + contentWidth
        case 'left':
        default:
          return startX + padding[3]
      }
    }

    // 渲染主标题
    if (this.option.text) {
      const fontSize = textStyle.fontSize || 18
      const textWidth = this.estimateTextWidth(this.option.text, fontSize)
      
      renderer.drawText(
        {
          text: this.option.text,
          x: getTextX(textWidth),
          y: currentY + fontSize / 2,
        },
        {
          fill: textStyle.color || '#333',
          fontSize,
          fontWeight: textStyle.fontWeight || 'bold',
          fontFamily: textStyle.fontFamily || 'sans-serif',
          textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'right',
          textBaseline: 'middle',
        }
      )

      currentY += fontSize + itemGap
    }

    // 渲染副标题
    if (this.option.subtext) {
      const fontSize = subtextStyle.fontSize || 12
      const textWidth = this.estimateTextWidth(this.option.subtext, fontSize)
      
      renderer.drawText(
        {
          text: this.option.subtext,
          x: getTextX(textWidth),
          y: currentY + fontSize / 2,
        },
        {
          fill: subtextStyle.color || '#666',
          fontSize,
          fontWeight: subtextStyle.fontWeight || 'normal',
          fontFamily: subtextStyle.fontFamily || 'sans-serif',
          textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'right',
          textBaseline: 'middle',
        }
      )
    }
  }

  /**
   * 规范化 padding
   */
  private normalizePadding(padding?: number | number[]): [number, number, number, number] {
    if (padding === undefined) {
      return [5, 10, 5, 10]
    }
    if (typeof padding === 'number') {
      return [padding, padding, padding, padding]
    }
    if (padding.length === 1) {
      return [padding[0]!, padding[0]!, padding[0]!, padding[0]!]
    }
    if (padding.length === 2) {
      return [padding[0]!, padding[1]!, padding[0]!, padding[1]!]
    }
    if (padding.length === 3) {
      return [padding[0]!, padding[1]!, padding[2]!, padding[1]!]
    }
    return [padding[0]!, padding[1]!, padding[2]!, padding[3]!]
  }

  /**
   * 估算文本宽度
   */
  private estimateTextWidth(text: string, fontSize: number): number {
    // 简单估算，中文字符按字体大小算，英文按 0.6 倍算
    let width = 0
    for (let i = 0; i < text.length; i++) {
      const char = text[i]!
      // 简单判断：ASCII 字符按 0.6 倍，其他按 1 倍
      if (char.charCodeAt(0) < 128) {
        width += fontSize * 0.6
      } else {
        width += fontSize
      }
    }
    return width
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<TitleComponentOptions>): void {
    this.option = { ...this.option, ...option }
  }

  /**
   * 更新位置（实现 IComponent 接口）
   */
  update(rect: { x: number; y: number; width: number; height: number }): void {
    this.option.left = rect.x
    this.option.top = rect.y
  }

  /**
   * 获取边界矩形
   */
  getBoundingRect(): { x: number; y: number; width: number; height: number } {
    return { ...this.boundingRect }
  }

  /**
   * 显示组件
   */
  show(): void {
    this.visible = true
  }

  /**
   * 隐藏组件
   */
  hide(): void {
    this.visible = false
  }

  /**
   * 销毁组件
   */
  dispose(): void {
    this.removeAllListeners()
  }
}