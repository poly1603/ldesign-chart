/**
 * 工具函数
 */

/**
 * 判断是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 判断是否为数组
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * 判断是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 判断是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 判断是否为函数
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

/**
 * 深度合并对象
 */
export function merge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (isObject(sourceValue) && isObject(targetValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        target[key] = merge({ ...targetValue }, sourceValue as any) as T[Extract<keyof T, string>]
      } else if (sourceValue !== undefined) {
        target[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return merge(target, ...sources)
}

/**
 * 深拷贝
 */
export function clone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return obj.map((item) => clone(item)) as T
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = clone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0

  return function (this: unknown, ...args: Parameters<T>): void {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 生成唯一ID
 */
let uid = 0
export function generateId(prefix = 'chart'): string {
  return `${prefix}_${++uid}_${Date.now()}`
}

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 获取元素的尺寸
 */
export function getElementSize(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 格式化数字
 */
export function formatNumber(value: number, precision = 2): string {
  return value.toFixed(precision)
}

/**
 * 解析颜色值
 */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  // 简单的 RGB/RGBA 解析
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]!, 10),
      g: parseInt(rgbMatch[2]!, 10),
      b: parseInt(rgbMatch[3]!, 10),
      a: 1,
    }
  }

  const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]!, 10),
      g: parseInt(rgbaMatch[2]!, 10),
      b: parseInt(rgbaMatch[3]!, 10),
      a: parseFloat(rgbaMatch[4]!),
    }
  }

  return null
}