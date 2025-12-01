/**
 * KeyframeAnimation 测试
 */

import { describe, it, expect, vi } from 'vitest'
import { KeyframeAnimation } from '../KeyframeAnimation'
import { AnimationState } from '../interface'
import type { MultiKeyframe } from '../interface'

describe('KeyframeAnimation', () => {
  describe('构造函数', () => {
    it('应该正确初始化', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0, y: 0 } },
        { time: 1, values: { x: 100, y: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
      })

      expect(animation.state).toBe(AnimationState.IDLE)
      expect(animation.id).toBeDefined()
    })

    it('应该验证关键帧时间范围 - 起始时间必须为0', () => {
      const invalidKeyframes: MultiKeyframe[] = [
        { time: 0.1, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      expect(() => {
        new KeyframeAnimation({ keyframes: invalidKeyframes, duration: 1000 })
      }).toThrow('First keyframe must have time = 0')
    })

    it('应该验证关键帧时间范围 - 结束时间必须为1', () => {
      const invalidKeyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 0.9, values: { x: 100 } },
      ]

      expect(() => {
        new KeyframeAnimation({ keyframes: invalidKeyframes, duration: 1000 })
      }).toThrow('Last keyframe must have time = 1')
    })

    it('应该验证关键帧数量', () => {
      const singleKeyframe: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
      ]

      expect(() => {
        new KeyframeAnimation({ keyframes: singleKeyframe, duration: 1000 })
      }).toThrow('KeyframeAnimation requires at least 2 keyframes')
    })

    it('应该自动排序关键帧', () => {
      const unsortedKeyframes: MultiKeyframe[] = [
        { time: 1, values: { x: 100 } },
        { time: 0, values: { x: 0 } },
        { time: 0.5, values: { x: 50 } },
      ]

      // 应该不抛出错误，因为会自动排序
      expect(() => {
        new KeyframeAnimation({ keyframes: unsortedKeyframes, duration: 1000 })
      }).not.toThrow()
    })

    it('应该验证所有关键帧具有相同属性', () => {
      const inconsistentKeyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0, y: 0 } },
        { time: 1, values: { x: 100 } }, // 缺少 y
      ]

      expect(() => {
        new KeyframeAnimation({ keyframes: inconsistentKeyframes, duration: 1000 })
      }).toThrow('All keyframes must have the same properties')
    })
  })

  describe('单属性动画', () => {
    it('应该在开始时返回初始值', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 10 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.update(0)

      expect(onUpdate).toHaveBeenCalledWith({ x: 10 })
    })

    it('应该在结束时返回最终值', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.update(1000)

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0]).toEqual({ x: 100 })
    })

    it('应该在中间时刻正确插值', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.update(500) // 50%

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(50, 1)
    })
  })

  describe('多属性动画', () => {
    it('应该同时动画化多个属性', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0, y: 0, opacity: 0 } },
        { time: 1, values: { x: 100, y: 200, opacity: 1 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.update(500)

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      const values = lastCall![0]
      expect(values.x).toBeCloseTo(50, 1)
      expect(values.y).toBeCloseTo(100, 1)
      expect(values.opacity).toBeCloseTo(0.5, 1)
    })
  })

  describe('多关键帧', () => {
    it('应该处理多个关键帧', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 0.5, values: { x: 50 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onUpdate,
      })

      animation.start()

      // 25% - 应该在第一段的中间
      animation.update(250)
      let lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(25, 1)

      // 再更新到50%
      animation.update(250)
      lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(50, 1)

      // 再更新到75%
      animation.update(250)
      lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(75, 1)

      // 再更新到100%
      animation.update(250)
      lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(100, 1)
    })
  })

  describe('缓动函数', () => {
    it('应该应用全局缓动函数', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        easing: 'easeInQuad',
        onUpdate,
      })

      animation.start()
      animation.update(500)

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      // easeInQuad 在 50% 时应该小于 50
      expect(lastCall![0].x).toBeLessThan(50)
    })

    it('应该支持自定义缓动函数', () => {
      const customEasing = (t: number) => t * t

      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        easing: customEasing,
        onUpdate,
      })

      animation.start()
      animation.update(500)

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(25, 1) // 0.5 * 0.5 * 100
    })
  })

  describe('生命周期', () => {
    it('应该正确管理状态', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
      })

      expect(animation.state).toBe(AnimationState.IDLE)

      animation.start()
      expect(animation.state).toBe(AnimationState.RUNNING)

      animation.pause()
      expect(animation.state).toBe(AnimationState.PAUSED)

      animation.resume()
      expect(animation.state).toBe(AnimationState.RUNNING)

      animation.update(1000)
      expect(animation.state).toBe(AnimationState.COMPLETED)
    })

    it('应该支持停止', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
      })

      animation.start()
      animation.update(500)

      animation.stop()
      expect(animation.state).toBe(AnimationState.COMPLETED)
    })
  })

  describe('循环', () => {
    it('应该支持无限循环', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        loop: true,
      })

      animation.start()
      animation.update(1000) // 第一次循环结束

      expect(animation.state).toBe(AnimationState.RUNNING)
    })

    it('应该支持有限次循环', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        loop: 2,
      })

      animation.start()
      animation.update(1000) // 第一次循环
      expect(animation.state).toBe(AnimationState.RUNNING)

      animation.update(1000) // 第二次循环
      expect(animation.state).toBe(AnimationState.COMPLETED)
    })
  })

  describe('回调函数', () => {
    it('应该调用 onUpdate', () => {
      const onUpdate = vi.fn()
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.update(500)

      expect(onUpdate).toHaveBeenCalled()
      expect(onUpdate.mock.calls[0]![0]).toHaveProperty('x')
    })

    it('应该调用 onComplete', () => {
      const onComplete = vi.fn()
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onComplete,
      })

      animation.start()
      animation.update(1000)

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('循环时不应过早调用 onComplete', () => {
      const onComplete = vi.fn()
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        loop: 2,
        onComplete,
      })

      animation.start()
      animation.update(1000) // 第一次循环

      expect(onComplete).not.toHaveBeenCalled()

      animation.update(1000) // 第二次循环完成
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('延迟', () => {
    it('应该支持延迟启动', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        delay: 500,
        onUpdate,
      })

      animation.start()
      animation.update(300)

      // 延迟期间不应触发更新
      expect(onUpdate).not.toHaveBeenCalled()

      animation.update(200) // 总共 500ms，延迟结束
      animation.update(500) // 动画进行到 50%

      expect(onUpdate).toHaveBeenCalled()
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(50, 1)
    })
  })

  describe('默认值', () => {
    it('应该使用默认 duration', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        onUpdate,
      })

      animation.start()
      animation.update(1000) // 默认 duration 应该是 1000

      expect(animation.state).toBe(AnimationState.COMPLETED)
    })

    it('应该使用默认 easing (linear)', () => {
      const keyframes: MultiKeyframe[] = [
        { time: 0, values: { x: 0 } },
        { time: 1, values: { x: 100 } },
      ]

      const onUpdate = vi.fn()
      const animation = new KeyframeAnimation({
        keyframes,
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.update(500)

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
      expect(lastCall![0].x).toBeCloseTo(50, 1) // linear
    })
  })
})