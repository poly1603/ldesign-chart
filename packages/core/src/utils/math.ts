/**
 * 数学工具函数
 */

import type { Point, Rect } from '../types'

/** 将值限制在指定范围内 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** 线性插值 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/** 将值从一个范围映射到另一个范围 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
}

/** 角度转弧度 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** 弧度转角度 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

/** 计算两点之间的距离 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** 计算两点之间的角度（弧度） */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

/** 判断点是否在矩形内 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

/** 判断点是否在圆内 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius
}

/** 获取数组的最小值和最大值 */
export function getMinMax(arr: number[]): { min: number; max: number } {
  if (arr.length === 0) return { min: 0, max: 0 }
  let min = arr[0]
  let max = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i]
    if (arr[i] > max) max = arr[i]
  }
  return { min, max }
}

/** 计算合适的刻度间隔 */
export function getNiceInterval(min: number, max: number, count: number = 5): number {
  const range = max - min
  if (range === 0) return 1

  const roughInterval = range / count
  const exponent = Math.floor(Math.log10(roughInterval))
  const fraction = roughInterval / Math.pow(10, exponent)

  let niceFraction: number
  if (fraction <= 1) niceFraction = 1
  else if (fraction <= 2) niceFraction = 2
  else if (fraction <= 5) niceFraction = 5
  else niceFraction = 10

  return niceFraction * Math.pow(10, exponent)
}

/** 生成刻度值数组 */
export function generateTicks(min: number, max: number, count: number = 5): number[] {
  const interval = getNiceInterval(min, max, count)
  const niceMin = Math.floor(min / interval) * interval
  const niceMax = Math.ceil(max / interval) * interval

  const ticks: number[] = []
  for (let value = niceMin; value <= niceMax; value += interval) {
    ticks.push(Number(value.toFixed(10)))
  }
  return ticks
}
