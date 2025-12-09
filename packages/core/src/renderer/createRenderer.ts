/**
 * 渲染器工厂函数
 */

import type { IRenderer } from './interface'
import { CanvasRenderer } from './CanvasRenderer'
import { SVGRenderer } from './SVGRenderer'

export type RendererType = 'canvas' | 'svg'

/**
 * 创建渲染器
 * @param type - 渲染器类型
 * @returns 渲染器实例
 */
export function createRenderer(type: RendererType = 'canvas'): IRenderer {
  if (type === 'svg') {
    return new SVGRenderer()
  }
  return new CanvasRenderer()
}

/**
 * 初始化渲染器
 * @param container - 容器元素
 * @param width - 宽度
 * @param height - 高度
 * @param type - 渲染器类型
 * @returns 已初始化的渲染器
 */
export function initRenderer(
  container: HTMLElement,
  width: number,
  height: number,
  type: RendererType = 'canvas'
): IRenderer {
  const renderer = createRenderer(type)
  renderer.init(container, width, height)
  return renderer
}
