/**
 * 动画系统
 */

import type { EasingType } from '../types'
import { raf, caf } from '../utils/dom'
import { getEasing } from './Easing'

export interface AnimationConfig {
  duration?: number
  easing?: EasingType
  delay?: number
  onUpdate?: (progress: number) => void
  onComplete?: () => void
}

export interface AnimationInstance {
  stop: () => void
  pause: () => void
  resume: () => void
  isRunning: () => boolean
}

/**
 * 创建动画
 */
export function animate(config: AnimationConfig): AnimationInstance {
  const {
    duration = 300,
    easing = 'easeInOut',
    delay = 0,
    onUpdate,
    onComplete,
  } = config

  let startTime: number | null = null
  let rafId: number | null = null
  let paused = false
  let pausedTime = 0
  let running = true

  const easingFn = getEasing(easing)

  const tick = (currentTime: number) => {
    if (!running) return

    if (startTime === null) {
      startTime = currentTime + delay
    }

    if (currentTime < startTime) {
      rafId = raf(tick)
      return
    }

    if (paused) return

    const elapsed = currentTime - startTime - pausedTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFn(progress)

    onUpdate?.(easedProgress)

    if (progress < 1) {
      rafId = raf(tick)
    } else {
      running = false
      onComplete?.()
    }
  }

  rafId = raf(tick)

  return {
    stop: () => {
      running = false
      if (rafId !== null) {
        caf(rafId)
        rafId = null
      }
    },
    pause: () => {
      if (!paused && running) {
        paused = true
        pausedTime = performance.now()
      }
    },
    resume: () => {
      if (paused && running) {
        pausedTime = performance.now() - pausedTime
        paused = false
        rafId = raf(tick)
      }
    },
    isRunning: () => running,
  }
}

/**
 * 动画值插值
 */
export function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

/**
 * 数组动画插值
 */
export function interpolateArray(from: number[], to: number[], progress: number): number[] {
  return from.map((v, i) => interpolate(v, to[i] ?? v, progress))
}

/**
 * 颜色动画插值
 */
export function interpolateColor(from: string, to: string, progress: number): string {
  // 简化实现，假设都是 rgb 格式
  const parseRgb = (c: string) => {
    const match = c.match(/\d+/g)
    return match ? match.map(Number) : [0, 0, 0]
  }

  const fromRgb = parseRgb(from)
  const toRgb = parseRgb(to)
  const result = fromRgb.map((v, i) => Math.round(interpolate(v, toRgb[i], progress)))

  return `rgb(${result.join(', ')})`
}
