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

// 图表动画工具（适用于所有图表类型）
export {
  ChartAnimationController,
  DEFAULT_ANIMATION_CONFIG,
  easingFns,
  getEasing,
  animateGrowY,
  animateMorph,
  animateScale,
  animateOpacity,
  getPointProgress,
} from './chartAnimation'
export type {
  EntryAnimationType,
  UpdateAnimationType,
  AnimationConfig,
  AnimationState,
  EasingFn,
} from './chartAnimation'