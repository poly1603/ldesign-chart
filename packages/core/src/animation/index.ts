/**
 * 动画系统导出
 */

export * from './interface'
export * from './easing'
export { Animation, PropertyAnimation } from './Animation'
export { AnimationManager } from './AnimationManager'
export { KeyframeAnimation } from './KeyframeAnimation'
export { ChartAnimator } from './ChartAnimator'
export type {
  ChartAnimationType,
  SeriesAnimationOptions,
  AnimationProgress,
} from './ChartAnimator'