/**
 * 图例组件
 */

import type { Rect, LegendOptions, TextStyle, Point } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'
import { Component } from './Component'
import { parsePadding } from '../utils/data'

const defaultOptions: LegendOptions = {
  show: true,
  position: 'top',
  align: 'center',
  orient: 'horizontal',
  data: [],
  icon: 'circle',
  itemWidth: 14,
  itemHeight: 14,
  itemGap: 20,
  textStyle: {
    fontSize: 12,
    color: '#333',
  },
  padding: 10,
}

export interface LegendItem {
  name: string
  color: string
  selected?: boolean
}

export class Legend extends Component<LegendOptions> {
  private items: LegendItem[] = []
  private selectedMap: Map<string, boolean> = new Map()

  constructor(options: LegendOptions = {}) {
    super({ ...defaultOptions, ...options })
  }

  /** 设置图例项 */
  setItems(items: LegendItem[]): void {
    this.items = items
    items.forEach(item => {
      if (!this.selectedMap.has(item.name)) {
        this.selectedMap.set(item.name, item.selected !== false)
      }
    })
  }

  /** 获取选中状态 */
  isSelected(name: string): boolean {
    return this.selectedMap.get(name) !== false
  }

  /** 切换选中状态 */
  toggle(name: string): boolean {
    const current = this.selectedMap.get(name) !== false
    this.selectedMap.set(name, !current)
    return !current
  }

  /** 获取所有选中状态 */
  getSelected(): Record<string, boolean> {
    const result: Record<string, boolean> = {}
    this.selectedMap.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  layout(containerBounds: Rect): Rect {
    if (!this.isVisible() || this.items.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    const padding = parsePadding(this.options.padding)
    const { orient = 'horizontal', itemHeight = 14, itemGap = 20 } = this.options

    let width: number
    let height: number

    if (orient === 'horizontal') {
      height = padding.top + itemHeight + padding.bottom
      width = containerBounds.width
    } else {
      width = 120 // 垂直布局的默认宽度
      height = padding.top + this.items.length * (itemHeight + itemGap) - itemGap + padding.bottom
    }

    const { position = 'top' } = this.options

    let x = containerBounds.x
    let y = containerBounds.y

    if (position === 'bottom') {
      y = containerBounds.y + containerBounds.height - height
    } else if (position === 'left') {
      x = containerBounds.x
    } else if (position === 'right') {
      x = containerBounds.x + containerBounds.width - width
    }

    this.bounds = { x, y, width, height }
    return this.bounds
  }

  render(renderer: BaseRenderer): void {
    if (!this.isVisible() || this.items.length === 0) return

    const padding = parsePadding(this.options.padding)
    const {
      orient = 'horizontal',
      icon = 'circle',
      itemWidth = 14,
      itemHeight = 14,
      itemGap = 20,
      align = 'center',
    } = this.options

    const textStyle: TextStyle = {
      fontSize: 12,
      color: '#333',
      baseline: 'middle',
      ...this.options.textStyle,
    }

    let startX = this.bounds.x + padding.left
    let startY = this.bounds.y + padding.top + itemHeight / 2

    // 水平布局居中
    if (orient === 'horizontal' && align === 'center') {
      const totalWidth = this.calculateTotalWidth(renderer, textStyle)
      startX = this.bounds.x + (this.bounds.width - totalWidth) / 2
    }

    this.items.forEach((item) => {
      const selected = this.isSelected(item.name)
      const color = selected ? item.color : '#ccc'

      // 绘制图标
      const iconCenter: Point = { x: startX + itemWidth / 2, y: startY }

      if (icon === 'circle') {
        renderer.drawCircle(iconCenter, itemWidth / 2 - 2, { color })
      } else if (icon === 'rect') {
        renderer.drawRect(
          { x: startX, y: startY - itemHeight / 2 + 2, width: itemWidth, height: itemHeight - 4 },
          { color }
        )
      } else {
        renderer.drawLine(
          [
            { x: startX, y: startY },
            { x: startX + itemWidth, y: startY },
          ],
          { color, width: 2 }
        )
      }

      // 绘制文本
      const textX = startX + itemWidth + 5
      renderer.drawText(item.name, { x: textX, y: startY }, {
        ...textStyle,
        color: selected ? textStyle.color : '#ccc',
      })

      // 更新位置
      if (orient === 'horizontal') {
        const textWidth = renderer.measureText(item.name, textStyle)
        startX += itemWidth + 5 + textWidth + itemGap
      } else {
        startY += itemHeight + itemGap
      }
    })
  }

  private calculateTotalWidth(renderer: BaseRenderer, textStyle: TextStyle): number {
    const { itemWidth = 14, itemGap = 20 } = this.options

    return this.items.reduce((total, item, idx) => {
      const textWidth = renderer.measureText(item.name, textStyle)
      const itemTotal = itemWidth + 5 + textWidth
      return total + itemTotal + (idx < this.items.length - 1 ? itemGap : 0)
    }, 0)
  }
}
