/**
 * 线性比例尺
 */

import type { IScale, ContinuousScaleOptions } from './interface'
import { clamp as clampUtil } from '../util'

/**
 * 线性比例尺类
 */
export class LinearScale implements IScale<number, number> {
  private domain: number[] = [0, 1]
  private range: number[] = [0, 1]
  private clamp = false
  private nice = false
  private tickCount = 10

  constructor(options: ContinuousScaleOptions) {
    this.setDomain(options.domain)
    this.setRange(options.range)
    
    if (options.clamp !== undefined) {
      this.clamp = options.clamp
    }
    
    if (options.nice !== undefined) {
      this.nice = options.nice
      if (this.nice) {
        this.nicefy()
      }
    }
    
    if (options.tickCount !== undefined) {
      this.tickCount = options.tickCount
    }
  }

  /**
   * 将数据域的值映射到视觉范围
   */
  map(value: number): number {
    const d0 = this.domain[0]!
    const d1 = this.domain[1]!
    const r0 = this.range[0]!
    const r1 = this.range[1]!

    // 处理域为零的情况
    if (d1 === d0) {
      return r0
    }

    // 线性插值
    const t = (value - d0) / (d1 - d0)
    const result = r0 + t * (r1 - r0)

    // 如果需要限制在范围内
    if (this.clamp) {
      const min = Math.min(r0, r1)
      const max = Math.max(r0, r1)
      return clampUtil(result, min, max)
    }

    return result
  }

  /**
   * 将视觉范围的值反向映射到数据域
   */
  invert(pixel: number): number {
    const d0 = this.domain[0]!
    const d1 = this.domain[1]!
    const r0 = this.range[0]!
    const r1 = this.range[1]!

    // 处理范围为零的情况
    if (r1 === r0) {
      return d0
    }

    // 线性插值
    const t = (pixel - r0) / (r1 - r0)
    return d0 + t * (d1 - d0)
  }

  /**
   * 获取数据域
   */
  getDomain(): number[] {
    return [...this.domain]
  }

  /**
   * 设置数据域
   */
  setDomain(domain: number[]): this {
    if (domain.length < 2) {
      throw new Error('Domain must have at least 2 values')
    }
    this.domain = [domain[0]!, domain[domain.length - 1]!]
    return this
  }

  /**
   * 获取视觉范围
   */
  getRange(): number[] {
    return [...this.range]
  }

  /**
   * 设置视觉范围
   */
  setRange(range: number[]): this {
    if (range.length < 2) {
      throw new Error('Range must have at least 2 values')
    }
    this.range = [range[0]!, range[range.length - 1]!]
    return this
  }

  /**
   * 获取刻度值
   */
  getTicks(count?: number): number[] {
    const tickCount = count ?? this.tickCount
    const min = this.domain[0]!
    const max = this.domain[1]!

    if (min === max) {
      return [min]
    }

    // 计算刻度间隔
    const span = max - min
    const step = this.tickStep(span, tickCount)

    // 计算起始刻度
    const start = Math.ceil(min / step) * step
    const stop = Math.floor(max / step) * step

    // 生成刻度数组
    const ticks: number[] = []
    let current = start
    
    while (current <= stop) {
      ticks.push(current)
      current += step
    }

    return ticks
  }

  /**
   * 计算友好的刻度间隔
   */
  private tickStep(span: number, count: number): number {
    const step0 = Math.abs(span) / Math.max(0, count)
    let step1 = Math.pow(10, Math.floor(Math.log10(step0)))
    const error = step0 / step1

    if (error >= Math.sqrt(50)) {
      step1 *= 10
    } else if (error >= Math.sqrt(10)) {
      step1 *= 5
    } else if (error >= Math.sqrt(2)) {
      step1 *= 2
    }

    return span < 0 ? -step1 : step1
  }

  /**
   * 优化数据域，使其具有友好的刻度
   */
  private nicefy(): void {
    const min = this.domain[0]!
    const max = this.domain[1]!
    
    if (min === max) {
      return
    }

    const span = max - min
    const step = this.tickStep(span, this.tickCount)

    this.domain = [
      Math.floor(min / step) * step,
      Math.ceil(max / step) * step,
    ]
  }

  /**
   * 设置是否限制在范围内
   */
  setClamp(clamp: boolean): this {
    this.clamp = clamp
    return this
  }

  /**
   * 重新计算友好刻度
   */
  niceScale(): this {
    this.nicefy()
    return this
  }

  /**
   * 克隆比例尺
   */
  clone(): LinearScale {
    return new LinearScale({
      domain: this.domain,
      range: this.range,
      clamp: this.clamp,
      nice: this.nice,
      tickCount: this.tickCount,
    })
  }
}