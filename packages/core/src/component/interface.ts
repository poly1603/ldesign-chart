/**
 * 组件系统接口定义
 */

import type { IRenderer } from '../renderer/interface'
import type { Rect } from '../types'

/**
 * 组件类型
 */
export type ComponentType = 'axis' | 'legend' | 'tooltip' | 'grid' | 'title'

/**
 * 组件基础接口
 */
export interface IComponent {
  /**
   * 组件类型
   */
  readonly type: ComponentType

  /**
   * 组件是否可见
   */
  visible: boolean

  /**
   * 渲染组件
   * @param renderer - 渲染器
   */
  render(renderer: IRenderer): void

  /**
   * 获取组件占用的边界矩形
   */
  getBoundingRect(): Rect

  /**
   * 更新组件布局
   * @param rect - 可用区域
   */
  update(rect: Rect): void

  /**
   * 销毁组件
   */
  dispose(): void
}

/**
 * 组件配置基础接口
 */
export interface ComponentOptions {
  /** 是否显示 */
  show?: boolean
  /** z-index 层级 */
  zIndex?: number
}