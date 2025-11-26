/**
 * 缓动函数集合
 */

import type { EasingType } from '../types'

export type EasingFunction = (t: number) => number

/** 缓动函数映射表 */
export const easingFunctions: Record<EasingType, EasingFunction> = {
  linear: (t) => t,

  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  easeInElastic: (t) => {
    if (t === 0 || t === 1) return t
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI)
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1
  },
  easeInOutElastic: (t) => {
    if (t === 0 || t === 1) return t
    t *= 2
    if (t < 1) return -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI)
    return 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1
  },

  easeInBounce: (t) => 1 - easingFunctions.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  },
  easeInOutBounce: (t) => {
    if (t < 0.5) return easingFunctions.easeInBounce(t * 2) * 0.5
    return easingFunctions.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
  },
}

/** 获取缓动函数 */
export function getEasing(type: EasingType): EasingFunction {
  return easingFunctions[type] || easingFunctions.linear
}
