/**
 * 颜色工具函数
 */

import type { Rect, Gradient, LinearGradient, RadialGradient } from '../types'
import { lerp } from './math'

/** 解析颜色字符串为 RGBA */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } {
  // 处理十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    let r: number, g: number, b: number, a = 1

    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
      if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
      if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255
    } else {
      return { r: 0, g: 0, b: 0, a: 1 }
    }
    return { r, g, b, a }
  }

  // 处理 rgb/rgba 颜色
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    }
  }

  return { r: 0, g: 0, b: 0, a: 1 }
}

/** RGBA 转颜色字符串 */
export function rgbaToString(r: number, g: number, b: number, a: number = 1): string {
  if (a === 1) return `rgb(${r}, ${g}, ${b})`
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** 颜色混合 */
export function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
  const c1 = parseColor(color1)
  const c2 = parseColor(color2)
  return rgbaToString(
    Math.round(lerp(c1.r, c2.r, ratio)),
    Math.round(lerp(c1.g, c2.g, ratio)),
    Math.round(lerp(c1.b, c2.b, ratio)),
    lerp(c1.a, c2.a, ratio)
  )
}

/** 调整颜色透明度 */
export function setColorOpacity(color: string, opacity: number): string {
  const { r, g, b } = parseColor(color)
  return rgbaToString(r, g, b, opacity)
}

/** 调亮颜色 */
export function lightenColor(color: string, amount: number = 0.2): string {
  const { r, g, b, a } = parseColor(color)
  return rgbaToString(
    Math.min(255, Math.round(r + (255 - r) * amount)),
    Math.min(255, Math.round(g + (255 - g) * amount)),
    Math.min(255, Math.round(b + (255 - b) * amount)),
    a
  )
}

/** 调暗颜色 */
export function darkenColor(color: string, amount: number = 0.2): string {
  const { r, g, b, a } = parseColor(color)
  return rgbaToString(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount)),
    a
  )
}

/** 创建 Canvas 渐变 */
export function createCanvasGradient(
  ctx: CanvasRenderingContext2D,
  gradient: Gradient,
  rect: Rect
): CanvasGradient {
  let canvasGradient: CanvasGradient

  if (gradient.type === 'linear') {
    const { x1, y1, x2, y2 } = gradient as LinearGradient
    canvasGradient = ctx.createLinearGradient(
      rect.x + rect.width * x1,
      rect.y + rect.height * y1,
      rect.x + rect.width * x2,
      rect.y + rect.height * y2
    )
  } else {
    const { cx, cy, r } = gradient as RadialGradient
    const centerX = rect.x + rect.width * cx
    const centerY = rect.y + rect.height * cy
    const radius = Math.min(rect.width, rect.height) * r
    canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  }

  for (const stop of gradient.stops) {
    canvasGradient.addColorStop(stop.offset, stop.color)
  }

  return canvasGradient
}
