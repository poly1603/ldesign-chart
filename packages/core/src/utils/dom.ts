/**
 * DOM 工具函数
 */

import type { Point } from '../types'

/** 获取元素尺寸 */
export function getElementSize(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
}

/** 获取鼠标相对于元素的坐标 */
export function getMousePosition(event: MouseEvent, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

/** 获取触摸相对于元素的坐标 */
export function getTouchPosition(event: TouchEvent, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect()
  const touch = event.touches[0] || event.changedTouches[0]
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  }
}

/** 创建 Canvas 元素 */
export function createCanvas(width: number, height: number, dpr: number = 1): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  return canvas
}

/** 创建 SVG 元素 */
export function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tagName: K
): SVGElementTagNameMap[K] {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName)
}

/** requestAnimationFrame polyfill */
export const raf: typeof requestAnimationFrame =
  typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame
    : (callback: FrameRequestCallback) => setTimeout(callback, 16) as unknown as number

/** cancelAnimationFrame polyfill */
export const caf: typeof cancelAnimationFrame =
  typeof cancelAnimationFrame !== 'undefined'
    ? cancelAnimationFrame
    : (id: number) => clearTimeout(id)
