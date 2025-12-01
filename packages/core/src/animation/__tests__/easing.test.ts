/**
 * 缓动函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInBounce,
  easeOutBounce,
  easingFunctions,
  getEasingFunction,
} from '../easing'

describe('缓动函数', () => {
  describe('基本属性', () => {
    it('所有缓动函数在 t=0 时应该返回 0', () => {
      const functions = [
        linear, easeInQuad, easeOutQuad, easeInOutQuad,
        easeInCubic, easeOutCubic, easeInOutCubic,
      ]

      functions.forEach((fn) => {
        expect(fn(0)).toBeCloseTo(0, 5)
      })
    })

    it('所有缓动函数在 t=1 时应该返回 1', () => {
      const functions = [
        linear, easeInQuad, easeOutQuad, easeInOutQuad,
        easeInCubic, easeOutCubic, easeInOutCubic,
        easeInBack, easeOutBack, easeInOutBack,
        easeInElastic, easeOutElastic,
        easeInBounce, easeOutBounce,
      ]

      functions.forEach((fn) => {
        expect(fn(1)).toBeCloseTo(1, 5)
      })
    })

    it('所有缓动函数应该返回数值', () => {
      const functions = [
        linear, easeInQuad, easeOutQuad, easeInOutQuad,
        easeInCubic, easeOutCubic, easeInOutCubic,
      ]

      functions.forEach((fn) => {
        const result = fn(0.5)
        expect(typeof result).toBe('number')
        expect(isNaN(result)).toBe(false)
        expect(isFinite(result)).toBe(true)
      })
    })
  })

  describe('linear', () => {
    it('应该返回输入值', () => {
      expect(linear(0)).toBe(0)
      expect(linear(0.25)).toBe(0.25)
      expect(linear(0.5)).toBe(0.5)
      expect(linear(0.75)).toBe(0.75)
      expect(linear(1)).toBe(1)
    })
  })

  describe('二次缓动', () => {
    it('easeInQuad 应该缓慢开始', () => {
      expect(easeInQuad(0.5)).toBeLessThan(0.5)
    })

    it('easeOutQuad 应该缓慢结束', () => {
      expect(easeOutQuad(0.5)).toBeGreaterThan(0.5)
    })

    it('easeInOutQuad 应该两端缓慢', () => {
      expect(easeInOutQuad(0.25)).toBeLessThan(0.25)
      expect(easeInOutQuad(0.75)).toBeGreaterThan(0.75)
    })
  })

  describe('三次缓动', () => {
    it('easeInCubic 应该缓慢开始', () => {
      expect(easeInCubic(0.5)).toBeLessThan(0.5)
    })

    it('easeOutCubic 应该缓慢结束', () => {
      expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
    })

    it('easeInOutCubic 应该两端缓慢', () => {
      expect(easeInOutCubic(0.25)).toBeLessThan(0.25)
      expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75)
    })
  })

  describe('回退缓动', () => {
    it('easeInBack 应该先后退', () => {
      // 在某些点应该小于 0
      const result = easeInBack(0.3)
      expect(result).toBeLessThan(0.3)
    })

    it('easeOutBack 应该超过 1', () => {
      // 在某些点应该大于输入值
      const result = easeOutBack(0.7)
      expect(result).toBeGreaterThan(0.7)
    })
  })

  describe('弹性缓动', () => {
    it('easeOutElastic 应该产生振荡', () => {
      const values = [0.3, 0.5, 0.7, 0.9].map(t => easeOutElastic(t))
      // 弹性效果会产生起伏，不会单调递增
      const isMonotonic = values.every((v, i, arr) =>
        i === 0 || v >= arr[i - 1]!
      )
      expect(isMonotonic).toBe(false)
    })
  })

  describe('弹跳缓动', () => {
    it('easeOutBounce 应该产生弹跳效果', () => {
      const values = [0.3, 0.5, 0.7, 0.9].map(t => easeOutBounce(t))
      // 弹跳效果会产生起伏
      const isMonotonic = values.every((v, i, arr) =>
        i === 0 || v >= arr[i - 1]!
      )
      expect(isMonotonic).toBe(false)
    })

    it('easeInBounce 应该是 easeOutBounce 的反向', () => {
      const t = 0.5
      const inValue = easeInBounce(t)
      const outValue = easeOutBounce(1 - t)
      expect(inValue).toBeCloseTo(1 - outValue, 5)
    })
  })

  describe('easingFunctions 映射表', () => {
    it('应该包含所有缓动函数', () => {
      const expectedFunctions = [
        'linear',
        'easeInQuad', 'easeOutQuad', 'easeInOutQuad',
        'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
        'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
        'easeInQuint', 'easeOutQuint', 'easeInOutQuint',
        'easeInSine', 'easeOutSine', 'easeInOutSine',
        'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
        'easeInCirc', 'easeOutCirc', 'easeInOutCirc',
        'easeInBack', 'easeOutBack', 'easeInOutBack',
        'easeInElastic', 'easeOutElastic', 'easeInOutElastic',
        'easeInBounce', 'easeOutBounce', 'easeInOutBounce',
      ]

      expectedFunctions.forEach((name) => {
        expect(easingFunctions[name]).toBeDefined()
        expect(typeof easingFunctions[name]).toBe('function')
      })
    })
  })

  describe('getEasingFunction', () => {
    it('应该通过名称返回缓动函数', () => {
      const fn = getEasingFunction('linear')
      expect(fn).toBe(linear)
    })

    it('应该返回传入的函数', () => {
      const customFn = (t: number) => t
      const fn = getEasingFunction(customFn)
      expect(fn).toBe(customFn)
    })

    it('未知名称应该返回 linear', () => {
      const fn = getEasingFunction('unknown')
      expect(fn).toBe(linear)
    })

    it('应该正确获取所有内置缓动函数', () => {
      expect(getEasingFunction('easeInQuad')).toBe(easeInQuad)
      expect(getEasingFunction('easeOutQuad')).toBe(easeOutQuad)
      expect(getEasingFunction('easeInCubic')).toBe(easeInCubic)
      expect(getEasingFunction('easeOutBounce')).toBe(easeOutBounce)
    })
  })

  describe('边界情况', () => {
    it('应该处理 t < 0 的情况', () => {
      const functions = [linear, easeInQuad, easeOutQuad]
      functions.forEach((fn) => {
        const result = fn(-0.1)
        expect(typeof result).toBe('number')
        expect(isFinite(result)).toBe(true)
      })
    })

    it('应该处理 t > 1 的情况', () => {
      const functions = [linear, easeInQuad, easeOutQuad]
      functions.forEach((fn) => {
        const result = fn(1.1)
        expect(typeof result).toBe('number')
        expect(isFinite(result)).toBe(true)
      })
    })
  })
})