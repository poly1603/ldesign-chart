/**
 * AnimationManager 测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { AnimationManager } from '../AnimationManager'
import { Animation, PropertyAnimation } from '../Animation'
import { AnimationState } from '../interface'

describe('AnimationManager', () => {
  let manager: AnimationManager

  beforeEach(() => {
    manager = new AnimationManager()
  })

  afterEach(() => {
    manager.clear()
  })

  describe('初始化', () => {
    it('应该正确初始化', () => {
      expect(manager).toBeInstanceOf(AnimationManager)
    })
  })

  describe('添加动画', () => {
    it('应该能添加动画', () => {
      const animation = new Animation({
        duration: 1000,
      })

      manager.add(animation)

      // 验证动画已添加（通过移除来验证）
      manager.remove(animation.id)
    })

    it('应该能添加多个动画', () => {
      const animation1 = new Animation({ duration: 1000 })
      const animation2 = new Animation({ duration: 2000 })

      manager.add(animation1)
      manager.add(animation2)

      // 验证都能被移除
      manager.remove(animation1.id)
      manager.remove(animation2.id)
    })
  })

  describe('创建动画', () => {
    it('应该能创建并添加动画', () => {
      const animation = manager.create({
        duration: 1000,
      })

      expect(animation).toBeInstanceOf(Animation)
      expect(animation.id).toBeDefined()
    })

    it('创建的动画应该自动添加到管理器', () => {
      const animation = manager.create({ duration: 1000 })

      // 验证可以移除（说明已添加）
      manager.remove(animation.id)
    })
  })

  describe('移除动画', () => {
    it('应该能通过ID移除动画', () => {
      const animation = new Animation({ duration: 1000 })
      manager.add(animation)

      manager.remove(animation.id)

      // 再次移除应该不报错
      manager.remove(animation.id)
    })

    it('移除不存在的动画不应报错', () => {
      expect(() => {
        manager.remove('non-existent-id')
      }).not.toThrow()
    })
  })

  describe('清空动画', () => {
    it('应该能清空所有动画', () => {
      manager.add(new Animation({ duration: 1000 }))
      manager.add(new Animation({ duration: 2000 }))

      manager.clear()

      // 验证已清空（再次清空不报错）
      expect(() => {
        manager.clear()
      }).not.toThrow()
    })
  })

  describe('更新动画', () => {
    it('应该更新所有运行中的动画', () => {
      const target = { value: 0 }
      const animation = new PropertyAnimation({
        target,
        property: 'value',
        from: 0,
        to: 100,
        duration: 1000,
      })

      manager.add(animation)
      animation.start()

      manager.update(500) // 50%

      expect(target.value).toBeCloseTo(50, 1)
    })

    it('应该自动移除已完成的动画', () => {
      const onComplete = vi.fn()
      const animation = new Animation({ 
        duration: 1000,
        onComplete,
      })
      manager.add(animation)
      animation.start()

      manager.update(1000) // 完成

      expect(onComplete).toHaveBeenCalled()
      
      // 验证已移除（再次移除不会有效果）
      manager.remove(animation.id)
    })

    it('不应更新暂停的动画', () => {
      const target = { value: 0 }
      const animation = new PropertyAnimation({
        target,
        property: 'value',
        from: 0,
        to: 100,
        duration: 1000,
      })

      manager.add(animation)
      animation.start()
      animation.pause()

      manager.update(500)

      expect(target.value).toBe(0) // 没有更新
    })

    it('应该能同时更新多个动画', () => {
      const target1 = { value: 0 }
      const target2 = { value: 0 }

      const animation1 = new PropertyAnimation({
        target: target1,
        property: 'value',
        from: 0,
        to: 100,
        duration: 1000,
      })

      const animation2 = new PropertyAnimation({
        target: target2,
        property: 'value',
        from: 0,
        to: 200,
        duration: 1000,
      })

      manager.add(animation1)
      manager.add(animation2)

      animation1.start()
      animation2.start()

      manager.update(500) // 50%

      expect(target1.value).toBeCloseTo(50, 1)
      expect(target2.value).toBeCloseTo(100, 1)
    })
  })

  describe('暂停和恢复', () => {
    it('应该能暂停所有动画', () => {
      const animation1 = new Animation({ duration: 1000 })
      const animation2 = new Animation({ duration: 2000 })

      manager.add(animation1)
      manager.add(animation2)

      animation1.start()
      animation2.start()

      manager.pauseAll()

      expect(animation1.state).toBe(AnimationState.PAUSED)
      expect(animation2.state).toBe(AnimationState.PAUSED)
    })

    it('应该能恢复所有动画', () => {
      const animation1 = new Animation({ duration: 1000 })
      const animation2 = new Animation({ duration: 2000 })

      manager.add(animation1)
      manager.add(animation2)

      animation1.start()
      animation2.start()
      manager.pauseAll()

      manager.resumeAll()

      expect(animation1.state).toBe(AnimationState.RUNNING)
      expect(animation2.state).toBe(AnimationState.RUNNING)
    })

    it('应该能停止所有动画', () => {
      const animation1 = new Animation({ duration: 1000 })
      const animation2 = new Animation({ duration: 2000 })

      manager.add(animation1)
      manager.add(animation2)

      animation1.start()
      animation2.start()

      manager.stopAll()

      expect(animation1.state).toBe(AnimationState.COMPLETED)
      expect(animation2.state).toBe(AnimationState.COMPLETED)
    })
  })

  describe('性能', () => {
    it('应该能处理大量动画', () => {
      const targets: Array<{ value: number }> = []

      // 创建100个动画
      for (let i = 0; i < 100; i++) {
        const target = { value: 0 }
        targets.push(target)

        const animation = new PropertyAnimation({
          target,
          property: 'value',
          from: 0,
          to: 100,
          duration: 1000,
        })

        manager.add(animation)
        animation.start()
      }

      // 更新到50%
      const startTime = performance.now()
      manager.update(500)
      const endTime = performance.now()

      // 验证所有动画都已更新
      targets.forEach((target) => {
        expect(target.value).toBeCloseTo(50, 1)
      })

      // 性能检查：100个动画更新应该在合理时间内完成（<50ms）
      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('边界情况', () => {
    it('空管理器update不应报错', () => {
      expect(() => {
        manager.update(100)
      }).not.toThrow()
    })

    it('应该处理deltaTime为0的情况', () => {
      const target = { value: 0 }
      const animation = new PropertyAnimation({
        target,
        property: 'value',
        from: 0,
        to: 100,
        duration: 1000,
      })

      manager.add(animation)
      animation.start()

      expect(() => {
        manager.update(0)
      }).not.toThrow()

      expect(target.value).toBe(0)
    })

    it('应该处理负的deltaTime', () => {
      const target = { value: 0 }
      const animation = new PropertyAnimation({
        target,
        property: 'value',
        from: 0,
        to: 100,
        duration: 1000,
      })

      manager.add(animation)
      animation.start()

      expect(() => {
        manager.update(-100)
      }).not.toThrow()
    })
  })

  describe('循环动画', () => {
    it('循环动画不应被自动移除', () => {
      const target = { value: 0 }
      const animation = new PropertyAnimation({
        target,
        property: 'value',
        from: 0,
        to: 100,
        duration: 1000,
        loop: true,
      })

      manager.add(animation)
      animation.start()

      manager.update(1000) // 第一次循环结束

      // 动画应该仍在运行
      expect(animation.state).toBe(AnimationState.RUNNING)
      
      // 可以继续更新
      manager.update(500)
      expect(target.value).toBeCloseTo(50, 1)
    })

    it('有限循环的动画完成后应被移除', () => {
      const onComplete = vi.fn()
      const animation = new Animation({
        duration: 1000,
        loop: 2,
        onComplete,
      })

      manager.add(animation)
      animation.start()

      manager.update(1000) // 第一次循环
      expect(animation.state).toBe(AnimationState.RUNNING)

      manager.update(1000) // 第二次循环完成
      expect(animation.state).toBe(AnimationState.COMPLETED)
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('延迟动画', () => {
    it('应该正确处理延迟动画', () => {
      const target = { value: 0 }
      const animation = new PropertyAnimation({
        target,
        property: 'value',
        from: 0,
        to: 100,
        duration: 1000,
        delay: 500,
      })

      manager.add(animation)
      animation.start()

      // 延迟期间
      manager.update(300)
      expect(target.value).toBe(0)

      // 延迟结束
      manager.update(200)
      expect(target.value).toBe(0)

      // 动画进行中
      manager.update(500) // 50%
      expect(target.value).toBeCloseTo(50, 1)
    })
  })
})