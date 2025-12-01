/**
 * LinearScale 单元测试
 */

import { describe, it, expect } from 'vitest'
import { LinearScale } from './LinearScale'

describe('LinearScale', () => {
  describe('基础功能', () => {
    it('应该正确映射值', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
      })

      expect(scale.map(0)).toBe(0)
      expect(scale.map(50)).toBe(250)
      expect(scale.map(100)).toBe(500)
    })

    it('应该正确反向映射', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
      })

      expect(scale.invert(0)).toBe(0)
      expect(scale.invert(250)).toBe(50)
      expect(scale.invert(500)).toBe(100)
    })

    it('应该处理负值域', () => {
      const scale = new LinearScale({
        domain: [-50, 50],
        range: [0, 100],
      })

      expect(scale.map(-50)).toBe(0)
      expect(scale.map(0)).toBe(50)
      expect(scale.map(50)).toBe(100)
    })

    it('应该处理反向范围', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [500, 0],
      })

      expect(scale.map(0)).toBe(500)
      expect(scale.map(50)).toBe(250)
      expect(scale.map(100)).toBe(0)
    })
  })

  describe('限制功能', () => {
    it('应该在启用 clamp 时限制输出', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
        clamp: true,
      })

      expect(scale.map(-10)).toBe(0)
      expect(scale.map(110)).toBe(500)
    })

    it('应该在禁用 clamp 时允许超出范围', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
        clamp: false,
      })

      expect(scale.map(-10)).toBe(-50)
      expect(scale.map(110)).toBe(550)
    })
  })

  describe('刻度生成', () => {
    it('应该生成合理的刻度', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
      })

      const ticks = scale.getTicks(5)
      expect(ticks.length).toBeGreaterThan(0)
      expect(ticks[0]).toBeLessThanOrEqual(0)
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100)
    })

    it('应该为单点域生成单个刻度', () => {
      const scale = new LinearScale({
        domain: [50, 50],
        range: [0, 100],
      })

      const ticks = scale.getTicks()
      expect(ticks).toEqual([50])
    })
  })

  describe('友好刻度', () => {
    it('应该在启用 nice 时调整域', () => {
      const scale = new LinearScale({
        domain: [13, 87],
        range: [0, 100],
        nice: true,
      })

      const domain = scale.getDomain()
      expect(domain[0]).toBeLessThanOrEqual(13)
      expect(domain[1]).toBeGreaterThanOrEqual(87)
    })
  })

  describe('域和范围操作', () => {
    it('应该正确获取和设置域', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
      })

      expect(scale.getDomain()).toEqual([0, 100])

      scale.setDomain([10, 90])
      expect(scale.getDomain()).toEqual([10, 90])
    })

    it('应该正确获取和设置范围', () => {
      const scale = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
      })

      expect(scale.getRange()).toEqual([0, 500])

      scale.setRange([100, 400])
      expect(scale.getRange()).toEqual([100, 400])
    })

    it('应该在域长度不足时抛出错误', () => {
      expect(() => {
        new LinearScale({
          domain: [0],
          range: [0, 100],
        })
      }).toThrow('Domain must have at least 2 values')
    })

    it('应该在范围长度不足时抛出错误', () => {
      expect(() => {
        new LinearScale({
          domain: [0, 100],
          range: [0],
        })
      }).toThrow('Range must have at least 2 values')
    })
  })

  describe('克隆', () => {
    it('应该创建独立的副本', () => {
      const scale1 = new LinearScale({
        domain: [0, 100],
        range: [0, 500],
      })

      const scale2 = scale1.clone()
      scale2.setDomain([10, 90])

      expect(scale1.getDomain()).toEqual([0, 100])
      expect(scale2.getDomain()).toEqual([10, 90])
    })
  })
})