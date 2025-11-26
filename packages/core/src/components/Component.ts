/**
 * 组件基类
 */

import type { Rect } from '../types'
import type { BaseRenderer } from '../renderers/BaseRenderer'

export interface ComponentOptions {
  show?: boolean
}

export abstract class Component<T extends ComponentOptions = ComponentOptions> {
  protected options: T
  protected bounds: Rect = { x: 0, y: 0, width: 0, height: 0 }

  constructor(options: T) {
    this.options = options
  }

  /** 更新配置 */
  setOptions(options: Partial<T>): void {
    this.options = { ...this.options, ...options }
  }

  /** 获取配置 */
  getOptions(): T {
    return this.options
  }

  /** 设置边界 */
  setBounds(bounds: Rect): void {
    this.bounds = bounds
  }

  /** 获取边界 */
  getBounds(): Rect {
    return this.bounds
  }

  /** 是否显示 */
  isVisible(): boolean {
    return this.options.show !== false
  }

  /** 计算布局 */
  abstract layout(containerBounds: Rect): Rect

  /** 渲染组件 */
  abstract render(renderer: BaseRenderer): void
}
