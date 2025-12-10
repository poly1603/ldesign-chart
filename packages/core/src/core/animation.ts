/**
 * 统一动画配置系统
 * 整合分散的动画逻辑到统一接口
 */

// ============== 缓动函数 ==============

export type EasingName =
  | 'linear'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint'
  | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce'
  | 'smoothStep' | 'smootherStep'

export type EasingFn = (t: number) => number

/**
 * 缓动函数集合
 */
export const easings: Record<EasingName, EasingFn> = {
  linear: (t) => t,

  // Quadratic
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Quartic
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,

  // Quintic
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 - Math.pow(1 - t, 5),
  easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

  // Sine
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Exponential
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0) return 0
    if (t === 1) return 1
    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2
  },

  // Circular
  easeInCirc: (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  easeOutCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeInOutCirc: (t) => t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

  // Back
  easeInBack: (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  },
  easeOutBack: (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  },

  // Elastic
  easeInElastic: (t) => {
    if (t === 0 || t === 1) return t
    const c4 = (2 * Math.PI) / 3
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t
    const c4 = (2 * Math.PI) / 3
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  easeInOutElastic: (t) => {
    if (t === 0 || t === 1) return t
    const c5 = (2 * Math.PI) / 4.5
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
  },

  // Bounce
  easeInBounce: (t) => 1 - easings.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
  easeInOutBounce: (t) => t < 0.5
    ? (1 - easings.easeOutBounce(1 - 2 * t)) / 2
    : (1 + easings.easeOutBounce(2 * t - 1)) / 2,

  // Smooth step
  smoothStep: (t) => t * t * (3 - 2 * t),
  smootherStep: (t) => t * t * t * (t * (t * 6 - 15) + 10),
}

/**
 * 获取缓动函数
 */
export function getEasing(name: EasingName | EasingFn): EasingFn {
  if (typeof name === 'function') return name
  return easings[name] || easings.easeOutCubic
}

// ============== 动画类型 ==============

/**
 * 入场动画类型
 */
export type EntryAnimationType =
  | 'grow'      // 从底部生长（柱状图默认）
  | 'expand'    // 从左到右展开（折线图默认）
  | 'rise'      // 从下往上升起
  | 'fade'      // 淡入
  | 'scale'     // 缩放
  | 'none'      // 无动画

/**
 * 更新动画类型
 */
export type UpdateAnimationType =
  | 'morph'     // 平滑过渡
  | 'fade'      // 淡入淡出
  | 'none'      // 无动画

// ============== 动画配置 ==============

/**
 * 图表动画配置
 */
export interface ChartAnimationConfig {
  /** 是否启用动画 */
  enabled: boolean
  /** 入场动画类型 */
  entryType: EntryAnimationType
  /** 更新动画类型 */
  updateType: UpdateAnimationType
  /** 入场动画时长 (ms) */
  entryDuration: number
  /** 更新动画时长 (ms) */
  updateDuration: number
  /** 入场延迟 (ms) */
  entryDelay: number
  /** 缓动函数 */
  easing: EasingName | EasingFn
  /** 是否依次动画 */
  stagger: boolean
  /** 依次动画间隔 (ms) */
  staggerDelay: number
}

/**
 * 默认动画配置
 */
export const DEFAULT_ANIMATION_CONFIG: ChartAnimationConfig = {
  enabled: true,
  entryType: 'grow',
  updateType: 'morph',
  entryDuration: 600,
  updateDuration: 300,
  entryDelay: 0,
  easing: 'easeOutCubic',
  stagger: false,
  staggerDelay: 30,
}

/**
 * 解析动画配置
 */
export function resolveAnimationConfig(
  config?: boolean | Partial<ChartAnimationConfig>
): ChartAnimationConfig {
  if (config === false) {
    return { ...DEFAULT_ANIMATION_CONFIG, enabled: false }
  }
  if (config === true || config === undefined) {
    return { ...DEFAULT_ANIMATION_CONFIG }
  }
  return { ...DEFAULT_ANIMATION_CONFIG, ...config }
}

// ============== 动画进度计算 ==============

/**
 * 计算单个数据项的动画进度
 */
export function calculateItemProgress(
  globalProgress: number,
  itemIndex: number,
  totalItems: number,
  config: ChartAnimationConfig
): number {
  if (!config.enabled || config.entryType === 'none') {
    return 1
  }

  const easingFn = getEasing(config.easing)

  if (!config.stagger) {
    return easingFn(globalProgress)
  }

  // 依次动画
  const staggerTotal = (totalItems - 1) * config.staggerDelay
  const itemDuration = config.entryDuration
  const totalDuration = staggerTotal + itemDuration

  const itemStart = (itemIndex * config.staggerDelay) / totalDuration
  const itemEnd = (itemIndex * config.staggerDelay + itemDuration) / totalDuration

  if (globalProgress <= itemStart) return 0
  if (globalProgress >= itemEnd) return 1

  const itemProgress = (globalProgress - itemStart) / (itemEnd - itemStart)
  return easingFn(itemProgress)
}

/**
 * 计算动画变换
 */
export function calculateAnimationTransform(
  type: EntryAnimationType,
  progress: number,
  rect: { x: number; y: number; width: number; height: number }
): {
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
  opacity: number
  clipWidth: number
  clipHeight: number
} {
  const result = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    opacity: 1,
    clipWidth: rect.width,
    clipHeight: rect.height,
  }

  switch (type) {
    case 'grow':
      result.scaleY = progress
      result.translateY = rect.height * (1 - progress)
      break

    case 'expand':
      result.clipWidth = rect.width * progress
      break

    case 'rise':
      result.translateY = rect.height * (1 - progress)
      result.opacity = progress
      break

    case 'fade':
      result.opacity = progress
      break

    case 'scale':
      result.scaleX = progress
      result.scaleY = progress
      result.opacity = progress
      break

    case 'none':
    default:
      break
  }

  return result
}
