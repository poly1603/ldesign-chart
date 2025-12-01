/**
 * 缓动函数库
 */

import type { EasingFunction } from './interface'

/**
 * 线性缓动
 */
export const linear: EasingFunction = (t: number): number => t

/**
 * 二次缓动
 */
export const easeInQuad: EasingFunction = (t: number): number => t * t
export const easeOutQuad: EasingFunction = (t: number): number => t * (2 - t)
export const easeInOutQuad: EasingFunction = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

/**
 * 三次缓动
 */
export const easeInCubic: EasingFunction = (t: number): number => t * t * t
export const easeOutCubic: EasingFunction = (t: number): number => --t * t * t + 1
export const easeInOutCubic: EasingFunction = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

/**
 * 四次缓动
 */
export const easeInQuart: EasingFunction = (t: number): number => t * t * t * t
export const easeOutQuart: EasingFunction = (t: number): number => 1 - --t * t * t * t
export const easeInOutQuart: EasingFunction = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t

/**
 * 五次缓动
 */
export const easeInQuint: EasingFunction = (t: number): number => t * t * t * t * t
export const easeOutQuint: EasingFunction = (t: number): number => 1 + --t * t * t * t * t
export const easeInOutQuint: EasingFunction = (t: number): number =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t

/**
 * 正弦缓动
 */
export const easeInSine: EasingFunction = (t: number): number => 1 - Math.cos((t * Math.PI) / 2)
export const easeOutSine: EasingFunction = (t: number): number => Math.sin((t * Math.PI) / 2)
export const easeInOutSine: EasingFunction = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * 指数缓动
 */
export const easeInExpo: EasingFunction = (t: number): number =>
  t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
export const easeOutExpo: EasingFunction = (t: number): number =>
  t === 1 ? 1 : -Math.pow(2, -10 * t) + 1
export const easeInOutExpo: EasingFunction = (t: number): number => {
  if (t === 0) return 0
  if (t === 1) return 1
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2
  return (2 - Math.pow(2, -20 * t + 10)) / 2
}

/**
 * 圆形缓动
 */
export const easeInCirc: EasingFunction = (t: number): number => 1 - Math.sqrt(1 - t * t)
export const easeOutCirc: EasingFunction = (t: number): number => Math.sqrt(1 - --t * t)
export const easeInOutCirc: EasingFunction = (t: number): number =>
  t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2

/**
 * 回退缓动
 */
const c1 = 1.70158
const c2 = c1 * 1.525
const c3 = c1 + 1

export const easeInBack: EasingFunction = (t: number): number => c3 * t * t * t - c1 * t * t
export const easeOutBack: EasingFunction = (t: number): number =>
  1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
export const easeInOutBack: EasingFunction = (t: number): number =>
  t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2

/**
 * 弹性缓动
 */
const c4 = (2 * Math.PI) / 3
const c5 = (2 * Math.PI) / 4.5

export const easeInElastic: EasingFunction = (t: number): number => {
  if (t === 0) return 0
  if (t === 1) return 1
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
}

export const easeOutElastic: EasingFunction = (t: number): number => {
  if (t === 0) return 0
  if (t === 1) return 1
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

export const easeInOutElastic: EasingFunction = (t: number): number => {
  if (t === 0) return 0
  if (t === 1) return 1
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
}

/**
 * 弹跳缓动
 */
export const easeInBounce: EasingFunction = (t: number): number => 1 - easeOutBounce(1 - t)

export const easeOutBounce: EasingFunction = (t: number): number => {
  const n1 = 7.5625
  const d1 = 2.75

  if (t < 1 / d1) {
    return n1 * t * t
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}

export const easeInOutBounce: EasingFunction = (t: number): number =>
  t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2

/**
 * 缓动函数映射表
 */
export const easingFunctions: Record<string, EasingFunction> = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
}

/**
 * 获取缓动函数
 */
export function getEasingFunction(easing: string | EasingFunction): EasingFunction {
  if (typeof easing === 'function') {
    return easing
  }
  return easingFunctions[easing] || linear
}