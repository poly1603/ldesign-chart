/**
 * 图例组件
 */

import type { IRenderer } from '../renderer/interface'
import type { IComponent, ComponentOptions } from './interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 图例项配置
 */
export interface LegendItem {
  name: string
  icon?: 'circle' | 'rect' | 'line' | 'triangle' | 'diamond'
  color?: string
  visible?: boolean
}

/**
 * 图例布局方向
 */
export type LegendOrient = 'horizontal' | 'vertical'

/**
 * 图例位置
 */
export type LegendPosition = 'top' | 'right' | 'bottom' | 'left'

/**
 * 图例组件配置
 */
export interface LegendComponentOptions extends ComponentOptions {
  type: 'legend'
  data?: LegendItem[]
  orient?: LegendOrient
  position?: LegendPosition
  left?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string
  itemGap?: number  // 图例项之间的间距
  itemWidth?: number  // 图例标记宽度
  itemHeight?: number  // 图例标记高度
  textStyle?: {
    color?: string
    fontSize?: number
    fontFamily?: string
  }
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  padding?: number | number[]
  formatter?: (name: string) => string
}

/**
 * 图例组件类
 */
export class Legend extends EventEmitter implements IComponent {
  readonly type: 'legend' = 'legend'
  visible: boolean = true
  private option: LegendComponentOptions
  private itemStates: Map<string, boolean> = new Map()  // 记录每个图例项的显示状态
  private boundingRect: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  constructor(option: LegendComponentOptions) {
    super()
    this.option = option
    
    // 初始化图例项状态
    if (option.data) {
      option.data.forEach(item => {
        this.itemStates.set(item.name, item.visible !== false)
      })
    }
  }

  /**
   * 渲染图例
   */
  render(renderer: IRenderer): void {
    if (!this.visible || !this.option.data || this.option.data.length === 0) {
      return
    }

    const { x, y, width, height } = this.calculatePosition(renderer)
    
    // 更新边界矩形
    this.boundingRect = { x, y, width, height }

    // 绘制背景
    if (this.option.backgroundColor || this.option.borderColor) {
      this.renderBackground(renderer, x, y, width, height)
    }

    // 绘制图例项
    this.renderItems(renderer, x, y)
  }

  /**
   * 计算图例位置和尺寸
   */
  private calculatePosition(_renderer: IRenderer): {
    x: number
    y: number
    width: number
    height: number
  } {
    const orient = this.option.orient || 'horizontal'
    const itemGap = this.option.itemGap || 10
    const itemWidth = this.option.itemWidth || 25
    const itemHeight = this.option.itemHeight || 14
    const padding = this.normalizePadding(this.option.padding)
    const textStyle = this.option.textStyle || {}
    const fontSize = textStyle.fontSize || 12

    // 计算所有图例项的总尺寸
    let totalWidth = padding[3] + padding[1]
    let totalHeight = padding[0] + padding[2]

    if (orient === 'horizontal') {
      // 水平布局
      this.option.data!.forEach((item, index) => {
        const textWidth = this.estimateTextWidth(item.name, fontSize)
        totalWidth += itemWidth + 5 + textWidth
        if (index < this.option.data!.length - 1) {
          totalWidth += itemGap
        }
      })
      totalHeight += Math.max(itemHeight, fontSize)
    } else {
      // 垂直布局
      const maxTextWidth = Math.max(
        ...this.option.data!.map(item => this.estimateTextWidth(item.name, fontSize))
      )
      totalWidth += itemWidth + 5 + maxTextWidth
      totalHeight += this.option.data!.length * Math.max(itemHeight, fontSize) + 
                     (this.option.data!.length - 1) * itemGap
    }

    // 根据配置的位置计算坐标
    let x = 0
    let y = 0

    // 这里简化处理，实际应该根据容器大小动态计算
    const position = this.option.position || 'top'
    switch (position) {
      case 'top':
        x = this.option.left ? (typeof this.option.left === 'number' ? this.option.left : 20) : 20
        y = this.option.top ? (typeof this.option.top === 'number' ? this.option.top : 20) : 20
        break
      case 'right':
        x = this.option.right ? (typeof this.option.right === 'number' ? this.option.right : 20) : 20
        y = this.option.top ? (typeof this.option.top === 'number' ? this.option.top : 20) : 20
        break
      case 'bottom':
        x = this.option.left ? (typeof this.option.left === 'number' ? this.option.left : 20) : 20
        y = this.option.bottom ? (typeof this.option.bottom === 'number' ? this.option.bottom : 20) : 20
        break
      case 'left':
        x = this.option.left ? (typeof this.option.left === 'number' ? this.option.left : 20) : 20
        y = this.option.top ? (typeof this.option.top === 'number' ? this.option.top : 20) : 20
        break
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

  /**
   * 渲染图例项
   */
  private renderItems(renderer: IRenderer, startX: number, startY: number): void {
    const orient = this.option.orient || 'horizontal'
    const itemGap = this.option.itemGap || 10
    const itemWidth = this.option.itemWidth || 25
    const itemHeight = this.option.itemHeight || 14
    const padding = this.normalizePadding(this.option.padding)
    const textStyle = this.option.textStyle || {}

    let currentX = startX + padding[3]
    let currentY = startY + padding[0]

    this.option.data!.forEach((item, _index) => {
      const isVisible = this.itemStates.get(item.name) !== false
      const opacity = isVisible ? 1 : 0.3

      // 渲染图例标记
      this.renderIcon(
        renderer,
        currentX,
        currentY,
        itemWidth,
        itemHeight,
        item.icon || 'rect',
        item.color || '#5470c6',
        opacity
      )

      // 渲染文本
      const formatter = this.option.formatter || ((name: string) => name)
      const text = formatter(item.name)
      
      renderer.drawText(
        {
          text,
          x: currentX + itemWidth + 5,
          y: currentY + itemHeight / 2,
        },
        {
          fill: textStyle.color || '#333',
          fontSize: textStyle.fontSize || 12,
          fontFamily: textStyle.fontFamily || 'sans-serif',
          textAlign: 'left',
          textBaseline: 'middle',
          opacity,
        }
      )

      // 更新位置
      if (orient === 'horizontal') {
        const textWidth = this.estimateTextWidth(text, textStyle.fontSize || 12)
        currentX += itemWidth + 5 + textWidth + itemGap
      } else {
        currentY += Math.max(itemHeight, textStyle.fontSize || 12) + itemGap
      }
    })
  }

  /**
   * 渲染图例标记
   */
  private renderIcon(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    height: number,
    icon: string,
    color: string,
    opacity: number
  ): void {
    const centerX = x + width / 2
    const centerY = y + height / 2

    switch (icon) {
      case 'circle':
        renderer.drawCircle(
          { x: centerX, y: centerY, radius: Math.min(width, height) / 2 },
          { fill: color, opacity }
        )
        break

      case 'rect':
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
          { fill: color, opacity }
        )
        break

      case 'line':
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x, y: centerY },
              { type: 'L', x: x + width, y: centerY },
            ],
          },
          { stroke: color, lineWidth: 2, opacity }
        )
        break

      case 'triangle':
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x: centerX, y },
              { type: 'L', x: x + width, y: y + height },
              { type: 'L', x, y: y + height },
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
              { type: 'M', x: centerX, y },
              { type: 'L', x: x + width, y: centerY },
              { type: 'L', x: centerX, y: y + height },
              { type: 'L', x, y: centerY },
              { type: 'Z' },
            ],
          },
          { fill: color, opacity }
        )
        break
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
    // 简单估算，实际应该根据字体测量
    return text.length * fontSize * 0.6
  }

  /**
   * 切换图例项状态
   */
  toggleItem(name: string): boolean {
    const currentState = this.itemStates.get(name)
    const newState = !currentState
    this.itemStates.set(name, newState)
    
    // 触发事件
    this.emit('legendselectchanged', { name, selected: newState })
    
    return newState
  }

  /**
   * 获取图例项状态
   */
  getItemState(name: string): boolean {
    return this.itemStates.get(name) !== false
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<LegendComponentOptions>): void {
    this.option = { ...this.option, ...option }
    
    // 更新图例项状态
    if (option.data) {
      option.data.forEach(item => {
        if (!this.itemStates.has(item.name)) {
          this.itemStates.set(item.name, item.visible !== false)
        }
      })
    }
  }

  /**
   * 更新位置（实现 IComponent 接口）
   */
  update(rect: { x: number; y: number; width: number; height: number }): void {
    // 简单实现，可以根据 rect 更新位置
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
    this.itemStates.clear()
  }
}