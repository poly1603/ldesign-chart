/**
 * 数据工具函数
 */

import type { Padding } from '../types'

/** 深拷贝对象 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/** 深合并对象 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    if (!source) continue
    for (const key of Object.keys(source) as (keyof T)[]) {
      const targetValue = target[key]
      const sourceValue = source[key]

      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        target[key] = deepMerge({ ...targetValue }, sourceValue as object) as T[keyof T]
      } else if (sourceValue !== undefined) {
        target[key] = sourceValue as T[keyof T]
      }
    }
  }
  return target
}

/** 判断是否为普通对象 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/** 判断是否为数字 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/** 判断是否为字符串 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/** 判断是否为函数 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

/** 解析内边距 */
export function parsePadding(padding?: number | number[]): Padding {
  if (padding === undefined) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding }
  }

  switch (padding.length) {
    case 1:
      return { top: padding[0], right: padding[0], bottom: padding[0], left: padding[0] }
    case 2:
      return { top: padding[0], right: padding[1], bottom: padding[0], left: padding[1] }
    case 3:
      return { top: padding[0], right: padding[1], bottom: padding[2], left: padding[1] }
    default:
      return { top: padding[0], right: padding[1], bottom: padding[2], left: padding[3] }
  }
}

/** 解析尺寸值（支持百分比） */
export function parseSize(value: number | string | undefined, reference: number): number {
  if (value === undefined) return 0
  if (typeof value === 'number') return value
  if (value.endsWith('%')) {
    return (parseFloat(value) / 100) * reference
  }
  return parseFloat(value) || 0
}

/** 生成唯一 ID */
export function generateId(prefix: string = 'lchart'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** 防抖函数 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/** 节流函数 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}
