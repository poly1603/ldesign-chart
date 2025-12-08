/**
 * 图表动画器 - 提供图表特定的动画效果
 */

import { Animation } from './Animation'
import type { AnimationOptions, EasingFunction } from './interface'
import { getEasingFunction } from './easing'

/**
 * 图表动画类型
 */
export type ChartAnimationType =
  | 'fadeIn'
  | 'scaleIn'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInTop'
  | 'slideInBottom'
  | 'expandX'
  | 'expandY'
  | 'grow'
  | 'none'

/**
 * 系列动画配置
 */
export interface SeriesAnimationOptions {
  /** 是否启用动画 */
  enabled?: boolean
  /** 动画类型 */
  type?: ChartAnimationType
  /** 动画时长（毫秒） */
  duration?: number
  /** 延迟（毫秒） */
  delay?: number
  /** 缓动函数 */
  easing?: string | EasingFunction
  /** 是否按数据点依次动画 */
  stagger?: boolean
  /** 依次动画的间隔（毫秒） */
  staggerDelay?: number
}

/**
 * 动画状态
 */
export interface AnimationProgress {
  /** 全局进度 0-1 */
  progress: number
  /** 各数据点的进度 0-1 */
  itemProgress: number[]
  /** 是否完成 */
  completed: boolean
}

/**
 * 图表动画器
 */
export class ChartAnimator {
  private animations: Map<string, Animation> = new Map()
  private rafId: number | null = null
  private lastTime: number = 0
  private isRunning: boolean = false
  private onRenderCallback?: () => void

  /**
   * 创建入场动画
   */
  createEntryAnimation(
    seriesId: string,
    dataCount: number,
    options: SeriesAnimationOptions = {}
  ): AnimationProgress {
    const {
      enabled = true,
      type = 'grow',
      duration = 800,
      delay = 0,
      easing = 'easeOutQuart',
      stagger = false,
      staggerDelay = 50,
    } = options

    if (!enabled || type === 'none') {
      return {
        progress: 1,
        itemProgress: new Array(dataCount).fill(1),
        completed: true,
      }
    }

    const state: AnimationProgress = {
      progress: 0,
      itemProgress: new Array(dataCount).fill(0),
      completed: false,
    }

    const easingFn = getEasingFunction(easing)
    const totalDuration = stagger
      ? duration + (dataCount - 1) * staggerDelay
      : duration

    const animation = new Animation({
      duration: totalDuration,
      delay,
      easing: 'linear', // 我们手动计算缓动
      onUpdate: (linearProgress: number) => {
        const elapsed = linearProgress * totalDuration

        if (stagger) {
          // 依次动画
          for (let i = 0; i < dataCount; i++) {
            const itemStart = i * staggerDelay
            const itemEnd = itemStart + duration
            if (elapsed < itemStart) {
              state.itemProgress[i] = 0
            } else if (elapsed >= itemEnd) {
              state.itemProgress[i] = 1
            } else {
              const itemLinear = (elapsed - itemStart) / duration
              state.itemProgress[i] = easingFn(itemLinear)
            }
          }
          // 全局进度取平均
          state.progress = state.itemProgress.reduce((a, b) => a + b, 0) / dataCount
        } else {
          // 同步动画
          state.progress = easingFn(linearProgress)
          state.itemProgress.fill(state.progress)
        }

        this.onRenderCallback?.()
      },
      onComplete: () => {
        state.progress = 1
        state.itemProgress.fill(1)
        state.completed = true
        this.animations.delete(seriesId)
        this.onRenderCallback?.()
      },
    })

    this.animations.set(seriesId, animation)
    return state
  }

  /**
   * 创建更新动画（数据变化时的过渡）
   */
  createUpdateAnimation(
    seriesId: string,
    fromValues: number[],
    toValues: number[],
    options: AnimationOptions = {}
  ): { getCurrentValues: () => number[] } {
    const {
      duration = 500,
      delay = 0,
      easing = 'easeOutCubic',
    } = options

    const currentValues = [...fromValues]
    const easingFn = getEasingFunction(easing)

    const animation = new Animation({
      duration,
      delay,
      easing: 'linear',
      onUpdate: (linearProgress: number) => {
        const progress = easingFn(linearProgress)
        for (let i = 0; i < currentValues.length; i++) {
          const from = fromValues[i] ?? 0
          const to = toValues[i] ?? from
          currentValues[i] = from + (to - from) * progress
        }
        this.onRenderCallback?.()
      },
      onComplete: () => {
        for (let i = 0; i < currentValues.length; i++) {
          currentValues[i] = toValues[i] ?? currentValues[i] ?? 0
        }
        this.animations.delete(seriesId)
        this.onRenderCallback?.()
      },
    })

    this.animations.set(seriesId, animation)
    return { getCurrentValues: () => currentValues }
  }

  /**
   * 开始所有动画
   */
  start(onRender?: () => void): void {
    this.onRenderCallback = onRender
    this.isRunning = true
    this.lastTime = performance.now()

    this.animations.forEach(anim => anim.start())
    this.tick()
  }

  /**
   * 停止所有动画
   */
  stop(): void {
    this.isRunning = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.animations.forEach(anim => anim.stop())
    this.animations.clear()
  }

  /**
   * 暂停所有动画
   */
  pause(): void {
    this.isRunning = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.animations.forEach(anim => anim.pause())
  }

  /**
   * 恢复所有动画
   */
  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.lastTime = performance.now()
      this.animations.forEach(anim => anim.resume())
      this.tick()
    }
  }

  /**
   * 动画帧
   */
  private tick = (): void => {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    this.animations.forEach(anim => anim.update(deltaTime))

    // 如果还有动画在运行，继续
    if (this.animations.size > 0) {
      this.rafId = requestAnimationFrame(this.tick)
    } else {
      this.isRunning = false
    }
  }

  /**
   * 是否有动画在运行
   */
  isAnimating(): boolean {
    return this.animations.size > 0
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stop()
    this.onRenderCallback = undefined
  }
}

/**
 * 获取动画变换
 */
export function getAnimationTransform(
  type: ChartAnimationType,
  progress: number,
  rect: { x: number; y: number; width: number; height: number }
): {
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
  opacity: number
} {
  const result = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    opacity: 1,
  }

  switch (type) {
    case 'fadeIn':
      result.opacity = progress
      break

    case 'scaleIn':
      result.scaleX = progress
      result.scaleY = progress
      result.opacity = progress
      break

    case 'slideInLeft':
      result.translateX = (1 - progress) * -rect.width
      result.opacity = progress
      break

    case 'slideInRight':
      result.translateX = (1 - progress) * rect.width
      result.opacity = progress
      break

    case 'slideInTop':
      result.translateY = (1 - progress) * -rect.height
      result.opacity = progress
      break

    case 'slideInBottom':
      result.translateY = (1 - progress) * rect.height
      result.opacity = progress
      break

    case 'expandX':
      result.scaleX = progress
      break

    case 'expandY':
      result.scaleY = progress
      break

    case 'grow':
      // 从底部生长（常用于柱状图、折线图）
      result.scaleY = progress
      break

    case 'none':
    default:
      // 无动画
      break
  }

  return result
}
