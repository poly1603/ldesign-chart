/**
 * 对数比例尺
 */

import type { IScale } from './interface'

/**
 * 对数比例尺配置
 */
export interface LogScaleOptions {
  /** 数据域 */
  domain: number[]
  /** 视觉范围 */
  range: number[]
  /** 对数底数，默认 10 */
  base?: number
  /** 是否限制在范围内 */
  clamp?: boolean
  /** 是否友好刻度 */
  nice?: boolean
}

/**
 * 对数比例尺类
 * 适用于数据跨度很大的场景
 */
export class LogScale implements IScale<number, number> {
  private domain: [number, number] = [1, 10]
  private range: [number, number] = [0, 1]
  private base: number = 10
  private clamp: boolean = false

  constructor(options?: LogScaleOptions) {
    if (options) {
      this.setDomain(options.domain)
      this.setRange(options.range)
      this.base = options.base ?? 10
      this.clamp = options.clamp ?? false
      if (options.nice) {
        this.nice()
      }
    }
  }

  /**
   * 对数函数
   */
  private log(x: number): number {
    return Math.log(x) / Math.log(this.base)
  }

  /**
   * 指数函数
   */
  private pow(x: number): number {
    return Math.pow(this.base, x)
  }

  /**
   * 将数据值映射到视觉范围
   */
  map(value: number): number {
    // 处理非正值
    if (value <= 0) {
      return this.range[0]
    }

    const [d0, d1] = this.domain
    const [r0, r1] = this.range

    // 确保域值为正
    const logD0 = this.log(Math.max(d0, 1e-10))
    const logD1 = this.log(Math.max(d1, 1e-10))
    const logValue = this.log(value)

    let t = (logValue - logD0) / (logD1 - logD0 || 1)

    if (this.clamp) {
      t = Math.max(0, Math.min(1, t))
    }

    return r0 + t * (r1 - r0)
  }

  /**
   * 将视觉位置反向映射到数据值
   */
  invert(pixel: number): number {
    const [d0, d1] = this.domain
    const [r0, r1] = this.range

    let t = (pixel - r0) / (r1 - r0 || 1)

    if (this.clamp) {
      t = Math.max(0, Math.min(1, t))
    }

    const logD0 = this.log(Math.max(d0, 1e-10))
    const logD1 = this.log(Math.max(d1, 1e-10))
    const logValue = logD0 + t * (logD1 - logD0)

    return this.pow(logValue)
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
    if (domain.length >= 2) {
      // 确保域值为正
      this.domain = [
        Math.max(domain[0]!, 1e-10),
        Math.max(domain[1]!, 1e-10),
      ]
    }
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
    if (range.length >= 2) {
      this.range = [range[0]!, range[1]!]
    }
    return this
  }

  /**
   * 设置对数底数
   */
  setBase(base: number): this {
    this.base = base
    return this
  }

  /**
   * 获取对数底数
   */
  getBase(): number {
    return this.base
  }

  /**
   * 获取刻度值
   */
  getTicks(count: number = 10): number[] {
    const [d0, d1] = this.domain
    const ticks: number[] = []

    // 计算对数范围
    const logMin = Math.floor(this.log(d0))
    const logMax = Math.ceil(this.log(d1))

    // 生成每个数量级的刻度
    for (let power = logMin; power <= logMax; power++) {
      const base = this.pow(power)

      // 主刻度
      if (base >= d0 && base <= d1) {
        ticks.push(base)
      }

      // 如果需要更多刻度，添加中间值
      if (ticks.length < count && power < logMax) {
        const subTicks = this.base === 10 ? [2, 5] : [2]
        for (const multiplier of subTicks) {
          const subValue = base * multiplier
          if (subValue >= d0 && subValue <= d1) {
            ticks.push(subValue)
          }
        }
      }
    }

    // 如果刻度太多，筛选
    if (ticks.length > count * 2) {
      const step = Math.ceil(ticks.length / count)
      return ticks.filter((_, i) => i % step === 0)
    }

    return ticks.sort((a, b) => a - b)
  }

  /**
   * 优化刻度范围
   */
  nice(): this {
    const [d0, d1] = this.domain

    const logMin = Math.floor(this.log(d0))
    const logMax = Math.ceil(this.log(d1))

    this.domain = [this.pow(logMin), this.pow(logMax)]
    return this
  }

  /**
   * 克隆比例尺
   */
  clone(): LogScale {
    const scale = new LogScale()
    scale.domain = [...this.domain]
    scale.range = [...this.range]
    scale.base = this.base
    scale.clamp = this.clamp
    return scale
  }
}
