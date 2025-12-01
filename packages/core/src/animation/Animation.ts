/**
 * 动画实现
 */

import type { IAnimation, AnimationOptions, AnimationState as AnimationStateType } from './interface'
import { AnimationState } from './interface'
import { getEasingFunction } from './easing'
import { generateId } from '../util'

/**
 * 基础动画类
 */
export class Animation implements IAnimation {
  id: string
  state: AnimationStateType = AnimationState.IDLE

  protected duration: number
  protected delay: number
  protected loop: number | boolean
  protected easing: (t: number) => number
  protected onComplete?: () => void
  protected onUpdate?: (progress: number) => void

  protected elapsedTime = 0
  protected delayElapsed = 0
  protected currentLoop = 0

  constructor(options: AnimationOptions = {}) {
    this.id = generateId('animation')
    this.duration = options.duration ?? 1000
    this.delay = options.delay ?? 0
    this.loop = options.loop ?? false
    this.easing = getEasingFunction(options.easing ?? 'linear')
    this.onComplete = options.onComplete
    this.onUpdate = options.onUpdate
  }

  /**
   * 开始动画
   */
  start(): void {
    this.state = AnimationState.RUNNING
    this.elapsedTime = 0
    this.delayElapsed = 0
    this.currentLoop = 0
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
    this.elapsedTime = 0
    this.delayElapsed = 0
    this.currentLoop = 0
  }

  /**
   * 更新动画
   */
  update(deltaTime: number): void {
    if (this.state !== AnimationState.RUNNING) {
      return
    }

    // 处理延迟
    if (this.delayElapsed < this.delay) {
      this.delayElapsed += deltaTime
      return
    }

    // 更新时间
    this.elapsedTime += deltaTime

    // 计算进度
    let progress = Math.min(this.elapsedTime / this.duration, 1)
    progress = this.easing(progress)

    // 触发更新回调
    this.onUpdate?.(progress)

    // 检查是否完成
    if (this.elapsedTime >= this.duration) {
      this.handleComplete()
    }
  }

  /**
   * 处理动画完成
   */
  protected handleComplete(): void {
    // 处理循环
    if (this.loop === true || (typeof this.loop === 'number' && this.currentLoop < this.loop - 1)) {
      this.currentLoop++
      this.elapsedTime = 0
      return
    }

    // 动画完成
    this.state = AnimationState.COMPLETED
    this.onComplete?.()
  }
}

/**
 * 属性动画类
 */
export class PropertyAnimation extends Animation {
  private target: Record<string, unknown>
  private property: string
  private from: number
  private to: number

  constructor(options: {
    target: Record<string, unknown>
    property: string
    from: number
    to: number
    duration?: number
    delay?: number
    loop?: number | boolean
    easing?: string | ((t: number) => number)
    onComplete?: () => void
    onUpdate?: (progress: number) => void
  }) {
    super(options)
    this.target = options.target
    this.property = options.property
    this.from = options.from
    this.to = options.to
  }

  /**
   * 更新动画
   */
  update(deltaTime: number): void {
    if (this.state !== AnimationState.RUNNING) {
      return
    }

    // 处理延迟
    if (this.delayElapsed < this.delay) {
      this.delayElapsed += deltaTime
      return
    }

    // 更新时间
    this.elapsedTime += deltaTime

    // 计算进度
    let progress = Math.min(this.elapsedTime / this.duration, 1)
    progress = this.easing(progress)

    // 更新属性值
    const value = this.from + (this.to - this.from) * progress
    this.target[this.property] = value

    // 触发更新回调
    this.onUpdate?.(progress)

    // 检查是否完成
    if (this.elapsedTime >= this.duration) {
      this.handleComplete()
    }
  }
}