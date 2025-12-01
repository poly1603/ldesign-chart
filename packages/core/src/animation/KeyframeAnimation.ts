/**
 * 关键帧动画实现
 */

import type { IAnimation, MultiKeyframeAnimationOptions, MultiKeyframe, EasingFunction } from './interface'
import { AnimationState } from './interface'
import { getEasingFunction } from './easing'

/**
 * 关键帧动画类
 */
export class KeyframeAnimation implements IAnimation {
  id: string
  state: AnimationState = AnimationState.IDLE

  private keyframes: MultiKeyframe[]
  private duration: number
  private easing: EasingFunction
  private delay: number
  private loop: number | boolean
  private onComplete?: () => void
  private onUpdate?: (values: Record<string, number>) => void

  private currentTime = 0
  private delayElapsed = 0
  private loopCount = 0

  constructor(options: MultiKeyframeAnimationOptions) {
    this.id = `keyframe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    this.keyframes = options.keyframes
    this.duration = options.duration ?? 1000
    this.delay = options.delay ?? 0
    this.loop = options.loop ?? false
    this.onComplete = options.onComplete
    this.onUpdate = options.onUpdate

    // 解析缓动函数
    if (typeof options.easing === 'string') {
      this.easing = getEasingFunction(options.easing)
    } else if (typeof options.easing === 'function') {
      this.easing = options.easing
    } else {
      this.easing = getEasingFunction('linear')
    }

    // 验证和排序关键帧
    this.validateAndSortKeyframes()
  }

  /**
   * 验证和排序关键帧
   */
  private validateAndSortKeyframes(): void {
    if (this.keyframes.length < 2) {
      throw new Error('KeyframeAnimation requires at least 2 keyframes')
    }

    // 按时间排序
    this.keyframes.sort((a, b) => a.time - b.time)

    // 验证时间范围
    if (this.keyframes[0]!.time !== 0) {
      throw new Error('First keyframe must have time = 0')
    }

    if (this.keyframes[this.keyframes.length - 1]!.time !== 1) {
      throw new Error('Last keyframe must have time = 1')
    }

    // 验证所有关键帧具有相同的属性
    const firstKeys = Object.keys(this.keyframes[0]!.values)
    for (let i = 1; i < this.keyframes.length; i++) {
      const keys = Object.keys(this.keyframes[i]!.values)
      if (keys.length !== firstKeys.length || !keys.every((k) => firstKeys.includes(k))) {
        throw new Error('All keyframes must have the same properties')
      }
    }
  }

  /**
   * 开始动画
   */
  start(): void {
    this.state = AnimationState.RUNNING
    this.currentTime = 0
    this.delayElapsed = 0
    this.loopCount = 0
  }

  /**
   * 暂停动画
   */
  pause(): void {
    if (this.state === AnimationState.RUNNING) {
      this.state = AnimationState.PAUSED
    }
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (this.state === AnimationState.PAUSED) {
      this.state = AnimationState.RUNNING
    }
  }

  /**
   * 停止动画
   */
  stop(): void {
    this.state = AnimationState.COMPLETED
    this.currentTime = 0
    this.delayElapsed = 0
    this.loopCount = 0
  }

  /**
   * 更新动画
   */
  update(deltaTime: number): void {
    if (this.state !== AnimationState.RUNNING) return

    // 处理延迟
    if (this.delayElapsed < this.delay) {
      this.delayElapsed += deltaTime
      return
    }

    // 更新时间
    this.currentTime += deltaTime

    if (this.currentTime >= this.duration) {
      // 检查循环
      if (this.loop === true || (typeof this.loop === 'number' && this.loopCount < this.loop - 1)) {
        this.loopCount++
        this.currentTime = this.currentTime % this.duration
      } else {
        this.currentTime = this.duration
        this.state = AnimationState.COMPLETED
      }
    }

    // 计算当前值
    const progress = Math.min(this.currentTime / this.duration, 1)
    const values = this.interpolate(progress)

    // 触发更新回调
    if (this.onUpdate) {
      this.onUpdate(values)
    }

    // 触发完成回调
    if (this.state === AnimationState.COMPLETED && this.onComplete) {
      this.onComplete()
    }
  }

  /**
   * 插值计算
   */
  private interpolate(progress: number): Record<string, number> {
    // 找到当前进度所在的关键帧区间
    let startKeyframe = this.keyframes[0]!
    let endKeyframe = this.keyframes[this.keyframes.length - 1]!

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (progress >= this.keyframes[i]!.time && progress <= this.keyframes[i + 1]!.time) {
        startKeyframe = this.keyframes[i]!
        endKeyframe = this.keyframes[i + 1]!
        break
      }
    }

    // 计算在当前区间内的相对进度
    const segmentDuration = endKeyframe.time - startKeyframe.time
    const segmentProgress = segmentDuration === 0
      ? 1
      : (progress - startKeyframe.time) / segmentDuration

    // 应用缓动函数
    const easedProgress = this.easing(segmentProgress)

    // 对每个属性进行插值
    const result: Record<string, number> = {}
    const keys = Object.keys(startKeyframe.values)

    for (const key of keys) {
      const startValue = startKeyframe.values[key]!
      const endValue = endKeyframe.values[key]!
      result[key] = startValue + (endValue - startValue) * easedProgress
    }

    return result
  }
}