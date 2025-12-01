/**
 * 动画管理器实现
 */

import type { IAnimation, IAnimationManager, AnimationOptions } from './interface'
import { AnimationState } from './interface'
import { Animation } from './Animation'

/**
 * 动画管理器
 */
export class AnimationManager implements IAnimationManager {
  private animations: Map<string, IAnimation> = new Map()
  private lastTime = 0
  private rafId: number | null = null
  private isRunning = false

  constructor() {
    this.lastTime = performance.now()
  }

  /**
   * 创建动画
   */
  create(options: AnimationOptions): IAnimation {
    const animation = new Animation(options)
    this.add(animation)
    return animation
  }

  /**
   * 添加动画
   */
  add(animation: IAnimation): void {
    this.animations.set(animation.id, animation)
    
    // 如果还没有启动动画循环，启动它
    if (!this.isRunning) {
      this.start()
    }
  }

  /**
   * 移除动画
   */
  remove(animationId: string): void {
    this.animations.delete(animationId)
    
    // 如果没有动画了，停止动画循环
    if (this.animations.size === 0) {
      this.stop()
    }
  }

  /**
   * 清除所有动画
   */
  clear(): void {
    this.animations.clear()
    this.stop()
  }

  /**
   * 更新所有动画
   */
  update(deltaTime: number): void {
    const animationsToRemove: string[] = []

    this.animations.forEach((animation) => {
      animation.update(deltaTime)

      // 移除已完成的动画
      if (animation.state === AnimationState.COMPLETED) {
        animationsToRemove.push(animation.id)
      }
    })

    // 清理已完成的动画
    animationsToRemove.forEach((id) => {
      this.remove(id)
    })
  }

  /**
   * 暂停所有动画
   */
  pauseAll(): void {
    this.animations.forEach((animation) => {
      animation.pause()
    })
  }

  /**
   * 恢复所有动画
   */
  resumeAll(): void {
    this.animations.forEach((animation) => {
      animation.resume()
    })
  }

  /**
   * 停止所有动画
   */
  stopAll(): void {
    this.animations.forEach((animation) => {
      animation.stop()
    })
    this.clear()
  }

  /**
   * 启动动画循环
   */
  private start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this.tick()
  }

  /**
   * 停止动画循环
   */
  private stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
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

    this.update(deltaTime)

    // 继续下一帧
    if (this.animations.size > 0) {
      this.rafId = requestAnimationFrame(this.tick)
    } else {
      this.stop()
    }
  }
}