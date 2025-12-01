/**
 * 提示框组件
 */

import type { IRenderer } from '../renderer/interface'
import type { IComponent, ComponentOptions } from './interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 提示框触发类型
 */
export type TooltipTrigger = 'item' | 'axis' | 'none'

/**
 * 提示框位置类型
 */
export type TooltipPosition = 'auto' | 'fixed' | [number, number] | ((point: [number, number]) => [number, number])

/**
 * 提示框数据项
 */
export interface TooltipDataItem {
  seriesName?: string
  name?: string
  value: number | string
  color?: string
  marker?: string
}

/**
 * 提示框组件配置
 */
export interface TooltipComponentOptions extends ComponentOptions {
  type: 'tooltip'
  show?: boolean
  trigger?: TooltipTrigger
  position?: TooltipPosition
  formatter?: string | ((params: TooltipDataItem | TooltipDataItem[]) => string)
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: number | number[]
  textStyle?: {
    color?: string
    fontSize?: number
    fontFamily?: string
    lineHeight?: number
  }
  extraCssText?: string
  confine?: boolean  // 是否将 tooltip 框限制在图表区域内
  transitionDuration?: number  // 提示框浮层的移动动画过渡时间
  axisPointer?: {
    type?: 'line' | 'shadow' | 'cross' | 'none'
    lineStyle?: {
      color?: string
      width?: number
      type?: 'solid' | 'dashed' | 'dotted'
    }
  }
}

/**
 * 提示框组件类
 */
export class Tooltip extends EventEmitter implements IComponent {
  readonly type: 'tooltip' = 'tooltip'
  visible: boolean = true
  private option: TooltipComponentOptions
  private currentData: TooltipDataItem | TooltipDataItem[] | null = null
  private currentPosition: [number, number] = [0, 0]
  private isShowing: boolean = false
  private boundingRect: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  constructor(option: TooltipComponentOptions) {
    super()
    this.option = {
      show: true,
      trigger: 'item',
      position: 'auto',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      borderWidth: 0,
      borderRadius: 4,
      padding: [5, 10],
      textStyle: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'sans-serif',
        lineHeight: 1.5,
      },
      transitionDuration: 0.2,
      ...option,
    }
  }

  /**
   * 渲染提示框
   */
  render(renderer: IRenderer): void {
    if (!this.visible || !this.isShowing || !this.currentData) {
      return
    }

    const content = this.formatContent(this.currentData)
    const { x, y, width, height } = this.calculatePosition(renderer, content)
    
    // 更新边界矩形
    this.boundingRect = { x, y, width, height }

    // 绘制背景
    this.renderBackground(renderer, x, y, width, height)

    // 绘制内容
    this.renderContent(renderer, x, y, content)

    // 绘制坐标轴指示器
    if (this.option.axisPointer && this.option.trigger === 'axis') {
      this.renderAxisPointer(renderer)
    }
  }

  /**
   * 显示提示框
   */
  showTooltip(data: TooltipDataItem | TooltipDataItem[], position: [number, number]): void {
    this.currentData = data
    this.currentPosition = position
    this.isShowing = true
    this.emit('tooltipshow', { data, position })
  }

  /**
   * 隐藏提示框
   */
  hideTooltip(): void {
    this.isShowing = false
    this.currentData = null
    this.emit('tooltiphide')
  }

  /**
   * 格式化内容
   */
  private formatContent(data: TooltipDataItem | TooltipDataItem[]): string {
    if (this.option.formatter) {
      if (typeof this.option.formatter === 'function') {
        return this.option.formatter(data)
      }
      // 字符串模板格式化
      return this.option.formatter
    }

    // 默认格式化
    if (Array.isArray(data)) {
      return data.map(item => {
        const marker = item.marker || this.createColorMarker(item.color || '#333')
        return `${marker} ${item.seriesName || ''}: ${item.value}`
      }).join('\n')
    } else {
      const marker = data.marker || this.createColorMarker(data.color || '#333')
      return `${marker} ${data.name || ''}: ${data.value}`
    }
  }

  /**
   * 创建颜色标记
   */
  private createColorMarker(_color: string): string {
    return `●` // 使用 Unicode 圆点作为标记
  }

  /**
   * 计算提示框位置和尺寸
   */
  private calculatePosition(
    _renderer: IRenderer,
    content: string
  ): { x: number; y: number; width: number; height: number } {
    const padding = this.normalizePadding(this.option.padding)
    const textStyle = this.option.textStyle!
    const fontSize = textStyle.fontSize!
    const lineHeight = textStyle.lineHeight || 1.5

    // 计算内容尺寸
    const lines = content.split('\n')
    const maxLineWidth = Math.max(...lines.map(line => this.estimateTextWidth(line, fontSize)))
    const contentWidth = maxLineWidth
    const contentHeight = lines.length * fontSize * lineHeight

    const width = contentWidth + padding[1] + padding[3]
    const height = contentHeight + padding[0] + padding[2]

    // 计算位置
    let x = this.currentPosition[0]
    let y = this.currentPosition[1]

    if (this.option.position === 'auto') {
      // 自动定位：尝试在鼠标右下方，如果超出则调整
      x += 10
      y += 10

      // 简单的边界检测（假设容器是 800x600）
      const containerWidth = 800
      const containerHeight = 600

      if (x + width > containerWidth) {
        x = this.currentPosition[0] - width - 10
      }
      if (y + height > containerHeight) {
        y = this.currentPosition[1] - height - 10
      }

      // 确保不超出左边和顶部
      x = Math.max(0, x)
      y = Math.max(0, y)
    } else if (Array.isArray(this.option.position)) {
      x = this.option.position[0]
      y = this.option.position[1]
    } else if (typeof this.option.position === 'function') {
      [x, y] = this.option.position(this.currentPosition)
    }

    return { x, y, width, height }
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
   * 渲染内容
   */
  private renderContent(renderer: IRenderer, x: number, y: number, content: string): void {
    const padding = this.normalizePadding(this.option.padding)
    const textStyle = this.option.textStyle!
    const fontSize = textStyle.fontSize!
    const lineHeight = textStyle.lineHeight || 1.5

    const lines = content.split('\n')
    let currentY = y + padding[0] + fontSize / 2

    lines.forEach(line => {
      renderer.drawText(
        {
          text: line,
          x: x + padding[3],
          y: currentY,
        },
        {
          fill: textStyle.color!,
          fontSize,
          fontFamily: textStyle.fontFamily!,
          textAlign: 'left',
          textBaseline: 'middle',
        }
      )
      currentY += fontSize * lineHeight
    })
  }

  /**
   * 渲染坐标轴指示器
   */
  private renderAxisPointer(renderer: IRenderer): void {
    const axisPointer = this.option.axisPointer
    if (!axisPointer || axisPointer.type === 'none') {
      return
    }

    const lineStyle = axisPointer.lineStyle || {}
    const x = this.currentPosition[0]
    const y = this.currentPosition[1]

    if (axisPointer.type === 'line') {
      // 垂直线
      renderer.drawPath(
        {
          commands: [
            { type: 'M', x, y: 0 },
            { type: 'L', x, y: 600 }, // 假设容器高度为 600
          ],
        },
        {
          stroke: lineStyle.color || '#555',
          lineWidth: lineStyle.width || 1,
          lineDash: lineStyle.type === 'dashed' ? [4, 4] : lineStyle.type === 'dotted' ? [2, 2] : undefined,
        }
      )
    } else if (axisPointer.type === 'cross') {
      // 十字线
      renderer.drawPath(
        {
          commands: [
            { type: 'M', x, y: 0 },
            { type: 'L', x, y: 600 },
          ],
        },
        {
          stroke: lineStyle.color || '#555',
          lineWidth: lineStyle.width || 1,
          lineDash: lineStyle.type === 'dashed' ? [4, 4] : lineStyle.type === 'dotted' ? [2, 2] : undefined,
        }
      )
      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: 0, y },
            { type: 'L', x: 800, y }, // 假设容器宽度为 800
          ],
        },
        {
          stroke: lineStyle.color || '#555',
          lineWidth: lineStyle.width || 1,
          lineDash: lineStyle.type === 'dashed' ? [4, 4] : lineStyle.type === 'dotted' ? [2, 2] : undefined,
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
  updateOption(option: Partial<TooltipComponentOptions>): void {
    this.option = { ...this.option, ...option }
  }

  /**
   * 更新位置（实现 IComponent 接口）
   */
  update(_rect: { x: number; y: number; width: number; height: number }): void {
    // Tooltip 位置通常由鼠标事件控制，这里可以不实现
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
    this.hideTooltip()
  }

  /**
   * 销毁组件
   */
  dispose(): void {
    this.removeAllListeners()
    this.currentData = null
  }
}