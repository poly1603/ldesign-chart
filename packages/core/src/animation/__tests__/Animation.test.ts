/**
 * Animation 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Animation, PropertyAnimation } from '../Animation'
import { AnimationState } from '../interface'

describe('Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('基础动画', () => {
    it('应该正确初始化', () => {
      const animation = new Animation({
        duration: 1000,
      })

      expect(animation.state).toBe(AnimationState.IDLE)
      expect(animation.id).toBeDefined()
    })

    it('开始动画应该改变状态', () => {
      const animation = new Animation({
        duration: 1000,
      })

      animation.start()
      expect(animation.state).toBe(AnimationState.RUNNING)
    })

    it('暂停动画应该改变状态', () => {
      const animation = new Animation({
        duration: 1000,
      })

      animation.start()
      animation.pause()
      expect(animation.state).toBe(AnimationState.PAUSED)
    })

    it('恢复动画应该改变状态', () => {
      const animation = new Animation({
        duration: 1000,
      })

      animation.start()
      animation.pause()
      animation.resume()
      expect(animation.state).toBe(AnimationState.RUNNING)
    })

    it('停止动画应该改变状态', () => {
      const animation = new Animation({
        duration: 1000,
      })

      animation.start()
      animation.stop()
      expect(animation.state).toBe(AnimationState.COMPLETED)
    })
  })

  describe('动画更新', () => {
    it('应该在完成时触发回调', () => {
      const onComplete = vi.fn()
      const animation = new Animation({
        duration: 1000,
        onComplete,
      })

      animation.start()
      animation.update(1000)

      expect(onComplete).toHaveBeenCalled()
      expect(animation.state).toBe(AnimationState.COMPLETED)
    })

    it('应该触发更新回调', () => {
      const onUpdate = vi.fn()
      const animation = new Animation({
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.update(500)

      expect(onUpdate).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalledWith(0.5)
    })

    it('暂停状态不应该更新', () => {
      const onUpdate = vi.fn()
      const animation = new Animation({
        duration: 1000,
        onUpdate,
      })

      animation.start()
      animation.pause()
      animation.update(500)

      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('延迟', () => {
    it('应该支持延迟启动', () => {
      const onUpdate = vi.fn()
      const animation = new Animation({
        duration: 1000,
        delay: 500,
        onUpdate,
      })

      animation.start()
      animation.update(300)

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('延迟后应该开始动画', () => {
      const onUpdate = vi.fn()
      const animation = new Animation({
        duration: 1000,
        delay: 500,
        onUpdate,
      })

      animation.start()
      animation.update(500)
      animation.update(500)

      expect(onUpdate).toHaveBeenCalled()
    })
  })

  describe('循环', () => {
    it('应该支持无限循环', () => {
      const animation = new Animation({
        duration: 1000,
        loop: true,
      })

      animation.start()
      animation.update(1000)

      expect(animation.state).toBe(AnimationState.RUNNING)
    })

    it('应该支持指定次数循环', () => {
      const onComplete = vi.fn()
      const animation = new Animation({
        duration: 1000,
        loop: 2,
        onComplete,
      })

      animation.start()
      animation.update(1000) // 第一次循环
      expect(animation.state).toBe(AnimationState.RUNNING)
      
      animation.update(1000) // 第二次循环
      expect(animation.state).toBe(AnimationState.COMPLETED)
      expect(onComplete).toHaveBeenCalled()
    })
  })
})

describe('PropertyAnimation', () => {
  it('应该动画化对象属性', () => {
    const obj = { x: 0 }
    const animation = new PropertyAnimation({
      target: obj,
      property: 'x',
      from: 0,
      to: 100,
      duration: 1000,
    })

    animation.start()
    animation.update(500)

    expect(obj.x).toBeCloseTo(50, 1)
  })

  it('应该在完成时设置最终值', () => {
    const obj = { x: 0 }
    const animation = new PropertyAnimation({
      target: obj,
      property: 'x',
      from: 0,
      to: 100,
      duration: 1000,
    })

    animation.start()
    animation.update(1000)

    expect(obj.x).toBe(100)
  })

  it('应该支持缓动函数', () => {
    const obj = { x: 0 }
    const easing = (t: number) => t * t // easeInQuad
    
    const animation = new PropertyAnimation({
      target: obj,
      property: 'x',
      from: 0,
      to: 100,
      duration: 1000,
      easing,
    })

    animation.start()
    animation.update(500)

    // 使用 easeInQuad，0.5 的进度应该是 0.25
    expect(obj.x).toBeCloseTo(25, 1)
  })

  it('应该触发更新回调', () => {
    const obj = { x: 0 }
    const onUpdate = vi.fn()
    
    const animation = new PropertyAnimation({
      target: obj,
      property: 'x',
      from: 0,
      to: 100,
      duration: 1000,
      onUpdate,
    })

    animation.start()
    animation.update(500)

    expect(onUpdate).toHaveBeenCalled()
    expect(onUpdate).toHaveBeenCalledWith(0.5)
  })
})